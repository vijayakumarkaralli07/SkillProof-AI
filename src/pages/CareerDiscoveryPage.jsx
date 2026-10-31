import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Clock3,
  Code2,
  Cloud,
  Compass,
  Database,
  Flag,
  GraduationCap,
  Info,
  Layers,
  Laptop,
  LockKeyhole,
  Monitor,
  Palette,
  Pencil,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { careerInterestTiles } from '../data/careerJourneyData.js'
import {
  loadCareerDiscoverySession,
  saveCareerDiscoverySession,
} from '../services/careerLearningSessionService.js'
import { loadCareerData, saveCareerPreferences, saveConfirmedCareerPath } from '../services/userDataService.js'

const interestDetails = {
  'Web Development': { description: 'Build websites and web apps', Icon: Monitor, tone: 'green' },
  'Data Analytics': { description: 'Find insights in data', Icon: BarChart3, tone: 'blue' },
  'Mobile Development': { description: 'Create Android and iOS apps', Icon: Smartphone, tone: 'purple' },
  'AI & Machine Learning': { description: 'Build intelligent tools', Icon: Sparkles, tone: 'blue' },
  'DevOps & Cloud': { description: 'Deploy and run applications', Icon: Cloud, tone: 'orange' },
  Cybersecurity: { description: 'Protect systems and data', Icon: ShieldCheck, tone: 'red' },
}

const priorities = [
  { label: 'Building products', Icon: Wrench },
  { label: 'Solving problems', Icon: Target },
  { label: 'Working with data', Icon: BarChart3 },
  { label: 'Creative design', Icon: Palette },
  { label: 'Keeping systems secure', Icon: ShieldCheck },
]

const steps = [
  { label: 'Interests', detail: 'What excites you?' },
  { label: 'Your Background', detail: 'Your current level' },
  { label: 'Your Goals', detail: 'What do you want to achieve?' },
  { label: 'Recommended Paths', detail: 'Get personalized results' },
]

