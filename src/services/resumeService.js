import { getSupabaseClient } from './supabaseClient'

function mapResume(row) {
  return {
    id: row.id,
    name: row.title || row.name,
    templateId: row.template_id || row.content?.templateId || 'modern',
    status: row.status || 'draft',
    content: row.content,
    type: row.resume_type,
    jobTitle: row.job_title ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function getStorageError(error, operation) {
  if (error.code === 'PGRST205' || error.code === '42P01') {
    return new Error('Resume storage is not configured in Supabase yet. Apply the pending resume migrations before trying again.')
  }
  return new Error(operation === 'save'
    ? `Could not save this resume: ${error.message}`
    : `Could not load saved resumes: ${error.message}`)
}

export async function listResumes() {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Resume storage is unavailable. Check your Supabase configuration.')
  const { data: { session }, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw new Error(`Could not verify your account: ${sessionError.message}`)
  if (!session?.user) throw new Error('Sign in to load your saved resumes.')

  const { data, error } = await client
    .from('resumes')
    .select('id, name, title, template_id, status, content, resume_type, job_title, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw getStorageError(error, 'load')
  return data.map(mapResume)
}

export async function getResume(id) {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Resume storage is unavailable. Check your Supabase configuration.')
  const { data: { session }, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw new Error(`Could not verify your account: ${sessionError.message}`)
  if (!session?.user) throw new Error('Sign in to load your saved resume.')

  const { data, error } = await client
    .from('resumes')
    .select('id, name, title, template_id, status, content, resume_type, job_title, created_at, updated_at')
    .eq('id', id)
    .single()
  if (error) throw getStorageError(error, 'load')
  return mapResume(data)
}

export async function saveResume({ name, title = name, templateId, content, type = 'general', jobTitle = '' }) {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Resume storage is unavailable. Check your Supabase configuration.')
  const { data: { session }, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw new Error(`Could not verify your account: ${sessionError.message}`)
  if (!session?.user) throw new Error('Sign in to save a resume.')
  if (typeof name !== 'string' || !name.trim() || typeof title !== 'string' || !title.trim()) throw new Error('Enter a name for this resume.')
  if (!content || typeof content !== 'object' || Array.isArray(content)) throw new Error('Resume content is invalid.')
  const selectedTemplate = templateId ?? content.templateId ?? 'modern'
  if (typeof selectedTemplate !== 'string' || !selectedTemplate.trim()) throw new Error('Choose a resume template before saving.')

  const { data, error } = await client
    .from('resumes')
    .insert({
      user_id: session.user.id,
      name: name.trim().slice(0, 120),
      title: title.trim().slice(0, 120),
      template_id: selectedTemplate.trim().slice(0, 80),
      status: 'draft',
      content,
      resume_type: type === 'job-tailored' ? 'job-tailored' : 'general',
      job_title: typeof jobTitle === 'string' ? jobTitle.trim().slice(0, 160) : '',
    })
    .select('id, name, title, template_id, status, content, resume_type, job_title, created_at, updated_at')
    .single()
  if (error) throw getStorageError(error, 'save')
  return mapResume(data)
}
