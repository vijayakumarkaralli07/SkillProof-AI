import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, FileText,
  Plus, Trash2, X,
} from 'lucide-react'
import { sampleResumeTemplates } from '../data/sampleResumeTemplates'
import { confirmResumeAiConsent, generateResumeAi } from '../services/resumeAiService'
import { getResume, saveResume } from '../services/resumeService'
import { downloadResumePdf } from '../services/resumePdfService'

const steps = [
  'Choose Template',
  'Personal Details',
  'Experience',
  'Skills',
  'Education',
  'Review & Create',
]

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyResume() {
  return {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    experiences: [],
    skills: [],
    education: [],
    projects: [],
  }
}

function summaryFacts(resume) {
  return {
    title: resume.title,
    skills: resume.skills,
    experience: resume.experiences.map((entry) => [entry.title, entry.description, entry.achievements].filter(Boolean).join(': ')).filter(Boolean),
    projects: resume.projects.map((project) => [project.name, project.description, project.technologies].filter(Boolean).join(': ')).filter(Boolean),
  }
}

function FormField({ label, value, onChange, placeholder, type = 'text', required = false, error, ...props }) {
  return <label className="rw-field">
    <span>{label}{required && <b className="rb-required"> *</b>}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-invalid={Boolean(error)} {...props} />
    {error && <small className="rw-field-error" role="alert">{error}</small>}
  </label>
}

function TemplateThumbnail({ template, selected, onClick }) {
  return <button className={`rb-template-card${selected ? ' is-selected' : ''}`} type="button" aria-pressed={selected} onClick={onClick} style={{ '--template-accent': template.accent }}>
    <span className={`rb-thumb rb-thumb-${template.layout}`} aria-hidden="true">
      <span className="rb-thumb-top"><i /><i /><i /></span>
      <span className="rb-thumb-body"><i /><i /><i /><i /><i /><i /></span>
    </span>
    <strong>{template.name}</strong>
    {selected && <span className="rb-template-check" aria-label="Selected"><Check size={12} /></span>}
  </button>
}

