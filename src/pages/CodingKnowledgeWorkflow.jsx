import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, Braces,
  ChevronRight, CircleAlert, Clock3, Code2, Database, FileCode2, Filter,
  Info, Layers3, Lightbulb, ListChecks, Play, RotateCcw, Search, Send,
  ShieldAlert, Timer, Trees, Trash2, X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getAttemptDifficulty, getStarterCode, filterCodingCollections, getUtcDateKey } from '../services/codingTestData.js'
import {
  listActiveCodingAttempts, listCodingAttemptHistory, listCodingTests, loadCodingAttempt,
  runCodingAttemptCode, saveCodingAnswer, startCodingAttempt, updateCodingAttempt,
} from '../services/codingTestService.js'

const DIFFICULTIES = ['All Difficulties', 'Easy', 'Medium', 'Hard']
const DURATIONS = ['Any duration', '30 minutes or less', '31–45 minutes', 'Over 45 minutes']
const DEFAULT_QUESTION_COUNT = 50
const ICONS = { brackets: Braces, javascript: Code2, web: FileCode2, backend: Layers3, database: Database, tree: Trees }
const CodingCodeEditor = lazy(() => import('./CodingCodeEditor'))

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds)
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

function formatDate(timestamp) {
  if (!timestamp) return 'Not submitted'
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function useFocusTrap(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])
}

function CodingDialog({ title, description, confirmLabel, onConfirm, onCancel, danger = false, disabled = false }) {
  useFocusTrap(true, onCancel)
  return <div className="ct-dialog-scrim" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onCancel()
  }}>
    <section className="ct-dialog" role="dialog" aria-modal="true" aria-labelledby="ct-dialog-title">
      <button className="ct-dialog-close" type="button" aria-label="Close dialog" onClick={onCancel}><X size={18} /></button>
      <span className={`ct-dialog-icon${danger ? ' danger' : ''}`}>{danger ? <ShieldAlert size={22} /> : <CircleAlert size={22} />}</span>
      <h2 id="ct-dialog-title">{title}</h2>
      <p>{description}</p>
      <div className="ct-dialog-actions">
        <button className="ct-button secondary" type="button" onClick={onCancel}>Keep working</button>
        <button className={`ct-button${danger ? ' danger' : ' primary'}`} type="button" onClick={onConfirm} disabled={disabled}>{confirmLabel}</button>
      </div>
    </section>
  </div>
}

function PageBackButton({ children = 'Back', onClick }) {
  return <button type="button" className="ct-back-button" onClick={onClick}><ArrowLeft size={15} />{children}</button>
}

function Breadcrumb({ current, test }) {
  return <nav className="ct-breadcrumb" aria-label="Breadcrumb">
    <span>Coding Knowledge</span><ChevronRight size={14} />
    {test && <><span>Coding Test</span><ChevronRight size={14} /></>}
    <b>{current}</b>
  </nav>
}

function LibraryFeatureCards() {
  const cards = [
    { title: 'Practice Coding Tests', text: 'Solve original interview-style problems.', Icon: Code2, tone: 'green' },
    { title: 'Multiple Topics', text: 'Explore arrays, strings, SQL, and more.', Icon: Layers3, tone: 'blue' },
    { title: 'Timed Tests', text: 'Practice within a clear time limit.', Icon: Timer, tone: 'amber' },
  ]
  return <div className="ct-feature-grid">{cards.map(({ title, text, Icon, tone }) => <article className="ct-feature-card" key={title}>
    <span className={`ct-feature-icon ${tone}`}><Icon size={18} /></span><div><b>{title}</b><small>{text}</small></div>
  </article>)}</div>
}

const TRACK_LANGUAGE_BY_SLUG = {
  'java-fundamentals': 'Java',
  'java-dsa-practice': 'Java',
  'python-programming': 'Python',
  'python-dsa-practice': 'Python',
  'c-programming': 'C',
  'cpp-programming': 'C++',
  'javascript-core-challenges': 'JavaScript',
  'javascript-dsa-practice': 'JavaScript',
  'typescript-challenges': 'TypeScript',
  'go-programming': 'Go',
  'csharp-programming': 'C#',
  'sql-database-foundations': 'SQL',
  'dbms-database-design': 'SQL',
}

function resolveTrackLanguage(test, fallbackLanguage = '') {
  const configuredLanguage = typeof window !== 'undefined' ? window.localStorage.getItem('skillproof-preferred-language') : ''
  const preferredLanguage = TRACK_LANGUAGE_BY_SLUG[test.slug] || fallbackLanguage || configuredLanguage || ''
  if (preferredLanguage && test.languages.includes(preferredLanguage)) return preferredLanguage
  return ''
}

