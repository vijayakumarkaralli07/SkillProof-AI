import { getSupabaseClient, getSupabaseConfigError } from './supabaseClient.js'
import {
  calculateAnalytics,
  normalizeAnalyticsApplications,
  normalizeAnalyticsSavedJobs,
} from './analyticsCalculations.js'

const pageSize = 1000

function throwQueryError(error, fallback) {
  if (!error) return
  if (['PGRST204', 'PGRST205', '42703', '42P01'].includes(error.code)) {
    throw new Error(`Analytics requires the application lifecycle and follow-up history schema. Review migrations 20261027000500_application_lifecycle.sql and 20261027000600_analytics_follow_up_events.sql, then apply pending migrations with "npx supabase db push --linked". ${fallback}`)
  }
  throw new Error(error.message || fallback)
}

async function loadAllRows(queryFactory, fallback) {
  const rows = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await queryFactory().range(from, from + pageSize - 1)
    throwQueryError(error, fallback)
    rows.push(...(data || []))
    if (!data || data.length < pageSize) return rows
  }
}

export async function loadUserAnalytics(userId) {
  if (!userId) throw new Error('Sign in to view your analytics.')
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError() || 'Supabase is unavailable.')

  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError || !authData?.user || authData.user.id !== userId) {
    throw new Error('Your signed-in account could not be verified. Sign in again.')
  }

  const [externalRows, nativeRows, historyRows, savedRows, profileResult] = await Promise.all([
    loadAllRows(() => client.from('job_applications')
      .select('application_record_id,job_id,job_title,company,status,applied_at,source_type:application_data->>sourceType,source_name:application_data->>source,skills:application_data->skills,categories:application_data->categories,stored_title:application_data->>title,stored_company:application_data->>company')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }), 'Your tracked applications could not be loaded.'),
    loadAllRows(() => client.from('native_job_applications')
      .select('id,job_id,job_title,company_name,status,submitted_at')
      .eq('applicant_id', userId)
      .order('submitted_at', { ascending: true }), 'Your SkillProof AI applications could not be loaded.'),
    loadAllRows(() => client.from('application_status_history')
      .select('id,application_kind,application_id,previous_status,new_status,changed_at,source,event_type,follow_up_date')
      .eq('applicant_id', userId)
      .order('changed_at', { ascending: true }), 'Your application history could not be loaded.'),
    loadAllRows(() => client.from('saved_jobs')
      .select('job_id,skills:job_data->skills,categories:job_data->categories')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }), 'Your saved jobs could not be loaded.'),
    client.from('profiles')
      .select('skills:profile_data->skills')
      .eq('user_id', userId)
      .maybeSingle(),
  ])
  throwQueryError(profileResult.error, 'Your saved profile skills could not be loaded.')

  const profileSkills = Array.isArray(profileResult.data?.skills)
    ? profileResult.data.skills.filter((skill) => typeof skill === 'string').map((skill) => skill.trim()).filter(Boolean)
    : []
  const applications = normalizeAnalyticsApplications({ externalRows, nativeRows, historyRows })
  const savedJobs = normalizeAnalyticsSavedJobs(savedRows)
  return calculateAnalytics({ applications, savedJobs, profileSkills })
}
