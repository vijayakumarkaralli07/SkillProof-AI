import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  CloudSun,
  Code2,
  ExternalLink,
  FileCode2,
  FileText,
  FolderOpen,
  Heart,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Monitor,
  Play,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  StickyNote,
  Trophy,
  Users,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  addCareerProjectToPortfolio,
  careerProjectReviewChecks,
  careerProjectSetupChecks,
  careerProjects,
  createCareerProjectAttempt,
  createCareerProjectPreview,
  getCareerProject,
  getCareerProjectProgress,
  loadCareerProjectSession,
  saveCareerProjectSession,
  updateCareerProjectAttempt,
} from '../services/careerProjectsService.js'
import { loadCareerProjects, saveCareerProjects } from '../services/userDataService.js'
import '../styles/career-projects.css'

const CodingCodeEditor = lazy(() => import('./CodingCodeEditor.jsx'))

const projectIcons = {
  'portfolio-site': Monitor,
  'task-management-app': ListChecks,
  'weather-dashboard': CloudSun,
  'notes-application': StickyNote,
  'blog-platform': FileText,
  'e-commerce-store': ShoppingBag,
}
const projectTabs = ['Explore Projects', 'My Projects', 'Project Templates', 'My Portfolio']
const reviewItems = careerProjectReviewChecks.map(({ id, label }) => [id, label])
const setupItems = careerProjectSetupChecks.map(({ id, label }) => [id, label])
const technologies = [...new Set(careerProjects.flatMap((project) => project.technologies))]
const categories = [...new Set(careerProjects.map((project) => project.category))]
const difficultyLevels = ['Beginner', 'Intermediate']
const durations = ['2–3 weeks', '3–4 weeks', '4–6 weeks', '5–7 weeks']
const docs = [
  ['HTML reference', 'https://developer.mozilla.org/en-US/docs/Web/HTML'],
  ['CSS reference', 'https://developer.mozilla.org/en-US/docs/Web/CSS'],
  ['JavaScript guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'],
]
const fileLabels = { html: 'index.html', css: 'styles.css', js: 'script.js' }
const languageByFile = { html: 'HTML', css: 'CSS', js: 'JavaScript' }

function ProjectIcon({ project, size = 20 }) {
  const Icon = projectIcons[project?.id] || BriefcaseBusiness
  return <span className={`cp-project-icon cp-icon-${project?.id || 'default'}`}><Icon size={size} /></span>
}

function ProjectProgress({ value }) {
  return <div className="cp-progress" role="progressbar" aria-label="Project milestone progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <span style={{ width: `${value}%` }} />
  </div>
}

function ProjectTabs({ active, onSelect }) {
  return <nav className="cp-tabs" aria-label="Build Real Projects">
    {projectTabs.map((tab) => <button
      key={tab}
      type="button"
      className={active === tab ? 'active' : ''}
      aria-current={active === tab ? 'page' : undefined}
      onClick={() => onSelect(tab)}
    >{tab}</button>)}
  </nav>
}

function ProjectCard({ project, saved, attempt, isTemplate, onSave, onOpen }) {
  const progress = getCareerProjectProgress(project, attempt)
  return <article className="cp-project-card">
    <div className={`cp-project-art cp-art-${project.id}`}>
      <span className="cp-art-orbit" />
      <ProjectIcon project={project} size={28} />
      <span className="cp-art-caption">{project.category}</span>
      <button type="button" className={`cp-save-button${saved ? ' saved' : ''}`} aria-label={saved ? `Remove ${project.title} from saved projects` : `Save ${project.title}`} aria-pressed={saved} onClick={onSave}>
        <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </div>
    <div className="cp-project-card-body">
      <div className="cp-project-card-title"><h3>{project.title}</h3><span className={`cp-difficulty ${project.difficulty.toLowerCase()}`}>{project.difficulty}</span></div>
      <p>{project.description}</p>
      <div className="cp-tag-list">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
      <div className="cp-card-meta"><span><Clock3 size={14} />{project.duration}</span><span>{project.milestones.length} milestones</span></div>
      {attempt && <div className="cp-card-progress"><ProjectProgress value={progress} /><small>{progress}% complete · {attempt.status === 'submitted' ? 'Awaiting review' : 'In progress'}</small></div>}
      <button type="button" className="cp-primary-button cp-card-action" onClick={onOpen}>{attempt ? 'Continue Project' : isTemplate ? 'Use Template' : 'View Details'}<ArrowRight size={15} /></button>
    </div>
  </article>
}

