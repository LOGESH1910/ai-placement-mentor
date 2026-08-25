import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// App pages
import DashboardPage from './pages/DashboardPage'
import LearnPage from './pages/LearnPage'
import LearnTopicPage from './pages/LearnTopicPage'
import PracticePage from './pages/PracticePage'
import AIMentorPage from './pages/AIMentorPage'
import InterviewPage from './pages/InterviewPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import ResumeAnalysisPage from './pages/ResumeAnalysisPage'
import RoadmapPage from './pages/RoadmapPage'
import CommunicationPage from './pages/CommunicationPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected application */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/:topicId" element={<LearnTopicPage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/ai-mentor" element={<AIMentorPage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/resume" element={<ResumeAnalysisPage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/communication" element={<CommunicationPage />} />
              </Route>
            </Route>

            {/* Catch-all → landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
