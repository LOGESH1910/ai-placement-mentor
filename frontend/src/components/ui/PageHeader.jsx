import Icon from './Icon'

/* Reusable page header with title, subtitle and optional action */
export default function PageHeader({ icon, title, subtitle, action }) {
  return (
    <div className="page-header">
      <div className="row" style={{ gap: '0.9rem', alignItems: 'flex-start' }}>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'var(--primary-muted)', color: 'var(--primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={20} />
          </span>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
