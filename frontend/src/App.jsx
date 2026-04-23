import { useState } from 'react'
import { startSession, saveResult } from './utils'
import SetupScreen from './components/SetupScreen'
import InstructionScreen from './components/InstructionScreen'
import DigitCheckScreen from './components/DigitCheckScreen'
import MPLScreen from './components/CTBScreen'
import BreakScreen from './components/BreakScreen'
import FinishScreen from './components/FinishScreen'
import './App.css'

// setup → instruction → [digit_check HIGH] → mpl → break → mpl → ... → finish
const SCREEN = {
  SETUP: 'SETUP',
  INSTRUCTION: 'INSTRUCTION',
  DIGIT_CHECK: 'DIGIT_CHECK',
  MPL: 'MPL',
  BREAK: 'BREAK',
  FINISH: 'FINISH',
}

function computeBDM(allResults) {
  if (!allResults.length) return null
  // Select a random row result; A = today_amount, B = future_amount (at delay)
  const sel = allResults[Math.floor(Math.random() * allResults.length)]
  const reward = sel.choice === 'A' ? sel.today_amount : sel.future_amount
  return { selected: sel, reward, total: reward + 1000 }
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [sessionId, setSessionId] = useState(null)
  const [participantId, setParticipantId] = useState('')
  const [condition, setCondition] = useState('LOW')
  const [delayLabel, setDelayLabel] = useState('')
  const [delayCondition, setDelayCondition] = useState('')
  const [digitStrings, setDigitStrings] = useState([])
  const [blocks, setBlocks] = useState([])
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)

  const [complianceLog, setComplianceLog] = useState([])
  const [allResults, setAllResults] = useState([])
  const [bdmResult, setBdmResult] = useState(null)

  async function handleSetup(pid, name) {
    setLoading(true)
    setError(null)
    try {
      const data = await startSession({ participant_id: pid, name })
      setSessionId(data.session_id)
      setParticipantId(pid)
      setCondition(data.condition)
      setDelayLabel(data.delay_label)
      setDelayCondition(data.delay_condition)
      setDigitStrings(data.digit_strings || [])

      // Group rows by block
      const blockMap = new Map()
      for (const row of data.trials) {
        if (!blockMap.has(row.block)) blockMap.set(row.block, [])
        blockMap.get(row.block).push(row)
      }
      const sortedBlocks = Array.from(blockMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([, rows]) => rows)
      setBlocks(sortedBlocks)
      setCurrentBlockIndex(0)
      setScreen(SCREEN.INSTRUCTION)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleInstructionNext() {
    if (condition === 'HIGH') {
      setScreen(SCREEN.DIGIT_CHECK)
    } else {
      setScreen(SCREEN.MPL)
    }
  }

  function handleDigitCheckPass() {
    setScreen(SCREEN.MPL)
  }

  async function handleBlockComplete(blockResults) {
    setSaving(true)
    try {
      await Promise.all(
        blockResults.map((r) =>
          saveResult({
            session_id: sessionId,
            participant_id: participantId,
            condition,
            delay_condition: delayCondition,
            block: r.block,
            exchange_rate: r.exchange_rate,
            future_amount: r.future_amount,
            row: r.row,
            today_amount: r.today_amount,
            choice: r.choice,
            response_time_ms: r.response_time_ms,
          })
        )
      )
    } catch (e) {
      console.error('保存エラー:', e)
    } finally {
      setSaving(false)
    }

    const updatedAll = [...allResults, ...blockResults]
    setAllResults(updatedAll)

    const nextBlockIndex = currentBlockIndex + 1
    if (nextBlockIndex >= blocks.length) {
      setBdmResult(computeBDM(updatedAll))
      setScreen(SCREEN.FINISH)
    } else {
      setCurrentBlockIndex(nextBlockIndex)
      setScreen(SCREEN.BREAK)
    }
  }

  function handleBreakDone(typedDigit) {
    if (condition === 'HIGH' && typedDigit !== undefined) {
      const expected = digitStrings[currentBlockIndex - 1] || ''
      setComplianceLog((prev) => [
        ...prev,
        { blockIdx: currentBlockIndex - 1, typed: typedDigit, correct: typedDigit === expected },
      ])
    }
    setScreen(SCREEN.MPL)
  }

  const currentDigit = digitStrings[currentBlockIndex] || ''
  const prevDigit = digitStrings[currentBlockIndex - 1] || ''
  const nextDigitForBreak = currentDigit
  const digitChanged = currentDigit !== prevDigit
  const currentBlockTrials = blocks[currentBlockIndex] || []
  const nextStake = currentBlockTrials[0]?.future_amount || null

  switch (screen) {
    case SCREEN.SETUP:
      return <SetupScreen onSetup={handleSetup} loading={loading} error={error} />

    case SCREEN.INSTRUCTION:
      return (
        <InstructionScreen
          condition={condition}
          digitString={currentDigit}
          delayLabel={delayLabel}
          onNext={handleInstructionNext}
        />
      )

    case SCREEN.DIGIT_CHECK:
      return (
        <DigitCheckScreen
          digitString={currentDigit}
          onPass={handleDigitCheckPass}
          phase="pre"
        />
      )

    case SCREEN.MPL:
      return (
        <MPLScreen
          condition={condition}
          digitString={currentDigit}
          blockTrials={currentBlockTrials}
          blockIndex={currentBlockIndex}
          totalBlocks={blocks.length}
          onBlockComplete={handleBlockComplete}
          saving={saving}
        />
      )

    case SCREEN.BREAK:
      return (
        <BreakScreen
          condition={condition}
          checkDigit={prevDigit}
          nextDigit={nextDigitForBreak}
          nextStake={nextStake}
          digitChanged={digitChanged}
          remainingBlocks={blocks.length - currentBlockIndex}
          onContinue={handleBreakDone}
        />
      )

    case SCREEN.FINISH:
      return (
        <FinishScreen
          participantId={participantId}
          bdmResult={bdmResult}
          complianceLog={complianceLog}
          condition={condition}
          allResults={allResults}
          delayLabel={delayLabel}
        />
      )

    default:
      return null
  }
}
