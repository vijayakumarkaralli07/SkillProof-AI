import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Lightbulb,
  Link2,
  Play,
  Video,
} from 'lucide-react'
import '../styles/career-lesson-workspace.css'

const lessonContent = {
  'week-1-lesson-1': {
    objectives: ['What is HTML.', 'Basic structure of an HTML document.', 'How web browsers work.', 'Common uses in real websites.'],
    description: 'HTML (HyperText Markup Language) is the foundation of every website. In this lesson, you’ll learn what HTML is, why it is important, and how it works with web browsers. We’ll also look at a simple example to understand the basic structure of an HTML document.',
    notes: ['HTML describes the structure and meaning of page content.', 'Elements are written with tags, and most elements have an opening and closing tag.', 'Browsers parse HTML and render a document for people to use.'],
    example: '<!doctype html>\n<html lang="en">\n  <head>\n    <title>My first page</title>\n  </head>\n  <body>\n    <h1>Hello, web!</h1>\n  </body>\n</html>',
    takeaways: ['HTML gives web content its structure.', 'Browsers read HTML to build a page.', 'Start with a valid document structure.'],
  },
  'week-1-lesson-2': {
    objectives: ['Identify the doctype declaration.', 'Describe the head and body elements.', 'Add a page title and metadata.', 'Create a valid document outline.'],
    description: 'A consistent document structure helps browsers interpret your page. Learn how the doctype, html, head, and body elements fit together and where page metadata belongs.',
    notes: ['The doctype tells the browser to use modern HTML.', 'The head contains page metadata and the document title.', 'The body contains the content people see and use.'],
    example: '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>Page title</title>\n  </head>\n  <body>\n    <main>Page content</main>\n  </body>\n</html>',
    takeaways: ['Use a doctype at the start of the document.', 'Set the page language and character encoding.', 'Keep visible content in the body.'],
  },
  'week-1-lesson-3': {
    objectives: ['Choose headings in a logical order.', 'Write paragraphs and lists.', 'Create useful links.', 'Add images with text alternatives.'],
    description: 'HTML includes elements for headings, paragraphs, lists, links, and images. Choose elements based on the meaning of your content to create pages that are easier to navigate.',
    notes: ['Use headings to establish a clear content hierarchy.', 'Links should describe their destination.', 'Give meaningful images concise alternative text.'],
    example: '<h1>My interests</h1>\n<p>I enjoy learning about the web.</p>\n<ul>\n  <li>Design</li>\n  <li>Technology</li>\n</ul>\n<a href="/projects">View my projects</a>',
    takeaways: ['Use the element that best represents the content.', 'Make links descriptive.', 'Provide alternative text for informative images.'],
  },
  'week-1-lesson-4': {
    objectives: ['Recognize semantic HTML elements.', 'Use landmarks to organize a page.', 'Choose elements by meaning, not appearance.', 'Improve page navigation for assistive technology.'],
    description: 'Semantic elements communicate the purpose of content. Learn how landmarks such as header, nav, main, and footer make a page structure clearer for people and assistive technologies.',
    notes: ['Semantic elements provide meaning beyond visual styling.', 'Use one main landmark for the primary page content.', 'A nav element groups important navigation links.'],
    example: '<header><h1>My portfolio</h1></header>\n<nav aria-label="Main navigation">...</nav>\n<main>\n  <section aria-labelledby="work-title">\n    <h2 id="work-title">Selected work</h2>\n  </section>\n</main>\n<footer>Contact information</footer>',
    takeaways: ['Prefer semantic elements over generic containers when appropriate.', 'Use a logical heading hierarchy.', 'Structure supports accessibility and maintainability.'],
  },
}

const tabLabels = ['Video Lesson', 'Lesson Notes', 'Key Takeaways', 'Resources']

function lessonTitle(task) {
  return task.title.replace(/^Lesson \d+:\s*/, '')
}

function formatDuration(minutes) {
  if (minutes >= 60) return `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`
  return `${minutes} min`
}

function HighlightedTitle({ title }) {
  const parts = title.split(/(HTML|CSS|JavaScript|React|Git)/g)
  return <>{parts.map((part, index) => /^(HTML|CSS|JavaScript|React|Git)$/.test(part)
    ? <span className="clw-title-highlight" key={`${part}-${index}`}>{part}</span>
    : part)}</>
}

