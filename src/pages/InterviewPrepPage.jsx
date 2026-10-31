import { lazy, Suspense, useState } from 'react'
import {
  ArrowLeft, ArrowRight, AudioLines, BookOpen, BriefcaseBusiness,
  ChartNoAxesColumnIncreasing, CheckCircle2, CircleAlert, Clock3, Code2, Database,
  FileText, Flag, Goal, Lightbulb, MessageCircle, Mic, Play, Route, Settings,
  Sparkles, Users,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
const MockInterviewLivePage = lazy(() => import('./MockInterviewLivePage'))
const CodingKnowledgeWorkflow = lazy(() => import('./CodingKnowledgeWorkflow'))
const CareerJourneyPage = lazy(() => import('./CareerJourneyPage'))

const features = [
  {
    number: '01',
    path: '/interview-prep/mock-interview',
    title: 'AI Mock Interview',
    description: 'Practice by voice with 10 sample questions selected from your focus topics.',
    accent: 'green',
    action: 'Start Mock Interview',
    highlights: [[MessageCircle, 'Sample Questions'], [Mic, 'Voice Answers'], [AudioLines, '10-Minute Session']],
  },
  {
    number: '02',
    path: '/interview-prep/topic-practice',
    title: 'Topic-wise Practice',
    description: 'Practice questions by topic to strengthen your concepts.',
    accent: 'blue',
    action: 'Explore Practice Topics',
    highlights: [[BookOpen, 'Choose Topics'], [Goal, 'Track Progress'], [FileText, 'Detailed Solutions']],
  },
  {
    number: '03',
    path: '/interview-prep/coding-knowledge',
    title: 'Test Your Coding Knowledge',
    description: 'Choose a programming language and solve interview-style coding questions.',
    accent: 'purple',
    action: 'Start Coding Test',
    highlights: [[Code2, 'Choose a Language'], [Goal, 'Challenges by Difficulty'], [FileText, 'Hints & Test Cases']],
  },
  {
    number: '04',
    path: '/interview-prep/build-career',
    title: 'Build Your Career',
    description: 'Plan your next steps and build a stronger path toward your career goals.',
    accent: 'amber',
    action: 'Build My Career Plan',
    highlights: [[Goal, 'Set Career Goals'], [Sparkles, 'Explore Skills to Develop'], [BookOpen, 'Create a Learning Roadmap']],
  },
]

function FeatureIllustration({ accent }) {
  if (accent === 'green') return <div className="ip-dashboard-art ip-robot-art" aria-hidden="true">
    <span className="ip-art-halo" /><span className="ip-art-bubble bubble-left"><Sparkles /></span><span className="ip-art-bubble bubble-right"><i /><i /><i /></span>
    <div className="ip-robot"><i /><b /><span /><small /></div><div className="ip-art-laptop"><i /></div>
    <span className="ip-art-mic"><Mic /></span><span className="ip-art-wave"><AudioLines /></span>
  </div>
  if (accent === 'blue') return <div className="ip-dashboard-art ip-topic-art" aria-hidden="true">
    <span className="ip-art-halo" /><div className="ip-code-window"><b>&lt;/&gt;</b><i /><i /><i /><i /></div>
    <div className="ip-topic-stack"><span><Database />Data Structures</span><span><Goal />System Design</span><span><Users />Behavioral</span><span><MessageCircle />HR Questions</span></div>
    <Sparkles className="ip-art-star one" /><Sparkles className="ip-art-star two" />
  </div>
  if (accent === 'purple') return <div className="ip-dashboard-art ip-coding-art" aria-hidden="true">
    <span className="ip-art-halo" /><div className="ip-editor-art"><b>&lt;/&gt;</b><i /><i /><i /><i /><i /></div>
    <span className="ip-language python">🐍<small>Python</small></span><span className="ip-language java">♨<small>Java</small></span>
    <span className="ip-language javascript"><b>JS</b><small>JavaScript</small></span><span className="ip-language cpp"><b>C+</b><small>C++</small></span>
  </div>
  return <div className="ip-dashboard-art ip-career-art" aria-hidden="true">
    <span className="ip-art-halo" /><div className="ip-career-path"><i /><i /><i /><span><Flag /></span></div>
    <span className="ip-career-label label-job"><BriefcaseBusiness />Get Dream Job</span>
    <span className="ip-career-label label-skills"><Sparkles />Learn New Skills</span>
    <span className="ip-career-label label-roadmap"><Route />Build a Roadmap</span>
  </div>
}

function DashboardCard({ feature }) {
  const navigate = useNavigate()
  return <article className={`ip-dashboard-card ${feature.accent}`}>
    <span className="ip-card-number">{feature.number}</span>
    {feature.dashboardMark && <span className={`ip-card-mark${feature.dashboardMark === 'flag' ? ' flag' : ''}`} aria-hidden="true">{feature.dashboardMark === 'flag' ? <Flag size={23} fill="currentColor" /> : <><i /><i /><i /></>}</span>}
    <div className="ip-card-copy"><h2>{feature.title}</h2><p>{feature.description}</p>
      <ul>{feature.highlights.map(([Icon, label]) => <li key={label}><Icon size={18} /><span>{label}</span></li>)}</ul>
    </div>
    <FeatureIllustration accent={feature.accent} />
    <button type="button" className="ip-card-action" onClick={() => navigate(feature.path)}>{feature.action}<ArrowRight size={16} /></button>
  </article>
}

function TopicPracticePage() {
  const navigate = useNavigate()
  const topics = [
    ['Computer Science', ['Data Structures', 'Algorithms', 'Operating Systems', 'Databases']],
    ['Software Engineering', ['System Design', 'Web Development', 'Testing', 'Cloud Fundamentals']],
    ['Behavioral', ['Communication', 'Teamwork', 'Problem Solving', 'HR Questions']],
  ]
  return <section className="ip-tool-destination">
    <button type="button" className="ip-back-link" onClick={() => navigate('/dashboard')}><ArrowLeft size={14} />Back</button>
    <header className="ip-destination-heading"><span>TOPIC-WISE PRACTICE</span><h1>Explore Practice Topics</h1><p>Browse sample topics to plan what you want to practice. Question sets and progress tracking are not connected.</p></header>
    <div className="ip-topic-groups">{topics.map(([category, items]) => <section key={category}><h2>{category}</h2><div>{items.map((topic) => <article key={topic}><BookOpen size={16} /><span>{topic}</span><span className="ip-preview-tag">Preview</span></article>)}</div></section>)}</div>
    <p className="ip-destination-disclaimer">Topic labels are illustrative. No questions, progress history, or solutions are currently available.</p>
  </section>
}

function CodingKnowledgePage() {
  return <Suspense fallback={<p role="status">Loading coding test library…</p>}><CodingKnowledgeWorkflow /></Suspense>
}

const interviewRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Developer',
  'Java Developer', 'Python Developer', 'Data Analyst', 'Data Scientist', 'DevOps Engineer',
  'UI/UX Designer', 'Product Manager',
]
const interviewTopics = ['React', 'JavaScript', 'HTML & CSS', 'Problem Solving', 'System Design', 'Database', 'APIs', 'Computer Networks']
const setupTypes = ['Technical', 'Behavioral', 'Mixed']
const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced']
function SetupChoice({ label, value, choices, onChange, disabledChoices = [] }) {
  return   <div className="im-choice-row"><b>{label}</b><div>{choices.map((choice) => <button type="button" key={choice} className={value === choice ? 'selected' : ''} disabled={disabledChoices.includes(choice)} aria-pressed={value === choice} onClick={() => onChange(choice)}>{choice}{value === choice && <CheckCircle2 size={13} />}</button>)}</div>{label === 'Answer Mode' && disabledChoices.includes('Voice (Speak)') && <small className="im-disabled-hint">Voice input is not connected; text mode is available.</small>}</div>
}

