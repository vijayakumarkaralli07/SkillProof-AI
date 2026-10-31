import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight, Bookmark, BriefcaseBusiness, CalendarDays, Check, ChevronDown, Clock3, EllipsisVertical,
  Eye, Filter, MapPin, Search, Send, Sparkles, Target, Wifi, X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { recentlyViewedSampleData, savedJobsSampleData } from '../data/savedJobsSampleData'
import { useAuth } from '../hooks/useAuth'
import { loadSavedJobs, removeJobBookmark } from '../services/userDataService.js'
import SectionBackButton from '../components/common/SectionBackButton'

const initialFilters = {
  savedState: '',
  jobType: '',
  experience: '',
  workMode: '',
  savedDate: '',
  highMatch: false,
  closingSoon: false,
}

function daysAgoLabel(daysAgo) {
  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  return `${daysAgo} days ago`
}

function savedDateLabel(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CompanyMark({ company }) {
  return <span className={`saved-company-mark saved-mark-${company.toLowerCase()}`} aria-label={`${company} sample mark`}>
    {company === 'Google' ? <span className="google-mark">G</span> : company === 'Microsoft' ? <span className="microsoft-mark"><i /><i /><i /><i /></span> : company === 'Amazon' ? <span className="amazon-mark">a<span>⌣</span></span> : company === 'Adobe' ? <span className="adobe-mark">A</span> : <span className="linkedin-mark">in</span>}
  </span>
}

function SampleBadge({ className = '' }) {
  return <span className={`saved-sample-badge ${className}`}>SAMPLE DATA</span>
}

function SavedJobMenu({ job, onView, onRemove }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open) return undefined
    function positionMenu() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({
        top: Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 104)),
        left: Math.max(8, Math.min(rect.right - 174, window.innerWidth - 182)),
      })
    }
    function closeOutside(event) {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false)
    }
    function closeEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    positionMenu()
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    window.addEventListener('resize', positionMenu)
    window.addEventListener('scroll', positionMenu, true)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeEscape)
      window.removeEventListener('resize', positionMenu)
      window.removeEventListener('scroll', positionMenu, true)
    }
  }, [open])

  return <div className="saved-card-menu">
    <button ref={triggerRef} className="saved-icon-button" type="button" aria-label={`Actions for ${job.title}`} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((current) => !current)}>
      <EllipsisVertical size={18} />
    </button>
    {open && createPortal(<div ref={menuRef} className="saved-menu-portal" role="menu" style={{ top: position.top, left: position.left }}>
      <button type="button" role="menuitem" onClick={() => { onView(job); setOpen(false) }}><Eye size={14} />View details</button>
      <button type="button" role="menuitem" className="saved-menu-remove" onClick={() => { onRemove(job); setOpen(false) }}><X size={14} />Remove from saved</button>
      <small>{job.isPersisted ? 'Saved account record' : 'Temporary demo action'}</small>
    </div>, document.body)}
  </div>
}

function SavedJobCard({ job, onView, onUnsave, onRemove, index }) {
  const skills = job.skills.slice(0, 4)
  return <article className="saved-job-card" style={{ '--saved-card-index': index }}>
    <CompanyMark company={job.company} />
    <div className="saved-job-main">
      <div className="saved-job-titleline">
        <h3>{job.title}</h3>
        <span className="saved-match"><Sparkles size={12} fill="currentColor" />{job.isSample && Number.isFinite(job.matchScore) ? `${job.matchScore}% Match` : 'Match not calculated'}</span>
      </div>
      <div className="saved-job-meta">
        <span>{job.company}</span><i />
        <span><MapPin size={12} />{job.location}</span><i />
        <span><BriefcaseBusiness size={12} />{job.employmentType}</span><i />
        <span><Wifi size={12} />{job.workMode}</span>
      </div>
      <small className="saved-date">Saved on {savedDateLabel(job.savedDaysAgo)}</small>
      <div className="saved-skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}{job.skills.length > skills.length && <span>+{job.skills.length - skills.length}</span>}</div>
    </div>
    <div className="saved-job-actions">
      <div className="saved-action-icons">
        <button className="saved-icon-button saved-bookmark-button" type="button" aria-label={`Remove ${job.title} from ${job.isPersisted ? 'your saved jobs' : 'this demo saved list'}`} title={job.isPersisted ? 'Remove from your saved jobs' : 'Temporary demo state; not saved permanently'} onClick={() => onUnsave(job)}><Bookmark size={18} fill="currentColor" /></button>
        <SavedJobMenu job={job} onView={onView} onRemove={onRemove} />
      </div>
      <button className="saved-view-button" type="button" onClick={() => onView(job)}>View Job <ArrowRight size={14} /></button>
    </div>
  </article>
}

