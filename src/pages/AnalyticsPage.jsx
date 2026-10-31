import { useEffect, useState } from 'react'
import {
  AlertCircle, ArrowUpRight, Atom, BarChart3, Code2, Database, Eye, FileText,
  Globe2, Layers3, Lightbulb, MessageCircle, RotateCw, Sparkles, Target, UsersRound,
} from 'lucide-react'
import SectionBackButton from '../components/common/SectionBackButton'
import { useAuth } from '../hooks/useAuth'
import { lifecycleStatusLabel } from '../constants/applicationLifecycle.js'
import { loadUserAnalytics } from '../services/analyticsService.js'

const metricIcons = {
  success: Target,
  interviews: UsersRound,
  skills: Layers3,
  response: BarChart3,
}

const funnelIcons = {
  applied: FileText,
  reviewed: Eye,
  interview: UsersRound,
  offers: Sparkles,
}

const conversionTrendSeries = [
  { id: 'appliedToReviewed', label: 'Applied → Under Review', color: '#08ae62', fill: 'rgba(8, 174, 98, .08)' },
  { id: 'appliedToInterview', label: 'Applied → Interview', color: '#2685e8', fill: 'rgba(38, 133, 232, .07)' },
  { id: 'appliedToOffer', label: 'Applied → Offer', color: '#9855e8', fill: 'rgba(152, 85, 232, .07)' },
]

const skillIcons = {
  react: Atom,
  sql: Database,
  database: Database,
  python: Code2,
  typescript: Code2,
  communication: MessageCircle,
}

const sourceLabels = {
  student_reported: 'Student-reported',
  employer_reported: 'Recruiter-recorded',
  verified_employer_integration: 'Verified employer integration',
  platform_submission: 'Submitted through SkillProof AI',
  system_backfill: 'Existing tracked record',
}

function AnalyticsIllustration() {
  return <div className="analytics-illustration" aria-hidden="true">
    <div className="analytics-illustration-glow" />
    <div className="analytics-orbit analytics-orbit-one" />
    <div className="analytics-orbit analytics-orbit-two" />
    <div className="analytics-report">
      <div className="analytics-report-bars"><i /><i /><i /><i /></div>
      <div className="analytics-report-line" />
    </div>
    <ArrowUpRight className="analytics-trend-arrow" size={38} strokeWidth={2.4} />
    <span className="analytics-float-label learn-label">Learn</span>
    <span className="analytics-float-label improve-label">Improve</span>
    <span className="analytics-float-label grow-label">Grow</span>
    <Sparkles className="analytics-spark analytics-spark-one" size={13} />
    <Sparkles className="analytics-spark analytics-spark-two" size={12} />
  </div>
}

function SummaryCard({ metric, index }) {
  const Icon = metricIcons[metric.id]
  return <article className={`analytics-summary-card summary-${metric.color}`} style={{ '--card-delay': `${index * 55}ms` }}>
    <span className="analytics-summary-icon"><Icon size={22} strokeWidth={2.2} /></span>
    <span className="analytics-summary-copy">
      <strong className={metric.value === 'Not enough data yet' ? 'analytics-summary-pending' : ''}>{metric.value}</strong>
      <span>{metric.label}</span>
      <small>{metric.description}</small>
      <em>{metric.detail}</em>
    </span>
  </article>
}

