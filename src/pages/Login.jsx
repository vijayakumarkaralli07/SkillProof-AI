import { ArrowUpRight, BarChart3, BriefcaseBusiness, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/common/Logo'
import LoginForm from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  async function login(credentials) {
    await signIn(credentials)
    navigate('/dashboard')
  }
  return <main className="auth-scene"><div className="auth-atmosphere" aria-hidden="true"><div className="sky-glow" /><div className="light-arc" /><div className="mountain mountain-back" /><div className="mountain mountain-front" /><div className="ground-haze" /></div><div className="auth-content"><header className="auth-header"><Logo /><p>Don't have an account? <Link to="/register">Sign Up <ArrowUpRight size={13} /></Link></p></header><section className="login-layout"><div className="auth-intro"><h1>Build Your Career<br />with <span>Real Opportunities</span></h1><p>Find jobs, create impactful resumes and get ready for<br className="desktop-break" /> what's next with the power of AI.</p></div><div className="login-panel"><LoginForm onSubmit={login} /></div></section><div className="auth-benefits">{[[BriefcaseBusiness, <>Find Best<br />Jobs & Internships</>], [BarChart3, <>Create & Improve<br />Your Resume</>], [Sparkles, <>AI Powered<br />Career Guidance</>]].map(([Icon, label], index) => <div className="benefit-item" key={index}><Icon size={22} /><span>{label}</span></div>)}</div></div></main>
}