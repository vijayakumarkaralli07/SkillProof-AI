import { useEffect, useMemo, useState } from 'react'
import { Check, FileText, X } from 'lucide-react'
import { loadProfileForUser } from '../../services/profileService.js'
import { listResumes } from '../../services/resumeService.js'
import { submitNativeApplication } from '../../services/nativeApplicationService.js'

export default function NativeApplicationDialog({ job, user, onClose, onSubmitted }) {
  const [profile, setProfile] = useState({ name: '', email: user.email || '', phone: '' })
  const [resumes, setResumes] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [answers, setAnswers] = useState({})
  const [resumeReviewed, setResumeReviewed] = useState(false)
  const [submissionConfirmed, setSubmissionConfirmed] = useState(false)
  const [step, setStep] = useState('edit')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const selectedResume = useMemo(() => resumes.find((resume) => resume.id === resumeId) || null, [resumeId, resumes])
  const requiredFields = Array.isArray(job.required_fields) ? job.required_fields : []

  useEffect(() => {
    let active = true
    Promise.all([loadProfileForUser(user), listResumes()]).then(([savedProfile, savedResumes]) => {
      if (!active) return
      setProfile({
        name: savedProfile.name || user.user_metadata?.full_name || '',
        email: user.email || savedProfile.email || '',
        phone: savedProfile.phone || '',
      })
      setResumes(savedResumes)
      setResumeId(savedResumes[0]?.id || '')
      setLoadError('')
    }).catch((loadFailure) => {
      if (active) setLoadError(loadFailure.message || 'Your profile and saved resumes could not be loaded.')
    }).finally(() => {
      if (active) setProfileLoading(false)
    })
    return () => { active = false }
  }, [user])

  function setAnswer(fieldId, value) {
    setAnswers((current) => ({ ...current, [fieldId]: value }))
  }

  function validateAndReview(event) {
    event.preventDefault()
    setError('')
    if (!profile.name.trim() || !profile.email.trim()) {
      setError('Your name and account email are required.')
      return
    }
    if (!selectedResume) {
      setError('Save a resume in Resume Studio before applying to this job.')
      return
    }
    if (!resumeReviewed) {
      setError('Review the selected resume before continuing.')
      return
    }
    const missing = requiredFields.find((field) => field.required && !String(answers[field.id] || '').trim())
    if (missing) {
      setError(`Complete the required field: ${missing.label}`)
      return
    }
    setStep('review')
  }

  async function submitApplication() {
    if (!submissionConfirmed || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const application = await submitNativeApplication({
        jobId: job.id,
        resumeId,
        applicantProfile: profile,
        coverLetter,
        answers,
        resumeReviewed,
      })
      setSuccess(application)
      onSubmitted?.(application)
    } catch (submissionError) {
      setError(submissionError.message || 'Your application could not be submitted. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="application-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose() }}>
    <section className="application-dialog native-application-dialog" role="dialog" aria-modal="true" aria-labelledby="native-application-title">
      <div className="application-dialog-heading">
        <div><span className="applications-eyebrow">SKILLPROOF AI APPLICATION</span><h2 id="native-application-title">{success ? 'Application submitted' : job.title}</h2></div>
        <button type="button" aria-label="Close application form" onClick={onClose} disabled={submitting}><X size={19} /></button>
      </div>
      {success ? <div className="native-application-success" role="status">
        <Check size={25} />
        <h3>Delivered to {job.company_name}</h3>
        <p>Your application is now visible in the recruiter dashboard for this job. Submission ID: {success.id}</p>
        <button type="button" className="dialog-submit" onClick={onClose}>Done</button>
      </div> : <>
        <p className="native-application-job-summary">{job.company_name} · {job.location || 'Location not specified'}{job.employment_type ? ` · ${job.employment_type}` : ''}</p>
        {loadError && <p className="form-message error-message" role="alert">{loadError}</p>}
        {profileLoading ? <p role="status">Loading your profile and saved resumes…</p> : step === 'edit' ? <form onSubmit={validateAndReview}>
          <fieldset disabled={submitting}>
            <legend>Applicant profile</legend>
            <label>Your name<input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} maxLength="120" required /></label>
            <label>Account email<input type="email" value={profile.email} readOnly maxLength="254" required /></label>
            <label>Phone <span>(optional)</span><input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} maxLength="80" /></label>
          </fieldset>
          <label>Saved resume
            <select value={resumeId} onChange={(event) => { setResumeId(event.target.value); setResumeReviewed(false) }} required>
              <option value="">Choose a saved resume</option>
              {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.name}{resume.type === 'job-tailored' ? ` · Tailored${resume.jobTitle ? ` for ${resume.jobTitle}` : ''}` : ''}</option>)}
            </select>
          </label>
          {resumes.length === 0 && !loadError && <p className="application-details-empty">No saved resumes found. Save a resume in Resume Studio to apply.</p>}
          {selectedResume && <label className="native-review-check"><input type="checkbox" checked={resumeReviewed} onChange={(event) => setResumeReviewed(event.target.checked)} />I reviewed this saved resume and want to share it with {job.company_name}.</label>}
          {selectedResume && <details className="application-resume-preview"><summary>Preview saved resume content</summary><pre>{JSON.stringify(selectedResume.content, null, 2)}</pre></details>}
          <label>Cover letter <span>(optional)</span><textarea value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} rows="5" maxLength="20000" placeholder="Write an editable cover letter for this employer…" /></label>
          {requiredFields.length > 0 && <fieldset className="native-required-fields">
            <legend>Additional job questions</legend>
            {requiredFields.map((field) => <label key={field.id}>{field.label}{field.required && <span> (required)</span>}
              {field.type === 'textarea'
                ? <textarea value={answers[field.id] || ''} onChange={(event) => setAnswer(field.id, event.target.value)} maxLength="5000" required={field.required} />
                : <input type={field.type === 'url' ? 'url' : 'text'} value={answers[field.id] || ''} onChange={(event) => setAnswer(field.id, event.target.value)} maxLength="2000" required={field.required} />}
            </label>)}
          </fieldset>}
          {job.description && <details className="native-job-description"><summary><FileText size={15} />Review job description</summary><p>{job.description}</p></details>}
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          <div className="application-dialog-actions">
            <button type="button" className="dialog-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="dialog-submit" disabled={profileLoading || !selectedResume}>Review Application</button>
          </div>
        </form> : <div className="native-application-review">
          <h3>Review before submitting</h3>
          <dl>
            <div><dt>Job</dt><dd>{job.title} · {job.company_name}</dd></div>
            <div><dt>Applicant</dt><dd>{profile.name} · {profile.email}{profile.phone ? ` · ${profile.phone}` : ''}</dd></div>
            <div><dt>Resume</dt><dd>{selectedResume?.name || 'No resume selected'}{selectedResume?.type === 'job-tailored' ? ' · Tailored resume' : ''}</dd></div>
            {selectedResume && <div><dt>Resume content</dt><dd><details className="application-resume-preview"><summary>Review saved resume</summary><pre>{JSON.stringify(selectedResume.content, null, 2)}</pre></details></dd></div>}
            <div><dt>Cover letter</dt><dd>{coverLetter || 'Not provided'}</dd></div>
            {requiredFields.map((field) => <div key={field.id}><dt>{field.label}</dt><dd>{answers[field.id] || 'Not provided'}</dd></div>)}
          </dl>
          <label className="native-review-check"><input type="checkbox" checked={submissionConfirmed} onChange={(event) => setSubmissionConfirmed(event.target.checked)} />I confirm this application is accurate and authorize SkillProof AI to deliver it to this employer.</label>
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          <div className="application-dialog-actions">
            <button type="button" className="dialog-cancel" onClick={() => { setStep('edit'); setSubmissionConfirmed(false) }} disabled={submitting}>Back to edit</button>
            <button type="button" className="dialog-submit" onClick={submitApplication} disabled={!submissionConfirmed || submitting}>{submitting ? 'Submitting…' : 'Submit Application'}</button>
          </div>
        </div>}
      </>}
    </section>
  </div>
}
