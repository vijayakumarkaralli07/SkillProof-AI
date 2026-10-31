import { useEffect, useState } from 'react'
import { listMyNativeApplications, updateApplicantNativeApplication } from '../../services/nativeApplicationService.js'
import { applicationStatuses, lifecycleStatusLabel, statusHistoryDescription } from '../../constants/applicationLifecycle.js'

function submittedDate(value) {
  if (!value) return 'Date unavailable'
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function NativeApplicationCard({ application, onSaved }) {
  const [status, setStatus] = useState(application.status)
  const [applicantNote, setApplicantNote] = useState(application.applicantNote)
  const [followUpDate, setFollowUpDate] = useState(application.followUpDate)
  const [assessmentAt, setAssessmentAt] = useState(toLocalDateTime(application.assessmentAt))
  const [interviewAt, setInterviewAt] = useState(toLocalDateTime(application.interviewAt))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function saveLifecycle() {
    setSaving(true)
    setSaveError('')
    try {
      await updateApplicantNativeApplication(application.id, {
        status,
        applicantNote,
        followUpDate,
        assessmentAt: assessmentAt ? new Date(assessmentAt).toISOString() : null,
        interviewAt: interviewAt ? new Date(interviewAt).toISOString() : null,
      })
      await onSaved('Your tracker update was saved. Employer review is not independently verified.')
    } catch (error) {
      setSaveError(error.message || 'Application update could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const latestEvent = application.statusHistory?.[application.statusHistory.length - 1]
  const statusSource = {
    platform_submission: 'Submitted through SkillProof AI',
    employer_reported: 'Employer-reported manually',
    verified_employer_integration: 'Verified employer integration',
    student_reported: 'Student-reported · no ATS integration connected',
    system_backfill: 'Existing record · original source unavailable',
  }[latestEvent?.source] || 'Status source not recorded'

  return <article className="native-application-card" id={`native-application-${application.id}`}>
    <div className="native-application-card-heading">
      <div><h3>{application.jobTitle}</h3><p>{application.companyName}</p></div>
      <span className={`native-application-status status-${application.status}`}>{lifecycleStatusLabel(application.status, latestEvent?.source)}</span>
    </div>
    <p className="native-application-submitted">Submitted {submittedDate(application.submittedAt)} · {statusSource}</p>
    {application.recruiterNote && <p className="native-application-recruiter-note"><b>Employer-reported note:</b> {application.recruiterNote}</p>}

    <div className="native-lifecycle-controls">
      <label>Status
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {applicationStatuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label>Assessment date
        <input type="datetime-local" value={assessmentAt} onChange={(event) => setAssessmentAt(event.target.value)} />
      </label>
      <label>Interview date
        <input type="datetime-local" value={interviewAt} onChange={(event) => setInterviewAt(event.target.value)} />
      </label>
      <label>Follow-up reminder
        <input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
      </label>
      <label className="native-lifecycle-note">Private note
        <textarea value={applicantNote} maxLength="5000" rows="2" onChange={(event) => setApplicantNote(event.target.value)} />
      </label>
      <button type="button" className="application-detail-action" disabled={saving} onClick={() => void saveLifecycle()}>
        {saving ? 'Saving…' : 'Save tracker update'}
      </button>
    </div>
    {saveError && <p className="native-applications-state native-applications-error" role="alert">{saveError}</p>}
    <h4 className="native-lifecycle-history-heading">Status timeline</h4>
    {application.statusHistory?.length > 0
      ? <ol className="native-lifecycle-history">{application.statusHistory.map((entry) => {
        const event = statusHistoryDescription(entry)
        return <li key={event.id}><time>{event.time}</time><b>{event.title}</b><p>{event.description}</p></li>
      })}</ol>
      : <p className="application-details-empty">No status changes recorded.</p>}
  </article>
}

export default function NativeApplicationTracker() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadApplications(successMessage = '') {
    setError('')
    try {
      const items = await listMyNativeApplications()
      setApplications(items)
      if (successMessage) setNotice(successMessage)
      return true
    } catch (loadError) {
      setError(loadError.message || 'SkillProof AI applications could not be reloaded.')
      if (successMessage) setNotice(`${successMessage} The saved update is present, but its latest timeline could not be reloaded.`)
      return false
    }
  }

  useEffect(() => {
    let active = true
    listMyNativeApplications().then((items) => {
      if (active) {
        setApplications(items)
        setError('')
      }
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'SkillProof AI applications could not be loaded.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  return <section className="native-applications-section" aria-labelledby="native-applications-title">
    <div className="native-applications-heading">
      <div><span className="applications-eyebrow">SKILLPROOF AI EMPLOYER SUBMISSIONS</span><h2 id="native-applications-title">My SkillProof AI applications</h2></div>
      <p>These were submitted in-app to an employer-managed job. Employer dashboard updates are labeled separately from verified ATS events.</p>
    </div>
    {loading && <p className="native-applications-state" role="status">Loading your native applications…</p>}
    {error && <div className="native-applications-state native-applications-error" role="alert"><p>{error}</p><button type="button" className="application-detail-action" onClick={() => void loadApplications()}>Retry</button></div>}
    {notice && <p className="native-applications-state" role="status">{notice}</p>}
    {!loading && !error && applications.length === 0 && <p className="native-applications-state">No SkillProof AI employer applications yet. Applications you submit to managed jobs will appear here.</p>}
    <div className="native-applications-list">
      {applications.map((application) => <NativeApplicationCard
        application={application}
        key={`${application.id}-${application.updatedAt}`}
        onSaved={loadApplications}
      />)}
    </div>
  </section>
}