function ProjectListing({ savedIds, attempts, templates, onOpen, onSave, onMyProjects }) {
  const [search, setSearch] = useState('')
  const [technology, setTechnology] = useState('All Technologies')
  const [difficulty, setDifficulty] = useState('All Levels')
  const [category, setCategory] = useState('All Categories')
  const [duration, setDuration] = useState('Any Duration')
  const filteredProjects = useMemo(() => careerProjects.filter((project) => {
    const matchesSearch = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
      && (technology === 'All Technologies' || project.technologies.includes(technology))
      && (difficulty === 'All Levels' || project.difficulty === difficulty)
      && (category === 'All Categories' || project.category === category)
      && (duration === 'Any Duration' || project.duration === duration)
  }), [category, difficulty, duration, search, technology])
  const attemptByProject = new Map(attempts.map((attempt) => [attempt.projectId, attempt]))
  return <section className="cp-listing">
    <div className="cp-listing-toolbar">
      <label className="cp-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects, technologies..." aria-label="Search projects and technologies" /></label>
      <label className="cp-filter"><span>Technology</span><select value={technology} onChange={(event) => setTechnology(event.target.value)}><option>All Technologies</option>{technologies.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="cp-filter"><span>Level</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>All Levels</option>{difficultyLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="cp-filter"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All Categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="cp-filter cp-duration-filter"><span>Duration</span><select value={duration} onChange={(event) => setDuration(event.target.value)}><option>Any Duration</option>{durations.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    <div className="cp-listing-heading"><div><h2>{templates ? 'Project Templates' : 'Choose a project to build'}</h2><p>{filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'} match your filters</p></div><button type="button" className="cp-text-button" onClick={onMyProjects}>My Projects<ArrowRight size={14} /></button></div>
    {filteredProjects.length ? <div className="cp-project-grid">
      {filteredProjects.map((project) => {
        const attempt = attemptByProject.get(project.id)
        return <ProjectCard
          key={project.id}
          project={project}
          saved={savedIds.includes(project.id)}
          attempt={attempt}
          isTemplate={templates}
          onSave={() => onSave(project)}
          onOpen={() => onOpen(project, attempt)}
        />
      })}
    </div> : <div className="cp-empty"><Search size={28} /><h3>No projects found</h3><p>Try changing your search or filters.</p></div>}
  </section>
}

function MyProjects({ session, activeTab, onTabChange, onContinue, onExplore, onPortfolio }) {
  const attempts = [...session.attempts].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  const visible = attempts.filter((attempt) => {
    if (activeTab === 'Active Projects') return attempt.status !== 'completed'
    if (activeTab === 'Completed Projects') return attempt.status === 'completed'
    return true
  })
  return <section className="cp-my-projects">
    <div className="cp-listing-heading"><div><h2>Track your project work</h2><p>Your saved work is isolated to this signed-in account’s browser session.</p></div><button type="button" className="cp-secondary-button" onClick={onPortfolio}><Bookmark size={15} />My Portfolio</button></div>
    <div className="cp-project-subtabs" role="tablist" aria-label="Project progress filters">
      {['Active Projects', 'Completed Projects', 'All Projects'].map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} onClick={() => onTabChange(tab)}>{tab}<span>{attempts.filter((attempt) => tab === 'All Projects' || (tab === 'Active Projects' ? attempt.status !== 'completed' : attempt.status === 'completed')).length}</span></button>)}
    </div>
    {visible.length ? <div className="cp-attempt-list">{visible.map((attempt) => {
      const project = getCareerProject(attempt.projectId)
      if (!project) return null
      const progress = getCareerProjectProgress(project, attempt)
      const nextAction = attempt.status === 'submitted' ? 'Review Submission' : progress === 100 ? 'Final Review' : 'Continue'
      return <article className="cp-attempt-row" key={attempt.id}>
        <ProjectIcon project={project} size={23} />
        <div className="cp-attempt-main"><div><h3>{project.title}</h3><span className={`cp-status ${attempt.status}`}>{attempt.status === 'submitted' ? 'Submitted · awaiting review' : attempt.status === 'completed' ? 'Completed' : 'In Progress'}</span></div><div className="cp-tag-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div><ProjectProgress value={progress} /><small>{progress}% milestone progress · Updated {attempt.updatedAt.slice(0, 10)}</small></div>
        <button type="button" className="cp-primary-button" onClick={() => onContinue(project, attempt)}>{nextAction}<ArrowRight size={14} /></button>
      </article>
    })}</div> : <div className="cp-empty"><FolderOpen size={30} /><h3>{activeTab === 'Completed Projects' ? 'No reviewed projects yet' : 'No projects started yet'}</h3><p>{activeTab === 'Completed Projects' ? 'A submitted project stays awaiting review until a real review service is connected.' : 'Start a project to save milestones and your code in this browser session.'}</p><button type="button" className="cp-primary-button" onClick={onExplore}>Explore Projects<ArrowRight size={14} /></button></div>}
  </section>
}

function ProjectDetails({ project, attempt, saved, onSave, onStart, onResume }) {
  const Icon = projectIcons[project.id] || Code2
  return <section className="cp-detail-layout">
    <div className={`cp-detail-visual cp-art-${project.id}`}><span className="cp-art-orbit" /><Icon size={54} /><strong>{project.title}</strong><small>Sample project preview</small><div className="cp-mini-preview"><i /><i /><i /><span /></div></div>
    <div className="cp-detail-content">
      <div className="cp-detail-heading"><span className="cp-eyebrow">{project.category} · {project.difficulty} · {project.duration}</span><button type="button" className={`cp-save-inline${saved ? ' saved' : ''}`} aria-pressed={saved} onClick={onSave}><Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save project'}</button></div>
      <h2>{project.title}</h2><p className="cp-detail-overview">{project.overview}</p>
      <div className="cp-info-grid">
        <section><h3><CheckCircle2 size={16} />Project features</h3><ul>{project.features.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3><Lightbulb size={16} />What you’ll practise</h3><ul>{project.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
      <section className="cp-detail-section"><h3>Skills and technologies</h3><div className="cp-tag-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div></section>
      <section className="cp-detail-section"><h3>Prerequisites</h3><ul>{project.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="cp-detail-section"><h3>Project milestones</h3><ol className="cp-milestone-preview">{project.milestones.map((milestone) => <li key={milestone.id}><span>{milestone.title}</span><small>{milestone.objective}</small></li>)}</ol></section>
      <div className="cp-detail-actions">
        {attempt
          ? <button type="button" className="cp-primary-button" onClick={onResume}>{attempt.status === 'submitted' ? 'Review Submission' : 'Resume Project'}<ArrowRight size={15} /></button>
          : <button type="button" className="cp-primary-button" onClick={onStart}>Start This Project<Rocket size={15} /></button>}
      </div>
    </div>
  </section>
}

function ProjectSetup({ project, attempt, onCheck, onContinue }) {
  return <section className="cp-setup">
    <div className="cp-setup-heading"><ProjectIcon project={project} size={24} /><div><span className="cp-eyebrow">{project.difficulty} · {project.duration}</span><h2>Set up {project.title}</h2><p>{project.overview}</p></div></div>
    <div className="cp-setup-grid">
      <section className="cp-panel"><h3><ListChecks size={17} />Before you begin</h3>{setupItems.map(([id, label]) => <label className="cp-check-row" key={id}><input type="checkbox" checked={attempt.setupChecks.includes(id)} onChange={() => onCheck(id)} /><span>{label}</span></label>)}<div className="cp-info-banner"><Monitor size={17} /><span><b>Browser demo workspace</b><small>Available here: edit HTML, CSS, and JavaScript and preview them in an isolated frame. Your files remain in this browser session.</small></span></div><div className="cp-unavailable-option"><LockKeyhole size={16} /><span><b>Local VS Code connection</b><small>Not connected. This app cannot create or open a local project folder.</small></span></div></section>
      <section className="cp-panel"><h3><TargetIcon />Expected outcome</h3><p>Build a small, responsive {project.title.toLowerCase()} prototype. It is a learning sample, not a deployed or production service.</p><h4>Tools and technologies</h4><div className="cp-tag-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div><h4>Milestone plan</h4><ol className="cp-setup-milestones">{project.milestones.map((milestone) => <li key={milestone.id}><b>{milestone.title}</b><small>{milestone.acceptanceCriteria.length} learner self-checks</small></li>)}</ol></section>
    </div>
    <div className="cp-setup-actions"><button type="button" className="cp-primary-button" disabled={!setupItems.every(([id]) => attempt.setupChecks.includes(id))} onClick={onContinue}>Continue to Project Workspace<ArrowRight size={15} /></button></div>
  </section>
}

function TargetIcon() {
  return <ShieldCheck size={17} />
}

function ProjectMilestoneList({ project, attempt, activeMilestone, onSelect }) {
  const completed = new Set(attempt.milestoneIds)
  const currentAllowedIndex = Math.min(project.milestones.findIndex((milestone) => !completed.has(milestone.id)), project.milestones.length - 1)
  return <aside className="cp-milestone-sidebar">
    <div className="cp-side-heading"><h3>Project Guide</h3><span>{completed.size}/{project.milestones.length}</span></div>
    <ol>{project.milestones.map((milestone, index) => {
      const isComplete = completed.has(milestone.id)
      const locked = !isComplete && index > currentAllowedIndex
      return <li key={milestone.id}>
        <button type="button" className={`${activeMilestone.id === milestone.id ? 'active' : ''}${isComplete ? ' complete' : ''}`} aria-current={activeMilestone.id === milestone.id ? 'step' : undefined} disabled={locked} onClick={() => onSelect(milestone.id)}>
          <span className="cp-milestone-index">{isComplete ? <Check size={13} /> : locked ? <LockKeyhole size={12} /> : index + 1}</span><span><b>{milestone.title}</b><small>{isComplete ? 'Completed' : locked ? 'Locked' : 'Ready to start'}</small></span>
        </button>
      </li>
    })}</ol>
    <div className="cp-overall-progress"><div><span>Overall progress</span><b>{getCareerProjectProgress(project, attempt)}%</b></div><ProjectProgress value={getCareerProjectProgress(project, attempt)} /></div>
  </aside>
}

function MilestoneGuide({ project, milestone, attempt, readOnly, onCriteria, onComplete, onNext, allComplete, onReview }) {
  const checked = attempt.checkedCriteria[milestone.id] || []
  const complete = attempt.milestoneIds.includes(milestone.id)
  return <div className="cp-guide-content">
    <span className="cp-eyebrow">MILESTONE {project.milestones.indexOf(milestone) + 1} OF {project.milestones.length}</span>
    <h2>{milestone.title}</h2><p className="cp-milestone-objective">{milestone.objective}</p>
    <div className="cp-guide-block"><h3>Step-by-step guide</h3><ol>{milestone.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol></div>
    <div className="cp-concept-callout"><Lightbulb size={17} /><div><b>Concepts to keep in mind</b><span>{milestone.concepts}</span></div></div>
    <div className="cp-guide-block"><h3>Acceptance criteria</h3><p>These are your own review checks; they do not run automated tests or inspect your code.</p>{milestone.acceptanceCriteria.map((criterion, index) => <label className="cp-check-row" key={criterion}><input type="checkbox" checked={checked.includes(index)} disabled={complete || readOnly} onChange={() => onCriteria(milestone.id, index)} /><span>{criterion}</span></label>)}</div>
    <div className="cp-milestone-actions">
      {complete ? <span className="cp-complete-message"><CheckCircle2 size={17} />Milestone marked complete</span> : <button type="button" className="cp-primary-button" disabled={checked.length < milestone.acceptanceCriteria.length} onClick={() => onComplete(milestone)}><Check size={15} />Mark Milestone Complete</button>}
      {allComplete
        ? <button type="button" className="cp-primary-button" onClick={onReview}>Go to Final Review<ArrowRight size={15} /></button>
        : <button type="button" className="cp-secondary-button" disabled={!complete} onClick={onNext}>Next Milestone<ArrowRight size={15} /></button>}
    </div>
  </div>
}

function ProjectWorkspace({ project, attempt, milestone, activeTab, onTab, onUpdateFile, onSelectFile, onSelectMilestone, onCriteria, onComplete, onPrevious, onNext, onReview }) {
  const [previewVersion, setPreviewVersion] = useState(0)
  const allComplete = attempt.milestoneIds.length === project.milestones.length
  const readOnly = attempt.status === 'submitted'
  const fileKeys = Object.keys(project.files)
  const preview = createCareerProjectPreview(attempt.files)
  return <section className="cp-workspace">
    <header className="cp-workspace-heading"><div><div className="cp-workspace-title"><ProjectIcon project={project} /><div><h2>{project.title}</h2><span className={`cp-status ${attempt.status}`}>{attempt.status === 'submitted' ? 'Submitted · awaiting review' : 'In Progress'}</span></div></div></div><div className="cp-workspace-progress"><span>{getCareerProjectProgress(project, attempt)}% complete</span><ProjectProgress value={getCareerProjectProgress(project, attempt)} /></div></header>
    <div className="cp-workspace-grid">
      <ProjectMilestoneList project={project} attempt={attempt} activeMilestone={milestone} onSelect={onSelectMilestone} />
      <div className="cp-workspace-main">
        <nav className="cp-workspace-tabs" aria-label="Project workspace">
          {[['guide', 'Project Guide'], ['code', 'Code Editor'], ['preview', 'Preview'], ['resources', 'Resources']].map(([tab, label]) => <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} aria-selected={activeTab === tab} onClick={() => onTab(tab)}>{label}</button>)}
        </nav>
        {activeTab === 'guide' && <MilestoneGuide project={project} milestone={milestone} attempt={attempt} readOnly={readOnly} onCriteria={onCriteria} onComplete={onComplete} onNext={onNext} allComplete={allComplete} onReview={onReview} />}
        {activeTab === 'code' && <div className="cp-editor-pane">
          <div className="cp-editor-toolbar"><div className="cp-file-tabs" role="tablist" aria-label="Project files">{fileKeys.map((key) => <button type="button" role="tab" key={key} aria-selected={attempt.activeFile === key} className={attempt.activeFile === key ? 'active' : ''} onClick={() => onSelectFile(key)}><FileCode2 size={14} />{fileLabels[key]}</button>)}</div><span className="cp-saved-label"><Check size={13} />Session draft auto-saved</span></div>
          <Suspense fallback={<div className="cp-editor-placeholder" role="status">Loading code editor…</div>}><CodingCodeEditor language={languageByFile[attempt.activeFile]} value={attempt.files[attempt.activeFile] || ''} onChange={(value) => onUpdateFile(attempt.activeFile, value)} editable={!readOnly} height="min(55vh, 530px)" /></Suspense>
          <p className="cp-editor-note">Edits are kept in this browser session for the signed-in account. No server-side code execution is available.</p>
        </div>}
        {activeTab === 'preview' && <div className="cp-preview-pane"><div className="cp-preview-toolbar"><div><b>Isolated browser preview</b><small>HTML, CSS, and JavaScript only · not deployed</small></div><button type="button" className="cp-secondary-button" onClick={() => setPreviewVersion((version) => version + 1)}><Play size={14} />Refresh Preview</button></div><iframe key={previewVersion} title={`${project.title} sample preview`} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={preview} /><p className="cp-editor-note">The preview runs in a sandboxed frame. The app does not provide a connected console, test runner, backend, or deployment service.</p></div>}
        {activeTab === 'resources' && <div className="cp-resources"><span className="cp-eyebrow">SAMPLE LEARNING RESOURCES</span><h2>Documentation to help you build</h2><p>Official references for the technologies used in this browser-based sample workspace.</p>{docs.map(([title, href]) => <a href={href} target="_blank" rel="noreferrer" key={title}><span><FileText size={17} /><b>{title}</b></span><ExternalLink size={15} /></a>)}</div>}
        <div className="cp-workspace-footer"><button type="button" className="cp-secondary-button" disabled={project.milestones[0].id === milestone.id} onClick={onPrevious}><ArrowLeft size={14} />Previous Milestone</button><button type="button" className="cp-secondary-button" onClick={() => onTab('code')}><Code2 size={14} />Code Editor</button>{readOnly ? <span className="cp-complete-message"><CheckCircle2 size={16} />Submitted · read only</span> : <button type="button" className="cp-primary-button" disabled={!attempt.milestoneIds.includes(milestone.id)} onClick={() => allComplete ? onReview() : onNext()}>{allComplete ? 'Final Review' : 'Next Milestone'}<ArrowRight size={14} /></button>}</div>
      </div>
    </div>
  </section>
}

function ProjectReview({ project, attempt, onCheck, onSubmit }) {
  const checks = new Set(attempt.reviewChecks)
  const modified = Object.entries(project.files).filter(([key, value]) => attempt.files[key] !== value).length
  const canSubmit = project.milestones.every((milestone) => attempt.milestoneIds.includes(milestone.id))
    && reviewItems.every(([id]) => checks.has(id))
    && modified > 0
  return <section className="cp-review">
    <div className="cp-review-header"><span className="cp-success-icon"><ShieldCheck size={27} /></span><div><span className="cp-eyebrow">FINAL REVIEW</span><h2>Review {project.title}</h2><p>Check your work before submitting this sample project for review.</p></div></div>
    <div className="cp-review-grid">
      <div className="cp-panel"><h3>Milestones</h3>{project.milestones.map((milestone) => <p className="cp-review-status" key={milestone.id}><CheckCircle2 size={16} />{milestone.title}<span>{attempt.milestoneIds.includes(milestone.id) ? 'Done' : 'Not complete'}</span></p>)}</div>
      <div className="cp-panel"><h3>Project files</h3>{Object.keys(project.files).map((key) => <p className="cp-review-status" key={key}><FileCode2 size={16} />{fileLabels[key]}<span>{attempt.files[key]?.trim() ? 'Present' : 'Empty'}</span></p>)}<p className="cp-review-note">{modified ? `${modified} file${modified === 1 ? '' : 's'} changed from the sample starter.` : 'Change at least one starter file before submitting.'}</p></div>
    </div>
    <section className="cp-panel cp-review-checks"><h3>Review checklist</h3><p>These are acknowledgements, not automated test results. Submission will be marked as awaiting review.</p>{reviewItems.map(([id, label]) => <label className="cp-check-row" key={id}><input type="checkbox" checked={checks.has(id)} onChange={() => onCheck(id)} /><span>{label}</span></label>)}</section>
    <div className="cp-review-actions"><button type="button" className="cp-primary-button" disabled={!canSubmit} onClick={onSubmit}>Submit Project<ArrowRight size={15} /></button></div>
  </section>
}

function ProjectCompletion({ project, attempt, onView, onPortfolio, onMyProjects, portfolioError }) {
  return <section className="cp-completion">
    <div className="cp-completion-decoration" aria-hidden="true"><span /><span /></div>
    <span className="cp-completion-icon"><Trophy size={36} /></span>
    <span className="cp-eyebrow">PROJECT SUBMITTED</span>
    <h2>Submission received</h2>
    <p>Your {project.title} project was submitted from this browser session. It has not been externally reviewed or scored.</p>
    <div className="cp-completion-stats"><div><CheckCircle2 size={22} /><b>{getCareerProjectProgress(project, attempt)}%</b><small>Milestones</small></div><div><Clock3 size={22} /><b>{project.milestones.length}/{project.milestones.length}</b><small>Self-checked</small></div><div><FileCode2 size={22} /><b>{project.technologies.length}</b><small>Technologies</small></div></div>
    <div className="cp-completion-status"><span className="cp-status submitted">Submitted · awaiting review</span><small>No evaluation score is available. My Portfolio publishing is not connected.</small></div>
    {portfolioError && <p className="cp-portfolio-error" role="alert">{portfolioError}</p>}
    <div className="cp-completion-actions"><button type="button" className="cp-secondary-button" onClick={onView}>View Project</button><button type="button" className="cp-secondary-button" onClick={onPortfolio}>Add to Portfolio</button><button type="button" className="cp-primary-button" onClick={onMyProjects}>Go to My Projects<ArrowRight size={14} /></button></div>
  </section>
}

function MyPortfolio({ savedIds, onExplore }) {
  return <section className="cp-portfolio">
    <span className="cp-portfolio-icon"><BriefcaseBusiness size={29} /></span><h2>My Portfolio</h2>
    <p>Project publishing is not connected to a portfolio service in this app. Your project code remains private in this browser session and has not been published.</p>
    <div className="cp-info-banner"><ShieldCheck size={18} /><span><b>No project data was shared</b><small>There is no public portfolio entry or external URL to show. You can keep working on projects locally in this session.</small></span></div>
    <p className="cp-portfolio-saved">{savedIds.length} project{savedIds.length === 1 ? '' : 's'} saved to your project shortlist.</p><button type="button" className="cp-primary-button" onClick={onExplore}>Explore Projects<ArrowRight size={14} /></button>
  </section>
}

function CareerProjectsPage({ userId }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [initialState] = useState(() => loadCareerProjectSession(userId))
  const [session, setSession] = useState(initialState.data)
  const [storageError, setStorageError] = useState(initialState.error)
  const [databaseLoaded, setDatabaseLoaded] = useState(false)
  const syncTimer = useRef(null)
  const [projectTab, setProjectTab] = useState('Active Projects')
  const [portfolioError, setPortfolioError] = useState('')
  const params = new URLSearchParams(location.search)
  const screen = params.get('projects') || 'explore'
  const project = getCareerProject(params.get('project'))
  const requestedAttempt = session.attempts.find((item) => item.id === params.get('attempt') && item.projectId === project?.id)
  const attempt = requestedAttempt || session.attempts
    .filter((item) => item.projectId === project?.id)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]
  const activeMilestone = project?.milestones.find((item) => item.id === params.get('milestone'))
    || project?.milestones.find((item) => !attempt?.milestoneIds.includes(item.id))
    || project?.milestones[0]
  const [workspaceTab, setWorkspaceTab] = useState('guide')

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    loadCareerProjects(userId).then((databaseSession) => {
      if (!active) return
      setSession((current) => {
        const attempts = new Map(current.attempts.map((item) => [item.id, item]))
        databaseSession.attempts.forEach((item) => {
          const local = attempts.get(item.id)
          const localUpdatedAt = Date.parse(local?.updatedAt || '') || 0
          const databaseUpdatedAt = Date.parse(item.updatedAt || '') || 0
          if (!local || databaseUpdatedAt >= localUpdatedAt) attempts.set(item.id, item)
        })
        return {
          savedProjectIds: [...new Set([...databaseSession.savedProjectIds, ...current.savedProjectIds])],
          attempts: [...attempts.values()],
        }
      })
      setStorageError('')
      setDatabaseLoaded(true)
    }).catch((error) => {
      if (active) {
        setStorageError(`Database project sync unavailable; this browser session remains the fallback: ${error.message}`)
      }
    })
    return () => { active = false }
  }, [userId])

  useEffect(() => {
    if (!userId || !databaseLoaded) return undefined
    window.clearTimeout(syncTimer.current)
    syncTimer.current = window.setTimeout(() => {
      saveCareerProjects(userId, session).then(() => {
        setStorageError((current) => current.startsWith('Database project sync unavailable') ? '' : current)
      }).catch((error) => {
        setStorageError(`Project progress is available only in this browser session until database sync succeeds: ${error.message}`)
      })
    }, 450)
    return () => window.clearTimeout(syncTimer.current)
  }, [databaseLoaded, session, userId])

  function routeTo(nextScreen, nextProject, nextAttempt, milestoneId) {
    const next = new URLSearchParams()
    next.set('projects', nextScreen)
    if (nextProject) next.set('project', nextProject)
    if (nextAttempt) next.set('attempt', nextAttempt)
    if (milestoneId) next.set('milestone', milestoneId)
    navigate(`${location.pathname}?${next.toString()}`, { state: { fromProjectWorkflow: true } })
  }

  function commitSession(next, requireSave = false) {
    const error = saveCareerProjectSession(userId, next)
    setStorageError(error)
    if (!requireSave || !error) setSession(next)
    return !error
  }

  function updateAttempt(attemptId, patch, requireSave = false) {
    const current = session.attempts.find((item) => item.id === attemptId)
    if (!current) return false
    const updated = updateCareerProjectAttempt(current, patch)
    return commitSession({ ...session, attempts: session.attempts.map((item) => item.id === attemptId ? updated : item) }, requireSave)
  }

  function toggleSaved(selected) {
    const saved = session.savedProjectIds.includes(selected.id)
    const nextIds = saved ? session.savedProjectIds.filter((id) => id !== selected.id) : [...session.savedProjectIds, selected.id]
    commitSession({ ...session, savedProjectIds: nextIds })
  }

  function toggleSetup(id) {
    const next = attempt.setupChecks.includes(id)
      ? attempt.setupChecks.filter((item) => item !== id)
      : [...attempt.setupChecks, id]
    updateAttempt(attempt.id, { setupChecks: next })
  }

  function toggleCriteria(milestoneId, index) {
    const checked = attempt.checkedCriteria[milestoneId] || []
    const next = checked.includes(index) ? checked.filter((item) => item !== index) : [...checked, index]
    updateAttempt(attempt.id, { checkedCriteria: { ...attempt.checkedCriteria, [milestoneId]: next } })
  }

  function completeMilestone(milestone) {
    const checked = attempt.checkedCriteria[milestone.id] || []
    if (checked.length !== milestone.acceptanceCriteria.length) return
    updateAttempt(attempt.id, { milestoneIds: [...new Set([...attempt.milestoneIds, milestone.id])] })
  }

  function toggleReview(id) {
    const next = attempt.reviewChecks.includes(id)
      ? attempt.reviewChecks.filter((item) => item !== id)
      : [...attempt.reviewChecks, id]
    updateAttempt(attempt.id, { reviewChecks: next })
  }

  function startProject(selected) {
    const existing = session.attempts
      .filter((item) => item.projectId === selected.id && item.status !== 'completed')
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]
    if (existing) {
      routeTo(existing.status === 'submitted' ? 'completion' : 'workspace', selected.id, existing.id)
      return
    }
    const created = createCareerProjectAttempt(selected)
    commitSession({ ...session, attempts: [...session.attempts, created] })
    routeTo('setup', selected.id, created.id)
  }

  function openProject(selected, existingAttempt) {
    if (existingAttempt) {
      routeTo(existingAttempt.status === 'submitted' ? 'completion' : 'workspace', selected.id, existingAttempt.id)
      return
    }
    routeTo('details', selected.id)
  }

  function openWorkspace(selected, selectedAttempt, milestoneId) {
    setWorkspaceTab('guide')
    routeTo('workspace', selected.id, selectedAttempt.id, milestoneId)
  }

  function selectProjectTab(tab) {
    if (tab === 'Explore Projects') routeTo('explore')
    if (tab === 'My Projects') routeTo('my-projects')
    if (tab === 'Project Templates') routeTo('templates')
    if (tab === 'My Portfolio') routeTo('portfolio')
  }

  const isProjectView = ['details', 'setup', 'workspace', 'review', 'completion'].includes(screen)

  function handleHeaderBack() {
    navigate('/dashboard')
  }

  const headerBackLabel = 'Back'

  const activeTab = screen === 'my-projects' ? 'My Projects' : screen === 'templates' ? 'Project Templates' : screen === 'portfolio' ? 'My Portfolio' : 'Explore Projects'
  const heading = screen === 'my-projects'
    ? 'My Projects'
    : screen === 'portfolio'
      ? 'My Portfolio'
      : screen === 'templates'
        ? 'Project Templates'
        : isProjectView
          ? project?.title || 'Project workspace'
          : 'Explore Real-World Projects'

  if (!['explore', 'templates', 'my-projects', 'portfolio', 'details', 'setup', 'workspace', 'review', 'completion'].includes(screen)) {
    return <div className="career-projects-page"><div className="cp-invalid"><h1>Project view unavailable</h1><p>This project link is not recognized. Choose a project from the catalogue to continue.</p><button type="button" className="cp-primary-button" onClick={() => routeTo('explore')}>Explore Projects<ArrowRight size={14} /></button></div></div>
  }

  return <section className="career-projects-page">
    <header className="cp-page-header">
      <div className="cp-page-title-row">
        <button type="button" className="cp-back-link" onClick={handleHeaderBack}><ArrowLeft size={15} />{headerBackLabel}</button>
        <div className="cp-page-heading"><span className="cp-stage-badge">4</span><div><span className="cp-eyebrow">BUILD REAL PROJECTS</span><h1>{heading}</h1><p>{screen === 'explore' ? 'Choose a project that matches your interests, skills, and current level.' : screen === 'my-projects' ? 'Resume projects and review the progress you have recorded.' : screen === 'portfolio' ? 'Manage project work you choose to showcase.' : 'Follow the guided steps and keep your project work in one place.'}</p></div></div>
      </div>
      <div className="cp-header-meta">{isProjectView && <><button type="button" className="cp-header-action" onClick={() => routeTo('my-projects')}>My Projects<ArrowRight size={13} /></button><button type="button" className="cp-header-action" onClick={() => routeTo('explore')}>Explore Projects<ArrowRight size={13} /></button></>}<span><Users size={14} />Your private workspace</span><span><Clock3 size={14} />Session-based demo</span></div>
    </header>
    {!isProjectView && <ProjectTabs active={activeTab} onSelect={selectProjectTab} />}
    <div className="cp-demo-banner"><ShieldCheck size={16} /><span><b>Browser-session demo:</b> saved projects, milestone state, and code are scoped to your signed-in account in this browser session. No project database, automated evaluator, or publishing service is connected.</span></div>
    {storageError && <p className="cp-storage-error" role="alert">{storageError}</p>}

    {screen === 'explore' && <ProjectListing savedIds={session.savedProjectIds} attempts={session.attempts} templates={false} onOpen={openProject} onSave={toggleSaved} onMyProjects={() => routeTo('my-projects')} />}
    {screen === 'templates' && <ProjectListing savedIds={session.savedProjectIds} attempts={session.attempts} templates onOpen={openProject} onSave={toggleSaved} onMyProjects={() => routeTo('my-projects')} />}
    {screen === 'my-projects' && <MyProjects session={session} activeTab={projectTab} onTabChange={setProjectTab} onContinue={(selected, current) => current.status === 'submitted' ? routeTo('completion', selected.id, current.id) : openWorkspace(selected, current)} onExplore={() => routeTo('explore')} onPortfolio={() => routeTo('portfolio')} />}
    {screen === 'portfolio' && <MyPortfolio savedIds={session.savedProjectIds} onExplore={() => routeTo('explore')} />}
    {screen === 'details' && (project ? <ProjectDetails
      project={project}
      attempt={attempt}
      saved={session.savedProjectIds.includes(project.id)}
      onSave={() => toggleSaved(project)}
      onStart={() => startProject(project)}
      onResume={() => attempt.status === 'submitted' ? routeTo('completion', project.id, attempt.id) : attempt.setupChecks.length === setupItems.length ? openWorkspace(project, attempt) : routeTo('setup', project.id, attempt.id)}
    /> : <div className="cp-empty"><h2>Project not found</h2><p>Choose a project from the catalogue to continue.</p></div>)}
    {screen === 'setup' && project && attempt && attempt.status === 'in-progress' && <ProjectSetup
      project={project}
      attempt={attempt}
      onCheck={toggleSetup}
      onContinue={() => openWorkspace(project, attempt, project.milestones[0].id)}
    />}
    {screen === 'workspace' && project && attempt && activeMilestone && <ProjectWorkspace
      project={project}
      attempt={attempt}
      milestone={activeMilestone}
      activeTab={workspaceTab}
      onTab={setWorkspaceTab}
      onUpdateFile={(key, value) => updateAttempt(attempt.id, { files: { ...attempt.files, [key]: value } })}
      onSelectFile={(activeFile) => updateAttempt(attempt.id, { activeFile })}
      onSelectMilestone={(milestoneId) => routeTo('workspace', project.id, attempt.id, milestoneId)}
      onCriteria={toggleCriteria}
      onComplete={completeMilestone}
      onPrevious={() => {
        const index = project.milestones.findIndex((item) => item.id === activeMilestone.id)
        if (index > 0) routeTo('workspace', project.id, attempt.id, project.milestones[index - 1].id)
      }}
      onNext={() => {
        const index = project.milestones.findIndex((item) => item.id === activeMilestone.id)
        if (index < project.milestones.length - 1) routeTo('workspace', project.id, attempt.id, project.milestones[index + 1].id)
      }}
      onReview={() => routeTo('review', project.id, attempt.id)}
    />}
    {screen === 'review' && project && attempt && attempt.status !== 'submitted' && project.milestones.every((milestone) => attempt.milestoneIds.includes(milestone.id)) && <ProjectReview
      project={project}
      attempt={attempt}
      onCheck={toggleReview}
      onSubmit={() => {
        if (!project.milestones.every((milestone) => attempt.milestoneIds.includes(milestone.id))) return
        if (updateAttempt(attempt.id, { status: 'submitted' }, true)) routeTo('completion', project.id, attempt.id)
      }}
    />}
    {screen === 'completion' && project && attempt && attempt.status === 'submitted' && <ProjectCompletion
      project={project}
      attempt={attempt}
      onView={() => openWorkspace(project, attempt)}
      onPortfolio={() => setPortfolioError(addCareerProjectToPortfolio().error)}
      onMyProjects={() => routeTo('my-projects')}
      portfolioError={portfolioError}
    />}
    {isProjectView && screen !== 'details' && (!project || !attempt || (screen === 'setup' && attempt.status !== 'in-progress') || (screen === 'completion' && attempt.status !== 'submitted') || (screen === 'review' && (attempt.status === 'submitted' || !project.milestones.every((milestone) => attempt.milestoneIds.includes(milestone.id))))) && <div className="cp-empty"><h3>Project step unavailable</h3><p>This project attempt is missing or cannot be shown in its current status. Your saved project data has not been changed.</p><button type="button" className="cp-primary-button" onClick={() => routeTo('explore')}>Explore Projects<ArrowRight size={14} /></button></div>}
  </section>
}

export default class CareerProjectsErrorBoundary extends Component {
  state = { error: null, retryCount: 0 }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Build Real Projects could not render.', error, info.componentStack)
  }

  retry = () => {
    this.setState(({ retryCount }) => ({ error: null, retryCount: retryCount + 1 }))
  }

  render() {
    if (this.state.error) {
      return <section className="career-projects-page">
        <div className="cp-invalid" role="alert">
          <h1>Project workspace could not be loaded</h1>
          <p>{this.state.error.message || 'An unexpected project rendering error occurred.'}</p>
          <button type="button" className="cp-primary-button" onClick={this.retry}>Retry Project Workspace<ArrowRight size={14} /></button>
        </div>
      </section>
    }

    return <CareerProjectsPage key={this.state.retryCount} userId={this.props.userId} />
  }
}
