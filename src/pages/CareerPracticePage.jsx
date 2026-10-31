import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Info,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Play,
  Send,
  Target,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { loadCareerLearningSession } from '../services/careerLearningSessionService.js'
import { getEligibleCodingPracticeTests } from '../services/careerCodingPracticeService.js'
import { runCodingSubmission } from '../services/codingTestService.js'
import { getCompletedCareerLearningTopics } from '../services/careerLearningPlannerService.js'
import { loadPracticeAttempts, savePracticeAttempts } from '../services/userDataService.js'
import {
  getEligiblePracticeTracks,
  loadCareerPracticeSession,
  saveCareerPracticeSession,
} from '../services/careerPracticeService.js'
import '../styles/career-practice.css'

const CodingCodeEditor = lazy(() => import('./CodingCodeEditor.jsx'))

const studyStepsBySubject = {
  'HTML & CSS': ['HTML structure', 'Common HTML elements', 'Semantic HTML', 'Document structure'],
  JavaScript: ['Variables and values', 'Functions and arrays', 'DOM essentials', 'Arrays and objects'],
  React: ['Components', 'Props', 'State', 'Rendering lists'],
  'Data Analytics': ['Working with data', 'Data quality', 'SQL and data preparation', 'Statistics and visualization'],
  'Backend Development': ['HTTP and request flow', 'API validation', 'Databases', 'Testing and operations'],
  'Mobile Development': ['Mobile layouts', 'Navigation', 'APIs and app state', 'Accessibility and testing'],
  'DevOps & Cloud': ['Linux and command line', 'Networking and DNS', 'Git and CI/CD', 'Cloud and observability'],
  'Machine Learning': ['Python and data preparation', 'Statistics', 'Machine-learning foundations', 'Model evaluation'],
  Cybersecurity: ['Security principles', 'Logs and incident response', 'Scripting and risk', 'Security operations'],
}

function PracticeHeader({ onBack, careerDiscovery }) {
  const role = careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole
  return <header className="cp-header">
    <button type="button" className="cp-back-button" onClick={onBack}><ArrowLeft size={14} />Back</button>
    <div className="cp-page-title">
      <span className="cp-stage-badge">3</span>
      <div>
        <h1 id="cp-title">Practice &amp; Build Skills</h1>
        <p>Practice only what you have learned in your personalized learning plan.</p>
        {role && <small className="cp-role-context">Learning path: {role}</small>}
      </div>
    </div>
  </header>
}

function QuestionRunner({ session, onAnswer, onMove, onSubmit, onExit }) {
  const question = session.questions[session.index]
  const answer = session.answers[question.id]
  return <section className="cp-test-shell">
    <div className="cp-test-topline">
      <button type="button" className="cp-back-button" onClick={onExit}><ArrowLeft size={14} />Back to practice</button>
      <span>{session.subject} · Sample question bank</span>
    </div>
    <div className="cp-test-progress"><span><i style={{ width: `${((session.index + 1) / session.questions.length) * 100}%` }} /></span><b>Question {session.index + 1} of {session.questions.length}</b></div>
    <div className="cp-question-card">
      <span className="cp-sample-tag">SAMPLE PRACTICE QUESTION</span>
      <p className="cp-question-topic">{question.topic}</p>
      <h2>{question.prompt}</h2>
      <div className="cp-answer-list">
        {question.choices.map((choice, index) => <button
          type="button"
          key={choice}
          className={answer === index ? 'selected' : ''}
          aria-pressed={answer === index}
          onClick={() => onAnswer(question.id, index)}
        ><span>{String.fromCharCode(65 + index)}</span>{choice}</button>)}
      </div>
    </div>
    <footer className="cp-test-actions">
      <button type="button" className="cp-outline-button" disabled={session.index === 0} onClick={() => onMove(-1)}><ChevronLeft size={14} />Previous</button>
      {session.index < session.questions.length - 1
        ? <button type="button" className="cp-primary-button" disabled={answer === undefined} onClick={() => onMove(1)}>Next question<ChevronRight size={14} /></button>
        : <button type="button" className="cp-primary-button" disabled={answer === undefined} onClick={onSubmit}>Submit test<Check size={14} /></button>}
    </footer>
  </section>
}

function ResultsPanel({ result, onBack }) {
  const wrongQuestions = result.questions.filter((question) => result.answers[question.id] !== question.answer)
  return <section className="cp-results-panel">
    <span className="cp-results-icon"><CheckCircle2 size={24} /></span>
    <span className="cp-sample-tag">SAMPLE PRACTICE RESULTS</span>
    <h2>{result.subject} practice complete</h2>
    <p>Your result is calculated from the answers you selected.</p>
    <div className="cp-result-score"><b>{result.score}/{result.questions.length}</b><span>correct answers</span></div>
    <div className="cp-result-metrics">
      <span><CheckCircle2 size={15} /><b>{result.score}</b><small>Correct</small></span>
      <span><Target size={15} /><b>{result.questions.length - result.score}</b><small>To review</small></span>
      <span><Clock3 size={15} /><b>{result.questions.length} min</b><small>Estimated time</small></span>
    </div>
    {wrongQuestions.length > 0 && <div className="cp-review-list">
      <h3>Topics to review</h3>
      {[...new Set(wrongQuestions.map((question) => question.topic))].map((topic) => <span key={topic}>{topic}</span>)}
    </div>}
    {result.questions.map((question, index) => <article className={`cp-answer-review${result.answers[question.id] === question.answer ? ' correct' : ' incorrect'}`} key={question.id}>
      <b>{index + 1}. {question.prompt}</b>
      <small>{result.answers[question.id] === question.answer ? 'Correct' : `Your answer: ${question.choices[result.answers[question.id]]}`}. {question.explanation}</small>
    </article>)}
    <button type="button" className="cp-primary-button cp-results-back" onClick={onBack}>Back to practice dashboard<ArrowRight size={14} /></button>
  </section>
}

function formatPracticeTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function CodingTestWorkspace({
  session,
  execution,
  onExit,
  onDraftChange,
  onMove,
  onRun,
  onSubmitSolution,
  onFinish,
  onTimeExpired,
  reviewMode = false,
  onBackToResults,
}) {
  const question = session.questions[session.index]
  const [outputTab, setOutputTab] = useState('Output')
  const [now, setNow] = useState(session.deadlineAt || 0)
  const [isRunning, setIsRunning] = useState(false)
  const expiredReported = useRef(false)
  const remainingSeconds = session.status === 'in-progress' && session.deadlineAt
    ? Math.max(0, Math.ceil((session.deadlineAt - now) / 1000))
    : Math.max(0, session.remainingSeconds)
  const questionCount = session.questions.length
  const currentCode = session.drafts[question.id] ?? question.starterCode
  const onTimeExpiredRef = useRef(onTimeExpired)

  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired
  }, [onTimeExpired])

  useEffect(() => {
    if (session.status !== 'in-progress' || !session.deadlineAt) return undefined
    const tick = () => {
      const time = Date.now()
      setNow(time)
      if (session.deadlineAt <= time && !expiredReported.current) {
        expiredReported.current = true
        onTimeExpiredRef.current()
      }
    }
    tick()
    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [session.deadlineAt, session.status])

  async function executeCode(action) {
    setIsRunning(true)
    setOutputTab('Output')
    try {
      await (action === 'run' ? onRun(question, currentCode) : onSubmitSolution(question, currentCode))
    } finally {
      setIsRunning(false)
    }
  }

  const completedPercent = Math.round(((session.index + 1) / questionCount) * 100)
  const actualOutput = execution?.output
  const executionUnavailable = execution?.status === 'unavailable'

  return <section className="cp-coding-workspace" aria-label={`${session.language} coding practice test`}>
    <header className="cp-coding-header">
      <div className="cp-coding-title-wrap">
        <button type="button" className="cp-coding-back" onClick={reviewMode ? onBackToResults : onExit}>
          <ArrowLeft size={15} />{reviewMode ? 'Back to Results' : 'Back to Practice'}
        </button>
        <div className="cp-coding-title">
          <span className="cp-coding-language-icon"><Code2 size={21} /></span>
          <div>
            <h1>{session.language} Practice Test</h1>
            <p>Based only on lessons completed in your personalized learning plan.</p>
            <small className="cp-demo-caption">{session.source}</small>
          </div>
        </div>
      </div>
      <div className="cp-coding-status">
        <div className={`cp-coding-timer${!reviewMode && remainingSeconds < 60 ? ' urgent' : ''}`} role="timer" aria-label={reviewMode ? 'Review mode' : 'Time remaining'}>
          <Clock3 size={25} /><span><small>{reviewMode ? 'Review Mode' : 'Time Remaining'}</small><b>{reviewMode ? '—' : formatPracticeTime(remainingSeconds)}</b></span>
        </div>
        <div className="cp-coding-progress">
          <div><b>Question {session.index + 1} of {questionCount}</b><span>{completedPercent}%</span></div>
          <i><b style={{ width: `${completedPercent}%` }} /></i>
        </div>
      </div>
    </header>

    {(execution?.message || session.status === 'timed-out') && <p className={`cp-coding-notice${session.status === 'timed-out' ? ' warning' : ''}`} role="status">
      {session.status === 'timed-out' ? 'Time is up. Your code has not been submitted or evaluated.' : execution.message}
    </p>}

    <div className="cp-coding-columns">
      <article className="cp-coding-question">
        <header className="cp-coding-question-heading">
          <div><span className="cp-coding-question-icon"><FileText size={17} /></span><b>Question {session.index + 1}</b><span className="cp-coding-difficulty">{question.difficulty}</span></div>
          <small>{question.topic}</small>
        </header>
        <div className="cp-coding-question-body">
          <h2>{question.title}</h2>
          <p>{question.description}</p>
          <h3>Input</h3><p>{question.inputFormat}</p>
          <h3>Output</h3><p>{question.outputFormat}</p>
          <h3>Constraints</h3>
          <ul className="cp-coding-constraints">{question.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul>
          <h3>Examples</h3>
          {question.examples.map((example, index) => <div className="cp-coding-example" key={`${question.id}-${index}`}>
            <b>Example {index + 1}</b>
            <span><small>Input</small><code>{example.input}</code></span>
            <span><small>Expected output</small><code>{example.output}</code></span>
            <p>{example.explanation}</p>
          </div>)}
          <details className="cp-coding-hints" open>
            <summary><span><Lightbulb size={17} /><b>Hints from your completed lessons</b><ChevronDown size={14} /></span><small>These hints are based on topics you have already studied.</small></summary>
            <ul>{question.hints.map((hint) => <li key={hint}>{hint}</li>)}</ul>
          </details>
        </div>
      </article>

      <div className="cp-coding-work-area">
        <section className="cp-code-editor-card">
          <header className="cp-code-editor-header">
            <b><Code2 size={17} />Code Editor</b>
            <label className="cp-code-language"><span aria-hidden="true">{session.language === 'Python' ? '🐍' : session.language === 'Java' ? '☕' : '‹/›'}</span>
              <select aria-label="Selected coding language" value={session.language} disabled>
                <option value={session.language}>{session.language}</option>
              </select>
            </label>
          </header>
          <div className="cp-code-editor">
            <Suspense fallback={<div className="cp-code-loading" role="status">Loading {session.language} editor…</div>}>
              <CodingCodeEditor
                language={session.language}
                value={currentCode}
                onChange={(code) => onDraftChange(question, code)}
                height="min(36vh, 340px)"
                editable={!reviewMode && session.status === 'in-progress'}
              />
            </Suspense>
          </div>
          <div className="cp-code-actions">
            <button type="button" className="cp-code-run" onClick={() => executeCode('run')} disabled={isRunning || reviewMode || session.status !== 'in-progress'}>
              <Play size={15} fill="currentColor" />{isRunning ? 'Running…' : 'Run Code'}
            </button>
            <button type="button" className="cp-code-submit" onClick={() => executeCode('submit')} disabled={isRunning || reviewMode || session.status !== 'in-progress'}>
              <Send size={15} />{isRunning ? 'Checking…' : 'Submit Solution'}
            </button>
          </div>
          <small className="cp-runner-caption">Secure code execution is not configured. Run and submit will not execute or grade your code.</small>
        </section>

        <section className="cp-code-output">
          <nav className="cp-output-tabs" role="tablist" aria-label="Code output">
            {['Output', 'Test Cases', 'Console'].map((tab) => <button type="button" role="tab" aria-selected={outputTab === tab} className={outputTab === tab ? 'active' : ''} key={tab} onClick={() => setOutputTab(tab)}>
              {tab === 'Output' ? <span className="cp-output-terminal">›_</span> : tab === 'Test Cases' ? <ListChecks size={15} /> : <Info size={15} />}{tab}
            </button>)}
          </nav>
          <div className="cp-output-content">
            {outputTab === 'Output' && (execution
              ? <div className={`cp-execution-state ${executionUnavailable ? 'unavailable' : ''}`}>
                <Code2 size={30} /><b>{executionUnavailable ? 'Execution unavailable' : 'Execution result'}</b>
                <p>{execution.message || actualOutput}</p>
              </div>
              : <div className="cp-output-empty"><Code2 size={30} /><b>Run your code to see results.</b><p>Your output, test results, and errors will appear here.</p></div>)}
            {outputTab === 'Test Cases' && <div className="cp-example-results">
              {question.examples.map((example, index) => <article key={`${question.id}-case-${index}`}>
                <b>Sample case {index + 1}</b><span>Expected: <code>{example.output}</code></span>
                <span>Actual: <code>{execution ? 'Not evaluated' : 'Not run'}</code></span>
              </article>)}
              <small>Expected examples are illustrative. Actual results require a secure execution service.</small>
            </div>}
            {outputTab === 'Console' && <div className="cp-console-content">
              {execution ? <><b>{execution.action === 'submit' ? 'Submission' : 'Run'} status</b><p>{execution.message || 'No execution details were returned.'}</p></> : <div className="cp-output-empty"><Info size={25} /><b>No console messages.</b><p>Messages will appear here after a configured code run.</p></div>}
            </div>}
          </div>
        </section>
      </div>
    </div>

    <footer className="cp-code-navigation">
      <button type="button" className="cp-outline-button" disabled={session.index === 0} onClick={() => onMove(-1)}><ChevronLeft size={15} />Previous Question</button>
      <nav className="cp-question-numbers" aria-label="Question navigation">
        {session.questions.map((item, index) => {
          const draft = session.drafts[item.id] ?? item.starterCode
          const answered = draft.trim() !== item.starterCode.trim()
          return <button type="button" key={item.id} aria-label={`Question ${index + 1}${answered ? ', code edited' : ', unanswered'}`} aria-current={index === session.index ? 'step' : undefined} className={`${index === session.index ? 'active' : ''}${answered ? ' answered' : ''}`} onClick={() => onMove(index - session.index)}>{index + 1}</button>
        })}
      </nav>
      {session.index < questionCount - 1
        ? <button type="button" className="cp-primary-button" onClick={() => onMove(1)}>Next Question<ArrowRight size={15} /></button>
        : reviewMode
          ? <button type="button" className="cp-primary-button" onClick={onBackToResults}>Back to Results<ArrowRight size={15} /></button>
          : <button type="button" className="cp-primary-button" onClick={onFinish}>Finish Practice<CheckCircle2 size={15} /></button>}
    </footer>
  </section>
}

function CodingPracticeResults({ result, onReview, onBack }) {
  const elapsed = formatPracticeTime(result.elapsedSeconds)
  return <section className="cp-results-panel cp-coding-results">
    <span className="cp-results-icon"><CheckCircle2 size={24} /></span>
    <span className="cp-sample-tag">PRACTICE SESSION SUMMARY</span>
    <h2>{result.language} practice session complete</h2>
    <p>Your code was not executed or graded because a secure code runner is not configured.</p>
    <div className="cp-result-metrics">
      <span><FileText size={15} /><b>{result.questions.length}</b><small>Total questions</small></span>
      <span><CheckCircle2 size={15} /><b>{result.answeredCount}</b><small>Questions answered</small></span>
      <span><Clock3 size={15} /><b>{elapsed}</b><small>Time used</small></span>
    </div>
    <div className="cp-coding-score-unavailable"><b>Score: Not evaluated</b><small>Correct, incorrect, and topic-level results need a configured secure evaluator. No performance or pass result is claimed.</small></div>
    <div className="cp-coding-score-unavailable"><b>Suggested topics to revise: Not available</b><small>No code was evaluated, so the app cannot determine which topics need review.</small></div>
    <div className="cp-review-list"><h3>Topics covered</h3>{[...new Set(result.questions.map((question) => question.topic))].map((topic) => <span key={topic}>{topic}</span>)}</div>
    <div className="cp-coding-result-actions">
      <button type="button" className="cp-outline-button" onClick={onReview}>Review code</button>
      <button type="button" className="cp-primary-button" onClick={onBack}>Back to Practice<ArrowRight size={14} /></button>
    </div>
  </section>
}

function CodingTestCards({ tests, practiceSession, onStart, onOpenPlan }) {
  if (!tests.length) return <div className="cp-no-questions">
    <LockKeyhole size={20} />
    <div><b>No coding tests are unlocked yet</b><small>Complete lessons that include coding topics to unlock matching sample challenges.</small></div>
    <button type="button" className="cp-outline-button" onClick={onOpenPlan}>Go to learning plan <ArrowRight size={13} /></button>
  </div>
  return <div className="cp-test-card-grid">
    {tests.map((test) => {
      const attempt = practiceSession.attempts.find((item) => item.type === 'coding' && item.testId === test.id)
      const saved = practiceSession.inProgressTests.find((item) => item.kind === 'coding' && item.testId === test.id)
      const inProgress = saved && ['in-progress', 'paused'].includes(saved.status)
      const timedOut = saved?.status === 'timed-out'
      const status = inProgress ? 'In Progress' : timedOut ? 'Timed Out' : attempt ? 'Completed' : 'Ready'
      return <article className="cp-test-card" key={test.id}>
        <div className="cp-test-card-heading">
          <span className={`cp-subject-icon large ${test.language.toLowerCase().replace(/[^a-z]+/g, '-')}`}><Code2 size={25} /></span>
          <span><b>{test.language}</b><small>{test.topics.join(', ')}</small></span>
          <span className={`cp-status-pill${attempt ? ' completed' : ''}${inProgress ? ' in-progress' : ''}${timedOut ? ' timed-out' : ''}`}>{inProgress ? <Clock3 size={12} /> : <CheckCircle2 size={12} />}{status}</span>
        </div>
        <div className="cp-test-card-facts">
          <span><FileText size={15} /><b>{test.questions.length} Questions</b><small>{test.source}</small></span>
          <span><Clock3 size={15} /><b>{test.durationMinutes} Minutes</b><small>Configured duration</small></span>
          <span><BarChart3 size={15} /><b>{test.difficulty}</b><small>Difficulty level</small></span>
        </div>
        {attempt && <small className="cp-attempt-note">Practice completed · not evaluated</small>}
        <button type="button" className="cp-primary-button cp-test-start" onClick={() => onStart(test)}>{inProgress ? 'Continue Test' : attempt || timedOut ? 'Start New Test' : 'Start Test'} <ArrowRight size={14} /></button>
      </article>
    })}
  </div>
}

export default function CareerPracticePage({ userId, careerDiscovery = {}, learningProgress }) {
  const navigate = useNavigate()
  const savedProgress = learningProgress || loadCareerLearningSession(userId).data || {}
  const tracks = getEligiblePracticeTracks(careerDiscovery, savedProgress)
  const completedLearningTopics = getCompletedCareerLearningTopics(careerDiscovery, savedProgress)
  const codingTests = getEligibleCodingPracticeTests(completedLearningTopics)
  const [initialPracticeSession] = useState(() => loadCareerPracticeSession(userId))
  const [activeTab, setActiveTab] = useState('Overview')
  const [practiceSession, setPracticeSession] = useState(initialPracticeSession.data)
  const [activeTest, setActiveTest] = useState(null)
  const [activeCodingTest, setActiveCodingTest] = useState(null)
  const [lastCodingResult, setLastCodingResult] = useState(null)
  const [reviewingCodingResult, setReviewingCodingResult] = useState(false)
  const [executionByQuestion, setExecutionByQuestion] = useState({})
  const [lastResult, setLastResult] = useState(null)
  const [saveError, setSaveError] = useState(initialPracticeSession.error)

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    loadPracticeAttempts(userId).then((databaseAttempts) => {
      if (!active) return
      setPracticeSession((current) => {
        const attempts = new Map(databaseAttempts.map((attempt) => [attempt.id, attempt]))
        current.attempts.forEach((attempt) => attempts.set(attempt.id, attempt))
        return {
          ...current,
          attempts: [...attempts.values()],
          completedQuestionIds: [...new Set([
            ...current.completedQuestionIds,
            ...databaseAttempts.flatMap((attempt) => attempt.completedQuestionIds || []),
          ])],
        }
      })
    }).catch((error) => {
      if (active) setSaveError(`Saved practice attempts could not be loaded: ${error.message}`)
    })
    return () => { active = false }
  }, [userId])
  const eligibleQuestionIds = new Set(codingTests.flatMap((test) => test.questions.map((question) => question.id)))
  const completedCodingQuestionIds = practiceSession.attempts
    .filter((attempt) => attempt.type === 'coding')
    .flatMap((attempt) => Array.isArray(attempt.answeredQuestionIds) ? attempt.answeredQuestionIds : [])
  const draftCodingQuestionIds = practiceSession.inProgressTests
    .filter((test) => test.kind === 'coding' && Array.isArray(test.questions))
    .flatMap((test) => test.questions.flatMap((question) => {
      const draft = test.drafts?.[question.id] ?? question.starterCode
      return typeof draft === 'string' && draft.trim() !== question.starterCode.trim() ? [question.id] : []
    }))
  const attemptedQuestions = new Set([...completedCodingQuestionIds, ...draftCodingQuestionIds]
    .filter((id) => eligibleQuestionIds.has(id))).size
  const questionCount = eligibleQuestionIds.size
  const eligibleSubjects = codingTests.length
  const elapsedMinutes = codingTests.reduce((total, test) => total + test.durationMinutes, 0)
  const lastAttemptFor = (subject) => practiceSession.attempts.find((attempt) => attempt.subject === subject)

  function updatePracticeSession(nextSession, persistCompletedAttempts = false) {
    setPracticeSession(nextSession)
    setSaveError(saveCareerPracticeSession(userId, nextSession))
    if (persistCompletedAttempts && userId) {
      savePracticeAttempts(userId, nextSession.attempts).then(() => {
        setSaveError((current) => current.startsWith('Practice attempts could not be saved') ? '' : current)
      }).catch((error) => setSaveError(`Practice result saved only in this browser session: ${error.message}`))
    }
  }

  function openLearningPlan() {
    navigate('/interview-prep/build-career?learningPlan=roadmap', {
      state: { careerDiscovery, learningProgress: savedProgress },
    })
  }

  function persistCodingTest(nextTest) {
    updatePracticeSession({
      ...practiceSession,
      inProgressTestIds: [...new Set([...practiceSession.inProgressTestIds, nextTest.id])],
      inProgressTests: [
        ...practiceSession.inProgressTests.filter((test) => test.id !== nextTest.id),
        nextTest,
      ],
    })
    setActiveCodingTest(nextTest)
  }

  function startCodingTest(test) {
    setActiveTab('Practice Tests')
    setLastCodingResult(null)
    setReviewingCodingResult(false)
    setLastResult(null)
    const savedTest = practiceSession.inProgressTests.find((item) =>
      item.kind === 'coding'
      && item.testId === test.id
      && item.status !== 'timed-out'
      && Array.isArray(item.questions)
      && item.questions.every((question) => question && typeof question.id === 'string')
      && item.questions.map((question) => question.id).join(',') === test.questions.map((question) => question.id).join(','))
    const durationSeconds = Number.isFinite(savedTest?.durationSeconds)
      && savedTest.durationSeconds > 0
      ? savedTest.durationSeconds
      : test.durationMinutes * 60
    const savedRemaining = savedTest?.status === 'in-progress' && savedTest.deadlineAt
      ? Math.max(0, Math.ceil((savedTest.deadlineAt - Date.now()) / 1000))
      : Math.max(0, Number.isFinite(savedTest?.remainingSeconds) ? savedTest.remainingSeconds : durationSeconds)
    const status = savedTest?.status === 'timed-out' || savedRemaining === 0 ? 'timed-out' : 'in-progress'
    const now = Date.now()
    const testSession = {
      kind: 'coding',
      id: `coding:${test.id}`,
      testId: test.id,
      subject: test.subject,
      language: test.language,
      source: test.source,
      questions: test.questions,
      index: Math.max(0, Math.min(Number.isInteger(savedTest?.index) ? savedTest.index : 0, test.questions.length - 1)),
      drafts: Object.fromEntries(test.questions.map((question) => [
        question.id,
        typeof savedTest?.drafts?.[question.id] === 'string' ? savedTest.drafts[question.id] : question.starterCode,
      ])),
      durationSeconds,
      remainingSeconds: status === 'timed-out' ? 0 : savedRemaining,
      deadlineAt: status === 'in-progress' ? now + savedRemaining * 1000 : null,
      status,
    }
    persistCodingTest(testSession)
  }

  function updateCodingTest(nextTest) {
    updatePracticeSession({
      ...practiceSession,
      inProgressTests: [
        ...practiceSession.inProgressTests.filter((test) => test.id !== nextTest.id),
        nextTest,
      ],
    })
    setActiveCodingTest(nextTest)
  }

  function updateCodingDraft(question, code) {
    updateCodingTest({
      ...activeCodingTest,
      drafts: { ...activeCodingTest.drafts, [question.id]: code },
    })
  }

  function moveCodingQuestion(offset) {
    updateCodingTest({
      ...activeCodingTest,
      index: Math.max(0, Math.min(activeCodingTest.index + offset, activeCodingTest.questions.length - 1)),
    })
  }

  function pauseCodingTest() {
    if (!activeCodingTest) return
    const remainingSeconds = activeCodingTest.status === 'in-progress' && activeCodingTest.deadlineAt
      ? Math.max(0, Math.ceil((activeCodingTest.deadlineAt - Date.now()) / 1000))
      : activeCodingTest.remainingSeconds
    const pausedTest = {
      ...activeCodingTest,
      status: remainingSeconds === 0 ? 'timed-out' : 'paused',
      remainingSeconds,
      deadlineAt: null,
    }
    updatePracticeSession({
      ...practiceSession,
      inProgressTests: [
        ...practiceSession.inProgressTests.filter((test) => test.id !== pausedTest.id),
        pausedTest,
      ],
    })
    setActiveCodingTest(null)
  }

  function expireCodingTest() {
    if (!activeCodingTest || activeCodingTest.status !== 'in-progress') return
    updateCodingTest({
      ...activeCodingTest,
      status: 'timed-out',
      remainingSeconds: 0,
      deadlineAt: null,
    })
  }

  async function executeCodingQuestion(question, code, action) {
    const key = `${activeCodingTest.testId}:${question.id}`
    try {
      const response = await runCodingSubmission({
        code,
        language: activeCodingTest.language,
        questionId: question.id,
        inputs: question.examples.map((example) => example.input),
      })
      setExecutionByQuestion((current) => ({ ...current, [key]: { ...response, action } }))
    } catch (error) {
      setExecutionByQuestion((current) => ({
        ...current,
        [key]: {
          status: 'error',
          action,
          message: error instanceof Error ? error.message : 'The code runner returned an unexpected error.',
        },
      }))
    }
  }

  function finishCodingTest() {
    if (!activeCodingTest) return
    const now = Date.now()
    const remainingSeconds = activeCodingTest.status === 'in-progress' && activeCodingTest.deadlineAt
      ? Math.max(0, Math.ceil((activeCodingTest.deadlineAt - now) / 1000))
      : activeCodingTest.remainingSeconds
    const result = {
      id: `${Date.now()}-${activeCodingTest.testId}`,
      type: 'coding',
      testId: activeCodingTest.testId,
      subject: activeCodingTest.subject,
      language: activeCodingTest.language,
      questions: activeCodingTest.questions,
      drafts: activeCodingTest.drafts,
      answeredCount: activeCodingTest.questions.filter((question) => {
        const draft = activeCodingTest.drafts[question.id] ?? question.starterCode
        return draft.trim() !== question.starterCode.trim()
      }).length,
      answeredQuestionIds: activeCodingTest.questions.flatMap((question) => {
        const draft = activeCodingTest.drafts[question.id] ?? question.starterCode
        return draft.trim() !== question.starterCode.trim() ? [question.id] : []
      }),
      elapsedSeconds: Math.max(0, activeCodingTest.durationSeconds - remainingSeconds),
      completedAt: new Date().toISOString(),
      session: { ...activeCodingTest, status: 'completed', remainingSeconds, deadlineAt: null },
    }
    updatePracticeSession({
      ...practiceSession,
      attempts: [result, ...practiceSession.attempts].slice(0, 30),
      inProgressTestIds: practiceSession.inProgressTestIds.filter((id) => id !== activeCodingTest.id),
      inProgressTests: practiceSession.inProgressTests.filter((test) => test.id !== activeCodingTest.id),
    }, true)
    setLastCodingResult(result)
    setActiveCodingTest(null)
  }

  function reviewCodingResult() {
    if (!lastCodingResult) return
    setReviewingCodingResult(true)
    setActiveCodingTest({ ...lastCodingResult.session, index: 0 })
  }

  function startMcqTest(track) {
    setLastResult(null)
    setActiveTab('Practice Tests')
    const savedTest = practiceSession.inProgressTests.find((test) =>
      test.kind !== 'coding'
      &&
      test.subject === track.subject
      && Array.isArray(test.questions)
      && test.questions.every((question) => typeof question?.id === 'string')
      && test.questions.map((question) => question.id).join(',') === track.questions.map((question) => question.id).join(','))
    const testSession = savedTest ? {
      subject: track.subject,
      questions: track.questions,
      index: Math.max(0, Math.min(Number.isInteger(savedTest.index) ? savedTest.index : 0, track.questions.length - 1)),
      answers: savedTest.answers && typeof savedTest.answers === 'object' ? savedTest.answers : {},
    } : {
      subject: track.subject,
      questions: track.questions,
      index: 0,
      answers: {},
    }
    updatePracticeSession({
      ...practiceSession,
      inProgressTestIds: [...new Set([...practiceSession.inProgressTestIds, track.subject])],
      inProgressTests: [
        ...practiceSession.inProgressTests.filter((test) => test.subject !== track.subject),
        testSession,
      ],
    })
    setActiveTest(testSession)
  }

  function answerQuestion(questionId, answerIndex) {
    const nextTest = {
      ...activeTest,
      answers: { ...activeTest.answers, [questionId]: answerIndex },
    }
    updatePracticeSession({
      ...practiceSession,
      inProgressTests: [
        ...practiceSession.inProgressTests.filter((test) => test.subject !== activeTest.subject),
        nextTest,
      ],
    })
    setActiveTest(nextTest)
  }

  function moveQuestion(offset) {
    const nextTest = { ...activeTest, index: activeTest.index + offset }
    updatePracticeSession({
      ...practiceSession,
      inProgressTests: [
        ...practiceSession.inProgressTests.filter((test) => test.subject !== activeTest.subject),
        nextTest,
      ],
    })
    setActiveTest(nextTest)
  }

  function finishTest() {
    const score = activeTest.questions.reduce(
      (total, question) => total + (activeTest.answers[question.id] === question.answer ? 1 : 0),
      0,
    )
    const result = {
      id: `${Date.now()}-${activeTest.subject}`,
      subject: activeTest.subject,
      score,
      questions: activeTest.questions,
      answers: activeTest.answers,
      completedAt: new Date().toISOString(),
    }
    const nextSession = {
      completedQuestionIds: [...new Set([
        ...practiceSession.completedQuestionIds,
        ...activeTest.questions.map((question) => question.id),
      ])],
      attempts: [result, ...practiceSession.attempts].slice(0, 30),
      inProgressTestIds: practiceSession.inProgressTestIds.filter((id) => id !== activeTest.subject),
      inProgressTests: practiceSession.inProgressTests.filter((test) => test.subject !== activeTest.subject),
    }
    updatePracticeSession(nextSession, true)
    setLastResult(result)
    setActiveTest(null)
  }

  if (activeCodingTest) {
    const currentQuestion = activeCodingTest.questions[activeCodingTest.index]
    const executionKey = `${activeCodingTest.testId}:${currentQuestion.id}`
    return <section className="career-practice-page cp-code-page">
      {saveError && <p className="cp-error" role="alert">{saveError}</p>}
      <CodingTestWorkspace
        session={activeCodingTest}
        execution={executionByQuestion[executionKey]}
        onExit={reviewingCodingResult ? () => setActiveCodingTest(null) : pauseCodingTest}
        onDraftChange={updateCodingDraft}
        onMove={moveCodingQuestion}
        onRun={(question, code) => executeCodingQuestion(question, code, 'run')}
        onSubmitSolution={(question, code) => executeCodingQuestion(question, code, 'submit')}
        onFinish={finishCodingTest}
        onTimeExpired={expireCodingTest}
        reviewMode={reviewingCodingResult}
        onBackToResults={() => setActiveCodingTest(null)}
      />
    </section>
  }

  const completionPercent = questionCount ? Math.round((attemptedQuestions / questionCount) * 100) : 0
  return <section className="career-practice-page" aria-labelledby="cp-title">
    <PracticeHeader
      careerDiscovery={careerDiscovery}
      onBack={() => navigate('/interview-prep/build-career')}
    />

    {saveError && <p className="cp-error" role="alert">{saveError}</p>}
    {lastCodingResult
      ? <CodingPracticeResults
        result={lastCodingResult}
        onReview={reviewCodingResult}
        onBack={() => {
          setLastCodingResult(null)
          setReviewingCodingResult(false)
        }}
      />
      : lastResult
      ? <ResultsPanel result={lastResult} onBack={() => setLastResult(null)} />
      : activeTest
        ? <QuestionRunner
          session={activeTest}
          onAnswer={answerQuestion}
          onMove={moveQuestion}
          onSubmit={finishTest}
          onExit={() => setActiveTest(null)}
        />
        : <>
          <nav className="cp-tabs" role="tablist" aria-label="Practice section">
            {['Overview', 'Practice Tests', 'Topic-wise Practice'].map((tab) => <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? 'active' : ''}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >{tab}</button>)}
          </nav>

          {activeTab === 'Overview' && <>
            <div className="cp-overview-grid">
              <section className="cp-session-card">
                <header className="cp-section-heading">
                  <span className="cp-icon-tile green"><BookOpen size={24} /></span>
                  <span><b>Today&apos;s Learning Session</b><small>Your progress from today&apos;s learning plan. Complete the practice tests below.</small></span>
                  <button type="button" className="cp-view-plan" onClick={openLearningPlan}>View learning plan <ArrowRight size={14} /></button>
                </header>
                {tracks.length > 0 ? <div className="cp-learning-track">
                  {tracks.map((track, index) => {
                    const latest = lastAttemptFor(track.subject)
                    const Icon = track.subject.includes('Data') ? BarChart3 : track.subject.includes('Backend') ? Code2 : Code2
                    return <div className="cp-learning-item" key={track.id}>
                      {index > 0 && <span className={`cp-connector${tracks[index - 1] ? ' complete' : ''}`} />}
                      <span className="cp-track-check"><Check size={13} /></span>
                      <span className={`cp-subject-icon ${track.subject.toLowerCase().replace(/[^a-z]+/g, '-')}`}><Icon size={22} /></span>
                      <span className="cp-learning-name"><b>{track.subject}</b><small>{track.topics.join(', ')}</small><em>{latest ? 'Practice attempted' : 'Lessons completed'}</em></span>
                    </div>
                  })}
                </div> : <div className="cp-session-empty">
                  <BookOpen size={22} /><div><b>No completed lessons yet</b><small>Complete a lesson in your learning plan to unlock relevant practice questions.</small></div>
                  <button type="button" className="cp-view-plan" onClick={openLearningPlan}>Open learning plan <ArrowRight size={14} /></button>
                </div>}
                <span className="cp-demo-caption">Practice questions are sample content; no question database or AI generator is connected.</span>
              </section>

              <aside className="cp-summary-card">
                <header className="cp-section-heading">
                  <span className="cp-icon-tile blue"><BarChart3 size={24} /></span>
                  <span><b>Today&apos;s Practice Summary</b><small>Based on your completed lessons</small></span>
                </header>
                <div className="cp-summary-grid">
                  <div className="cp-summary-metric"><span className="green"><FileText size={17} /></span><b>{questionCount}</b><small>Questions available</small></div>
                  <div className="cp-summary-metric"><span className="purple"><Code2 size={17} /></span><b>{eligibleSubjects}</b><small>Subjects ready</small></div>
                  <div className="cp-summary-metric"><span className="blue"><Clock3 size={17} /></span><b>{elapsedMinutes} min</b><small>Estimated time · no timer</small></div>
                  <div className="cp-summary-metric cp-summary-progress"><span className="orange"><Target size={17} /></span><b>{attemptedQuestions} / {questionCount}</b><small>Questions attempted</small><i><b style={{ width: `${completionPercent}%` }} /></i><em>{completionPercent}%</em></div>
                </div>
              </aside>
            </div>

            <section className="cp-ready-section">
              <header className="cp-section-heading">
                <span className="cp-icon-tile green"><Code2 size={23} /></span>
                <span><b>Practice Ready from Your Lessons</b><small>You&apos;ll get questions only from the topics you have completed in your learning plan.</small></span>
              </header>
              <div className="cp-info-banner"><Info size={15} />Questions are generated only from topics completed in your learning plan. Sample questions are clearly marked.</div>
              <CodingTestCards tests={codingTests} practiceSession={practiceSession} onStart={startCodingTest} onOpenPlan={openLearningPlan} />
              {tracks.length > 0 && <button type="button" className="cp-primary-button cp-combined-start" onClick={() => startMcqTest({
                subject: 'Today’s combined practice',
                questions: [...new Map(tracks.flatMap((track) => track.questions).map((question) => [question.id, question])).values()],
              })}><Play size={15} fill="currentColor" />Start Today&apos;s Practice — {new Set(tracks.flatMap((track) => track.questions.map((question) => question.id))).size} Questions<ArrowRight size={15} /></button>}
            </section>

            <section className="cp-locked-panel">
              <LockKeyhole size={18} />
              <span><b>More subjects unlock as you complete their corresponding lessons in your learning plan.</b><small>Keep learning to unlock more practice tests and build your skills step by step.</small></span>
              {Object.entries(studyStepsBySubject)
                .filter(([subject]) => !tracks.some((track) => track.subject === subject))
                .map(([subject, topics]) => <span className="cp-locked-subject" key={subject}>{subject}<small>{topics[0]}</small></span>)}
            </section>
          </>}

          {activeTab === 'Practice Tests' && <section className="cp-tab-content">
            <div className="cp-tab-title"><h2>Practice Tests</h2><p>Start a language test based on coding topics you have marked complete.</p></div>
            <CodingTestCards tests={codingTests} practiceSession={practiceSession} onStart={startCodingTest} onOpenPlan={openLearningPlan} />
          </section>}

          {activeTab === 'Topic-wise Practice' && <section className="cp-tab-content">
            <div className="cp-tab-title"><h2>Topic-wise Practice</h2><p>Continue with the existing Topic-wise Practice workspace.</p></div>
            <article className="cp-topic-handoff"><span className="cp-icon-tile blue"><Target size={20} /></span><span><b>Open Topic-wise Practice</b><small>This existing destination provides topic-based exercises. It is separate from lesson-gated sample tests on this page.</small></span><button type="button" className="cp-primary-button" onClick={() => navigate('/interview-prep/topic-practice', { state: { returnTo: '/interview-prep/build-career?careerPractice=overview' } })}>Open Topic-wise Practice <ArrowRight size={14} /></button></article>
          </section>}
        </>}
  </section>
}
