import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/dashboard.css'
import './styles/jobs.css'
import './styles/applications.css'
import './styles/analytics.css'
import './styles/saved-jobs.css'
import './styles/career-tools.css'
import './styles/resume-workspace.css'
import './styles/mock-interview.css'
import './styles/coding-workflow.css'
import './styles/career-journey.css'
import './styles/career-discovery.css'
import './styles/upgrade.css'
import App from './RootApp.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </StrictMode>,
)
