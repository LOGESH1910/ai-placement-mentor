/* Shared brand mark — gradient tile with "AI" monogram */

export function BrandMark({ size = 30, radius = 8 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #7c3aed 100%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: size * 0.42,
        letterSpacing: '-0.02em',
        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
      }}
    >
      AI
    </span>
  )
}

export function BrandLockup({ dark = false, size = 30 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <BrandMark size={size} />
      <span
        style={{
          fontWeight: 800,
          fontSize: size * 0.53,
          letterSpacing: '-0.01em',
          color: dark ? '#fff' : 'var(--text)',
          whiteSpace: 'nowrap',
        }}
      >
        Placement Mentor
      </span>
    </span>
  )
}
