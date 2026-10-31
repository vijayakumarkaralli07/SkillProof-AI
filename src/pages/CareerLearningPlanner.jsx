import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  FolderKanban,
  Lightbulb,
  Play,
  Sparkles,
  Target,
  Video,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadCareerLearningSession, normalizeCareerLearningProgress, saveCareerLearningSession } from '../services/careerLearningSessionService.js'
import { getCareerCurriculum, getCareerWeekGroups, getWeekTasks } from '../services/careerLearningPlannerService.js'
import { saveLearningProgress } from '../services/userDataService.js'
import CareerLessonWorkspace from './CareerLessonWorkspace.jsx'
import '../styles/career-learning-planner.css'

function formatDuration(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return remainder ? `${hours} hr ${remainder} min` : `${hours} hour`
  }
  return `${minutes} min`
}

function formatDate(week, dayIndex) {
  const date = new Date()
  const mondayOffset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - mondayOffset + (week - 1) * 7 + dayIndex)
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function CareerLearningPlanner({ careerDiscovery = {}, progress, userId, week: initialWeek = 1, taskId = null, lessonMode = false, initialTab = 'Video Lesson' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [progressError, setProgressError] = useState('')
  const [progressMessage, setProgressMessage] = useState('')
  const [completionMessage, setCompletionMessage] = useState('')
  const [learningProgressOverride, setLearningProgressOverride] = useState(null)
  const learningProgress = normalizeCareerLearningProgress(learningProgressOverride || progress || loadCareerLearningSession(userId).data, initialWeek)
  const [week, setWeek] = useState(Math.max(1, Math.min(12, initialWeek)))

  const tasks = getWeekTasks(week, careerDiscovery)
  const selectedTask = tasks.find((task) => task.id === taskId)
  const completedIds = learningProgress.completedTaskIds
  const startedIds = learningProgress.startedTaskIds
  const completedTasks = tasks.filter((task) => completedIds.includes(task.id))
  const totalCompleted = completedTasks.length
  const percent = tasks.length ? Math.round((totalCompleted / tasks.length) * 100) : 0
  const lessonsDone = completedTasks.filter((task) => task.type === 'lesson').length
  const practiceDone = completedTasks.filter((task) => task.type === 'practice').length
  const projectsDone = completedTasks.filter((task) => task.type === 'project').length
  const careerWeekGroups = getCareerWeekGroups(careerDiscovery)
  const activeGroupIndex = careerWeekGroups.findIndex(({ start, end }) => week >= start && week <= end)
  const group = careerWeekGroups[activeGroupIndex]
  const topic = getCareerCurriculum(careerDiscovery)[activeGroupIndex]?.[0] || 'Career foundations'
  const studyTimeSummary = careerDiscovery.studyTime ? ` Planned around ${careerDiscovery.studyTime} daily study time.` : ''
  const goalSummary = careerDiscovery.goal ? ` Supports your goal to ${careerDiscovery.goal.toLowerCase()}.` : ''
  const weekGoal = week === 1
    ? `Complete 3 lessons and 2 practice sets this week.${goalSummary}${studyTimeSummary}`
    : `Complete 3 lessons and 2 practice sets for ${topic} this week.${goalSummary}${studyTimeSummary}`

  async function persist(nextProgress) {
    const planId = careerDiscovery.learningPlanId || nextProgress.learningPlanId || ''
    const normalized = normalizeCareerLearningProgress({ ...nextProgress, learningPlanId: planId }, week)
    setLearningProgressOverride(normalized)
    const sessionError = saveCareerLearningSession(userId, normalized)
    setProgressError(sessionError)
    if (!userId || !planId) {
      setProgressMessage('Progress is stored only in this browser session because no saved learning plan is linked.')
      return { databaseSaved: false, sessionError }
    }

    setProgressMessage('Saving learning progress to your account…')
    try {
      await saveLearningProgress(userId, planId, normalized)
      setProgressError('')
      setProgressMessage('Learning progress synced to your account.')
      return { databaseSaved: true, sessionError: '' }
    } catch (error) {
      setProgressError(`Database sync failed: ${error.message}`)
      setProgressMessage('Progress remains available only in this browser session.')
      return { databaseSaved: false, sessionError: error.message }
    }
  }

  function getLearningRouteState(nextProgress, task) {
    return {
      careerDiscovery,
      learningProgress: nextProgress,
      learningTask: task ? {
        taskId: task.id,
        week,
        phaseId: 'phase-1',
        title: task.title,
        description: task.description,
        minutes: task.minutes,
        type: task.type,
      } : null,
      curriculum: { week, phaseId: 'phase-1', groupTitle: group.detail, topic },
    }
  }

  async function updateWeek(nextWeek) {
    const safeWeek = Math.max(1, Math.min(12, nextWeek))
    setWeek(safeWeek)
    const nextProgress = { ...learningProgress, currentWeek: safeWeek }
    await persist(nextProgress)
    navigate(`/interview-prep/build-career?learningPlan=planner&week=${safeWeek}`, {
      replace: true,
      state: { careerDiscovery, learningProgress: nextProgress },
    })
  }

  async function openTask(task) {
    setCompletionMessage('')
    const nextProgress = {
      ...learningProgress,
      currentWeek: week,
      startedTaskIds: learningProgress.startedTaskIds.includes(task.id)
        ? learningProgress.startedTaskIds
        : [...learningProgress.startedTaskIds, task.id],
    }
    await persist(nextProgress)
    const learningPlanView = task.type === 'lesson' ? 'lesson' : 'planner'
    const tabQuery = task.type === 'lesson' ? '&tab=Video%20Lesson' : ''
    navigate(`/interview-prep/build-career?learningPlan=${learningPlanView}&week=${week}&task=${encodeURIComponent(task.id)}${tabQuery}`, {
      state: getLearningRouteState(nextProgress, task),
    })
  }

  function selectLessonTab(tab) {
    navigate(`/interview-prep/build-career?learningPlan=lesson&week=${week}&task=${encodeURIComponent(taskId)}&tab=${encodeURIComponent(tab)}`, {
      replace: true,
      state: getLearningRouteState(learningProgress, selectedTask),
    })
  }

  async function openPractice(task) {
    const nextProgress = {
      ...learningProgress,
      currentWeek: week,
      startedTaskIds: learningProgress.startedTaskIds.includes(task.id)
        ? learningProgress.startedTaskIds
        : [...learningProgress.startedTaskIds, task.id],
    }
    await persist(nextProgress)
    navigate('/interview-prep/coding-knowledge', {
      state: {
        learningTask: { taskId: task.id, week, phaseId: 'phase-1', title: task.title },
        returnTo: `${location.pathname}?learningPlan=planner&week=${week}`,
      },
    })
  }

  async function markComplete(task, stayInLesson = false) {
    const alreadyComplete = learningProgress.completedTaskIds.includes(task.id)
    const nextProgress = normalizeCareerLearningProgress({
      ...learningProgress,
      currentWeek: week,
      completedTaskIds: [...learningProgress.completedTaskIds, task.id],
    }, week)
    const persistence = await persist(nextProgress)
    setCompletionMessage(alreadyComplete
      ? persistence.databaseSaved ? 'This lesson is already complete. Progress is synced to your account.' : 'This lesson is already complete. Progress is available only in this browser session.'
      : persistence.databaseSaved ? 'Lesson marked complete and synced to your account.' : 'Lesson marked complete for this browser session only.')
    navigate(stayInLesson
      ? `/interview-prep/build-career?learningPlan=lesson&week=${week}&task=${encodeURIComponent(task.id)}&tab=${encodeURIComponent(safeInitialTab)}`
      : `/interview-prep/build-career?learningPlan=planner&week=${week}`, {
      replace: true,
      state: getLearningRouteState(nextProgress, task),
    })
  }

  function backToRoadmap() {
    navigate('/dashboard')
  }

  const selectedGroupIndex = careerWeekGroups.findIndex(({ start, end }) => week >= start && week <= end)
  const lessonTabs = ['Video Lesson', 'Lesson Notes', 'Key Takeaways', 'Resources']
  const safeInitialTab = lessonTabs.includes(initialTab) ? initialTab : 'Video Lesson'

  function selectWorkspaceTask(task, action) {
    if (action === 'practice') {
      openPractice(task)
      return
    }
    openTask(task)
  }

  if (lessonMode && selectedTask?.type === 'lesson') {
    return <CareerLessonWorkspace
      week={week}
      groupTitle={group.detail}
      tasks={tasks}
      selectedTask={selectedTask}
      completedIds={completedIds}
      careerDiscovery={careerDiscovery}
      activeTab={safeInitialTab}
      progressError={progressError}
      progressMessage={progressMessage}
      completionMessage={completionMessage}
      onTabChange={selectLessonTab}
      onBack={() => navigate('/dashboard')}
      onSelectTask={selectWorkspaceTask}
      onComplete={(task) => markComplete(task, true)}
    />
  }

  return <section className="career-learning-planner" aria-labelledby="clp-title">
    <header className="clp-header">
      <div className="clp-heading">
        <button type="button" className="clp-back-roadmap clp-back-top" onClick={backToRoadmap}><ArrowLeft size={12} />Back</button>
        <div className="clp-eyebrow">BUILD YOUR CAREER</div>
        <h1 id="clp-title">{selectedTask ? selectedTask.title : 'Weekly Learning Planner'}</h1>
        <p>{selectedTask
          ? `Week ${week} · ${group.detail} · ${careerDiscovery.confirmedPath || careerDiscovery.selectedRole || 'Web Development'}`
          : `Structured tasks for Week ${week} to help you keep on track.`}</p>
      </div>
      <div className="clp-week-navigation" aria-label="Week navigation">
        <button type="button" aria-label="Previous week" disabled={week === 1} onClick={() => updateWeek(week - 1)}><ChevronLeft size={15} /></button>
        <span className="clp-week-indicator"><b>Week {week} of 12</b><span>{Array.from({ length: 12 }, (_, index) => <i key={index} className={index + 1 === week ? 'active' : index + 1 < week ? 'passed' : ''} />)}</span></span>
        <button type="button" aria-label="Next week" disabled={week === 12} onClick={() => updateWeek(week + 1)}><ChevronRight size={15} /></button>
      </div>
    </header>

    {selectedTask ? <div className="clp-task-detail">
      <button type="button" className="clp-back-link" onClick={() => navigate(`/interview-prep/build-career?learningPlan=planner&week=${week}`, {
        state: { careerDiscovery, learningProgress },
      })}><ArrowLeft size={13} /> Back to Week {week}</button>
      <article className="clp-detail-card">
        <span className={`clp-task-type-icon ${selectedTask.type}`}><BookOpen size={19} /></span>
        <div>
          <span className="clp-sample-tag">{selectedTask.type === 'project'
            ? 'SAMPLE PROJECT PREVIEW · PROJECT WORKFLOW NOT CONNECTED'
            : 'SAMPLE LESSON PREVIEW · COURSE CONTENT NOT CONNECTED'}</span>
          <h2>{selectedTask.title}</h2>
          <p>{selectedTask.description} {selectedTask.type === 'project'
            ? 'This project brief is an illustrative sample; no separate project workflow is connected yet.'
            : 'This lesson preview is illustrative; no external video or lesson content is connected yet.'}</p>
          <div className="clp-detail-note"><Lightbulb size={14} />{selectedTask.type === 'project'
            ? 'Plan the page content, build the layout, and review the result before marking this sample task complete.'
            : 'Focus on one concept, make notes, and check your understanding before continuing.'}</div>
          <button type="button" className="clp-primary-button" disabled={completedIds.includes(selectedTask.id)} onClick={() => markComplete(selectedTask)}>
            {completedIds.includes(selectedTask.id)
              ? `${selectedTask.type === 'project' ? 'Project' : 'Lesson'} Complete`
              : `Mark ${selectedTask.type === 'project' ? 'Project' : 'Lesson'} Complete`}
            <Check size={13} />
          </button>
        </div>
      </article>
    </div> : <>
      <nav className="clp-week-tabs" aria-label="Learning plan weeks">
        {careerWeekGroups.map((weekGroup, index) => <button
          type="button"
          key={weekGroup.label}
          className={index === selectedGroupIndex ? 'active' : ''}
          aria-pressed={index === selectedGroupIndex}
          onClick={() => updateWeek(weekGroup.start)}
        ><b>{weekGroup.label}</b><small>{weekGroup.detail}</small></button>)}
      </nav>

      {week !== 1 && <p className="clp-sample-curriculum">Sample curriculum preview · replace with configured course data when available.</p>}

      <div className="clp-goal-card">
        <span className="clp-goal-icon"><Target size={17} /></span>
        <div className="clp-goal-copy"><b>Week {week} Goal</b><small>{weekGoal}</small></div>
        <div className="clp-goal-progress"><span><i style={{ width: `${percent}%` }} /></span><small>{totalCompleted}/{tasks.length} completed</small></div>
        <b className="clp-goal-percent">{percent}%</b>
      </div>

      {progressError && <p className="clp-progress-error" role="alert">{progressError}</p>}
      {progressMessage && <p className="clp-progress-message" role="status">{progressMessage}</p>}

      <div className="clp-content-grid">
        <section className="clp-task-panel">
          <header className="clp-panel-heading"><h2>This Week’s Learning Tasks</h2><p>Choose a task to start. Completion is recorded in this browser session.</p></header>
          <div className="clp-task-list">
            {tasks.map((task) => {
              const isComplete = completedIds.includes(task.id)
              const startedPractice = task.type === 'practice' && startedIds.includes(task.id) && !isComplete
              const dayIndex = Number.isInteger(task.index) ? task.index : 0
              return <article className={`clp-task-row${isComplete ? ' complete' : ''}`} key={task.id}>
                <div className="clp-task-date"><b>{task.day}</b><small>{formatDate(week, dayIndex)}</small></div>
                <span className={`clp-checkbox${isComplete ? ' checked' : ''}`} aria-label={isComplete ? 'Completed' : 'Not completed'}>{isComplete && <Check size={10} />}</span>
                <div className="clp-task-copy"><b>{task.title}</b><small>{task.description}</small></div>
                <span className="clp-task-duration"><Clock3 size={10} />{formatDuration(task.minutes)}</span>
                <div className="clp-task-actions">
                  {task.type === 'lesson' && <>
                    <button type="button" className="clp-video-button" onClick={() => openTask(task)}><Video size={10} />Video</button>
                    <button type="button" className="clp-practice-button" onClick={() => openPractice(task)}>Practice</button>
                  </>}
                  {task.type === 'practice' && <button type="button" className="clp-practice-button" onClick={() => openPractice(task)}>{startedPractice ? 'Resume Practice' : 'Start Practice'}</button>}
                  {task.type === 'project' && <button type="button" className="clp-project-button" onClick={() => openTask(task)}>Start Project</button>}
                  {startedPractice && <button type="button" className="clp-complete-button" onClick={() => markComplete(task)}>Mark Complete</button>}
                  {isComplete && <span className="clp-done-label"><Check size={10} />Done</span>}
                </div>
              </article>
            })}
          </div>
        </section>

        <aside className="clp-side-panels">
          <section className="clp-side-card clp-week-progress">
            <h2>Your Week Progress</h2>
            <div className="clp-week-progress-body">
              <span className="clp-week-ring" style={{ '--clp-progress': `${percent}%` }}><i>{percent}%</i></span>
              <div>
                <p><BookOpen size={11} />Lessons <b>({lessonsDone}/4)</b></p>
                <p><Target size={11} />Practice Sets <b>({practiceDone}/2)</b></p>
                <p><FolderKanban size={11} />Project <b>({projectsDone}/1)</b></p>
              </div>
            </div>
          </section>

          <section className="clp-side-card clp-resources">
            <h2>Resources for This Week</h2>
            <button type="button" onClick={() => openTask(tasks.find((task) => task.type === 'lesson'))}>
              <span className="clp-resource-icon green"><Play size={13} /></span><span><b>Video Lessons</b><small>Sample lesson previews</small></span>
            </button>
            <button type="button" onClick={() => openTask(tasks.find((task) => task.type === 'lesson'))}>
              <span className="clp-resource-icon blue"><FileText size={13} /></span><span><b>Notes &amp; Cheat Sheets</b><small>Sample lesson notes</small></span>
            </button>
            <button type="button" onClick={() => openPractice(tasks.find((task) => task.type === 'practice'))}>
              <span className="clp-resource-icon orange"><Target size={13} /></span><span><b>Practice Exercises</b><small>Open Coding Knowledge</small></span>
            </button>
            <button type="button" onClick={() => openTask(tasks.find((task) => task.type === 'project'))}>
              <span className="clp-resource-icon purple"><FolderKanban size={13} /></span><span><b>Project Guide</b><small>Sample project preview</small></span>
            </button>
          </section>

          <section className="clp-help-card">
            <CircleHelp size={14} />
            <div><b>Stuck on a topic?</b><small>Revisit lesson previews or open the discussion section for help.</small></div>
            <button type="button" onClick={() => navigate('/interview-prep/topic-practice')}>Open Topic-wise Practice <ArrowRight size={11} /></button>
          </section>
        </aside>
      </div>
    </>}
    <p className="clp-session-note"><Sparkles size={10} />Progress is stored for this browser session only.</p>
  </section>
}
