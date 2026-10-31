import { getSupabaseClient } from './supabaseClient'

const maxFileSize = 5 * 1024 * 1024
const supportedFiles = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}
const requiredSectionLabels = [
  'Contact Information',
  'Professional Summary',
  'Work Experience',
  'Skills',
  'Education',
  'Projects',
  'Certifications',
]
const requiredBreakdownLabels = [
  'Keyword coverage',
  'Structure and readability',
  'Experience clarity',
  'Skills presentation',
]

export const resumeScanPrivacyNotice = 'Your selected resume file will be sent securely to the SkillProof AI server and then to Google Gemini for analysis. Google’s free-tier terms say submitted content may be used to improve its products. The file is processed temporarily and is not retained by this scanner. Scan only if you consent.'

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isValidScore(value) {
  return value === null || (Number.isInteger(value) && value >= 0 && value <= 100)
}

function getScanStorageError(error, operation) {
  if (error.code === 'PGRST116') {
    return new Error('The scan could not be found or you do not have permission to change it.')
  }
  if (error.code === 'PGRST205' || error.code === '42P01') {
    return new Error('Resume scan history is not configured in Supabase yet. Apply the pending resume persistence migration before trying again.')
  }
  return new Error(`Could not ${operation} resume scan history: ${error.message}`)
}

