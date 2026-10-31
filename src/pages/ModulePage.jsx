import { ArrowRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'

const pages = {
  jobs: { eyebrow: 'OPPORTUNITY DISCOVERY', title: 'Find work that fits.', description: 'A focused home for job and internship discovery, applications and career matches.', items: ['Job and internship discovery', 'AI-based job matching', 'Saved roles and application tracking'], accent: 'purple' },
  resume: { eyebrow: 'YOUR CAREER STORY', title: 'Make your experience stand out.', description: 'Build a clear, tailored resume and prepare application materials in one workspace.', items: ['Resume scanner and builder', 'Resume improvement and job-specific versions', 'Cover letter assistance'], accent: 'blue' },
  interview: { eyebrow: 'PRACTICE WITH PURPOSE', title: 'Feel ready for the conversation.', description: 'A future practice space for building interview confidence and communicating your strengths.', items: ['Interview practice sessions', 'Role-focused preparation', 'Feedback and progress tracking'], accent: 'cyan' },
  saved: { eyebrow: 'YOUR CAREER SHORTLIST', title: 'Saved jobs will be here.', description: 'Keep opportunities you want to revisit in one place.', items: ['Save interesting roles', 'Review opportunities later', 'Continue your search anytime'], accent: 'green' },
  applications: { eyebrow: 'YOUR JOB SEARCH', title: 'Application tracking is coming soon.', description: 'A future workspace to keep your application progress organized.', items: ['Track application stages', 'Keep important details together', 'Follow your progress'], accent: 'green' },
  analytics: { eyebrow: 'YOUR PROGRESS', title: 'Career insights are coming soon.', description: 'This space will help you review your activity and career progress.', items: ['Review your job search activity', 'Explore future progress insights', 'Set goals for your next step'], accent: 'blue' },
  profile: { eyebrow: 'YOUR ACCOUNT', title: 'Profile settings are coming soon.', description: 'Your SkillProof AI account information is managed securely through your signed-in session.', items: ['Account details', 'Career preferences', 'Profile visibility'], accent: 'cyan' },
  settings: { eyebrow: 'ACCOUNT PREFERENCES', title: 'Settings are coming soon.', description: 'Account preferences and premium features will appear here when available.', items: ['Manage account preferences', 'Review notification options', 'Explore future plan options'], accent: 'green' },
}

export default function ModulePage({ type }) {
  const page = pages[type] ?? pages.jobs
  return <section className={`coming-page coming-${page.accent}`}><div className="coming-copy"><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.description}</p></div><div className="coming-panel"><div className="coming-icon"><Clock3 size={22} /></div><span className="coming-label">COMING SOON</span><h2>This workspace is taking shape</h2><p>These tools are not connected yet. No live listings or AI results are shown.</p><ul>{page.items.map((item) => <li key={item}>{item}</li>)}</ul><Link to="/dashboard" className="inline-link">Back to your dashboard <ArrowRight size={15} /></Link></div></section>
}