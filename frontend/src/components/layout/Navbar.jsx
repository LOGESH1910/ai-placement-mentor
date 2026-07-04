import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const TITLES = {
  '/dashboard':           'Dashboard',
  '/profile':             'My Profile',
  '/resume':              'Resume Analysis',
  '/interview/questions': 'Interview Questions',
  '/interview/mock':      'Mock Interview',
  '/coding':              'Coding Prep',
  '/roadmap':             'Learning Roadmap',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const title = TITLES[pathname] ?? 'AI Placement Mentor'

  return (
    <header style={{
      height: '60px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <h1 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user?.placementReadinessScore > 0 && (
          <span className="badge badge-green">🎯 {user.placementReadinessScore}% Ready</span>
        )}
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.name}</span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', transition: 'all 0.2s',
            color: 'var(--text)',
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
