import { getSupabaseClient, getSupabaseConfigError, setSessionPersistence } from './supabaseClient'
import { isValidEmail, isValidPassword } from '../utils/validators'

const allowedRoles = new Set(['Student', 'Recruiter', 'College'])
const allowedProviders = new Set(['google', 'github'])
const pendingRoleKey = 'skillproof.pending-role'

async function requireClient() {
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError())
  return client
}

function readableAuthError(error) {
  const message = error?.message ?? ''
  if (/email not confirmed/i.test(message)) return 'Verify your email using the link we sent, then sign in again.'
  if (/invalid login credentials/i.test(message)) return 'The email or password is incorrect.'
  if (/user already registered/i.test(message)) return 'An account may already exist for this email. Try signing in instead.'
  if (/password should be at least/i.test(message)) return 'Choose a longer password that meets the project’s password policy.'
  if (/rate limit|too many requests/i.test(message)) return 'Too many attempts. Wait a moment and try again.'
  if (/failed to fetch|network/i.test(message)) return 'Could not reach Supabase. Check your connection and project configuration.'
  return message || 'Authentication could not be completed. Please try again.'
}

function throwAuthError(error) {
  if (error) throw new Error(readableAuthError(error))
}

function callbackUrl() {
  const configuredOrigin = import.meta.env.VITE_APP_ORIGIN?.trim()
  if (!configuredOrigin) throw new Error('Set VITE_APP_ORIGIN to this app’s exact origin before using email verification or OAuth.')

  let appOrigin
  try {
    appOrigin = new URL(configuredOrigin).origin
  } catch {
    throw new Error('VITE_APP_ORIGIN is not a valid application origin.')
  }

  const currentOrigin = window.location.origin
  const localhostHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
  const configuredHost = new URL(appOrigin).hostname
  const currentHost = new URL(currentOrigin).hostname
  const isLoopbackMatch = localhostHosts.has(configuredHost) && localhostHosts.has(currentHost) && new URL(appOrigin).port === new URL(currentOrigin).port

  if (appOrigin !== currentOrigin && !isLoopbackMatch) {
    throw new Error('This app origin is not configured for authentication redirects.')
  }

  return `${appOrigin}/auth/callback`
}

export async function registerAccount({ name, email, password, role }) {
  if (!name?.trim() || name.trim().length > 100) throw new Error('Enter a name between 1 and 100 characters.')
  if (!isValidEmail(email)) throw new Error('Enter a valid email address.')
  if (!isValidPassword(password)) throw new Error('Password must be at least 6 characters.')
  if (!allowedRoles.has(role)) throw new Error('Choose a valid account role.')
  setSessionPersistence(true)
  const client = await requireClient()
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(),
      data: { full_name: name.trim(), role },
    },
  })
  throwAuthError(error)
  return { hasSession: Boolean(data.session) }
}

export async function loginWithPassword({ email, password, remember = true }) {
  if (!isValidEmail(email)) throw new Error('Enter a valid email address.')
  if (!isValidPassword(password)) throw new Error('Password must be at least 6 characters.')
  setSessionPersistence(remember)
  const client = await requireClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  throwAuthError(error)
  if (!data.session) throw new Error('Sign-in did not create a session. Verify your email and try again.')
  return data
}

export async function loginWithProvider({ provider, role, remember = true }) {
  if (!allowedProviders.has(provider)) throw new Error('This sign-in provider is not supported.')
  if (!allowedRoles.has(role)) throw new Error('Choose a valid account role.')
  setSessionPersistence(remember)
  const client = await requireClient()
  sessionStorage.setItem(pendingRoleKey, role)
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl(),
      ...(provider === 'google' ? { scopes: 'openid email profile', queryParams: { prompt: 'select_account' } } : {}),
      ...(provider === 'github' ? { scopes: 'read:user user:email' } : {}),
    },
  })
  if (error) {
    sessionStorage.removeItem(pendingRoleKey)
    throw new Error(readableAuthError(error))
  }
}

export async function completeOAuthProfile(user) {
  const client = await requireClient()
  const pendingRole = sessionStorage.getItem(pendingRoleKey)
  sessionStorage.removeItem(pendingRoleKey)
  if (!user.email || !user.email_confirmed_at) {
    await client.auth.signOut()
    throw new Error('The provider did not return a verified email address. No session was kept.')
  }
  if (allowedRoles.has(user.user_metadata?.role) || !allowedRoles.has(pendingRole)) return
  const { error } = await client.auth.updateUser({ data: { role: pendingRole } })
  throwAuthError(error)
}

export async function logoutFromSupabase() {
  const client = await requireClient()
  sessionStorage.removeItem(pendingRoleKey)
  const { error } = await client.auth.signOut()
  throwAuthError(error)
}