function MockInterviewSetup() {
  const location = useLocation()
  const navigate = useNavigate()
  const returnTo = typeof location.state?.returnTo === 'string'
    && location.state.returnTo.startsWith('/')
    && !location.state.returnTo.startsWith('//')
    ? location.state.returnTo
    : '/interview-prep'
  const settings = location.state?.settings
  const [role, setRole] = useState(settings?.role || 'Frontend Developer')
  const [interviewType, setInterviewType] = useState(settings?.interviewType || 'Technical')
  const [difficulty, setDifficulty] = useState(settings?.difficulty || 'Intermediate')
  const [focusTopics, setFocusTopics] = useState(settings?.focusTopics || ['React', 'JavaScript', 'Problem Solving'])
  const [notice, setNotice] = useState('')

  function toggleTopic(topic) {
    setFocusTopics((current) => current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic])
  }

  function startInterview() {
    if (!focusTopics.length) {
      setNotice('Select at least one focus topic to prepare a relevant 10-question sample session.')
      return
    }
    navigate('/interview-prep/mock-interview/live', {
      state: {
        sessionId: Date.now() + Math.random(),
        settings: { role, interviewType, difficulty, duration: '10 minutes', answerMode: 'Voice (Speak)', focusTopics },
        returnTo,
      },
    })
  }

  return <section className="interview-mock-setup">
    <button type="button" className="ip-back-link" onClick={() => navigate('/dashboard')}><ArrowLeft size={14} />Back</button>
    <header className="im-hero"><div><span>AI MOCK INTERVIEW</span><h1>Practice Like the <b>Real Interview</b></h1><p>Choose your role and interview settings before you begin.</p></div><span className="im-demo-status">Demo preview — AI interview engine not connected yet.</span></header>
    {notice && <p className="im-notice" role="status">{notice}</p>}
    <div className="im-main-grid">
      <section className="im-config-card">
        <header className="im-card-heading"><span className="im-heading-icon"><Settings size={18} /></span><div><h2>Configure Your Interview</h2><p>Set up your interview preferences and start practicing.</p></div></header>
        <label className="im-role-row"><span><BriefcaseBusiness size={18} />Target Role</span><select value={role} onChange={(event) => setRole(event.target.value)}>{interviewRoles.map((item) => <option key={item}>{item}</option>)}</select></label>
        <SetupChoice label="Interview Type" value={interviewType} choices={setupTypes} onChange={setInterviewType} />
        <SetupChoice label="Difficulty Level" value={difficulty} choices={difficultyLevels} onChange={setDifficulty} />
        <div className="im-fixed-row"><b>Duration</b><span><Clock3 size={14} />10 minutes · 10 questions · 1 minute each</span></div>
        <div className="im-fixed-row"><b>Answer Mode</b><span><Mic size={14} />Voice (Speak) · microphone required</span></div>
        <section className="im-focus-section"><div className="im-focus-heading"><Goal size={18} /><span><b>Question Focus (Optional)</b><small>Select specific topics to focus on.</small></span></div><div className="im-topic-chips">{interviewTopics.map((topic) => <button type="button" key={topic} className={focusTopics.includes(topic) ? 'selected' : ''} aria-pressed={focusTopics.includes(topic)} onClick={() => toggleTopic(topic)}>{topic}{focusTopics.includes(topic) && <CheckCircle2 size={12} />}</button>)}</div></section>
        <button className="im-start-button" type="button" onClick={startInterview}><Play size={14} fill="currentColor" />Start Mock Interview <ArrowRight size={16} /></button>
      </section>
      <div className="im-side-column">
        <section className="im-summary-card"><header className="im-card-heading"><span className="im-heading-icon"><Settings size={18} /></span><div><h2>Ready to practice?</h2><p>Here's your interview setup summary.</p></div></header>
          <div className="im-summary-art" aria-hidden="true"><span className="ip-art-halo" /><span className="bubble-right"><i /><i /><i /></span><div className="ip-robot"><i /><b /><span /><small /></div><div className="ip-art-laptop"><i /></div></div>
          <dl className="im-summary-list">
            <div><BriefcaseBusiness /><dt>Target Role</dt><dd>{role}</dd></div>
            <div><FileText /><dt>Interview Type</dt><dd>{interviewType}</dd></div>
            <div><ChartNoAxesColumnIncreasing /><dt>Difficulty</dt><dd>{difficulty}</dd></div>
            <div><Clock3 /><dt>Duration</dt><dd>10 minutes</dd></div>
            <div><Mic /><dt>Answer Mode</dt><dd>Voice (Speak)</dd></div>
            <div className="topics"><Goal /><dt>Focus Topics</dt><dd>{focusTopics.length ? <span>{focusTopics.map((topic) => <i key={topic}>{topic}</i>)}</span> : 'None selected'}</dd></div>
          </dl>
        </section>
        <section className="im-expect-card"><header className="im-card-heading"><span className="im-light-icon"><Lightbulb size={18} /></span><div><h2>What to expect</h2></div></header>
          <ul><li><CheckCircle2 /><span><b>10 sample questions</b><small>Questions are selected from your chosen focus topics.</small></span></li><li><CheckCircle2 /><span><b>Voice answers</b><small>Use your device microphone; audio is not uploaded or stored.</small></span></li><li><CheckCircle2 /><span><b>One-minute question timer</b><small>The session ends after 10 minutes.</small></span></li></ul>
          <p className="im-warning"><CircleAlert />Sample questions only. AI transcription, answer evaluation, and interview history are not connected.</p>
        </section>
      </div>
    </div>
  </section>
}

