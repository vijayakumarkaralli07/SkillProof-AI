import { useState } from 'react'
import { Code2, LoaderCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const providers = [
  { id: 'google', label: 'Google', icon: 'google' },
  { id: 'github', label: 'GitHub', icon: Code2 },
]

export default function SocialAuthButtons({ role, mode = 'login', remember = true }) {
  const { signInWithProvider } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState('')
  const [error, setError] = useState('')

  async function signIn(provider) {
    setError('')
    setLoadingProvider(provider)
    try {
      await signInWithProvider({ provider, role, remember })
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoadingProvider('')
    }
  }

  return <div className="social-auth">
    <div className="divider"><span>OR {mode === 'signup' ? 'SIGN UP' : 'LOGIN'} WITH</span></div>
    <div className="social-row">{providers.map(({ id, label, icon: Icon }) => <button key={id} type="button" disabled={Boolean(loadingProvider)} aria-busy={loadingProvider === id} onClick={() => signIn(id)}>{loadingProvider === id ? <LoaderCircle className="loading-icon" size={16} /> : Icon === 'google' ? <b className="google-mark">G</b> : <Icon size={16} />}{label}</button>)}</div>
    {error && <p className="form-message error-message social-error" role="alert">{error}</p>}
  </div>
}