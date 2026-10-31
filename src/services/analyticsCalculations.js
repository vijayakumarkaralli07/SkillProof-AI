const responseStatuses = new Set(['assessment', 'under_review', 'interview', 'offer', 'rejected'])
const responseSources = {
  external: new Set(['student_reported']),
  native: new Set(['employer_reported', 'verified_employer_integration']),
}
const submittedStatuses = new Set(['applied', 'assessment', 'under_review', 'interview', 'offer', 'rejected'])

function normalizeText(value) {
  return String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function isValidDate(value) {
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

function eventReached(application, status) {
  return application.status === status || application.history.some((event) => event.newStatus === status)
}

function hasSubmitted(application) {
  return application.kind === 'native'
    ? Boolean(application.submittedAt)
    : submittedStatuses.has(application.status) || application.history.some((event) => event.newStatus === 'applied')
}

function responseEvents(application) {
  const submittedAt = isValidDate(application.submittedAt)
  if (!submittedAt) return []
  return application.history.filter((event) => {
    const changedAt = isValidDate(event.changedAt)
    return changedAt !== null
      && changedAt >= submittedAt
      && responseStatuses.has(event.newStatus)
      && responseSources[application.kind].has(event.source)
  })
}

function toPercent(numerator, denominator) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : null
}

function periodStart(date, months) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months + 1, 1))
}

function weekStart(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7))
  return start
}

