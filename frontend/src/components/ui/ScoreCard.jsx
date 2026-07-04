/**
 * Circular score display + label.
 * pct: 0-100
 */
export default function ScoreCard({ label, score, color = 'var(--primary)' }) {
  const pct = Math.max(0, Math.min(100, score ?? 0))
  const deg = (pct / 100) * 360

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', position: 'relative',
        background: `conic-gradient(${color} ${deg}deg, var(--bg-card2) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{pct}</span>
        </div>
      </div>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
    </div>
  )
}