function FilterSelect({ label, icon: Icon, value, options, onChange }) {
  return <label className={`saved-filter${value ? ' is-selected' : ''}`}>
    <Icon size={16} aria-hidden="true" />
    <span>{value || label}</span>
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{label}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <ChevronDown size={14} aria-hidden="true" />
  </label>
}

function SavedJobDetails({ item, onClose }) {
  useEffect(() => {
    function closeEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeEscape)
    return () => document.removeEventListener('keydown', closeEscape)
  }, [onClose])

  const savedJob = Object.hasOwn(item, 'matchScore')
  return <div className="saved-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="saved-details-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-details-title">
      <button className="saved-dialog-close" type="button" aria-label="Close details" onClick={onClose}><X size={18} /></button>
      {item.isSample !== false && <SampleBadge />}
      <span className="saved-details-company"><CompanyMark company={item.company} />{item.company}</span>
      <h2 id="saved-details-title">{item.title}</h2>
      <p className="saved-details-location"><MapPin size={14} />{item.location}</p>
      {savedJob
        ? <><p>{item.description}</p><div className="saved-detail-facts"><span>{item.employmentType}</span><span>{item.experienceLevel}</span><span>{item.workMode}</span><span>{item.isSample === false ? 'Match not calculated' : `${item.matchScore}% illustrative match`}</span></div><div className="saved-skill-list">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></>
        : <p>This recently viewed role is illustrative sample data. No live listing details or source link are available.</p>}
      <p className="saved-details-note">{item.isPersisted ? `Saved to your account. ${item.isSample ? 'This is a sample listing; ' : ''}employer details and application status are not independently verified.` : 'Preview only — this demo listing is not connected to an employer or job provider.'}</p>
      <button className="saved-details-done" type="button" onClick={onClose}>Back to Saved Jobs</button>
    </section>
  </div>
}

function SavedJobIllustration() {
  return <div className="saved-hero-art" aria-hidden="true">
    <span className="saved-art-orbit saved-art-orbit-a" /><span className="saved-art-orbit saved-art-orbit-b" />
    <span className="saved-art-spark spark-left">✦</span><span className="saved-art-spark spark-right">✦</span>
    <span className="saved-art-label discover-label">Discover</span>
    <span className="saved-art-label save-label">Save</span>
    <span className="saved-art-label later-label">Apply Later</span>
    <span className="saved-bookmark-card"><Bookmark size={43} fill="currentColor" strokeWidth={1.5} /></span>
  </div>
}