export default function CareerLessonWorkspace({
  week,
  groupTitle,
  tasks,
  selectedTask,
  completedIds,
  careerDiscovery,
  activeTab,
  progressError,
  progressMessage,
  completionMessage,
  onTabChange,
  onBack,
  onSelectTask,
  onComplete,
}) {
  const lessonTasks = tasks.filter((task) => task.type === 'lesson')
  const orderedTasks = [
    ...lessonTasks,
    ...tasks.filter((task) => task.type === 'practice'),
    ...tasks.filter((task) => task.type === 'project'),
  ]
  const selectedPosition = orderedTasks.findIndex((task) => task.id === selectedTask.id)
  const lessonPosition = lessonTasks.findIndex((task) => task.id === selectedTask.id)
  const roleTitle = careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole || ''
  const isWebTrack = !roleTitle || /frontend|full.?stack|web developer/i.test(roleTitle)
  const details = (isWebTrack ? lessonContent[selectedTask.id] : null) || {
    objectives: [
      `Understand the key ideas in ${lessonTitle(selectedTask)}.`,
      `Connect this topic to ${groupTitle}.`,
      'Apply the concept in a small example.',
      'Review your work against the lesson goal.',
    ],
    description: `${selectedTask.description} This sample lesson introduces a practical idea from ${groupTitle}.`,
    notes: [
      `Start with the purpose of ${lessonTitle(selectedTask)}.`,
      'Work through one small example before adding complexity.',
      'Review the result and note one improvement.',
    ],
    example: '// Sample lesson notes\n// Course material for this topic is not connected yet.',
    takeaways: [
      `Know when to use ${lessonTitle(selectedTask)}.`,
      'Keep examples small and focused.',
      'Check your work before moving to the next task.',
    ],
  }
  const completedLessons = lessonTasks.filter((task) => completedIds.includes(task.id)).length
  const lessonProgress = Math.round((completedLessons / lessonTasks.length) * 100)
  const experience = careerDiscovery.background || ''
  const difficulty = experience === 'Built small projects' || experience === 'Some real experience' ? 'Intermediate' : 'Beginner'
  const duration = formatDuration(selectedTask.minutes)
  const previous = lessonTasks[lessonPosition - 1]
  const next = lessonTasks[lessonPosition + 1]

  return <section className="career-lesson-workspace" aria-labelledby="clw-title">
    <button className="clw-back-link" type="button" onClick={onBack}><ArrowLeft size={13} />Back</button>
    <header className="clw-lesson-header">
      <div className="clw-lesson-heading">
        <p>Week {week}<span>·</span>{groupTitle}<span>·</span>Lesson {selectedPosition + 1} of {tasks.length}</p>
        <h1 id="clw-title"><HighlightedTitle title={lessonTitle(selectedTask)} /></h1>
        <p className="clw-lesson-subtitle">{selectedTask.description}</p>
      </div>
      <div className="clw-lesson-summary">
        <div className="clw-week-progress-card">
          <div><b>Week {week} Progress</b><strong>{lessonProgress}%</strong></div>
          <span><i style={{ width: `${lessonProgress}%` }} /></span>
          <small>{completedLessons} of {lessonTasks.length} lessons completed</small>
        </div>
        <div className="clw-lesson-meta"><span><Clock3 size={13} />{duration}</span><b><BookOpen size={12} />{difficulty}</b></div>
      </div>
    </header>

    <div className="clw-workspace-grid">
      <aside className="clw-lessons-panel">
        <header><h2>Week {week} Lessons</h2><p>{lessonTasks.length} lessons · {tasks.filter((task) => task.type === 'practice').length} practice sets · {tasks.filter((task) => task.type === 'project').length} mini project</p></header>
        <div className="clw-lessons-list">
          {orderedTasks.map((task, index) => {
            const isLesson = task.type === 'lesson'
            const isSelected = task.id === selectedTask.id
            const isComplete = completedIds.includes(task.id)
            const TaskIcon = task.type === 'lesson' ? (index === 0 ? Play : FileText) : task.type === 'practice' ? Code2 : Lightbulb
            return <button
              type="button"
              key={task.id}
              className={`clw-lesson-row${isSelected ? ' selected' : ''}${isComplete ? ' completed' : ''}${!isLesson ? ' non-lesson' : ''}`}
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => isLesson
                ? onSelectTask(task)
                : onSelectTask(task, task.type === 'practice' ? 'practice' : 'task')}
            >
              <span className="clw-lesson-number">{isComplete ? <Check size={11} /> : index + 1}</span>
              <span className={`clw-lesson-icon ${task.type}`}><TaskIcon size={12} /></span>
              <span className="clw-lesson-label"><b>{lessonTitle(task)}</b><small>{task.type === 'lesson' ? 'Lesson' : task.type === 'practice' ? 'Practice task' : 'Project task'}</small></span>
              <small className="clw-lesson-duration">{formatDuration(task.minutes)}</small>
            </button>
          })}
        </div>
      </aside>

      <main className="clw-lesson-main">
        <div className="clw-tabs" role="tablist" aria-label="Lesson content">
          {tabLabels.map((label, index) => {
            const TabIcon = [Play, FileText, Lightbulb, Link2][index]
            return <button
              type="button"
              role="tab"
              aria-selected={activeTab === label}
              className={activeTab === label ? 'active' : ''}
              key={label}
              onClick={() => onTabChange(label)}
            ><TabIcon size={13} />{label}</button>
          })}
        </div>

        <div className="clw-tab-panel" role="tabpanel">
          {activeTab === 'Video Lesson' && <>
            <div className="clw-video-preview" aria-label={`Sample video preview for ${lessonTitle(selectedTask)}. Video playback is not connected.`}>
              <div className="clw-video-geometric" />
              <div className="clw-video-copy"><small>SAMPLE LESSON PREVIEW · VIDEO NOT CONNECTED</small><h2>{lessonTitle(selectedTask)}</h2><span>Course video is not configured yet</span></div>
              <div className="clw-video-mark"><span>&lt;/&gt;</span></div>
              <span className="clw-video-play" aria-hidden="true"><Play size={25} fill="currentColor" /></span>
              <div className="clw-video-controls"><span><Play size={13} fill="currentColor" /></span><small>Preview unavailable</small><span className="clw-control-spacer" /><span>CC</span><span>⚙</span><span>⛶</span></div>
            </div>
            <section className="clw-objectives">
              <h2>What You’ll Learn in This Lesson</h2>
              <ul>{details.objectives.map((objective) => <li key={objective}><Check size={11} />{objective}</li>)}</ul>
            </section>
            <section className="clw-description"><h2>Lesson Description</h2><p>{details.description}</p></section>
          </>}

          {activeTab === 'Lesson Notes' && <section className="clw-text-tab">
            <span className="clw-sample-label">SAMPLE LESSON NOTES</span>
            <h2>{lessonTitle(selectedTask)}</h2>
            {details.notes.map((note) => <p key={note}>{note}</p>)}
            <h3>Example</h3><pre><code>{details.example}</code></pre>
          </section>}

          {activeTab === 'Key Takeaways' && <section className="clw-text-tab">
            <span className="clw-sample-label">KEY TAKEAWAYS</span>
            <h2>Remember these ideas</h2>
            <ul className="clw-takeaways">{details.takeaways.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>
          </section>}

          {activeTab === 'Resources' && <section className="clw-text-tab">
            <span className="clw-sample-label">SAMPLE RESOURCES · LINKS NOT CONFIGURED</span>
            <h2>Resources for {lessonTitle(selectedTask)}</h2>
            <article className="clw-resource-item"><BookOpen size={15} /><span><b>Lesson notes</b><small>Review the notes and example in the Lesson Notes tab.</small></span></article>
            <article className="clw-resource-item"><Video size={15} /><span><b>Course video</b><small>No playable course video is configured for this lesson.</small></span></article>
            <article className="clw-resource-item"><Code2 size={15} /><span><b>Practice activity</b><small>Return to your weekly plan to open the matching practice task.</small></span></article>
          </section>}
        </div>

        {progressMessage && <p className="clw-session-note" role="status"><Check size={10} />{progressMessage}</p>}
        {completionMessage && <p className="clw-session-note" role="status"><Check size={10} />{completionMessage}</p>}

        <footer className="clw-bottom-actions">
          <button type="button" className="clw-secondary-button" disabled={!previous} onClick={() => previous && onSelectTask(previous)}><ChevronLeft size={13} />Previous Lesson</button>
          <button type="button" className="clw-complete-button" disabled={completedIds.includes(selectedTask.id)} onClick={() => onComplete(selectedTask)}>
            {completedIds.includes(selectedTask.id) ? 'Lesson Complete' : 'Mark Lesson Complete'}<Check size={13} />
          </button>
          <button type="button" className="clw-secondary-button" disabled={!next} onClick={() => next && onSelectTask(next)}>Next Lesson<ChevronRight size={13} /></button>
        </footer>
      </main>
    </div>
    {progressError && <p className="clw-progress-error" role="alert">{progressError}</p>}
    <p className="clw-session-note"><Clock3 size={10} />Progress is stored for this browser session only.</p>
  </section>
}
