/**
 * Skeleton loader — pass width/height/borderRadius as style props
 * Usage: <Skeleton height={80} borderRadius={14} />
 *        <Skeleton style={{ height: 16, width: '60%' }} />
 */
export default function Skeleton({ height, width = '100%', borderRadius, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ height, width, borderRadius: borderRadius ?? 'var(--radius-sm)', ...style }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <Skeleton height={16} width="45%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? '70%' : '100%'} />
      ))}
    </div>
  )
}
