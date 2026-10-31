import { useState } from 'react'
import { ArrowRight, AtSign, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/common/Logo'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail, isValidPassword } from '../utils/validators'
import RoleSelector from '../components/auth/RoleSelector'
import SocialAuthButtons from '../components/auth/SocialAuthButtons'

export default function Register() {
  const [role, setRole] = useState('Student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!name.trim()) return setError('Enter your name.')
    if (!isValidEmail(email)) return setError('Enter a valid email address.')
    if (!isValidPassword(password)) return setError('Password must be at least 6 characters.')
    if (!['Student', 'Recruiter', 'College'].includes(role)) return setError('Choose a valid account role.')

    setLoading(true)
    try {
      const result = await signUp({ name, email, password, role })
      if (result.hasSession) navigate('/dashboard')
      else setNotice('Registration request received. If this email can be registered, check your inbox for the verification link before signing in.')
    } catch (authError) {
      setError(authError.message || 'Registration could not be completed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="auth-scene"><div className="auth-atmosphere" aria-hidden="true"><div className="sky-glow" /><div className="mountain mountain-back" /><div className="mountain mountain-front" /></div><div className="auth-content"><header className="auth-header"><Logo /><p>Already have an account? <Link to="/login">Sign in <ArrowRight size={13} /></Link></p></header><section className="register-layout"><div className="auth-intro"><span className="eyebrow">MAKE YOUR NEXT MOVE COUNT</span><h1>Start building<br /><span>what comes next.</span></h1><p>Start building your future with SkillProof AI.</p></div><form className="login-panel register-panel" onSubmit={submit} noValidate>
    <RoleSelector value={role} onChange={setRole} />
    <div className="form-heading"><h2>Create your account</h2><p>Start building your future with SkillProof AI.</p></div>
    <label className="input-wrap"><UserRound size={16} /><input autoComplete="name" placeholder="Enter your name" value={name} onChange={(event) => setName(event.target.value)} aria-label="Name" /></label>
    <label className="input-wrap"><AtSign size={16} /><input type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email address" /></label>
    <label className="input-wrap"><LockKeyhole size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} aria-label="Password" /><button className="input-action" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></label>
    {error && <p className="form-message error-message" role="alert">{error}</p>}{notice && <p className="form-message auth-notice" role="status">{notice}</p>}
    <button className="button button-primary login-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create Account'} {!loading && <ArrowRight size={16} />}</button>
    <SocialAuthButtons role={role} mode="signup" />
  </form></section></div></main>
}