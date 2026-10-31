import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle, ArrowLeft, ArrowRight, BarChart3, Check, CheckCircle2, ChevronRight,
  CircleHelp, Clock3, Headphones, Lightbulb, Mic, MicOff, Pause, RotateCcw,
  ShieldCheck, SkipForward, Square, Volume2, X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMockInterviewQuestions } from '../services/mockInterviewQuestionService'

const DEFAULT_SETTINGS = {
  role: 'Frontend Developer',
  interviewType: 'Technical',
  difficulty: 'Intermediate',
  duration: '10 minutes',
  answerMode: 'Voice (Speak)',
  focusTopics: ['React', 'JavaScript', 'Problem Solving'],
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds)
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

function getQuestionTips(question) {
  if (question.topic === 'React' && question.prompt.toLowerCase().includes('state and props')) {
    return ['Explain both concepts clearly.', 'Compare their key differences.', 'Mention real-world use cases.', 'Give a practical example if possible.']
  }
  const topicHints = {
    React: ['Explain the React concept in your own words.', 'Describe when you would use it.', 'Connect your answer to component behavior.', 'Share a practical example.'],
    JavaScript: ['Explain the language behavior clearly.', 'Compare relevant alternatives.', 'Mention an everyday use case.', 'Share a concise code-level example.'],
    'HTML & CSS': ['Describe the browser behavior involved.', 'Consider responsive and accessible use.', 'Compare the relevant layout or markup choices.', 'Give an interface example.'],
    'Problem Solving': ['Clarify the inputs and constraints.', 'Explain your approach step by step.', 'Consider complexity and edge cases.', 'Walk through a small example.'],
    'System Design': ['Clarify requirements and scale.', 'Explain the main components.', 'Discuss trade-offs and failure cases.', 'Use a simple example request flow.'],
    Database: ['Define the database concept.', 'Explain its trade-offs.', 'Mention consistency or performance where relevant.', 'Use a practical data example.'],
    APIs: ['Describe the client-server interaction.', 'Mention status codes or contracts.', 'Consider reliability and security.', 'Give an integration example.'],
    'Computer Networks': ['Explain the communication layers involved.', 'Describe the request or data flow.', 'Mention reliability or security.', 'Use a familiar web example.'],
  }
  return topicHints[question.topic] || ['Explain the key idea clearly.', 'Compare relevant approaches.', 'Mention a practical use case.', 'Give a concise example.']
}

function InterviewRobot() {
  return <div className="mi-robot-scene" aria-hidden="true">
    <span className="mi-plant mi-plant-left" /><span className="mi-plant mi-plant-right" />
    <div className="mi-robot">
      <span className="mi-robot-ear left" /><span className="mi-robot-ear right" />
      <div className="mi-robot-head"><i /><i /><b /></div>
      <span className="mi-robot-neck" />
      <div className="mi-robot-body"><i /></div>
    </div>
  </div>
}

function ConfirmDialog({ title, children, confirmText, onConfirm, onCancel, danger = false }) {
  return <div className="mi-dialog-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onCancel()
  }}>
    <section className="mi-dialog" role="dialog" aria-modal="true" aria-labelledby="mi-dialog-title">
      <button className="mi-dialog-close" type="button" aria-label="Close dialog" onClick={onCancel}><X size={18} /></button>
      <span className={`mi-dialog-icon${danger ? ' danger' : ''}`}>{danger ? <AlertCircle size={21} /> : <CircleHelp size={21} />}</span>
      <h2 id="mi-dialog-title">{title}</h2>
      <p>{children}</p>
      <div className="mi-dialog-actions">
        <button type="button" className="mi-button secondary" onClick={onCancel}>{danger ? 'Continue Interview' : 'Stay here'}</button>
        <button type="button" className={`mi-button${danger ? ' end' : ' primary'}`} onClick={onConfirm}>{confirmText}</button>
      </div>
    </section>
  </div>
}

