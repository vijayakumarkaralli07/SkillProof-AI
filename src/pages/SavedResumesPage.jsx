import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownToLine, BookmarkCheck, Clock3, Eye, FileText, MoreVertical, Plus, Search,
  Star, Target, X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { savedResumeDemoRecords } from '../data/savedResumesDemoData'
import { getResume, listResumes } from '../services/resumeService'
import { downloadResumePdf } from '../services/resumePdfService'

const emptyFilters = { search: '', status: 'All Resumes', type: 'Resume Type', updated: 'Last Updated' }

function ResumeThumbnail({ templateId }) {
  return <span className={`sr-thumbnail sr-thumb-${templateId}`} aria-hidden="true"><i /><span><b /><b /><b /><b /><b /></span></span>
}

function ResumeDocument({ resume, className = '' }) {
  return <article className={`sr-document ${className}`}>
    {resume.isSample && <span className="sr-document-sample">SAMPLE DATA · NOT A STORED ACCOUNT DOCUMENT</span>}
    <header><h2>{resume.fullName}</h2><strong>{resume.title}</strong><p>{[resume.location, resume.email, resume.phone].filter(Boolean).join(' · ')}</p></header>
    {resume.rawText && <section><h3>Resume Text</h3><p className="sr-document-raw-text">{resume.rawText}</p></section>}
    {resume.summary && <section><h3>Professional Summary</h3><p>{resume.summary}</p></section>}
    {resume.experiences?.length > 0 && <section><h3>Work Experience</h3>{resume.experiences.map((entry) => <div className="sr-document-entry" key={entry.id}><b>{entry.title} · {entry.company}</b><small>{[entry.location, entry.startDate, entry.current ? 'Present' : entry.endDate].filter(Boolean).join(' · ')}</small><p>{entry.description}</p>{entry.achievements && <p>{entry.achievements}</p>}</div>)}</section>}
    {resume.skills?.length > 0 && <section><h3>Skills</h3><p>{resume.skills.join(' · ')}</p></section>}
    {resume.education?.length > 0 && <section><h3>Education</h3>{resume.education.map((entry) => <div className="sr-document-entry" key={entry.id}><b>{entry.degree} {entry.field}</b><small>{[entry.institution, entry.startYear, entry.endYear].filter(Boolean).join(' · ')}</small></div>)}</section>}
    {resume.projects?.length > 0 && <section><h3>Projects</h3>{resume.projects.map((project) => <div className="sr-document-entry" key={project.id}><b>{project.name}</b><p>{project.description}</p><small>{project.technologies}</small></div>)}</section>}
  </article>
}

