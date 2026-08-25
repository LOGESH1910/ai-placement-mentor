import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import TopNav from './TopNav'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/learn': 'Learn',
  '/practice': 'Practice',
  '/ai-mentor': 'AI Mentor',
  '/interview': 'Interview Preparation',
  '/progress': 'Progress',
  '/profile': 'Profile',
  '/resume': 'Resume Analysis',
  '/roadmap': 'Career Roadmap',
}

export default function AppLayout() {
  const { pathname } = useLocation()

  /* Scroll to top + update document title on navigation */
  useEffect(() => {
    window.scrollTo({ top: 0 })
    const base = '/' + (pathname.split('/')[1] ?? '')
    document.title = `${PAGE_TITLES[base] ?? 'AI Placement Mentor'} · AI Placement Mentor`
  }, [pathname])

  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="btn btn-secondary btn-sm"
        style={{ position: 'absolute', left: -9999, top: 8, zIndex: 200 }}
        onFocus={(e) => { e.currentTarget.style.left = '8px' }}
        onBlur={(e) => { e.currentTarget.style.left = '-9999px' }}
      >
        Skip to content
      </a>
      <TopNav />
      <main className="app-main" id="main-content">
        {/* AI Mentor manages its own full-height layout */}
        {pathname.startsWith('/ai-mentor') ? (
          <div className="page-content" style={{ maxWidth: 1360 }}>
            <Outlet />
          </div>
        ) : (
          <div className="page-content">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  )
}
