import { lazy, Suspense, useState } from 'react'
import { Activity, Bell, ChevronDown, FileText, ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/common/Logo'
import InterviewPrepPage from './InterviewPrepPage'
import ResumeStudioPage from './ResumeStudioPage'
import ResumeScannerPage from './ResumeScannerPage'
import ResumeImproverPage from './ResumeImproverPage'
import JobSpecificResumePage from './JobSpecificResumePage'
import Navbar from '../components/common/Navbar'
import SectionBackButton from '../components/common/SectionBackButton'
const SavedResumesPage = lazy(() => import('./SavedResumesPage'))
const CareerJourneyPage = lazy(() => import('./CareerJourneyPage'))
const CareerDiscoveryPage = lazy(() => import('./CareerDiscoveryPage'))

const features = [
  { path: '/resume-studio', title: 'Resume Studio', subtitle: 'Create a job-specific resume with AI insights.', Icon: FileText },
  { path: '/interview-prep', title: 'Interview Prep', subtitle: 'Practice with sample questions by voice.', Icon: Activity },
]

export default function CareerToolsPage({ user, onSignOut }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'Account'
  const firstName = displayName.split(/\s+/)[0]
  const resumeTools = ['/resume-studio', '/resume-scanner', '/resume-improver', '/job-specific-resume', '/saved-resumes']
  const isResumeWorkspace = resumeTools.includes(location.pathname)
  const isInterviewWorkspace = location.pathname.startsWith('/interview-prep')
  const activePath = features.some((feature) => feature.path === location.pathname) ? location.pathname : '/resume-studio'

  function goBack() {
    if (location.state?.fromCareerTools && window.history.state?.idx > 0) navigate(-1)
    else navigate('/dashboard')
  }

  async function logout() {
    setLogoutError('')
    try {
      await onSignOut()
      navigate('/login')
    } catch (error) {
      setLogoutError(error.message)
    }
  }

  if (isResumeWorkspace) {
    return <div className="workspace-app career-resume-workspace">
      <Navbar user={user} onSignOut={onSignOut} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((open) => !open)} onNavigate={() => setMobileOpen(false)} />
      <main className="workspace-main career-resume-main">
        <SectionBackButton
          to="/dashboard"
          label="Back"
        />
        <div className="career-resume-content">
          {location.pathname === '/resume-studio' && <ResumeStudioPage />}
          {location.pathname === '/resume-scanner' && <ResumeScannerPage />}
          {location.pathname === '/resume-improver' && <ResumeImproverPage />}
          {location.pathname === '/job-specific-resume' && <JobSpecificResumePage />}
          {location.pathname === '/saved-resumes' && <Suspense fallback={<p role="status">Loading Saved Resumes…</p>}><SavedResumesPage /></Suspense>}
        </div>
      </main>
    </div>
  }

  if (isInterviewWorkspace) {
    const isInterviewLanding = location.pathname === '/interview-prep'
    const isCareerJourneyLanding = location.pathname === '/interview-prep/build-career' && !location.search
    return <div className="workspace-app career-resume-workspace interview-workspace">
      <Navbar user={user} onSignOut={onSignOut} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((open) => !open)} onNavigate={() => setMobileOpen(false)} />
      <main className="workspace-main career-resume-main">
        <div className="career-resume-content">
          {isInterviewLanding && <SectionBackButton to="/dashboard" label="Back" />}
          {isCareerJourneyLanding && <SectionBackButton to="/dashboard" label="Back" />}
          {location.pathname === '/interview-prep/build-career' && <Suspense fallback={<p role="status">Loading career journey…</p>}><CareerJourneyPage user={user} /></Suspense>}
          {location.pathname === '/interview-prep/build-career/discover' && <Suspense fallback={<p role="status">Loading career discovery…</p>}><CareerDiscoveryPage userId={user?.id} /></Suspense>}
          {!location.pathname.startsWith('/interview-prep/build-career') && <InterviewPrepPage dashboardMode />}
        </div>
      </main>
    </div>
  }

  return <div className="career-tools">
    <header className="career-tools-header">
      <Logo compact />
      <div className="career-tools-account">
        <div className="career-tools-popover-anchor">
          <button className="career-tools-icon-button" type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false) }}>
            <Bell size={19} /><i aria-hidden="true" />
          </button>
          {notificationsOpen && <div className="career-tools-popover"><b>Notifications</b><p>Notifications aren’t connected yet.</p></div>}
        </div>
        <span className="career-tools-divider" />
        <div className="career-tools-popover-anchor">
          <button className="career-tools-profile" type="button" aria-expanded={profileOpen} onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false) }}>
            <span className="career-tools-avatar">{displayName[0]?.toUpperCase() || 'S'}</span>
            <span><small>Welcome back,</small><strong>{firstName}</strong></span>
            <ChevronDown size={15} />
          </button>
          {profileOpen && <div className="career-tools-popover career-tools-profile-menu">
            <b>{displayName}</b><span>{user.user_metadata?.role || 'Account'}</span>
            {logoutError && <span className="career-tools-error" role="alert">{logoutError}</span>}
            <button type="button" onClick={logout}>Log out</button>
          </div>}
        </div>
      </div>
    </header>

    <main className="career-tools-main">
      <button className="career-tools-back" type="button" onClick={goBack}><ArrowLeft size={15} />Back</button>
      <nav className="career-tools-tabs career-tools-tabs-two" aria-label="Career tools">
        {features.map(({ path, title, subtitle, Icon }) => <button
          className={`career-tools-tab${activePath === path ? ' active' : ''}`}
          type="button"
          key={path}
          aria-current={activePath === path ? 'page' : undefined}
          onClick={() => navigate(path, { state: { fromCareerTools: true } })}
        >
          <Icon size={21} strokeWidth={2} />
          <span><b>{title}</b><small>{subtitle}</small></span>
        </button>)}
      </nav>
      <div className="career-tools-content" key={activePath}>
        {activePath === '/resume-studio' && <ResumeStudioPage />}
        {activePath === '/interview-prep' && <InterviewPrepPage />}
      </div>
    </main>
  </div>
}