const backgrounds = ['Complete beginner', 'Learning the basics', 'Built small projects', 'Some real experience']
const goalOptions = [
  { label: 'Get a job', description: 'I want to become a professional developer and get hired.', Icon: BriefcaseBusiness },
  { label: 'Build my own products', description: 'I want to create my own websites or startup ideas.', Icon: Rocket },
  { label: 'Freelance', description: 'I want to work on freelance projects.', Icon: UserRound },
  { label: 'Improve my current role', description: 'I want to level up my existing career.', Icon: BarChart3 },
]
const roleOptions = [
  { label: 'Frontend Developer', description: 'Build user interfaces with HTML, CSS, JavaScript, React, etc.', Icon: Code2 },
  { label: 'Backend Developer', description: 'Build server-side applications and APIs.', Icon: Server },
  { label: 'Full Stack Developer', description: 'Work on both frontend and backend technologies.', Icon: Layers },
  { label: 'Not sure yet', description: 'Show the best options based on my answers.', Icon: Compass },
]
const recommendedRoleOptions = [
  {
    title: 'Frontend Developer',
    description: 'Build user interfaces and web applications using HTML, CSS, JavaScript, and modern frameworks.',
    Icon: Monitor,
    interests: ['Web Development', 'Mobile Development'],
    technologies: ['HTML & CSS', 'JavaScript', 'Git/GitHub'],
    skills: ['HTML & CSS', 'JavaScript', 'React', 'Git'],
    demand: 90,
    beginner: 85,
    learningTime: '3–6 months',
  },
  {
    title: 'Backend Developer',
    description: 'Build server-side applications, APIs, and reliable data systems.',
    Icon: Server,
    interests: ['Web Development', 'DevOps & Cloud', 'Cybersecurity'],
    technologies: ['Java', 'Python', 'SQL', 'Git/GitHub'],
    skills: ['Node.js', 'Express.js', 'MongoDB', 'SQL'],
    demand: 85,
    beginner: 70,
    learningTime: '4–8 months',
  },
  {
    title: 'Full Stack Developer',
    description: 'Work across frontend and backend technologies to build complete products.',
    Icon: Layers,
    interests: ['Web Development', 'Mobile Development', 'DevOps & Cloud'],
    technologies: ['HTML & CSS', 'JavaScript', 'SQL', 'Git/GitHub'],
    skills: ['HTML & CSS', 'JavaScript', 'Node.js', 'React'],
    demand: 80,
    beginner: 65,
    learningTime: '6–12 months',
  },
  {
    title: 'Data Analyst',
    description: 'Analyze data and find insights that help businesses make better decisions.',
    Icon: BarChart3,
    interests: ['Data Analytics', 'AI & Machine Learning'],
    technologies: ['SQL', 'Python'],
    skills: ['SQL', 'Python', 'Data Visualization', 'Excel'],
    demand: 75,
    beginner: 70,
    learningTime: '4–8 months',
  },
  {
    title: 'Mobile Developer',
    description: 'Build useful mobile applications with thoughtful, device-aware experiences.',
    Icon: Smartphone,
    interests: ['Mobile Development'],
    technologies: ['JavaScript', 'Git/GitHub'],
    skills: ['JavaScript', 'React Native', 'Mobile UI', 'APIs'],
    demand: 78,
    beginner: 72,
    learningTime: '4–8 months',
  },
  {
    title: 'DevOps & Cloud Engineer',
    description: 'Automate delivery and help teams run reliable cloud services.',
    Icon: Cloud,
    interests: ['DevOps & Cloud', 'Cybersecurity'],
    technologies: ['Python', 'Git/GitHub'],
    skills: ['Linux', 'Networking', 'Cloud', 'CI/CD'],
    demand: 82,
    beginner: 62,
    learningTime: '6–12 months',
  },
  {
    title: 'Machine Learning Engineer',
    description: 'Use programming, data, and evaluation methods to build useful machine-learning systems.',
    Icon: Sparkles,
    interests: ['AI & Machine Learning', 'Data Analytics'],
    technologies: ['Python', 'SQL'],
    skills: ['Python', 'Statistics', 'Machine Learning', 'Model Evaluation'],
    demand: 84,
    beginner: 58,
    learningTime: '6–12 months',
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Help protect systems through security fundamentals, analysis, and responsible response.',
    Icon: ShieldCheck,
    interests: ['Cybersecurity', 'DevOps & Cloud'],
    technologies: ['Python', 'SQL', 'Git/GitHub'],
    skills: ['Networking', 'Linux', 'Security Fundamentals', 'Scripting'],
    demand: 80,
    beginner: 65,
    learningTime: '6–12 months',
  },
]
const timelines = [
  { value: '1-3 months', label: '1–3 months', detail: 'Quick start' },
  { value: '3-6 months', label: '3–6 months', detail: 'Focused learning' },
  { value: '6-12 months', label: '6–12 months', detail: 'Steady progress' },
  { value: 'More than 1 year', label: 'More than 1 year', detail: 'No rush' },
]
const goalStudyTimes = ['30 min', '1 hour', '2 hours', '3–4 hours', '5+ hours']
const rolePriorityMatches = {
  'Frontend Developer': ['Building products', 'Creative design'],
  'Backend Developer': ['Solving problems', 'Keeping systems secure'],
  'Full Stack Developer': ['Building products', 'Solving problems'],
  'Data Analyst': ['Working with data', 'Solving problems'],
  'Mobile Developer': ['Building products', 'Creative design'],
  'DevOps & Cloud Engineer': ['Solving problems', 'Keeping systems secure'],
  'Machine Learning Engineer': ['Working with data', 'Solving problems'],
  'Cybersecurity Analyst': ['Keeping systems secure', 'Solving problems'],
}
const backgroundDetails = {
  'Complete beginner': "I haven't learned programming yet.",
  'Learning the basics': "I've tried tutorials or simple exercises.",
  'Built small projects': "I've made a few practice or college projects.",
  'Some real experience': "I've done an internship, freelance work, or teamwork.",
}
const backgroundIcons = [UserRound, BookOpen, Code2, BriefcaseBusiness]
const technologyOptions = [
  { label: 'HTML & CSS', Icon: Code2, tone: 'green' },
  { label: 'JavaScript', Icon: Laptop, tone: 'yellow' },
  { label: 'Java', Icon: Code2, tone: 'red' },
  { label: 'Python', Icon: Code2, tone: 'blue' },
  { label: 'SQL', Icon: Database, tone: 'blue' },
  { label: 'Git/GitHub', Icon: Code2, tone: 'dark' },
  { label: 'None yet', Icon: Info, tone: 'muted' },
]
const studyTimes = ['30 min', '1 hour', '2 hours', '3–4 hours']
const studyTimeIcons = [Clock3, Clock3, Clock3, Clock3]
const discoveryInterestOrder = [
  'Web Development',
  'Data Analytics',
  'Mobile Development',
  'AI & Machine Learning',
  'DevOps & Cloud',
  'Cybersecurity',
]

function CareerPathIllustration({ variant = '' }) {
  return <div className={`career-discovery-landscape${variant ? ` ${variant}` : ''}`} aria-label="Illustration of a person travelling toward a career goal">
    <span className="cd-cloud cd-cloud-one" /><span className="cd-cloud cd-cloud-two" />
    <div className="cd-hills" />
    <svg className="cd-path" viewBox="0 0 360 170" preserveAspectRatio="none" aria-hidden="true">
      <path d="M176 170c-17-38 35-48 8-78-21-24-87-18-100-45-8-17 5-29 20-41M192 170c18-40-23-48 1-73 22-22 92-19 106-47 8-16-4-30-18-43" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <path d="M180 170c-5-42 22-49 8-78-12-26-76-18-95-45-9-13 1-29 11-41M194 170c11-42-14-48 5-73 18-25 83-19 101-47 7-12-2-29-13-43" fill="none" stroke="#d8f3e5" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 7" />
    </svg>
    <div className="cd-signs" aria-hidden="true">
      <span className="cd-sign sign-web">Web Dev</span><span className="cd-sign sign-data">Data</span>
      <span className="cd-sign sign-ai">AI/ML</span><span className="cd-sign sign-devops">DevOps</span>
      <span className="cd-sign sign-security">Security</span>
    </div>
    {variant === 'career-discovery-mountain' && <span className="cd-goal-flag" aria-hidden="true" />}
    <div className="cd-traveler" aria-hidden="true"><i /><b /><em /><small /></div>
    <span className="cd-leaf cd-leaf-left" /><span className="cd-leaf cd-leaf-right" />
  </div>
}

