import { useEffect, useState } from 'react'
import {
  ArrowDownToLine, ArrowRight, Check, ChevronDown, FileText, MapPin, Repeat2,
  Search, Sparkles, Target, Wifi, X,
} from 'lucide-react'
import { tailoringDemoJobs, tailoringDemoResumes } from '../data/resumeWorkspaceDemoData'
import { listResumes, saveResume } from '../services/resumeService'
import { confirmResumeAiConsent, generateResumeAi, removeResumeContactLines } from '../services/resumeAiService'

const resumeOptions = [
  { id: 'software', label: 'Software Developer Resume (Sample)', version: 'v1.2 · Sample', fileName: 'Software_Developer_Resume.pdf', updated: 'Sample · Jan 20, 2025', fileSize: 'Sample size not available' },
  { id: 'analyst', label: 'Data Analyst Resume (Sample)', version: 'v1.0 · Sample', fileName: 'Data_Analyst_Resume.docx', updated: 'Sample · Jan 15, 2025', fileSize: 'Sample size not available' },
]

const tabs = [
  ['original', 'Original Resume'],
  ['suggestions', 'Suggested Changes'],
  ['tailored', 'Tailored Preview'],
]

function pairKey(jobId, resumeId) {
  return `${jobId}:${resumeId}`
}

function roleSummary(job) {
  return `${job.title} at ${job.company} · ${job.location} · ${job.workArrangement} · ${job.employmentType}`
}

function getSuggestedContent(resumeContent, job, matchedSkills) {
  return [
    {
      id: 'summary',
      section: 'Professional Summary',
      title: 'Emphasize role-relevant experience',
      before: resumeContent.summary,
      after: `${resumeContent.summary} Skills already listed that overlap this sample role: ${matchedSkills.length ? matchedSkills.join(', ') : 'review relevant skills you can verify'}.`,
      reason: 'Reorders existing sample resume information and identifies overlapping listed skills. Confirm the added sentence is accurate before use.',
    },
    {
      id: 'skills',
      section: 'Skills',
      title: 'Prioritize skills already listed',
      before: resumeContent.skills.join(' · '),
      after: [...matchedSkills, ...resumeContent.skills.filter((skill) => !matchedSkills.includes(skill))].join(' · '),
      reason: 'Reorders only skills already present in the selected sample resume; no qualification is added.',
    },
    {
      id: 'experience',
      section: 'Work Experience',
      title: 'Keep experience wording factual',
      before: resumeContent.experience,
      after: resumeContent.experience,
      reason: 'This sample contains no role-specific change that can be made without assuming more about the candidate. The source wording is retained.',
    },
    {
      id: 'project',
      section: 'Projects',
      title: 'Review the project description',
      before: resumeContent.project,
      after: resumeContent.project,
      reason: `Compare the project against this sample role (${job.title}). Add details only if they accurately describe the project.`,
    },
  ]
}

function ResumePaper({ content, job, accepted, suggestions, original = false }) {
  const acceptedSummary = accepted.includes('summary')
  const acceptedSkills = accepted.includes('skills')
  const suggestion = suggestions.find((item) => item.id === 'summary')
  const skillSuggestion = suggestions.find((item) => item.id === 'skills')
  return <article className={`jtr-single-preview${original ? ' jtr-original-preview' : ' jtr-tailored-preview'}`}>
    <span>{original ? 'ORIGINAL RESUME · SAMPLE' : 'TAILORED DRAFT · NOT SAVED'}</span>
    <h3>{content.name}{!original && ` · ${job.title} focus`}</h3>
    {content.title && <strong className="jtr-paper-title">{content.title}</strong>}
    <p>{!original && acceptedSummary ? suggestion.after : content.summary}</p>
    <h4>Experience</h4><p>{content.experience}</p>
    <h4>Skills</h4><p>{!original && acceptedSkills ? skillSuggestion.after : content.skills.join(' · ')}</p>
    <h4>Project</h4><p>{content.project}</p>
    {content.education && <><h4>Education</h4><p>{content.education}</p></>}
    {!original && <small>{accepted.length} sample change{accepted.length === 1 ? '' : 's'} accepted in this page session. Original source remains unchanged.</small>}
  </article>
}

