import { useState, useEffect, useRef } from 'react'
import { formatYen } from '../utils'

const STEPS = 10

export default function CTBScreen({
  condition, digitString,
  blockTrials, blockIndex, totalBlocks,
  onBlockComplete, saving,
}) {
  const [trialIndex, setTrialIndex] = useState(0)
  const [allocationToday, setAllocationToday] = useState(null)
  const [blockResults, setBlockResults] = useState([])
  const startTimeRef = useRef(Date.now())

  const trial = blockTrials[trialIndex]

  useEffect(() => {
    setTrialIndex(0)
    setBlockResults([])
  }, [blockIndex])

  useEffect(() => {
    if (trial) {
      setAllocationToday(Math.round(trial.stake / 2))
      startTimeRef.current = Date.now()
    }
  }, [trialIndex, trial?.trial_id])

  if (!trial || allocationToday === null) return null

  const { stake, exchange_rate, delay_label } = trial
  const step = Math.round(stake / STEPS)
  const allocationFuture = Math.round((stake - allocationToday) * exchange_rate)

  function handleSlider(e) {
    const raw = Number(e.target.value)
    const snapped = Math.round(raw / step) * step
    setAllocationToday(Math.max(0, Math.min(stake, snapped)))
  }

  function handleConfirm() {
    const result = {
      trial_id: trial.trial_id,
      block: trial.block,
      stake,
      exchange_rate,
      allocation_today: allocationToday,
      allocation_future: allocationFuture,
      delay_label,
      response_time_ms: Date.now() - startTimeRef.current,
    }

    const updatedResults = [...blockResults, result]
    const next = trialIndex + 1

    if (next >= blockTrials.length) {
      onBlockComplete(updatedResults)
    } else {
      setBlockResults(updatedResults)
      setTrialIndex(next)
    }
  }

  const blockProgress = (blockIndex / totalBlocks) * 100

  return (
    <div style={s.container}>
      <div style={s.progressOuter}>
        <div style={{ ...s.progressInner, width: `${blockProgress}%` }} />
      </div>

      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerItem}>
            <span style={s.headerLabel}>ブロック</span>
            <span style={s.headerValue}>{blockIndex + 1} / {totalBlocks}</span>
          </div>
          <div style={s.headerDivider} />
          <div style={s.headerItem}>
            <span style={s.headerLabel}>試行</span>
            <span style={s.headerValue}>{trialIndex + 1} / {blockTrials.length}</span>
          </div>
          <div style={s.headerDivider} />
          <div style={s.headerItem}>
            <span style={s.headerLabel}>賭け金</span>
            <span style={s.headerValue}>{formatYen(stake)}</span>
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
          今日1円を諦めると {delay_label} に <strong>{exchange_rate} 円</strong> 増えます
        </div>

        <div style={s.amounts}>
          <div style={{ ...s.amountBox, borderColor: '#2196F3', background: '#e3f2fd' }}>
            <span style={{ ...s.amountLabel, color: '#1565c0' }}>今日の受取額</span>
            <span style={{ ...s.amountValue, color: '#1565c0' }}>{formatYen(allocationToday)}</span>
          </div>
          <div style={s.plus}>+</div>
          <div style={{ ...s.amountBox, borderColor: '#4CAF50', background: '#e8f5e9' }}>
            <span style={{ ...s.amountLabel, color: '#2e7d32' }}>{delay_label}の受取額</span>
            <span style={{ ...s.amountValue, color: '#2e7d32' }}>{formatYen(allocationFuture)}</span>
          </div>
        </div>

        <div style={s.sliderSection}>
          <div style={s.sliderLabels}>
            <span style={{ color: '#1976d2' }}>← 今日を多く</span>
            <span style={{ color: '#388e3c' }}>将来を多く →</span>
          </div>
          <input
            style={s.slider}
            type="range"
            min={0}
            max={stake}
            step={step}
            value={allocationToday}
            onChange={handleSlider}
          />
          <div style={s.sliderEndLabels}>
            <span>今日: {formatYen(0)}<br />{delay_label}: {formatYen(Math.round(stake * exchange_rate))}</span>
            <span style={{ textAlign: 'right' }}>今日: {formatYen(stake)}<br />{delay_label}: {formatYen(0)}</span>
          </div>
        </div>

        <div style={s.fineButtons}>
          <button style={s.fineBtn} onClick={() => setAllocationToday(Math.max(0, allocationToday - step))}>
            ◀ 今日 −{formatYen(step)}
          </button>
          <button style={s.fineBtn} onClick={() => setAllocationToday(Math.min(stake, allocationToday + step))}>
            今日 +{formatYen(step)} ▶
          </button>
        </div>

        <button
          style={{ ...s.confirmBtn, opacity: saving ? 0.6 : 1 }}
          onClick={handleConfirm}
          disabled={saving}
        >
          確定
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f0f4f8' },
  progressOuter: { width: '100%', height: 6, background: '#e0e0e0' },
  progressInner: { height: '100%', background: '#1976d2', transition: 'width 0.4s' },
  card: { background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 680, width: '100%', margin: '24px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 },
  header: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: '0 0 12px', borderBottom: '1px solid #e0e0e0' },
  headerItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  headerLabel: { fontSize: 11, fontWeight: 600, color: '#90a4ae', textTransform: 'uppercase' },
  headerValue: { fontSize: '1rem', fontWeight: 700, color: '#263238' },
  headerDivider: { width: 1, height: 32, background: '#e0e0e0' },
  rateInfo: { background: '#e8eaf6', borderRadius: 8, padding: '10px 14px', fontSize: '0.9rem', color: '#283593' },
  amounts: { display: 'flex', alignItems: 'center', gap: 16 },
  amountBox: { flex: 1, border: '2px solid', borderRadius: 12, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  amountLabel: { fontSize: 12, fontWeight: 700 },
  amountValue: { fontSize: '1.6rem', fontWeight: 800 },
  plus: { fontSize: '1.4rem', fontWeight: 700, color: '#78909c' },
  sliderSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 },
  slider: { width: '100%', accentColor: '#1976d2', cursor: 'pointer' },
  sliderEndLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#90a4ae', lineHeight: 1.5 },
  fineButtons: { display: 'flex', gap: 12 },
  fineBtn: { flex: 1, padding: '8px', fontSize: 13, fontWeight: 600, background: '#f5f5f5', border: '1px solid #cfd8dc', borderRadius: 8, cursor: 'pointer' },
  confirmBtn: { padding: '14px', fontSize: 16, fontWeight: 700, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' },
}
