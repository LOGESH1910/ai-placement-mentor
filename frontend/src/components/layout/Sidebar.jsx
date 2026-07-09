import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Sidebar.module.css'

const NAV = [
  { path: '/dashboard',           icon: '⊞', label: 'Dashboard' },
  { path: '/profile',             icon: '👤', label: 'Profile' },
  { path: '/resume',              icon: '📄', label: 'Resume Analysis' },
  { path: '/interview/questions', icon: '❓', label: 'Interview Q&A' },
  { path: '/interview/mock',      icon: '🎤', label: 'Mock Interview' },
  { path: '/coding',              icon: '💻', label: 'Coding Prep' },
  { path: '/roadmap',             icon: '🗺️', label: 'Roadmap' },
  { path: '/aptitude',            icon: '🧮', label: 'Aptitude' },
  { path: '/communication',       icon: '🗣️', label: 'Communication' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🎯</span>
        <div>
          <div className={styles.brandName}>AI Mentor</div>
          <div className={styles.brandSub}>Placement Prep</div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className={styles.userText}>
            <div className={styles.userName}>{user?.name ?? 'User'}</div>
            <div className={styles.userEmail}>{user?.email ?? ''}</div>
          </div>
        </div>
        <button className={`btn btn-ghost btn-sm ${styles.logoutBtn}`} onClick={handleLogout}>
          ↩ Logout
        </button>
      </div>
    </aside>
  )
}