function trendLabel(date, period) {
  return new Intl.DateTimeFormat('en', period === '30days'
    ? { month: 'short', day: 'numeric', timeZone: 'UTC' }
    : { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(date)
}

function buildTrendPoints(applications, period, now) {
  const end = now.getTime()
  const start = period === '30days'
    ? end - 30 * 24 * 60 * 60 * 1000
    : periodStart(now, period === '3months' ? 3 : 6).getTime()
  const cohorts = new Map()

  for (const application of applications) {
    if (!hasSubmitted(application)) continue
    const submittedAt = isValidDate(application.submittedAt)
    if (submittedAt === null || submittedAt < start || submittedAt > end) continue
    const date = new Date(submittedAt)
    const bucket = period === '30days' ? weekStart(date) : periodStart(date, 1)
    const key = bucket.toISOString()
    const cohort = cohorts.get(key) || { date: bucket, applications: [] }
    cohort.applications.push(application)
    cohorts.set(key, cohort)
  }

  return [...cohorts.values()]
    .sort((left, right) => left.date - right.date)
    .map(({ date, applications: cohort }) => {
      const reviewed = cohort.filter((application) => eventReached(application, 'under_review')).length
      const interviewed = cohort.filter((application) => eventReached(application, 'interview')).length
      const offered = cohort.filter((application) => eventReached(application, 'offer')).length
      return {
        month: trendLabel(date, period),
        appliedToReviewed: toPercent(reviewed, cohort.length),
        appliedToInterview: toPercent(interviewed, cohort.length),
        appliedToOffer: toPercent(offered, cohort.length),
        reviewed,
        interviewed,
        offered,
        applications: cohort.length,
      }
    })
}

function outcomeGroups(applications, keyFor) {
  const groups = new Map()
  for (const application of applications) {
    if (!hasSubmitted(application)) continue
    const name = keyFor(application)
    if (!name) continue
    const key = normalizeText(name)
    const group = groups.get(key) || { id: key, label: name, applications: 0, responses: 0 }
    group.applications += 1
    if (responseEvents(application).length) group.responses += 1
    groups.set(key, group)
  }
  return [...groups.values()]
    .filter((group) => group.applications >= 2 && group.responses > 0)
    .map((group) => ({ ...group, rate: toPercent(group.responses, group.applications) }))
    .sort((left, right) => right.rate - left.rate || right.responses - left.responses || left.label.localeCompare(right.label))
}

export function calculateAnalytics({ applications = [], savedJobs = [], profileSkills = [] }, now = new Date()) {
  const submittedApplications = applications.filter(hasSubmitted)
  const interviews = submittedApplications.filter((application) => eventReached(application, 'interview'))
  const offers = submittedApplications.filter((application) => eventReached(application, 'offer'))
  const successfulApplications = submittedApplications.filter((application) =>
    eventReached(application, 'interview') || eventReached(application, 'offer'))
  const respondedApplications = submittedApplications.filter((application) => responseEvents(application).length > 0)

  const matchedJobs = new Map()
  for (const job of savedJobs) {
    const skills = [...new Set((job.skills || []).map((skill) => String(skill).trim()).filter(Boolean))]
    if (skills.length) matchedJobs.set(`${job.kind || 'external'}:${job.jobId}`, skills)
  }
  for (const application of applications) {
    const details = application.jobData || {}
    const rawSkills = Array.isArray(details.skills) ? details.skills : Array.isArray(details.categories) ? details.categories : []
    const skills = [...new Set(rawSkills.filter((skill) => typeof skill === 'string').map((skill) => skill.trim()).filter(Boolean))]
    if (skills.length) {
      const key = `${application.kind}:${application.jobId}`
      matchedJobs.set(key, [...new Set([...(matchedJobs.get(key) || []), ...skills])])
    }
  }

  const skillCounts = new Map()
  for (const skills of matchedJobs.values()) {
    for (const skill of skills) {
      const key = normalizeText(skill)
      const previous = skillCounts.get(key) || { label: skill, jobs: 0 }
      previous.jobs += 1
      skillCounts.set(key, previous)
    }
  }
  const userSkillKeys = new Set(profileSkills.map(normalizeText).filter(Boolean))
  const matchedSkillCount = [...skillCounts.keys()].filter((skill) => userSkillKeys.has(skill)).length
  const totalSkillObservations = [...skillCounts.values()].reduce((total, skill) => total + skill.jobs, 0)

  const reachedCounts = {
    applied: submittedApplications.length,
    reviewed: submittedApplications.filter((application) => eventReached(application, 'under_review')).length,
    interview: interviews.length,
    offers: offers.length,
  }
  const funnel = [
    { id: 'applied', label: 'Applied', value: reachedCounts.applied },
    { id: 'reviewed', label: 'Under Review', value: reachedCounts.reviewed },
    { id: 'interview', label: 'Interview', value: reachedCounts.interview },
    { id: 'offers', label: 'Offers', value: reachedCounts.offers },
  ].map((stage) => ({
    ...stage,
    percentage: submittedApplications.length ? Math.min(100, Math.round((stage.value / submittedApplications.length) * 100)) : 0,
  }))

  const responseBuckets = [
    { id: 'week', label: 'Within 1 Week', min: 0, max: 7 },
    { id: 'twoWeeks', label: '1–2 Weeks', min: 8, max: 14 },
    { id: 'fourWeeks', label: '2–4 Weeks', min: 15, max: 28 },
    { id: 'later', label: 'Over 4 Weeks', min: 29, max: Infinity },
  ]
  const responseTimings = submittedApplications.flatMap((application) => {
    const submittedAt = isValidDate(application.submittedAt)
    const firstResponse = responseEvents(application)
      .map((event) => isValidDate(event.changedAt))
      .filter((changedAt) => changedAt !== null)
      .sort((left, right) => left - right)[0]
    return submittedAt === null || firstResponse === undefined
      ? []
      : [{ application, days: Math.floor((firstResponse - submittedAt) / 86_400_000) }]
  })
  const responseTime = responseBuckets.map((bucket) => {
    const count = responseTimings.filter((item) => item.days >= bucket.min && item.days <= bucket.max).length
    return { id: bucket.id, label: bucket.label, count, value: toPercent(count, responseTimings.length) }
  }).filter((bucket) => bucket.count > 0)

  const channels = outcomeGroups(applications, (application) => application.channel)
  const companies = outcomeGroups(applications, (application) => application.company)
  const activity = applications.flatMap((application) => application.history.map((event) => ({
    id: `${application.id}:${event.id || event.changedAt}:${event.newStatus}`,
    company: application.company,
    title: application.title,
    status: event.newStatus,
    changedAt: event.changedAt,
    source: event.source,
    eventType: event.eventType,
    followUpDate: event.followUpDate,
    note: event.note,
  }))).filter((event) => event.source !== 'system_backfill' && isValidDate(event.changedAt) !== null)
    .sort((left, right) => new Date(right.changedAt) - new Date(left.changedAt))
    .slice(0, 6)

  return {
    totalApplications: applications.length,
    submittedApplications: submittedApplications.length,
    interviews: interviews.length,
    offers: offers.length,
    applicationSuccessRate: toPercent(successfulApplications.length, submittedApplications.length),
    responseRate: respondedApplications.length ? toPercent(respondedApplications.length, submittedApplications.length) : null,
    responseCount: respondedApplications.length,
    matchedSkills: userSkillKeys.size && totalSkillObservations ? matchedSkillCount : null,
    skillDemand: [...skillCounts.values()]
      .sort((left, right) => right.jobs - left.jobs || left.label.localeCompare(right.label))
      .slice(0, 5)
      .map((skill) => ({ ...skill, percentage: totalSkillObservations ? Math.round((skill.jobs / totalSkillObservations) * 100) : 0 })),
    trackedSkillJobCount: matchedJobs.size,
    funnel,
    responseTime,
    responseSampleSize: responseTimings.length,
    channels,
    companies,
    activity,
    trend(period, rangeNow = now) {
      return buildTrendPoints(applications, period, rangeNow)
    },
    trendSummary(period, rangeNow = now) {
      const points = buildTrendPoints(applications, period, rangeNow)
      const denominator = points.reduce((total, point) => total + point.applications, 0)
      if (!denominator) return [
        { id: 'appliedToReviewed', label: 'Applied → Under Review', value: null, reached: 0, denominator: 0, color: 'green' },
        { id: 'appliedToInterview', label: 'Applied → Interview', value: null, reached: 0, denominator: 0, color: 'blue' },
        { id: 'appliedToOffer', label: 'Applied → Offer', value: null, reached: 0, denominator: 0, color: 'purple' },
      ]
      const totals = [
        { id: 'appliedToReviewed', label: 'Applied → Under Review', color: 'green' },
        { id: 'appliedToInterview', label: 'Applied → Interview', color: 'blue' },
        { id: 'appliedToOffer', label: 'Applied → Offer', color: 'purple' },
      ]
      return totals.map((summary) => {
        const reachedKey = {
          appliedToReviewed: 'reviewed',
          appliedToInterview: 'interviewed',
          appliedToOffer: 'offered',
        }[summary.id]
        const reached = points.reduce((total, point) => total + point[reachedKey], 0)
        return { ...summary, value: toPercent(reached, denominator), reached, denominator }
      })
    },
  }
}

export function normalizeAnalyticsApplications({ externalRows = [], nativeRows = [], historyRows = [] }) {
  const historyByApplication = new Map()
  for (const row of historyRows) {
    const key = `${row.application_kind}:${row.application_id}`
    const events = historyByApplication.get(key) || []
    events.push({
      id: row.id,
      newStatus: row.new_status,
      previousStatus: row.previous_status,
      changedAt: row.changed_at,
      source: row.source,
      eventType: row.event_type || 'status_changed',
      followUpDate: row.follow_up_date || '',
      note: '',
    })
    historyByApplication.set(key, events)
  }

  const externalApplications = externalRows.map((row) => {
    const details = {
      sourceType: row.source_type || '',
      source: row.source_name || '',
      skills: Array.isArray(row.skills) ? row.skills : [],
      categories: Array.isArray(row.categories) ? row.categories : [],
      title: row.stored_title || '',
      company: row.stored_company || '',
    }
    const id = row.application_record_id
    const history = historyByApplication.get(`external:${id}`) || []
    const appliedEvent = history.find((event) => event.newStatus === 'applied' && event.source !== 'system_backfill')
    return {
      id: `external:${id}`,
      recordId: id,
      kind: 'external',
      jobId: row.job_id,
      title: row.job_title || details.title || '',
      company: row.company || details.company || '',
      status: row.status || '',
      submittedAt: row.applied_at || appliedEvent?.changedAt || '',
      channel: details.sourceType === 'himalayas' ? 'Himalayas' : details.source || details.sourceType || '',
      jobData: details,
      history,
    }
  })
  const nativeApplications = nativeRows.map((row) => {
    const id = row.id
    return {
      id: `native:${id}`,
      recordId: id,
      kind: 'native',
      jobId: row.job_id,
      title: row.job_title || '',
      company: row.company_name || '',
      status: row.status || '',
      submittedAt: row.submitted_at || '',
      channel: 'SkillProof AI',
      jobData: {},
      history: historyByApplication.get(`native:${id}`) || [],
    }
  })
  return [...externalApplications, ...nativeApplications]
}

export function normalizeAnalyticsSavedJobs(rows = []) {
  return rows.map((row) => {
    const rawSkills = Array.isArray(row.skills) ? row.skills : Array.isArray(row.categories) ? row.categories : []
    return {
      kind: 'external',
      jobId: row.job_id,
      skills: rawSkills.filter((skill) => typeof skill === 'string'),
    }
  })
}