function mapScan(row) {
  return {
    id: row.id,
    resumeId: row.resume_id,
    fileName: row.file_name,
    fileType: row.file_type,
    status: row.status,
    score: row.ats_score,
    report: row.report,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getAuthenticatedClient(operation) {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Resume scanning is unavailable because Supabase is not configured.')
  const { data: { session }, error } = await client.auth.getSession()
  if (error) throw new Error(`Could not verify your account: ${error.message}`)
  if (!session?.user) throw new Error(`Sign in to ${operation} resume scans.`)
  return { client, user: session.user }
}

export async function listResumeScans() {
  const { client } = await getAuthenticatedClient('load')
  const { data, error } = await client
    .from('resume_scans')
    .select('id, resume_id, file_name, file_type, status, ats_score, report, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw getScanStorageError(error, 'load')
  return data.map(mapScan)
}

export async function deleteResumeScan(id) {
  const { client } = await getAuthenticatedClient('delete')
  const { data, error } = await client
    .from('resume_scans')
    .delete()
    .eq('id', id)
    .select('id')
    .single()
  if (error) throw getScanStorageError(error, 'delete')
  if (!data) throw new Error('The scan could not be found or you do not have permission to delete it.')
}

function validateAnalysis(result, file) {
  if (!isRecord(result) || !isRecord(result.overview) || !isRecord(result.keywords)
    || !Array.isArray(result.sections) || !Array.isArray(result.recommendations)
    || !isRecord(result.metadata)) throw new Error('Gemini returned an incomplete analysis. Your results were not displayed; please retry.')
  const { overview, keywords, metadata } = result
  if (!isValidScore(overview.score)
    || typeof overview.scoringMethod !== 'string'
    || !Array.isArray(overview.strengths) || overview.strengths.some((item) => typeof item !== 'string')
    || !Array.isArray(overview.improvements) || overview.improvements.some((item) => typeof item !== 'string')
    || !Array.isArray(overview.breakdown) || overview.breakdown.length !== requiredBreakdownLabels.length
    || (overview.score === null && typeof overview.limitation !== 'string')) {
    throw new Error('Gemini returned an invalid score or overview. Please retry the scan.')
  }
  const breakdownLabels = new Set(overview.breakdown.map((item) => item?.label))
  if (requiredBreakdownLabels.some((label) => !breakdownLabels.has(label))
    || overview.breakdown.some((item) => !isRecord(item) || !isValidScore(item.score))) {
    throw new Error('Gemini returned an invalid score breakdown. Please retry the scan.')
  }
  if (!Array.isArray(keywords.found) || !Array.isArray(keywords.potentiallyMissing)
    || typeof keywords.disclaimer !== 'string'
    || keywords.found.some((item) => typeof item !== 'string')
    || keywords.potentiallyMissing.some((item) => !isRecord(item) || typeof item.keyword !== 'string' || typeof item.reason !== 'string')
    || result.sections.length !== requiredSectionLabels.length
    || requiredSectionLabels.some((label) => !result.sections.some((section) => section?.label === label))
    || result.sections.some((section) => !isRecord(section) || !['present', 'missing', 'unclear'].includes(section.status) || !isValidScore(section.score) || typeof section.feedback !== 'string')
    || result.recommendations.some((item) => !isRecord(item) || typeof item.title !== 'string' || typeof item.detail !== 'string')) {
    throw new Error('Gemini returned an invalid analysis structure. Please retry the scan.')
  }
  if (metadata.originalFilename !== file.name
    || typeof metadata.scannedAt !== 'string'
    || metadata.status !== 'completed'
    || metadata.source !== 'uploaded_file'
    || Number.isNaN(Date.parse(metadata.scannedAt))) {
    throw new Error('The scanner could not verify that this report belongs to the selected file. Please retry.')
  }
  return result
}

export function confirmResumeScanConsent() {
  return window.confirm(resumeScanPrivacyNotice)
}

async function getFunctionError(error) {
  let message = error.message || 'Resume scanning failed.'
  const status = error.context?.status
  if (error.context instanceof Response) {
    try {
      const responseBody = await error.context.clone().json()
      if (typeof responseBody?.error === 'string') message = responseBody.error
    } catch {
      // Keep the SDK error when the response is not JSON.
    }
  }
  if (status === 401) return new Error('Your session could not be authenticated. Sign in again and retry.')
  if (status === 413) return new Error(message || 'The selected file is too large to scan. The limit is 5 MB.')
  if (status === 429 || /429|quota|rate.?limit/i.test(message)) {
    return new Error('Gemini quota is exhausted or the request rate is limited. Please try again later.')
  }
  if (status === 503 && /configured|secret/i.test(message)) {
    return new Error('Gemini is not configured on the server. Contact support or try again later.')
  }
  if (/timeout|abort|network|fetch/i.test(message)) {
    return new Error('The scan timed out or the network is unavailable. Your selected file is still available; retry when ready.')
  }
  return new Error(message)
}

async function updateFailedScan(client, scanId, userId, file, message) {
  const report = {
    error: message,
    metadata: {
      originalFilename: file.name,
      scannedAt: new Date().toISOString(),
      status: 'failed',
      source: 'uploaded_file',
    },
  }
  const { data, error } = await client
    .from('resume_scans')
    .update({ status: 'failed', report })
    .eq('id', scanId)
    .eq('user_id', userId)
    .select('id, resume_id, file_name, file_type, status, ats_score, report, created_at, updated_at')
    .single()
  if (error) throw new Error(`${message} The failed scan could not be recorded: ${getScanStorageError(error, 'update').message}`)
  return mapScan(data)
}

export async function scanResume(file, { resumeId = null } = {}) {
  if (!file) throw new Error('Choose a resume file before scanning.')
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!Object.hasOwn(supportedFiles, extension) || file.type !== supportedFiles[extension]) {
    throw new Error('Choose a valid PDF or DOCX file with a matching file type.')
  }
  if (!file.size) throw new Error('The selected file is empty. Choose a non-empty PDF or DOCX file.')
  if (file.size > maxFileSize) throw new Error('File exceeds the 5 MB size limit.')

  let header
  try {
    header = new Uint8Array(await file.slice(0, 1024).arrayBuffer())
  } catch {
    throw new Error('The selected file could not be read. Choose it again and retry.')
  }
  if (extension === '.pdf') {
    const headerText = new TextDecoder().decode(header)
    if (!headerText.includes('%PDF-')) throw new Error('This PDF appears invalid or corrupted. Choose a readable PDF and try again.')
  } else if (header[0] !== 0x50 || header[1] !== 0x4b) {
    throw new Error('This DOCX appears invalid or corrupted. Choose a valid Word document and try again.')
  }

  const { client, user } = await getAuthenticatedClient('scan')
  const { data: pendingRow, error: insertError } = await client
    .from('resume_scans')
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      file_name: file.name,
      file_type: file.type,
      status: 'pending',
      report: {},
    })
    .select('id, resume_id, file_name, file_type, status, ats_score, report, created_at, updated_at')
    .single()
  if (insertError) throw getScanStorageError(insertError, 'create')
  const pendingScan = mapScan(pendingRow)

  const form = new FormData()
  form.append('action', 'scan-resume')
  form.append('file', file, file.name)
  let analysis
  try {
    const { data, error } = await client.functions.invoke('resume-ai', {
      body: form,
      timeout: 120_000,
    })
    if (error) throw await getFunctionError(error)
    analysis = validateAnalysis(data, file)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resume scanning failed.'
    const failedScan = await updateFailedScan(client, pendingScan.id, user.id, file, message)
    const scanError = new Error(message)
    scanError.scanRecord = failedScan
    throw scanError
  }

  analysis.metadata.scanId = pendingScan.id
  const { data: savedRow, error: updateError } = await client
    .from('resume_scans')
    .update({
      status: 'completed',
      ats_score: analysis.overview.score,
      report: analysis,
    })
    .eq('id', pendingScan.id)
    .eq('user_id', user.id)
    .select('id, resume_id, file_name, file_type, status, ats_score, report, created_at, updated_at')
    .single()
  if (updateError) {
    throw new Error(`Analysis completed, but its report could not be saved to scan history: ${getScanStorageError(updateError, 'update').message}`)
  }
  return { ...analysis, scanRecord: mapScan(savedRow) }
}
