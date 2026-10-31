import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Clock3,
  Code2,
  Database,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Target,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { careerRoles } from '../data/careerJourneyData.js'
import '../styles/career-roadmap.css'

const webPhases = [
  {
    id: 'phase-1',
    title: 'HTML & CSS Foundations',
    description: 'Learn the basics of web development and build a strong foundation.',
    lessons: 12,
    practiceSets: 8,
    deliverable: '1 mini project',
    topics: ['HTML structure and elements', 'CSS selectors and styling', 'Flexbox and responsive design'],
    Icon: Code2,
  },
  {
    id: 'phase-2',
    title: 'JavaScript Fundamentals',
    description: 'Learn JavaScript core concepts and problem-solving.',
    lessons: 14,
    practiceSets: 10,
    deliverable: '2 mini projects',
    topics: ['Variables and data types', 'Functions and DOM', 'Arrays, objects and ES6+'],
    Icon: BookOpen,
  },
  {
    id: 'phase-3',
    title: 'Git, Responsive Design & React',
    description: 'Use Git/GitHub and learn React to build modern websites.',
    lessons: 18,
    practiceSets: 10,
    deliverable: '2 mini projects',
    topics: ['Git and GitHub basics', 'Responsive design principles', 'React components and state'],
    Icon: Layers3,
  },
  {
    id: 'phase-4',
    title: 'Projects, APIs & Deployment',
    description: 'Build real projects and work with APIs.',
    lessons: 10,
    practiceSets: 8,
    deliverable: '3 projects',
    topics: ['API integration', 'Full build and deployment', 'Project best practices'],
    Icon: Database,
  },
  {
    id: 'phase-5',
    title: 'Interview Preparation & Applications',
    description: 'Prepare for placements and start applying.',
    lessons: 8,
    practiceSets: 6,
    deliverable: 'Resume & portfolio',
    topics: ['DSA basics for interviews', 'Common interview questions', 'Resume, LinkedIn and applications'],
    Icon: BriefcaseBusiness,
  },
]

const phaseIcons = [Code2, BookOpen, Layers3, Database, BriefcaseBusiness]
const phaseDescriptions = [
  'Build confidence with the core concepts and tools for this career path.',
  'Strengthen your skills through focused examples and guided practice.',
  'Apply the concepts to realistic tasks and build independent problem-solving habits.',
  'Create and refine projects that demonstrate your growing skills.',
  'Prepare to use your skills in your current role or next career step.',
]

function getCareerPhases(careerDiscovery) {
  const role = careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole || ''
  if (/frontend|full.?stack|web developer/i.test(role)) return webPhases

  const roleData = careerRoles.find((item) => item.title === role)
  const stages = roleData?.learningOrder || [
    `${role || 'Career'} foundations`,
    `Core ${role || 'career'} skills`,
    'Tools and practical workflows',
    'Applied portfolio project',
    'Career preparation',
  ]
  const skills = roleData?.skills || [role, 'Core concepts', 'Tools and workflows', 'Project practice']
  return stages.map((title, index) => ({
    id: `phase-${index + 1}`,
    title,
    description: phaseDescriptions[index],
    lessons: [10, 12, 14, 10, 8][index],
    practiceSets: [7, 8, 10, 8, 6][index],
    deliverable: ['1 guided exercise', '1 mini project', '1 applied project', '1 portfolio project', 'Resume & portfolio'][index],
    topics: [
      skills[index % skills.length],
      skills[(index + 1) % skills.length],
      index === 3 ? `${role} project` : `${title} practice`,
    ],
    Icon: phaseIcons[index],
  }))
}