export default function InterviewPrepPage({ dashboardMode = false }) {
  const location = useLocation()
  const { pathname } = location
  const dashboardFeatures = features
    .filter((feature) => feature.title !== 'Topic-wise Practice')
    .map((feature, index) => ({ ...feature, number: String(index + 1).padStart(2, '0'), dashboardMark: feature.accent === 'amber' ? 'flag' : 'dots' }))
  if (pathname === '/interview-prep/mock-interview/live') return <Suspense fallback={<p role="status">Loading live interview…</p>}><MockInterviewLivePage key={location.key} /></Suspense>
  if (pathname === '/interview-prep/mock-interview') return <MockInterviewSetup />
  if (pathname === '/interview-prep/topic-practice') return <TopicPracticePage />
  if (pathname.startsWith('/interview-prep/coding-knowledge')) return <CodingKnowledgePage />
  if (pathname === '/interview-prep/build-career') return <Suspense fallback={<p role="status">Loading Build Your Career…</p>}><CareerJourneyPage user={null} /></Suspense>

  const visibleFeatures = dashboardMode ? dashboardFeatures : features
  return <section className={`interview-dashboard-page${dashboardMode ? ' dashboard-hub-page' : ''}`}>
    <header className="ip-dashboard-hero"><div><span>{dashboardMode ? 'DASHBOARD' : 'INTERVIEW PREP'}</span><h1>{dashboardMode ? <>Your Interview <b>Preparation</b> Hub</> : <>Your Complete <b>Interview Preparation</b></>}</h1><p>{dashboardMode ? 'Practice with sample questions, test your coding knowledge, and build a strong career plan.' : 'Practice with sample questions and explore interview preparation tools.'}</p></div>{!dashboardMode && <span className="ip-preview-status">Sample questions and browser voice capture are available; AI scoring is not connected.</span>}</header>
    <div className="ip-dashboard-grid">{visibleFeatures.map((feature) => <DashboardCard feature={feature} key={feature.number} />)}</div>
  </section>
}
