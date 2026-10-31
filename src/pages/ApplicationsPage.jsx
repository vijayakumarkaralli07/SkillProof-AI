import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BriefcaseBusiness, CalendarDays, Check, ChevronDown, Clock3, EllipsisVertical,
  Filter, MapPin, RotateCcw, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { loadJobApplications, saveJobApplication } from '../services/userDataService.js'
import SectionBackButton from '../components/common/SectionBackButton'
import NativeApplicationTracker from '../components/applications/NativeApplicationTracker.jsx'
import { applicationStatuses, lifecycleStatusLabel, statusHistoryDescription } from '../constants/applicationLifecycle.js'

const statuses = applicationStatuses
const emptyApplications = []

const stages = [
  { id: 'applied', label: 'Applied' },
  { id: 'under_review', label: 'Review' },
  { id: 'interview', label: 'Interview' },
  { id: 'decision', label: 'Decision' },
]

function statusLabel(status) {
  return lifecycleStatusLabel(status)
}

function formatDate(date) {
  if (!date) return '—'
  const parsed = new Date(date.length === 10 ? `${date}T12:00:00` : date)
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toLocalDateTimeInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function CompanyMark({ company }) {
  const initial = company?.slice(0, 1).toUpperCase() || '?'
  return <span className="application-company-mark" aria-label={`${company || 'Company'} icon`}>{initial}</span>
}

function ApplicationProgress({ application }) {
  if (application.status === 'rejected' || application.status === 'withdrawn') {
    return <div className={`terminal-progress terminal-${application.status}`}>
      <span className="terminal-dot"><X size={12} /></span>
      <span>{application.status === 'rejected' ? 'Not selected' : 'Withdrawn'} · terminal status</span>
    </div>
  }

  const stageForStatus = { saved: -1, preparing: -1, applied: 0, assessment: 1, under_review: 1, interview: 2, offer: 3, rejected: 3, withdrawn: 3 }
  const completedStage = stageForStatus[application.status] ?? -1
  const stageDates = [
    formatDate(application.appliedAt),
    application.status !== 'applied' ? 'Updated' : '',
    application.interviewAt ? formatDate(application.interviewAt.slice(0, 10)) : '',
    application.status === 'offer' ? 'Offer' : '',
  ]

  return <div className="application-progress" aria-label={`Application progress: ${statusLabel(application.status)}`}>
    {stages.map((stage, index) => {
      const complete = index <= completedStage
      const current = index === completedStage
      return <div className={`progress-stage${complete ? ' complete' : ''}${current ? ' current' : ''}`} key={stage.id}>
        <span className="progress-marker">{complete && <Check size={11} strokeWidth={3} />}</span>
        <span className="progress-stage-label">{stage.label}</span>
        <small>{stageDates[index]}</small>
        {index < stages.length - 1 && <span className={`progress-connector${index < completedStage ? ' complete' : ''}`} />}
      </div>
    })}
  </div>
}

function StatusPanel({ application, onOpenDetails }) {
  const sourceLabel = application.sourceType === 'himalayas'
    ? application.externalTrackingStatus === 'user_confirmed_submitted' ? ' · Himalayas · User-confirmed' : ' · Himalayas · Preparing'
    : ' · Your tracker'
  if (application.status === 'preparing' || application.status === 'saved') {
    return <div className="application-status-panel status-applied">
      <Clock3 size={17} />
      <span><b>{statusLabel(application.status)}{sourceLabel}</b><small>{application.status === 'preparing' && application.sourceType === 'himalayas' ? 'The external application link was opened. Submission has not been confirmed.' : 'No automatic status change will occur.'}</small></span>
    </div>
  }
  if (application.status === 'interview') {
    const interviewDate = application.interviewAt ? new Date(application.interviewAt) : null
    return <button className="application-status-panel status-interview" type="button" onClick={() => onOpenDetails(application)} aria-label={`View interview details for ${application.title} at ${application.company}`}>
      <CalendarDays size={17} />
      <span><b>Next Interview{sourceLabel}</b><strong>{interviewDate ? interviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set'}</strong><small>{interviewDate ? interviewDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : 'No interview time recorded'}</small></span>
      <ArrowRight size={15} />
    </button>
  }
  if (application.status === 'assessment') {
    return <button className="application-status-panel status-review" type="button" onClick={() => onOpenDetails(application)} aria-label={`View assessment details for ${application.title} at ${application.company}`}>
      <Clock3 size={17} />
      <span><b>Assessment{sourceLabel}</b><small>{application.assessmentAt ? new Date(application.assessmentAt).toLocaleString() : 'Assessment date not set'}</small></span>
      <ArrowRight size={15} />
    </button>
  }
  if (application.status === 'offer') {
    return <button className="application-status-panel status-offer" type="button" onClick={() => onOpenDetails(application)} aria-label={`View offer details for ${application.title} at ${application.company}`}>
      <ShieldCheck size={17} />
      <span><b>Offer status{sourceLabel}</b><small>Tracked by you; employer status is unverified.</small></span>
      <ArrowRight size={15} />
    </button>
  }
  if (application.status === 'under_review') {
    return <button className="application-status-panel status-review" type="button" onClick={() => onOpenDetails(application)} aria-label={`View application details for ${application.title} at ${application.company}`}>
      <Sparkles size={17} />
      <span><b>In Review{sourceLabel}</b><small>This is a user-entered status, not an employer update.</small></span>
      <ArrowRight size={15} />
    </button>
  }
  if (application.status === 'rejected' || application.status === 'withdrawn') {
    return <div className={`application-status-panel status-${application.status}`}>
      <X size={17} />
      <span><b>{statusLabel(application.status)}{sourceLabel}</b><small>This is a user-tracked status; it does not update the employer.</small></span>
    </div>
  }
  return <div className="application-status-panel status-applied">
    <Clock3 size={17} />
    <span><b>{statusLabel(application.status)}{sourceLabel}</b><small>{application.sourceType === 'himalayas' ? 'Submission is user-confirmed only; SkillProof AI has not independently verified it.' : 'Tracked by you; employer status is not independently verified.'}</small></span>
  </div>
}

function ApplicationActionsMenu({ application, onStatusChange, onToggleDetails }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!menuOpen) return undefined
    function positionMenu() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({
        top: Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 130)),
        left: Math.max(8, Math.min(rect.right - 170, window.innerWidth - 178)),
      })
    }
    function closeOnOutsideClick(event) {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
      }
    }
    positionMenu()
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', positionMenu)
    window.addEventListener('scroll', positionMenu, true)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', positionMenu)
      window.removeEventListener('scroll', positionMenu, true)
    }
  }, [menuOpen])

  return <div className="application-card-menu">
    <button ref={triggerRef} className="application-menu-trigger" type="button" aria-label={`Actions for ${application.title}`} aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((open) => !open)}><EllipsisVertical size={18} /></button>
    {menuOpen && createPortal(<div ref={menuRef} className="application-menu application-menu-portal" role="menu" style={{ top: position.top, left: position.left }}>
      <button type="button" role="menuitem" onClick={() => { onToggleDetails(); setMenuOpen(false) }}>View details</button>
      <label>Update tracked status<select aria-label={`Update tracked status for ${application.title}`} value={application.status} onChange={(event) => { onStatusChange(application.id, event.target.value); setMenuOpen(false) }}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
      <small>Saved to your account; employer status is not verified</small>
    </div>, document.body)}
  </div>
}