function FlagIcon() {
  return <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
    <path d="M5 21V4m0 1c5-4 9 4 14 0v9c-5 4-9-4-14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}

function ApplicationFunnel({ analytics }) {
  return <section className="analytics-card funnel-card">
    <header className="analytics-card-heading">
      <span className="analytics-card-icon funnel-heading-icon"><FlagIcon /></span>
      <div>
        <h2>Application Funnel</h2>
        <p>{analytics.totalApplications} distinct tracked application records. Stages count applications that reached each status.</p>
      </div>
    </header>
    <div className="funnel-stages">
      {analytics.funnel.map((stage, index) => {
        const Icon = funnelIcons[stage.id]
        return <div className={`funnel-stage funnel-stage-${index + 1}`} key={stage.id}>
          <Icon size={20} strokeWidth={2.2} />
          <span>{stage.label}</span>
        </div>
      })}
    </div>
    <div className="funnel-stats">
      {analytics.funnel.map((stage) => <div className="funnel-stat" key={stage.id}>
        <strong>{stage.value}</strong>
        <span className="funnel-progress"><i style={{ width: `${stage.percentage}%` }} /></span>
        <small>{stage.percentage}%</small>
      </div>)}
    </div>
    {!analytics.submittedApplications && <p className="analytics-card-empty">
      {analytics.totalApplications
        ? 'No confirmed submissions are tracked yet. Saved and preparing records are not included in the funnel.'
        : 'No applications are tracked yet. Save or prepare a job to start collecting personal analytics.'}
    </p>}
  </section>
}

function SkillDemand({ analytics }) {
  const highestCount = analytics.skillDemand[0]?.jobs || 1
  const hasSkills = analytics.skillDemand.length > 0
  return <section className="analytics-card skill-demand-card">
    <header className="analytics-card-heading">
      <span className="analytics-card-icon skill-demand-heading-icon"><BarChart3 size={21} /></span>
      <div>
        <h2>Skill Demand</h2>
        <p>Skills listed in {analytics.trackedSkillJobCount} of your saved or tracked jobs.</p>
      </div>
    </header>
    {hasSkills ? <div className="skill-demand-list">
      {analytics.skillDemand.map((skill) => {
        const iconKey = skill.label.toLocaleLowerCase()
        const Icon = skillIcons[iconKey] || Layers3
        const barWidth = Math.round((skill.jobs / highestCount) * 100)
        return <div className="skill-demand-row" key={iconKey}>
          <span className="skill-demand-icon"><Icon size={19} strokeWidth={2.2} /></span>
          <span className="skill-demand-label">{skill.label}</span>
          <span className="skill-demand-track"><i style={{ width: `${barWidth}%` }} /></span>
          <span className="skill-demand-value">{skill.jobs} {skill.jobs === 1 ? 'job' : 'jobs'}</span>
        </div>
      })}
    </div> : <p className="analytics-card-empty">
      No skill tags are available from your saved or tracked jobs yet. Save or track jobs that include skill tags to build these insights.
    </p>}
    <p className="analytics-card-footnote">
      {analytics.matchedSkills === null
        ? 'Add profile skills and track jobs with skill tags to calculate exact matches.'
        : `${analytics.matchedSkills} of your profile skills exactly match the skill tags in tracked jobs.`}
    </p>
  </section>
}

function formatResponseSource(applicationKind) {
  return applicationKind === 'native' ? 'Recruiter-recorded or verified' : 'Student-reported external status'
}

function ResponseAnalysis({ analytics }) {
  return <section className="response-analysis">
    <h3>Response Time Analysis</h3>
    <p>Time from confirmed submission to the first recorded response status. {formatResponseSource('external')}.</p>
    {analytics.responseTime.length ? <div className="response-time-list">
      {analytics.responseTime.map((item) => <div className="response-time-item" key={item.id}>
        <span>{item.label}</span><strong>{item.value}%</strong>
        <i><b style={{ width: `${item.value}%` }} /></i>
        <small>{item.count} of {analytics.responseSampleSize} recorded responses</small>
      </div>)}
      <small className="analytics-card-footnote">Based on {analytics.responseSampleSize} timestamped response records. External statuses are student-reported; native statuses are recruiter-recorded unless marked verified.</small>
    </div> : <p className="analytics-card-empty">Not enough eligible response events with submission and status timestamps yet.</p>}
  </section>
}

function OutcomeList({ title, description, items, emptyMessage }) {
  return <section className="performing-channels">
    <h3>{title}</h3>
    <p>{description}</p>
    {items.length ? <div className="channel-list">
      {items.map((item) => <div className="channel-row" key={item.id}>
        <span className="channel-icon" aria-hidden="true"><Globe2 size={15} /></span>
        <span className="channel-name">{item.label}</span>
        <span className="channel-track"><i style={{ width: `${item.rate}%` }} /></span>
        <strong>{item.rate}%<small>{item.responses}/{item.applications} reported</small></strong>
      </div>)}
    </div> : <p className="analytics-card-empty">{emptyMessage}</p>}
  </section>
}

function RecentActivity({ analytics }) {
  return <section className="analytics-recent-activity">
    <h3>Recent Activity</h3>
    {analytics.activity.length ? <ol>
      {analytics.activity.map((event) => {
        const isFollowUp = event.eventType === 'follow_up_updated'
        return <li key={event.id}>
          <span className="activity-dot" aria-hidden="true" />
          <span className="activity-copy">
            <strong>{isFollowUp
              ? `${event.company || event.title || 'Application'} · Follow-up ${event.followUpDate ? `set for ${event.followUpDate}` : 'removed'}`
              : `${event.company || event.title || 'Application status updated'} · ${lifecycleStatusLabel(event.status)}`}</strong>
            <small>{sourceLabels[event.source] || 'Reported status'}</small>
          </span>
          <time dateTime={event.changedAt}>{new Date(event.changedAt).toLocaleDateString()}</time>
        </li>
      })}
    </ol> : <p className="analytics-card-empty">No persisted application or follow-up activity yet.</p>}
  </section>
}

function ApplicationInsights({ analytics }) {
  return <section className="analytics-card insights-card">
    <header className="analytics-card-heading">
      <span className="analytics-card-icon insights-heading-icon"><Lightbulb size={20} /></span>
      <div><h2>Application Insights &amp; Trends</h2><p>Insights use your tracked applications, not platform-wide estimates.</p></div>
    </header>
    <p className="analytics-response-rate">
      <strong>Response Rate</strong>
      <span>{analytics.responseRate === null ? 'Not enough data yet' : `${analytics.responseRate}%`}</span>
      <small>{analytics.responseCount} applications with a recorded response status out of {analytics.submittedApplications} confirmed submissions. External statuses are student-reported.</small>
    </p>
    <div className="insights-split">
      <ResponseAnalysis analytics={analytics} />
      <div className="analytics-outcome-groups">
        <OutcomeList
          title="Top Performing Channels"
          description="Tracked outcomes by actual job source; at least two submissions and one recorded response are required."
          items={analytics.channels}
          emptyMessage="Not enough tracked outcomes to compare channels yet."
        />
        <OutcomeList
          title="Company Insights"
          description="Companies in your records with a recorded response; these are personal tracked outcomes."
          items={analytics.companies}
          emptyMessage="Not enough tracked outcomes to compare companies yet."
        />
      </div>
    </div>
    <RecentActivity analytics={analytics} />
  </section>
}

const chartBounds = { left: 36, right: 506, top: 10, bottom: 104 }

function chartX(index, count) {
  if (count === 1) return (chartBounds.left + chartBounds.right) / 2
  return chartBounds.left + index * ((chartBounds.right - chartBounds.left) / (count - 1))
}

function chartY(value) {
  return chartBounds.bottom - (Math.min(100, Math.max(0, value)) / 100) * (chartBounds.bottom - chartBounds.top)
}

function ConversionTrends({ analytics }) {
  const [period, setPeriod] = useState('3months')
  const [activePoint, setActivePoint] = useState(null)
  const [pinnedPoint, setPinnedPoint] = useState(null)
  const points = analytics.trend(period)
  const summaries = analytics.trendSummary(period)
  const pointIndex = pinnedPoint ?? activePoint
  const point = pointIndex === null ? null : points[pointIndex]
  const tooltipWidth = 172
  const tooltipX = point
    ? Math.min(chartBounds.right - tooltipWidth, Math.max(chartBounds.left, chartX(pointIndex, points.length) + 10))
    : chartBounds.left
  const tooltipY = point
    ? Math.max(chartBounds.top + 2, Math.min(chartBounds.bottom - 57, chartY(point.appliedToReviewed) - 62))
    : chartBounds.top

  function selectPeriod(event) {
    setPeriod(event.target.value)
    setActivePoint(null)
    setPinnedPoint(null)
  }

  return <section className="analytics-card conversion-trends-card">
    <header className="analytics-card-heading conversion-heading">
      <span className="analytics-card-icon conversion-heading-icon"><BarChart3 size={20} /></span>
      <div><h2>Conversion Trends</h2><p>Submission cohorts progressing to recorded statuses over time.</p></div>
      <label className="conversion-period">
        <span className="visually-hidden">Conversion chart period</span>
        <select value={period} onChange={selectPeriod} aria-label="Conversion chart period">
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
        </select>
      </label>
    </header>
    {points.length ? <>
      <div className="conversion-chart-wrap">
        <svg className="conversion-chart" viewBox="0 0 520 142" role="group" aria-label="Application status conversion by actual submission period">
          {[0, 25, 50, 75, 100].map((value) => <g key={value}>
            <line x1={chartBounds.left} x2={chartBounds.right} y1={chartY(value)} y2={chartY(value)} className="conversion-gridline" />
            <text x="0" y={chartY(value) + 3} className="conversion-axis-label">{value}%</text>
          </g>)}
          {conversionTrendSeries.map((series) => {
            const linePoints = points.map((entry, index) => `${chartX(index, points.length)},${chartY(entry[series.id])}`).join(' ')
            const areaPoints = `${chartBounds.left},${chartBounds.bottom} ${linePoints} ${chartBounds.right},${chartBounds.bottom}`
            return <g key={series.id} className={`conversion-series series-${series.id}`}>
              {points.length > 1 && <polygon points={areaPoints} fill={series.fill} />}
              <polyline points={linePoints} fill="none" stroke={series.color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
              {points.map((entry, index) => {
                const x = chartX(index, points.length)
                const y = chartY(entry[series.id])
                return <circle
                  key={`${series.id}-${entry.month}`}
                  cx={x}
                  cy={y}
                  r={pointIndex === index ? 4.5 : 3.3}
                  fill={series.color}
                  stroke="#fff"
                  strokeWidth="1.5"
                  tabIndex="0"
                  role="button"
                  aria-label={`${entry.month}: ${series.label}, ${entry[series.id]} percent`}
                  onMouseEnter={() => setActivePoint(index)}
                  onMouseLeave={() => setActivePoint(null)}
                  onFocus={() => setActivePoint(index)}
                  onBlur={() => setActivePoint(null)}
                  onClick={() => setPinnedPoint((current) => current === index ? null : index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setPinnedPoint((current) => current === index ? null : index)
                    }
                    if (event.key === 'Escape') setPinnedPoint(null)
                  }}
                />
              })}
            </g>
          })}
          {points.map((entry, index) => <text key={`period-${entry.month}`} x={chartX(index, points.length)} y="122" textAnchor="middle" className="conversion-axis-label conversion-month-label">{entry.month}</text>)}
          {point && <g className="conversion-tooltip" aria-hidden="true">
            <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height="56" rx="6" />
            <text x={tooltipX + 8} y={tooltipY + 11} className="conversion-tooltip-month">{point.month}</text>
            {conversionTrendSeries.map((series, index) => <text key={series.id} x={tooltipX + 8} y={tooltipY + 24 + index * 10} className={`conversion-tooltip-value tooltip-${series.id}`}>
              <tspan>{series.label}</tspan><tspan x={tooltipX + tooltipWidth - 8} textAnchor="end">{point[series.id]}%</tspan>
            </text>)}
          </g>}
        </svg>
        <span className="visually-hidden" aria-live="polite">{point ? `${point.month}: ${conversionTrendSeries.map((series) => `${series.label} ${point[series.id]} percent`).join(', ')}` : ''}</span>
      </div>
      <div className="conversion-legend" aria-label="Chart series">
        {conversionTrendSeries.map((series) => <span key={series.id}><i style={{ background: series.color }} />{series.label}</span>)}
      </div>
    </> : <p className="analytics-card-empty conversion-empty">No confirmed submissions with dates fall within this period.</p>}
    <div className="conversion-summary-grid">
      {summaries.map((summary) => {
        const Icon = summary.color === 'green' ? FileText : summary.color === 'blue' ? Eye : UsersRound
        return <article className={`conversion-summary summary-${summary.color}`} key={summary.id}>
          <span><Icon size={16} /></span>
          <div>
            <strong>{summary.label}</strong>
            <b>{summary.value === null ? 'Not enough data yet' : `${summary.value}%`}</b>
            <small>{summary.denominator ? `${summary.reached} / ${summary.denominator} reached` : 'No submissions in this period'}</small>
          </div>
        </article>
      })}
    </div>
  </section>
}

function AnalyticsLoading() {
  return <div className="analytics-loading" role="status" aria-label="Loading analytics">
    <span className="analytics-loading-card" /><span className="analytics-loading-card" />
    <span className="analytics-loading-card" /><span className="analytics-loading-card" />
    <span className="analytics-loading-panel" /><span className="analytics-loading-panel" />
  </div>
}

function buildMetrics(analytics) {
  return [
    {
      id: 'success',
      value: analytics.applicationSuccessRate === null ? 'Not enough data yet' : `${analytics.applicationSuccessRate}%`,
      label: 'Application Success',
      description: 'Submitted applications that reached Interview or Offer',
      detail: `${analytics.submittedApplications} confirmed submissions`,
      color: 'green',
    },
    {
      id: 'interviews',
      value: String(analytics.interviews),
      label: 'Interviews',
      description: 'Distinct applications with a recorded Interview status',
      detail: 'From persisted application history',
      color: 'blue',
    },
    {
      id: 'skills',
      value: analytics.matchedSkills === null ? 'Not enough data yet' : String(analytics.matchedSkills),
      label: 'Skills Matched',
      description: 'Exact profile-skill matches in your tracked jobs',
      detail: 'Profile and job skill tags only',
      color: 'purple',
    },
    {
      id: 'response',
      value: analytics.responseRate === null ? 'Not enough data yet' : `${analytics.responseRate}%`,
      label: 'Response Rate',
      description: 'Confirmed submissions with a recorded response status',
      detail: 'External updates are student-reported',
      color: 'amber',
    },
  ]
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [request, setRequest] = useState({ userId: '', retry: -1, analytics: null, error: '', loading: true })
  const [retry, setRetry] = useState(0)
  const isCurrentRequest = request.userId === user?.id && request.retry === retry
  const loading = !isCurrentRequest || request.loading
  const analytics = isCurrentRequest ? request.analytics : null
  const error = isCurrentRequest ? request.error : ''

  useEffect(() => {
    let active = true
    loadUserAnalytics(user?.id).then((result) => {
      if (active) setRequest({ userId: user?.id || '', retry, analytics: result, error: '', loading: false })
    }).catch((loadError) => {
      if (active) setRequest({ userId: user?.id || '', retry, analytics: null, error: loadError.message || 'Analytics could not be loaded.', loading: false })
    })
    return () => { active = false }
  }, [user?.id, retry])

  return <section className="analytics-page">
    <SectionBackButton />
    <section className="analytics-hero">
      <div className="analytics-hero-copy">
        <span className="analytics-eyebrow">ANALYTICS</span>
        <h1>Your Career <span>Performance</span></h1>
        <p>See where your job search is working and what to improve.</p>
      </div>
      <AnalyticsIllustration />
    </section>
    {error && <div className="analytics-error" role="alert">
      <AlertCircle size={18} />
      <span>{error}</span>
      <button type="button" onClick={() => setRetry((value) => value + 1)}><RotateCw size={15} />Retry</button>
    </div>}
    {loading ? <AnalyticsLoading /> : analytics && <>
      <div className="analytics-summary-grid">
        {buildMetrics(analytics).map((metric, index) => <SummaryCard metric={metric} index={index} key={metric.id} />)}
      </div>
      <div className="analytics-content-grid">
        <ApplicationFunnel analytics={analytics} />
        <ApplicationInsights analytics={analytics} />
        <ConversionTrends analytics={analytics} />
        <SkillDemand analytics={analytics} />
      </div>
      <p className="analytics-data-note">
        <Globe2 size={13} />All figures are calculated from your persisted records. Student-reported and recruiter-recorded updates are labeled; no employer synchronization is assumed.
        <button type="button" onClick={() => setRetry((value) => value + 1)} aria-label="Refresh analytics"><RotateCw size={13} />Refresh</button>
      </p>
    </>}
  </section>
}