function ResumePreview({ template, resume }) {
  const sample = template.preview
  const content = {
    fullName: resume.fullName || sample.name,
    title: resume.title || sample.title,
    email: resume.email || sample.email,
    phone: resume.phone || sample.phone,
    location: resume.location || sample.location,
    linkedin: resume.linkedin || sample.linkedin,
    github: resume.github || sample.github,
    website: resume.website || sample.website,
    summary: resume.summary || sample.summary,
    skills: resume.skills.length ? resume.skills : sample.skills,
    experiences: resume.experiences.filter((item) => item.title || item.company || item.description).length
      ? resume.experiences.filter((item) => item.title || item.company || item.description)
      : sample.experience,
    education: resume.education.filter((item) => item.institution || item.degree).length
      ? resume.education.filter((item) => item.institution || item.degree)
      : sample.education,
    projects: resume.projects.filter((item) => item.name || item.description).length
      ? resume.projects.filter((item) => item.name || item.description)
      : [sample.project],
  }
  const hasSample = !resume.fullName || !resume.title || !resume.email || !resume.phone || !resume.location || !resume.summary || !resume.skills.length || !resume.experiences.length || !resume.education.length || !resume.projects.length

  return <article className={`rb-live-paper rb-paper-${template.layout}`} style={{ '--template-accent': template.accent }}>
    {hasSample && <span className="rb-paper-sample">SAMPLE CONTENT SHOWN FOR EMPTY FIELDS</span>}
    <aside className="rb-paper-sidebar">
      <div className="rb-paper-avatar">{content.fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
      <h2>{content.fullName}</h2><strong>{content.title}</strong>
      <div className="rb-paper-contact">{[content.phone, content.email, content.location, content.linkedin, content.github, content.website].filter(Boolean).map((line) => <span key={line}>{line}</span>)}</div>
      <section><h3>Skills</h3>{content.skills.map((skill) => <span className="rb-paper-skill" key={skill}>{skill}</span>)}</section>
      <section><h3>Education</h3>{content.education.map((entry, index) => <div key={`${entry.institution}-${index}`}><b>{[entry.degree, entry.field].filter(Boolean).join(' ') || entry.degree}</b><small>{entry.institution || entry.school}</small><small>{[entry.startYear, entry.endYear].filter(Boolean).join(' – ') || entry.dates}</small></div>)}</section>
    </aside>
    <div className="rb-paper-main">
      <section><h3>Professional Summary</h3><p>{content.summary}</p></section>
      <section><h3>Work Experience</h3>{content.experiences.map((entry, index) => <div className="rb-paper-entry" key={`${entry.title}-${index}`}><b>{entry.title || 'Role'}{entry.company ? ` · ${entry.company}` : ''}</b><small>{[entry.location, entry.startDate, entry.current ? 'Present' : entry.endDate].filter(Boolean).join(' · ') || entry.dates}</small><p>{entry.description || entry.responsibilities}</p>{entry.achievements && <p>{entry.achievements}</p>}</div>)}</section>
      <section><h3>Projects</h3>{content.projects.map((project, index) => <div className="rb-paper-entry" key={`${project.name}-${index}`}><b>{project.name}</b><p>{project.description}</p></div>)}</section>
    </div>
  </article>
}

function Stepper({ activeStep, onStep }) {
  return <nav className="rb-six-stepper" aria-label="Resume creation steps">
    {steps.map((label, index) => <button type="button" key={label} className={index === activeStep ? 'is-active' : index < activeStep ? 'is-done' : ''} aria-current={index === activeStep ? 'step' : undefined} onClick={() => onStep(index)}>
      <span>{index < activeStep ? <Check size={13} /> : index + 1}</span><b>{label}</b>
    </button>)}
  </nav>
}

export default function ResumeBuilderPage() {
  const [searchParams] = useSearchParams()
  const resumeId = searchParams.get('resumeId')
  const [templateId, setTemplateId] = useState('modern')
  const [resume, setResume] = useState(emptyResume)
  const [activeStep, setActiveStep] = useState(0)
  const [skillInput, setSkillInput] = useState('')
  const [notice, setNotice] = useState('')
  const [errors, setErrors] = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [pendingAiSuggestion, setPendingAiSuggestion] = useState(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [loadedResumeId, setLoadedResumeId] = useState('')
  const [savedResume, setSavedResume] = useState(null)
  const savingRef = useRef(false)
  const downloadingRef = useRef(false)
  const galleryRef = useRef(null)
  const loadingResume = Boolean(resumeId && loadedResumeId !== resumeId)
  const template = sampleResumeTemplates.find((item) => item.id === templateId) ?? sampleResumeTemplates[0]
  const personalErrors = useMemo(() => {
    const next = {}
    if (!resume.fullName.trim()) next.fullName = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email.trim())) next.email = 'Enter a valid email address.'
    if (!resume.title.trim()) next.title = 'Enter your professional title.'
    return next
  }, [resume.fullName, resume.email, resume.title])

  useEffect(() => {
    if (!resumeId) return undefined
    let active = true
    getResume(resumeId).then((saved) => {
      if (!active) return
      const content = saved.content
      setResume({
        ...emptyResume(),
        ...content,
        experiences: Array.isArray(content.experiences) ? content.experiences : [],
        skills: Array.isArray(content.skills) ? content.skills : [],
        education: Array.isArray(content.education) ? content.education : [],
        projects: Array.isArray(content.projects) ? content.projects : [],
      })
      const savedTemplateId = saved.templateId || content.templateId
      setTemplateId(sampleResumeTemplates.some((item) => item.id === savedTemplateId) ? savedTemplateId : 'modern')
      setActiveStep(1)
      setSavedResume(null)
      setNotice(`Loaded "${saved.name}". Saving edits creates a new resume and does not overwrite this saved record.`)
    }).catch((error) => {
      if (active) setNotice(error.message)
    }).finally(() => {
      if (active) setLoadedResumeId(resumeId)
    })
    return () => { active = false }
  }, [resumeId])

  function markDraftChanged() {
    setSavedResume(null)
    setNotice('You have unsaved changes. Save this resume before downloading the PDF.')
  }

  function updateResumeField(field, value) {
    setResume((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    markDraftChanged()
  }

  function updateCollection(collection, id, field, value) {
    setResume((current) => ({ ...current, [collection]: current[collection].map((entry) => entry.id === id ? { ...entry, [field]: value } : entry) }))
    markDraftChanged()
  }

  function addEntry(collection, initial) {
    setResume((current) => ({ ...current, [collection]: [...current[collection], { id: createId(collection), ...initial }] }))
    markDraftChanged()
  }

  function removeEntry(collection, id) {
    setResume((current) => ({ ...current, [collection]: current[collection].filter((entry) => entry.id !== id) }))
    markDraftChanged()
  }

  async function requestSuggestion(action, input, target, label) {
    if (!confirmResumeAiConsent()) return
    setAiLoading(true)
    setNotice('')
    try {
      const result = await generateResumeAi(action, input)
      const suggestion = action === 'generate_summary'
        ? { original: resume.summary, proposed: result.summary }
        : result.suggestions?.[0]
      if (!suggestion) throw new Error('Gemini returned no safe wording suggestion. Your resume is unchanged.')
      setPendingAiSuggestion({ ...suggestion, target, label, action, input })
    } catch (error) {
      setNotice(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  function acceptAiSuggestion() {
    if (!pendingAiSuggestion) return
    if (pendingAiSuggestion.target === 'summary') {
      if (resume.summary !== pendingAiSuggestion.original || JSON.stringify(summaryFacts(resume)) !== JSON.stringify(pendingAiSuggestion.input)) {
        setNotice('The summary or its source details changed while this suggestion was open. Generate a fresh suggestion before accepting.')
        setPendingAiSuggestion(null)
        return
      }
      updateResumeField('summary', pendingAiSuggestion.proposed)
    } else if (pendingAiSuggestion.target === 'skills') {
      if (resume.skills.join(' · ') !== pendingAiSuggestion.original) {
        setNotice('Your skills changed while this suggestion was open. Generate a fresh suggestion before accepting.')
        setPendingAiSuggestion(null)
        return
      }
      updateResumeField('skills', pendingAiSuggestion.proposed.split(' · ').map((skill) => skill.trim()).filter(Boolean))
    } else {
      const { collection, id, field } = pendingAiSuggestion.target
      const currentEntry = resume[collection].find((entry) => entry.id === id)
      if (currentEntry?.[field] !== pendingAiSuggestion.original) {
        setNotice('This field changed while the suggestion was open. Generate a fresh suggestion before accepting.')
        setPendingAiSuggestion(null)
        return
      }
      updateCollection(collection, id, field, pendingAiSuggestion.proposed)
    }
    setPendingAiSuggestion(null)
    setNotice('Suggestion accepted into your editable draft.')
  }

  function goToStep(step) {
    if (step < 0 || step >= steps.length) return
    if (step > 1 && Object.keys(personalErrors).length) {
      setErrors(personalErrors)
      setActiveStep(1)
      setNotice('Complete your name and a valid email address before continuing.')
      return
    }
    setActiveStep(step)
    setNotice('')
  }

  function continueStep() {
    if (activeStep === 0) {
      setActiveStep(1)
      setNotice('Template selected. Add your personal details to continue.')
      return
    }
    if (activeStep === 1 && Object.keys(personalErrors).length) {
      setErrors(personalErrors)
      setNotice('Complete the required fields before continuing.')
      return
    }
    if (activeStep === 2) {
      const incomplete = resume.experiences.some((entry) => (entry.title || entry.company) && (!entry.title.trim() || !entry.company.trim()))
      const invalidDates = resume.experiences.some((entry) => entry.startDate && entry.endDate && entry.endDate < entry.startDate)
      if (incomplete || invalidDates) {
        setErrors((current) => ({ ...current, experience: incomplete ? 'Add both a job title and company for each started entry.' : 'An end date cannot precede a start date.' }))
        setNotice('Review your experience details before continuing.')
        return
      }
    }
    if (activeStep === 4) {
      const invalidYears = resume.education.some((entry) => (entry.startYear && !/^\d{4}$/.test(entry.startYear))
        || (entry.endYear && !/^\d{4}$/.test(entry.endYear))
        || (/^\d{4}$/.test(entry.startYear) && /^\d{4}$/.test(entry.endYear) && entry.endYear < entry.startYear))
      if (invalidYears) {
        setErrors((current) => ({ ...current, education: 'Use valid four-digit years and ensure the end year is not before the start year.' }))
        setNotice('Review your education dates before continuing.')
        return
      }
    }
    if (activeStep === 5) {
      createDraft()
      return
    }
    setActiveStep((current) => Math.min(current + 1, steps.length - 1))
    setNotice('')
  }

  function continuePersonalDetails() {
    if (Object.keys(personalErrors).length) {
      setErrors(personalErrors)
      setNotice('Complete the required fields before continuing.')
      return
    }
    setActiveStep(2)
    setNotice('')
  }

  function addSkill(event) {
    event.preventDefault()
    const skill = skillInput.trim()
    if (!skill) return
    if (resume.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setNotice(`${skill} is already in your draft.`)
      return
    }
    setResume((current) => ({ ...current, skills: [...current.skills, skill] }))
    setSkillInput('')
    setNotice('')
    markDraftChanged()
  }

  function moveSkill(index, offset) {
    const target = index + offset
    if (target < 0 || target >= resume.skills.length) return
    setResume((current) => {
      const skills = [...current.skills]
      ;[skills[index], skills[target]] = [skills[target], skills[index]]
      return { ...current, skills }
    })
    markDraftChanged()
  }

  async function createDraft() {
    if (savingRef.current || savedResume) return
    const requiredErrors = { ...personalErrors }
    resume.experiences.forEach((entry) => {
      if ((entry.title || entry.company) && (!entry.title.trim() || !entry.company.trim())) {
        requiredErrors.experience = 'Add both a job title and company for each started experience entry.'
      }
      if (entry.startDate && entry.endDate && entry.endDate < entry.startDate) {
        requiredErrors.experience = 'Check experience dates; an end date cannot precede a start date.'
      }
    })
    resume.education.forEach((entry) => {
      if ((entry.institution || entry.degree) && (!entry.institution.trim() || !entry.degree.trim())) {
        requiredErrors.education = 'Add both an institution and degree for each started education entry.'
      }
      if ((entry.startYear && !/^\d{4}$/.test(entry.startYear))
        || (entry.endYear && !/^\d{4}$/.test(entry.endYear))
        || (/^\d{4}$/.test(entry.startYear) && /^\d{4}$/.test(entry.endYear) && entry.endYear < entry.startYear)) {
        requiredErrors.education = 'Use valid four-digit education years and ensure the end year is not before the start year.'
      }
    })
    setErrors(requiredErrors)
    if (Object.keys(requiredErrors).length) {
      setActiveStep(requiredErrors.experience ? 2 : requiredErrors.education ? 4 : 1)
      setNotice('Review the highlighted required fields before creating a draft.')
      return
    }
    savingRef.current = true
    setSaving(true)
    setNotice('')
    try {
      const saved = await saveResume({
        name: `${resume.title.trim()} Resume`,
        title: `${resume.title.trim()} Resume`,
        templateId,
        content: { ...resume, templateId },
      })
      setSavedResume(saved)
      setNotice('Resume saved successfully.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  async function downloadSavedResume() {
    if (!savedResume || saving || downloading || downloadingRef.current) {
      if (!savedResume) setNotice('Save this resume successfully before downloading its PDF.')
      return
    }
    downloadingRef.current = true
    setDownloading(true)
    setNotice('')
    try {
      const saved = await getResume(savedResume.id)
      const filename = await downloadResumePdf(saved.content, saved.templateId, saved.name)
      setNotice(`PDF download started: ${filename}`)
    } catch (error) {
      setNotice(error.message || 'Could not generate the resume PDF. Your saved resume is unchanged.')
    } finally {
      downloadingRef.current = false
      setDownloading(false)
    }
  }

  function printResume() {
    if (!savedResume) {
      setNotice('Save this resume successfully before downloading its PDF.')
      return
    }
    void downloadSavedResume()
  }

  function scrollGallery(direction) {
    galleryRef.current?.scrollBy({ left: direction * 230, behavior: 'smooth' })
  }

  function personalDetailsPanel() {
    return <section className="rw-card rb-wizard-card">
      <header className="rw-card-heading"><span className="rw-icon-box"><span className="rb-step-number">2</span></span><div><h2>Add Your Personal Details</h2><p>Fill in your basic information. This will be used in your resume.</p></div><span className="rw-sample-tag">YOUR DRAFT</span></header>
      <div className="rb-wizard-content">
        <div className="rb-wizard-fields">
          <FormField label="Full Name" required value={resume.fullName} onChange={(value) => updateResumeField('fullName', value)} placeholder="Your full name" error={errors.fullName} autoComplete="name" />
          <FormField label="Email Address" required value={resume.email} type="email" onChange={(value) => updateResumeField('email', value)} placeholder="you@example.com" error={errors.email} autoComplete="email" />
          <FormField label="Phone Number" value={resume.phone} type="tel" onChange={(value) => updateResumeField('phone', value)} placeholder="+1 555 010 0123" autoComplete="tel" />
          <FormField label="Location" value={resume.location} onChange={(value) => updateResumeField('location', value)} placeholder="City, Country" />
          <FormField label="Professional Title" required value={resume.title} onChange={(value) => updateResumeField('title', value)} placeholder="e.g. Full Stack Developer" error={errors.title} />
          <FormField label="LinkedIn Profile" value={resume.linkedin} onChange={(value) => updateResumeField('linkedin', value)} placeholder="linkedin.com/in/yourname" />
          <FormField label="GitHub Profile" value={resume.github} onChange={(value) => updateResumeField('github', value)} placeholder="github.com/yourname" />
          <FormField label="Portfolio / Website" value={resume.website} onChange={(value) => updateResumeField('website', value)} placeholder="yourwebsite.com" />
          <label className="rw-field rb-field-full"><span>Professional Summary</span><textarea rows="3" value={resume.summary} onChange={(event) => updateResumeField('summary', event.target.value)} placeholder="Briefly describe your professional background and strengths." /></label>
          <button className="rw-outline-button" type="button" disabled={aiLoading} onClick={() => requestSuggestion('generate_summary', summaryFacts(resume), 'summary', 'Professional Summary')}>{aiLoading ? 'Generating…' : 'Generate Summary with AI'}</button>
        </div>
        <div className="rb-wizard-actions"><button className="rw-outline-button" type="button" onClick={() => setActiveStep(0)}>Previous</button><button className="rw-outline-button" type="button" onClick={() => { setActiveStep(2); setNotice('Personal details are optional for now. You can add them later.') }}>Skip for Now</button><button className="rw-primary-button" type="button" onClick={continuePersonalDetails}>Save &amp; Continue <ArrowRight size={14} /></button></div>
      </div>
    </section>
  }

  function experiencePanel() {
    return <section className="rw-card rb-wizard-card">
      <header className="rw-card-heading"><span className="rw-icon-box"><span className="rb-step-number">3</span></span><div><h2>Add Your Experience</h2><p>Share work history and achievements you can verify.</p></div><button className="rw-outline-button" type="button" onClick={() => addEntry('experiences', { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: '' })}><Plus size={14} />Add Experience</button></header>
      <div className="rb-wizard-content">
        {!resume.experiences.length && <p className="rb-empty-hint">No experience added yet. Add an entry to include it in the preview.</p>}
        {resume.experiences.map((entry, index) => <article className="rb-entry-editor" key={entry.id}>
          <header><strong>Experience {index + 1}</strong><button type="button" aria-label={`Remove experience ${index + 1}`} onClick={() => removeEntry('experiences', entry.id)}><Trash2 size={14} /></button></header>
          <div className="rb-wizard-fields">
            <FormField label="Job Title" required value={entry.title} onChange={(value) => updateCollection('experiences', entry.id, 'title', value)} placeholder="Job title" />
            <FormField label="Company Name" required value={entry.company} onChange={(value) => updateCollection('experiences', entry.id, 'company', value)} placeholder="Company" />
            <FormField label="Location" value={entry.location} onChange={(value) => updateCollection('experiences', entry.id, 'location', value)} placeholder="City, Country" />
            <FormField label="Start Date" type="month" value={entry.startDate} onChange={(value) => updateCollection('experiences', entry.id, 'startDate', value)} />
            <FormField label="End Date" type="month" value={entry.endDate} disabled={entry.current} onChange={(value) => updateCollection('experiences', entry.id, 'endDate', value)} />
            <label className="rb-checkbox-field"><input type="checkbox" checked={entry.current} onChange={(event) => updateCollection('experiences', entry.id, 'current', event.target.checked)} />I currently work here</label>
            <label className="rw-field rb-field-full"><span>Responsibilities</span><textarea rows="3" value={entry.description} onChange={(event) => updateCollection('experiences', entry.id, 'description', event.target.value)} placeholder="Describe your responsibilities" /></label>
            <button className="rw-outline-button" type="button" disabled={aiLoading || !entry.description.trim()} onClick={() => requestSuggestion('improve_text', { text: entry.description, sectionId: `experience-${entry.id}` }, { collection: 'experiences', id: entry.id, field: 'description' }, `Experience ${index + 1} responsibilities`)}>{aiLoading ? 'Improving…' : 'Improve Responsibilities with AI'}</button>
            <label className="rw-field rb-field-full"><span>Achievements</span><textarea rows="2" value={entry.achievements} onChange={(event) => updateCollection('experiences', entry.id, 'achievements', event.target.value)} placeholder="Add achievements only when you can verify them" /></label>
          </div>
        </article>)}
        <section className="rb-nested-projects"><header><div><h3>Projects (Optional)</h3><p>Add relevant personal or professional projects.</p></div><button className="rw-outline-button" type="button" onClick={() => addEntry('projects', { name: '', description: '', technologies: '', url: '' })}><Plus size={13} />Add Project</button></header>
          {resume.projects.map((project, index) => <article className="rb-entry-editor" key={project.id}><header><strong>Project {index + 1}</strong><button type="button" aria-label={`Remove project ${index + 1}`} onClick={() => removeEntry('projects', project.id)}><Trash2 size={14} /></button></header><div className="rb-wizard-fields"><FormField label="Project Name" value={project.name} onChange={(value) => updateCollection('projects', project.id, 'name', value)} placeholder="Project name" /><FormField label="Technologies" value={project.technologies} onChange={(value) => updateCollection('projects', project.id, 'technologies', value)} placeholder="Tools used" />          <label className="rw-field rb-field-full"><span>Description</span><textarea rows="2" value={project.description} onChange={(event) => updateCollection('projects', project.id, 'description', event.target.value)} placeholder="Project description" /></label><button className="rw-outline-button" type="button" disabled={aiLoading || !project.description.trim()} onClick={() => requestSuggestion('improve_text', { text: project.description, sectionId: `project-${project.id}` }, { collection: 'projects', id: project.id, field: 'description' }, `Project ${index + 1} description`)}>{aiLoading ? 'Improving…' : 'Improve Project Description with AI'}</button></div></article>)}
        </section>
        {errors.experience && <p className="rw-field-error" role="alert">{errors.experience}</p>}
        <div className="rb-wizard-actions"><button className="rw-outline-button" type="button" onClick={() => setActiveStep(1)}>Previous</button><button className="rw-primary-button" type="button" onClick={continueStep}>Continue <ArrowRight size={14} /></button></div>
      </div>
    </section>
  }

  function skillsPanel() {
    return <section className="rw-card rb-wizard-card">
      <header className="rw-card-heading"><span className="rw-icon-box"><span className="rb-step-number">4</span></span><div><h2>Add Your Skills</h2><p>List relevant skills you actually have. You can reorder them any time.</p></div></header>
      <div className="rb-wizard-content">
        <form className="rb-skill-form" onSubmit={addSkill}><input value={skillInput} onChange={(event) => setSkillInput(event.target.value)} placeholder="Add a skill (e.g. JavaScript)" aria-label="New skill" /><button type="submit"><Plus size={14} />Add Skill</button></form>
        {!resume.skills.length && <p className="rb-empty-hint">No skills added yet. Add skills one at a time; none are inserted automatically.</p>}
        <div className="rb-editable-skills">{resume.skills.map((skill, index) => <span key={`${skill}-${index}`}><b>{skill}</b><button type="button" aria-label={`Move ${skill} up`} disabled={index === 0} onClick={() => moveSkill(index, -1)}><ArrowLeft size={12} /></button><button type="button" aria-label={`Move ${skill} down`} disabled={index === resume.skills.length - 1} onClick={() => moveSkill(index, 1)}><ArrowRight size={12} /></button><button type="button" aria-label={`Remove ${skill}`} onClick={() => updateResumeField('skills', resume.skills.filter((_, skillIndex) => skillIndex !== index))}><X size={12} /></button></span>)}</div>
        <button className="rw-outline-button" type="button" disabled={aiLoading || !resume.skills.length} onClick={() => requestSuggestion('improve_text', { text: resume.skills.join(' · '), sectionId: 'skills' }, 'skills', 'Skills')}>{aiLoading ? 'Improving…' : 'Improve Skills Clarity with AI'}</button>
        <div className="rb-wizard-actions"><button className="rw-outline-button" type="button" onClick={() => setActiveStep(2)}>Previous</button><button className="rw-primary-button" type="button" onClick={continueStep}>Continue <ArrowRight size={14} /></button></div>
      </div>
    </section>
  }

  function educationPanel() {
    return <section className="rw-card rb-wizard-card">
      <header className="rw-card-heading"><span className="rw-icon-box"><span className="rb-step-number">5</span></span><div><h2>Add Your Education</h2><p>Include institutions and qualifications relevant to your goals.</p></div><button className="rw-outline-button" type="button" onClick={() => addEntry('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '', details: '' })}><Plus size={14} />Add Education</button></header>
      <div className="rb-wizard-content">
        {!resume.education.length && <p className="rb-empty-hint">No education added yet. Add an entry to include it in the preview.</p>}
        {resume.education.map((entry, index) => <article className="rb-entry-editor" key={entry.id}>
          <header><strong>Education {index + 1}</strong><button type="button" aria-label={`Remove education ${index + 1}`} onClick={() => removeEntry('education', entry.id)}><Trash2 size={14} /></button></header>
          <div className="rb-wizard-fields">
            <FormField label="Institution" required value={entry.institution} onChange={(value) => updateCollection('education', entry.id, 'institution', value)} placeholder="School or institution" />
            <FormField label="Degree" required value={entry.degree} onChange={(value) => updateCollection('education', entry.id, 'degree', value)} placeholder="Degree" />
            <FormField label="Field of Study" value={entry.field} onChange={(value) => updateCollection('education', entry.id, 'field', value)} placeholder="Field of study" />
            <FormField label="Start Year" value={entry.startYear} onChange={(value) => updateCollection('education', entry.id, 'startYear', value)} placeholder="YYYY" inputMode="numeric" maxLength={4} />
            <FormField label="End Year / Expected" value={entry.endYear} onChange={(value) => updateCollection('education', entry.id, 'endYear', value)} placeholder="YYYY" inputMode="numeric" maxLength={4} />
            <FormField label="Grade / GPA (Optional)" value={entry.grade} onChange={(value) => updateCollection('education', entry.id, 'grade', value)} placeholder="Optional" />
            <label className="rw-field rb-field-full"><span>Relevant achievements</span><textarea rows="2" value={entry.details} onChange={(event) => updateCollection('education', entry.id, 'details', event.target.value)} placeholder="Optional achievements or activities" /></label>
          </div>
        </article>)}
        {errors.education && <p className="rw-field-error" role="alert">{errors.education}</p>}
        <div className="rb-wizard-actions"><button className="rw-outline-button" type="button" onClick={() => setActiveStep(3)}>Previous</button><button className="rw-primary-button" type="button" onClick={() => setActiveStep(5)}>Review Resume <ArrowRight size={14} /></button></div>
      </div>
    </section>
  }

  function reviewPanel() {
    return <section className="rw-card rb-wizard-card">
      <header className="rw-card-heading"><span className="rw-icon-box"><span className="rb-step-number">6</span></span><div><h2>Review &amp; Create</h2><p>Check your content and save a new resume to your account.</p></div><span className={`rb-draft-pill${savedResume ? ' is-created' : ''}`}>{saving ? 'SAVING…' : savedResume ? 'SAVED TO ACCOUNT' : 'UNSAVED DRAFT'}</span></header>
      <div className="rb-wizard-content rb-review-content">
        <div className="rb-review-summary">
          <section><h3>Template</h3><p>{template.name}</p><button type="button" onClick={() => setActiveStep(0)}>Change Template</button></section>
          <section><h3>Personal Details</h3><p>{resume.fullName || 'Name not provided'} · {resume.email || 'Email not provided'}</p><button type="button" onClick={() => setActiveStep(1)}>Edit Details</button></section>
          <section><h3>Experience</h3><p>{resume.experiences.length} entr{resume.experiences.length === 1 ? 'y' : 'ies'}</p><button type="button" onClick={() => setActiveStep(2)}>Edit Experience</button></section>
          <section><h3>Skills</h3><p>{resume.skills.length ? resume.skills.join(', ') : 'No skills added'}</p><button type="button" onClick={() => setActiveStep(3)}>Edit Skills</button></section>
          <section><h3>Education</h3><p>{resume.education.length} entr{resume.education.length === 1 ? 'y' : 'ies'}</p><button type="button" onClick={() => setActiveStep(4)}>Edit Education</button></section>
          <section><h3>Projects</h3><p>{resume.projects.length} optional project{resume.projects.length === 1 ? '' : 's'}</p><button type="button" onClick={() => setActiveStep(2)}>Edit Projects</button></section>
        </div>
        {(Object.keys(personalErrors).length || errors.experience || errors.education) && <p className="rb-review-warning" role="status">Some required fields are incomplete. Use the Edit buttons to finish the draft.</p>}
        <div className="rb-wizard-actions"><button className="rw-outline-button" type="button" onClick={() => setActiveStep(4)}>Previous</button><button className="rw-outline-button" type="button" onClick={() => setPreviewOpen(true)}>Preview Resume</button><button className="rw-outline-button" type="button" disabled={!savedResume || saving || downloading || loadingResume} onClick={downloadSavedResume}><ArrowDownToLine size={14} />{downloading ? 'Generating PDF…' : savedResume ? 'Download PDF' : 'Save Before Download'}</button><button className="rw-primary-button" type="button" disabled={saving || loadingResume || Boolean(savedResume)} onClick={createDraft}>{saving ? 'Saving…' : savedResume ? 'Resume Saved' : 'Create Resume Draft'} <Check size={14} /></button></div>
        {savedResume && <p className="rb-created-notice" role="status">Resume saved successfully. <Link to="/saved-resumes">Open Saved Resumes</Link> · <Link to={`/resume-studio?resumeId=${encodeURIComponent(savedResume.id)}`}>Reopen this resume</Link></p>}
      </div>
    </section>
  }

  return <section className="resume-tool-page resume-builder-page">
    <header className="rwx-hero rb-builder-hero"><div><span className="rwx-eyebrow">RESUME STUDIO</span><h1>Build a Resume That <span>Gets Noticed</span></h1><p>Choose a professional template, add your details, and create a standout resume.</p></div></header>
    {notice && <p className="rwx-notice" role="status">{notice}</p>}
    {loadingResume && <p className="rwx-notice" role="status">Loading your saved resume…</p>}
    <Stepper activeStep={activeStep} onStep={goToStep} />
    <div className="rb-builder-grid rb-template-layout" aria-busy={loadingResume} inert={loadingResume}>
      <div className="rb-builder-left">
        {activeStep === 0 && <>
          <section className="rw-card rb-wizard-card">
            <header className="rw-card-heading"><span className="rw-icon-box"><span className="rb-step-number">1</span></span><div><h2>Choose a Resume Template</h2><p>Select a professional design to get started. You can customize the content in the next steps.</p></div><span className="rw-sample-tag">6 Sample Templates</span></header>
            <div className="rb-gallery-controls"><p>Template Gallery <span>Choose a layout style</span></p><div><button type="button" aria-label="Scroll templates left" onClick={() => scrollGallery(-1)}><ChevronLeft size={16} /></button><button type="button" aria-label="Scroll templates right" onClick={() => scrollGallery(1)}><ChevronRight size={16} /></button></div></div>
            <div className="rb-template-gallery" id="rb-template-gallery" ref={galleryRef}>{sampleResumeTemplates.map((item) => <TemplateThumbnail key={item.id} template={item} selected={item.id === templateId} onClick={() => { setTemplateId(item.id); markDraftChanged(); setNotice(`${item.name} template selected. Your entered details are preserved.`) }} />)}</div>
            <p className="rb-template-description"><b>{template.name}:</b> {template.description}</p>
            <div className="rb-wizard-actions"><span className="rb-unsaved-note">Your resume information stays in this page session until you leave.</span><button className="rw-primary-button" type="button" onClick={continueStep}>Continue <ArrowRight size={14} /></button></div>
          </section>
          {personalDetailsPanel()}
        </>}
        {activeStep === 1 && personalDetailsPanel()}
        {activeStep === 2 && experiencePanel()}
        {activeStep === 3 && skillsPanel()}
        {activeStep === 4 && educationPanel()}
        {activeStep === 5 && reviewPanel()}
      </div>
      <section className="rw-card rb-preview-card rb-template-preview-card">
        <header className="rw-card-heading"><span className="rw-icon-box"><FileText size={17} /></span><div><h2>Template Preview</h2><p>See how your resume will look with sample data.</p></div><button className="rw-outline-button rb-change-template" type="button" onClick={() => { setActiveStep(0); document.getElementById('rb-template-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}><ArrowLeft size={13} />Change Template</button></header>
        <p className="rb-selected-template-label"><span style={{ backgroundColor: template.accent }} />{template.name} template</p>
        <ResumePreview template={template} resume={resume} />
        <div className="rb-preview-footer"><span className="rb-draft-state is-sample"><i />Preview combines your entries with labelled sample content for empty fields.</span><button className="rw-outline-button" type="button" onClick={() => setPreviewOpen(true)}><FileText size={13} />Preview Resume</button></div>
      </section>
    </div>
    {pendingAiSuggestion && <div className="rb-preview-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingAiSuggestion(null) }}><section className="rb-preview-modal" role="dialog" aria-modal="true" aria-labelledby="rb-ai-review-title"><header><div><h2 id="rb-ai-review-title">Review AI suggestion</h2><p>{pendingAiSuggestion.label} · Your original remains unchanged until accepted.</p></div><button type="button" aria-label="Close suggestion review" onClick={() => setPendingAiSuggestion(null)}><X size={18} /></button></header><div className="rb-wizard-content"><label className="rw-field"><span>Original</span><textarea rows="3" value={pendingAiSuggestion.original} readOnly /></label><label className="rw-field"><span>Proposed text · editable</span><textarea rows="4" value={pendingAiSuggestion.proposed} onChange={(event) => setPendingAiSuggestion((current) => ({ ...current, proposed: event.target.value }))} /></label><footer><button type="button" className="rw-outline-button" onClick={() => setPendingAiSuggestion(null)}>Reject</button><button type="button" className="rw-primary-button" disabled={!pendingAiSuggestion.proposed.trim()} onClick={acceptAiSuggestion}>Accept Suggestion</button></footer></div></section></div>}
    {previewOpen && <div className="rb-preview-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewOpen(false) }}>
      <section className="rb-preview-modal" role="dialog" aria-modal="true" aria-labelledby="rb-preview-modal-title"><header><div><h2 id="rb-preview-modal-title">Resume Preview</h2><p>{template.name} template · {savedResume ? 'Saved resume' : 'Preview only'}</p></div><button type="button" aria-label="Close resume preview" onClick={() => setPreviewOpen(false)}><X size={18} /></button></header><ResumePreview template={template} resume={resume} /><footer><button type="button" className="rw-outline-button" onClick={() => setPreviewOpen(false)}>Close</button><button type="button" className="rw-primary-button" disabled={!savedResume || downloading} onClick={printResume}><ArrowDownToLine size={14} />{downloading ? 'Generating PDF…' : savedResume ? 'Download PDF' : 'Save Before Download'}</button></footer></section>
    </div>}
  </section>
}
