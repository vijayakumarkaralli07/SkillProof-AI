import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { listResumes } from '../../services/resumeService.js'
import { saveJobApplication } from '../../services/userDataService.js'

function currentDate() {
  return new Date().toISOString().slice(0, 10)
}

function applicationRecord(userId, job, resume, coverLetter, status, appliedAt = null) {
  const applicationLink = job.applicationLink || job.originalUrl
  return {
    id: `himalayas:${job.id}`,
    jobId: `himalayas:${job.id}`,
    title: job.title,
    company: job.company,
    location: job.location || 'Not specified',
    jobUrl: applicationLink,
    sourceType: 'himalayas',
    externalTrackingStatus: status === 'applied' ? 'user_confirmed_submitted' : 'prepared',
    status,
    appliedAt,
    isTemporaryDemo: false,
    applicantId: userId,
    resumeId: resume?.id || '',
    resumeTitle: resume?.name || '',
    coverLetter,
    externalSubmissionVerified: false,
  }
}

export default function HimalayasApplicationDialog({ job, user, onClose, onNotice }) {
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeReviewed, setResumeReviewed] = useState(false)
  const [eligibilityReviewed, setEligibilityReviewed] = useState(false)
  const [trackingConsent, setTrackingConsent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [continued, setContinued] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const selectedResume = resumes.find((resume) => resume.id === resumeId) || null
  const applicationLink = job.applicationLink || job.originalUrl

  useEffect(() => {
    let active = true
    listResumes().then((items) => {
      if (!active) return
      setResumes(items)
      setResumeId(items[0]?.id || '')
    }).catch((loadError) => {
      if (active) setError(`Saved resumes could not be loaded: ${loadError.message}`)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function saveExternalStatus(status, appliedAt = null) {
    if (!selectedResume || !eligibilityReviewed || !resumeReviewed || !trackingConsent) {
      setError('Select and review a saved resume, confirm you checked the job details, and allow private tracker storage.')
      return false
    }
    setSaving(true)
    setError('')
    try {
      const record = applicationRecord(user.id, job, selectedResume, coverLetter, status, appliedAt)
      await saveJobApplication(user.id, record)
      return true
    } catch (saveError) {
      setError(`External application tracking was not saved: ${saveError.message}`)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function recordPreparedApplication() {
    if (!selectedResume || !eligibilityReviewed || !resumeReviewed || !trackingConsent) {
      setError('Select and review a saved resume, confirm you checked the job details, and allow private tracker storage.')
      return
    }
    setContinued(true)
    const saved = await saveExternalStatus('preparing')
    const message = saved
      ? 'External application page opened. This is tracked as prepared only; SkillProof AI has not submitted it.'
      : 'External application page opened, but the prepared tracker record could not be saved.'
    setNotice(message)
    onNotice?.(message)
  }

  async function confirmSubmitted() {
    if (confirmed || saving) return
    const appliedAt = currentDate()
    const saved = await saveExternalStatus('applied', appliedAt)
    if (!saved) return
    setConfirmed(true)
    const message = 'You confirmed that you submitted this application on the Himalayas employer site. SkillProof AI did not verify the submission.'
    setNotice(message)
    onNotice?.(message)
  }

  return <div className="application-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
    <section className="application-dialog external-application-dialog" role="dialog" aria-modal="true" aria-labelledby="external-application-title">
      <div className="application-dialog-heading">
        <div><span className="applications-eyebrow">EXTERNAL APPLICATION · HIMALAYAS</span><h2 id="external-application-title">Prepare your application</h2></div>
        <button type="button" aria-label="Close application preparation" onClick={onClose} disabled={saving}><X size={19} /></button>
      </div>
      <p className="native-application-job-summary">{job.title} · {job.company} · Himalayas listing</p>
      <p className="external-application-notice">SkillProof AI does not upload your resume or cover letter to Himalayas or the employer. Continuing opens the provider’s exact application link; you decide what to submit there. The employer’s site controls eligibility and submission.</p>
      {loading ? <p role="status">Loading your saved resumes…</p> : <>
        {error && <p className="form-message error-message" role="alert">{error}</p>}
        <label>Saved resume
          <select value={resumeId} onChange={(event) => { setResumeId(event.target.value); setResumeReviewed(false) }} required>
            <option value="">Choose a saved resume</option>
            {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.name}{resume.type === 'job-tailored' ? ` · Tailored${resume.jobTitle ? ` for ${resume.jobTitle}` : ''}` : ''}</option>)}
          </select>
        </label>
        {resumes.length === 0 && <p className="application-details-empty">No saved resumes found. Save a resume in Resume Studio before preparing an application.</p>}
        {selectedResume && <label className="native-review-check"><input type="checkbox" checked={resumeReviewed} onChange={(event) => setResumeReviewed(event.target.checked)} />I reviewed this resume and want to use it for this application.</label>}
        {selectedResume && <details className="application-resume-preview"><summary>Preview saved resume content</summary><pre>{JSON.stringify(selectedResume.content, null, 2)}</pre></details>}
        <label>Cover letter <span>(optional)</span><textarea value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} rows="5" maxLength="20000" placeholder="Prepare an editable cover letter…" /></label>
        <label className="native-review-check"><input type="checkbox" checked={eligibilityReviewed} onChange={(event) => setEligibilityReviewed(event.target.checked)} />I reviewed the job details and will check the employer’s eligibility requirements on its application site.</label>
        <label className="native-review-check"><input type="checkbox" checked={trackingConsent} onChange={(event) => setTrackingConsent(event.target.checked)} />Save the selected resume reference and cover letter in my private SkillProof AI application tracker. No resume file is uploaded.</label>
        {notice && <p className="form-message auth-notice" role="status">{notice}</p>}
        <div className="application-dialog-actions">
          <button type="button" className="dialog-cancel" onClick={onClose}>Close</button>
          <a className="dialog-submit external-continue-link" href={applicationLink} target="_blank" rel="noopener noreferrer" onClick={(event) => {
            if (!applicationLink || !selectedResume || !resumeReviewed || !eligibilityReviewed || !trackingConsent || saving) {
              event.preventDefault()
              setError('Select and review a saved resume, check the job details, and allow private tracker storage before continuing.')
              return
            }
            void recordPreparedApplication()
          }}>Continue to Apply on Himalayas <ExternalLink size={15} /></a>
        </div>
        {continued && <div className="external-confirmation">
          <p>After returning from the employer site, confirm only if you completed its submission. This status is your confirmation, not independent verification.</p>
          <button type="button" className="dialog-submit" disabled={saving || confirmed} onClick={confirmSubmitted}>{saving ? 'Saving…' : confirmed ? 'Submission confirmed by you' : 'I submitted on the employer site'}</button>
        </div>}
      </>}
    </section>
  </div>
}
