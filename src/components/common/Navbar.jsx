import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowRight, Bell, Bookmark, BriefcaseBusiness, ChartNoAxesColumnIncreasing, ChevronDown, Code2, Crown, FileText, Goal, Headset, Home, Menu, MessageSquareText, Search, UserRound, UsersRound, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'

const navigation = [
  { label: 'Main menu', links: [['/dashboard', 'Home', Home, true], ['/jobs', 'Jobs', BriefcaseBusiness], ['/resume-studio', 'Resume Studio', FileText], ['/interview-prep', 'Interview Prep', MessageSquareText]] },
]

export default function Navbar({ user, onSignOut, mobileOpen, onToggleMobile, onNavigate }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [searchMessage, setSearchMessage] = useState('')
  const searchRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isJobsPage = location.pathname === '/jobs'
  const isDashboard = location.pathname === '/dashboard'
  const isApplicationsPage = location.pathname === '/applications' || location.pathname === '/recruiter/applications'
  const isAnalyticsPage = location.pathname === '/analytics'
  const isSavedJobsPage = location.pathname === '/saved-jobs'
  const hasRecruiterRole = user.user_metadata?.role === 'Recruiter'
  const isResumeWorkspace = ['/resume-studio', '/resume-scanner', '/resume-improver', '/job-specific-resume', '/saved-resumes'].includes(location.pathname)
  const isInterviewWorkspace = location.pathname.startsWith('/interview-prep')
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'Account'
  const firstName = displayName.split(/\s+/)[0]
  const jobsNavigation = [
    { label: 'Opportunities', links: [['/jobs', 'Jobs', BriefcaseBusiness, true], ['/applications', 'Applications', Activity], ...(hasRecruiterRole ? [['/recruiter/applications', 'Recruiter Applicants', UsersRound]] : []), ['/analytics', 'Analytics', ChartNoAxesColumnIncreasing], ['/saved-jobs', 'Saved Jobs', Bookmark]] },
  ]
  const applicationsNavigation = [
    { label: 'Main menu', links: [['/jobs', 'Jobs', BriefcaseBusiness], ['/applications', 'Applications', Activity, location.pathname === '/applications'], ...(hasRecruiterRole ? [['/recruiter/applications', 'Recruiter Applicants', UsersRound, location.pathname === '/recruiter/applications']] : []), ['/analytics', 'Analytics', ChartNoAxesColumnIncreasing], ['/saved-jobs', 'Saved Jobs', Bookmark]] },
  ]
  const analyticsNavigation = [
    { label: 'Main menu', links: [['/jobs', 'Jobs', BriefcaseBusiness], ['/applications', 'Applications', Activity], ['/analytics', 'Analytics', ChartNoAxesColumnIncreasing, true], ['/saved-jobs', 'Saved Jobs', Bookmark]] },
  ]
  const savedJobsNavigation = [
    { label: 'MAIN MENU', links: [['/jobs', 'Jobs', BriefcaseBusiness], ['/applications', 'Applications', Activity], ['/analytics', 'Analytics', ChartNoAxesColumnIncreasing], ['/saved-jobs', 'Saved Jobs', Bookmark, true]] },
  ]
  const resumeToolsNavigation = [
    { label: 'RESUME WORKSPACE', links: [
      ['/resume-studio', 'Resume Builder', FileText],
      ['/resume-scanner', 'Resume Scanner', Search],
      ['/resume-improver', 'AI Resume Improver', MessageSquareText],
      ['/job-specific-resume', 'Job-Specific Resume', ChartNoAxesColumnIncreasing],
      ['/saved-resumes', 'Saved Resumes', Bookmark],
    ] },
  ]
  const mainNavigation = [
    { label: 'Main menu', links: [
      ['/dashboard', 'Dashboard', Home, true],
      ['/jobs', 'Jobs', BriefcaseBusiness],
      ['/resume-studio', 'Resume Studio', FileText],
      ['/interview-prep', 'Interview Prep', MessageSquareText],
    ] },
  ]
  const interviewNavigation = [
    { label: 'INTERVIEW PREP', links: [
      ['/interview-prep/mock-interview', 'AI Mock Interview', Headset],
      ['/interview-prep/coding-knowledge', 'Test Your Coding Knowledge', Code2],
      ['/interview-prep/build-career', 'Build Your Career', Goal],
    ] },
  ]

  useEffect(() => {
    function focusSearch(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  async function logout() {
    setLogoutError('')
    try {
      await onSignOut()
      setProfileOpen(false)
      navigate('/login')
    } catch (error) {
      setLogoutError(error.message)
    }
  }

  function submitSearch(event) {
    event.preventDefault()
    if (searchRef.current?.value.trim()) {
      setSearchMessage('Search is not connected to live listings yet.')
    } else {
      searchRef.current?.focus()
    }
  }

  return <>
    <aside className={`workspace-sidebar${isJobsPage ? ' jobs-sidebar' : ''}${isSavedJobsPage ? ' saved-jobs-sidebar' : ''}${isResumeWorkspace ? ' resume-tools-sidebar' : ''}${isInterviewWorkspace ? ' interview-tools-sidebar' : ''}${mobileOpen ? ' is-open' : ''}`} aria-label="Sidebar navigation">
      <div className="sidebar-brand">
        <Logo compact />
        <button className="sidebar-close" type="button" onClick={onToggleMobile} aria-label="Close navigation"><X size={19} /></button>
      </div>
      <nav className="sidebar-nav">
        {(isDashboard ? mainNavigation : isInterviewWorkspace ? interviewNavigation : isJobsPage ? jobsNavigation : isApplicationsPage ? applicationsNavigation : isAnalyticsPage ? analyticsNavigation : isSavedJobsPage ? savedJobsNavigation : isResumeWorkspace ? resumeToolsNavigation : navigation).map((section) => <div className="sidebar-section" key={section.label}>
          {section.label && <span className="sidebar-section-label">{section.label}</span>}
          {section.links.map(([to, label, Icon, end]) => <NavLink
            key={to}
            to={to}
            state={isInterviewWorkspace && to === '/interview-prep/coding-knowledge' ? { returnTo: location.pathname } : undefined}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          ><Icon size={19} strokeWidth={2.1} /><span>{label}</span></NavLink>)}
        </div>)}
      </nav>
      <div className={`sidebar-bottom${isDashboard ? ' dashboard-sidebar-bottom' : ''}`}>
        <NavLink to="/profile" onClick={onNavigate} className={({ isActive }) => `sidebar-link profile-sidebar-link${isActive ? ' active' : ''}`}><UserRound size={19} strokeWidth={2.1} /><span>Profile</span></NavLink>
      <section className="upgrade-card">
        <div className="upgrade-icon"><Crown size={19} fill="currentColor" /></div>
        <h2>Upgrade to Pro</h2>
        <p>Unlock advanced tools and get better results.</p>
        <button type="button" onClick={() => navigate('/upgrade', { state: { returnTo: `${location.pathname}${location.search}` } })}>Upgrade Now <ArrowRight size={14} /></button>
      </section>
      </div>
    </aside>
    {mobileOpen && <button className="sidebar-scrim" type="button" onClick={onNavigate} aria-label="Close navigation" />}
    <header className="workspace-header">
      <button className="mobile-nav-toggle" type="button" onClick={onToggleMobile} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {isJobsPage || isDashboard || isApplicationsPage || isAnalyticsPage || isSavedJobsPage || isResumeWorkspace || isInterviewWorkspace ? <div className="workspace-header-spacer" aria-hidden="true" /> : <form className="workspace-search" role="search" onSubmit={submitSearch}>
        <Search size={19} aria-hidden="true" />
        <input ref={searchRef} type="search" placeholder="Search for jobs, companies or skills..." aria-label="Search jobs, companies or skills" onChange={() => setSearchMessage('')} />
        <button className="search-shortcut" type="button" aria-label="Focus search (Ctrl K)" onClick={() => searchRef.current?.focus()}>Ctrl K</button>
        {searchMessage && <span className="search-feedback" role="status">{searchMessage}</span>}
      </form>}
      <div className="header-actions">
        <div className="header-popover-anchor">
          <button className="icon-control notification-control" type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false) }}>
            <Bell size={20} /><i aria-hidden="true" />
          </button>
          {notificationsOpen && <div className="header-popover notification-popover"><b>Notifications</b><p>Notifications aren’t connected yet.</p></div>}
        </div>
        <span className="header-divider" />
        <div className="header-popover-anchor profile-anchor">
          <button className="profile-trigger" type="button" aria-expanded={profileOpen} onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false) }}>
            <span className="avatar">{displayName[0]?.toUpperCase() || 'S'}</span>
            <span className="profile-copy"><small>Welcome back,</small><strong>{firstName}</strong></span>
            <ChevronDown size={16} />
          </button>
          {profileOpen && <div className="header-popover profile-menu">
            <b>{displayName}</b>
            <span>{user.user_metadata?.role || 'Account'}</span>
            {logoutError && <span className="logout-error" role="alert">{logoutError}</span>}
            <button type="button" onClick={logout}>Log out</button>
          </div>}
        </div>
      </div>
    </header>
  </>
}