function formatUpdated(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export default function SavedResumesPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState(() => savedResumeDemoRecords.map((record) => ({ ...record, isSample: true, resume: { ...record.resume, isSample: true } })))
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState('Last Updated')
  const [openMenu, setOpenMenu] = useState('')
  const [preview, setPreview] = useState(null)
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notice, setNotice] = useState('')
  const [pendingDownload, setPendingDownload] = useState(false)
  const downloadInProgress = useRef(false)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    listResumes().then((items) => {
      if (!active) return
      const accountRecords = items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type === 'job-tailored' ? 'Job-Tailored Resume' : 'General Resume',
        jobTitle: item.jobTitle,
        version: '1.0',
        updatedAt: item.updatedAt,
        isDefault: false,
        isSample: false,
        templateId: item.templateId || item.content?.templateId || 'modern',
        skills: Array.isArray(item.content?.skills) ? item.content.skills : [],
        resume: { ...item.content, isSample: false },
      }))
      setRecords((current) => [...accountRecords, ...current.filter((record) => record.isSample)])
    }).catch((error) => {
      if (active) setNotice(error.message)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!openMenu) return undefined
    function closeOnOutside(event) {
      if (event.target instanceof Element && !event.target.closest('.sr-menu-anchor')) setOpenMenu('')
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpenMenu('')
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openMenu])

  useEffect(() => {
    if (!preview && !renameTarget && !deleteTarget) return undefined
    function closeDialog(event) {
      if (event.key !== 'Escape') return
      setPreview(null)
      setRenameTarget(null)
      setDeleteTarget(null)
    }
    document.addEventListener('keydown', closeDialog)
    return () => document.removeEventListener('keydown', closeDialog)
  }, [deleteTarget, preview, renameTarget])

  const filteredRecords = useMemo(() => {
    const needle = filters.search.trim().toLowerCase()
    const cutoff7 = now - 7 * 24 * 60 * 60 * 1000
    const cutoff30 = now - 30 * 24 * 60 * 60 * 1000
    return records.filter((record) => {
      const searchContent = `${record.name} ${(record.skills ?? []).join(' ')} ${record.jobTitle ?? ''}`.toLowerCase()
      if (needle && !searchContent.includes(needle)) return false
      if (filters.status === 'Default' && !record.isDefault) return false
      if (filters.status === 'Job-Tailored' && record.type !== 'Job-Tailored Resume') return false
      if (filters.type !== 'Resume Type' && filters.type !== 'All Types' && record.type !== filters.type) return false
      const updatedAt = new Date(record.updatedAt).getTime()
      if (filters.updated === 'Last 7 Days' && updatedAt < cutoff7) return false
      if (filters.updated === 'Last 30 Days' && updatedAt < cutoff30) return false
      if (filters.updated === 'Older' && updatedAt >= cutoff30) return false
      return true
    }).sort((left, right) => {
      if (sort === 'Name') return left.name.localeCompare(right.name)
      if (sort === 'Oldest First') return new Date(left.updatedAt) - new Date(right.updatedAt)
      if (sort === 'Newest First' || sort === 'Last Updated') return new Date(right.updatedAt) - new Date(left.updatedAt)
      return 0
    })
  }, [filters, now, records, sort])

  const jobTailoredCount = records.filter((record) => record.type === 'Job-Tailored Resume').length
  const recentlyUpdatedCount = records.filter((record) => now - new Date(record.updatedAt).getTime() <= 30 * 24 * 60 * 60 * 1000).length
  const defaultCount = records.filter((record) => record.isDefault).length
  const filtersActive = filters.search !== '' || filters.status !== 'All Resumes' || filters.type !== 'Resume Type' || filters.updated !== 'Last Updated'

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function clearFilters() {
    setFilters(emptyFilters)
  }

  function setDefault(id) {
    setRecords((current) => current.map((record) => ({ ...record, isDefault: record.id === id, updatedAt: record.id === id ? new Date().toISOString() : record.updatedAt })))
    setOpenMenu('')
    setNotice('Default status updated for this session only. Demo data is not saved to an account.')
  }

  function duplicateResume(record) {
    const duplicate = {
      ...record,
      id: `session-copy-${Date.now()}`,
      name: `${record.name} (Copy)`,
      version: '1.0',
      updatedAt: new Date().toISOString(),
      isDefault: false,
      resume: { ...record.resume, experiences: [...record.resume.experiences], skills: [...record.resume.skills], projects: [...record.resume.projects], education: [...record.resume.education] },
    }
    setRecords((current) => [...current, duplicate])
    setOpenMenu('')
    setNotice('Created a temporary sample copy for this page session only.')
  }

  function confirmRename() {
    if (!renameTarget || !renameValue.trim()) return
    setRecords((current) => current.map((record) => record.id === renameTarget.id ? { ...record, name: renameValue.trim(), updatedAt: new Date().toISOString() } : record))
    setRenameTarget(null)
    setNotice('Sample name changed for this session only. Nothing was saved to an account.')
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setRecords((current) => current.filter((record) => record.id !== deleteTarget.id))
    setDeleteTarget(null)
    setNotice('Removed the sample record from this page session. No account data was deleted.')
  }

  async function downloadResume(record) {
    if (record.isSample || downloadInProgress.current) return
    downloadInProgress.current = true
    setPendingDownload(true)
    try {
      const saved = await getResume(record.id)
      const filename = await downloadResumePdf(saved.content, saved.templateId, saved.name)
      setNotice(`PDF download started: ${filename}`)
    } catch (error) {
      setNotice(error.message || `Could not download "${record.name}". The saved resume was not changed.`)
    } finally {
      downloadInProgress.current = false
      setPendingDownload(false)
    }
  }

  function openRename(record) {
    setOpenMenu('')
    setRenameTarget(record)
    setRenameValue(record.name)
  }

  function chooseMenuAction(action, record) {
    setOpenMenu('')
    if (action === 'rename') openRename(record)
    if (action === 'default') setDefault(record.id)
    if (action === 'duplicate') duplicateResume(record)
    if (action === 'delete') setDeleteTarget(record)
  }

  function createResume() {
    navigate('/resume-studio', { state: { startNewResume: true } })
  }

  return <section className="resume-tool-page saved-resumes-page">
    <header className="sr-hero">
      <div><span className="rwx-eyebrow">RESUME WORKSPACE</span><h1>Your <span>Saved Resumes</span></h1><p>Manage your resumes in one place and choose the right version when applying for a job.</p></div>
      <div className="sr-hero-illustration" aria-hidden="true"><i /><i /><i /><span><b /><b /><b /><b /></span><span><b /><b /><b /><b /></span><BookmarkCheck /></div>
    </header>
    {notice && <p className="rwx-notice" role="status">{notice}</p>}
    <div className="sr-sample-banner"><span className="rw-sample-tag">ACCOUNT RESUMES</span><p>Saved account resumes load from Supabase. Clearly marked sample records are illustrative only.</p></div>

    <section className="sr-stats" aria-label="Resume summary statistics">
      <article><span className="sr-stat-icon mint"><FileText size={18} /></span><div><strong>{records.filter((record) => !record.isSample).length}</strong><b>Saved Resumes</b><small>Saved to your account</small></div></article>
      <article><span className="sr-stat-icon blue"><Target size={18} /></span><div><strong>{jobTailoredCount}</strong><b>Job-Tailored</b><small>Customized for specific jobs</small></div></article>
      <article><span className="sr-stat-icon purple"><Clock3 size={18} /></span><div><strong>{recentlyUpdatedCount}</strong><b>Recently Updated</b><small>In the last 30 days</small></div></article>
      <article><span className="sr-stat-icon yellow"><Star size={18} /></span><div><strong>{defaultCount}</strong><b>Default Resume</b><small>Used as your primary version</small></div></article>
    </section>

    <section className="sr-toolbar" aria-label="Search and filter resumes">
      <label className="sr-search"><Search size={16} /><input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search resumes by name, skills, or job title..." aria-label="Search resumes" /></label>
      <select aria-label="Filter resume status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}><option>All Resumes</option><option>Default</option><option>Job-Tailored</option></select>
      <select aria-label="Filter resume type" value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}><option>Resume Type</option><option>All Types</option><option>General Resume</option><option>Job-Tailored Resume</option><option>Academic Resume</option></select>
      <select aria-label="Filter last updated" value={filters.updated} onChange={(event) => updateFilter('updated', event.target.value)}><option>Last Updated</option><option>All Time</option><option>Last 7 Days</option><option>Last 30 Days</option><option>Older</option></select>
      <button className="rw-primary-button sr-create-button" type="button" onClick={createResume}><Plus size={15} />Create Resume</button>
      {filtersActive && <button className="sr-clear-filters" type="button" onClick={clearFilters}>Clear filters</button>}
    </section>

    <section className="rw-card sr-list-card">
      <header className="sr-list-heading"><div><h2>Saved Resumes <small>({filteredRecords.length})</small></h2><p>Your account resumes and labelled illustrative examples.</p></div><label>Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort resumes"><option>Last Updated</option><option>Name</option><option>Oldest First</option><option>Newest First</option></select></label></header>
      {!records.length ? <div className="sr-empty-state"><FileText size={28} /><h3>No saved resumes yet</h3><p>Create your first resume and it will appear here.</p><button type="button" className="rw-primary-button" onClick={createResume}><Plus size={14} />Create Resume</button></div> : filteredRecords.length ? <div className="sr-resume-list">{filteredRecords.map((record) => <article className="sr-resume-row" key={record.id}>
        <ResumeThumbnail templateId={record.templateId} />
        <div className="sr-resume-info">
          <div className="sr-resume-name"><h3>{record.name}</h3>{record.isDefault && <span className="sr-badge default">Default</span>}{record.type === 'Job-Tailored Resume' && <span className="sr-badge tailored">Job-Tailored</span>}<span className={`sr-badge${record.isSample ? ' sample' : ' tailored'}`}>{record.isSample ? 'SAMPLE DATA' : 'SAVED'}</span></div>
          <p>Version {record.version}{record.jobTitle && <span> · Tailored for {record.jobTitle}</span>} <i />Updated on {formatUpdated(record.updatedAt)}</p>
          <div className="sr-skill-chips">{(record.skills ?? []).slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}{(record.skills ?? []).length > 3 && <span>+{record.skills.length - 3}</span>}</div>
        </div>
        <div className="sr-row-actions">{!record.isSample && <button type="button" onClick={() => navigate(`/resume-studio?resumeId=${encodeURIComponent(record.id)}`)}><FileText size={14} />Edit as New Resume</button>}<button type="button" onClick={() => setPreview(record)}><Eye size={14} />Preview</button>{record.isSample ? <button type="button" disabled title="PDF download is available for saved account resumes only">Sample Only</button> : <button type="button" disabled={pendingDownload} onClick={() => downloadResume(record)}><ArrowDownToLine size={14} />{pendingDownload ? 'Generating PDF…' : 'Download PDF'}</button>}</div>
        {record.isSample && <div className="sr-menu-anchor"><button className="sr-more-button" type="button" aria-label={`More actions for ${record.name}`} aria-expanded={openMenu === record.id} onClick={() => setOpenMenu((current) => current === record.id ? '' : record.id)}><MoreVertical size={18} /></button>
          {openMenu === record.id && <div className="sr-overflow-menu" role="menu"><button type="button" role="menuitem" onClick={() => chooseMenuAction('rename', record)}>Rename Resume</button>{!record.isDefault && <button type="button" role="menuitem" onClick={() => chooseMenuAction('default', record)}>Set as Default</button>}<button type="button" role="menuitem" onClick={() => chooseMenuAction('duplicate', record)}>Duplicate Resume</button><button type="button" role="menuitem" className="danger" onClick={() => chooseMenuAction('delete', record)}>Delete Resume</button></div>}
        </div>}
      </article>)}</div> : <div className="sr-empty-state"><FileText size={28} /><h3>No resumes match your search or filters.</h3><p>Try changing your search or clearing the filters.</p><button type="button" className="rw-outline-button" onClick={clearFilters}>Clear filters</button></div>}
    </section>
    <p className="sr-future-note">Account resumes are stored privately in Supabase. Sample actions affect only this page session; account records are not overwritten or deleted here.</p>

    {preview && <div className="sr-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null) }}><section className="sr-preview-modal" role="dialog" aria-modal="true" aria-labelledby="sr-preview-title"><header><div><span className="rw-sample-tag">{preview.isSample ? 'SAMPLE PREVIEW' : 'SAVED RESUME'}</span><h2 id="sr-preview-title">{preview.name}</h2><p>Version {preview.version} · {preview.templateId} layout</p></div><button type="button" aria-label="Close resume preview" onClick={() => setPreview(null)}><X size={18} /></button></header><ResumeDocument className={`sr-document-${preview.templateId}`} resume={preview.resume} /><footer><button type="button" className="rw-outline-button" onClick={() => setPreview(null)}>Close</button>{preview.isSample ? <button type="button" className="rw-primary-button" disabled title="PDF download is available for saved account resumes only">Sample Only</button> : <button type="button" className="rw-primary-button" disabled={pendingDownload} onClick={() => downloadResume(preview)}><ArrowDownToLine size={14} />{pendingDownload ? 'Generating PDF…' : 'Download PDF'}</button>}</footer></section></div>}

    {renameTarget && <div className="sr-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRenameTarget(null) }}><section className="sr-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="sr-rename-title"><header><h2 id="sr-rename-title">Rename sample resume</h2><button type="button" aria-label="Close rename dialog" onClick={() => setRenameTarget(null)}><X size={17} /></button></header><p>This name change is temporary and applies only to this page session.</p><label className="rw-field"><span>Resume name</span><input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} autoFocus /></label><footer><button type="button" className="rw-outline-button" onClick={() => setRenameTarget(null)}>Cancel</button><button type="button" className="rw-primary-button" disabled={!renameValue.trim()} onClick={confirmRename}>Rename</button></footer></section></div>}

    {deleteTarget && <div className="sr-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null) }}><section className="sr-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="sr-delete-title"><header><h2 id="sr-delete-title">Remove this sample?</h2><button type="button" aria-label="Close confirmation dialog" onClick={() => setDeleteTarget(null)}><X size={17} /></button></header><p><b>{deleteTarget.name}</b> will be removed from this page session only. No account data will be deleted.</p><footer><button type="button" className="rw-outline-button" onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="sr-delete-confirm" onClick={confirmDelete}>Remove Sample</button></footer></section></div>}
  </section>
}
