import { useState } from 'react'
import { startSession, saveResult } from './utils'
import SetupScreen from './components/SetupScreen'
import InstructionScreen from './components/InstructionScreen'
import DigitCheckScreen from './components/DigitCheckScreen'
import CTBScreen from './components/CTBScreen'
import BreakScreen from './components/BreakScreen'
import FinishScreen from './components/FinishScreen'
import './App.css'

// setup → instruction → [digit_check HIGH] → ctb → break → ctb → ... → finish
const SCREEN = {
  SETUP: 'SETUP',
  INSTRUCTION: 'INSTRUCTION',
  DIGIT_CHECK: 'DIGIT_CHECK',
  CTB: 'CTB',
  BREAK: 'BREAK',
  FINISH: 'FINISH',
}

function computeBDM(allResults) {
  if (!allResults.length) return null
  const sel = allResults[Math.floor(Math.random() * allResults.length)]
  const reward = sel.allocation_today
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
  const [digitStrings, setDigitStrings] = useState([])
  const [blocks, setBlocks] = useState([])          // array of trial arrays, grouped by block
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)

  const [complianceLog, setComplianceLog] = useState([])
  const [allResults, setAllResults] = useState([])
  const [bdmResult, setBdmResult] = useState(null)

  async function handleSetup(pid, name, delayCondition) {
    setLoading(true)
    setError(null)
    try {
      const data = await startSession({ participant_id: pid, name, delay_condition: delayCondition })
      setSessionId(data.session_id)
      setParticipantId(pid)
      setCondition(data.condition)
      setDelayLabel(data.delay_label)
      setDigitStrings(data.digit_strings || [])

      // Group trials by block number, preserve block order
      const blockMap = new Map()
      for (const trial of data.trials) {
        if (!blockMap.has(trial.block)) blockMap.set(trial.block, [])
        blockMap.get(trial.block).push(trial)
      }
      const sortedBlocks = Array.from(blockMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([, trials]) => trials)
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
      setScreen(SCREEN.CTB)
    }
  }

  function handleDigitCheckPass() {
    setScreen(SCREEN.CTB)
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
            delay_condition: blocks[currentBlockIndex]?.[0]?.delay || '',
            trial_id: r.trial_id,
            block: r.block,
            stake: r.stake,
            exchange_rate: r.exchange_rate,
            allocation_today: r.allocation_today,
            allocation_future: r.allocation_future,
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
        {
          blockIdx: currentBlockIndex - 1,
          typed: typedDigit,
          correct: typedDigit === expected,
        },
      ])
    }
    setScreen(SCREEN.CTB)
  }

  const currentDigit = digitStrings[currentBlockIndex] || ''
  const prevDigit = digitStrings[currentBlockIndex - 1] || ''
  const nextDigitForBreak = currentDigit
  const digitChanged = currentDigit !== prevDigit
  const currentBlockTrials = blocks[currentBlockIndex] || []
  const nextStake = currentBlockTrials[0]?.stake || null

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

    case SCREEN.CTB:
      return (
        <CTBScreen
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
        />
      )

    default:
      return null
  }
}
