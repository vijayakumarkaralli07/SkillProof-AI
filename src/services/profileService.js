import { getSupabaseClient, getSupabaseConfigError } from './supabaseClient'
import { loadProfileRecord, saveProfileRecord } from './userDataService.js'

function safeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value.trim())
    return ['http:', 'https:'].includes(url.protocol) && url.hostname ? url.href : ''
  } catch {
    return ''
  }
}

function stringList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : []
}

export function getProfileFromUser(user) {
  const metadata = user?.user_metadata ?? {}
  const saved = metadata.skillproof_profile && typeof metadata.skillproof_profile === 'object'
    ? metadata.skillproof_profile
    : {}

  return {
    name: String(saved.name ?? metadata.full_name ?? metadata.name ?? ''),
    headline: String(saved.headline ?? ''),
    phone: String(saved.phone ?? ''),
    location: String(saved.location ?? ''),
    professionalStatus: String(saved.professionalStatus ?? metadata.role ?? ''),
    opportunityStatus: String(saved.opportunityStatus ?? ''),
    learningProgress: String(saved.learningProgress ?? ''),
    education: Array.isArray(saved.education) ? saved.education.filter((item) => item && typeof item === 'object').map((item) => ({
      institution: String(item.institution ?? ''),
      degree: String(item.degree ?? ''),
      field: String(item.field ?? ''),
      graduationYear: String(item.graduationYear ?? ''),
    })) : [],
    skills: stringList(saved.skills),
    interests: stringList(saved.interests),
    targetRole: String(saved.targetRole ?? ''),
    careerGoals: String(saved.careerGoals ?? ''),
    socialLinks: Array.isArray(saved.socialLinks) ? saved.socialLinks.filter((item) => item && typeof item === 'object').map((item) => ({
      label: String(item.label ?? ''),
      url: safeHttpUrl(item.url),
    })).filter((item) => item.label && item.url) : [],
    avatarUrl: safeHttpUrl(saved.avatarUrl ?? metadata.avatar_url ?? ''),
  }
}

export async function loadProfileForUser(user) {
  const saved = await loadProfileRecord(user.id)
  return { ...getProfileFromUser(user), ...saved }
}

export async function saveProfileForUser(userId, profile) {
  return saveProfileRecord(userId, profile)
}

export async function requestPasswordReset(email) {
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError() || 'Supabase is unavailable. Try again later.')
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(error.message || 'Password reset email could not be sent.')
}

export async function updateCurrentPassword(password) {
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError() || 'Supabase is unavailable. Try again later.')
  const { data: currentData, error: currentError } = await client.auth.getUser()
  if (currentError || !currentData.user) throw new Error('This password reset link is no longer valid. Request a new one.')
  const { error } = await client.auth.updateUser({ password })
  if (error) throw new Error(error.message || 'Password could not be updated.')
}