export default function SavedJobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState(() => savedJobsSampleData.map((job) => ({ ...job, skills: [...job.skills] })))
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const [filters, setFilters] = useState(initialFilters)
  const [details, setDetails] = useState(null)
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    loadSavedJobs(user.id).then((records) => {
      if (!active) return
      const liveJobs = records.map((record) => {
        const data = record.job_data && typeof record.job_data === 'object' ? record.job_data : {}
        const savedAt = Date.parse(record.created_at || '')
        return {
          ...data,
          id: record.job_id,
          title: record.title || data.title || 'Saved job',
          company: record.company || data.company || 'Company not specified',
          location: data.location || 'Location not specified',
          employmentType: data.employmentType || 'Not specified',
          experienceLevel: data.experienceLevel || 'Not specified',
          workMode: data.workArrangement || data.workMode || 'Not specified',
          savedDaysAgo: Number.isFinite(savedAt) ? Math.max(0, Math.floor((Date.now() - savedAt) / 86400000)) : 0,
          closingDays: Number.isFinite(data.closingDays) ? data.closingDays : Number.POSITIVE_INFINITY,
          matchScore: Number.isFinite(data.matchScore) ? data.matchScore : null,
          applied: data.applied === true,
          skills: Array.isArray(data.skills) ? data.skills : [],
          description: data.description || 'Original saved job record.',
          isSample: data.isSample === true,
          isPersisted: true,
        }
      })
      const persistedIds = new Set(liveJobs.map((job) => job.id))
      setJobs([
        ...savedJobsSampleData.filter((job) => !persistedIds.has(job.id)).map((job) => ({ ...job, skills: [...job.skills] })),
        ...liveJobs,
      ])
    }).catch((error) => {
      if (active) setStatusMessage(`Saved jobs could not be loaded from your account: ${error.message}`)
    })
    return () => { active = false }
  }, [user?.id])

  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    const results = jobs.filter((job) => {
      const searchable = [job.title, job.company, job.location, ...job.skills].join(' ').toLowerCase()
      const matchesSearch = !query || searchable.includes(query)
      const matchesSavedState = !filters.savedState || (filters.savedState === 'Applied' ? job.applied : !job.applied)
      const matchesJobType = !filters.jobType || job.employmentType === filters.jobType
      const matchesExperience = !filters.experience || job.experienceLevel === filters.experience
      const matchesMode = !filters.workMode || job.workMode === filters.workMode
      const matchesSavedDate = !filters.savedDate
        || (filters.savedDate === 'Last 7 days' && job.savedDaysAgo <= 7)
        || (filters.savedDate === 'Last 30 days' && job.savedDaysAgo <= 30)
        || (filters.savedDate === 'Older than 30 days' && job.savedDaysAgo > 30)
      const matchesHigh = !filters.highMatch || job.matchScore >= 70
      const matchesClosing = !filters.closingSoon || job.closingDays <= 7
      return matchesSearch && matchesSavedState && matchesJobType && matchesExperience
        && matchesMode && matchesSavedDate && matchesHigh && matchesClosing
    })

    if (sort === 'recent') results.sort((a, b) => a.savedDaysAgo - b.savedDaysAgo)
    if (sort === 'match') results.sort((a, b) => b.matchScore - a.matchScore)
    if (sort === 'closing') results.sort((a, b) => a.closingDays - b.closingDays)
    if (sort === 'company') results.sort((a, b) => a.company.localeCompare(b.company))
    return results
  }, [filters, jobs, search, sort])

  const counts = useMemo(() => ({
    saved: jobs.length,
    highMatch: jobs.filter((job) => job.matchScore >= 70).length,
    closingSoon: jobs.filter((job) => job.closingDays <= 7).length,
    applied: jobs.filter((job) => job.applied).length,
    savedThisWeek: jobs.filter((job) => job.savedDaysAgo <= 7).length,
    highMatchThisWeek: jobs.filter((job) => job.matchScore >= 70 && job.savedDaysAgo <= 7).length,
  }), [jobs])

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 })
  }, [filters, search, sort])

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
    setStatusMessage('')
  }

  function clearFilters() {
    setFilters(initialFilters)
    setSearch('')
    setSort('recent')
    setStatusMessage('')
  }

  async function unsaveJob(job) {
    if (job.isPersisted) {
      if (!user?.id) {
        setStatusMessage('Sign in to remove saved jobs from your account.')
        return
      }
      try {
        await removeJobBookmark(user.id, job.id)
      } catch (error) {
        setStatusMessage(`Job could not be removed from your account: ${error.message}`)
        return
      }
    }
    setJobs((current) => current.filter((savedJob) => savedJob.id !== job.id))
    setStatusMessage(job.isPersisted
      ? `${job.title} removed from your saved jobs.`
      : job.isSample
      ? `${job.title} removed from this temporary demo list. Changes are not saved permanently.`
      : `${job.title} removed from this temporary preview.`)
  }

  async function confirmRemove() {
    if (!pendingRemoval) return
    await unsaveJob(pendingRemoval)
    setPendingRemoval(null)
  }

  function toggleQuick(key, value) {
    updateFilter(key, filters[key] === value ? '' : value)
  }

  function toggleBooleanQuick(key) {
    updateFilter(key, !filters[key])
  }

  return <section className="saved-jobs-page">
    <SectionBackButton />
    <section className="saved-jobs-hero">
      <div className="saved-hero-copy">
        <span className="saved-jobs-eyebrow">SAVED JOBS</span>
        <h1>Your Saved <span>Opportunities</span></h1>
        <p>Saved jobs to review and apply when you're ready.</p>
      </div>
      <SavedJobIllustration />
    </section>

    <div className="saved-summary-grid" aria-label="Saved job summary, with illustrative sample metrics">
      <article className="saved-summary-card"><span className="saved-summary-icon summary-icon-green"><Bookmark size={22} /></span><span className="saved-summary-copy"><b>{counts.saved}</b><strong>Saved Jobs</strong><small><i />{counts.savedThisWeek} new this week</small></span></article>
      <article className="saved-summary-card"><span className="saved-summary-icon summary-icon-blue"><Target size={23} /></span><span className="saved-summary-copy"><b>{counts.highMatch}</b><strong>High Match</strong><small><i />{counts.highMatchThisWeek} new this week</small></span></article>
      <article className="saved-summary-card"><span className="saved-summary-icon summary-icon-yellow"><Clock3 size={23} /></span><span className="saved-summary-copy"><b>{counts.closingSoon}</b><strong>Closing Soon</strong><small className="closing-summary"><Clock3 size={11} />Expiring within 7 days</small></span></article>
      <article className="saved-summary-card"><span className="saved-summary-icon summary-icon-green"><Send size={21} /></span><span className="saved-summary-copy"><b>{counts.applied}</b><strong>Applied</strong><small><i />from saved sample jobs</small></span></article>
    </div>

    <div className="saved-search-row">
      <label className="saved-search-box"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved jobs, companies, or skills..." aria-label="Search saved jobs, companies, or skills" /></label>
      <label className="saved-sort-control"><span>Sort by:</span><span className="saved-sort-select"><select value={sort} aria-label="Sort saved jobs" onChange={(event) => setSort(event.target.value)}><option value="recent">Most Recent</option><option value="match">Highest Match</option><option value="closing">Closing Soon</option><option value="company">Company Name</option></select><ChevronDown size={15} /></span></label>
    </div>

    <div className="saved-filter-row" aria-label="Filter saved jobs">
      <FilterSelect label="All Saved" icon={Bookmark} value={filters.savedState} options={[{ value: 'Applied', label: 'Applied' }, { value: 'Not applied', label: 'Not applied' }]} onChange={(value) => updateFilter('savedState', value)} />
      <FilterSelect label="Job Type" icon={BriefcaseBusiness} value={filters.jobType} options={['Full-time', 'Part-time', 'Internship', 'Contract'].map((value) => ({ value, label: value }))} onChange={(value) => updateFilter('jobType', value)} />
      <FilterSelect label="Experience Level" icon={Filter} value={filters.experience} options={['Entry-level', 'Mid-level', 'Senior-level', 'Internship'].map((value) => ({ value, label: value }))} onChange={(value) => updateFilter('experience', value)} />
      <FilterSelect label="Work Mode" icon={MapPin} value={filters.workMode} options={['Remote', 'Hybrid', 'On-site'].map((value) => ({ value, label: value }))} onChange={(value) => updateFilter('workMode', value)} />
      <FilterSelect label="Date Saved" icon={CalendarDays} value={filters.savedDate} options={['Last 7 days', 'Last 30 days', 'Older than 30 days'].map((value) => ({ value, label: value }))} onChange={(value) => updateFilter('savedDate', value)} />
      <button className="saved-clear-filters" type="button" onClick={clearFilters}>Clear</button>
    </div>

    <div className="saved-content-grid">
      <section className="saved-list-section" aria-labelledby="saved-list-title">
        <header className="saved-list-heading">
          <div><h2 id="saved-list-title">Your Saved Jobs</h2><span>{visibleJobs.length} of {jobs.length} saved {jobs.length === 1 ? 'job' : 'jobs'}</span></div>
          <SampleBadge />
        </header>
        <div className="saved-jobs-list" ref={listRef} aria-live="polite">
          {visibleJobs.map((job, index) => <SavedJobCard key={job.id} job={job} index={index} onView={setDetails} onUnsave={unsaveJob} onRemove={setPendingRemoval} />)}
          {!visibleJobs.length && <div className="saved-empty-state"><Search size={23} /><h3>No saved jobs match</h3><p>Adjust your search or filters to see saved jobs and sample previews.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
        </div>
        <p className="saved-list-note">Sample previews are illustrative. Account records are loaded from your saved jobs; match scores and closing estimates are not calculated for those records.</p>
      </section>

      <aside className="saved-utility-column">
        <section className="saved-utility-card quick-filter-card">
          <header><Filter size={18} /><h2>Quick Filters</h2></header>
          <div className="saved-quick-list">
            <label><input type="checkbox" checked={filters.highMatch} onChange={() => toggleBooleanQuick('highMatch')} /><span>High match (70%+)</span><small>{jobs.filter((job) => job.matchScore >= 70).length}</small></label>
            <label><input type="checkbox" checked={filters.workMode === 'Remote'} onChange={() => toggleQuick('workMode', 'Remote')} /><span>Remote</span><small>{jobs.filter((job) => job.workMode === 'Remote').length}</small></label>
            <label><input type="checkbox" checked={filters.jobType === 'Internship'} onChange={() => toggleQuick('jobType', 'Internship')} /><span>Internship</span><small>{jobs.filter((job) => job.employmentType === 'Internship').length}</small></label>
            <label><input type="checkbox" checked={filters.jobType === 'Full-time'} onChange={() => toggleQuick('jobType', 'Full-time')} /><span>Full-time</span><small>{jobs.filter((job) => job.employmentType === 'Full-time').length}</small></label>
            <label><input type="checkbox" checked={filters.workMode === 'Hybrid'} onChange={() => toggleQuick('workMode', 'Hybrid')} /><span>Hybrid</span><small>{jobs.filter((job) => job.workMode === 'Hybrid').length}</small></label>
            <label><input type="checkbox" checked={filters.closingSoon} onChange={() => toggleBooleanQuick('closingSoon')} /><span>Closing soon</span><small>{jobs.filter((job) => job.closingDays <= 7).length}</small></label>
          </div>
        </section>
        <section className="saved-utility-card recently-viewed-card">
          <header><Clock3 size={18} /><h2>Recently Viewed</h2><Link to="/jobs">View all <ArrowRight size={13} /></Link></header>
          <span className="recent-sample-label">SAMPLE HISTORY</span>
          <ul>{recentlyViewedSampleData.map((item) => <li key={item.id}>
            <button className="recent-viewed-item" type="button" onClick={() => setDetails(item)}>
              <CompanyMark company={item.company} />
              <span className="recent-role-copy"><strong>{item.title}</strong><small>{item.company} · {item.location}</small></span>
              <small className="recent-view-time">{daysAgoLabel(item.viewedDaysAgo)}</small>
            </button>
          </li>)}</ul>
          <p className="recent-history-note">Illustrative only; viewing history is not currently tracked.</p>
        </section>
      </aside>
    </div>

    <p className="saved-demo-note"><Check size={13} />{jobs.some((job) => job.isPersisted) ? 'Account bookmarks are loaded from Supabase. Remaining sample previews are temporary and are not saved to your account.' : 'Demo preview — these sample records and interactions are temporary and are not saved to your account.'}</p>
    <p className="saved-status-message" role="status" aria-live="polite">{statusMessage}</p>

    {details && <SavedJobDetails item={details} onClose={() => setDetails(null)} />}
    {pendingRemoval && <div className="saved-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingRemoval(null) }}>
      <section className="saved-details-dialog saved-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="remove-saved-title">
        <button className="saved-dialog-close" type="button" aria-label="Cancel removal" onClick={() => setPendingRemoval(null)}><X size={18} /></button>
        <span className="saved-confirm-icon"><Bookmark size={21} /></span>
        <h2 id="remove-saved-title">{pendingRemoval.isSample ? 'Remove this sample job?' : 'Remove this saved job?'}</h2>
        <p>{pendingRemoval.isSample ? `${pendingRemoval.title} at ${pendingRemoval.company} will be removed from this temporary list. This demo change is not permanent.` : `${pendingRemoval.title} at ${pendingRemoval.company} will be removed from your saved jobs.`}</p>
        <div className="saved-confirm-actions"><button type="button" onClick={() => setPendingRemoval(null)}>Cancel</button><button type="button" onClick={confirmRemove}>Remove job</button></div>
      </section>
    </div>}
  </section>
}
