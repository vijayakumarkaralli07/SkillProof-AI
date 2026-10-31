import { Link } from 'react-router-dom'

export default function Logo({ compact = false }) {
  return <Link className={`brand${compact ? ' brand-compact' : ''}`} to={compact ? '/dashboard' : '/login'} aria-label="SkillProof AI home"><span className="brand-mark"><i /></span><span className="brand-name">SkillProof <b>AI</b></span></Link>
}