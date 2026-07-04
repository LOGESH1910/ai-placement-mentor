import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
