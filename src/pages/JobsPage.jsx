import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Bookmark, BriefcaseBusiness, CalendarDays, ChevronDown, Clock3, DollarSign, ExternalLink, Info, MapPin, RotateCcw, Search, Wifi } from 'lucide-react'
import { searchHimalayasJobs } from '../services/himalayasJobsService'
import { useAuth } from '../hooks/useAuth'
import { loadSavedJobs, removeJobBookmark, saveJobBookmark } from '../services/userDataService.js'
import { listOpenNativeJobs } from '../services/nativeApplicationService.js'
import SectionBackButton from '../components/common/SectionBackButton'
import NativeApplicationDialog from '../components/applications/NativeApplicationDialog.jsx'
import HimalayasApplicationDialog from '../components/applications/HimalayasApplicationDialog.jsx'

const initialFilters = {
  employmentType: '',
  experienceLevel: '',
  workArrangement: '',
  datePosted: '',
  salary: '',
}

const filterConfig = [
  { key: 'employmentType', label: 'Job type', Icon: BriefcaseBusiness, options: ['Full Time', 'Part Time', 'Contract', 'Contractor', 'Internship', 'Freelance'] },
  { key: 'experienceLevel', label: 'Seniority', Icon: Clock3, options: ['Entry-level', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager'] },
  { key: 'workArrangement', label: 'Work arrangement', Icon: Wifi, options: ['Remote'] },
  { key: 'datePosted', label: 'Date posted', Icon: CalendarDays, options: ['Last 24 hours', 'Last 7 days', 'Last 30 days'] },
  { key: 'salary', label: 'Salary', Icon: DollarSign, options: ['Salary not specified', 'Salary provided'] },
]

function JobIllustration() {
  return <div className="jobs-hero-art" role="img" aria-label="Green briefcase and magnifying glass illustration">
    <div className="jobs-art-glow" />
    <div className="jobs-art-orbit orbit-a" />
    <div className="jobs-art-orbit orbit-b" />
    <span className="jobs-art-spark spark-one">✦</span>
    <span className="jobs-art-spark spark-two">✦</span>
    <span className="jobs-art-spark spark-three">✦</span>
    <div className="hero-briefcase"><i /><b /></div>
    <div className="hero-magnifier" />
    <span className="jobs-art-label label-career">Career</span>
    <span className="jobs-art-label label-job">Job</span>
    <span className="jobs-art-label label-growth">Growth</span>
  </div>
}

function JobCard({ job, saved, onToggleSaved, onPrepare, index, saving }) {
  const visibleSkills = job.skills.slice(0, 5)
  const applicationUrl = getSafeApplicationUrl(job.originalUrl)

  function openApplication() {
    if (applicationUrl) window.open(applicationUrl, '_blank', 'noopener,noreferrer')
  }

  return <article className="job-listing-card" style={{ '--job-stagger': `${index * 70}ms` }}>
    <div className={`job-company-tile company-${job.company.toLowerCase()}`} aria-hidden="true">
      {job.companyLogo ? <img src={job.companyLogo} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <BriefcaseBusiness size={27} strokeWidth={2.3} />}
    </div>
    <div className="job-listing-content">
      <div className="job-title-row">
        <h3>{job.title}</h3>
      </div>
      <div className="job-company-row">
        <span>{job.company}</span>
        <span className="verified-source"><BriefcaseBusiness size={12} />Himalayas listing</span>
      </div>
      <div className="job-meta-row">
        <span><MapPin size={14} />{job.location}</span>
        {job.employmentType && <span><BriefcaseBusiness size={14} />{job.employmentType}</span>}
        {job.seniority.length > 0 && <span><Clock3 size={14} />{job.seniority.join(', ')}</span>}
        <span><Wifi size={14} />Remote</span>
        <span><CalendarDays size={14} />{Number.isFinite(job.postedDaysAgo) ? `Updated ${job.postedDaysAgo} days ago` : 'Posting date unavailable'}</span>
        {job.salary && <span><DollarSign size={14} />{job.salary}</span>}
      </div>
      {job.description && <p className="job-description">{job.description}</p>}
      <div className="job-card-bottom">
        <div className="job-skills">{visibleSkills.length > 0 && <small>Categories</small>}{visibleSkills.map((skill) => <span key={skill}>{skill}</span>)}{job.skills.length > visibleSkills.length && <span>+{job.skills.length - visibleSkills.length} more</span>}</div>
        <div className="job-card-actions">
          <a className="job-provider" href="https://himalayas.app/docs/remote-jobs-api" target="_blank" rel="noopener noreferrer"><span className="provider-mark"><BriefcaseBusiness size={13} /></span>Himalayas</a>
          <button className="prepare-application-button" type="button" disabled={!applicationUrl} onClick={() => onPrepare(job)}>Prepare Application</button>
          <button className="apply-now-button" type="button" disabled={!applicationUrl} title={applicationUrl ? 'Opens the original application page in a new tab' : 'Application unavailable for this listing'} onClick={openApplication}>Apply Now <ExternalLink size={14} /></button>
          {!applicationUrl && <span className="application-unavailable" role="status">Application link unavailable</span>}
          <button className={`job-bookmark${saved ? ' saved' : ''}`} type="button" disabled={saving} aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`} aria-pressed={saved} onClick={() => onToggleSaved(job.id)} title="Save to your account">
            <Bookmark size={19} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  </article>
}

function NativeJobCard({ job, onApply }) {
  return <article className="native-job-card">
    <div className="native-job-card-heading">
      <div><span className="native-job-badge"><BriefcaseBusiness size={13} />SkillProof AI employer</span><h3>{job.title}</h3><p>{job.company_name}</p></div>
      <button className="apply-now-button" type="button" onClick={() => onApply(job)}>Apply on SkillProof AI <ArrowRight size={15} /></button>
    </div>
    <div className="native-job-meta">{job.location && <span><MapPin size={14} />{job.location}</span>}{job.employment_type && <span><BriefcaseBusiness size={14} />{job.employment_type}</span>}</div>
    <p className="native-job-description">{job.description}</p>
    {Array.isArray(job.required_fields) && job.required_fields.length > 0 && <small className="native-job-questions">{job.required_fields.length} additional application question{job.required_fields.length === 1 ? '' : 's'}</small>}
  </article>
}

function getSafeApplicationUrl(value) {
  if (typeof value !== 'string' || !value) return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null
    return value
  } catch {
    return null
  }
}

function formatSalary(job) {
  if (typeof job.minSalary !== 'number' && typeof job.maxSalary !== 'number') return null
  const currency = typeof job.currency === 'string' ? job.currency : ''
  const format = (amount) => `${currency ? `${currency} ` : ''}${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)}`
  const range = typeof job.minSalary === 'number' && typeof job.maxSalary === 'number'
    ? job.minSalary === job.maxSalary ? format(job.minSalary) : `${format(job.minSalary)}–${format(job.maxSalary)}`
    : format(job.minSalary ?? job.maxSalary)
  return `${range}${job.salaryPeriod ? ` / ${job.salaryPeriod}` : ''}`
}

export default function JobsPage() {
  const { user } = useAuth()
  const [searchDraft, setSearchDraft] = useState('')
  const [locationDraft, setLocationDraft] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [submittedLocation, setSubmittedLocation] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState('relevance')
  const [savedIds, setSavedIds] = useState([])
  const [savedJobError, setSavedJobError] = useState('')
  const [loadedSavedJobsUserId, setLoadedSavedJobsUserId] = useState('')
  const [savingJobIds, setSavingJobIds] = useState([])
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(null)
  const [pageSize, setPageSize] = useState(20)
  const [nativeJobs, setNativeJobs] = useState([])
  const [nativeJobsLoading, setNativeJobsLoading] = useState(true)
  const [nativeJobsError, setNativeJobsError] = useState('')
  const [selectedNativeJob, setSelectedNativeJob] = useState(null)
  const [selectedHimalayasJob, setSelectedHimalayasJob] = useState(null)
  const [applicationNotice, setApplicationNotice] = useState('')
  const searchRequestId = useRef(0)
  const savedJobsLoading = Boolean(user?.id && loadedSavedJobsUserId !== user.id)

  const runSearch = useCallback(async ({ query, country, pageNumber, seniority = '', employmentType = '' }) => {
    const requestId = searchRequestId.current + 1
    searchRequestId.current = requestId
    setJobsLoading(true)
    setJobsError('')
    setHasSearched(true)
    setJobs([])
    setPage(pageNumber)
    try {
      const result = await searchHimalayasJobs({
        q: query,
        country,
        seniority,
        employmentType,
        page: pageNumber,
      })
      if (requestId === searchRequestId.current) {
        setJobs(result.jobs.map((job) => ({ ...job, salary: formatSalary(job) })))
        setPage(result.page)
        setTotalCount(result.totalCount)
        setPageSize(result.limit)
      }
    } catch (error) {
      if (requestId === searchRequestId.current) {
        setJobs([])
        setTotalCount(null)
        setJobsError(error.message || 'Live job search failed. Please retry.')
      }
    } finally {
      if (requestId === searchRequestId.current) setJobsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    loadSavedJobs(user?.id).then((records) => {
      if (active) {
        setSavedIds(records.map((record) => record.job_id))
        setSavedJobError('')
        setLoadedSavedJobsUserId(user.id)
      }
    }).catch((error) => {
      if (active) {
        setSavedJobError(`Saved jobs could not be loaded from your account: ${error.message}`)
        setLoadedSavedJobsUserId(user.id)
      }
    })
    return () => { active = false }
  }, [user?.id])

  useEffect(() => {
    let active = true
    listOpenNativeJobs().then((items) => {
      if (active) {
        setNativeJobs(items)
        setNativeJobsError('')
      }
    }).catch((error) => {
      if (active) setNativeJobsError(error.message || 'SkillProof AI employer jobs could not be loaded.')
    }).finally(() => {
      if (active) setNativeJobsLoading(false)
    })
    return () => { active = false }
  }, [])
  const results = useMemo(() => jobs.filter((job) => {
    const dateMatch = !filters.datePosted
      || (Number.isFinite(job.postedDaysAgo) && filters.datePosted === 'Last 24 hours' && job.postedDaysAgo <= 1)
      || (Number.isFinite(job.postedDaysAgo) && filters.datePosted === 'Last 7 days' && job.postedDaysAgo <= 7)
      || (Number.isFinite(job.postedDaysAgo) && filters.datePosted === 'Last 30 days' && job.postedDaysAgo <= 30)
    const salaryMatch = !filters.salary
      || (filters.salary === 'Salary not specified' && !job.salary)
      || (filters.salary === 'Salary provided' && Boolean(job.salary))
    return dateMatch && salaryMatch
  }).sort((left, right) => {
    if (sort === 'recent') return (left.postedDaysAgo ?? Infinity) - (right.postedDaysAgo ?? Infinity)
    if (sort === 'company') return left.company.localeCompare(right.company)
    return 0
  }), [filters.datePosted, filters.salary, jobs, sort])

  function submitSearch(event) {
    event.preventDefault()
    const query = searchDraft.trim()
    const country = locationDraft.trim()
    setSubmittedSearch(query)
    setSubmittedLocation(country)
    void runSearch({ query, country, pageNumber: 1, seniority: filters.experienceLevel, employmentType: filters.employmentType })
  }

  function clearFilters() {
    setFilters(initialFilters)
    setSearchDraft('')
    setLocationDraft('')
    setSubmittedSearch('')
    setSubmittedLocation('')
    setSort('relevance')
    void runSearch({ query: '', country: '', pageNumber: 1 })
  }

  async function toggleSaved(id) {
    if (!user?.id) {
      setSavedJobError('Sign in to save jobs to your account.')
      return
    }
    if (savedJobsLoading || savingJobIds.includes(id)) return
    const job = jobs.find((item) => item.id === id)
    if (!job) return
    const removing = savedIds.includes(id)
    setSavedJobError('')
    setSavingJobIds((current) => [...current, id])
    try {
      if (removing) await removeJobBookmark(user.id, id)
      else await saveJobBookmark(user.id, job)
      setSavedIds((saved) => removing ? saved.filter((savedId) => savedId !== id) : [...new Set([...saved, id])])
    } catch (error) {
      setSavedJobError(`Saved-job change was not saved to your account: ${error.message}`)
    } finally {
      setSavingJobIds((current) => current.filter((savedId) => savedId !== id))
    }
  }

  return <div className="jobs-page">
    <SectionBackButton />

    <section className="jobs-hero">
      <div className="jobs-hero-copy">
        <span className="jobs-eyebrow">OPPORTUNITY DISCOVERY</span>
        <h1>Find your next <span>opportunity</span></h1>
        <p>Search jobs from trusted sources and find roles that match your skills.</p>
      </div>
      <JobIllustration />
    </section>

    <form className="jobs-search-form" onSubmit={submitSearch}>
      <label className="jobs-search-field keyword-field">
        <Search size={20} />
        <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Job title, skills, or company (e.g. Frontend Developer, React, Google)" aria-label="Job title, skills, or company" />
      </label>
      <label className="jobs-search-field location-field">
        <MapPin size={19} />
        <input value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} placeholder="Country (e.g. US or India)" aria-label="Country" />
      </label>
      <button className="jobs-search-submit" type="submit">Search Jobs <ArrowRight size={17} /></button>
    </form>

    <div className="jobs-filters" aria-label="Filter jobs">
      {filterConfig.map(({ key, label, Icon, options }) => <label className={`jobs-filter${filters[key] ? ' filter-selected' : ''}`} key={key}>
        <Icon size={16} />
        <span className="filter-label">{filters[key] || label}</span>
        <select aria-label={label} value={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}>
          <option value="">{label}</option>
          {options.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
        <ChevronDown size={14} className="filter-chevron" aria-hidden="true" />
      </label>)}
      <button className="clear-jobs-filters" type="button" onClick={clearFilters}><RotateCcw size={16} />Clear filters</button>
    </div>

    <section className="native-jobs-section" aria-labelledby="native-jobs-title">
      <div className="native-jobs-heading"><div><span className="jobs-eyebrow">DIRECT APPLICATIONS</span><h2 id="native-jobs-title">SkillProof AI employer jobs</h2><p>Apply directly to participating employers. These submissions are delivered to their authenticated recruiter dashboard.</p></div></div>
      {nativeJobsLoading && <p className="native-jobs-state" role="status">Loading employer-managed jobs…</p>}
      {nativeJobsError && <p className="native-jobs-state native-jobs-error" role="alert">{nativeJobsError}</p>}
      {!nativeJobsLoading && !nativeJobsError && nativeJobs.length === 0 && <p className="native-jobs-state">No employer-managed SkillProof AI jobs are open right now.</p>}
      <div className="native-jobs-list">{nativeJobs.map((job) => <NativeJobCard key={job.id} job={job} onApply={setSelectedNativeJob} />)}</div>
    </section>

    <section className="jobs-results" aria-labelledby="matching-jobs-title">
      <div className="jobs-results-toolbar">
        <div className="jobs-results-title">
          <h2 id="matching-jobs-title">Matching jobs</h2>
          <span className="jobs-result-count">{totalCount === null ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : `${totalCount.toLocaleString()} matching listings`}</span>
          <a className="jobs-api-note" href="https://himalayas.app/docs/remote-jobs-api" target="_blank" rel="noopener noreferrer">Live listings via Himalayas <Info size={14} /></a>
        </div>
        <label className="jobs-sort-control"><span>Sort by:</span><span className="sort-select-wrap">
          <select aria-label="Sort jobs" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="recent">Most recent</option>
            <option value="company">Company name</option>
          </select><ChevronDown size={15} aria-hidden="true" />
        </span></label>
      </div>
      <div className="jobs-results-list" aria-live="polite">
        {jobsLoading && <div className="jobs-empty-state" role="status"><Search size={24} /><h3>Searching live job listings…</h3><p>Fetching current results from Himalayas.</p></div>}
        {jobsError && <div className="jobs-empty-state" role="alert"><Info size={24} /><h3>Live job search is unavailable</h3><p>{jobsError}</p><button type="button" disabled={jobsLoading} onClick={() => runSearch({ query: submittedSearch, country: submittedLocation, pageNumber: page, seniority: filters.experienceLevel, employmentType: filters.employmentType })}>Retry search</button></div>}
        {!hasSearched && !jobsLoading && <div className="jobs-empty-state"><Search size={24} /><h3>Search live remote jobs</h3><p>Enter a role, skills, or company to load current listings from Himalayas.</p></div>}
        {!jobsLoading && !jobsError && results.map((job, index) => <JobCard key={job.id} job={job} index={index} saved={savedIds.includes(job.id)} saving={savedJobsLoading || savingJobIds.includes(job.id)} onToggleSaved={toggleSaved} onPrepare={setSelectedHimalayasJob} />)}
        {!jobsLoading && !jobsError && hasSearched && results.length === 0 && <div className="jobs-empty-state"><Search size={24} /><h3>No live listings match these filters</h3><p>Try another keyword or country, adjust filters, or clear all filters to search current Himalayas listings.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
        {!jobsLoading && !jobsError && jobs.length > 0 && <div className="jobs-pagination"><button type="button" disabled={page <= 1} onClick={() => runSearch({ query: submittedSearch, country: submittedLocation, pageNumber: page - 1, seniority: filters.experienceLevel, employmentType: filters.employmentType })}>Previous</button><span>Page {page}</span><button type="button" disabled={jobs.length < pageSize || (totalCount !== null && page * pageSize >= totalCount)} onClick={() => runSearch({ query: submittedSearch, country: submittedLocation, pageNumber: page + 1, seniority: filters.experienceLevel, employmentType: filters.employmentType })}>Next</button></div>}
      </div>
      {savedJobError && <p className="jobs-demo-disclaimer" role="alert">{savedJobError}</p>}
    </section>
    <p className="jobs-demo-disclaimer">Live job information is provided by <a href="https://himalayas.app/jobs" target="_blank" rel="noopener noreferrer">Himalayas</a>. Apply links lead to the listing’s Himalayas applicationLink. See the <a href="https://himalayas.app/terms#api" target="_blank" rel="noopener noreferrer">Himalayas API terms</a>.</p>
    {applicationNotice && <p className="jobs-demo-disclaimer" role="status">{applicationNotice}</p>}
    {selectedNativeJob && <NativeApplicationDialog job={selectedNativeJob} user={user} onClose={() => setSelectedNativeJob(null)} onSubmitted={(application) => setApplicationNotice(`Application submitted to ${application.companyName}; it is available in the employer's authenticated recruiter dashboard.`)} />}
    {selectedHimalayasJob && <HimalayasApplicationDialog job={selectedHimalayasJob} user={user} onClose={() => setSelectedHimalayasJob(null)} onNotice={setApplicationNotice} />}
  </div>
}
