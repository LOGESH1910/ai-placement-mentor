export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="alert alert-error" role="alert">
      <span>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', color: 'inherit', fontSize: '1rem', cursor: 'pointer' }}
          aria-label="Dismiss"
        >✕</button>
      )}
    </div>
  )
}
