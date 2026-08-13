import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const score = user?.placementReadinessScore ?? 0
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="btn btn-icon btn-secondary"
          style={{ display: 'none' }}
          aria-label="Open navigation"
          id="mobile-menu-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && (
            <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: 1, lineHeight: 1.3 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Readiness badge */}
        {score > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.25rem 0.625rem', borderRadius: 99,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            fontSize: '0.72rem', fontWeight: 700, color: scoreColor,
            userSelect: 'none',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: scoreColor, display: 'inline-block', boxShadow: `0 0 6px ${scoreColor}` }} />
            {score}% Ready
          </div>
        )}

        {/* User name */}
        {user?.name && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </span>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-icon btn-secondary"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
