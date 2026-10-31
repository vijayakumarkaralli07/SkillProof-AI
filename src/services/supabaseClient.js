const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''
let clientPromise
let clientError = ''
let persistSession = true

const authStorage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    const target = persistSession ? window.localStorage : window.sessionStorage
    const other = persistSession ? window.sessionStorage : window.localStorage
    target.setItem(key, value)
    other.removeItem(key)
  },
  removeItem(key) {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}

export function setSessionPersistence(remember) {
  persistSession = Boolean(remember)
}

export function hasSupabaseEnvironment() {
  return Boolean(supabaseUrl && supabaseKey)
}

export function getSupabaseConfigError() {
  if (!supabaseUrl || !supabaseKey) {
    return 'Supabase is not configured. Copy .env.example to .env.local and add your project URL and publishable key.'
  }
  try {
    const url = new URL(supabaseUrl)
    if (!['https:', 'http:'].includes(url.protocol) || (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname))) {
      return 'The Supabase URL must use HTTPS (HTTP is allowed for localhost only).'
    }
  } catch {
    return 'The Supabase project URL is invalid. Check VITE_SUPABASE_URL in .env.local.'
  }
  return clientError
}

export async function getSupabaseClient() {
  if (getSupabaseConfigError()) return null
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', persistSession: true, storage: authStorage },
    })).catch(() => {
      clientError = 'Supabase could not be initialized. Check the project URL and publishable key.'
      return null
    })
  }
  return clientPromise
}