function LibraryPage({ tests, history, historyError, activeAttempts, loading, error, startingTestIds, onRetry, onStart, onResume, onBack, backLabel }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0])
  const [duration, setDuration] = useState(DURATIONS[0])
  const [collection, setCollection] = useState('All collections')
  const categories = ['All Categories', ...new Set(tests.map((test) => test.category))]
  const requestedQuestionCount = DEFAULT_QUESTION_COUNT
  const today = getUtcDateKey()
  const visibleTests = filterCodingCollections(tests, { category, difficulty, duration, collection, search })

  function handleStartClick(test) {
    const resolvedLanguage = resolveTrackLanguage(test)
    if (!resolvedLanguage || !test.languages.includes(resolvedLanguage)) {
      const selectedLanguage = typeof window !== 'undefined' ? window.prompt(`Choose a preferred language for ${test.title}:`, test.languages[0] || '') : ''
      if (!selectedLanguage || !test.languages.includes(selectedLanguage)) return
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('skillproof-preferred-language', selectedLanguage)
      }
      onStart(test, requestedQuestionCount, selectedLanguage)
      return
    }
    onStart(test, requestedQuestionCount, resolvedLanguage)
  }

  return <section className="coding-workflow ct-library">
    <div className="ct-page-top"><PageBackButton onClick={onBack}>{backLabel}</PageBackButton></div>
    <header className="ct-library-hero">
      <div><span className="ct-eyebrow">CODING TEST</span><h1>Practice Coding Tests <span>Like Real Interviews</span></h1><p>Choose a test, solve problems, and improve your coding skills with real interview-style challenges.</p></div>
    </header>
    <LibraryFeatureCards />
    {activeAttempts.length > 0 && <section className="ct-active-attempts" aria-label="Active coding test attempts">
      {activeAttempts.map((bundle) => {
        const test = tests.find((item) => item.id === bundle.attempt.testId)
        if (!test) return null
        return <div className="ct-resume-banner" key={bundle.attempt.id}>
          <div><b>{test.title}</b><span>{bundle.attempt.status === 'paused' ? 'Paused' : 'In progress'} · {formatTime(bundle.attempt.remainingSeconds)} remaining</span></div>
          <button className="ct-button primary" type="button" onClick={() => onResume(bundle)}>Resume Test <ArrowRight size={15} /></button>
        </div>
      })}
    </section>}
    <section className="ct-filter-panel" aria-label="Filter coding tests">
      <label><span><Filter size={14} />Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span><Activity size={14} />Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span><Clock3 size={14} />Duration</span><select value={duration} onChange={(event) => setDuration(event.target.value)}>{DURATIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span><Layers3 size={14} />Collection</span><select value={collection} onChange={(event) => setCollection(event.target.value)}>{['All collections', ...tests.map((test) => test.title)].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="ct-search"><span><Search size={14} />Search tests</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tests, topics, or languages…" /></label>
    </section>
    <div className="ct-library-results"><h2>Available Coding Tests <span>{visibleTests.length} tests</span></h2></div>
    {error ? <div className="ct-empty-state" role="alert"><CircleAlert size={24} /><b>Coding tests could not be loaded.</b><span>{error}</span><button className="ct-button secondary" type="button" onClick={onRetry}>Retry</button></div>
      : loading ? <div className="ct-empty-state" role="status"><Clock3 size={24} /><b>Loading coding tests…</b></div>
      : visibleTests.length ? <div className="ct-test-grid">{visibleTests.map((test) => {
      const Icon = ICONS[test.icon] || Code2
      const activeAttempt = activeAttempts.find((item) => item.attempt.testId === test.id && item.attempt.sessionDate === today)
      const completedToday = history.find((item) => item.collection_id === test.collectionId
        && item.daily_session_date === today && item.status === 'completed')
      const bankCount = test.publishedQuestionCount
      const dailyQuestionCount = activeAttempt?.attempt.questionCount
        ?? completedToday?.selected_question_count
        ?? Math.min(requestedQuestionCount, bankCount)
      return <article className={`ct-test-card ${test.accent}`} key={test.id}>
        <div className="ct-test-card-top"><span className="ct-test-icon"><Icon size={20} /></span></div>
        <h3>{test.title}</h3><p>{test.description}</p>
        <div className="ct-topic-tags">{test.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
        <div className="ct-test-meta"><span><ListChecks size={14} />{bankCount} in bank</span><span><Clock3 size={14} />{activeAttempt ? activeAttempt.attempt.questionCount : dailyQuestionCount} daily questions</span><span><Code2 size={14} />{resolveTrackLanguage(test) || 'Choose language'}</span><span className={`ct-difficulty ${getAttemptDifficulty(test.difficulty).toLowerCase()}`}>{getAttemptDifficulty(test.difficulty)}</span></div>
        {bankCount < requestedQuestionCount && bankCount > 0 && <small className="ct-availability-note">The current bank supports {bankCount} questions; 50 distinct questions are needed for a full daily session.</small>}
        <button className="ct-button primary ct-start-button" type="button" disabled={bankCount === 0 || startingTestIds.includes(test.id) || !test.languages.length} onClick={() => activeAttempt ? onResume(activeAttempt) : handleStartClick(test)}>{startingTestIds.includes(test.id) ? 'Starting…' : bankCount === 0 ? 'No Questions Available' : activeAttempt ? 'Resume Test' : completedToday ? "View Today's Results" : 'Start Test'}<ArrowRight size={15} /></button>
      </article>
    })}</div> : <div className="ct-empty-state"><Search size={24} /><b>{tests.length ? 'No coding tests match these filters.' : 'No published coding tests are available yet.'}</b><span>{tests.length ? 'Try a different category, difficulty, duration, collection, or search term.' : 'Published coding collections will appear here when available.'}</span></div>}
    <section className="ct-result-panel" aria-label="Coding test history"><header><h2><Clock3 size={18} />Test History</h2><span>Saved attempts</span></header>
      {historyError ? <p role="alert">{historyError} <button className="ct-button secondary" type="button" onClick={onRetry}>Retry</button></p>
        : history.length ? <ul>{history.map((item) => <li key={item.id}><b>{tests.find((test) => test.collectionId === item.collection_id)?.title || 'Unavailable collection'}</b><span>{item.status.replace('_', ' ')} · {formatDate(item.completed_at || item.started_at)}</span></li>)}</ul>
          : <p className="ct-demo-note">No test attempts have been saved yet.</p>}
    </section>
  </section>
}

function QuestionSelector({ test, attempt, onSelectQuestion }) {
  const questions = test.questions
  return <nav className="ct-question-selector" aria-label="Test questions">
    <b>Questions</b>
    <div>{questions.map((question, index) => {
      const submitted = Boolean(attempt.submissions[question.id])
      const drafted = Object.entries(attempt.drafts).some(([key, value]) => key.startsWith(`${question.id}::`) && value.trim() !== getStarterCode(question, key.split('::')[1]).trim())
      const state = submitted ? 'completed' : drafted ? 'attempted' : 'unattempted'
      return <button key={question.id} type="button" className={`${index === attempt.currentQuestionIndex ? 'current ' : ''}${state}`} aria-label={`Question ${index + 1}, ${state}`} aria-current={index === attempt.currentQuestionIndex ? 'step' : undefined} onClick={() => onSelectQuestion(index)}>{index + 1}</button>
    })}</div>
    <span>{Object.keys(attempt.submissions).length} completed · {questions.length} total</span>
  </nav>
}

function ProblemPanel({ question, index, count, onNext, onPrevious, onSkip }) {
  return <section className="ct-problem-panel">
    <header className="ct-problem-heading"><div><span className="ct-question-kicker">QUESTION {index + 1} OF {count}</span><h1>{question.title}</h1></div><span className={`ct-difficulty ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span></header>
    <div className="ct-problem-copy"><p>{question.description}</p>
      {question.constraints.length > 0 && <section className="ct-hint-panel"><h2><Lightbulb size={17} />Constraints</h2><ul>{question.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></section>}
      {question.examples.map((example, exampleIndex) => <section className="ct-review-sample" key={`${question.id}-example-${exampleIndex}`}><b>Example {exampleIndex + 1} · Input</b><pre>{example.input}</pre><b>Expected output</b><pre>{example.output}</pre></section>)}
    </div>
    <footer className="ct-problem-actions"><button className="ct-button secondary" type="button" disabled={index === 0} onClick={onPrevious}><ArrowLeft size={14} />Previous</button>
      <button className="ct-button secondary" type="button" disabled={index === count - 1} onClick={onSkip}>Skip Question</button>
      <button className="ct-button primary" type="button" disabled={index === count - 1} onClick={onNext}>Next Question<ArrowRight size={14} /></button></footer>
  </section>
}

function EditorPanel({ test, attempt, currentCode, onCodeChange, onLanguageChange, onRun, onSubmit, runState, noticeMessage, onClearOutput, isFinal, disabled }) {
  const [activeTab, setActiveTab] = useState('Output')
  const hasUserCode = Boolean(currentCode.trim()) && currentCode.trim() !== getStarterCode(test.questions[attempt.currentQuestionIndex], attempt.language).trim()
  async function runAndShowOutput() {
    await onRun()
    setActiveTab('Output')
  }
  return <section className="ct-editor-panel">
    <header className="ct-editor-toolbar"><b>Code Editor</b><label><span className="sr-only">Programming language</span><select aria-label="Programming language" value={attempt.language} onChange={(event) => onLanguageChange(event.target.value)}>{test.languages.map((language) => <option key={language}>{language}</option>)}</select></label></header>
    <div className="ct-code-editor" aria-label={`${attempt.language} code editor`}>
      <Suspense fallback={<div className="ct-editor-loading">Loading {attempt.language} syntax editor…</div>}><CodingCodeEditor
        language={attempt.language}
        value={currentCode}
        onChange={onCodeChange}
      /></Suspense>
    </div>
    <div className="ct-editor-actions"><button className="ct-button secondary" type="button" onClick={runAndShowOutput} disabled={!hasUserCode || disabled}><Play size={14} />{runState?.loadingMode === 'run' ? 'Running…' : 'Run Code'}</button>
      <button className="ct-button primary" type="button" onClick={onSubmit} disabled={disabled}><Send size={14} />{runState?.loadingMode === 'submit' ? 'Evaluating…' : isFinal ? 'Submit Final Test' : 'Submit Solution'}</button>
    </div>
    <div className="ct-editor-tabs" role="tablist" aria-label="Editor output panels">
      {['Output', 'Test Cases', 'Console'].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} type="button" key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      {runState && <span className="ct-run-status">{runState.status === 'unavailable' ? 'Execution unavailable' : runState.status}</span>}
      <button className="ct-clear-output" type="button" onClick={onClearOutput}><Trash2 size={13} />Clear</button>
    </div>
    <div className="ct-editor-output" role="tabpanel">
      {activeTab === 'Test Cases' ? <div className="ct-execution-results" role="status">
        {runState?.loadingMode ? <p>Execution is running against {runState.loadingMode === 'submit' ? 'visible and hidden evaluation cases' : 'visible sample cases'}…</p>
          : runState?.visibleResults?.length ? <>
            {runState.visibleResults.map((item) => <article className={`ct-execution-case ${item.status}`} key={item.caseOrder}>
              <b>Visible case {item.caseOrder} · {item.status === 'passed' ? 'Passed' : 'Failed'}</b>
              <span>Input</span><pre>{item.input}</pre>
              <span>Expected output</span><pre>{item.expectedOutput}</pre>
              <span>Actual output</span><pre>{item.actualOutput || '(no stdout)'}</pre>
            </article>)}
            {runState.mode === 'submit' && <p>Hidden evaluation: {runState.hiddenPassed} of {runState.hiddenTotal} passed. Hidden inputs and expected outputs are not returned.</p>}
          </> : <p>{runState?.message || 'Run code to evaluate the visible sample cases. Hidden cases are only used during submission.'}</p>}
      </div> :
        activeTab === 'Console' ? <div className={`ct-terminal-message${runState?.status === 'service_error' || runState?.status === 'runtime_error' || runState?.status === 'compile_error' ? ' error' : ''}`} role="status">
          {runState?.message || 'Console output will appear after code runs.'}
          {runState?.stdout && <><b>stdout</b><pre>{runState.stdout}</pre></>}
          {runState?.stderr && <><b>stderr</b><pre>{runState.stderr}</pre></>}
          {runState?.compileOutput && <><b>Compiler output</b><pre>{runState.compileOutput}</pre></>}
          {runState?.executionTimeMs !== undefined && <small>{runState.executionTimeMs} ms · {runState.memoryKb ?? '—'} KB</small>}
        </div> :
          <div className={`ct-terminal-message${runState?.status === 'service_error' || runState?.status === 'runtime_error' || runState?.status === 'compile_error' ? ' error' : ''}`} role="status">
            {runState?.message || 'Run code to see actual program output.'}
            {runState?.stdout && <pre>{runState.stdout}</pre>}
            {runState && <small>{runState.passedTests ?? 0}/{runState.totalTests ?? 0} tests passed{runState.mode === 'submit' ? ` · score ${runState.score}/${runState.maxScore}` : ' · visible cases only'}</small>}
          </div>}
      {noticeMessage && <p className="ct-panel-notice" role="status">{noticeMessage}</p>}
    </div>
  </section>
}

function ResultReview({ test, question, submission, onClose }) {
  useFocusTrap(true, onClose)
  return <div className="ct-dialog-scrim" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose()
  }}>
    <section className="ct-review-dialog" role="dialog" aria-modal="true" aria-labelledby="ct-review-title">
      <header><div><span className="ct-eyebrow">SOLUTION REVIEW</span><h2 id="ct-review-title">{question.title}</h2><p>{question.topic} · {question.difficulty}</p></div><button type="button" aria-label="Close review" onClick={onClose}><X size={19} /></button></header>
      <div className="ct-review-body"><p>{question.description}</p><h3>Submitted code</h3>{submission ? <><p className="ct-review-meta">{submission.language} · Submitted {formatDate(submission.submittedAt)} · {submission.status.replace('_', ' ')}</p><Suspense fallback={<div className="ct-editor-loading">Loading code review…</div>}><CodingCodeEditor language={submission.language} value={submission.code} height="280px" editable={false} /></Suspense></> : <div className="ct-review-unavailable">No submitted source code is available for this question. Any draft code was not submitted.</div>}
        <h3>Execution and grading</h3>{submission?.evaluation ? <div className="ct-review-unavailable">
          <b>{submission.evaluation.status.replace('_', ' ')}</b>
          <p>{submission.evaluation.passedTests}/{submission.evaluation.totalTests} tests passed · score {submission.evaluation.score}/{submission.evaluation.maxScore}</p>
          <p>Hidden cases passed: {submission.evaluation.hiddenPassed}/{submission.evaluation.hiddenTotal}. Hidden test inputs and expected outputs remain private.</p>
        </div> : <p className="ct-review-unavailable">No evaluated submission is saved for this question.</p>}
        {question.examples[0] && <><h3>Visible sample</h3><div className="ct-review-sample"><b>Input</b><pre>{question.examples[0].input}</pre><b>Expected output</b><pre>{question.examples[0].output}</pre></div></>}
      </div>
      <footer><button type="button" className="ct-button secondary" onClick={onClose}>Close review</button><span>{test.title}</span></footer>
    </section>
  </div>
}

function ResultsPage({ test, attempt, onBack, onRetake, onExplore, backLabel = 'Back' }) {
  const [reviewIndex, setReviewIndex] = useState(null)
  const submitted = Object.keys(attempt.submissions).length
  const draftOnly = test.questions.filter((question) => !attempt.submissions[question.id] && Object.keys(attempt.drafts).some((key) => key.startsWith(`${question.id}::`))).length
  const unattempted = test.questions.length - submitted - draftOnly
  const evaluated = Object.values(attempt.submissions).filter((submission) => submission.evaluation)
  const earnedScore = evaluated.reduce((total, submission) => total + (submission.evaluation.score || 0), 0)
  const possibleScore = evaluated.reduce((total, submission) => total + (submission.evaluation.maxScore || 0), 0)
  return <section className="coding-workflow ct-results">
    <div className="ct-page-top"><PageBackButton onClick={onBack}>{backLabel}</PageBackButton><Breadcrumb current="Test Results" test /></div>
    <header className="ct-results-hero"><div><span className="ct-eyebrow">CODING TEST</span><h1>Coding Test <span>Results</span></h1><p>Here is the saved completion summary for this coding test.</p></div><span className="ct-result-status"><Info size={15} />Completed · {evaluated.length ? 'evaluated submissions' : 'no evaluated submissions'}</span></header>
    <section className="ct-result-test-info"><div><b>{test.title}</b><span>{attempt.language} · {attempt.difficulty} · {attempt.questionCount} questions</span></div><div><b>Submitted</b><span>{formatDate(attempt.completedAt)}</span></div></section>
    <div className="ct-metric-grid">
      <article><span>Score</span><b>{possibleScore ? `${earnedScore}/${possibleScore}` : 'Unavailable'}</b><small>{possibleScore ? `${evaluated.length} evaluated question(s)` : 'No evaluated submissions'}</small></article>
      <article><span>Submitted questions</span><b>{submitted}</b><small>{evaluated.length} evaluated · {submitted - evaluated.length} without evaluation</small></article>
      <article><span>Not submitted</span><b>{draftOnly + unattempted}</b><small>{draftOnly} draft only · {unattempted} untouched</small></article>
      <article><span>Time taken</span><b>{formatTime(Math.max(0, attempt.totalSeconds - attempt.remainingSeconds))}</b><small>Based on the configured duration</small></article>
      <article><span>Difficulty</span><b className={`ct-difficulty ${attempt.difficulty.toLowerCase()}`}>{attempt.difficulty}</b><small>{attempt.minutesPerQuestion} minutes per question</small></article>
    </div>
    <div className="ct-results-grid">
      <section className="ct-result-panel"><header><h2><ListChecks size={18} />Question Breakdown</h2><span>Actual attempt state</span></header>
        <div className="ct-result-table-wrap"><table><thead><tr><th>#</th><th>Question</th><th>Topic</th><th>Difficulty</th><th>Status</th><th>Time</th><th /></tr></thead><tbody>{test.questions.map((question, index) => {
          const submission = attempt.submissions[question.id]
          const hasDraft = !submission && Object.keys(attempt.drafts).some((key) => key.startsWith(`${question.id}::`))
          return <tr key={question.id}><td>{index + 1}</td><td>{question.title}</td><td>{question.topic}</td><td>{question.difficulty}</td><td><span className={`ct-attempt-status${submission ? ' submitted' : ''}`}>{submission ? submission.status.replace('_', ' ') : hasDraft ? 'Draft only' : 'Not attempted'}</span></td><td>{submission?.evaluation ? `${submission.evaluation.score}/${submission.evaluation.maxScore}` : '—'}</td><td><button type="button" className="ct-review-link" onClick={() => setReviewIndex(index)}>Review</button></td></tr>
        })}</tbody></table></div>
      </section>
      <section className="ct-result-panel ct-topic-performance"><header><h2><BarChart3 size={18} />Grading</h2><span>{possibleScore ? 'Evaluation results' : 'Not available'}</span></header>
        <p className="ct-demo-note"><Info size={14} />{possibleScore ? 'Scores reflect completed server-side test-case evaluation only.' : 'No code execution result is saved for this attempt.'}</p>
      </section>
    </div>
    <section className="ct-result-disclaimer"><ShieldAlert size={18} /><div><b>{evaluated.length ? 'Scores below come from server-side execution.' : 'No evaluated submissions are available for this attempt.'}</b><span>Question submissions and execution results are saved separately. A saved source file alone is never treated as accepted or graded.</span></div></section>
    <div className="ct-results-actions"><button className="ct-button secondary" type="button" onClick={() => setReviewIndex(0)}><Code2 size={15} />Review Solutions</button><button className="ct-button secondary" type="button" onClick={onRetake}><RotateCcw size={15} />Retake Test</button><button className="ct-button primary" type="button" onClick={onExplore}>Explore More Tests<ArrowRight size={15} /></button></div>
    {reviewIndex !== null && <ResultReview test={test} question={test.questions[reviewIndex]} submission={attempt.submissions[test.questions[reviewIndex].id]} onClose={() => setReviewIndex(null)} />}
  </section>
}

function TestPage({ test, attempt, remaining, runState, executionBusy, noticeMessage, onBack, onQuestionChange, onLanguageChange, onCodeChange, onRun, onSubmit, onNext, onPrevious, onClearOutput, backLabel = 'Back' }) {
  const question = test.questions[attempt.currentQuestionIndex]
  const codeKey = `${question.id}::${attempt.language}`
  const code = attempt.drafts[codeKey] ?? getStarterCode(question, attempt.language)
  const isFinal = attempt.currentQuestionIndex === test.questions.length - 1
  const attemptedCount = test.questions.filter((item) => {
    if (attempt.submissions[item.id]) return true
    return Object.entries(attempt.drafts).some(([key, value]) => key.startsWith(`${item.id}::`)
      && value.trim() !== getStarterCode(item, key.split('::')[1]).trim())
  }).length
  return <section className="coding-workflow ct-workspace">
    <div className="ct-page-top"><PageBackButton onClick={onBack}>{backLabel}</PageBackButton></div>
    <header className="ct-workspace-test-header"><div className="ct-workspace-test-title"><span className={`ct-test-icon ${test.accent}`}><Code2 size={20} /></span><div><h1>{test.title}</h1><p>{test.description}</p></div><span className="ct-live-pill">IN PROGRESS</span></div>
      <div className="ct-workspace-stats">
        <article><ListChecks size={18} /><span><b>{attempt.questionCount}</b><small>Questions</small></span></article>
        <article><Activity size={18} /><span><b>{attempt.difficulty}</b><small>Difficulty</small></span></article>
        <article><Clock3 size={18} /><span><b>{attempt.minutesPerQuestion} min</b><small>per question</small></span></article>
        <article className="ct-total-time"><Clock3 size={18} /><span><b>{formatTime(attempt.totalSeconds)}</b><small>Total configured duration</small></span></article>
        <div className="ct-workspace-timer"><span><b>{formatTime(remaining)}</b><small>Time remaining</small></span></div>
      </div>
    </header>
    {attempt.requestedQuestionCount > attempt.questionCount && <p className="ct-count-warning ct-workspace-count-warning" role="status">This collection has {attempt.questionCount} published questions. The attempt includes all available questions.</p>}
    <div className="ct-attempt-progress" aria-label={`${attemptedCount} of ${attempt.questionCount} questions attempted`}><span style={{ width: `${(attemptedCount / attempt.questionCount) * 100}%` }} /></div>
    <QuestionSelector test={test} attempt={attempt} onSelectQuestion={onQuestionChange} />
    {!attempt.evaluationStorageAvailable && <p className="ct-count-warning" role="status">Saved evaluation history is unavailable until the coding execution migration has been applied.</p>}
    <div className="ct-workspace-grid">
      <ProblemPanel question={question} index={attempt.currentQuestionIndex} count={test.questions.length}
        onPrevious={onPrevious} onNext={onNext} onSkip={onNext} />
      <EditorPanel test={test} attempt={attempt} currentCode={code} onCodeChange={onCodeChange} onLanguageChange={onLanguageChange} onRun={onRun} onSubmit={onSubmit} runState={runState} noticeMessage={noticeMessage} onClearOutput={onClearOutput} isFinal={isFinal} disabled={attempt.status !== 'in-progress' || executionBusy} />
    </div>
    <p className="ct-demo-note"><Info size={14} />Secure execution supports function-based JavaScript, Python, and TypeScript questions when Judge0 is configured. Other languages remain save-only.</p>
  </section>
}

export default function CodingKnowledgeWorkflow() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [tests, setTests] = useState([])
  const [history, setHistory] = useState([])
  const [activeAttempts, setActiveAttempts] = useState([])
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [historyError, setHistoryError] = useState('')
  const [actionError, setActionError] = useState('')
  const [startingTestIds, setStartingTestIds] = useState([])
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [dialog, setDialog] = useState('')
  const [runState, setRunState] = useState(null)
  const [executionBusy, setExecutionBusy] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState('')
  const finalizingRef = useRef(false)
  const saveTimersRef = useRef(new Map())
  const loadRequestRef = useRef(0)
  const basePath = '/interview-prep/coding-knowledge'
  const returnTo = typeof location.state?.returnTo === 'string'
    && location.state.returnTo.startsWith('/')
    && !location.state.returnTo.startsWith('//')
    && !location.state.returnTo.startsWith(basePath)
    ? location.state.returnTo
    : null
  const routeState = useCallback((extra = {}) => {
    return {
      ...(location.state?.learningTask ? { learningTask: location.state.learningTask } : {}),
      ...(returnTo ? { returnTo } : {}),
      ...extra,
    }
  }, [location.state, returnTo])
  const navigateToLibrary = useCallback(() => {
    navigate(basePath, { state: routeState() })
  }, [basePath, navigate, routeState])
  const testMatch = location.pathname.match(/^\/interview-prep\/coding-knowledge\/test\/([^/]+)$/)
  const resultMatch = location.pathname.match(/^\/interview-prep\/coding-knowledge\/results\/([^/]+)$/)
  const activeTestId = testMatch ? decodeURIComponent(testMatch[1]) : null
  const resultAttemptId = resultMatch ? decodeURIComponent(resultMatch[1]) : null
  const isTestRoute = Boolean(testMatch)
  const isResultsRoute = Boolean(resultMatch)
  const requestedAttemptId = isTestRoute ? new URLSearchParams(location.search).get('attemptId') : resultAttemptId
  const attempt = bundle?.attempt || null
  const test = bundle?.test || null
  const resultAttempt = isResultsRoute && attempt?.id === resultAttemptId ? attempt : null
  const finalQuestion = test?.questions[attempt?.currentQuestionIndex]
  const finalQuestionCode = finalQuestion && attempt?.drafts[`${finalQuestion.id}::${attempt.language}`]
  const hasFinalSolution = Boolean(finalQuestionCode?.trim())
    && finalQuestionCode.trim() !== getStarterCode(finalQuestion, attempt.language).trim()

  const loadData = useCallback(async () => {
    if (!user?.id) return
    const requestId = ++loadRequestRef.current
    setLoading(true)
    setDataError('')
    setHistoryError('')
    try {
      const collections = await listCodingTests(user.id)
      if (requestId !== loadRequestRef.current) return
      setTests(collections)
      if (!isTestRoute && !isResultsRoute) {
        const [historyResult, activeAttemptsResult] = await Promise.allSettled([
          listCodingAttemptHistory(user.id),
          listActiveCodingAttempts(user.id, collections),
        ])
        if (requestId !== loadRequestRef.current) return
        const failures = [historyResult, activeAttemptsResult]
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason instanceof Error ? result.reason.message : 'Coding test history could not be loaded.')
        setHistory(historyResult.status === 'fulfilled' ? historyResult.value : [])
        setActiveAttempts(activeAttemptsResult.status === 'fulfilled' ? activeAttemptsResult.value : [])
        setBundle(null)
        setHistoryError([...new Set(failures)].join(' '))
        setRunState(null)
        setActionError('')
        return
      }
      if (!requestedAttemptId) throw new Error('No saved attempt was specified for this coding test route.')
      const attemptBundle = await loadCodingAttempt(user.id, requestedAttemptId, collections)
      if (isResultsRoute && attemptBundle?.attempt.status !== 'completed') {
        throw new Error('This coding test attempt is not complete or is unavailable.')
      }
      if (isTestRoute && attemptBundle && attemptBundle.test.id !== activeTestId) {
        throw new Error('The saved attempt does not match this coding test collection.')
      }
      if (requestId !== loadRequestRef.current) return
      setHistory([])
      setActiveAttempts([])
      setHistoryError('')
      setBundle(attemptBundle)
      setRunState(null)
      setActionError('')
    } catch (error) {
      if (requestId !== loadRequestRef.current) return
      setDataError(error instanceof Error ? error.message : 'Coding test data could not be loaded.')
      setBundle(null)
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false)
    }
  }, [activeTestId, isResultsRoute, isTestRoute, requestedAttemptId, user?.id])

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      loadRequestRef.current += 1
      return
    }
    loadData()
    return () => {
      loadRequestRef.current += 1
    }
  }, [authLoading, loadData, refreshVersion, user?.id])

  useEffect(() => () => {
    for (const pending of saveTimersRef.current.values()) window.clearTimeout(pending.timer)
  }, [])

  const attemptId = attempt?.id
  const attemptStatus = attempt?.status
  const deadlineAt = attempt?.deadlineAt
  useEffect(() => {
    if (!attemptId || attemptStatus !== 'in-progress' || !isTestRoute || !deadlineAt) return undefined
    const tick = () => {
      const secondsRemaining = Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000))
      setBundle((current) => current?.attempt.id === attemptId && current.attempt.remainingSeconds !== secondsRemaining
        ? { ...current, attempt: { ...current.attempt, remainingSeconds: secondsRemaining } }
        : current)
    }
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [attemptId, attemptStatus, deadlineAt, isTestRoute])

  async function flushPendingSaves() {
    const pending = [...saveTimersRef.current.entries()]
    for (const [key, draft] of pending) {
      window.clearTimeout(draft.timer)
      try {
        await saveCodingAnswer(draft.userId, draft.attemptId, draft.questionId, draft.language, draft.code)
      } finally {
        saveTimersRef.current.delete(key)
      }
    }
  }

  const finalizeAttempt = useCallback(async (reason, finalSubmission = null) => {
    if (!attempt || attempt.status !== 'in-progress' || finalizingRef.current) return
    finalizingRef.current = true
    const completedAt = Date.now()
    const remainingSeconds = Math.max(0, attempt.deadlineAt ? Math.ceil((attempt.deadlineAt - completedAt) / 1000) : attempt.remainingSeconds)
    const submissions = finalSubmission
      ? { ...attempt.submissions, [finalSubmission.questionId]: finalSubmission.submission }
      : attempt.submissions
    try {
      await flushPendingSaves()
      if (finalSubmission) {
        await saveCodingAnswer(user.id, attempt.id, finalSubmission.questionId, finalSubmission.submission.language, finalSubmission.submission.code, true)
      }
      await updateCodingAttempt(user.id, attempt.id, {
        status: 'completed',
        remaining_seconds: remainingSeconds,
        completed_at: new Date(completedAt).toISOString(),
      })
      const finalAttempt = { ...attempt, submissions, status: 'completed', completedAt, deadlineAt: null, remainingSeconds, completionReason: reason }
      setBundle({ test, attempt: finalAttempt })
      setDialog('')
      setActionError('')
      navigate(`${basePath}/results/${encodeURIComponent(attempt.id)}`, { state: routeState({ attemptId: attempt.id }) })
    } catch (error) {
      finalizingRef.current = false
      setActionError(error instanceof Error ? error.message : 'The coding test could not be completed. Retry.')
    }
  }, [attempt, basePath, navigate, routeState, test, user?.id])

  useEffect(() => {
    if (isTestRoute && attempt?.status === 'in-progress' && attempt.remainingSeconds <= 0) finalizeAttempt('Time expired')
  }, [attempt?.remainingSeconds, attempt?.status, finalizeAttempt, isTestRoute])

  async function createAttempt(testToStart, requestedQuestionCount = DEFAULT_QUESTION_COUNT, language = testToStart.languages[0]) {
    if (!user?.id || !Number.isInteger(requestedQuestionCount)
      || requestedQuestionCount < 1 || requestedQuestionCount > 50
      || !testToStart.languages.includes(language)) {
      setActionError('Choose a supported language and a question count between 1 and 50.')
      return
    }
    if (startingTestIds.includes(testToStart.id)) return
    setStartingTestIds((current) => [...current, testToStart.id])
    setActionError('')
    try {
      const created = await startCodingAttempt(user.id, testToStart.collectionId, requestedQuestionCount, language, tests)
      setBundle(created)
      setRunState(null)
      finalizingRef.current = false
      if (created.attempt.status === 'paused') {
        await resumeAttempt(created)
        return
      }
      const destination = created.attempt.status === 'completed' ? 'results' : 'test'
      navigate(`${basePath}/${destination}/${encodeURIComponent(testToStart.id)}?attemptId=${encodeURIComponent(created.attempt.id)}`, { state: routeState({ attemptId: created.attempt.id }) })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The coding test could not be started. Retry.')
    } finally {
      setStartingTestIds((current) => current.filter((testId) => testId !== testToStart.id))
    }
  }

  function requestStart(testToStart, requestedQuestionCount, language) {
    const existingAttempt = activeAttempts.find((item) => item.attempt.testId === testToStart.id && item.attempt.sessionDate === getUtcDateKey())
    if (existingAttempt) {
      void resumeAttempt(existingAttempt)
      return
    }
    void createAttempt(testToStart, requestedQuestionCount, language)
  }

  async function resumeAttempt(savedBundle = null) {
    const targetBundle = savedBundle || (attempt && test ? { attempt, test } : null)
    if (!targetBundle) return
    const targetAttempt = targetBundle.attempt
    if (targetAttempt.status === 'paused') {
      const deadlineAt = Date.now() + targetAttempt.remainingSeconds * 1000
      try {
        await updateCodingAttempt(user.id, targetAttempt.id, { status: 'in_progress', deadline_at: new Date(deadlineAt).toISOString() })
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'This attempt could not be resumed.')
        return
      }
    }
    navigate(`${basePath}/test/${encodeURIComponent(targetAttempt.testId)}?attemptId=${encodeURIComponent(targetAttempt.id)}`, { state: routeState({ attemptId: targetAttempt.id }) })
  }

  async function pauseAndReturn() {
    if (attempt?.status === 'in-progress' && user?.id) {
      const remainingSeconds = Math.max(0, Math.ceil((attempt.deadlineAt - Date.now()) / 1000))
      try {
        await flushPendingSaves()
        await updateCodingAttempt(user.id, attempt.id, { status: 'paused', deadline_at: null, remaining_seconds: remainingSeconds })
        setBundle({ test, attempt: { ...attempt, status: 'paused', deadlineAt: null, remainingSeconds } })
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Your attempt could not be paused.')
        return
      }
    }
    setDialog('')
    navigateToLibrary()
  }

  function handleTestBack() {
    if (!attempt || attempt.status !== 'in-progress') {
      navigate('/dashboard')
      return
    }
    setDialog('leave')
  }

  function selectQuestion(index) {
    if (!test || executionBusy || index < 0 || index >= test.questions.length || attempt?.status !== 'in-progress') return
    setBundle((current) => current ? { ...current, attempt: { ...current.attempt, currentQuestionIndex: index } } : current)
    setRunState(null)
    setNoticeMessage('')
  }

  function updateCode(code) {
    const questionId = test?.questions[attempt.currentQuestionIndex]?.id
    if (!questionId || attempt?.status !== 'in-progress' || !user?.id) return
    const key = `${questionId}::${attempt.language}`
    setBundle((current) => current ? { ...current, attempt: { ...current.attempt, drafts: { ...current.attempt.drafts, [key]: code } } } : current)
    setNoticeMessage('')
    const saveKey = `${attempt.id}::${key}`
    const existingPending = saveTimersRef.current.get(saveKey)
    if (existingPending) window.clearTimeout(existingPending.timer)
    const timer = window.setTimeout(async () => {
      try {
        await saveCodingAnswer(user.id, attempt.id, questionId, attempt.language, code)
        setActionError('')
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Your code draft could not be saved.')
      } finally {
        saveTimersRef.current.delete(saveKey)
      }
    }, 700)
    saveTimersRef.current.set(saveKey, { timer, userId: user.id, attemptId: attempt.id, questionId, language: attempt.language, code })
  }

  async function changeLanguage(language) {
    if (executionBusy || !test?.languages.includes(language) || attempt?.status !== 'in-progress' || !user?.id) return
    try {
      await updateCodingAttempt(user.id, attempt.id, { language })
      setBundle((current) => current ? { ...current, attempt: { ...current.attempt, language } } : current)
      setActionError('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The editor language could not be saved.')
    }
    setRunState(null)
    setNoticeMessage('')
  }

  async function runCode() {
    const questionId = test?.questions[attempt.currentQuestionIndex]?.id
    const code = attempt?.drafts[`${questionId}::${attempt?.language}`]
    if (!questionId || !attempt || !user?.id || !code?.trim()) return
    setExecutionBusy(true)
    setRunState({ loadingMode: 'run', mode: 'run', status: 'running', message: 'Running visible test cases…' })
    try {
      const result = await runCodingAttemptCode(user.id, {
        attemptId: attempt.id,
        questionId,
        language: attempt.language,
        code,
        mode: 'run',
      })
      setRunState({ ...result, mode: 'run' })
      setActionError('')
    } catch (error) {
      setRunState({ status: 'service_error', mode: 'run', message: error instanceof Error ? error.message : 'The execution service is unavailable.' })
    } finally {
      setExecutionBusy(false)
    }
  }

  async function submitQuestion() {
    const question = test?.questions[attempt.currentQuestionIndex]
    if (!question || attempt?.status !== 'in-progress' || !user?.id) return
    const key = `${question.id}::${attempt.language}`
    const code = attempt.drafts[key] ?? getStarterCode(question, attempt.language)
    const hasUserCode = Boolean(code.trim()) && code.trim() !== getStarterCode(question, attempt.language).trim()
    if (attempt.currentQuestionIndex === test.questions.length - 1) {
      setDialog('final-submit')
      return
    }
    if (!hasUserCode) {
      setNoticeMessage('Add solution code before submitting this question. The placeholder comment is not a solution.')
      return
    }
    setExecutionBusy(true)
    setRunState({ loadingMode: 'submit', mode: 'submit', status: 'running', message: 'Evaluating visible and hidden test cases…' })
    try {
      await flushPendingSaves()
      const evaluation = await runCodingAttemptCode(user.id, {
        attemptId: attempt.id,
        questionId: question.id,
        language: attempt.language,
        code,
        mode: 'submit',
      })
      const submittedAt = await saveCodingAnswer(user.id, attempt.id, question.id, attempt.language, code, true)
      const submission = { code, language: attempt.language, submittedAt: new Date(submittedAt).getTime(), status: evaluation.status, evaluation }
      setBundle((current) => current ? { ...current, attempt: { ...current.attempt, submissions: { ...current.attempt.submissions, [question.id]: submission } } } : current)
      setRunState({ ...evaluation, mode: 'submit' })
      setNoticeMessage(`${question.title}: ${evaluation.message} Score ${evaluation.score}/${evaluation.maxScore}.`)
      setActionError('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'This solution could not be submitted. Retry.')
      setRunState({ status: 'service_error', mode: 'submit', message: error instanceof Error ? error.message : 'Evaluation failed; this solution was not marked submitted.' })
    } finally {
      setExecutionBusy(false)
    }
  }

  async function confirmFinalSubmit() {
    const question = test?.questions[attempt.currentQuestionIndex]
    if (!question || !attempt || !user?.id) return
    const key = `${question.id}::${attempt.language}`
    const code = attempt.drafts[key] ?? getStarterCode(question, attempt.language)
    const hasUserCode = Boolean(code.trim()) && code.trim() !== getStarterCode(question, attempt.language).trim()
    setExecutionBusy(true)
    try {
      let submission = null
      if (hasUserCode) {
        const evaluation = await runCodingAttemptCode(user.id, {
          attemptId: attempt.id,
          questionId: question.id,
          language: attempt.language,
          code,
          mode: 'submit',
        })
        submission = {
          questionId: question.id,
          submission: {
            code,
            language: attempt.language,
            submittedAt: Date.now(),
            status: evaluation.status,
            evaluation,
          },
        }
        setRunState({ ...evaluation, mode: 'submit' })
      }
      await finalizeAttempt(hasUserCode ? 'Final test submitted' : 'Finalized with unanswered final question', submission)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Final evaluation failed; the attempt remains active.')
      setDialog('')
    } finally {
      setExecutionBusy(false)
    }
  }

  function clearOutput() {
    setRunState(null)
  }

  function goBackFromLibrary() {
    navigate('/dashboard')
  }

  function retakeTest() {
    if (test) void createAttempt(test, DEFAULT_QUESTION_COUNT, attempt?.language || test.languages[0])
  }

  function exploreTests() {
    finalizingRef.current = false
    navigateToLibrary()
  }

  if (authLoading) return <section className="coding-workflow ct-empty-state" role="status"><Clock3 size={24} /><b>Checking your account…</b></section>
  if (!user) return <section className="coding-workflow ct-empty-state"><Info size={24} /><b>Sign in to access coding tests.</b><span>Your saved attempts are available after authentication.</span></section>
  if (loading) return <section className="coding-workflow ct-empty-state" role="status"><Clock3 size={24} /><b>Loading your coding tests…</b></section>

  if (isResultsRoute) {
    if (dataError || !resultAttempt || !test) return <section className="coding-workflow ct-missing-attempt"><div className="ct-page-top"><PageBackButton onClick={navigateToLibrary}>Back</PageBackButton><Breadcrumb current="Test Results" test /></div><Info size={24} /><h1>Attempt details unavailable</h1><p role="alert">{dataError || 'This saved attempt could not be loaded.'}</p><button className="ct-button secondary" type="button" onClick={() => setRefreshVersion((value) => value + 1)}>Retry</button></section>
    return <><ResultsPage test={test} attempt={resultAttempt} onBack={navigateToLibrary} onRetake={retakeTest} onExplore={exploreTests} />{actionError && <p className="ct-count-warning" role="alert">{actionError}</p>}</>
  }

  if (isTestRoute) {
    if (dataError || !test || !attempt || attempt.testId !== test.id || attempt.status === 'completed') return <section className="coding-workflow ct-missing-attempt"><div className="ct-page-top"><PageBackButton onClick={navigateToLibrary}>Back</PageBackButton><Breadcrumb current="Coding Test" test /></div><Info size={24} /><h1>Test attempt unavailable</h1><p role="alert">{dataError || 'This saved attempt could not be loaded. Return to the catalogue and retry.'}</p><button className="ct-button secondary" type="button" onClick={() => setRefreshVersion((value) => value + 1)}>Retry</button></section>
    return <>
      <TestPage test={test} attempt={attempt} remaining={attempt.remainingSeconds} runState={runState} executionBusy={executionBusy} noticeMessage={noticeMessage} onBack={handleTestBack} onQuestionChange={selectQuestion} onLanguageChange={changeLanguage} onCodeChange={updateCode} onRun={runCode} onSubmit={submitQuestion}
        onNext={() => selectQuestion(Math.min(test.questions.length - 1, attempt.currentQuestionIndex + 1))}
        onPrevious={() => selectQuestion(Math.max(0, attempt.currentQuestionIndex - 1))}
        onClearOutput={clearOutput} />
      {actionError && <p className="ct-count-warning" role="alert">{actionError}</p>}
      {dialog === 'final-submit' && <CodingDialog title="Submit final test?" description={hasFinalSolution ? 'Your final solution will be evaluated against the configured test cases before the attempt is finalized.' : 'This question is unanswered. The attempt will be finalized without a submission for this question.'} confirmLabel={executionBusy ? 'Evaluating…' : 'Submit Final Test'} onCancel={() => setDialog('')} onConfirm={confirmFinalSubmit} disabled={executionBusy} />}
      {dialog === 'leave' && <CodingDialog title="Pause this coding test?" description="Your saved code and remaining time will be kept in your account so you can resume this attempt later." confirmLabel="Pause and leave" onCancel={() => setDialog('')} onConfirm={pauseAndReturn} />}
    </>
  }

  return <>
    <LibraryPage tests={tests} history={history} historyError={historyError} activeAttempts={activeAttempts} loading={loading} error={dataError} startingTestIds={startingTestIds} onRetry={() => setRefreshVersion((value) => value + 1)} onStart={requestStart} onResume={resumeAttempt} onBack={goBackFromLibrary} backLabel="Back" />
    {actionError && <p className="ct-count-warning" role="alert">{actionError}</p>}
  </>
}