function ApplicationCard({ application, onStatusChange, onOpenDetails }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  return <article className="application-card">
    <CompanyMark company={application.company} />
    <div className="application-card-main">
      <div className="application-job-heading">
        <div>
          <h3>{application.title}</h3>
          <p>{application.company}{application.location && <span className="application-location"><MapPin size={12} />{application.location}</span>}{application.employmentType && <span className="application-type"><BriefcaseBusiness size={12} />{application.employmentType}</span>}</p>
          <small>{application.status === 'applied' ? 'Applied on' : 'Tracked since'} {formatDate(application.appliedAt)} · Your tracker</small>
          {(application.assessmentAt || application.followUpDate) && <small>{application.assessmentAt ? `Assessment ${new Date(application.assessmentAt).toLocaleString()}` : ''}{application.assessmentAt && application.followUpDate ? ' · ' : ''}{application.followUpDate ? `Follow-up ${formatDate(application.followUpDate)}` : ''}</small>}
        </div>
      </div>
      <div className="application-card-middle">
        <ApplicationProgress application={application} />
        <StatusPanel application={application} onOpenDetails={onOpenDetails} />
      </div>
      {detailsOpen && <div className="application-details">
        <b>Application details</b>
        <span>Status: {statusLabel(application.status)} · not verified by the employer</span>
        {application.jobUrl && <a href={application.jobUrl} target="_blank" rel="noreferrer">Job posting link <ArrowRight size={12} /></a>}
        {!application.jobUrl && <span>No job posting link provided.</span>}
      </div>}
    </div>
    <ApplicationActionsMenu
      application={application}
      onStatusChange={onStatusChange}
      onToggleDetails={() => setDetailsOpen((open) => !open)}
    />
  </article>
}