export default function JobSpecificResumePage() {
  const [jobId, setJobId] = useState(tailoringDemoJobs[0].id)
  const [resumeId, setResumeId] = useState(resumeOptions[0].id)
  const [view, setView] = useState('suggestions')
  const [jobSelectorOpen, setJobSelectorOpen] = useState(false)
  const [jobSearch, setJobSearch] = useState('')
  const [statesByPair, setStatesByPair] = useState({})
  const [notice, setNotice] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState('')
  const [showAllMatched, setShowAllMatched] = useState(false)
  const [showAllMissing, setShowAllMissing] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [accountResumes, setAccountResumes] = useState([])
  const [accountResumeId, setAccountResumeId] = useState('')
  const [accountResumeError, setAccountResumeError] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [accountSaving, setAccountSaving] = useState(false)

  const job = tailoringDemoJobs.find((item) => item.id === jobId) ?? tailoringDemoJobs[0]
  const resumeOption = resumeOptions.find((item) => item.id === resumeId) ?? resumeOptions[0]
  const resumeContent = tailoringDemoResumes[resumeId]
  const stateKey = pairKey(jobId, resumeId)
  const pairState = statesByPair[stateKey] || { accepted: [], rejected: [] }
  const accepted = pairState.accepted
  const rejected = pairState.rejected
  const sourceSkills = resumeContent.skills
  const matchedSkills = job.skills.filter((skill) => sourceSkills.some((resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase()))
  const missingSkills = job.skills.filter((skill) => !sourceSkills.some((resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase()))
  const matchPercent = Math.round((matchedSkills.length / Math.max(1, job.skills.length)) * 100)
  const suggestions = getSuggestedContent(resumeContent, job, matchedSkills)
  const filteredJobs = tailoringDemoJobs.filter((item) => `${item.title} ${item.company} ${item.location}`.toLowerCase().includes(jobSearch.toLowerCase()))
  const accountResume = accountResumes.find((item) => item.id === accountResumeId) ?? null
  const acceptedAiSuggestions = aiSuggestions.filter((item) => item.status === 'accepted')

  useEffect(() => {
    let active = true
    listResumes().then((items) => {
      if (!active) return
      setAccountResumes(items)
      setAccountResumeId(items[0]?.id ?? '')
      setAccountResumeError('')
    }).catch((error) => {
      if (active) setAccountResumeError(error.message)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (view === 'suggestions' && selectedSuggestion) {
      document.getElementById(`jtr-suggestion-${selectedSuggestion}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedSuggestion, view])

  function setSuggestionState(id, status) {
    setStatesByPair((current) => {
      const previous = current[stateKey] || { accepted: [], rejected: [] }
      const acceptedNext = status === 'accepted'
        ? previous.accepted.includes(id) ? previous.accepted : [...previous.accepted, id]
        : previous.accepted.filter((item) => item !== id)
      const rejectedNext = status === 'rejected'
        ? previous.rejected.includes(id) ? previous.rejected : [...previous.rejected, id]
        : previous.rejected.filter((item) => item !== id)
      return { ...current, [stateKey]: { accepted: acceptedNext, rejected: rejectedNext } }
    })
  }

  function acceptSuggestion(id) {
    if (accepted.includes(id)) return
    setSuggestionState(id, 'accepted')
    setNotice('Accepted into this job/resume session draft. The original remains unchanged.')
  }

  function rejectSuggestion(id) {
    if (rejected.includes(id)) return
    setSuggestionState(id, 'rejected')
    setNotice('Suggestion rejected. The original wording remains in the draft.')
  }

  function acceptAllChanges() {
    const pendingIds = suggestions.filter((item) => !accepted.includes(item.id) && !rejected.includes(item.id)).map((item) => item.id)
    if (!pendingIds.length) {
      setNotice('There are no pending suggestions to accept. Rejected suggestions can be reviewed again below.')
      return
    }
    setStatesByPair((current) => {
      const previous = current[stateKey] || { accepted: [], rejected: [] }
      return { ...current, [stateKey]: { accepted: [...previous.accepted, ...pendingIds], rejected: previous.rejected } }
    })
    setNotice(`${pendingIds.length} sample changes accepted in this session draft. Check each change for accuracy.`)
  }

  function rejectAllChanges() {
    const pendingIds = suggestions.filter((item) => !accepted.includes(item.id) && !rejected.includes(item.id)).map((item) => item.id)
    if (!pendingIds.length) {
      setNotice('There are no pending suggestions to reject.')
      return
    }
    setStatesByPair((current) => {
      const previous = current[stateKey] || { accepted: [], rejected: [] }
      return { ...current, [stateKey]: { accepted: previous.accepted, rejected: [...previous.rejected, ...pendingIds] } }
    })
    setNotice(`${pendingIds.length} suggestions rejected. Original content is retained.`)
  }

  function reviewRejected(id) {
    setSuggestionState(id, 'pending')
    setNotice('Suggestion returned to review. The tailored draft is unchanged.')
  }

  function resumeSections(content) {
    if (typeof content?.rawText === 'string' && content.rawText.trim()) {
      return content.rawText.split(/\r?\n/)
        .map((text, index) => ({ id: `raw-line-${index}`, label: 'Resume text', text }))
        .filter((section) => section.text.trim() && removeResumeContactLines(section.text).trim() === section.text.trim() && section.text.length <= 3000)
        .slice(0, 30)
    }
    const sections = []
    if (typeof content?.summary === 'string' && content.summary.trim()) sections.push({ id: 'summary', label: 'Professional Summary', text: content.summary })
    if (Array.isArray(content?.skills) && content.skills.length) sections.push({ id: 'skills', label: 'Skills', text: content.skills.join(' · ') })
    for (const [index, item] of (Array.isArray(content?.experiences) ? content.experiences : []).entries()) {
      if (typeof item.description === 'string' && item.description.trim()) sections.push({ id: `experience-${item.id || index}-description`, label: `${item.title || 'Experience'} responsibilities`, text: item.description })
      if (typeof item.achievements === 'string' && item.achievements.trim()) sections.push({ id: `experience-${item.id || index}-achievements`, label: `${item.title || 'Experience'} achievements`, text: item.achievements })
    }
    for (const [index, item] of (Array.isArray(content?.projects) ? content.projects : []).entries()) {
      if (typeof item.description === 'string' && item.description.trim()) sections.push({ id: `project-${item.id || index}-description`, label: `${item.name || 'Project'} description`, text: item.description })
    }
    return sections.slice(0, 30)
  }

  async function requestAiTailoring() {
    if (!accountResume) {
      setNotice('Save or select an account resume before requesting job-specific suggestions.')
      return
    }
    if (!jobDescription.trim()) {
      setNotice('Add the job description you want to target.')
      return
    }
    const sections = resumeSections(accountResume.content)
    if (!sections.length) {
      setNotice('This saved resume has no supported text fields to tailor.')
      return
    }
    if (!confirmResumeAiConsent()) return
    setAiLoading(true)
    setNotice('')
    try {
      const result = await generateResumeAi('tailor_resume', { sections, jobDescription: jobDescription.trim() })
      setAiSuggestions(result.suggestions.map((item) => ({ ...item, status: 'pending' })))
      setNotice(result.suggestions.length ? 'Review the suggestions and accept only accurate changes.' : 'No supported job-specific wording changes were found.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  function applyTailoringSuggestion(content, suggestion) {
    const rawTextMatch = suggestion.sectionId.match(/^raw-line-(\d+)$/)
    if (rawTextMatch && typeof content.rawText === 'string') {
      const lines = content.rawText.split(/\r?\n/)
      const lineIndex = Number(rawTextMatch[1])
      if (lines[lineIndex] !== suggestion.original) return null
      lines[lineIndex] = suggestion.proposed
      return { ...content, rawText: lines.join('\n') }
    }
    if (suggestion.sectionId === 'summary' && content.summary === suggestion.original) return { ...content, summary: suggestion.proposed }
    if (suggestion.sectionId === 'skills' && Array.isArray(content.skills) && content.skills.join(' · ') === suggestion.original) {
      return { ...content, skills: suggestion.proposed.split(' · ').map((skill) => skill.trim()).filter(Boolean) }
    }
    const experienceMatch = suggestion.sectionId.match(/^experience-(.+)-(description|achievements)$/)
    if (experienceMatch && Array.isArray(content.experiences)) {
      const [, id, field] = experienceMatch
      let updated = false
      const experiences = content.experiences.map((item, index) => {
        const key = item.id || String(index)
        if (key !== id || item[field] !== suggestion.original) return item
        updated = true
        return { ...item, [field]: suggestion.proposed }
      })
      if (updated) return { ...content, experiences }
    }
    const projectMatch = suggestion.sectionId.match(/^project-(.+)-description$/)
    if (projectMatch && Array.isArray(content.projects)) {
      const id = projectMatch[1]
      let updated = false
      const projects = content.projects.map((item, index) => {
        const key = item.id || String(index)
        if (key !== id || item.description !== suggestion.original) return item
        updated = true
        return { ...item, description: suggestion.proposed }
      })
      if (updated) return { ...content, projects }
    }
    return null
  }

  function setAiSuggestionStatus(id, status) {
    setAiSuggestions((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  }

  async function saveAiTailoredVersion() {
    if (!accountResume || !acceptedAiSuggestions.length) {
      setNotice('Accept at least one AI suggestion before saving a new version.')
      return
    }
    let content = accountResume.content
    for (const item of acceptedAiSuggestions) {
      const next = applyTailoringSuggestion(content, item)
      if (!next) {
        setNotice('An accepted change no longer matches the original resume. Generate fresh suggestions before saving.')
        return
      }
      content = next
    }
    setAccountSaving(true)
    try {
      await saveResume({
        name: `${accountResume.name} - Tailored`,
        type: 'job-tailored',
        jobTitle: 'Job-specific version',
        content,
      })
      setNotice('Tailored resume saved as a new version. The original was not overwritten.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setAccountSaving(false)
    }
  }

  function selectJob(nextJobId) {
    setJobId(nextJobId)
    setJobSelectorOpen(false)
    setJobSearch('')
    setSelectedSuggestion('')
    setNotice('Selected sample job. Requirements, keyword overlap, and suggestions are for this sample job only.')
  }

  function selectResume(nextResumeId) {
    setResumeId(nextResumeId)
    setSelectedSuggestion('')
    setNotice('Selected sample resume. The original stays unchanged; each job/resume pair has its own session draft.')
  }

  function reviewSuggestion(id) {
    setView('suggestions')
    setSelectedSuggestion(id)
  }

  function previewResume() {
    setView('tailored')
    setPreviewOpen(true)
  }

  function printDraft() {
    setView('tailored')
    setNotice('Use the browser print dialog and choose “Save as PDF” to export the displayed draft.')
    window.setTimeout(() => {
      try {
        window.print()
      } catch (error) {
        setNotice(`Could not open the print dialog: ${error.message}`)
      }
    }, 0)
  }

  return <section className="resume-tool-page job-tailor-page">
    <header className="rwx-hero jtr-hero">
      <div><span className="rwx-eyebrow">RESUME STUDIO</span><h1>Tailor Your Resume for a <span>Specific Job</span></h1><p>Match your experience to the role, review suggested changes, and keep your original resume safe.</p></div>
    </header>
    {notice && <p className="rwx-notice" role="status">{notice}</p>}

    <section className="rw-card jtr-workspace" id="jtr-account-ai-tailoring">
      <header className="rw-card-heading"><span className="rw-icon-box"><Sparkles size={17} /></span><div><h2>AI Tailoring for Your Resume</h2><p>Use your saved resume and the job description you provide. Your original stays unchanged.</p></div></header>
      {accountResumeError && <p className="rwx-notice" role="status">{accountResumeError}</p>}
      <label className="jtr-resume-select" htmlFor="jtr-account-resume"><span>Saved Resume</span><select id="jtr-account-resume" disabled={aiLoading} value={accountResumeId} onChange={(event) => { setAccountResumeId(event.target.value); setAiSuggestions([]) }}><option value="">Select a saved resume</option>{accountResumes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label className="rw-field rb-field-full"><span>Job Description</span><textarea rows="6" maxLength={8000} disabled={aiLoading} value={jobDescription} onChange={(event) => { setJobDescription(event.target.value); setAiSuggestions([]) }} placeholder="Paste the job description. Remove contact details from any pasted resume text; only relevant resume sections and this description are sent to Gemini." /></label>
      <div className="jtr-workspace-actions"><p>Remove unnecessary personal details from pasted resume text before requesting suggestions.</p><button className="rw-primary-button" type="button" disabled={aiLoading || !accountResumeId} onClick={requestAiTailoring}>{aiLoading ? 'Generating…' : 'Generate AI Suggestions'}</button></div>
      {aiSuggestions.length > 0 && <div className="jtr-suggestions">{aiSuggestions.map((item) => <article className={`jtr-suggestion${item.status === 'accepted' ? ' is-accepted' : item.status === 'rejected' ? ' is-rejected' : ''}`} key={item.id}>
        <div className="jtr-suggestion-heading"><span><Sparkles size={13} />{item.sectionId}</span><small>{item.status === 'accepted' ? 'Accepted' : item.status === 'rejected' ? 'Rejected' : 'AI suggestion'}</small></div>
        <div className="jtr-suggestion-copy"><section><strong>Original Content</strong><p><mark className="jtr-original-mark">{item.original}</mark></p></section><ArrowRight size={15} /><section><strong>Suggested Content</strong><p><mark className="jtr-proposed-mark">{item.proposed}</mark></p></section></div>
        <p className="jtr-reason">{item.explanation}</p>
        {item.status === 'pending' && <div className="jtr-suggestion-actions"><button className="jtr-accept-button" type="button" onClick={() => setAiSuggestionStatus(item.id, 'accepted')}><Check size={13} />Accept Changes</button><button className="jtr-reject-button" type="button" onClick={() => setAiSuggestionStatus(item.id, 'rejected')}><X size={13} />Reject Changes</button></div>}
      </article>)}</div>}
      {acceptedAiSuggestions.length > 0 && <button className="rw-primary-button" type="button" disabled={accountSaving} onClick={saveAiTailoredVersion}>{accountSaving ? 'Saving…' : 'Save Accepted Changes as New Version'}</button>}
      {!accountResumeError && !accountResumes.length && <p className="jtr-sample-explanation">Create and save a resume first; it will appear here for tailoring.</p>}
    </section>

    <section className="rw-card jtr-selected-job">
      <div className="jtr-job-mark" aria-hidden="true"><FileText size={21} /></div>
      <div className="jtr-job-copy"><span className="rw-sample-tag">SAMPLE JOB</span><h2>{job.title} <small>· {job.company}</small></h2><p><MapPin size={13} />{job.location}<i /><Wifi size={13} />{job.workArrangement}<i />{job.employmentType}</p></div>
      <span className="rw-sample-tag jtr-job-sample-badge">SAMPLE DATA</span>
      <button className="rw-outline-button" type="button" aria-expanded={jobSelectorOpen} onClick={() => setJobSelectorOpen((open) => !open)}><Repeat2 size={14} />Change Job <ChevronDown size={14} /></button>
      {jobSelectorOpen && <div className="jtr-job-picker">
        <label htmlFor="jtr-job-search"><span>Search available sample jobs</span><div><Search size={14} /><input id="jtr-job-search" value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} placeholder="Title, company, location" /></div></label>
        <div className="jtr-job-options" role="listbox" aria-label="Available sample jobs">{filteredJobs.map((item) => <button type="button" role="option" aria-selected={item.id === jobId} key={item.id} onClick={() => selectJob(item.id)}><strong>{item.title}</strong><small>{item.company} · {item.location} · Sample</small></button>)}{!filteredJobs.length && <p>No sample jobs match that search.</p>}</div>
        <small>Sample listings only. No live job feed is connected.</small>
      </div>}
    </section>

    <div className="jtr-workspace-grid">
      <section className="rw-card jtr-requirements">
        <header className="rw-card-heading"><span className="rw-icon-box"><FileText size={17} /></span><div><h2>Job Requirements</h2><p>Role details and skills from sample data.</p></div><span className="rw-sample-tag">SAMPLE DATA</span></header>
        <div className="jtr-requirement-section"><h3>Role Overview</h3><p>{job.description}</p><small>{roleSummary(job)}</small></div>
        <div className="jtr-requirement-section"><h3>Key Responsibilities</h3><ul className="jtr-responsibilities">{job.responsibilities.map((responsibility) => <li key={responsibility}><Check size={13} />{responsibility}</li>)}</ul></div>
        <div className="jtr-requirement-section"><h3>Required Skills <span className="rw-sample-tag">SAMPLE</span></h3><div className="jtr-chip-list">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
      </section>

      <section className="rw-card jtr-workspace">
        <header className="rw-card-heading"><span className="rw-icon-box"><FileText size={17} /></span><div><h2>Resume Tailoring Workspace</h2><p>Review suggestions and customize your resume for this job.</p></div><span className="rw-sample-tag">SAMPLE DATA</span></header>
        <label className="jtr-resume-select" htmlFor="jtr-resume-version"><span>Select Resume Version</span><select id="jtr-resume-version" value={resumeId} onChange={(event) => selectResume(event.target.value)}>{resumeOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <nav className="jtr-view-tabs" aria-label="Resume tailoring views">{tabs.map(([id, label]) => <button type="button" key={id} className={view === id ? 'active' : ''} aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}</nav>
        {view === 'suggestions' && <div className="jtr-suggestions">{suggestions.map((item) => {
          const isAccepted = accepted.includes(item.id)
          const isRejected = rejected.includes(item.id)
          return <article className={`jtr-suggestion${selectedSuggestion === item.id ? ' is-selected' : ''}${isAccepted ? ' is-accepted' : ''}${isRejected ? ' is-rejected' : ''}`} id={`jtr-suggestion-${item.id}`} key={item.id}>
            <div className="jtr-suggestion-heading"><span><Sparkles size={13} />{item.section}</span>{isAccepted ? <b className="jtr-state-accepted"><Check size={12} />Accepted</b> : isRejected ? <b className="jtr-state-rejected"><X size={12} />Rejected</b> : <small>Sample suggestion</small>}</div>
            <strong className="jtr-suggestion-title">{item.title}</strong>
            <div className="jtr-suggestion-copy"><section><strong>Original Content</strong><p><mark className="jtr-original-mark">{item.before}</mark></p></section><ArrowRight size={15} /><section><strong>Suggested Content</strong><p><mark className="jtr-proposed-mark">{item.after}</mark></p></section></div>
            <p className="jtr-reason">{item.reason}</p>
            <div className="jtr-suggestion-actions">
              {!isAccepted && !isRejected && <><button className="jtr-accept-button" type="button" onClick={() => acceptSuggestion(item.id)}><Check size={13} />Accept Changes</button><button className="jtr-reject-button" type="button" onClick={() => rejectSuggestion(item.id)}><X size={13} />Reject Changes</button></>}
              {isAccepted && <span className="jtr-state-accepted"><Check size={12} />In session draft</span>}
              {isRejected && <><span className="jtr-state-rejected"><X size={12} />Original retained</span><button type="button" className="jtr-review-again" onClick={() => reviewRejected(item.id)}>Review again</button></>}
            </div>
          </article>
        })}</div>}
        {view === 'original' && <ResumePaper content={resumeContent} job={job} accepted={[]} suggestions={suggestions} original />}
        {view === 'tailored' && <ResumePaper content={resumeContent} job={job} accepted={accepted} suggestions={suggestions} />}
        <div className="jtr-workspace-actions">
          <p>Draft only · original resume stays unchanged.</p>
          <button className="rw-outline-button" type="button" onClick={() => { setView('suggestions'); setNotice(`${accepted.length} accepted change${accepted.length === 1 ? '' : 's'} in this session draft.`) }}>Review Changes</button>
          <button className="rw-outline-button" type="button" onClick={rejectAllChanges}>Reject Changes</button>
          <button className="jtr-accept-button" type="button" onClick={acceptAllChanges}><Check size={13} />Accept Changes</button>
          <button className="rw-outline-button" type="button" onClick={previewResume}><Sparkles size={13} />Preview Resume</button>
        </div>
      </section>

      <section className="rw-card jtr-match-card">
        <header className="rw-card-heading"><span className="rw-icon-box"><Target size={17} /></span><div><h2>Job Match Preview</h2><p>Exact keyword overlap for sample data.</p></div><span className="rw-sample-tag">SAMPLE DATA</span></header>
        <div className="jtr-match-overview">
          <div className="jtr-match-score" style={{ '--match-angle': `${matchPercent * 3.6}deg` }}><div><strong>{matchPercent}<small>%</small></strong><span>Match Score</span></div></div>
          <div className="jtr-match-feedback"><Sparkles size={16} /><span><strong>Sample Match</strong><small>Keyword overlap is illustrative and does not predict hiring outcomes.</small></span></div>
        </div>
        <div className="jtr-ats-readiness"><span>Sample ATS Readiness</span><b>{matchPercent}%</b><i><span style={{ width: `${matchPercent}%` }} /></i></div>
        <section className="jtr-match-group"><header><h3>Matched Keywords <small>({matchedSkills.length})</small></h3><button type="button" onClick={() => setShowAllMatched((current) => !current)}>{showAllMatched ? 'Show less' : 'View all'} <ArrowRight size={12} /></button></header>
          <div className="jtr-chip-list match-chips">{(showAllMatched ? matchedSkills : matchedSkills.slice(0, 8)).map((skill) => <span key={skill}><Check size={11} />{skill}</span>)}{!matchedSkills.length && <small>No exact keyword matches in sample data.</small>}</div>
        </section>
        <section className="jtr-match-group"><header><h3>Missing Keywords <small>({missingSkills.length})</small></h3><button type="button" onClick={() => setShowAllMissing((current) => !current)}>{showAllMissing ? 'Show less' : 'View all'} <ArrowRight size={12} /></button></header>
          <div className="jtr-chip-list missing-chips">{(showAllMissing ? missingSkills : missingSkills.slice(0, 4)).map((skill) => <span key={skill}>{skill}</span>)}{!missingSkills.length && <small>No unmatched terms in sample data.</small>}</div>
          <small className="jtr-sample-explanation">Only add a skill if you can verify that it reflects your experience.</small>
        </section>
        <section className="jtr-ai-suggestions"><header><h3>AI Suggestions</h3><span className="rw-sample-tag">SAMPLE</span></header>
          {job.suggestions.map((item) => <button type="button" key={item.id} onClick={() => reviewSuggestion(item.id)}><span><Sparkles size={12} /></span><strong>{item.title}</strong><small>Review</small></button>)}
        </section>
      </section>
    </div>

    <section className="rw-card jtr-original-compare">
      <header className="rw-card-heading"><span className="rw-icon-box"><FileText size={17} /></span><div><h2>Original vs Tailored Resume</h2><p>Compare your original resume with the tailored version for this job.</p></div><span className="rw-sample-tag">SAMPLE PREVIEW</span></header>
      <div className="jtr-compare-footer">
        <article className="jtr-file-card"><span className="jtr-file-icon original"><FileText size={18} /></span><div><strong>Original Resume (Sample)</strong><p>{resumeOption.fileName}</p><small>{resumeOption.version} · {resumeOption.updated} · {resumeOption.fileSize}</small></div><span className="jtr-file-badge">Default</span></article>
        <ArrowRight className="jtr-compare-arrow" size={20} />
        <article className="jtr-file-card"><span className="jtr-file-icon tailored"><FileText size={18} /></span><div><strong>Tailored Resume (Sample)</strong><p>{job.title.replaceAll(' ', '_')}_Tailored.pdf</p><small>Temporary preview · not generated as a file</small></div><span className="jtr-file-badge recommended">Recommended</span></article>
        <div className="jtr-export-actions"><button className="rw-outline-button" type="button" onClick={printDraft}><ArrowDownToLine size={14} />Download PDF</button><button className="rw-outline-button" type="button" onClick={() => document.getElementById('jtr-account-ai-tailoring')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Sparkles size={14} />Use AI Tailoring Above</button></div>
      </div>
      <p className="jtr-sample-footnote">Names, file details, and job information above are examples only. No PDF file is generated or saved to an account.</p>
    </section>

    {previewOpen && <div className="jtr-preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewOpen(false) }}>
      <section className="jtr-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="jtr-preview-title">
        <header><div><span className="rw-sample-tag">DRAFT PREVIEW · NOT SAVED</span><h2 id="jtr-preview-title">Tailored Resume Preview</h2><p>{job.title} · {resumeOption.label}</p></div><button type="button" aria-label="Close preview" onClick={() => setPreviewOpen(false)}><X size={18} /></button></header>
        <ResumePaper content={resumeContent} job={job} accepted={accepted} suggestions={suggestions} />
        <footer><button className="rw-outline-button" type="button" onClick={() => setPreviewOpen(false)}>Back to workspace</button><button className="rw-primary-button" type="button" onClick={() => { setPreviewOpen(false); printDraft() }}><ArrowDownToLine size={14} />Print / Save as PDF</button></footer>
      </section>
    </div>}
  </section>
}
