import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SectionBackButton({ to = '/dashboard', label = 'Back' }) {
  const navigate = useNavigate()

  return <button className="section-back-button" type="button" onClick={() => navigate(to)} aria-label={label}>
    <ArrowLeft size={16} />
    {label}
  </button>
}
