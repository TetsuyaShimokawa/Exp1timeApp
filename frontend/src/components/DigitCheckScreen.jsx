import { useState } from 'react'

export default function DigitCheckScreen({ digitString, onPass, phase = 'pre' }) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // pre: just confirm the digit before starting
  if (phase === 'pre') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <h2 style={s.title}>数字を確認してください</h2>
          <p style={s.text}>課題を始める前に、以下の7桁の数字を覚えてください。</p>
          <div style={s.digitDisplay}>{digitString}</div>
          <p style={s.note}>覚えたら「開始する」を押してください。課題中も画面に表示されます。</p>
          <button style={s.btn} onClick={onPass}>開始する →</button>
        </div>
      </div>
    )
  }

  // recall: ask to type the digit
  const correct = input.trim() === digitString
  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.title}>数字を入力してください</h2>
        <p style={s.text}>覚えていた7桁の数字を入力してください。</p>
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <input
              style={s.recallInput}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="7桁の数字"
              maxLength={7}
              autoFocus
            />
            <button type="submit" style={s.btn} disabled={!input.trim()}>確認する</button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...s.feedback, color: correct ? '#2e7d32' : '#c62828' }}>
              {correct ? '✓ 正解です！' : '✗ 不正解でした'}
            </div>
            <div style={s.answer}>正解：{digitString}</div>
            <button style={s.btn} onClick={() => onPass(input.trim(), correct)}>次へ →</button>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: '#f5f5f5' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', maxWidth: 420, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1565c0' },
  text: { margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: '#444' },
  digitDisplay: { fontSize: '2.8rem', fontWeight: 800, letterSpacing: '0.2em', color: '#bf360c', background: '#fff8e1', border: '2px solid #ffcc02', borderRadius: 12, padding: '16px 28px', fontVariantNumeric: 'tabular-nums' },
  note: { margin: 0, fontSize: '0.85rem', color: '#78909c' },
  recallInput: { fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center', padding: '10px 16px', border: '2px solid #90caf9', borderRadius: 10, width: '200px', outline: 'none' },
  feedback: { fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 },
  answer: { fontSize: '1.2rem', letterSpacing: '0.15em', color: '#444', marginBottom: 20 },
  btn: { padding: '12px 32px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