export default function MockInterviewLivePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...location.state?.settings }), [location.state?.settings])
  const returnTo = typeof location.state?.returnTo === 'string' ? location.state.returnTo : '/interview-prep'
  const [sessionId] = useState(() => location.state?.sessionId || Date.now())
  const questions = useMemo(() => getMockInterviewQuestions({ ...settings, sessionId }), [sessionId, settings])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [visitedQuestions, setVisitedQuestions] = useState(() => Array.from({ length: 10 }, (_, index) => index === 0))
  const [questionStates, setQuestionStates] = useState(() => Array(10).fill('upcoming'))
  const [captureStates, setCaptureStates] = useState(() => Array(10).fill('Not captured'))
  const [remainingByQuestion, setRemainingByQuestion] = useState(() => Array(10).fill(60))
  const [sessionStartedAt] = useState(() => Date.now())
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [cameraMessage, setCameraMessage] = useState('')
  const [sessionEnded, setSessionEnded] = useState(false)
  const [endReason, setEndReason] = useState('')
  const [dialog, setDialog] = useState('')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isRequestingMic, setIsRequestingMic] = useState(false)
  const [isRequestingCamera, setIsRequestingCamera] = useState(false)
  const sessionActiveRef = useRef(true)
  const questionIndexRef = useRef(questionIndex)
  const micRequestRef = useRef(false)
  const cameraRequestRef = useRef(false)
  const mediaStreamRef = useRef(null)
  const recorderRef = useRef(null)
  const recordingIndexRef = useRef(0)
  const recognitionRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const videoRef = useRef(null)
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const question = questions[questionIndex]
  const questionTips = getQuestionTips(question)
  const interviewerStatus = isRecording
    ? 'Listening...'
    : isRequestingMic
      ? 'Requesting microphone permission...'
    : errorMessage.toLowerCase().includes('microphone') && errorMessage.toLowerCase().includes('permission')
      ? 'Microphone permission required'
      : errorMessage.toLowerCase().includes('microphone') || errorMessage.toLowerCase().includes('cannot record')
        ? 'Microphone unavailable'
        : 'Ready for your answer'
  const elapsed = Math.min(600, Math.floor((now - sessionStartedAt) / 1000))
  const sessionRemaining = Math.max(0, 600 - elapsed)
  const questionRemaining = Math.max(0, remainingByQuestion[questionIndex] - Math.floor((now - questionStartedAt) / 1000))
  const completedCount = questionStates.filter((state) => state === 'completed').length
  const skippedCount = questionStates.filter((state) => state === 'skipped').length

  useEffect(() => {
    questionIndexRef.current = questionIndex
  }, [questionIndex])

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const stopRecording = useCallback((completeAnswer = false) => {
    const activeRecorder = recorderRef.current
    const stream = mediaStreamRef.current
    const recognition = recognitionRef.current
    const index = recordingIndexRef.current
    const wasActive = Boolean(activeRecorder && activeRecorder.state !== 'inactive' || stream || recognition)
    const captureAttempted = Boolean(activeRecorder || recognition)
    if (activeRecorder && activeRecorder.state !== 'inactive') activeRecorder.stop()
    if (recognition) {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.stop()
    }
    if (stream) stream.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
    recorderRef.current = null
    recognitionRef.current = null
    setIsRecording(false)
    setRecordingSeconds(0)
    if (completeAnswer && wasActive) {
      setQuestionStates((current) => current.map((state, itemIndex) => itemIndex === index ? 'completed' : state))
      if (captureAttempted) setCaptureStates((current) => current.map((state, itemIndex) => itemIndex === index && state === 'Not captured' ? 'Microphone capture attempted; not saved' : state))
    }
  }, [])

  const finishSession = useCallback((reason) => {
    if (sessionEnded || !sessionActiveRef.current) return
    sessionActiveRef.current = false
    stopRecording(true)
    stopSpeech()
    const camera = cameraStreamRef.current
    if (camera) camera.getTracks().forEach((track) => track.stop())
    cameraStreamRef.current = null
    setCameraStream(null)
    setIsCameraOn(false)
    setQuestionStates((current) => current.map((state) => state === 'upcoming' || state === 'in-progress' ? 'skipped' : state))
    setSessionEnded(true)
    setEndReason(reason)
    setDialog('')
  }, [sessionEnded, stopRecording, stopSpeech])

  const changeQuestion = useCallback((nextIndex, status) => {
    if (sessionEnded || nextIndex < 0 || nextIndex >= 10) return
    stopRecording(false)
    stopSpeech()
    setErrorMessage('')
    const remaining = Math.max(0, remainingByQuestion[questionIndex] - Math.floor((Date.now() - questionStartedAt) / 1000))
    setRemainingByQuestion((current) => current.map((value, index) => index === questionIndex ? remaining : value))
    const finalStatus = status || (nextIndex < questionIndex && isRecording ? 'completed' : undefined)
    if (finalStatus) setQuestionStates((current) => current.map((value, index) => index === questionIndex && value !== 'completed' ? finalStatus : value))
    setVisitedQuestions((current) => current.map((visited, index) => index === nextIndex ? true : visited))
    questionIndexRef.current = nextIndex
    setQuestionIndex(nextIndex)
    setQuestionStartedAt(Date.now())
    setNow(Date.now())
  }, [isRecording, questionIndex, questionStartedAt, remainingByQuestion, sessionEnded, stopRecording, stopSpeech])

  const advanceQuestion = useCallback((timedOut = false) => {
    if (questionIndex >= 9) {
      setQuestionStates((current) => current.map((state, index) => index === questionIndex && state === 'upcoming' ? 'skipped' : state))
      finishSession(timedOut ? 'Question 10 time limit reached' : 'Question sequence complete')
      return
    }
    const isAnswered = questionStates[questionIndex] === 'completed' || isRecording
    changeQuestion(questionIndex + 1, isAnswered ? 'completed' : 'skipped')
  }, [changeQuestion, finishSession, isRecording, questionIndex, questionStates])

  useEffect(() => {
    if (sessionEnded) return undefined
    const timer = window.setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      const totalLeft = 600 - Math.floor((tick - sessionStartedAt) / 1000)
      const questionLeft = remainingByQuestion[questionIndex] - Math.floor((tick - questionStartedAt) / 1000)
      if (totalLeft <= 0) finishSession('Time limit reached')
      else if (questionLeft <= 0) advanceQuestion(true)
    }, 250)
    return () => window.clearInterval(timer)
  }, [advanceQuestion, finishSession, questionIndex, questionStartedAt, remainingByQuestion, sessionEnded, sessionStartedAt])

  useEffect(() => {
    if (!isRecording) return undefined
    const timer = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000)
    return () => window.clearInterval(timer)
  }, [isRecording])

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = cameraStream
  }, [cameraStream])

  useEffect(() => {
    sessionActiveRef.current = true
    return () => {
      sessionActiveRef.current = false
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
      if (recognitionRef.current) recognitionRef.current.stop()
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  async function startRecording() {
    if (micRequestRef.current || isRecording) return
    setErrorMessage('')
    const requestedIndex = questionIndex
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Microphone access is unavailable in this browser or page context. Try a supported browser over HTTPS or localhost.')
      return
    }
    if (typeof window.MediaRecorder !== 'function' && !Recognition) {
      setErrorMessage('This browser cannot record or transcribe speech. Try a supported desktop or mobile browser.')
      return
    }
    micRequestRef.current = true
    setIsRequestingMic(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!sessionActiveRef.current || questionIndexRef.current !== requestedIndex) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      mediaStreamRef.current = stream
      recordingIndexRef.current = questionIndex
      const captureIndex = questionIndex
      if (typeof window.MediaRecorder === 'function') {
        const recorder = new window.MediaRecorder(stream)
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setCaptureStates((current) => current.map((state, index) => index === captureIndex ? 'Audio captured in this session; not saved' : state))
          }
        }
        recorderRef.current = recorder
        recorder.start()
      }
      if (Recognition) {
        const recognition = new Recognition()
        recognition.lang = navigator.language || 'en-US'
        recognition.continuous = true
        recognition.interimResults = false
        recognition.onresult = (event) => {
          const detectedSpeech = Array.from(event.results).slice(event.resultIndex).some((result) => Boolean(result[0]?.transcript?.trim()))
          if (detectedSpeech) {
            setCaptureStates((current) => current.map((state, index) => index === captureIndex ? 'Speech detected by browser; transcript not saved' : state))
          }
        }
        recognition.onerror = () => setErrorMessage('Speech transcription is unavailable. Audio is not sent to a server.')
        recognitionRef.current = recognition
        recognition.start()
      }
      setQuestionStates((current) => current.map((state, index) => index === questionIndex && state === 'upcoming' ? 'in-progress' : state))
      setIsRecording(true)
    } catch (error) {
      const activeRecorder = recorderRef.current
      if (activeRecorder && activeRecorder.state !== 'inactive') activeRecorder.stop()
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      if (recognitionRef.current) recognitionRef.current.stop()
      mediaStreamRef.current = null
      recorderRef.current = null
      recognitionRef.current = null
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        setErrorMessage('Microphone permission was denied. Allow microphone access in your browser settings to answer by voice.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMessage('No microphone was found. Connect or enable a microphone to answer by voice.')
      } else {
        setErrorMessage(`Microphone could not be started: ${error.message || 'browser media access failed.'}`)
      }
    } finally {
      micRequestRef.current = false
      if (sessionActiveRef.current) setIsRequestingMic(false)
    }
  }

  function replayQuestion() {
    if (!speechSupported) {
      setErrorMessage('Spoken question playback is not supported in this browser. Read the sample question on screen.')
      return
    }
    stopSpeech()
    const utterance = new SpeechSynthesisUtterance(question.prompt)
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  async function toggleCamera() {
    if (cameraRequestRef.current) return
    setCameraMessage('')
    if (isCameraOn) {
      if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
      setCameraStream(null)
      setIsCameraOn(false)
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage('Camera access is unavailable here. You can continue with the microphone.')
      return
    }
    cameraRequestRef.current = true
    setIsRequestingCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (!sessionActiveRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      cameraStreamRef.current = stream
      setCameraStream(stream)
      setIsCameraOn(true)
    } catch (error) {
      setCameraMessage(error.name === 'NotAllowedError' || error.name === 'SecurityError'
        ? 'Camera permission was denied. Your microphone-only interview can continue.'
        : 'Camera unavailable. Your microphone-only interview can continue.')
    } finally {
      cameraRequestRef.current = false
      if (sessionActiveRef.current) setIsRequestingCamera(false)
    }
  }

  function finishFromNext() {
    if (questionIndex === 9) {
      if (isRecording) stopRecording(true)
      else if (questionStates[questionIndex] !== 'completed') {
        setQuestionStates((current) => current.map((state, index) => index === questionIndex ? 'skipped' : state))
      }
      finishSession('All questions completed or skipped')
      return
    }
    advanceQuestion()
  }

  function skipCurrentQuestion() {
    stopRecording(false)
    if (questionIndex === 9) {
      setQuestionStates((current) => current.map((state, index) => index === questionIndex && state !== 'completed' ? 'skipped' : state))
      finishSession('All questions completed or skipped')
      return
    }
    changeQuestion(questionIndex + 1, 'skipped')
  }

  function confirmEdit() {
    sessionActiveRef.current = false
    stopRecording(false)
    stopSpeech()
    navigate('/interview-prep/mock-interview', { state: { settings, returnTo } })
  }

  function confirmEnd() {
    finishSession('Ended by user')
  }

  if (questions.length !== 10) {
    return <section className="mock-interview-page"><div className="mi-error-card" role="alert">The sample question set could not provide exactly 10 questions for this setup. Return to setup and select one or more supported focus topics.</div><button className="mi-button secondary" type="button" onClick={() => navigate('/dashboard')}><ArrowLeft size={16} /> Back</button></section>
  }

  if (sessionEnded) {
    const topicsCovered = [...new Set(questions.filter((_, index) => visitedQuestions[index]).map((item) => item.topic))]
    return <section className="mock-interview-page">
      <header className="mi-page-heading"><button className="mi-back-link" type="button" onClick={() => navigate('/dashboard')}><ArrowLeft size={14} />Back</button><nav className="mi-breadcrumb" aria-label="Breadcrumb"><button onClick={() => navigate('/interview-prep')} type="button">Interview Prep</button><ChevronRight size={14} /><span>AI Mock Interview</span><ChevronRight size={14} /><span>Session Summary</span></nav></header>
      <div className="mi-summary-screen">
        <span className="mi-summary-badge"><CheckCircle2 size={15} /> DEMO SESSION COMPLETE</span>
        <h1>Interview <span>Complete</span></h1>
        <p>Your practice session has ended. This demo does not score answers or save interview history.</p>
        <div className="mi-summary-stats">
          <article><CheckCircle2 /><b>{completedCount}</b><span>Completed questions</span></article>
          <article><SkipForward /><b>{skippedCount}</b><span>Skipped questions</span></article>
          <article><Clock3 /><b>{formatTime(elapsed)}</b><span>Session duration</span></article>
        </div>
        <section className="mi-summary-detail">
          <h2>Session details</h2>
          <p><b>Topics covered</b><span>{topicsCovered.join(', ')}</span></p>
          <p><b>Answer capture</b><span>{captureStates.some((state) => state.startsWith('Audio captured')) ? 'Audio was captured in memory and discarded; no recordings were saved.' : captureStates.some((state) => state.startsWith('Speech detected')) ? 'Speech was detected by browser recognition; transcript was not saved.' : captureStates.some((state) => state.startsWith('Microphone')) ? 'Microphone capture was attempted; no recording was retained.' : 'No audio recording was retained.'}</span></p>
          <p><b>Completion</b><span>{endReason}</span></p>
          <div role="note"><ShieldCheck size={18} /> Audio is not uploaded or stored. Transcription, AI evaluation, and permanent session history are not connected.</div>
        </section>
        <div className="mi-summary-actions">
          <button className="mi-button primary" type="button" onClick={() => navigate('/interview-prep/mock-interview/live', { state: { settings, sessionId: Date.now() + Math.random(), returnTo } })}><RotateCcw size={16} />Start Another Interview</button>
        </div>
      </div>
    </section>
  }

  return <section className="mock-interview-page">
    <header className="mi-page-heading">
      <button className="mi-back-link" type="button" onClick={() => navigate('/dashboard')}><ArrowLeft size={14} />Back</button>
      <nav className="mi-breadcrumb" aria-label="Breadcrumb"><button onClick={() => navigate('/interview-prep')} type="button">Interview Prep</button><ChevronRight size={14} /><button onClick={() => setDialog('edit')} type="button">AI Mock Interview</button><ChevronRight size={14} /><span>Live Interview</span></nav>
      <div className="mi-heading-row"><div><h1>Your Mock <span>Interview</span></h1><p>Answer each question using your microphone and complete your interview in 10 minutes.</p></div><span className="mi-demo-banner"><AlertCircle size={15} />DEMO SESSION — SAMPLE QUESTIONS</span></div>
    </header>

    <div className="mi-live-grid">
      <section className="mi-video-card" aria-label="AI interviewer and recording controls">
        <div className="mi-video-status"><span className={`mi-status-dot${isRecording ? ' live' : ''}`} /><span><b>AI Interviewer</b><small>{interviewerStatus}</small></span><span className="mi-sample-label">SAMPLE</span></div>
        <div className="mi-session-elapsed"><Clock3 size={17} /><span><b>{formatTime(elapsed)}</b><small>Elapsed time</small></span></div>
        <div className={`mi-interviewer-art${isCameraOn ? ' camera-on' : ''}`}>
          {isCameraOn ? <video ref={videoRef} autoPlay muted playsInline aria-label="Local camera preview; video is not recorded or uploaded" /> : <InterviewRobot />}
          <span className="mi-demo-art-note">{isCameraOn ? 'Local preview only' : 'Demo session · no AI connection'}</span>
        </div>
        <div className="mi-media-controls">
          <button type="button" className={`mi-media-control camera${isCameraOn ? ' active' : ''}`} onClick={toggleCamera} disabled={isRequestingCamera} aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}><span><Square size={17} /></span><small>{isRequestingCamera ? 'Opening…' : isCameraOn ? 'Camera On' : 'Camera'}</small></button>
          <button type="button" className={`mi-media-control microphone${isRecording ? ' active' : ''}`} onClick={isRecording ? () => stopRecording(true) : startRecording} disabled={sessionRemaining <= 0 || isRequestingMic} aria-label={isRecording ? 'Finish and stop microphone answer' : 'Start microphone answer'}>
            <span>{isRecording ? <MicOff size={21} /> : <Mic size={22} />}</span><small>{isRecording ? `Finish · ${formatTime(recordingSeconds)}` : 'Mic On'}</small>
          </button>
          <button type="button" className="mi-media-control end" onClick={() => setDialog('end')} aria-label="End interview"><span><X size={19} /></span><small>End Interview</small></button>
        </div>
        {(errorMessage || cameraMessage) && <p className="mi-media-message" role={errorMessage ? 'alert' : 'status'}>{errorMessage || cameraMessage}</p>}
      </section>

      <div className="mi-question-column">
        <section className="mi-question-card">
          <div className="mi-question-meta"><div><b>Question {questionIndex + 1} of 10</b><span className="mi-sample-label">SAMPLE</span></div>
            <div className={`mi-question-clock${questionRemaining <= 10 ? ' urgent' : ''}`} role="timer" aria-label={`${formatTime(questionRemaining)} remaining for this question`}><Clock3 size={20} /><span><b>{formatTime(questionRemaining)}</b><small>Time remaining</small></span></div>
          </div>
          <div className="mi-timer-track" role="progressbar" aria-label="Question time remaining" aria-valuemin={0} aria-valuemax={60} aria-valuenow={questionRemaining}><span style={{ width: `${(questionRemaining / 60) * 100}%` }} /></div>
          <div className="mi-tags"><span>{question.topic}</span><span>{question.interviewType}</span><span>{question.difficulty}</span></div>
          <h2 aria-live="polite">{question.prompt}</h2>
          <p className="mi-instruction">Take your time and explain your answer clearly.</p>
          <button className={`mi-replay-button${isSpeaking ? ' speaking' : ''}`} type="button" onClick={isSpeaking ? stopSpeech : replayQuestion} disabled={!speechSupported}>
            {isSpeaking ? <Pause size={16} /> : <Volume2 size={16} />}{isSpeaking ? 'Stop question playback' : 'Read question aloud'}
          </button>
          <div className="mi-tips-card">
            <h3><Lightbulb size={18} />Tips for a Great Answer <span>GUIDANCE</span></h3>
            <ul>{questionTips.map((tip) => <li key={tip}><CheckCircle2 />{tip}</li>)}</ul>
          </div>
        </section>
        <section className="mi-progress-card">
          <header><h2><BarChart3 size={19} />Question Progress</h2><span>{completedCount} complete · {skippedCount} skipped</span></header>
          <div className="mi-progress-indicators" aria-label={`Question ${questionIndex + 1} of 10`}>
            {questionStates.map((state, index) => <span key={questions[index].id} className={`mi-progress-step ${state}${questionIndex === index ? ' current' : ''}`} aria-label={`Question ${index + 1}: ${questionIndex === index ? 'current' : state}`} aria-current={questionIndex === index ? 'step' : undefined}>{state === 'completed' ? <Check size={14} /> : index + 1}</span>)}
          </div>
          <div className="mi-progress-label">Question {questionIndex + 1} of 10</div>
          <div className="mi-navigation-actions">
            <button type="button" className="mi-button secondary" disabled={questionIndex === 0} onClick={() => changeQuestion(questionIndex - 1)}><ArrowLeft size={16} />Previous Question</button>
            <button type="button" className="mi-button skip" onClick={skipCurrentQuestion}><SkipForward size={15} />Skip</button>
            <button type="button" className="mi-button primary" onClick={finishFromNext}>{questionIndex === 9 ? 'Finish Interview' : 'Next Question'}<ArrowRight size={16} /></button>
          </div>
        </section>
      </div>

      <section className="mi-overview-card">
        <header><h2><Headphones size={19} />Session Overview</h2><button type="button" onClick={() => setDialog('edit')}><ArrowLeft size={14} />Edit setup</button></header>
        <dl><div><dt>Target Role</dt><dd>{settings.role}</dd></div><div><dt>Interview Type</dt><dd>{settings.interviewType}</dd></div><div><dt>Difficulty</dt><dd>{settings.difficulty}</dd></div><div><dt>Duration</dt><dd>10 minutes</dd></div><div><dt>Answer Mode</dt><dd>Voice (Speak)</dd></div><div className="mi-overview-topics"><dt>Focus Topics</dt><dd>{(settings.focusTopics.length ? settings.focusTopics : DEFAULT_SETTINGS.focusTopics).map((topic) => <span key={topic}>{topic}</span>)}</dd></div></dl>
        <p><ShieldCheck size={15} />Demo only. Nothing is saved to your account.</p>
      </section>
      <section className="mi-session-clock-card"><span><Clock3 size={19} />Total session time</span><b className={sessionRemaining <= 60 ? 'urgent' : ''}>{formatTime(sessionRemaining)}</b><small>10-minute maximum · question limit takes priority</small></section>
    </div>

    {dialog === 'end' && <ConfirmDialog title="End this interview?" confirmText="End Interview" danger onCancel={() => setDialog('')} onConfirm={confirmEnd}>Your interview will finish now. Unanswered questions will be marked as skipped.</ConfirmDialog>}
    {dialog === 'edit' && <ConfirmDialog title="Return to setup?" confirmText="Leave interview" onCancel={() => setDialog('')} onConfirm={confirmEdit}>This active session will be abandoned. Your timer and temporary answer capture will end, and the setup page will not start a new interview automatically.</ConfirmDialog>}
  </section>
}
