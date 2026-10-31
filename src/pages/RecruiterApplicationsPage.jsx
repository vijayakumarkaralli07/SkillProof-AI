import { useEffect, useState } from 'react'
import { BriefcaseBusiness, FileText, RotateCcw } from 'lucide-react'
import SectionBackButton from '../components/common/SectionBackButton'
import { listEmployerNativeApplications, updateEmployerApplication } from '../services/nativeApplicationService.js'
import { applicationStatuses } from '../constants/applicationLifecycle.js'

function formatSubmittedAt(value) {
  if (!value) return 'Date unavailable'
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formattedJson(value) {
  return JSON.stringify(value ?? {}, null, 2)
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [notes, setNotes] = useState({})
  const [statusesById, setStatusesById] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadApplications() {
    setLoading(true)
    setError('')
    try {
      const records = await listEmployerNativeApplications()
      setApplications(records)
      setNotes(Object.fromEntries(records.map((record) => [record.id, record.recruiterNote || ''])))
      setStatusesById(Object.fromEntries(records.map((record) => [record.id, record.status])))
    } catch (loadError) {
      setError(loadError.message || 'Recruiter applications could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    listEmployerNativeApplications().then((records) => {
      if (!active) return
      setApplications(records)
      setNotes(Object.fromEntries(records.map((record) => [record.id, record.recruiterNote || ''])))
      setStatusesById(Object.fromEntries(records.map((record) => [record.id, record.status])))
      setError('')
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Recruiter applications could not be loaded.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function saveReview(application) {
    setSavingId(application.id)
    setError('')
    setNotice('')
    try {
      await updateEmployerApplication(application.id, {
        status: statusesById[application.id] || application.status,
        recruiterNote: notes[application.id] || '',
      })
      setNotice(`Review updated for ${application.jobTitle}.`)
    } catch (saveError) {
      setError(saveError.message || 'Application review could not be saved.')
    } finally {
      setSavingId('')
    }
  }

  return <div className="applications-page recruiter-applications-page">
    <SectionBackButton />
    <section className="applications-hero">
      <div className="applications-hero-copy">
        <span className="applications-eyebrow">EMPLOYER DASHBOARD</span>
        <h1>Review <span>Applicants</span></h1>
        <p>Applications are visible only to the employer account assigned to each SkillProof AI job. Dashboard status changes are employer-reported manually; no ATS integration is connected.</p>
      </div>
    </section>
    <div className="recruiter-applications-toolbar">
      <div><BriefcaseBusiness size={18} /><span>Native SkillProof AI applications</span></div>
      <button type="button" className="application-detail-action" onClick={() => void loadApplications()} disabled={loading}><RotateCcw size={15} />Refresh</button>
    </div>
    {error && <p className="native-applications-state native-applications-error" role="alert">{error}</p>}
    {notice && <p className="native-applications-state" role="status">{notice}</p>}
    {loading && <p className="native-applications-state" role="status">Loading applications assigned to this recruiter…</p>}
    {!loading && !error && applications.length === 0 && <div className="native-applications-state native-applications-empty"><h2>No assigned applications</h2><p>No native applications are currently assigned to this authenticated recruiter account. Job ownership is provisioned by an administrator; the editable registration role alone does not grant access.</p></div>}
    <div className="recruiter-applications-list">
      {applications.map((application) => <article className="recruiter-application-card" key={application.id} id={`application-${application.id}`}>
        <header className="recruiter-application-header">
          <div><span className="applications-eyebrow">{application.companyName}</span><h2>{application.jobTitle}</h2></div>
          <time dateTime={application.submittedAt}>{formatSubmittedAt(application.submittedAt)}</time>
        </header>
        <section className="recruiter-candidate-summary">
          <h3>Candidate</h3>
          <p><b>{application.applicant?.name}</b></p>
          <p><a href={`mailto:${encodeURIComponent(application.applicant?.email || '')}`}>{application.applicant?.email}</a>{application.applicant?.phone ? ` · ${application.applicant.phone}` : ''}</p>
          <p>Resume: {application.resumeTitle}</p>
        </section>
        <details className="recruiter-application-document">
          <summary><FileText size={16} />Review submitted resume</summary>
          <pre>{formattedJson(application.resume)}</pre>
        </details>
        <section className="recruiter-application-document">
          <h3>Cover letter</h3>
          <p className="recruiter-cover-letter">{application.coverLetter || 'No cover letter supplied.'}</p>
        </section>
        {Object.keys(application.answers || {}).length > 0 && <section className="recruiter-application-document">
          <h3>Job questions</h3>
          <dl className="recruiter-answer-list">{Object.entries(application.answers).map(([field, value]) => <div key={field}><dt>{field}</dt><dd>{value}</dd></div>)}</dl>
        </section>}
        <section className="recruiter-review-controls">
          <label>Status<select value={statusesById[application.id] || application.status} onChange={(event) => setStatusesById((current) => ({ ...current, [application.id]: event.target.value }))}>
            {applicationStatuses.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}
          </select></label>
          <label>Recruiter note<textarea value={notes[application.id] || ''} maxLength="5000" rows="3" onChange={(event) => setNotes((current) => ({ ...current, [application.id]: event.target.value }))} placeholder="Optional update visible to the applicant…" /></label>
          <button type="button" className="dialog-submit" disabled={savingId === application.id} onClick={() => void saveReview(application)}>{savingId === application.id ? 'Saving…' : 'Save review'}</button>
        </section>
      </article>)}
    </div>
  </div>
}
