import { useState } from 'react'
import { AtSign, Eye, EyeOff, LockKeyhole, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isValidEmail, isValidPassword } from '../../utils/validators'
import RoleSelector from './RoleSelector'
import SocialAuthButtons from './SocialAuthButtons'

export default function LoginForm({ onSubmit }) {
  const [role, setRole] = useState('Student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!isValidEmail(email)) return setError('Enter a valid email address to continue.')
    if (!isValidPassword(password)) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await onSubmit({ email, password, remember })
    } catch (authError) {
      setError(authError.message || 'Sign-in could not be completed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return <form className="login-form" onSubmit={submit} noValidate>
    <RoleSelector value={role} onChange={setRole} />
    <div className="form-heading"><h2>Welcome Back!</h2><p>Login to continue to SkillProof AI</p></div>
    <label className="input-wrap"><AtSign size={16} /><input type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email address" /></label>
    <label className="input-wrap"><LockKeyhole size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} aria-label="Password" /><button className="input-action" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></label>
    <div className="form-options"><label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label><button type="button" className="text-link" onClick={() => setMessage('Password recovery is not configured yet. Contact the project administrator to reset an account.')}>Forgot password?</button></div>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    {message && <p className="form-message" role="status">{message}</p>}
    <button className="button button-primary login-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'} {!loading && <ArrowRight size={16} />}</button>
    <SocialAuthButtons role={role} mode="login" remember={remember} />
    <p className="create-account">New to SkillProof AI? <Link to="/register">Create an account</Link></p>
  </form>
}