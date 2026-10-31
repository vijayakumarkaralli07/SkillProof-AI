import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import JobsPage from './pages/JobsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import RecruiterApplicationsPage from './pages/RecruiterApplicationsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage'
import SavedJobsPage from './pages/SavedJobsPage'
import ModulePage from './pages/ModulePage'
import AuthCallback from './pages/AuthCallback'
import Navbar from './components/common/Navbar'
import CareerToolsPage from './pages/CareerToolsPage'
import UpgradePage from './pages/UpgradePage'
import ProfilePage from './pages/ProfilePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { AuthProvider } from './hooks/AuthProvider'
import { useAuth } from './hooks/useAuth'

function ProtectedLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (loading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />
  const isJobsPage = location.pathname === '/jobs'
  const isDashboard = location.pathname === '/dashboard'
  const isApplicationsPage = location.pathname === '/applications' || location.pathname === '/recruiter/applications'
  const isAnalyticsPage = location.pathname === '/analytics'
  const isSavedJobsPage = location.pathname === '/saved-jobs'
  const isCareerToolPage = ['/resume-studio', '/resume-scanner', '/resume-improver', '/job-specific-resume', '/saved-resumes'].includes(location.pathname) || location.pathname.startsWith('/interview-prep')
  if (isCareerToolPage) return <CareerToolsPage user={user} onSignOut={signOut} />
  return <div className={`workspace-app${isJobsPage ? ' jobs-workspace' : ''}${isDashboard ? ' dashboard-workspace' : ''}${isApplicationsPage ? ' applications-workspace' : ''}${isAnalyticsPage ? ' analytics-workspace' : ''}${isSavedJobsPage ? ' saved-jobs-workspace' : ''}`}><Navbar user={user} onSignOut={signOut} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((open) => !open)} onNavigate={() => setMobileOpen(false)} /><main className="workspace-main"><Routes><Route path="dashboard" element={<Dashboard />} /><Route path="jobs" element={<JobsPage />} /><Route path="resume-studio" element={<CareerToolsPage user={user} onSignOut={signOut} />} /><Route path="resume-scanner" element={<CareerToolsPage user={user} onSignOut={signOut} />} /><Route path="resume-improver" element={<CareerToolsPage user={user} onSignOut={signOut} />} /><Route path="job-specific-resume" element={<CareerToolsPage user={user} onSignOut={signOut} />} /><Route path="saved-resumes" element={<CareerToolsPage user={user} onSignOut={signOut} />} /><Route path="interview-prep/*" element={<CareerToolsPage user={user} onSignOut={signOut} />} /><Route path="upgrade/*" element={<UpgradePage user={user} />} /><Route path="saved-jobs" element={<SavedJobsPage />} /><Route path="applications" element={<ApplicationsPage />} /><Route path="recruiter/applications" element={<RecruiterApplicationsPage />} /><Route path="analytics" element={<AnalyticsPage />} /><Route path="profile" element={<ProfilePage key={user.id} user={user} />} /><Route path="settings" element={<ModulePage type="settings" />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></main></div>
}

function AuthLoading() {
  return <main className="auth-state-screen"><div className="auth-state-panel" role="status"><span className="eyebrow">SKILLPROOF AI</span><h1>Checking your session</h1><p>Please wait while we verify your sign-in.</p></div></main>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  return <Routes>
    <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    <Route path="/login" element={loading ? <AuthLoading /> : user ? <Navigate to="/dashboard" replace /> : <Login />} />
    <Route path="/register" element={loading ? <AuthLoading /> : user ? <Navigate to="/dashboard" replace /> : <Register />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/*" element={<ProtectedLayout />} />
  </Routes>
}

export default function RootApp() { return <AuthProvider><AppRoutes /></AuthProvider> }