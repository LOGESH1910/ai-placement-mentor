/* Circular score ring — used across dashboard and progress */
import { scoreColor } from '../../utils/score'

export default function ScoreRing({ score, size = 128, stroke = 10, label = '/ 100' }) {
  const r = (100 - stroke) / 2
  const c = 2 * Math.PI * r
  const fill = c * Math.min(Math.max(score, 0), 100) / 100
  const color = scoreColor(score)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img"
      aria-label={`Score ${score} out of 100`}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth={stroke} />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${c - fill}`}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.25,1,0.4,1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {label !== '' && (
          <>
            <span style={{ fontSize: size * 0.24, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
              {score}
            </span>
            <span style={{ fontSize: size * 0.095, color: 'var(--text-muted)', marginTop: 2 }}>{label}</span>
          </>
        )}
      </div>
    </div>
  )
}
