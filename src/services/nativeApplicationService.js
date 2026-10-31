import { getSupabaseClient, getSupabaseConfigError } from './supabaseClient.js'
import { getResume } from './resumeService.js'
import { applicationStatuses } from '../constants/applicationLifecycle.js'

const nativeApplicationFields = 'id,job_id,employer_id,applicant_id,applicant_profile,resume_id,resume_title,resume_template,resume_snapshot,cover_letter,answers,job_title,company_name,status,recruiter_note,applicant_note,follow_up_date,assessment_at,interview_at,submitted_at,updated_at'

async function getAuthenticatedClient() {
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError() || 'Supabase is unavailable.')
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('Your signed-in account could not be verified. Sign in again.')
  return { client, user: data.user }
}

function throwQueryError(error, fallback) {
  if (!error) return
  if (['PGRST204', 'PGRST205', '42703', '42P01'].includes(error.code)) {
    throw new Error('Application lifecycle schema is unavailable. Review migrations 20261027000500_application_lifecycle.sql and 20261027000600_analytics_follow_up_events.sql, then apply pending migrations with "npx supabase db push --linked".')
  }
  if (error.code === 'PGRST116') throw new Error(fallback)
  throw new Error(error.message || fallback)
}

function mapApplication(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    employerId: row.employer_id,
    applicantId: row.applicant_id,
    jobTitle: row.job_title,
    companyName: row.company_name,
    applicant: row.applicant_profile,
    resumeId: row.resume_id,
    resumeTitle: row.resume_title,
    resumeTemplate: row.resume_template,
    resume: row.resume_snapshot,
    coverLetter: row.cover_letter,
    answers: row.answers,
    status: row.status,
    recruiterNote: row.recruiter_note,
    applicantNote: row.applicant_note || '',
    followUpDate: row.follow_up_date || '',
    assessmentAt: row.assessment_at || '',
    interviewAt: row.interview_at || '',
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  }
}

async function loadNativeStatusHistory(client, applications) {
  const ids = applications.map((application) => application.id)
  if (ids.length === 0) return applications
  const { data, error } = await client.from('application_status_history')
    .select('id,application_id,previous_status,new_status,changed_at,source,event_type,note,follow_up_date,assessment_at,interview_at')
    .eq('application_kind', 'native')
    .in('application_id', ids)
    .order('changed_at', { ascending: true })
  throwQueryError(error, 'Application status history could not be loaded.')
  const historyByApplication = (data || []).reduce((history, entry) => {
    const records = history.get(entry.application_id) || []
    records.push({
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
    history.set(entry.application_id, records)
    return history
  }, new Map())
  return applications.map((application) => ({
    ...application,
    statusHistory: historyByApplication.get(application.id) || [],
  }))
}

export async function listOpenNativeJobs() {
  const { client } = await getAuthenticatedClient()
  const { data, error } = await client
    .from('native_jobs')
    .select('id,employer_id,title,company_name,location,employment_type,description,required_fields,created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  throwQueryError(error, 'SkillProof AI jobs could not be loaded.')
  return data || []
}

export async function submitNativeApplication({ jobId, resumeId, applicantProfile, coverLetter = '', answers = {}, resumeReviewed }) {
  const { client, user } = await getAuthenticatedClient()
  const name = typeof applicantProfile?.name === 'string' ? applicantProfile.name.trim() : ''
  const email = typeof applicantProfile?.email === 'string' ? applicantProfile.email.trim() : ''
  if (!name || !email || email.toLowerCase() !== String(user.email || '').toLowerCase()) {
    throw new Error('Your profile name and signed-in account email are required before applying.')
  }
  if (typeof coverLetter !== 'string' || coverLetter.length > 20000) throw new Error('Cover letter must be 20,000 characters or fewer.')
  if (!resumeReviewed) throw new Error('Review the selected saved resume before submitting.')

  const { data: job, error: jobError } = await client
    .from('native_jobs')
    .select('id,employer_id,status')
    .eq('id', jobId)
    .eq('status', 'open')
    .single()
  throwQueryError(jobError, 'This job is no longer accepting applications.')

  const resume = await getResume(resumeId)
  if (!resume.content || typeof resume.content !== 'object' || Array.isArray(resume.content)) {
    throw new Error('The selected saved resume has invalid content. Choose another resume.')
  }

  const { data, error } = await client
    .from('native_job_applications')
    .insert({
      job_id: job.id,
      employer_id: job.employer_id,
      applicant_id: user.id,
      applicant_profile: { name, email: user.email, phone: String(applicantProfile.phone || '').trim() },
      resume_id: resume.id,
      resume_title: resume.name,
      resume_template: resume.templateId,
      resume_snapshot: resume.content,
      resume_reviewed: true,
      cover_letter: coverLetter,
      answers,
    })
    .select(nativeApplicationFields)
    .single()
  if (error?.code === '23505') {
    throw new Error('You have already submitted an application for this job. Check My Applications for its status.')
  }
  throwQueryError(error, 'Your application could not be submitted. Your form data is still available to retry.')
  return mapApplication(data)
}

export async function listMyNativeApplications() {
  const { client, user } = await getAuthenticatedClient()
  const { data, error } = await client
    .from('native_job_applications')
    .select(nativeApplicationFields)
    .eq('applicant_id', user.id)
    .order('submitted_at', { ascending: false })
  throwQueryError(error, 'Your SkillProof AI applications could not be loaded.')
  return loadNativeStatusHistory(client, (data || []).map(mapApplication))
}

export async function listEmployerNativeApplications() {
  const { client, user } = await getAuthenticatedClient()
  const { data, error } = await client
    .from('native_job_applications')
    .select(nativeApplicationFields)
    .eq('employer_id', user.id)
    .order('submitted_at', { ascending: false })
  throwQueryError(error, 'Recruiter applications could not be loaded.')
  return loadNativeStatusHistory(client, (data || []).map(mapApplication))
}

export async function updateEmployerApplication(id, { status, recruiterNote = '' }) {
  const { client, user } = await getAuthenticatedClient()
  if (!applicationStatuses.some((item) => item.value === status)) throw new Error('Choose a valid application status.')
  if (typeof recruiterNote !== 'string' || recruiterNote.length > 5000) throw new Error('Recruiter note must be 5,000 characters or fewer.')
  const { data, error } = await client
    .from('native_job_applications')
    .update({ status, recruiter_note: recruiterNote })
    .eq('id', id)
    .eq('employer_id', user.id)
    .select('id')
    .maybeSingle()
  throwQueryError(error, 'Application status could not be updated.')
  if (!data) throw new Error('This application is not assigned to your recruiter account.')
}

export async function updateApplicantNativeApplication(id, { status, applicantNote, followUpDate, assessmentAt, interviewAt }) {
  const { client, user } = await getAuthenticatedClient()
  if (!applicationStatuses.some((item) => item.value === status)) throw new Error('Choose a valid application status.')
  if (typeof applicantNote !== 'string' || applicantNote.length > 5000) throw new Error('Private note must be 5,000 characters or fewer.')

  const { data, error } = await client.from('native_job_applications')
    .update({
      status,
      applicant_note: applicantNote,
      follow_up_date: followUpDate || null,
      assessment_at: assessmentAt || null,
      interview_at: interviewAt || null,
    })
    .eq('id', id)
    .eq('applicant_id', user.id)
    .select('id')
    .maybeSingle()
  throwQueryError(error, 'Application status could not be updated.')
  if (!data) throw new Error('This application does not belong to your authenticated account.')
}
