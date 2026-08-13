import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const ROUTE_META = {
  '/dashboard':           { title: 'Dashboard',        sub: 'Your placement command center' },
  '/profile':             { title: 'Profile',           sub: 'Manage your placement profile' },
  '/resume':              { title: 'Resume Analyzer',   sub: 'AI-powered resume analysis & ATS scoring' },
  '/interview/questions': { title: 'Interview Q&A',     sub: 'Generate & practice technical questions' },
  '/interview/mock':      { title: 'Mock Interview',    sub: 'Simulate real interviews with AI scoring' },
  '/coding':              { title: 'Coding Practice',   sub: 'DSA problems with AI guidance' },
  '/roadmap':             { title: 'Career Roadmap',    sub: 'Your personalised placement journey' },
  '/communication':       { title: 'Communication',     sub: 'Sharpen verbal & soft skills' },
  '/aptitude':            { title: 'Aptitude',          sub: 'Quantitative, logical & verbal reasoning' },
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const meta = ROUTE_META[pathname] ?? { title: 'AI Placement Mentor', sub: '' }

  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  /* collapse sidebar automatically on small screens */
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) setCollapsed(true)
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  /* close mobile drawer on route change */
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const marginLeft = isMobile
    ? 0
    : collapsed
    ? 'var(--sidebar-w-col)'
    : 'var(--sidebar-w)'

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, backdropFilter: 'blur(2px)' }}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className="app-main"
        style={{ marginLeft, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <Topbar
          title={meta.title}
          subtitle={meta.sub}
          onMenuClick={() => setMobileOpen(o => !o)}
        />
        <main style={{ flex: 1 }}>
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
