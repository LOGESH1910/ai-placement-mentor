import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Icon from '../ui/Icon'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/learn', label: 'Learn' },
  { to: '/practice', label: 'Practice' },
  { to: '/ai-mentor', label: 'AI Mentor' },
  { to: '/interview', label: 'Interview' },
  { to: '/progress', label: 'Progress' },
]

const MORE_LINKS = [
  { to: '/resume', label: 'Resume Analysis', icon: 'fileText' },
  { to: '/roadmap', label: 'Career Roadmap', icon: 'target' },
  { to: '/profile', label: 'Profile Settings', icon: 'user' },
]

/* Closes a dropdown when clicking outside the wrapped element */
function useClickOutside(onOutside) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onOutside])
  return ref
}

function Dropdown({ open, onClose, children, ariaLabel }) {
  const ref = useClickOutside(onClose)
  if (!open) return null
  return (
    <div className="dropdown-menu" role="menu" aria-label={ariaLabel} ref={ref}>
      {children}
    </div>
  )
}

export default function TopNav() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [openMenu, setOpenMenu] = useState(null) // 'apps' | 'notif' | 'profile' | 'mobile'
  const toggle = (name) => setOpenMenu((m) => (m === name ? null : name))
  const closeAll = () => setOpenMenu(null)

  const initials = (user?.name ?? 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = () => {
    closeAll()
    logout()
    navigate('/')
  }

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <header className="topnav">
      <div className="topnav-inner">
        {/* Brand */}
        <Link to="/dashboard" className="topnav-brand" aria-label="AI Placement Mentor home">
          <span className="topnav-logo">AI</span>
          <span>Placement Mentor</span>
        </Link>

        {/* Primary nav */}
        <nav className="topnav-links" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
              end={to === '/interview'}
            >
              {label}
            </NavLink>
          ))}

          {/* More dropdown */}
          <div className="dropdown-wrap">
            <button
              className={`topnav-link${openMenu === 'apps' ? ' active' : ''}`}
              onClick={() => toggle('apps')}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'apps'}
            >
              More
              <Icon name="chevronDown" size={13} style={{ marginLeft: 3, verticalAlign: '-2px' }} />
            </button>
            <Dropdown open={openMenu === 'apps'} onClose={() => setOpenMenu(null)} ariaLabel="More tools">
              {MORE_LINKS.map(({ to, label, icon }) => (
                <Link key={to} to={to} className="dropdown-item" role="menuitem" onClick={closeAll}>
                  <Icon name={icon} size={15} /> {label}
                </Link>
              ))}
            </Dropdown>
          </div>
        </nav>

        {/* Right cluster */}
        <div className="topnav-right">
          {/* Search shortcut */}
          <button
            className="icon-btn topnav-search"
            title="Search topics and questions"
            aria-label="Search"
            onClick={() => navigate('/learn')}
          >
            <Icon name="search" size={17} />
          </button>

          {/* Theme */}
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          </button>

          {/* Notifications */}
          <div className="dropdown-wrap">
            <button
              className="icon-btn"
              onClick={() => toggle('notif')}
              aria-label="Notifications"
              aria-expanded={openMenu === 'notif'}
            >
              <Icon name="bell" size={16} />
              <span className="notif-dot" aria-hidden="true" />
            </button>
            <Dropdown open={openMenu === 'notif'} onClose={() => setOpenMenu(null)} ariaLabel="Notifications">
              <div className="dropdown-header">
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Notifications</span>
              </div>
              <div style={{ padding: '0.35rem 0.65rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <p className="small" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Complete today&apos;s goal to keep your learning streak alive.
                </p>
                <p className="caption">Tip: ask the AI Mentor for a daily study plan.</p>
              </div>
            </Dropdown>
          </div>

          {/* Profile menu */}
          <div className="dropdown-wrap">
            <button
              className="avatar-btn"
              onClick={() => toggle('profile')}
              aria-label="Account menu"
              aria-expanded={openMenu === 'profile'}
            >
              <span className="avatar">{initials}</span>
              <Icon name="chevronDown" size={13} />
            </button>
            <Dropdown open={openMenu === 'profile'} onClose={() => setOpenMenu(null)} ariaLabel="Account">
              <div className="dropdown-header">
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{user?.name}</div>
                <div className="caption" style={{ marginTop: 1 }}>{user?.email}</div>
              </div>
              <Link to="/dashboard" className="dropdown-item" role="menuitem" onClick={closeAll}>
                <Icon name="dashboard" size={15} /> Dashboard
              </Link>
              <Link to="/profile" className="dropdown-item" role="menuitem" onClick={closeAll}>
                <Icon name="user" size={15} /> My Profile
              </Link>
              <Link to="/progress" className="dropdown-item" role="menuitem" onClick={closeAll}>
                <Icon name="chart" size={15} /> Progress
              </Link>
              <div className="dropdown-sep" />
              <button className="dropdown-item danger" role="menuitem" onClick={handleLogout}>
                <Icon name="logout" size={15} /> Log out
              </button>
            </Dropdown>
          </div>

          {/* Mobile hamburger */}
          <button
            className="icon-btn hamburger"
            onClick={() => toggle('mobile')}
            aria-label="Open menu"
            aria-expanded={openMenu === 'mobile'}
          >
            <Icon name={openMenu === 'mobile' ? 'x' : 'menu'} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {openMenu === 'mobile' && (
        <nav className="mobile-menu" aria-label="Mobile">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
              end={to === '/interview'}
              onClick={closeAll}
            >
              {label}
            </NavLink>
          ))}
          <div className="dropdown-sep" style={{ margin: '0.4rem 0.75rem' }} />
          {MORE_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className="topnav-link" onClick={closeAll}>
              {label}
            </NavLink>
          ))}
          <button
            className="topnav-link"
            style={{ textAlign: 'left', color: 'var(--danger)' }}
            onClick={handleLogout}
          >
            Log out
          </button>
          <p className="caption" style={{ padding: '0.4rem 0.75rem 0' }}>Signed in as {firstName}</p>
        </nav>
      )}
    </header>
  )
}
