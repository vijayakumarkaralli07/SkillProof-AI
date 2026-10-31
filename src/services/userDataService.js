import { getSupabaseClient, getSupabaseConfigError } from './supabaseClient.js'
import { normalizeCareerLearningProgress } from './careerLearningSessionService.js'
import { applicationStatuses } from '../constants/applicationLifecycle.js'

function roleKey(value) {
  return String(value || 'career-path').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function durationWeeks(timeline) {
  return {
    '1-3 months': 8,
    '3-6 months': 12,
    '6-12 months': 24,
    'More than 1 year': 52,
  }[timeline] || 12
}

async function getUserClient(userId) {
  if (!userId) throw new Error('Sign in to access your saved career data.')
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError() || 'Supabase is unavailable.')
  const { data, error } = await client.auth.getUser()
  if (error || !data.user || data.user.id !== userId) {
    throw new Error('Your signed-in account could not be verified. Sign in again.')
  }
  return { client, user: data.user }
}

function throwQueryError(error, fallback) {
  if (error) throw new Error(error.message || fallback)
}

function throwApplicationQueryError(error, fallback) {
  if (['PGRST204', 'PGRST205', '42703', '42P01'].includes(error?.code)) {
    throw new Error(`Application lifecycle schema is unavailable. Review migrations 20261027000500_application_lifecycle.sql and 20261027000600_analytics_follow_up_events.sql, then apply pending migrations with "npx supabase db push --linked". ${fallback}`)
  }
  throwQueryError(error, fallback)
}

