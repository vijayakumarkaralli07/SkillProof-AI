import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function callbackError() {
  const query = new URLSearchParams(window.location.search)
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const code = query.get('error_code') ?? fragment.get('error_code')
  const description = query.get('error_description') ?? fragment.get('error_description')
  const providerError = query.get('error') ?? fragment.get('error')
  if (/access[_\s-]denied|cancel/i.test(`${code ?? ''} ${providerError ?? ''} ${description ?? ''}`)) return 'Sign-in was cancelled or permission was denied. No account session was created.'
  return description || providerError || ''
}

export default function AuthCallback() {
  const { user, loading, completeOAuthProfile } = useAuth()
  const navigate = useNavigate()
  const [profileError, setProfileError] = useState('')
  const providerError = callbackError()
  const error = providerError || profileError || (!loading && !user ? 'Authentication could not be completed. Please return to sign in and try again.' : '')

  useEffect(() => {
    if (error || loading || !user) return

    let active = true
    completeOAuthProfile(user).then(() => {
      if (active) navigate('/dashboard', { replace: true })
    }).catch((profileError) => {
      if (active) setProfileError(profileError.message)
    })
    return () => { active = false }
  }, [completeOAuthProfile, error, loading, navigate, user])

  return <main className="auth-state-screen"><div className="auth-state-panel" role={error ? 'alert' : 'status'}><span className="eyebrow">SKILLPROOF AI AUTHENTICATION</span><h1>{error ? 'Sign-in not completed' : 'Verifying your account'}</h1><p>{error || 'Finishing your secure sign-in. Please wait.'}</p>{error && <a className="button button-primary" href="/login">Return to sign in</a>}</div></main>
}