import { formatYen } from '../utils'

export default function InstructionScreen({ condition, digitString, delayLabel, onNext }) {
  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.title}>実験の説明</h2>

        {condition === 'HIGH' && (
          <div style={s.digitBox}>
            <p style={s.digitLabel}>以下の7桁の数字を覚えてください</p>
            <div style={s.digitDisplay}>{digitString}</div>
            <p style={s.digitNote}>課題終了後に入力を求められます</p>
          </div>
        )}

        <section style={s.section}>
          <h3 style={s.heading}>概要</h3>
          <p style={s.text}>
            この実験では、<strong>今日</strong>受け取るお金と、
            <strong>{delayLabel}</strong>に受け取るお金をどのように配分するかを
            決めていただきます。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>課題の説明</h3>
          <p style={s.text}>
            各試行では<strong>賭け金</strong>（例：{formatYen(500)}）が与えられます。
            スライダーを動かして「今日受け取る分」を決めてください。
          </p>
          <p style={{ ...s.text, marginTop: 8 }}>
            今日1円を諦めると、{delayLabel}に<strong>交換レート分だけ多く</strong>受け取れます。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>具体例（賭け金：{formatYen(500)}、交換レート：1.5）</h3>
          <div style={s.exampleTable}>
            {[
              [500, 0],
              [250, 375],
              [0, 750],
            ].map(([today, future]) => (
              <div key={today} style={s.exampleRow}>
                <span style={s.todayBadge}>今日</span>
                <span>{formatYen(today)}</span>
                <span style={{ color: '#999' }}>+</span>
                <span style={s.futureBadge}>{delayLabel}</span>
                <span>{formatYen(future)}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>全体の流れ</h3>
          <p style={s.text}>全部で <strong>18 試行</strong>（3ブロック × 6試行）あります。</p>
          {condition === 'HIGH' && (
            <p style={s.text}>各ブロックの終わりに数字の入力があります。</p>
          )}
        </section>

        <button style={s.btn} onClick={onNext}>
          {condition === 'HIGH' ? '数字を確認して開始 →' : '開始する →'}
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '24px 16px', background: '#f5f5f5' },
  card: { background: '#fff', borderRadius: 16, padding: '36px 32px', maxWidth: 620, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 },
  title: { margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1565c0' },
  digitBox: { background: '#fff8e1', border: '2px solid #ffcc02', borderRadius: 12, padding: '16px 20px', textAlign: 'center' },
  digitLabel: { margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#e65100' },
  digitDisplay: { fontSize: '2.4rem', fontWeight: 800, letterSpacing: '0.2em', color: '#bf360c', fontVariantNumeric: 'tabular-nums' },
  digitNote: { margin: '8px 0 0', fontSize: 12, color: '#795548' },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  heading: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#333', borderLeft: '3px solid #1565c0', paddingLeft: 10 },
  text: { margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: '#444' },
  exampleTable: { display: 'flex', flexDirection: 'column', gap: 8, background: '#f5f5f5', borderRadius: 8, padding: 12 },
  exampleRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' },
  todayBadge: { background: '#bbdefb', color: '#1565c0', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 },
  futureBadge: { background: '#c8e6c9', color: '#2e7d32', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 },
  btn: { padding: '12px 32px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-end' },
}