function goalFitForRole(roleTitle, careerGoal) {
  if (careerGoal === 'Build my own products' || careerGoal === 'Freelance') {
    return ['Frontend Developer', 'Full Stack Developer', 'Mobile Developer'].includes(roleTitle)
  }
  if (careerGoal === 'Get a job') return true
  return careerGoal === 'Improve my current role'
}

export default function CareerDiscoveryPage({ userId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const carried = location.state?.careerDiscovery || loadCareerDiscoverySession(userId).data || {}
  const [step, setStep] = useState(0)
  const [selectedInterests, setSelectedInterests] = useState(
    Array.isArray(carried.interests) && carried.interests.length ? carried.interests : ['Web Development'],
  )
  const [selectedPriorities, setSelectedPriorities] = useState(carried.priorities || ['Building products', 'Solving problems'])
  const [background, setBackground] = useState(carried.background || '')
  const [education, setEducation] = useState(carried.education || '')
  const [technologies, setTechnologies] = useState(carried.technologies || [])
  const [studyTime, setStudyTime] = useState(carried.studyTime || '')
  const [goal, setGoal] = useState(carried.goal || '')
  const [timeline, setTimeline] = useState(carried.timeline || '')
  const [targetRole, setTargetRole] = useState(carried.targetRole || '')
  const [selectedRole, setSelectedRole] = useState(carried.selectedRole || '')
  const [validationMessage, setValidationMessage] = useState('')
  const [persistenceMessage, setPersistenceMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId || location.state?.careerDiscovery) return undefined
    let active = true
    loadCareerData(userId).then(({ careerDiscovery }) => {
      if (!active || !careerDiscovery) return
      if (careerDiscovery.interests?.length) setSelectedInterests(careerDiscovery.interests)
      if (careerDiscovery.priorities?.length) setSelectedPriorities(careerDiscovery.priorities)
      if (careerDiscovery.background) setBackground(careerDiscovery.background)
      if (careerDiscovery.education) setEducation(careerDiscovery.education)
      if (careerDiscovery.technologies?.length) setTechnologies(careerDiscovery.technologies)
      if (careerDiscovery.study_time) setStudyTime(careerDiscovery.study_time)
      if (careerDiscovery.goal) setGoal(careerDiscovery.goal)
      if (careerDiscovery.timeline) setTimeline(careerDiscovery.timeline)
      if (careerDiscovery.target_role) setTargetRole(careerDiscovery.target_role)
      if (careerDiscovery.confirmedPath) setSelectedRole(careerDiscovery.confirmedPath)
    }).catch((error) => {
      if (active) setPersistenceMessage(`Saved answers could not be loaded from the database: ${error.message}`)
    })
    return () => { active = false }
  }, [userId, location.state?.careerDiscovery])

  const recommendations = useMemo(() => recommendedRoleOptions
    .map((role) => {
      const interestMatches = role.interests.filter((interest) => selectedInterests.includes(interest)).length
      const technologyMatches = role.technologies.filter((technology) => technologies.includes(technology)).length
      const priorityMatches = (rolePriorityMatches[role.title] || []).filter((priority) => selectedPriorities.includes(priority)).length
      const targetMatch = targetRole === role.title ? 5 : 0
      const beginnerFit = background === 'Complete beginner' && role.beginner >= 70 ? 1 : 0
      const goalFit = goalFitForRole(role.title, goal) ? 1 : 0
      const timelineFit = ['1-3 months', '3-6 months'].includes(timeline) && ['3–6 months', '4–8 months'].includes(role.learningTime) ? 1 : 0
      return {
        ...role,
        score: interestMatches * 5 + technologyMatches + priorityMatches * 2 + targetMatch + beginnerFit + goalFit + timelineFit,
        interestMatches,
        technologyMatches,
      }
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 4), [selectedInterests, technologies, selectedPriorities, targetRole, background, goal, timeline])

  function toggleInterest(interest) {
    setSelectedInterests((current) => current.includes(interest)
      ? current.filter((item) => item !== interest)
      : [...current, interest])
    setValidationMessage('')
  }

  function togglePriority(priority) {
    setSelectedPriorities((current) => current.includes(priority)
      ? current.filter((item) => item !== priority)
      : [...current, priority])
  }

  function workflowState() {
    return {
      careerDiscovery: {
        interests: selectedInterests,
        priorities: selectedPriorities,
        background,
        education,
        technologies,
        studyTime,
        goal,
        timeline,
        targetRole,
        selectedRole,
        confirmedPath: carried.confirmedPath || '',
      },
    }
  }

  async function persistDiscovery(careerDiscovery, confirmPath = false) {
    let databaseError = ''
    let learningPlanId = ''
    try {
      if (confirmPath) {
        const result = await saveConfirmedCareerPath(userId, careerDiscovery)
        learningPlanId = result.learningPlanId
      }
      else await saveCareerPreferences(userId, careerDiscovery)
    } catch (error) {
      databaseError = error.message
    }
    const savedDiscovery = learningPlanId ? { ...careerDiscovery, learningPlanId } : careerDiscovery
    const cacheError = saveCareerDiscoverySession(userId, savedDiscovery)
    const message = databaseError
      ? `Database save unavailable: ${databaseError} ${cacheError ? '' : 'These answers remain only in this browser session.'}`
      : cacheError
        ? `Database saved, but the temporary session cache could not be updated: ${cacheError}`
        : ''
    setPersistenceMessage(message)
    return { message, learningPlanId }
  }

  async function saveAndExit() {
    const state = workflowState()
    setSaving(true)
    await persistDiscovery(state.careerDiscovery)
    setSaving(false)
    navigate('/dashboard')
  }

  async function confirmCareerPath() {
    if (!recommendations.some((role) => role.title === selectedRole)) {
      setValidationMessage('Select a career path before continuing to your personalized learning plan.')
      return
    }
    const careerDiscovery = {
      ...workflowState().careerDiscovery,
      confirmedPath: selectedRole,
      selectedRole,
    }
    setSaving(true)
    const { message: persistenceNotice, learningPlanId } = await persistDiscovery(careerDiscovery, true)
    setSaving(false)
    const confirmedDiscovery = learningPlanId ? { ...careerDiscovery, learningPlanId } : careerDiscovery
    navigate('/interview-prep/build-career', {
      state: {
        ...workflowState(),
        careerDiscovery: confirmedDiscovery,
        persistenceNotice,
        workflowAction: 'open-personalized-learning-plan',
      },
    })
  }

  function goBack() {
    if (step > 0) setStep((current) => current - 1)
    else saveAndExit()
  }

  async function continueStep() {
    if (step === 0 && selectedInterests.length === 0) {
      setValidationMessage('Select at least one career interest to continue.')
      return
    }
    if (step === 1 && (!background || !education || !technologies.length || !studyTime)) {
      setValidationMessage('Choose your experience level, education, at least one technology option, and daily study time to continue.')
      return
    }
    if (step === 2 && (!goal || !targetRole || !timeline || !studyTime)) {
      setValidationMessage('Choose a main goal, target role, timeline, and daily study time to continue.')
      return
    }
    if (step < 3) {
      setSaving(true)
      const { message: persistenceNotice } = await persistDiscovery(workflowState().careerDiscovery)
      setSaving(false)
      if (step === 2) {
        setSelectedRole((current) => recommendations.some((role) => role.title === current)
          ? current
          : recommendations.find((role) => role.title === targetRole)?.title || recommendations[0]?.title || '')
      }
      setStep((current) => current + 1)
      setValidationMessage('')
      if (!persistenceNotice) setPersistenceMessage('Career preferences saved to your account.')
      return
    }
    confirmCareerPath()
  }

  function toggleRole(roleTitle) {
    setSelectedRole(roleTitle)
  }

  function toggleTechnology(technology) {
    setTechnologies((current) => {
      if (technology === 'None yet') {
        return current.includes('None yet') ? [] : ['None yet']
      }
      const withoutNone = current.filter((item) => item !== 'None yet')
      return withoutNone.includes(technology)
        ? withoutNone.filter((item) => item !== technology)
        : [...withoutNone, technology]
    })
  }

  const percent = (step + 1) * 25
  const selectedCareerInterest = selectedInterests[0] || ''
  const selectedInterestLabel = selectedCareerInterest === 'Data Analytics'
    ? 'Data & Analytics'
    : selectedCareerInterest === 'Cybersecurity' ? 'Cybersecurity' : selectedCareerInterest
  const careerPathLabel = selectedInterestLabel || 'tech'
  const targetRoleLabel = targetRole || 'Not selected'
  const selectedGoalStudyTime = studyTime === '3–4 hours' ? '3–4 hours per day' : studyTime ? `${studyTime} per day` : 'Not selected'
  const selectedTimelineLabel = timelines.find((item) => item.value === timeline)?.label || timeline || 'Not selected'
  const SelectedCareerIcon = selectedInterestLabel ? interestDetails[selectedCareerInterest]?.Icon : null
  const selectedInterestIconTone = selectedInterestLabel ? interestDetails[selectedCareerInterest]?.tone : 'green'

  return <section className="career-discovery-page">
    <header className="career-discovery-heading">
      <div>
        <button type="button" className="career-discovery-back" onClick={saveAndExit}><ArrowLeft size={13} />Back</button>
        <span className="career-discovery-eyebrow">BUILD YOUR CAREER</span>
        {step === 1
          ? <><h1>Let’s Understand Your <b>Background</b></h1><p>Tell us where you're starting from so we can recommend a realistic {careerPathLabel} path.</p></>
          : step === 2
            ? <><h1>Set Your <b>Career Goals</b></h1><p>Tell us what you want to achieve so we can create a personalized {careerPathLabel} path for you.</p></>
            : step === 3
              ? <><h1>Your Recommended <b>Career Paths</b></h1><p>Based on your interests, background, and goals, we've found the best career paths for you.</p></>
            : <><h1>Find Your Best <b>Tech Career Path</b></h1><p>Answer a few quick questions so we can recommend a realistic starting point for you.</p></>}
      </div>
      <aside className="career-discovery-progress">
        <span className="career-discovery-progress-icon">{step >= 2 ? <Flag size={21} /> : <Compass size={21} />}</span>
        <div className="career-discovery-progress-copy">
          <b>CAREER DISCOVERY</b>
          <div><strong>Step {step + 1} of 4</strong><strong>{percent}%</strong></div>
          <i><span style={{ width: `${percent}%` }} /></i>
        </div>
      </aside>
    </header>

    <nav className="career-discovery-stepper" aria-label="Career discovery steps">
      {steps.map((item, index) => <div className={`career-discovery-step${index === step ? ' active' : ''}${index < step ? ' complete' : ''}`} key={item.label}>
        <span>{index < step ? <Check size={17} /> : index + 1}</span>
        <div>
          <b>{step >= 2 && index === 1 ? 'Background' : step >= 2 && index === 2 ? 'Goals' : item.label}</b>
          <small>{step >= 2 && index === 0 ? selectedInterestLabel : step >= 2 && index === 1 ? background || item.detail : step >= 2 && index === 2 ? `${goal || 'Set a goal'}${timeline ? ` • ${selectedTimelineLabel}` : ''}` : item.detail}</small>
        </div>
        {index < steps.length - 1 && <i aria-hidden="true" />}
      </div>)}
    </nav>

    <div className="career-discovery-columns">
      <main className={`career-discovery-form-panel${step === 2 ? ' career-discovery-form-goals' : ''}${step === 3 ? ' career-discovery-form-recommendations' : ''}`}>
        {step === 0 && <>
          <header className="career-discovery-panel-title">
            <h2>What are you interested in?</h2>
            <p>Choose the areas that sound exciting to you. You can select more than one.</p>
          </header>
          <div className="career-discovery-interest-grid">
            {discoveryInterestOrder.map((interest) => {
              const { label } = careerInterestTiles.find((tile) => tile.interest === interest)
              const detail = interestDetails[interest] || interestDetails[label]
              const Icon = detail.Icon
              const selected = selectedInterests.includes(interest)
              return <button
                type="button"
                key={interest}
                className={`career-discovery-interest-card${selected ? ' selected' : ''}`}
                aria-pressed={selected}
                onClick={() => toggleInterest(interest)}
              >
                <span className={`career-discovery-interest-icon ${detail.tone}`}><Icon size={22} /></span>
                <span className="career-discovery-interest-copy"><b>{label}</b><small>{detail.description}</small></span>
                <span className="career-discovery-checkbox">{selected && <Check size={14} />}</span>
              </button>
            })}
          </div>
          <section className="career-discovery-priorities">
            <h3>What matters most to you?</h3>
            <p>Select a few things that are important in your career.</p>
            <div>
              {priorities.map(({ label, Icon }) => {
                const selected = selectedPriorities.includes(label)
                return <button type="button" key={label} className={selected ? 'selected' : ''} aria-pressed={selected} onClick={() => togglePriority(label)}>
                  <Icon size={15} />{selected && <Check size={13} />}{label}
                </button>
              })}
            </div>
          </section>
        </>}

        {step === 1 && <>
          <header className="career-discovery-panel-title">
            <h2>Where are you in your tech journey?</h2>
            <p>There’s no wrong answer. We’ll use this to choose the right starting point.</p>
          </header>
          <div className="career-discovery-background-grid">
            {backgrounds.map((item, index) => {
              const Icon = backgroundIcons[index]
              const selected = background === item
              return <button type="button" key={item} className={`career-discovery-background-option${selected ? ' selected' : ''}`} aria-pressed={selected} onClick={() => setBackground(item)}>
                <span className={`career-discovery-background-icon tone-${index}`}><Icon size={20} /></span>
                <span className="career-discovery-background-copy"><b>{item}</b><small>{backgroundDetails[item]}</small></span>
                <span className="career-discovery-background-check">{selected && <Check size={13} />}</span>
              </button>
            })}
          </div>
          <label className="career-discovery-select-label">Your current education
            <span className="career-discovery-select-wrap"><GraduationCap size={16} /><select value={education} onChange={(event) => setEducation(event.target.value)}>
              <option value="">Select your education level</option>
              {['Final-year Computer Science student', 'Other university student', 'Self-taught learner', 'Working professional', 'Career switcher', 'Other'].map((item) => <option key={item}>{item}</option>)}
            </select>
            </span>
          </label>
          <section className="career-discovery-technologies">
            <h3>Which technologies have you tried?</h3>
            <p>Choose only what you’ve actually tried.</p>
            <div>{technologyOptions.map(({ label, Icon, tone }) => {
              const selected = technologies.includes(label)
              return <button type="button" key={label} className={`career-discovery-technology${selected ? ' selected' : ''}`} aria-pressed={selected} onClick={() => toggleTechnology(label)}>
                <span className={`career-discovery-technology-icon ${tone}`}><Icon size={15} /></span>{label}
                {selected && <Check size={12} />}
              </button>
            })}</div>
          </section>
          <section className="career-discovery-study-time">
            <h3>How much time can you study each day?</h3>
            <div>{studyTimes.map((item, index) => {
              const Icon = studyTimeIcons[index]
              const selected = studyTime === item
              return <button type="button" key={item} className={selected ? 'selected' : ''} aria-pressed={selected} onClick={() => setStudyTime(item)}>
                <Icon size={14} />{item}
              </button>
            })}</div>
          </section>
        </>}

        {step === 2 && <div className="career-discovery-goals">
          <section className="career-discovery-goal-group">
            <div className="career-discovery-goal-heading"><span>1</span><div><h2>What is your main goal?</h2><p>Choose the option that best describes what you want to achieve.</p></div></div>
            <div className="career-discovery-goal-grid">
              {goalOptions.map(({ label, description, Icon }) => <button type="button" key={label} className={goal === label ? 'selected' : ''} aria-pressed={goal === label} onClick={() => setGoal(label)}>
                <span className="career-discovery-goal-icon"><Icon size={19} /></span><span><b>{label}</b><small>{description}</small></span><i>{goal === label && <Check size={12} />}</i>
              </button>)}
            </div>
          </section>
          <section className="career-discovery-goal-group">
            <div className="career-discovery-goal-heading"><span>2</span><div><h2>Which role interests you the most?</h2><p>Select a specific role or keep it open if you’re not sure yet.</p></div></div>
            <div className="career-discovery-role-grid">
              {roleOptions.map(({ label, description, Icon }) => <button type="button" key={label} className={targetRole === label ? 'selected' : ''} aria-pressed={targetRole === label} onClick={() => setTargetRole(label)}>
                <span className="career-discovery-goal-icon"><Icon size={19} /></span><i>{targetRole === label && <Check size={12} />}</i><b>{label}</b><small>{description}</small>
              </button>)}
            </div>
          </section>
          <section className="career-discovery-goal-group">
            <div className="career-discovery-goal-heading"><span>3</span><div><h2>When do you want to achieve this goal?</h2><p>Your timeline helps us create a realistic learning plan.</p></div></div>
            <div className="career-discovery-choice-grid">
              {timelines.map(({ value, label, detail }) => <button type="button" key={value} className={timeline === value ? 'selected' : ''} aria-pressed={timeline === value} onClick={() => setTimeline(value)}>
                <Clock3 size={15} /><span><b>{label}</b><small>{detail}</small></span>{timeline === value && <Check size={12} />}
              </button>)}
            </div>
          </section>
          <section className="career-discovery-goal-group">
            <div className="career-discovery-goal-heading"><span>4</span><div><h2>How much time can you study each day?</h2><p>We’ll adjust the plan based on your available time.</p></div></div>
            <div className="career-discovery-study-choice-grid">
              {goalStudyTimes.map((item) => <button type="button" key={item} className={studyTime === item ? 'selected' : ''} aria-pressed={studyTime === item} onClick={() => setStudyTime(item)}>
                <Clock3 size={14} />{item}{studyTime === item && <Check size={12} />}
              </button>)}
            </div>
          </section>
        </div>}

        {step === 3 && <>
          <header className="career-discovery-recommendation-heading">
            <span><Sparkles size={20} /></span>
            <div><h2>Top Career Path Recommendations</h2><p>Here are the best career paths for you, ranked based on your answers.</p></div>
          </header>
          <div className="career-discovery-ranked-list">
            {recommendations.map((role, index) => {
              const Icon = role.Icon
              const selected = role.title === selectedRole
              const matchingInterest = role.interests.find((interest) => selectedInterests.includes(interest))
              const practicedTechnologies = role.technologies.filter((technology) => technologies.includes(technology))
              const reasons = [
                matchingInterest ? `Matches ${matchingInterest}` : 'Related to your selected interests',
                targetRole === role.title ? 'Matches your target role' :                 (rolePriorityMatches[role.title] || []).some((priority) => selectedPriorities.includes(priority)) ? 'Fits your career priorities' : 'Develops transferable skills',
                practicedTechnologies.length ? `Builds on ${practicedTechnologies[0]}` : background === 'Complete beginner' && role.beginner >= 70 ? 'Beginner-friendly starting point' : `${role.learningTime} learning estimate`,
                goalFitForRole(role.title, goal) ? 'Supports your main goal' : 'Can lead to practical projects',
              ]
              return <article className={`career-discovery-path-card${index === 0 ? ' best-match' : ''}${selected ? ' selected' : ''}`} key={role.title}>
                <div className="career-discovery-path-rank"><b>#{index + 1}</b><span>{index === 0 ? 'Best Match' : index === 1 ? 'Also Recommended' : index === 2 ? 'Great Option' : 'Explore Later'}</span></div>
                <div className="career-discovery-path-overview">
                  <span className="career-discovery-path-icon"><Icon size={22} /></span>
                  <div><h3>{role.title}</h3><p>{role.description}</p></div>
                  <div className="career-discovery-skill-chips">{role.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </div>
                <div className="career-discovery-path-metrics">
                  <div><span><TrendingUp size={12} />Job Demand</span><i><b style={{ width: `${role.demand}%` }} /></i><strong>{role.demand}%</strong></div>
                  <div><span><Sparkles size={12} />Beginner Friendly</span><i className="amber"><b style={{ width: `${role.beginner}%` }} /></i><strong>{role.beginner}%</strong></div>
                  <div><span><Clock3 size={12} />Learning Time</span><strong className="career-discovery-learning-time">{role.learningTime}</strong></div>
                  <small>Illustrative estimates</small>
                </div>
                <div className="career-discovery-fit">
                  <b>{index === 0 ? "Why it's a great fit?" : 'Why consider this?'}</b>
                  <ul>{reasons.slice(0, index === 0 ? 4 : 3).map((reason) => <li key={reason}><Check size={12} />{reason}</li>)}</ul>
                  {index > 0 && <button type="button" className="career-discovery-select-path" onClick={() => toggleRole(role.title)}>{selected ? 'Selected' : 'Select Path'}</button>}
                </div>
                <button type="button" className={`career-discovery-path-selected${selected ? ' is-selected' : ''}`} aria-label={`${selected ? 'Selected' : 'Select'} ${role.title}`} aria-pressed={selected} onClick={() => toggleRole(role.title)}>{selected && <Check size={13} />}</button>
              </article>
            })}
          </div>
        </>}

        {validationMessage && <p className="career-discovery-validation" role="alert">{validationMessage}</p>}
        {persistenceMessage && <p className="career-discovery-demo-note" role="status">{persistenceMessage}</p>}
        <footer className={`career-discovery-actions${step === 1 ? ' background-actions' : ''}${step === 2 ? ' goals-actions' : ''}${step === 3 ? ' recommendation-actions' : ''}`}>
          <p><Info size={14} />{step === 1 ? 'You can update your background later.' : step === 2 ? 'You can update these answers anytime.' : step === 3 ? 'You can change your answers anytime to get different recommendations.' : 'You can change these answers later.'}{step === 3 && <small>Demo/session-only; this choice is not permanently saved.</small>}</p>
          <div>
            {step > 0 && <button type="button" className="career-discovery-secondary" onClick={goBack}><ArrowLeft size={14} />{step === 1 ? 'Back to Interests' : step === 2 ? 'Back to Background' : step === 3 ? 'Back to Goals' : 'Back'}</button>}
            {step !== 2 && step !== 3 && <button type="button" className="career-discovery-secondary" disabled={saving} onClick={saveAndExit}>Save &amp; Exit</button>}
            {step === 3
              ? <button type="button" className="career-discovery-primary career-discovery-confirm" disabled={saving} onClick={confirmCareerPath}><span>{saving ? 'Saving…' : 'Confirm & Continue'}<small>Save this path and open your personalized learning plan</small></span><ArrowRight size={15} /></button>
              : <button type="button" className="career-discovery-primary" disabled={saving} onClick={continueStep}>{saving ? 'Saving…' : step === 0 ? 'Continue to Background' : step === 1 ? 'Continue to Goals' : 'Continue to Recommendations'}<ArrowRight size={15} /></button>}
          </div>
        </footer>
      </main>

      <aside className={`career-discovery-aside${step === 2 ? ' career-discovery-goals-aside' : ''}${step === 3 ? ' career-discovery-recommendation-aside' : ''}`}>
        {step === 3 ? <>
          <section className="career-discovery-info-card career-discovery-summary">
            <div className="career-discovery-summary-heading"><div><h2>Your Answers Summary</h2><p>Here’s what we’ve collected so far.</p></div><button type="button" onClick={() => setStep(2)}><Pencil size={12} />Edit</button></div>
            <dl>
              <div><dt><Monitor size={14} />Career Interest</dt><dd>{selectedInterestLabel || 'Not selected'}</dd></div>
              <div><dt><BarChart3 size={14} />Current Level</dt><dd>{background || 'Not selected'}</dd></div>
              <div><dt><BriefcaseBusiness size={14} />Main Goal</dt><dd>{goal || 'Not selected'}</dd></div>
              <div><dt><Code2 size={14} />Target Role</dt><dd>{targetRoleLabel}</dd></div>
              <div><dt><Clock3 size={14} />Timeline</dt><dd>{selectedTimelineLabel}</dd></div>
              <div><dt><Clock3 size={14} />Study Time</dt><dd>{selectedGoalStudyTime}</dd></div>
              <div><dt><Flag size={14} />Selected Path</dt><dd>{selectedRole || 'Choose a path'}</dd></div>
            </dl>
          </section>
          <section className="career-discovery-info-card career-discovery-confirmation-next">
            <h2>Next Step After Confirmation</h2>
            <ol>
              <li className="current"><span>1</span><div><b>We’ll save your selected career path</b><small>This will be used to personalize your learning journey.</small></div></li>
              <li><span>2</span><div><b>Get your personalized learning plan</b><small>Use your experience, technologies, goals, timeline, and study time to shape the plan.</small></div></li>
              <li><span>3</span><div><b>Start your guided learning journey</b><small>Follow a practical roadmap tailored to your selected career path.</small></div></li>
            </ol>
          </section>
          <section className="career-discovery-info-card career-discovery-recommendation-motivation">
            <p>You’re one step<br />closer to your<br />dream job!</p>
            <span className="career-discovery-sun" aria-hidden="true" />
            <CareerPathIllustration variant="career-discovery-mountain" />
          </section>
        </> : step === 2 ? <>
          <section className="career-discovery-info-card career-discovery-summary">
            <div className="career-discovery-summary-heading"><div><h2>Your Selected Details</h2><p>Here’s what we’ve collected so far.</p></div><button type="button" onClick={() => setStep(1)}><Pencil size={12} />Edit</button></div>
            <dl>
              <div><dt><Monitor size={14} />Career Interest</dt><dd>{selectedInterestLabel || 'Not selected'}</dd></div>
              <div><dt><BarChart3 size={14} />Current Level</dt><dd>{background || 'Not selected'}</dd></div>
              <div><dt><BriefcaseBusiness size={14} />Main Goal</dt><dd>{goal || 'Not selected'}</dd></div>
              <div><dt><Code2 size={14} />Target Role</dt><dd>{targetRoleLabel}</dd></div>
              <div><dt><Clock3 size={14} />Timeline</dt><dd>{selectedTimelineLabel}</dd></div>
              <div><dt><Clock3 size={14} />Study Time</dt><dd>{selectedGoalStudyTime}</dd></div>
            </dl>
          </section>
          <section className="career-discovery-info-card career-discovery-motivation">
            <div><h2>You’re Almost There!</h2><p>Next, we’ll show you the best career paths, skills you’ll need to learn, and a personalized learning path.</p></div>
            <CareerPathIllustration variant="career-discovery-mountain" />
          </section>
          <section className="career-discovery-info-card career-discovery-next career-discovery-goal-next">
            <h2>What happens next?</h2>
            <ol>
              <li className="current"><span>1</span><div><b>We analyze your answers</b><small>Find the best matching career paths for you.</small></div></li>
              <li><span>2</span><div><b>Show personalized recommendations</b><small>See the roles, required skills, and learning path.</small></div></li>
              <li><span>3</span><div><b>Choose your career path</b><small>Continue directly to a learning plan tailored to your answers.</small></div></li>
            </ol>
          </section>
        </> : <>
        <section className="career-discovery-info-card">
          <h2>{step < 2 ? 'Your Starting Point' : 'Your Best-Fit Paths'}</h2>
          <p>{step === 0 ? 'No experience is okay. This journey is designed for beginners.' : step === 1 ? 'Your path will adapt to your experience.' : 'Your answers help make the journey relevant to you.'}</p>
          <CareerPathIllustration />
          {step === 1 && selectedCareerInterest && SelectedCareerIcon && <div className="career-discovery-selected-interest">
            <b>Selected career interest</b><span><i className={`career-discovery-interest-icon ${selectedInterestIconTone}`}><SelectedCareerIcon size={14} /></i>{selectedInterestLabel}</span>
          </div>}
          <ul className="career-discovery-benefits">
            {step === 1
              ? <><li><Check size={13} />Begin at the right level</li><li><Check size={13} />Focus on useful foundations</li><li><Check size={13} />Build toward real projects</li></>
              : <><li><Check size={13} />No coding experience required</li><li><Check size={13} />Recommendations based on your answers</li><li><Check size={13} />Change your path at any time</li></>}
          </ul>
        </section>
        <section className="career-discovery-info-card career-discovery-next">
          <h2>What happens next?</h2>
          <ol>
            {step === 1
              ? <><li className="current"><span>1</span><div><b>Set your career goal</b><small>Choose the role you want to work toward.</small></div></li><li><span>2</span><div><b>Review recommended paths</b><small>Compare options that fit your answers.</small></div></li><li><span>3</span><div><b>Create your learning plan</b><small>Get a practical weekly roadmap.</small></div></li></>
              : <><li className={step === 0 ? 'current' : ''}><span>1</span><div><b>Tell us about your current experience</b><small>Help us understand where you are right now.</small></div></li><li className={step === 1 ? 'current' : ''}><span>2</span><div><b>Set your goal and weekly study time</b><small>So we can create a realistic plan for you.</small></div></li><li className={step >= 2 ? 'current' : ''}><span>3</span><div><b>Compare suitable career paths</b><small>Get personalized recommendations with details.</small></div></li></>}
          </ol>
          <div className="career-discovery-privacy"><LockKeyhole size={16} /><span>{step === 1 ? 'Your answers stay editable. Saved to your account when storage is connected.' : 'Your answers are used for recommendations. Demo answers are not saved to your account.'}</span></div>
        </section>
        </>}
      </aside>
    </div>

  </section>
}
