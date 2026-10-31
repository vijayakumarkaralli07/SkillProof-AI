import { Activity, ArrowRight, AudioLines, Bookmark, BookOpen, BriefcaseBusiness, Building2, ChartNoAxesColumnIncreasing, Code2, FileText, GraduationCap, LayoutDashboard, MessageCircle, Mic, ScanLine, Search, Sparkles, Star, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { sampleMetrics } from '../services/dashboardSampleData'

const toolCards = [
  {
    id: '01',
    title: 'Find Jobs',
    description: 'Discover top jobs and internships that match your skills and interests with AI-powered recommendations.',
    to: '/jobs',
    action: 'Explore Jobs',
    kind: 'jobs',
    features: [
      [Search, 'Search Jobs & Internships'],
      [Target, 'AI Job Match'],
      [Bookmark, 'Saved Jobs'],
    ],
  },
  {
    id: '02',
    title: 'Resume Studio',
    description: 'Create, scan and improve your resume with powerful AI tools in minutes.',
    to: '/resume-studio',
    action: 'Open Resume Studio',
    kind: 'resume',
    features: [
      [ScanLine, 'Resume Scanner'],
      [FileText, 'Resume Builder'],
      [Sparkles, 'AI Resume Improve'],
      [Target, 'Job-Specific Resume'],
    ],
  },
  {
    id: '03',
    title: 'Interview Prep',
    description: 'Practice 10 sample interview questions by voice; AI scoring is not connected yet.',
    to: '/interview-prep',
    action: 'Start Interview Prep',
    kind: 'interview',
    features: [
      [MessageCircle, 'AI Mock Interview'],
      [BookOpen, 'Topic-wise Practice'],
      [Code2, 'Coding Knowledge'],
      [Target, 'Build Your Career'],
    ],
  },
]

const categories = [
  { name: 'Software Development', count: '120K+ jobs', Icon: Code2, color: 'blue' },
  { name: 'Data Science', count: '85K+ jobs', Icon: Activity, color: 'green' },
  { name: 'Product Management', count: '68K+ jobs', Icon: LayoutDashboard, color: 'purple' },
  { name: 'UI/UX Design', count: '50K+ jobs', Icon: Sparkles, color: 'violet' },
]

const companies = ['Google', 'Microsoft', 'Amazon', 'NVIDIA', 'Netflix']

function HeroIllustration() {
  return <div className="hero-illustration" role="img" aria-label="Illustrative career seeker with sample Job Match 92% and Resume Score Excellent widgets; not calculated results">
    <div className="hero-orbit hero-orbit-one" />
    <div className="hero-orbit hero-orbit-two" />
    <div className="hero-person">
      <div className="person-hair" />
      <div className="person-face"><i className="person-eye eye-left" /><i className="person-eye eye-right" /><i className="person-smile" /></div>
      <div className="person-neck" />
      <div className="person-hoodie"><i /><b /></div>
      <div className="person-arm arm-left" />
      <div className="person-arm arm-right" />
      <div className="person-laptop"><span className="laptop-logo">⬡</span></div>
    </div>
    <div className="floating-widget match-widget"><span className="widget-ring" /><span><small>Job Match</small><b>92%</b></span></div>
    <div className="floating-widget score-widget"><Star size={17} fill="currentColor" /><span><small>Resume Score</small><b>Excellent</b></span></div>
    <div className="floating-icon briefcase-widget"><BriefcaseBusiness size={19} /></div>
    <div className="floating-icon growth-widget"><ChartNoAxesColumnIncreasing size={20} /></div>
    <Sparkles className="hero-sparkle sparkle-a" size={16} />
    <Sparkles className="hero-sparkle sparkle-b" size={13} />
    <div className="hero-shadow" />
  </div>
}

function FeatureArtwork({ kind }) {
  if (kind === 'jobs') return <div className="feature-art jobs-art" aria-hidden="true">
    <div className="art-orbit" />
    <div className="jobs-case"><div className="case-handle" /><div className="case-latch" /></div>
    <div className="magnifier"><i /></div>
    <span className="art-tag tag-remote">Remote</span>
    <span className="art-tag tag-fulltime">Full-time</span>
    <span className="art-tag tag-intern">Internship</span>
    <Sparkles className="art-twinkle" size={16} />
  </div>
  if (kind === 'resume') return <div className="feature-art resume-art" aria-hidden="true">
    <div className="art-orbit" />
    <div className="resume-document document-back" />
    <div className="resume-document"><b>Resume</b><span className="doc-profile" /><i /><i /><i /><i /><i /></div>
    <span className="doc-scan"><ScanLine size={18} /></span>
    <Sparkles className="art-twinkle" size={16} />
  </div>
  return <div className="feature-art interview-art" aria-hidden="true">
    <div className="art-orbit" />
    <div className="audio-bubble"><AudioLines size={34} /></div>
    <div className="chat-bubble"><span /><span /><span /></div>
    <div className="mic-bubble"><Mic size={23} /></div>
    <Sparkles className="art-twinkle" size={16} />
  </div>
}

function FeatureCard({ card, index }) {
  return <article className={`feature-card feature-${card.kind} entrance-card`} style={{ '--stagger': `${index * 90}ms` }}>
    <span className="feature-badge">{card.id}</span>
    <FeatureArtwork kind={card.kind} />
    <div className="feature-card-copy">
      <h2>{card.title}</h2>
      <p>{card.description}</p>
    </div>
    <ul className="feature-list">
      {card.features.map(([Icon, label]) => <li key={label}><span><Icon size={15} /></span>{label}</li>)}
    </ul>
    <Link to={card.to} className="primary-action">{card.action}<ArrowRight size={16} /></Link>
  </article>
}

export default function Dashboard() {
  const { user } = useAuth()
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'there'
  const firstName = displayName.split(/\s+/)[0]

  return <div className="dashboard-page">
    <section className="hero-section" aria-labelledby="dashboard-title">
      <div className="hero-copy">
        <span className="section-eyebrow">WELCOME TO SKILLPROOF AI</span>
        <h1 id="dashboard-title">Your Next Opportunity <span>Starts Here</span></h1>
        <p>Find the right jobs, build a powerful resume and get interview ready with the help of AI, all in one place.</p>
      </div>
      <HeroIllustration />
      <div className="metrics-grid" aria-label="Illustrative sample platform metrics">
        {sampleMetrics.map(({ value, label, Icon }, index) => <article className="metric-card entrance-card" style={{ '--stagger': `${index * 65}ms` }} key={label}>
          <span className="metric-icon"><Icon size={20} /></span><span className="metric-copy"><b>{value}</b><small>{label}</small></span>
        </article>)}
      </div>
      <p className="sample-data-note">Illustrative sample metrics, not live platform statistics</p>
    </section>

    <section className="feature-section" aria-label="Career tools">
      <div className="section-heading"><div><span className="section-eyebrow">YOUR NEXT STEP</span><h2>Tools for your career journey</h2></div><span className="section-heading-note">Preview only – Live listings and AI tools are not connected yet</span></div>
      <div className="feature-grid">{toolCards.map((card, index) => <FeatureCard key={card.id} card={card} index={index} />)}</div>
    </section>

    <section className="discovery-grid" aria-label="Career discovery">
      <div className="discovery-panel categories-panel">
        <div className="panel-heading"><div><span className="panel-heading-icon"><GraduationCap size={18} /></span><h2>Popular Job Categories</h2></div><Link to="/jobs">View all <ArrowRight size={14} /></Link></div>
        <div className="category-grid">{categories.map(({ name, count, Icon, color }, index) => <Link to="/jobs" className="category-tile entrance-card" style={{ '--stagger': `${index * 65}ms` }} key={name}>
          <span className={`category-icon ${color}`}><Icon size={19} /></span><span className="category-copy"><b>{name}</b><small>{count}</small></span>
        </Link>)}</div>
        <span className="panel-footnote">Illustrative category counts</span>
      </div>
      <div className="discovery-panel companies-panel">
        <div className="panel-heading"><div><span className="panel-heading-icon"><Building2 size={17} /></span><h2>Companies to Explore</h2></div><Link to="/jobs">View all <ArrowRight size={14} /></Link></div>
        <div className="company-grid">{companies.map((name, index) => <Link to="/jobs" aria-label={`Explore jobs at ${name}`} className="company-tile entrance-card" style={{ '--stagger': `${index * 60}ms` }} key={name}><Building2 size={18} aria-hidden="true" /><small>{name}</small></Link>)}</div>
        <span className="panel-footnote">Example companies; current openings are not verified</span>
      </div>
    </section>
    <footer className="dashboard-footer"><span>SkillProof AI · A clearer path to your next opportunity</span><span>Welcome, {firstName}</span></footer>
  </div>
}
