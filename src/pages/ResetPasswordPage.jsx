import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { updateCurrentPassword } from '../services/profileService'

export default function ResetPasswordPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Choose a password with at least 6 characters.')
      return
    }
    if (password !== confirmation) {
      setError('The passwords do not match.')
      return
    }
    setPending(true)
    try {
      await updateCurrentPassword(password)
      navigate('/dashboard', { replace: true })
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setPending(false)
    }
  }

  return <main className="auth-state-screen"><section className="auth-state-panel password-reset-panel" aria-labelledby="reset-password-title">
    <span className="eyebrow">SKILLPROOF AI ACCOUNT SECURITY</span>
    <h1 id="reset-password-title">Set a new password</h1>
    {loading && <p role="status">Verifying your password reset link…</p>}
    {!loading && !user && <><p role="alert">This password reset link is invalid or expired. Request another reset link from your account security settings.</p><Link to="/login" className="button button-primary">Return to sign in</Link></>}
    {!loading && user && <form className="password-reset-form" onSubmit={submit}>
      <p>Choose a new password for {user.email}.</p>
      <label>New password<input type="password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      <label>Confirm new password<input type="password" autoComplete="new-password" minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
      {error && <p role="alert" className="password-reset-error">{error}</p>}
      <button className="button button-primary" type="submit" disabled={pending}>{pending ? 'Updating…' : 'Update password'}</button>
    </form>}
  </section></main>
}