function estimatePhaseWeeks(careerDiscovery) {
  const timelineWeeks = {
    '1-3 months': 8,
    '3-6 months': 12,
    '6-12 months': 24,
    'More than 1 year': 52,
  }[careerDiscovery.timeline] || 12
  const studyMultiplier = {
    '30 min': 1.6,
    '1 hour': 1.3,
    '2 hours': 1,
    '3–4 hours': 0.85,
    '5+ hours': 0.7,
  }[careerDiscovery.studyTime] || 1
  const experienceMultiplier = {
    'Complete beginner': 1.2,
    'Learning the basics': 1.1,
    'Built small projects': 1,
    'Some real experience': 0.85,
  }[careerDiscovery.background] || 1
  return Math.max(1, Math.ceil((timelineWeeks * studyMultiplier * experienceMultiplier) / 5))
}

const profileFields = [
  { label: 'Career Interest', key: 'interests', Icon: Target },
  { label: 'Current Level', key: 'background', Icon: BookOpen },
  { label: 'Education', key: 'education', Icon: GraduationCap },
  { label: 'Main Goal', key: 'goal', Icon: BriefcaseBusiness },
  { label: 'Target Role', key: 'role', Icon: Code2 },
  { label: 'Timeline', key: 'timeline', Icon: Clock3 },
  { label: 'Study Time', key: 'studyTime', Icon: Clock3 },
]

function getProfileValue(careerDiscovery, field) {
  if (field.key === 'interests') return careerDiscovery.interests?.join(', ') || 'Not selected'
  if (field.key === 'role') return careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole || 'Not selected'
  const value = careerDiscovery[field.key]
  if (!value) return 'Not selected'
  if (field.key === 'timeline') return value.replace('3-6', '3–6').replace('1-3', '1–3').replace('6-12', '6–12')
  return value
}

function getCompletedCount(progress, phaseId) {
  const completed = progress?.completedTaskIds
  if (!Array.isArray(completed)) return 0
  const savedPhaseTasks = completed.filter((taskId) => typeof taskId === 'string' && taskId.startsWith(`${phaseId}-task-`)).length
  if (phaseId !== 'phase-1') return savedPhaseTasks
  const phaseOneTasks = completed.reduce((counts, taskId) => {
    const match = typeof taskId === 'string' && taskId.match(/^week-[1-4]-(lesson|practice|project)-/)
    if (match) counts[match[1]] += 1
    return counts
  }, { lesson: 0, practice: 0, project: 0 })
  const plannedPhaseOneTasks = Math.min(12, phaseOneTasks.lesson)
    + Math.min(8, phaseOneTasks.practice)
    + Math.min(1, phaseOneTasks.project)
  return Math.min(21, savedPhaseTasks + plannedPhaseOneTasks)
}