export async function loadProfileRecord(userId) {
  const { client, user } = await getUserClient(userId)
  const { data, error } = await client.from('profiles')
    .select('user_id,name,full_name,email,phone,location,education,profile_data,updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  throwQueryError(error, 'Profile could not be loaded.')

  if (!data) {
    return {
      name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      email: user.email || '',
      phone: '',
      location: '',
      education: [],
      profile_data: {},
    }
  }

  const details = data.profile_data && typeof data.profile_data === 'object' ? data.profile_data : {}
  return {
    ...details,
    name: data.name || data.full_name || details.name || '',
    email: data.email || user.email || '',
    phone: data.phone || details.phone || '',
    location: data.location || details.location || '',
    education: Array.isArray(details.education) ? details.education : Array.isArray(data.education) ? data.education : [],
  }
}

export async function saveProfileRecord(userId, profile) {
  const { client, user } = await getUserClient(userId)
  const row = {
    user_id: userId,
    name: String(profile.name || '').trim(),
    full_name: String(profile.name || '').trim(),
    email: user.email || '',
    phone: String(profile.phone || '').trim(),
    location: String(profile.location || '').trim(),
    education: Array.isArray(profile.education) ? profile.education : [],
    profile_data: profile,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await client.from('profiles')
    .upsert(row, { onConflict: 'user_id' })
    .select('user_id,name,full_name,email,phone,location,education,profile_data,updated_at')
    .single()
  throwQueryError(error, 'Profile changes could not be saved.')
  return {
    ...profile,
    name: data.name || data.full_name || profile.name,
    email: data.email || user.email || '',
    phone: data.phone || '',
    location: data.location || '',
  }
}

export async function loadCareerData(userId) {
  const { client } = await getUserClient(userId)
  const [preferencesResult, selectedResult, planResult] = await Promise.all([
    client.from('career_preferences')
      .select('interests,priorities,background,experience_level,education,technologies,study_time,goal,timeline,target_role')
      .eq('user_id', userId)
      .maybeSingle(),
    client.from('selected_career_paths')
      .select('path_id,role_id,role_title,selected_role,selected_path,discovery_data,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    client.from('learning_plans')
      .select('id,career_path_id,target_role,plan_data,duration_weeks,status,created_at,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  throwQueryError(preferencesResult.error, 'Career preferences could not be loaded.')
  throwQueryError(selectedResult.error, 'Selected career path could not be loaded.')
  throwQueryError(planResult.error, 'Learning plan could not be loaded.')

  const preferences = preferencesResult.data || {}
  const selected = selectedResult.data || {}
  const savedDiscovery = selected.discovery_data && typeof selected.discovery_data === 'object' ? selected.discovery_data : {}
  const careerDiscovery = {
    ...preferences,
    ...savedDiscovery,
    studyTime: savedDiscovery.studyTime || preferences.study_time || '',
    targetRole: savedDiscovery.targetRole || preferences.target_role || '',
    priorities: savedDiscovery.priorities || preferences.priorities || [],
    background: preferences.background || preferences.experience_level || savedDiscovery.background || '',
    confirmedPath: selected.role_title || selected.selected_role || savedDiscovery.confirmedPath || '',
    selectedRole: selected.selected_role || selected.role_title || savedDiscovery.selectedRole || '',
  }

  let learningProgress = null
  if (planResult.data?.id) {
    const { data, error } = await client.from('lesson_progress')
      .select('task_id,lesson_id,completed')
      .eq('user_id', userId)
      .eq('learning_plan_id', planResult.data.id)
    throwQueryError(error, 'Lesson progress could not be loaded.')
    const rows = Array.isArray(data) ? data : []
    learningProgress = normalizeCareerLearningProgress({
      ...planResult.data.plan_data,
      learningPlanId: planResult.data.id,
      currentWeek: planResult.data.plan_data?.currentWeek,
      completedTaskIds: rows.filter((row) => row.completed).map((row) => row.task_id || row.lesson_id).filter(Boolean),
      startedTaskIds: rows.map((row) => row.task_id || row.lesson_id).filter(Boolean),
    })
  }

  return {
    careerDiscovery,
    learningPlan: planResult.data,
    learningProgress,
    hasSavedCareerData: Boolean(preferencesResult.data || selectedResult.data || planResult.data),
  }
}

export async function saveCareerPreferences(userId, careerDiscovery) {
  const { client } = await getUserClient(userId)
  const row = {
    user_id: userId,
    interests: careerDiscovery.interests || [],
    priorities: careerDiscovery.priorities || [],
    background: careerDiscovery.background || '',
    experience_level: careerDiscovery.background || '',
    education: careerDiscovery.education || '',
    technologies: careerDiscovery.technologies || [],
    study_time: careerDiscovery.studyTime || '',
    goal: careerDiscovery.goal || '',
    timeline: careerDiscovery.timeline || '',
    target_role: careerDiscovery.targetRole || careerDiscovery.confirmedPath || careerDiscovery.selectedRole || '',
    updated_at: new Date().toISOString(),
  }
  const { error } = await client.from('career_preferences').upsert(row, { onConflict: 'user_id' })
  throwQueryError(error, 'Career preferences could not be saved.')
}

export async function saveConfirmedCareerPath(userId, careerDiscovery) {
  const { client } = await getUserClient(userId)
  const title = careerDiscovery.confirmedPath || careerDiscovery.selectedRole || careerDiscovery.targetRole
  if (!title) throw new Error('Choose a career path before saving your learning plan.')
  await saveCareerPreferences(userId, careerDiscovery)

  const pathId = roleKey(title)
  const { error: pathError } = await client.from('selected_career_paths').upsert({
    user_id: userId,
    path_id: pathId,
    role_id: pathId,
    role_title: title,
    selected_role: title,
    selected_path: title,
    discovery_data: careerDiscovery,
    created_at: new Date().toISOString(),
  }, { onConflict: 'user_id,path_id' })
  throwQueryError(pathError, 'Selected career path could not be saved.')

  const { data, error } = await client.from('learning_plans').upsert({
    user_id: userId,
    career_path_id: pathId,
    target_role: title,
    plan_data: { ...careerDiscovery, currentWeek: 1 },
    duration_weeks: durationWeeks(careerDiscovery.timeline),
    status: 'active',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,career_path_id' }).select('id').single()
  throwQueryError(error, 'Personalized learning plan could not be saved.')
  return { learningPlanId: data.id }
}

export async function saveLearningProgress(userId, learningPlanId, progress) {
  const { client } = await getUserClient(userId)
  if (!learningPlanId) throw new Error('No saved learning plan is associated with this progress.')
  const completed = new Set(Array.isArray(progress.completedTaskIds) ? progress.completedTaskIds : [])
  const started = new Set([...(Array.isArray(progress.startedTaskIds) ? progress.startedTaskIds : []), ...completed])
  if (!started.size) return

  const { data: existingRows, error: existingError } = await client.from('lesson_progress')
    .select('task_id,completed,completed_at')
    .eq('user_id', userId)
    .eq('learning_plan_id', learningPlanId)
  throwQueryError(existingError, 'Existing lesson progress could not be loaded.')

  const existingProgressByTask = new Map((existingRows || []).map((row) => [row.task_id, row]))
  const now = new Date().toISOString()
  const rows = [...started]
    .filter((taskId) => completed.has(taskId) || !existingProgressByTask.get(taskId)?.completed)
    .map((taskId) => ({
      user_id: userId,
      learning_plan_id: learningPlanId,
      task_id: taskId,
      lesson_id: taskId,
      completed: completed.has(taskId),
      completed_at: completed.has(taskId) ? existingProgressByTask.get(taskId)?.completed_at || now : null,
      updated_at: now,
    }))
  if (!rows.length) return
  const { error } = await client.from('lesson_progress').upsert(rows, { onConflict: 'user_id,learning_plan_id,task_id' })
  throwQueryError(error, 'Lesson progress could not be saved.')
}

export async function loadPracticeAttempts(userId) {
  const { client } = await getUserClient(userId)
  const { data, error } = await client.from('practice_attempts')
    .select('attempt_id,language,topic,score,total_questions,answers,attempt_data,created_at,updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  throwQueryError(error, 'Practice attempts could not be loaded.')
  return (data || []).map((row) => {
    const detail = row.attempt_data && typeof row.attempt_data === 'object' ? row.attempt_data : {}
    return {
      ...detail,
      id: row.attempt_id,
      type: detail.type || (row.language ? 'coding' : 'mcq'),
      subject: row.topic,
      language: row.language || '',
      score: row.score,
      totalQuestions: row.total_questions,
      answers: row.answers || {},
      completedQuestionIds: Array.isArray(detail.completedQuestionIds) ? detail.completedQuestionIds : [],
      answeredQuestionIds: Array.isArray(detail.answeredQuestionIds) ? detail.answeredQuestionIds : [],
      completedAt: row.created_at,
    }
  })
}

export async function savePracticeAttempts(userId, attempts) {
  const { client } = await getUserClient(userId)
  const rows = (Array.isArray(attempts) ? attempts : []).filter((attempt) => (
    attempt
    && attempt.id
    && typeof attempt.completedAt === 'string'
    && Number.isFinite(Date.parse(attempt.completedAt))
    && !['in-progress', 'timed-out'].includes(attempt.status)
  )).map((attempt) => {
    const isCoding = attempt.type === 'coding'
    const answers = isCoding
      ? { answeredQuestionIds: attempt.answeredQuestionIds || [] }
      : attempt.answers || {}
    const completedQuestionIds = Array.isArray(attempt.completedQuestionIds)
      ? attempt.completedQuestionIds
      : isCoding ? attempt.answeredQuestionIds || [] : Object.keys(attempt.answers || {})
    return {
      user_id: userId,
      attempt_id: String(attempt.id),
      language: attempt.language || '',
      topic: String(attempt.subject || attempt.topic || 'Practice'),
      score: Number.isFinite(attempt.score) ? attempt.score : null,
      total_questions: Number.isFinite(attempt.totalQuestions) ? attempt.totalQuestions : Array.isArray(attempt.questions) ? attempt.questions.length : 0,
      answers,
      attempt_data: {
        type: isCoding ? 'coding' : 'mcq',
        completedQuestionIds,
        answeredQuestionIds: attempt.answeredQuestionIds || [],
        elapsedSeconds: Number.isFinite(attempt.elapsedSeconds) ? attempt.elapsedSeconds : null,
      },
      created_at: new Date(attempt.completedAt).toISOString(),
      updated_at: new Date().toISOString(),
    }
  })
  if (!rows.length) return
  const { error } = await client.from('practice_attempts').upsert(rows, { onConflict: 'user_id,attempt_id' })
  throwQueryError(error, 'Practice attempts could not be saved.')
}

export async function loadCareerProjects(userId) {
  const { client } = await getUserClient(userId)
  const { data, error } = await client.from('user_projects')
    .select('project_id,status,milestones,progress,attempt_data,project_data,created_at,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  throwQueryError(error, 'Saved projects could not be loaded.')
  const rows = Array.isArray(data) ? data : []
  return {
    savedProjectIds: rows.filter((row) => row.status === 'saved' || row.project_data?.saved === true).map((row) => row.project_id),
    attempts: rows.map((row) => row.attempt_data).filter((attempt) => attempt && typeof attempt === 'object' && attempt.id),
  }
}

export async function saveCareerProjects(userId, session) {
  const { client } = await getUserClient(userId)
  const savedIds = new Set(session.savedProjectIds || [])
  const attemptsByProject = new Map((session.attempts || []).map((attempt) => [attempt.projectId, attempt]))
  const projectIds = new Set([...savedIds, ...attemptsByProject.keys()])
  const { data: existing, error: existingError } = await client.from('user_projects')
    .select('project_id,status')
    .eq('user_id', userId)
  throwQueryError(existingError, 'Existing project records could not be checked.')

  const removableIds = (existing || [])
    .filter((row) => row.status === 'saved' && !projectIds.has(row.project_id))
    .map((row) => row.project_id)
  if (removableIds.length) {
    const { error } = await client.from('user_projects').delete().eq('user_id', userId).in('project_id', removableIds).eq('status', 'saved')
    throwQueryError(error, 'Removed saved projects could not be synchronized.')
  }

  const now = new Date().toISOString()
  const rows = [...projectIds].map((projectId) => {
    const attempt = attemptsByProject.get(projectId) || null
    return {
      user_id: userId,
      project_id: projectId,
      status: attempt?.status || 'saved',
      milestones: attempt?.milestoneIds || [],
      progress: { milestoneIds: attempt?.milestoneIds || [], checkedCriteria: attempt?.checkedCriteria || {}, setupChecks: attempt?.setupChecks || [], reviewChecks: attempt?.reviewChecks || [] },
      attempt_data: attempt || {},
      project_data: { saved: savedIds.has(projectId) },
      created_at: attempt?.createdAt || now,
      updated_at: attempt?.updatedAt || now,
    }
  })
  if (rows.length) {
    const { error } = await client.from('user_projects').upsert(rows, { onConflict: 'user_id,project_id' })
    throwQueryError(error, 'Project progress could not be saved.')
  }
}

export async function loadSavedJobs(userId) {
  const { client } = await getUserClient(userId)
  const { data, error } = await client.from('saved_jobs')
    .select('job_id,title,company,source,source_url,original_url,job_data,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  throwQueryError(error, 'Saved jobs could not be loaded.')
  return data || []
}

export async function saveJobBookmark(userId, job) {
  const { client, user } = await getUserClient(userId)
  if (!job || !job.id) throw new Error('A stable job identifier is required to save this job.')

  const jobId = String(job.id).trim()
  const isSample = job.isSample === true
  if (!jobId || (isSample && !jobId.startsWith('sample-'))) {
    throw new Error('Sample jobs must use their stable sample identifier before they can be saved.')
  }

  let originalUrl = ''
  if (!isSample) {
    if (job.isSample !== false || job.verifiedSource !== true || !job.originalUrl) {
      throw new Error('Only verified provider listings with an original application URL can be saved to your account.')
    }
    try {
      originalUrl = new URL(job.originalUrl)
    } catch {
      throw new Error('The provider application URL is invalid and this job was not saved.')
    }
    if (!['http:', 'https:'].includes(originalUrl.protocol) || !originalUrl.hostname || originalUrl.username || originalUrl.password) {
      throw new Error('The provider application URL is invalid and this job was not saved.')
    }
    originalUrl = originalUrl.href
  }

  const { data, error } = await client.from('saved_jobs').upsert({
    user_id: user.id,
    job_id: jobId,
    title: String(job.title || ''),
    company: String(job.company || ''),
    source: String(job.source || ''),
    source_url: isSample ? '' : String(job.sourceUrl || originalUrl),
    original_url: originalUrl,
    job_data: { ...job, id: jobId, originalUrl },
  }, { onConflict: 'user_id,job_id' }).select('user_id,job_id').single()
  throwQueryError(error, 'Job could not be saved.')
  if (data.user_id !== user.id || data.job_id !== jobId) {
    throw new Error('Supabase did not confirm this job was saved to your account.')
  }
}

export async function removeJobBookmark(userId, jobId) {
  const { client } = await getUserClient(userId)
  const { error } = await client.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', String(jobId))
  throwQueryError(error, 'Saved job could not be removed.')
}

export async function loadJobApplications(userId) {
  const { client } = await getUserClient(userId)
  const { data, error } = await client.from('job_applications')
    .select('application_record_id,job_id,job_title,company,location,status,applied_at,created_at,updated_at,notes,application_data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  throwApplicationQueryError(error, 'Job application records could not be loaded.')
  const rows = data || []
  const recordIds = rows.map((row) => row.application_record_id)
  let historyByApplication = new Map()
  if (recordIds.length > 0) {
    const { data: historyRows, error: historyError } = await client.from('application_status_history')
      .select('id,application_id,previous_status,new_status,changed_at,source,event_type,note,follow_up_date,assessment_at,interview_at')
      .eq('application_kind', 'external')
      .in('application_id', recordIds)
      .order('changed_at', { ascending: true })
    throwApplicationQueryError(historyError, 'Application status history could not be loaded.')
    historyByApplication = (historyRows || []).reduce((history, entry) => {
      const current = history.get(entry.application_id) || []
      current.push({
        id: entry.id,
        previousStatus: entry.previous_status,
        newStatus: entry.new_status,
        changedAt: entry.changed_at,
        source: entry.source,
        eventType: entry.event_type,
        note: entry.note,
        followUpDate: entry.follow_up_date,
        assessmentAt: entry.assessment_at,
        interviewAt: entry.interview_at,
      })
      history.set(entry.application_id, current)
      return history
    }, new Map())
  }
  return rows.map((row) => {
    const details = row.application_data && typeof row.application_data === 'object' ? row.application_data : {}
    return {
      ...details,
      id: row.job_id,
      jobId: row.job_id,
      applicationRecordId: row.application_record_id,
      title: row.job_title || details.title || '',
      company: row.company || details.company || '',
      location: row.location || details.location || '',
      employmentType: details.employmentType || '',
      status: row.status || '',
      appliedAt: row.applied_at || details.appliedAt || '',
      createdAt: row.created_at || '',
      notes: row.notes || details.notes || '',
      statusHistory: historyByApplication.get(row.application_record_id) || [],
      jobUrl: details.jobUrl || (String(row.job_id).startsWith('http') ? row.job_id : ''),
    }
  })
}

export async function saveJobApplication(userId, application) {
  const { client } = await getUserClient(userId)
  const status = application.status
  if (!application.jobId || typeof application.jobUrl !== 'string') {
    throw new Error('A saved application requires a job identifier and original job URL.')
  }
  if (!applicationStatuses.some((item) => item.value === status)) {
    throw new Error('Choose a valid application lifecycle status.')
  }
  if (application.sourceType === 'himalayas'
    && status === 'applied'
    && application.externalTrackingStatus !== 'user_confirmed_submitted') {
    throw new Error('Confirm the external submission in Prepare Application before marking it as submitted.')
  }
  let originalUrl
  try {
    originalUrl = new URL(application.jobUrl)
  } catch {
    throw new Error('A valid original job URL is required to save an application record.')
  }
  if (!['http:', 'https:'].includes(originalUrl.protocol) || !originalUrl.hostname) {
    throw new Error('A valid HTTP or HTTPS job URL is required to save an application record.')
  }
  const { error } = await client.from('job_applications').upsert({
    user_id: userId,
    job_id: String(application.jobId),
    job_title: application.title,
    company: application.company,
    location: application.location || '',
    status,
    applied_at: application.appliedAt || null,
    notes: application.notes || '',
    application_data: { ...application, jobUrl: originalUrl.href },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,job_id' })
  throwApplicationQueryError(error, 'Job application record could not be saved.')
}