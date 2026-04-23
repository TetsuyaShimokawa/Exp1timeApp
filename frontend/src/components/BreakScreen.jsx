import { useState } from 'react'
import { formatYen } from '../utils'

// Steps:
//  "recall"    — (HIGH only) ask to type the digit from last block
//  "next_info" — show next stake + (HIGH) new digit
//  "ready"     — final ready prompt

export default function BreakScreen({
  condition, checkDigit, nextDigit, nextStake, digitChanged,
  remainingBlocks, onContinue,
}) {
  const [step, setStep] = useState(condition === 'HIGH' ? 'recall' : 'next_info')
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const correct = typed.trim() === checkDigit

  function handleRecallSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  function handleRecallNext() {
    setStep('next_info')
  }

  function handleNextInfoNext() {
    setStep('ready')
  }

  function handleReady() {
    onContinue(condition === 'HIGH' ? typed.trim() : undefined)
  }

  if (step === 'recall') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.icon}>🔢</div>
          <h2 style={s.title}>数字を入力してください</h2>
          <p style={s.text}>覚えていた7桁の数字を入力してください。</p>
          {!submitted ? (
            <form onSubmit={handleRecallSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
              <input
                style={s.recallInput}
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="7桁の数字"
                maxLength={7}
                autoFocus
              />
              <button type="submit" style={s.btn} disabled={!typed.trim()}>確認する</button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <div style={{ ...s.feedback, color: correct ? '#2e7d32' : '#c62828' }}>
                {correct ? '✓ 正解！' : '✗ 不正解でした'}
              </div>
              <div style={s.answer}>正解：{checkDigit}</div>
              <button style={s.btn} onClick={handleRecallNext}>次へ →</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'next_info') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.icon}>⏸</div>
          <h2 style={s.title}>次のブロックへ</h2>
          <p style={s.text}>残り <strong>{remainingBlocks} ブロック</strong> です。</p>
          {nextStake && (
            <div style={s.stakeBox}>
              <span style={s.stakeLabel}>次のブロックの将来受取額</span>
              <span style={s.stakeValue}>{formatYen(nextStake)}</span>
            </div>
          )}
          {condition === 'HIGH' && digitChanged && (
            <div style={s.digitBox}>
              <p style={s.digitLabel}>次のブロックの数字（新しい数字を覚えてください）</p>
              <div style={s.digitDisplay}>{nextDigit}</div>
            </div>
          )}
          {condition === 'HIGH' && !digitChanged && (
            <div style={s.digitBox}>
              <p style={s.digitLabel}>数字は変わりません</p>
              <div style={s.digitDisplay}>{nextDigit}</div>
            </div>
          )}
          <button style={s.btn} onClick={handleNextInfoNext}>続ける →</button>
        </div>
      </div>
    )
  }

  // ready
  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.icon}>▶</div>
        <h2 style={s.title}>準備ができたら開始してください</h2>
        {condition === 'HIGH' && (
          <div style={s.digitBox}>
            <p style={s.digitLabel}>このブロックで覚える数字</p>
            <div style={s.digitDisplay}>{nextDigit}</div>
          </div>
        )}
        <button style={s.btn} onClick={handleReady}>開始する →</button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: '#f5f5f5' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', maxWidth: 460, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' },
  icon: { fontSize: 40 },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#263238' },
  text: { margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: '#455a64' },
  stakeBox: { background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 10, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' },
  stakeLabel: { fontSize: 12, fontWeight: 600, color: '#1565c0' },
  stakeValue: { fontSize: '1.6rem', fontWeight: 800, color: '#1565c0' },
  digitBox: { background: '#fff8e1', border: '2px solid #ffcc02', borderRadius: 12, padding: '14px 20px', width: '100%' },
  digitLabel: { margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#e65100' },
  digitDisplay: { fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.2em', color: '#bf360c', fontVariantNumeric: 'tabular-nums' },
  recallInput: { fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center', padding: '10px 16px', border: '2px solid #90caf9', borderRadius: 10, width: '220px', outline: 'none' },
  feedback: { fontSize: '1.4rem', fontWeight: 800 },
  answer: { fontSize: '1.1rem', letterSpacing: '0.15em', color: '#444' },
  btn: { padding: '12px 36px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