export default function CareerRoadmap({ careerDiscovery = {}, progress, isSampleProfile = false, persistenceNotice = '' }) {
  const navigate = useNavigate()
  const role = careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole || ''
  const phases = getCareerPhases(careerDiscovery)
  const totalUnits = phases.reduce((total, phase) => (
    total + phase.lessons + phase.practiceSets + (Number.parseInt(phase.deliverable, 10) || 1)
  ), 0)
  const phaseWeeks = estimatePhaseWeeks(careerDiscovery)
  const completedByPhase = phases.map((phase) => Math.min(
    phase.lessons + phase.practiceSets + (Number.parseInt(phase.deliverable, 10) || 1),
    getCompletedCount(progress, phase.id),
  ))
  const completedUnits = completedByPhase.reduce((total, count) => total + count, 0)
  const overallProgress = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0
  const currentPhaseIndex = completedByPhase.findIndex((count, index) => (
    count < phases[index].lessons + phases[index].practiceSets + (Number.parseInt(phases[index].deliverable, 10) || 1)
  ))

  function startPhase() {
    const week = Number(progress?.currentWeek) || 1
    navigate(`/interview-prep/build-career?learningPlan=planner&week=${week}`, {
      state: { careerDiscovery, learningProgress: progress },
    })
  }

  return <section className="career-roadmap" aria-labelledby="career-roadmap-title">
    <header className="cr-header">
      <div>
        <button type="button" className="cr-back-link" onClick={() => navigate('/dashboard')}><ArrowLeft size={13} />Back</button>
        <span className="cr-eyebrow">BUILD YOUR CAREER</span>
        <h1 id="career-roadmap-title">Your Personalised Career Roadmap</h1>
        <p>A step-by-step plan based on your interests, background and goals.</p>
      </div>
      <aside className="cr-progress-card" aria-label={`Overall progress ${overallProgress}%`}>
        <div className="cr-progress-top">
          <span className="cr-progress-ring" style={{ '--cr-progress': `${overallProgress}%` }}>
            <span>{overallProgress}%</span>
          </span>
          <span><b>Overall Progress</b><small>{overallProgress ? `${completedUnits} learning tasks completed` : 'Just getting started'}</small></span>
        </div>
        <div className="cr-progress-track"><i style={{ width: `${overallProgress}%` }} /></div>
      </aside>
    </header>

    <div className="cr-profile" aria-label="Career profile summary">
      {profileFields.map(({ label, key, Icon }) => <div className="cr-profile-item" key={label}>
        <Icon size={13} aria-hidden="true" />
        <span><small>{label}</small><b title={getProfileValue(careerDiscovery, { key })}>{getProfileValue(careerDiscovery, { key })}</b></span>
      </div>)}
    </div>
    {persistenceNotice && <p className="cr-sample-profile" role="status">{persistenceNotice}</p>}
    {isSampleProfile && <p className="cr-sample-profile">Sample profile · no saved career preferences found.</p>}

    <>
      <div className="cr-template-note">
        {role || 'Career'} sample curriculum · {careerDiscovery.goal || 'Career growth'} · {careerDiscovery.studyTime || 'Flexible'} daily · Estimated {phaseWeeks * phases.length} weeks
        {careerDiscovery.technologies?.length > 0 ? ` · Building on ${careerDiscovery.technologies.join(', ')}` : ''}
        {careerDiscovery.priorities?.length > 0 ? ` · Priorities: ${careerDiscovery.priorities.join(', ')}` : ''}
      </div>
      <div className="cr-phase-list">
        {phases.map((phase, index) => {
          const taskCount = phase.lessons + phase.practiceSets + (Number.parseInt(phase.deliverable, 10) || 1)
          const complete = completedByPhase[index] >= taskCount
          const status = complete ? 'Completed' : index === currentPhaseIndex ? 'Current' : 'Locked'
          const PhaseIcon = phase.Icon
          return <article className={`cr-phase-card ${status.toLowerCase()}`} key={phase.id}>
            <span className={`cr-phase-number${complete || status === 'Current' ? ' active' : ''}`}>{complete ? <Check size={13} /> : index + 1}</span>
            <div className={`cr-phase-icon icon-${index + 1}`}><PhaseIcon size={17} /></div>
            <div className="cr-phase-main">
              <div className="cr-phase-title-row">
                <h2>Phase {index + 1} <span>{phase.title}</span></h2>
                <span className={`cr-status ${status.toLowerCase()}`}>{status === 'Locked' && <LockKeyhole size={10} />}{status}</span>
              </div>
              <p className="cr-phase-description">{phase.description}</p>
              <div className="cr-phase-meta">
                <span><Clock3 size={11} />~{phaseWeeks} weeks</span>
                <span><BookOpen size={11} />{phase.lessons} lessons</span>
                <span><Target size={11} />{phase.practiceSets} practice sets</span>
                <span><BriefcaseBusiness size={11} />{phase.deliverable}</span>
              </div>
            </div>
            <div className="cr-phase-topics">
              <b>Key Topics</b>
              <ul>{phase.topics.map((topic) => <li key={topic}><Check size={10} />{topic}</li>)}</ul>
            </div>
            {index === 0 && status === 'Current' && <button className="cr-start-button" type="button" onClick={startPhase}>
              Start Phase 1 <ArrowRight size={13} />
            </button>}
          </article>
        })}
      </div>
      <p className="cr-estimate-note">Durations are estimates, not guarantees. Progress will update when learning tasks are available.</p>
    </>
  </section>
}
