import { useState, useEffect, useRef } from 'react'
import { saveResult, formatYen } from '../utils'

// MPL time discounting screen — one block per exchange rate
// Rows: today_amount (¥50→¥1000), future_amount fixed
// Monotone enforcement: click A → fill rows below as A; click B → fill rows above as B
export default function MPLScreen({
  condition, digitString,
  blockTrials, blockIndex, totalBlocks,
  onBlockComplete, saving,
}) {
  const [choices, setChoices] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    setChoices({})
    startTimeRef.current = Date.now()
  }, [blockIndex])

  if (!blockTrials || blockTrials.length === 0) return null

  const { exchange_rate, future_amount, delay_label } = blockTrials[0]
  const responseTimeMs = Date.now() - startTimeRef.current

  function handleChoice(rowIdx, choice) {
    setChoices((prev) => {
      const next = { ...prev, [rowIdx]: choice }
      if (choice === 'A') {
        // prefer today → also prefer today for all lower rows (smaller today_amount)
        // Wait: rows ordered ¥50→¥1000. Click A on row i means prefer ¥X today.
        // Higher rows have more today → even more likely to prefer A.
        for (let i = rowIdx + 1; i < blockTrials.length; i++) next[i] = 'A'
      } else {
        // prefer future → also prefer future for all rows with less today (lower rows)
        for (let i = 0; i < rowIdx; i++) next[i] = 'B'
      }
      return next
    })
  }

  const allAnswered = blockTrials.every((_, i) => choices[i])

  async function handleConfirm() {
    if (!allAnswered || submitting) return
    setSubmitting(true)

    const blockResults = blockTrials.map((trial, i) => ({
      session_id: undefined, // filled by parent via saveResult
      block: trial.block,
      exchange_rate: trial.exchange_rate,
      future_amount: trial.future_amount,
      row: trial.row,
      today_amount: trial.today_amount,
      delay_condition: trial.delay,
      choice: choices[i],
      response_time_ms: Date.now() - startTimeRef.current,
    }))

    onBlockComplete(blockResults)
    setSubmitting(false)
  }

  const progressPct = (blockIndex / totalBlocks) * 100

  return (
    <div style={s.container}>
      <div style={s.progressOuter}>
        <div style={{ ...s.progressInner, width: `${progressPct}%` }} />
      </div>

      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerItem}>
            <span style={s.headerLabel}>ブロック</span>
            <span style={s.headerValue}>{blockIndex + 1} / {totalBlocks}</span>
          </div>
          <div style={s.headerDivider} />
          <div style={s.headerItem}>
            <span style={s.headerLabel}>交換レート</span>
            <span style={s.headerValue}>{exchange_rate}倍</span>
          </div>
          <div style={s.headerDivider} />
          <div style={s.headerItem}>
            <span style={s.headerLabel}>{delay_label}の受取額</span>
            <span style={{ ...s.headerValue, color: '#2e7d32' }}>{formatYen(future_amount)}</span>
          </div>
          {condition === 'HIGH' && (
            <>
              <div style={s.headerDivider} />
              <div style={s.headerItem}>
                <span style={s.headerLabel}>記憶する数字</span>
                <span style={{ ...s.headerValue, letterSpacing: '0.12em', color: '#bf360c' }}>
                  {digitString}
                </span>
              </div>
            </>
          )}
        </div>

        <div style={s.rateInfo}>
          今日 <strong>¥1,000</strong> を諦めると {delay_label} に <strong>{formatYen(future_amount)}</strong> 受け取れます（×{exchange_rate}）
        </div>

        <p style={s.hint}>
          ヒント：A か B をクリックすると上下の行が自動補完されます。変更したい行は押し直せます。
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.thOpt}>選択肢 A（今日）</th>
                <th style={s.thBtn}>A</th>
                <th style={s.thBtn}>B</th>
                <th style={s.thOpt}>選択肢 B（{delay_label}）</th>
              </tr>
            </thead>
            <tbody>
              {blockTrials.map((trial, i) => {
                const c = choices[i]
                return (
                  <tr
                    key={i}
                    style={{ ...s.row, background: c === 'A' ? '#e3f2fd' : c === 'B' ? '#e8f5e9' : 'transparent' }}
                  >
                    <td style={s.tdOpt}>
                      <span style={{ color: '#1565c0', fontSize: '0.9rem' }}>
                        今すぐ <strong>{formatYen(trial.today_amount)}</strong>
                      </span>
                    </td>
                    <td style={s.tdBtn}>
                      <button
                        onClick={() => handleChoice(i, 'A')}
                        style={{ ...s.btn, background: c === 'A' ? '#1565c0' : '#e3f2fd', color: c === 'A' ? '#fff' : '#1565c0', border: '1px solid #1565c0' }}
                      >A</button>
                    </td>
                    <td style={s.tdBtn}>
                      <button
                        onClick={() => handleChoice(i, 'B')}
                        style={{ ...s.btn, background: c === 'B' ? '#2e7d32' : '#e8f5e9', color: c === 'B' ? '#fff' : '#2e7d32', border: '1px solid #2e7d32' }}
                      >B</button>
                    </td>
                    <td style={s.tdOpt}>
                      <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
                        {delay_label}に <strong>{formatYen(future_amount)}</strong>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            style={{ ...s.confirmBtn, opacity: (!allAnswered || submitting || saving) ? 0.5 : 1 }}
            onClick={handleConfirm}
            disabled={!allAnswered || submitting || saving}
          >
            {blockIndex + 1 < totalBlocks ? '次のブロックへ →' : '課題完了'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f0f4f8' },
  progressOuter: { width: '100%', height: 6, background: '#e0e0e0' },
  progressInner: { height: '100%', background: '#1976d2', transition: 'width 0.4s' },
  card: { background: '#fff', borderRadius: 16, padding: '24px 28px', maxWidth: 700, width: '100%', margin: '20px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #e0e0e0' },
  headerItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  headerLabel: { fontSize: 11, fontWeight: 600, color: '#90a4ae', textTransform: 'uppercase' },
  headerValue: { fontSize: '1rem', fontWeight: 700, color: '#263238' },
  headerDivider: { width: 1, height: 32, background: '#e0e0e0' },
  rateInfo: { background: '#e8eaf6', borderRadius: 8, padding: '10px 14px', fontSize: '0.9rem', color: '#283593' },
  hint: { fontSize: '0.78rem', color: '#888', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  thOpt: { padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#666', borderBottom: '2px solid #e0e0e0', width: '42%' },
  thBtn: { padding: '8px 6px', textAlign: 'center', fontSize: 13, fontWeight: 700, borderBottom: '2px solid #e0e0e0', width: '8%' },
  row: { borderBottom: '1px solid #f0f0f0', transition: 'background 0.1s' },
  tdOpt: { padding: '7px 12px', textAlign: 'center', verticalAlign: 'middle' },
  tdBtn: { padding: '7px 6px', textAlign: 'center', verticalAlign: 'middle' },
  btn: { padding: '4px 14px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
  confirmBtn: { padding: '11px 32px', fontSize: 15, fontWeight: 700, background: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
