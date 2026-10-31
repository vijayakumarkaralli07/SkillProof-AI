import { createClient } from 'npm:@supabase/supabase-js@2'

const API_URL = 'https://himalayas.app/jobs/api/search'
const MAX_BODY_BYTES = 8_000
const MAX_QUERY_LENGTH = 160
const MAX_FILTER_LENGTH = 80
const MAX_PAGE = 1_000
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const allowedEmploymentTypes = new Set(['Full Time', 'Part Time', 'Contract', 'Contractor', 'Internship', 'Freelance'])

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim()
  if (!cleaned || cleaned.length > maxLength || [...cleaned].some((character) => {
    const code = character.codePointAt(0) ?? 0
    return code < 32 || code === 127
  })) return undefined
  return cleaned
}

function safeOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() && value === value.trim() ? value : undefined
}

function normalizeJob(value: unknown) {
  if (!isRecord(value)) return null
  const guid = cleanString(value.guid, 300)
  const title = cleanString(value.title, 300)
  const companyName = cleanString(value.companyName, 300)
  if (!guid || !title || !companyName) return null
  const locationRestrictions = Array.isArray(value.locationRestrictions)
    ? value.locationRestrictions.filter((location): location is string => typeof location === 'string')
    : undefined
  const seniority = Array.isArray(value.seniority)
    ? value.seniority.filter((level): level is string => typeof level === 'string')
    : typeof value.seniority === 'string' ? [value.seniority] : undefined
  return {
    guid,
    title,
    companyName,
    companyLogo: safeOptionalString(value.companyLogo),
    excerpt: safeOptionalString(value.excerpt),
    description: safeOptionalString(value.description),
    locationRestrictions,
    categories: Array.isArray(value.categories)
      ? value.categories.filter((category): category is string => typeof category === 'string')
      : undefined,
    employmentType: safeOptionalString(value.employmentType),
    seniority,
    minSalary: typeof value.minSalary === 'number' && Number.isFinite(value.minSalary) ? value.minSalary : undefined,
    maxSalary: typeof value.maxSalary === 'number' && Number.isFinite(value.maxSalary) ? value.maxSalary : undefined,
    currency: safeOptionalString(value.currency),
    salaryPeriod: safeOptionalString(value.salaryPeriod),
    pubDate: typeof value.pubDate === 'number' && Number.isFinite(value.pubDate) ? value.pubDate : undefined,
    applicationLink: safeOptionalString(value.applicationLink),
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return jsonResponse({ error: 'Sign in to search jobs.' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  let supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  if (!supabaseKey && publishableKeys) {
    try {
      const parsedKeys: unknown = JSON.parse(publishableKeys)
      if (isRecord(parsedKeys) && typeof parsedKeys.default === 'string') supabaseKey = parsedKeys.default
    } catch {
      return jsonResponse({ error: 'Authentication service keys are misconfigured.' }, 503)
    }
  }
  if (!supabaseUrl || !supabaseKey) return jsonResponse({ error: 'Authentication service is not configured.' }, 503)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return jsonResponse({ error: 'Your session is invalid or expired. Sign in again.' }, 401)

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) return jsonResponse({ error: 'Search filters are too large.' }, 413)

  let body: unknown
  try {
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return jsonResponse({ error: 'Search filters are too large.' }, 413)
    body = JSON.parse(raw)
  } catch {
    return jsonResponse({ error: 'Request must contain valid JSON search filters.' }, 400)
  }
  if (!isRecord(body)) return jsonResponse({ error: 'Search filters must be a JSON object.' }, 400)

  const unknownFields = Object.keys(body).filter((key) => !['q', 'country', 'seniority', 'employmentType', 'page'].includes(key))
  if (unknownFields.length) return jsonResponse({ error: `Unsupported search filter: ${unknownFields[0]}.` }, 400)

  const q = body.q === undefined ? '' : cleanString(body.q, MAX_QUERY_LENGTH)
  const country = body.country === undefined || body.country === '' ? '' : cleanString(body.country, MAX_FILTER_LENGTH)
  const seniority = body.seniority === undefined || body.seniority === '' ? '' : cleanString(body.seniority, MAX_FILTER_LENGTH)
  const employmentType = body.employmentType === undefined || body.employmentType === '' ? '' : cleanString(body.employmentType, MAX_FILTER_LENGTH)
  const page = body.page === undefined ? 1 : body.page
  if (body.q !== undefined && body.q !== '' && q === undefined) return jsonResponse({ error: `Keyword must be 1-${MAX_QUERY_LENGTH} characters.` }, 400)
  if (body.country !== undefined && body.country !== '' && country === undefined) return jsonResponse({ error: 'Country must be a valid text value of 80 characters or fewer.' }, 400)
  if (body.seniority !== undefined && body.seniority !== '' && seniority === undefined) return jsonResponse({ error: 'Seniority must be a valid text value of 80 characters or fewer.' }, 400)
  if (body.employmentType !== undefined && body.employmentType !== '' && (employmentType === undefined || !allowedEmploymentTypes.has(employmentType))) {
    return jsonResponse({ error: 'Choose a valid employment type such as Full Time, Part Time, Contract, Contractor, Internship, or Freelance.' }, 400)
  }
  if (typeof page !== 'number' || !Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
    return jsonResponse({ error: `Page must be a whole number between 1 and ${MAX_PAGE}.` }, 400)
  }

  const upstreamUrl = new URL(API_URL)
  if (q) upstreamUrl.searchParams.set('q', q)
  if (country) upstreamUrl.searchParams.set('country', country)
  if (seniority) upstreamUrl.searchParams.set('seniority', seniority)
  if (employmentType) upstreamUrl.searchParams.set('employment_type', employmentType)
  upstreamUrl.searchParams.set('page', String(page))

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return jsonResponse({ error: 'Himalayas job search timed out or is temporarily unavailable. Retry in a moment.' }, 503)
  }
  if (upstream.status === 429) {
    const retryAfter = upstream.headers.get('Retry-After')
    return jsonResponse({
      error: 'Himalayas rate limit reached. Please wait before searching again.',
      retryAfterSeconds: retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : undefined,
    }, 429)
  }
  if (!upstream.ok) return jsonResponse({ error: `Himalayas job search failed with status ${upstream.status}. Please retry later.` }, 502)

  let payload: unknown
  try {
    payload = await upstream.json()
  } catch {
    return jsonResponse({ error: 'Himalayas returned an invalid response. Please retry later.' }, 502)
  }
  if (!isRecord(payload) || !Array.isArray(payload.jobs)) return jsonResponse({ error: 'Himalayas returned an unexpected job-search response.' }, 502)

  const jobs = payload.jobs.map(normalizeJob)
  if (jobs.some((job) => job === null)) return jsonResponse({ error: 'Himalayas returned a job with missing required fields.' }, 502)
  return jsonResponse({
    jobs,
    page,
    limit: typeof payload.limit === 'number' && Number.isInteger(payload.limit) ? payload.limit : 20,
    totalCount: typeof payload.totalCount === 'number' && Number.isFinite(payload.totalCount) ? payload.totalCount : undefined,
  })
})