function ApplicationDetailsPanel({ application, onClose, onUpdate }) {
  const closeButtonRef = useRef(null)
  const panelRef = useRef(null)
  const [notes, setNotes] = useState(application.notes ?? '')
  const [followUpDate, setFollowUpDate] = useState(application.followUpDate ?? '')
  const [status, setStatus] = useState(application.status)
  const [assessmentAt, setAssessmentAt] = useState(toLocalDateTimeInput(application.assessmentAt))
  const [interviewDate, setInterviewDate] = useState(application.interviewAt?.slice(0, 10) ?? '')
  const [interviewTime, setInterviewTime] = useState(application.interviewAt?.slice(11, 16) ?? '')
  const [timeZone, setTimeZone] = useState(application.interviewAt?.match(/([+-]\d{2}:\d{2}|Z)$/)?.[1] ?? '')
  const [notice, setNotice] = useState('')
  const history = application.statusHistory ?? []
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    closeButtonRef.current?.focus()
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'Tab') {
        const focusable = [...(panelRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]') ?? [])]
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  async function updateRecord(changes, message) {
    setSaving(true)
    setNotice('')
    try {
      const saved = await onUpdate(application.id, { ...changes, updatedAt: new Date().toISOString() })
      if (saved === false) return false
      setNotice(message)
      return true
    } catch (error) {
      setNotice(error.message || 'Application changes could not be saved.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveNotes() {
    await updateRecord({ notes }, 'Private notes saved to your account tracker.')
  }

  async function saveFollowUpDate() {
    await updateRecord({ followUpDate }, 'Follow-up date saved to your account tracker.')
  }

  async function saveInterviewDetails() {
    if (!interviewDate || !interviewTime) {
      setNotice('Enter both an interview date and time.')
      return
    }
    const zone = timeZone.trim()
    if (zone && zone !== 'Z' && !/^[+-]\d{2}:\d{2}$/.test(zone)) {
      setNotice('Use a timezone offset such as +05:30, -04:00, or Z.')
      return
    }
    const interviewAt = new Date(`${interviewDate}T${interviewTime}:00${zone}`).toISOString()
    await updateRecord({ interviewAt }, 'Interview details saved to your account tracker; this does not update the employer.')
  }

  async function saveAssessmentDetails() {
    if (!assessmentAt) {
      setNotice('Enter an assessment date and time.')
      return
    }
    await updateRecord({ assessmentAt: new Date(assessmentAt).toISOString() }, 'Assessment date saved to your tracker; this does not update the employer.')
  }

  async function changeStatus(nextStatus) {
    const saved = await updateRecord({ status: nextStatus }, 'Status saved as student-reported; it is not an employer update.')
    if (saved) setStatus(nextStatus)
  }

  async function markInterviewCompleted() {
    const note = `${notes}${notes ? '\n' : ''}Interview marked completed by me on ${new Date().toLocaleString()}.`
    setNotes(note)
    await updateRecord({ interviewCompleted: true, notes: note }, 'Interview completion saved to your tracker; this does not update the employer.')
  }

  return createPortal(<div className="application-details-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside ref={panelRef} className="application-details-panel" role="dialog" aria-modal="true" aria-labelledby="application-details-title" tabIndex="-1">
          <header className="application-details-header">
        <div><span className="applications-eyebrow">APPLICATION DETAILS</span><h2 id="application-details-title">{application.title}</h2><p>{application.company} · {application.location}</p></div>
        <button ref={closeButtonRef} type="button" aria-label="Close application details" onClick={onClose}><X size={19} /></button>
      </header>
      <div className="application-details-scroll">
        <p className="application-details-notice">{application.sourceType === 'himalayas' ? application.externalTrackingStatus === 'user_confirmed_submitted' ? 'You confirmed submission on the Himalayas employer site. SkillProof AI stores your confirmation but does not independently verify external submission.' : 'This Himalayas application is only prepared. No external submission has been confirmed.' : 'This is your account application tracker. Status and notes are stored for your authenticated account; they do not change the external employer application.'}</p>
        <section className="application-details-section">
          <h3>Application overview</h3>
          <dl className="application-details-facts">
            <div><dt>Current status</dt><dd>{statusLabel(status)}</dd></div>
            <div><dt>Applied</dt><dd>{formatDate(application.appliedAt)}</dd></div>
            {application.assessmentAt && <div><dt>Assessment</dt><dd>{new Date(application.assessmentAt).toLocaleString()}</dd></div>}
            {application.interviewAt && <div><dt>Interview</dt><dd>{new Date(application.interviewAt).toLocaleString()}</dd></div>}
            {application.followUpDate && <div><dt>Follow-up reminder</dt><dd>{formatDate(application.followUpDate)}</dd></div>}
            {['offer', 'rejected', 'withdrawn'].includes(status) && <div><dt>Decision</dt><dd>{statusLabel(status)}</dd></div>}
            {application.employmentType && <div><dt>Employment type</dt><dd>{application.employmentType}</dd></div>}
            {application.workMode && <div><dt>Work mode</dt><dd>{application.workMode}</dd></div>}
            {application.updatedAt && <div><dt>Last updated</dt><dd>{formatDate(application.updatedAt.slice(0, 10))}</dd></div>}
            {application.jobUrl && <div><dt>Job posting</dt><dd><a href={application.jobUrl} target="_blank" rel="noreferrer">Open provided link <ArrowRight size={12} /></a></dd></div>}
          </dl>
        </section>

        {application.status === 'interview' && <section className="application-details-section">
          <h3>Interview details</h3>
          {application.interviewAt ? <p className="application-details-interview-time">{formatDate(interviewDate)} at {interviewTime}{timeZone ? ` (UTC${timeZone === 'Z' ? '' : timeZone})` : ''}</p> : <p className="application-details-empty">No interview is scheduled for this record.</p>}
          <div className="application-details-interview-form">
            <label>Interview date<input type="date" value={interviewDate} onChange={(event) => setInterviewDate(event.target.value)} /></label>
            <label>Time<input type="time" value={interviewTime} onChange={(event) => setInterviewTime(event.target.value)} /></label>
            <label>Timezone offset<input value={timeZone} onChange={(event) => setTimeZone(event.target.value)} placeholder="e.g. +05:30" /></label>
            <button type="button" className="application-detail-action" onClick={saveInterviewDetails}>Save interview details</button>
          </div>
          <button type="button" className="application-detail-secondary" disabled={application.interviewCompleted} onClick={markInterviewCompleted}>{application.interviewCompleted ? 'Interview marked completed' : 'Mark interview as completed'}</button>
        </section>}

        {(application.status === 'assessment' || application.assessmentAt) && <section className="application-details-section">
          <h3>Assessment details</h3>
          {application.assessmentAt && <p className="application-details-interview-time">{new Date(application.assessmentAt).toLocaleString()}</p>}
          <label className="application-details-field">Assessment date and time<input type="datetime-local" value={assessmentAt} onChange={(event) => setAssessmentAt(event.target.value)} /></label>
          <button type="button" className="application-detail-action" disabled={saving} onClick={() => void saveAssessmentDetails()}>Save assessment date</button>
        </section>}

        <section className="application-details-section">
          <h3>Progress</h3>
          <ApplicationProgress application={application} />
        </section>

        <section className="application-details-section">
          <h3>Update status</h3>
          <label className="application-details-field">Status<select disabled={saving} value={status} onChange={(event) => void changeStatus(event.target.value)}>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          {application.status !== 'interview' && <div className="application-details-field application-followup-field"><label htmlFor="application-follow-up">Follow-up date</label><input id="application-follow-up" type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} /><button type="button" className="application-detail-action" onClick={saveFollowUpDate}>Save follow-up date</button></div>}
        </section>

        <section className="application-details-section">
          <h3>Notes</h3>
          <label className="application-details-field" htmlFor="application-notes">Private notes<textarea id="application-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="Add a note for yourself…" /></label>
          <button type="button" className="application-detail-action" onClick={saveNotes}>Save notes</button>
        </section>

        <section className="application-details-section">
          <h3>Status history</h3>
          {history.length > 0 ? <ol className="application-history-list">{history.map((item) => {
            const event = item.changedAt ? statusHistoryDescription(item) : item
            return <li key={event.id}><time>{event.time}</time><b>{event.title}</b><p>{event.description}</p></li>
          })}</ol> : <p className="application-details-empty">No status history is recorded for this tracker entry.</p>}
        </section>
      </div>
      {notice && <p className="application-details-live-notice" role="status">{notice}</p>}
    </aside>
  </div>, document.body)
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sort, setSort] = useState('recent')
  const [selectedApplicationId, setSelectedApplicationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [loadedUserId, setLoadedUserId] = useState('')
  const detailsTriggerRef = useRef(null)
  const loadRequestRef = useRef(0)

  const reloadApplications = useCallback(async () => {
    const requestId = ++loadRequestRef.current
    setLoading(true)
    setLoadError('')
    if (!user?.id) {
      setApplications([])
      setLoadedUserId('')
      setLoading(false)
      return
    }
    try {
      const records = await loadJobApplications(user.id)
      if (requestId === loadRequestRef.current) {
        setApplications(records)
        setLoadedUserId(user.id)
      }
    } catch (error) {
      if (requestId === loadRequestRef.current) {
        setApplications([])
        setLoadedUserId(user.id)
        setLoadError(error.message || 'Your application records could not be loaded.')
      }
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    const requestId = ++loadRequestRef.current
    loadJobApplications(user.id).then((records) => {
      if (!active || requestId !== loadRequestRef.current) return
      setApplications(records)
      setLoadedUserId(user.id)
      setLoadError('')
    }).catch((error) => {
      if (!active || requestId !== loadRequestRef.current) return
      setApplications([])
      setLoadedUserId(user.id)
      setLoadError(error.message || 'Your application records could not be loaded.')
    }).finally(() => {
      if (active && requestId === loadRequestRef.current) setLoading(false)
    })
    return () => {
      active = false
      loadRequestRef.current += 1
    }
  }, [user?.id])

  const isLoading = loading || Boolean(user?.id && loadedUserId !== user.id)
  const userApplications = loadedUserId === user?.id ? applications : emptyApplications
  const visibleError = loadedUserId === user?.id ? loadError : ''
  const companies = useMemo(() => [...new Set(userApplications.map((application) => application.company).filter(Boolean))].sort(), [userApplications])
  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = userApplications.filter((application) => {
      const searchMatch = !query || [application.title, application.company, application.location].some((value) => String(value || '').toLowerCase().includes(query))
      const statusMatch = !statusFilter || application.status === statusFilter
      const companyMatch = !companyFilter || application.company === companyFilter
      const dateValue = application.appliedAt || application.createdAt
      const appliedAt = dateValue ? Date.parse(`${dateValue.slice(0, 10)}T00:00:00Z`) : Number.NaN
      const daysOld = Number.isFinite(appliedAt) ? (Date.now() - appliedAt) / 86400000 : null
      const dateMatch = !dateFilter || (daysOld !== null && (dateFilter === '7' ? daysOld <= 7 : dateFilter === '30' ? daysOld <= 30 : daysOld > 30))
      return searchMatch && statusMatch && companyMatch && dateMatch
    })
    if (sort === 'oldest') filtered.sort((a, b) => (a.appliedAt || a.createdAt || '').localeCompare(b.appliedAt || b.createdAt || ''))
    if (sort === 'company') filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''))
    if (sort === 'title') filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    if (sort === 'recent') filtered.sort((a, b) => (b.appliedAt || b.createdAt || '').localeCompare(a.appliedAt || a.createdAt || ''))
    return filtered
  }, [userApplications, companyFilter, dateFilter, search, sort, statusFilter])

  const selectedApplication = userApplications.find((application) => application.id === selectedApplicationId)

  async function updateStatus(id, status) {
    try {
      await updateApplication(id, { status })
    } catch (error) {
      setNotice(`Status update could not be saved: ${error.message}`)
    }
  }

  async function updateApplication(id, changes) {
    const targetApplication = applications.find((application) => application.id === id)
    if (!targetApplication) throw new Error('This application is no longer available in your tracker.')

    let update = { ...changes, updatedAt: new Date().toISOString() }
    if (targetApplication.sourceType === 'himalayas' && changes.status === 'applied') {
      if (targetApplication.externalTrackingStatus !== 'user_confirmed_submitted'
        && !window.confirm('Confirm that you completed the application on the Himalayas employer site. SkillProof AI cannot verify the submission.')) {
        return false
      }
      update = {
        ...update,
        externalTrackingStatus: 'user_confirmed_submitted',
        appliedAt: targetApplication.appliedAt || new Date().toISOString().slice(0, 10),
      }
    }
    const updated = { ...targetApplication, ...update }
    await saveJobApplication(user.id, updated)
    setApplications((current) => current.map((application) => application.id === id ? updated : application))
    try {
      const records = await loadJobApplications(user.id)
      const persisted = records.find((application) => application.id === id) || updated
      setApplications((current) => current.map((application) => application.id === id ? persisted : application))
      setNotice('Application update saved.')
    } catch (error) {
      setNotice(`Application update was saved, but its latest timeline could not be reloaded: ${error.message}`)
    }
    return true
  }

  function openDetails(application, trigger) {
    detailsTriggerRef.current = trigger
    setSelectedApplicationId(application.id)
  }

  const closeDetails = useCallback(() => {
    setSelectedApplicationId(null)
    detailsTriggerRef.current?.focus()
  }, [])

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setCompanyFilter('')
    setDateFilter('')
  }

  return <div className="applications-page">
    <SectionBackButton />
    <section className="applications-hero">
      <div className="applications-hero-copy">
        <span className="applications-eyebrow">APPLICATION TRACKER</span>
        <h1>Track Your <span>Job Applications</span></h1>
        <p>Stay organized, track your progress and never miss an opportunity.</p>
      </div>
      <div className="application-hero-art" aria-hidden="true">
        <div className="application-orbit orbit-one" />
        <div className="application-orbit orbit-two" />
        <div className="application-document"><span className="document-avatar" /><i /><i /><i /><i /><b /></div>
        <div className="application-plane"><ArrowRight size={35} fill="currentColor" /></div>
        <span className="application-float-label apply-label">Apply</span>
        <span className="application-float-label track-label">Track</span>
        <span className="application-float-label hired-label">Get Hired</span>
        <Sparkles className="application-art-spark spark-a" size={15} />
        <Sparkles className="application-art-spark spark-b" size={12} />
      </div>
    </section>

    <NativeApplicationTracker />

    {notice && <p className="native-applications-state" role="status">{notice}</p>}
    {!visibleError && !isLoading && userApplications.length > 0 && <div className="application-toolbar">
      <label className="application-search"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications (job title, company, or location)..." aria-label="Search applications" /></label>
      <label className="application-select"><Filter size={15} /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All Statuses</option>{statuses.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}</select><ChevronDown size={14} /></label>
      <label className="application-select"><CalendarDays size={15} /><select aria-label="Filter by application date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option value="">Date Applied</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="older">Older than 30 days</option></select><ChevronDown size={14} /></label>
      <label className="application-select company-select"><BriefcaseBusiness size={15} /><select aria-label="Filter by company" value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)}><option value="">All Companies</option>{companies.map((company) => <option key={company} value={company}>{company}</option>)}</select><ChevronDown size={14} /></label>
      <button className="clear-application-filters" type="button" onClick={clearFilters}><RotateCcw size={15} />Clear Filters</button>
    </div>}

    <section className="applications-list-panel">
        <div className="applications-list-heading">
          <div><h2>External tracker records <span>({isLoading || visibleError ? '—' : userApplications.length})</span></h2><small>Himalayas and other external applications saved to your account</small></div>
          {!isLoading && !visibleError && userApplications.length > 0 && <label className="application-sort"><span>Sort by:</span><span><select aria-label="Sort applications" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recent">Most Recent</option><option value="oldest">Oldest</option><option value="company">Company Name</option><option value="title">Job Title</option></select><ChevronDown size={14} /></span></label>}
        </div>
        <div className="application-record-list" aria-live="polite">
          {isLoading && <p className="native-applications-state" role="status">Loading your saved applications…</p>}
          {visibleError && <div className="applications-empty-state" role="alert"><b>Applications could not be loaded</b><p>{visibleError}</p><button type="button" onClick={() => void reloadApplications()}>Retry</button></div>}
          {!isLoading && !visibleError && userApplications.length === 0 && <div className="applications-empty-state"><b>No external applications tracked yet</b><p>Find an opportunity and prepare your application from Jobs.</p><Link className="dialog-submit" to="/jobs">Browse Jobs <ArrowRight size={14} /></Link></div>}
          {!isLoading && !visibleError && userApplications.length > 0 && filteredApplications.map((application) => <ApplicationCard key={application.id} application={application} onStatusChange={updateStatus} onOpenDetails={openDetails} />)}
          {!isLoading && !visibleError && userApplications.length > 0 && filteredApplications.length === 0 && <div className="applications-empty-state"><Search size={24} /><b>No applications match these filters</b><p>Try adjusting your search or filters.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
        </div>
      </section>
    {selectedApplication && <ApplicationDetailsPanel
      key={`${selectedApplication.id}-${selectedApplication.updatedAt}`}
      application={selectedApplication}
      onClose={closeDetails}
      onUpdate={updateApplication}
    />}
  </div>
}
