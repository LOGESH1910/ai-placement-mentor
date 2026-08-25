import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BrandMark } from './ui/BrandMark'

/**
 * Guards protected routes:
 * - shows a branded loading screen while the session is being restored
 * - redirects unauthenticated users to /login
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', height: '100vh', background: 'var(--bg)',
        }}
        role="status"
        aria-label="Loading"
      >
        <BrandMark size={44} />
        <span className="spinner" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
