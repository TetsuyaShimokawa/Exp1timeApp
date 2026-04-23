import { useState } from 'react'

export default function SetupScreen({ onSetup, loading, error }) {
  const [participantId, setParticipantId] = useState('')
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!participantId.trim() || !name.trim()) return
    onSetup(participantId.trim(), name.trim())
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>認知負荷 × 時間割引実験</h1>
        <p style={s.subtitle}>実験 1-time：認知資源と異時点間選択</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label} htmlFor="pid">参加者ID</label>
            <input
              id="pid"
              style={s.input}
              type="text"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="例: P001"
              autoComplete="off"
            />
          </div>
          <div style={s.field}>
            <label style={s.label} htmlFor="name">お名前</label>
            <input
              id="name"
              style={s.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田 太郎"
            />
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button
            type="submit"
            style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}
            disabled={loading || !participantId.trim() || !name.trim()}
          >
            {loading ? '接続中...' : '開始する'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)' },
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 440, width: '100%', boxShadow: '0 6px 32px rgba(0,0,0,0.10)' },
  title: { margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: '#1565c0', textAlign: 'center' },
  subtitle: { margin: '0 0 28px', fontSize: '0.9rem', color: '#78909c', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#546e7a' },
  input: { padding: '10px 14px', fontSize: 15, border: '1px solid #cfd8dc', borderRadius: 8, outline: 'none' },
  error: { color: '#c62828', fontSize: 13, margin: 0 },
  btn: { padding: '12px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
