export default function Loader({ text = 'AI is thinking…', fullPage = false }) {
  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</p>
    </div>
  )

  if (fullPage) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh',
      }}>
        {inner}
      </div>
    )
  }
  return inner
}
