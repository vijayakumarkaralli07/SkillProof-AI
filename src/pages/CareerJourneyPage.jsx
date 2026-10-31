import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  Cloud,
  Code2,
  Clock3,
  Database,
  FileText,
  Goal,
  Monitor,
  Rocket,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Video,
  ClipboardCheck,
  Atom,
  Trophy,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import CareerRoadmap from './CareerRoadmap.jsx'
import CareerLearningPlanner from './CareerLearningPlanner.jsx'
import CareerPracticePage from './CareerPracticePage.jsx'
import CareerProjectsPage from './CareerProjectsPage.jsx'
import { loadCareerDiscoverySession, loadCareerLearningSession } from '../services/careerLearningSessionService.js'
import { loadCareerData } from '../services/userDataService.js'
import {
  careerGoalTiles,
  careerInterests,
  careerInterestTiles,
  careerLearningPlanPreview,
  careerModuleExamples,
  careerProjectExamples,
  careerRoles,
  careerStageOrder,
} from '../data/careerJourneyData.js'

const interestIcons = {
  web: Code2,
  data: BarChart3,
  mobile: Smartphone,
  cloud: Cloud,
  ai: Atom,
  security: ShieldCheck,
  'Web Development': Code2,
  'Data Analytics': BarChart3,
  'Mobile Development': Smartphone,
  'DevOps & Cloud': Cloud,
  'AI & Machine Learning': Atom,
  Cybersecurity: ShieldCheck,
}

const moduleIcons = {
  web: ShieldCheck,
  javascript: FileText,
  react: Atom,
  data: Database,
}

const moduleProgressTones = ['strong', 'developing', 'focus', 'focus']

const practiceTabs = ['Learning Modules', 'Practice Tests']
const projectTabs = ['Recommended Projects', 'My Projects', 'Community Projects']
const practiceOptions = [
  { title: 'Coding Knowledge', detail: 'Timed coding challenges', Icon: Code2, path: '/interview-prep/coding-knowledge' },
  { title: 'AI Mock Interview', detail: 'Practice interview questions', Icon: Users, path: '/interview-prep/mock-interview' },
]
function ProjectThumbnail({ type }) {
  const projectIcons = {
    portfolio: Monitor,
    tasks: ClipboardCheck,
    weather: Cloud,
    cloud: Cloud,
    security: ShieldCheck,
    data: BarChart3,
  }
  const Icon = projectIcons[type] || BriefcaseBusiness
  return <span className={`cj-project-thumb ${type}`} aria-hidden="true"><Icon size={19} /><i /><b /></span>
}

function CareerGoalIllustration() {
  return <div className="cj-goal-illustration" aria-hidden="true">
    <span className="cj-goal-sun" />
    <svg className="cj-goal-mountain" viewBox="0 0 120 95" fill="currentColor">
      <path d="M2 90 43 28l17 25 16-35 42 72H2Z" />
      <path d="m43 28 10 15-10-4-9 9 9-20Zm33-10 13 23-12-7-8 7 7-23Z" fill="#fff" opacity=".9" />
    </svg>
    <span className="cj-goal-path" />
    <span className="cj-goal-hiker"><i /><b /><em /></span>
  </div>
}

const journeyLevels = [
  { id: 'Complete beginner', label: 'Complete beginner', description: "I haven't learned programming yet." },
  { id: 'Learning the basics', label: 'Learning the basics', description: "I've tried tutorials or simple exercises." },
  { id: 'Built small projects', label: 'Built small projects', description: "I've made a few practice or college projects." },
  { id: 'Some real experience', label: 'Some real experience', description: "I've done an internship, freelance work, or team projects." },
]

const goalChoices = [
  { id: 'Get a job', label: 'Get a job', description: 'I want a professional developer role and a clear path to get hired.' },
  { id: 'Build my own products', label: 'Build my own products', description: 'I want to create my own websites or apps and ship them.' },
  { id: 'Freelance', label: 'Freelance', description: 'I want to work flexibly and take on freelance projects.' },
  { id: 'Improve my current role', label: 'Improve my current role', description: 'I want to grow within my current experience and responsibilities.' },
]

const timelineChoices = ['1-3 months', '3-6 months', '6-12 months', 'More than 1 year']
const educationOptions = ['Final year Computer Science student', 'Self-taught learner', 'Working professional', 'Career switcher']
const timelineWeeks = {
  '1-3 months': 8,
  '3-6 months': 12,
  '6-12 months': 24,
  'More than 1 year': 52,
}

