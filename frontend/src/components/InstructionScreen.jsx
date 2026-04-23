export default function InstructionScreen({ condition, digitString, delayLabel, onNext }) {
  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.title}>実験の説明</h2>

        {condition === 'HIGH' && (
          <div style={s.digitBox}>
            <p style={s.digitLabel}>以下の7桁の数字を覚えてください</p>
            <div style={s.digitDisplay}>{digitString}</div>
            <p style={s.digitNote}>課題中も画面に表示されます。各ブロック終了後に入力を求められます。</p>
          </div>
        )}

        <section style={s.section}>
          <h3 style={s.heading}>概要</h3>
          <p style={s.text}>
            この実験では、<strong>今日すぐ</strong>受け取るお金と、
            <strong>{delayLabel}</strong>に受け取るお金を比較します。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>課題の説明</h3>
          <p style={s.text}>
            各ブロックでは 20 行の選択肢が表示されます。
            各行で <strong>A（今日の金額）</strong> か <strong>B（{delayLabel}の金額）</strong> を選んでください。
          </p>
          <p style={{ ...s.text, marginTop: 6 }}>
            将来の受取額は固定されており、今日の金額が行ごとに変わります。
            今日の金額が少なくなるほど選択肢 B（将来）が相対的に有利になります。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>選択例</h3>
          <div style={s.exampleTable}>
            {[
              { today: 1000, future: 1100, label: '今日 ¥1,000 ／ 将来 ¥1,100' },
              { today: 500,  future: 1100, label: '今日 ¥500 ／ 将来 ¥1,100' },
              { today: 50,   future: 1100, label: '今日 ¥50 ／ 将来 ¥1,100' },
            ].map(({ today, future, label }) => (
              <div key={today} style={s.exampleRow}>
                <span style={s.badge('#bbdefb', '#1565c0')}>A</span>
                <span style={{ fontSize: '0.9rem' }}>今日 ¥{today.toLocaleString()}</span>
                <span style={{ color: '#999' }}>vs</span>
                <span style={s.badge('#c8e6c9', '#2e7d32')}>B</span>
                <span style={{ fontSize: '0.9rem' }}>{delayLabel} ¥{future.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <p style={{ ...s.text, fontSize: '0.82rem', color: '#78909c' }}>
            ヒント：A か B をクリックすると上下の行が自動補完されます。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>全体の流れ</h3>
          <p style={s.text}>全部で <strong>28 ブロック</strong>（各 20 行）あります。</p>
          {condition === 'HIGH' && (
            <p style={s.text}>各ブロックの終わりに7桁の数字の入力があります。</p>
          )}
        </section>

        <button style={s.btn} onClick={onNext}>
          {condition === 'HIGH' ? '数字を確認して開始 →' : '開始する →'}
        </button>
      </div>
    </div>
  )
}

const badge = (bg, color) => ({
  background: bg, color, padding: '2px 8px', borderRadius: 4,
  fontSize: 12, fontWeight: 700,
})

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
  exampleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  badge: (bg, color) => ({ background: bg, color, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }),
  btn: { padding: '12px 32px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-end' },
}
