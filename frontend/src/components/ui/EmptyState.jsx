export default function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem', textAlign: 'center',
    }}>
      <span style={{ fontSize: '2.5rem' }}>{icon}</span>
      <p style={{ fontWeight: 600, fontSize: '1rem' }}>{title}</p>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 320 }}>{subtitle}</p>}
      {action}
    </div>
  )
}
