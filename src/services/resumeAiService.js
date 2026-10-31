import { getSupabaseClient } from './supabaseClient'

export const resumeAiPrivacyNotice = 'Your selected resume text will be sent to Google Gemini to generate this suggestion. Google’s free-tier terms say submitted content may be used to improve its products. Avoid sending contact details or other information that is not needed. Continue only if you consent.'

export function removeResumeContactLines(text) {
  return text.split(/\r?\n/).filter((line) => {
    if (/\b(email|phone|mobile|linkedin|portfolio|website|contact)\b|https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[A-Z]{2,}/i.test(line)) return false
    const numberGroups = line.match(/\+?[\d][\d\s().-]{7,}\d/g) ?? []
    return !numberGroups.some((number) => number.replace(/\D/g, '').length >= 10)
  }).join('\n')
}

export async function generateResumeAi(action, input) {
  const client = await getSupabaseClient()
  if (!client) throw new Error('AI resume tools are unavailable because Supabase is not configured.')
  const { data: { session }, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw new Error(`Could not verify your account: ${sessionError.message}`)
  if (!session?.user) throw new Error('Sign in to use AI resume tools.')

  const { data, error } = await client.functions.invoke('resume-ai', { body: { action, input } })
  if (error) {
    let message = error.message || 'The AI resume request failed.'
    let status = error.context?.status
    if (error.context instanceof Response) {
      try {
        const responseBody = await error.context.clone().json()
        if (typeof responseBody?.error === 'string') message = responseBody.error
      } catch {
        // Keep the SDK error when the response is not JSON.
      }
    }
    if (status === 429) throw new Error('Gemini quota is exhausted or the request rate is limited. Please try again later.')
    if (status === 503) throw new Error(`${message} You can continue editing your resume manually.`)
    if (status === 401) throw new Error('Your session could not be authenticated. Sign in again and retry.')
    if (/429|quota|rate.?limit/i.test(message)) throw new Error('Gemini is rate-limited or its quota is exhausted. Please try again later.')
    if (/401|403|unauthori[sz]ed/i.test(message)) throw new Error('Your session could not be authenticated. Sign in again and retry.')
    if (/503|missing.*secret|not configured/i.test(message)) throw new Error('Gemini is not configured on the server. You can continue editing your resume manually.')
    throw new Error(`Gemini could not complete this request: ${message}`)
  }
  if (!data || typeof data !== 'object' || data.error) {
    throw new Error(data?.error || 'Gemini returned an invalid response. Your resume has not been changed.')
  }
  return data
}

export function confirmResumeAiConsent() {
  return window.confirm(resumeAiPrivacyNotice)
}