function pathScore(role, interests) {
  if (!interests.length) return 0
  const directMatches = role.interests.filter((interest) => interests.includes(interest)).length
  const base = 50 + directMatches * 35
  if (interests.includes('Web Development') && role.title.toLowerCase().includes('frontend')) return Math.min(100, base + 25)
  if (interests.includes('Data Analytics') && role.title.toLowerCase().includes('data')) return Math.min(100, base + 20)
  if (interests.includes('AI & Machine Learning') && role.title.toLowerCase().includes('machine')) return Math.min(100, base + 20)
  return Math.min(100, base)
}

function calculateRecommendedPaths(selectedInterests) {
  return [...careerRoles]
    .map((role) => ({ ...role, score: pathScore(role, selectedInterests) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
}

export default function CareerJourneyPage({ user }) {
  const location = useLocation()
  const [databaseData, setDatabaseData] = useState(null)
  const [databaseLoading, setDatabaseLoading] = useState(Boolean(user?.id))
  const [databaseError, setDatabaseError] = useState('')
  const search = new URLSearchParams(location.search)
  const learningPlanView = search.get('learningPlan')
  const sessionProgress = loadCareerLearningSession(user?.id).data
  const sessionDiscovery = loadCareerDiscoverySession(user?.id).data

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    loadCareerData(user.id).then((data) => {
      if (active) {
        setDatabaseData(data)
        setDatabaseError('')
      }
    }).catch((error) => {
      if (active) setDatabaseError(error.message)
    }).finally(() => {
      if (active) setDatabaseLoading(false)
    })
    return () => { active = false }
  }, [user?.id])

    const storedProgress = databaseData?.learningProgress || sessionProgress
    const storedDiscovery = databaseData?.hasSavedCareerData
      ? { ...databaseData.careerDiscovery, learningPlanId: databaseData.learningPlan?.id || '' }
      : sessionDiscovery
  const careerDiscovery = location.state?.careerDiscovery || storedDiscovery || {}
  if (search.get('careerPractice') === 'overview') {
    return <CareerPracticePage
      userId={user?.id}
      careerDiscovery={careerDiscovery}
      learningProgress={location.state?.learningProgress || storedProgress}
      onBack={() => navigate('/dashboard')}
    />
  }
  if (search.has('projects')) {
    return <CareerProjectsPage userId={user?.id} careerDiscovery={careerDiscovery} />
  }
  if (learningPlanView === 'planner' || learningPlanView === 'lesson') {
    return <CareerLearningPlanner
      careerDiscovery={careerDiscovery}
      progress={location.state?.learningProgress || storedProgress}
      userId={user?.id}
      week={Number(search.get('week')) || storedProgress?.currentWeek || 1}
      taskId={search.get('task')}
      lessonMode={learningPlanView === 'lesson'}
      initialTab={search.get('tab') || 'Video Lesson'}
        key={location.state?.learningProgress?.learningPlanId || careerDiscovery.learningPlanId || databaseData?.learningPlan?.id || 'session-learning-plan'}
    />
  }
  const isRoadmap = learningPlanView === 'roadmap'
  return isRoadmap
    ? <CareerRoadmap
      careerDiscovery={careerDiscovery}
      progress={location.state?.learningProgress || storedProgress}
      isSampleProfile={location.state?.isSampleProfile}
      persistenceNotice={location.state?.persistenceNotice}
    />
    : <CareerJourneyDashboard key={`${user?.id || 'unknown'}-${databaseData?.hasSavedCareerData ? 'saved' : databaseLoading ? 'loading' : 'empty'}`} userId={user?.id} storedDiscovery={location.state?.careerDiscovery || storedDiscovery} databaseError={databaseError} persistenceNotice={location.state?.persistenceNotice} />
}

function CareerJourneyDashboard({ userId, storedDiscovery, databaseError, persistenceNotice = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const workflowActionHandled = useRef(false)
  const carriedDiscovery = location.state?.careerDiscovery || storedDiscovery
  const [selectedInterests, setSelectedInterests] = useState(
    Array.isArray(carriedDiscovery?.interests) && carriedDiscovery.interests.length
      ? carriedDiscovery.interests
      : ['Web Development', 'Data Analytics'],
  )
  const [experienceLevel, setExperienceLevel] = useState(carriedDiscovery?.background || 'Learning the basics')
  const [education, setEducation] = useState(carriedDiscovery?.education || 'Self-taught learner')
  const [careerGoal, setCareerGoal] = useState(carriedDiscovery?.goal || 'Get a job')
  const [timeline, setTimeline] = useState(carriedDiscovery?.timeline || '3-6 months')
  const [selectedRole, setSelectedRole] = useState(carriedDiscovery?.confirmedPath || carriedDiscovery?.selectedRole || 'Frontend Developer')
  const [discoveryOpen, setDiscoveryOpen] = useState(false)
  const [discoveryStep, setDiscoveryStep] = useState(0)
  const [planPeriod, setPlanPeriod] = useState(0)
  const [practiceTab, setPracticeTab] = useState(practiceTabs[0])
  const [projectTab, setProjectTab] = useState(projectTabs[0])
  const [selectedProject, setSelectedProject] = useState(null)
  const [trackedProjects, setTrackedProjects] = useState([])
  const [completedProjectMilestones, setCompletedProjectMilestones] = useState({})

  const recommendedPaths = useMemo(() => calculateRecommendedPaths(selectedInterests), [selectedInterests])
  const confirmedRoleFallback = carriedDiscovery?.confirmedPath && !careerRoles.some((role) => role.title === carriedDiscovery.confirmedPath)
    ? {
      id: carriedDiscovery.confirmedPath === 'Backend Developer' ? 'backend-developer' : 'full-stack-developer',
      title: carriedDiscovery.confirmedPath,
      interests: selectedInterests,
      explanation: '',
      skills: [],
      learningOrder: carriedDiscovery.confirmedPath === 'Backend Developer'
        ? ['Programming fundamentals', 'APIs and server logic', 'Databases and SQL', 'Security and testing', 'Backend service project']
        : ['HTML & CSS foundations', 'JavaScript and React', 'Backend APIs and data', 'Full-stack testing', 'Complete application project'],
    }
    : null
  const featuredRole = recommendedPaths.find((role) => role.title === selectedRole) || confirmedRoleFallback || recommendedPaths[0]
  const planDurationWeeks = timelineWeeks[timeline] || 12
  const planPeriods = careerLearningPlanPreview.map((period, index) => {
    const startWeek = Math.floor((planDurationWeeks * index) / careerLearningPlanPreview.length) + 1
    const endWeek = Math.floor((planDurationWeeks * (index + 1)) / careerLearningPlanPreview.length)
    return {
      ...period,
      period: `Weeks ${startWeek}–${endWeek}`,
      topics: period.topics.map((topic, topicIndex) => ({
        ...topic,
        week: `Week ${Math.min(endWeek, startWeek + topicIndex)}`,
      })),
    }
  })
  const plan = planPeriods[planPeriod]
  const selectedTechnologies = Array.isArray(carriedDiscovery?.technologies) ? carriedDiscovery.technologies : []
  const planTopics = plan.topics.map((topic, index) => ({
    ...topic,
    title: featuredRole?.learningOrder[planPeriod * plan.topics.length + index] || topic.title,
  }))
  const roleProjects = careerProjectExamples.filter((project) => project.roles.includes(featuredRole?.id))
  const visibleProjects = projectTab === 'My Projects'
    ? careerProjectExamples.filter((project) => trackedProjects.includes(project.id))
    : projectTab === 'Community Projects'
      ? careerProjectExamples.slice(0, 3)
      : roleProjects.slice(0, 3)
  const completedMilestones = trackedProjects.reduce(
    (total, projectId) => total + (completedProjectMilestones[projectId]?.length || 0),
    0,
  )
  const trackedMilestoneCount = trackedProjects.reduce(
    (total, projectId) => total + (careerProjectExamples.find((project) => project.id === projectId)?.milestones.length || 0),
    0,
  )
  const journeyStageCompletion = [
    Boolean(carriedDiscovery?.confirmedPath),
    false,
    false,
    trackedMilestoneCount > 0 && completedMilestones === trackedMilestoneCount,
  ]
  const completedStages = journeyStageCompletion.filter(Boolean).length
  const totalStages = careerStageOrder.length
  const projectStageProgress = trackedMilestoneCount ? completedMilestones / trackedMilestoneCount : 0
  const journeyProgress = Math.round(
    ((completedStages + (journeyStageCompletion[3] ? 0 : projectStageProgress)) / totalStages) * 100,
  )

  useEffect(() => {
    if (location.state?.focusStage === 2) {
      document.querySelector('.cj-stage-plan')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [location.state?.focusStage])

  function toggleInterest(interest) {
    setSelectedInterests((current) => current.includes(interest)
      ? current.filter((item) => item !== interest)
      : [...current, interest])
  }

  function openDiscovery() {
    navigate('/interview-prep/build-career/discover', {
      state: {
        careerDiscovery: {
          interests: selectedInterests,
          priorities: carriedDiscovery?.priorities || ['Building products', 'Solving problems'],
          background: carriedDiscovery?.background,
          education: carriedDiscovery?.education,
          technologies: carriedDiscovery?.technologies,
          studyTime: carriedDiscovery?.studyTime,
          goal: carriedDiscovery?.goal,
          timeline: carriedDiscovery?.timeline,
          targetRole: carriedDiscovery?.targetRole,
          selectedRole: carriedDiscovery?.confirmedPath || carriedDiscovery?.selectedRole || featuredRole?.title || selectedRole,
          confirmedPath: carriedDiscovery?.confirmedPath,
        },
      },
    })
  }

  const openLearningRoadmap = useCallback(() => {
    const hasCareerPreferences = carriedDiscovery && (
      carriedDiscovery.confirmedPath
      || carriedDiscovery.selectedRole
      || carriedDiscovery.targetRole
      || carriedDiscovery.background
      || carriedDiscovery.education
      || carriedDiscovery.goal
      || carriedDiscovery.timeline
      || (Array.isArray(carriedDiscovery.interests) && carriedDiscovery.interests.length > 0)
    )
    const careerDiscovery = hasCareerPreferences
      ? carriedDiscovery
      : {
        interests: ['Web Development'],
        background: 'Complete beginner',
        education: 'Final-year Computer Science student',
        goal: 'Get a job',
        targetRole: 'Frontend Developer',
        selectedRole: 'Frontend Developer',
        confirmedPath: 'Frontend Developer',
        timeline: '3-6 months',
        studyTime: '3–4 hours',
        technologies: [],
      }
    navigate('/interview-prep/build-career?learningPlan=roadmap', {
      state: {
        careerDiscovery,
        isSampleProfile: !hasCareerPreferences,
        learningProgress: loadCareerLearningSession(userId).data,
      },
    })
  }, [carriedDiscovery, navigate, userId])

  function openCareerPractice() {
    navigate('/interview-prep/build-career?careerPractice=overview', {
      state: {
        careerDiscovery: carriedDiscovery,
        learningProgress: loadCareerLearningSession(userId).data,
      },
    })
  }

  useEffect(() => {
    if (
      location.state?.workflowAction !== 'open-personalized-learning-plan'
      || workflowActionHandled.current
    ) return

    workflowActionHandled.current = true
    const consumedState = { ...location.state }
    delete consumedState.workflowAction
    navigate(location.pathname, {
      replace: true,
      state: consumedState,
    })
    openLearningRoadmap()
  }, [location.key, location.pathname, location.state, navigate, openLearningRoadmap])

  function closeDiscovery() {
    setDiscoveryOpen(false)
  }

  function trackProject(project) {
    setTrackedProjects((current) => current.includes(project.id) ? current : [...current, project.id])
  }

  function toggleProjectMilestone(project, milestone) {
    setCompletedProjectMilestones((current) => {
      const completed = current[project.id] || []
      const next = completed.includes(milestone)
        ? completed.filter((item) => item !== milestone)
        : [...completed, milestone]
      return { ...current, [project.id]: next }
    })
  }

  function canContinue() {
    if (discoveryStep === 0) return selectedInterests.length > 0
    if (discoveryStep === 1) return Boolean(experienceLevel)
    if (discoveryStep === 2) return Boolean(careerGoal)
    return Boolean(selectedRole)
  }

  return (
    <section className="career-journey-page">
      {databaseError && <p className="cj-data-warning" role="status">Saved career data could not be loaded from Supabase: {databaseError}. Current changes are not confirmed as saved.</p>}
      {persistenceNotice && <p className="cj-data-warning" role="status">{persistenceNotice}</p>}
      <header className="cj-hero">
        <div>
          <span className="cj-eyebrow">BUILD YOUR CAREER</span>
          <h1>
            Your Complete Journey to a <b>Tech Career</b>
          </h1>
          <p>From exploration to job-ready and beyond, this is a guided, step-by-step path designed for beginners and beyond.</p>
        </div>

        <div className="cj-hero-note">
          <div className="cj-hero-illustration" aria-hidden="true">
            <svg viewBox="0 0 64 42" width="64" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 31.5H22V15.5H30V31.5H44V9.5H52V31.5H56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M42 9.5L50 5.5L56 9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <Sparkles size={14} />
          </div>
          <span>Set your goal, follow the steps, and track your progress. We&apos;ll help you learn, build, and get hired.</span>
        </div>
      </header>

      <div className="cj-stage-grid">
        <article className="cj-stage-card cj-stage-explore">
          <div className="cj-stage-heading">
            <span className="cj-stage-number green">{carriedDiscovery?.confirmedPath ? <Check size={15} /> : '1'}</span>
            <div>
              <h2>Explore Career Paths</h2>
              <p>Discover the best tech roles based on your interests, skills, and career goals.</p>
            </div>
          </div>

          <div className="cj-stage-content">
            <div className="cj-explore-panel">
              <b>Find Your Perfect Tech Career Path</b>
              <small>Answer a few questions to get personalized recommendations.</small>
              <div className="cj-question-dots" aria-label="Career discovery has four steps">
                {Array.from({ length: 6 }, (_, index) => <i key={index} className={index < selectedInterests.length ? 'active' : ''} />)}
              </div>
              <strong>What are you most interested in?</strong>
              <div className="cj-interest-grid">
                {careerInterestTiles.map(({ interest, label, icon }) => {
                  const Icon = interestIcons[icon] || Sparkles
                  const selected = selectedInterests.includes(interest)
                  return <button
                    type="button"
                    key={interest}
                    className="cj-interest-tile"
                    aria-pressed={selected}
                    onClick={() => toggleInterest(interest)}
                  >
                    <Icon size={14} /><span>{label}</span>
                  </button>
                })}
              </div>
              <small className="cj-sample-caption">Selected direction: {featuredRole?.title || 'Choose an interest'}</small>
            </div>
          </div>

          <button type="button" className="cj-stage-action" onClick={openDiscovery}>
            {carriedDiscovery?.confirmedPath ? 'Update Career Path' : 'Find My Career Path'} <ArrowRight size={14} />
          </button>
        </article>

        <article className="cj-stage-card cj-stage-plan">
          <div className="cj-stage-heading">
            <span className="cj-stage-number green">2</span>
            <div>
              <h2>Get a Personalized Learning Plan</h2>
              <p>Follow a structured roadmap with daily and weekly goals.</p>
            </div>
          </div>

          <div className="cj-stage-content">
            <div className="cj-plan-card">
              <div className="cj-plan-main">
                <div className="cj-panel-title">
                  <b>Your {planDurationWeeks}-Week Learning Plan</b>
                  <small>Personalized for {featuredRole?.title || selectedRole} · {experienceLevel}</small>
                  <small className="cj-plan-personalization">{careerGoal} · {timeline} · {carriedDiscovery?.studyTime ? `${carriedDiscovery.studyTime} daily` : 'Flexible daily study time'}</small>
                  {selectedTechnologies.length > 0 && <small className="cj-plan-personalization">Building on: {selectedTechnologies.join(', ')}</small>}
                </div>
                <div className="cj-period-tabs" role="tablist" aria-label="Learning plan periods">
                  {planPeriods.map((period, index) => <button
                    type="button"
                    role="tab"
                    aria-selected={planPeriod === index}
                    className={planPeriod === index ? 'active' : ''}
                    key={period.period}
                    onClick={() => setPlanPeriod(index)}
                  >{period.period}</button>)}
                </div>
                <div className="cj-roadmap">
                  {planTopics.map((topic, index) => <div className="cj-roadmap-item" key={topic.week}>
                    <span className={`cj-roadmap-marker${index === 0 && planPeriod === 0 ? ' complete' : ''}`}>{planPeriod * plan.topics.length + index + 1}</span>
                    <div><b>{topic.title}</b><small>{topic.week} · {topic.lessons} lessons · {topic.practiceSets} practice sets</small></div>
                  </div>)}
                </div>
              </div>
              <aside className="cj-plan-aside">
                <div className="cj-weekly-goal">
                  <span className="cj-resource-icon"><Target size={13} /></span>
                  <div><b>Weekly Goal</b><small>{plan.goal}{carriedDiscovery?.studyTime ? ` Available study time: ${carriedDiscovery.studyTime} daily.` : ''}</small></div>
                  <i><b style={{ width: '60%' }} /></i>
                </div>
                <div className="cj-resource-list">
                  <b>Resources</b>
                  <span><Video size={11} />Video Lessons</span>
                  <span><ClipboardCheck size={11} />Practice Tests</span>
                  <span><FileText size={11} />Notes &amp; Cheat Sheets</span>
                </div>
              </aside>
            </div>
          </div>

          <button type="button" className="cj-stage-action" onClick={openLearningRoadmap}>
            Start Learning <ArrowRight size={14} />
          </button>
        </article>

        <article className="cj-stage-card cj-stage-practice">
          <div className="cj-stage-heading">
            <span className="cj-stage-number green">3</span>
            <div>
              <h2>Practice &amp; Build Skills</h2>
              <p>Learn with hands-on practice and coding tests.</p>
            </div>
          </div>

          <div className="cj-stage-content">
            <div className="cj-tab-list" role="tablist" aria-label="Practice options">
              {practiceTabs.map((tab) => <button
                type="button"
                role="tab"
                aria-selected={practiceTab === tab}
                className={practiceTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => setPracticeTab(tab)}
              >{tab}</button>)}
            </div>

            {practiceTab === 'Learning Modules' && <div className="cj-module-list">
              {careerModuleExamples.map((module, index) => {
                const Icon = moduleIcons[module.icon] || BookOpen
                const tone = moduleProgressTones[index] || 'focus'
                return <div className="cj-module-row" key={module.title}>
                  <span className={`cj-module-icon ${module.icon}`}><Icon size={13} /></span>
                  <span className="cj-module-info"><b>{module.title}</b><small>{module.lessons} lessons · {module.practiceSets} practice sets</small></span>
                  <strong>{module.progress}%</strong>
                  <span className="cj-module-track"><b className={tone} style={{ width: `${module.progress}%` }} /></span>
                </div>
              })}
              <small className="cj-sample-caption">Illustrative sample learning progress; not account activity.</small>
            </div>}
            {practiceTab === 'Practice Tests' && <div className="cj-practice-options">
              {practiceOptions.map(({ title, detail, Icon, path }) => <button type="button" className="cj-practice-link" key={title} onClick={() => navigate(path, { state: { returnTo: '/interview-prep/build-career' } })}>
                <span className={`cj-practice-icon${title === 'Coding Knowledge' ? ' coding' : ''}`}><Icon size={18} /></span>
                <span><b>{title}</b><small>{detail}</small></span><ArrowRight size={14} />
              </button>)}
            </div>}
          </div>

          <button type="button" className="cj-stage-action" onClick={() => {
            if (practiceTab === 'Learning Modules') openCareerPractice()
            else navigate('/interview-prep/coding-knowledge', { state: { returnTo: '/interview-prep/build-career' } })
          }}>
            {practiceTab === 'Learning Modules' ? 'Start Practicing' : 'Explore Practice Tests'} <ArrowRight size={14} />
          </button>
        </article>

        <article className="cj-stage-card cj-stage-projects">
          <div className="cj-stage-heading">
            <span className="cj-stage-number green">4</span>
            <div>
              <h2>Build Real Projects</h2>
              <p>Create portfolio projects to showcase your skills to employers.</p>
            </div>
          </div>

          <div className="cj-stage-content">
            <div className="cj-tab-list" role="tablist" aria-label="Project lists">
              {projectTabs.map((tab) => <button
                type="button"
                role="tab"
                aria-selected={projectTab === tab}
                className={projectTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => setProjectTab(tab)}
              >{tab}</button>)}
            </div>
            {visibleProjects.length ? <div className={projectTab === 'My Projects' ? 'cj-my-projects' : 'cj-project-rows'}>
              {visibleProjects.map((project) => <button type="button" className="cj-project-row" key={project.id} onClick={() => setSelectedProject(project)}>
                <ProjectThumbnail type={project.thumbnail} />
                <span className="cj-project-info">
                  <span className="cj-project-title"><b>{project.title}</b><em className={project.difficulty === 'Intermediate' ? 'intermediate' : ''}>{project.difficulty}</em></span>
                  <span className="cj-project-skills">{project.skills.map((skill) => <i key={skill}>{skill}</i>)}</span>
                  <small className="cj-project-description">{project.description}</small>
                </span>
                <ChevronDown size={14} className="cj-project-arrow" />
              </button>)}
            </div> : <div className="cj-project-empty"><BriefcaseBusiness size={18} /><span><b>No projects tracked yet</b><small>Open a recommended project to start tracking it in this demo session.</small></span></div>}
            <small className="cj-example-label">Sample project ideas · tracking remains in this browser session only.</small>
          </div>

          <button type="button" className="cj-stage-action" onClick={() => navigate('/interview-prep/build-career?projects=explore', { state: { careerDiscovery: carriedDiscovery } })}>
            Explore Projects <ArrowRight size={14} />
          </button>
        </article>
      </div>

      <div className="cj-goals-summary">
        <div className="cj-goals-left">
          <div className="cj-summary-heading">
            <div className="cj-summary-icon"><Goal size={18} /></div>
            <div>
              <h2>Achieve Your Career Goals</h2>
              <p>Track your journey using the progress you have actually recorded.</p>
            </div>
          </div>
          <div className="cj-goal-tiles">
            {careerGoalTiles.map((tile, index) => {
              const icons = [Route, Award, BriefcaseBusiness, Rocket]
              const Icon = icons[index] || Trophy
              return <div className="cj-goal-tile" key={tile.title}>
                <span><Icon size={14} /></span><b>{tile.title}</b><small>{tile.description}</small>
              </div>
            })}
          </div>
          <small className="cj-goal-footnote">Project milestone tracking is session-only; certificates and hiring status are illustrative.</small>
        </div>
        <div className="cj-goals-art">
          <span className="cj-goals-script">From learning<br />to landing your<br />dream job!</span>
          <CareerGoalIllustration />
        </div>
        <div className="cj-goal-summary-card">
          <strong>Your Goal is Within Reach</strong>
          <small>Current target: {featuredRole?.title || selectedRole}. Keep learning and build your skills.</small>
          <small>{completedStages} of {totalStages} stages complete</small>
          <div className="cj-goal-progress"><i style={{ width: `${journeyProgress}%` }} /></div>
          <small>{completedMilestones} of {trackedMilestoneCount} milestones complete · {trackedProjects.length} project{trackedProjects.length === 1 ? '' : 's'} tracked this session</small>
          <button type="button" className="cj-primary-button" onClick={openDiscovery}>Start Your Journey <ArrowRight size={13} /></button>
        </div>
      </div>

      {discoveryOpen && (
        <div className="cj-modal-scrim" role="dialog" aria-modal="true" aria-label="Explore Career Paths">
          <div className="cj-modal">
            <header>
              <div>
                <span className="cj-eyebrow">Career Discovery</span>
                <h2>
                  {discoveryStep === 0 && 'Explore Career Paths'}
                  {discoveryStep === 1 && 'Your Background'}
                  {discoveryStep === 2 && 'Career Goals'}
                  {discoveryStep === 3 && 'Recommended Career Paths'}
                </h2>
              </div>
              <button type="button" className="cj-icon-button" onClick={closeDiscovery} aria-label="Close career discovery">
                <Check size={15} />
              </button>
            </header>

            <div className="cj-modal-body">
              {discoveryStep === 0 && (
                <div className="cj-form">
                  <div className="cj-question-block">
                    <h2>What are you most interested in?</h2>
                    <p>Choose the areas that sound exciting to you.</p>
                    <div className="cj-choice-grid">
                      {careerInterests.map((interest) => {
                        const Icon = interestIcons[interest] || Sparkles
                        const selected = selectedInterests.includes(interest)
                        return (
                          <button
                            key={interest}
                            type="button"
                            className={selected ? 'selected' : ''}
                            onClick={() => toggleInterest(interest)}
                          >
                            <Icon size={14} />
                            <span>{interest}</span>
                            {selected && <Check size={12} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
              {selectedProject && (
                <div className="cj-modal-scrim" role="presentation" onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSelectedProject(null)
                }}>
                  <section className="cj-modal cj-project-detail-modal" role="dialog" aria-modal="true" aria-labelledby="cj-project-title">
                    <header>
                      <div><span className="cj-eyebrow">SAMPLE PROJECT · SESSION-ONLY TRACKING</span><h2 id="cj-project-title">{selectedProject.title}</h2></div>
                      <button type="button" className="cj-icon-button" onClick={() => setSelectedProject(null)} aria-label="Close project details"><X size={15} /></button>
                    </header>
                    <div className="cj-modal-body">
                      <p>{selectedProject.description}</p>
                      <p><b>Difficulty:</b> {selectedProject.difficulty}</p>
                      <p><b>Skills:</b> {selectedProject.skills.join(', ')}</p>
                      <h3>Project milestones</h3>
                      <div className="cj-project-milestones">
                        {selectedProject.milestones.map((milestone) => {
                          const isTracked = trackedProjects.includes(selectedProject.id)
                          const isComplete = completedProjectMilestones[selectedProject.id]?.includes(milestone) || false
                          return <button
                            type="button"
                            className="cj-project-milestone"
                            key={milestone}
                            aria-pressed={isComplete}
                            disabled={!isTracked}
                            onClick={() => toggleProjectMilestone(selectedProject, milestone)}
                          >
                            <span>{isComplete && <Check size={12} />}</span>{milestone}
                          </button>
                        })}
                      </div>
                      {!trackedProjects.includes(selectedProject.id) && <small className="cj-project-track-hint">Track this sample project to record milestone progress for this browser session.</small>}
                    </div>
                    <div className="cj-modal-actions">
                      <button type="button" className="cj-secondary-button" onClick={() => setSelectedProject(null)}>Close</button>
                      <button type="button" className="cj-primary-button" disabled={trackedProjects.includes(selectedProject.id)} onClick={() => trackProject(selectedProject)}>
                        {trackedProjects.includes(selectedProject.id) ? 'Project Tracked' : 'Track This Project'} <ArrowRight size={14} />
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {discoveryStep === 1 && (
                <div className="cj-form">
                  <div className="cj-question-block">
                    <h2>Where are you in your tech journey?</h2>
                    <div className="cj-option-list">
                      {journeyLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          className={experienceLevel === level.id ? 'selected' : ''}
                          onClick={() => setExperienceLevel(level.id)}
                        >
                          <span>{level.label}</span>
                          <small>{level.description}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cj-question-block">
                    <h2>What is your current background?</h2>
                    <select value={education} onChange={(event) => setEducation(event.target.value)}>
                      {educationOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {discoveryStep === 2 && (
                <div className="cj-form">
                  <div className="cj-question-block">
                    <h2>What is your main goal?</h2>
                    <div className="cj-option-list">
                      {goalChoices.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={careerGoal === option.id ? 'selected' : ''}
                          onClick={() => setCareerGoal(option.id)}
                        >
                          <span>{option.label}</span>
                          <small>{option.description}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cj-question-block">
                    <h2>When do you want to achieve this goal?</h2>
                    <div className="cj-pill-grid">
                      {timelineChoices.map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          className={timeline === choice ? 'selected' : ''}
                          onClick={() => setTimeline(choice)}
                        >
                          <Clock3 size={12} />
                          <span>{choice}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {discoveryStep === 3 && (
                <div className="cj-form">
                  <div className="cj-question-block">
                    <h2>Top career path recommendations</h2>
                    <p>Based on your interests, background, and goals.</p>
                    <div className="cj-recommendation-list">
                      {recommendedPaths.map((role, index) => (
                        <button
                          key={role.id}
                          type="button"
                          className={selectedRole === role.title ? 'selected' : ''}
                          onClick={() => setSelectedRole(role.title)}
                        >
                          <span>
                            <strong>#{index + 1} {role.title}</strong>
                            <small>{role.explanation}</small>
                          </span>
                          <b>{Math.round(role.score)}%</b>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="cj-modal-actions">
              {discoveryStep > 0 && (
                <button type="button" className="cj-secondary-button" onClick={() => setDiscoveryStep((step) => Math.max(step - 1, 0))}>
                  <ChevronLeft size={14} /> Back
                </button>
              )}

              {discoveryStep === 3 && (
                <button type="button" className="cj-secondary-button" onClick={() => setDiscoveryStep(1)}>
                  Edit
                </button>
              )}

              {discoveryStep < 3 ? (
                <button type="button" className="cj-primary-button" onClick={() => canContinue() && setDiscoveryStep((step) => Math.min(step + 1, 3))} disabled={!canContinue()}>
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button type="button" className="cj-primary-button" onClick={closeDiscovery}>
                  Save &amp; Exit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
