import { getSupabaseClient, getSupabaseConfigError } from './supabaseClient.js'

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

async function getResponseError(error) {
  let message = error.message || 'Live job search failed.'
  const status = error.context?.status
  if (error.context instanceof Response) {
    try {
      const body = await error.context.clone().json()
      if (typeof body?.error === 'string') message = body.error
    } catch {
      // Keep the Supabase SDK error if the response is not JSON.
    }
  }
  if (status === 401) return new Error('Your session expired. Sign in again to search jobs.')
  if (status === 429) return new Error(message || 'The job provider is rate limiting searches. Please wait and retry.')
  return new Error(message)
}

function normalizeJob(job) {
  if (!isRecord(job) || typeof job.guid !== 'string' || typeof job.title !== 'string' || typeof job.companyName !== 'string') {
    throw new Error('The job search returned an invalid listing. Please retry.')
  }
  return {
    ...job,
    id: job.guid,
    title: job.title,
    company: job.companyName,
    companyLogo: typeof job.companyLogo === 'string' ? job.companyLogo : '',
    location: Array.isArray(job.locationRestrictions)
      ? job.locationRestrictions.length ? job.locationRestrictions.join(', ') : 'Worldwide'
      : 'Location not specified',
    seniority: Array.isArray(job.seniority) ? job.seniority : [],
    employmentType: typeof job.employmentType === 'string' ? job.employmentType : '',
    workArrangement: 'Remote',
    postedDaysAgo: Number.isFinite(job.pubDate) ? Math.max(0, Math.floor((Date.now() / 1000 - job.pubDate) / 86_400)) : null,
    description: typeof job.excerpt === 'string' ? job.excerpt : '',
    skills: Array.isArray(job.categories) ? job.categories.filter((category) => typeof category === 'string') : [],
    source: 'Himalayas',
    sourceUrl: 'https://himalayas.app/docs/remote-jobs-api',
    originalUrl: typeof job.applicationLink === 'string' ? job.applicationLink : null,
    verifiedSource: true,
    isSample: false,
  }
}

export async function searchHimalayasJobs({ q = '', country = '', seniority = '', employmentType = '', page = 1 } = {}) {
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError() || 'Supabase is unavailable.')
  const { data: { session }, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw new Error(`Could not verify your account: ${sessionError.message}`)
  if (!session?.user) throw new Error('Sign in to search live jobs.')

  const { data, error } = await client.functions.invoke('jobs-search', {
    body: { q, country, seniority, employmentType, page },
  })
  if (error) throw await getResponseError(error)
  if (!isRecord(data) || !Array.isArray(data.jobs) || !Number.isInteger(data.page)) {
    throw new Error('Live job search returned an invalid response. Please retry.')
  }
  return {
    jobs: data.jobs.map(normalizeJob),
    page: data.page,
    totalCount: Number.isFinite(data.totalCount) ? data.totalCount : null,
    limit: Number.isInteger(data.limit) ? data.limit : 20,
  }
}
