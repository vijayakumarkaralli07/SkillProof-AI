import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Award, BarChart3, BriefcaseBusiness, Check, ChevronRight, Clock3, CodeXml,
  Copy, FileSearch, FileText, GraduationCap, Lightbulb, RotateCw, Settings2, ShieldAlert,
  Sparkles, Target, UploadCloud, UserRound, X,
} from 'lucide-react'
import { confirmResumeScanConsent, deleteResumeScan, listResumeScans, scanResume } from '../services/resumeScannerService'

const maxFileSize = 5 * 1024 * 1024
const allowedTypes = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}
const sectionIcons = {
  'Contact Information': UserRound,
  'Professional Summary': FileText,
  'Work Experience': BriefcaseBusiness,
  Skills: Settings2,
  Education: GraduationCap,
  Projects: CodeXml,
  Certifications: Award,
}

function ScoreRing({ score }) {
  const scoreText = score === null ? '—' : score
  return <div className="rsn-score-ring" style={{ '--score-angle': `${(score ?? 0) * 3.6}deg` }} aria-label={score === null ? 'No meaningful score available' : `AI heuristic score ${score} out of 100`}>
    <div><strong>{scoreText}{score !== null && <small>/100</small>}</strong><span>AI estimate</span></div>
  </div>
}

function statusClass(status) {
  if (status === 'Excellent' || status === 'Strong' || status === 'Good' || status === 'present') return 'good'
  if (status === 'Needs Improvement' || status === 'unclear') return 'needs-improvement'
  return 'needs-work'
}

function scoreColor(score) {
  if (score === null) return 'blue'
  if (score >= 75) return 'green'
  if (score >= 50) return 'yellow'
  return 'purple'
}

function scoreStatus(score) {
  if (score === null) return 'Insufficient information'
  if (score >= 85) return 'Strong'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs Improvement'
  return 'Needs Work'
}

function formatScanTime(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function displayScanStatus(status) {
  if (status === 'completed') return 'Completed'
  if (status === 'pending') return 'Pending'
  return 'Failed'
}

export default function ResumeScannerPage() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [expandedSuggestion, setExpandedSuggestion] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [pendingRescan, setPendingRescan] = useState(null)
  const inputRef = useRef(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    let active = true
    listResumeScans().then((items) => {
      if (active) setHistory(items)
    }).catch((loadError) => {
      if (active) setHistoryError(loadError.message)
    }).finally(() => {
      if (active) setHistoryLoading(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!report) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') setReport(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [report])

  async function validateFile(candidate) {
    if (!candidate || scanning) return
    const extension = candidate.name.slice(candidate.name.lastIndexOf('.')).toLowerCase()
    if (!Object.hasOwn(allowedTypes, extension) || candidate.type !== allowedTypes[extension]) {
      setError('Choose a valid PDF or DOCX file with a matching file type.')
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (!candidate.size) {
      setError('The selected file is empty. Choose a non-empty PDF or DOCX file.')
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (candidate.size > maxFileSize) {
      setError('File exceeds the 5 MB size limit.')
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    try {
      const header = new Uint8Array(await candidate.slice(0, 1024).arrayBuffer())
      if (extension === '.pdf' && !new TextDecoder().decode(header).includes('%PDF-')) {
        throw new Error('This PDF appears invalid or corrupted. Choose a readable PDF and try again.')
      }
      if (extension === '.docx' && (header[0] !== 0x50 || header[1] !== 0x4b)) {
        throw new Error('This DOCX appears invalid or corrupted. Choose a valid Word document and try again.')
      }
    } catch (fileError) {
      setError(fileError.message || 'The selected file could not be read. Choose it again and retry.')
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setError('')
    setNotice('')
    setFile(candidate)
    setAnalysis(null)
    setReport(null)
    setSelectedKeyword('')
    if (pendingRescan && pendingRescan.fileName !== candidate.name) setPendingRescan(null)
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    void validateFile(event.dataTransfer.files?.[0])
  }

  async function startScan() {
    if (!file || scanningRef.current) return
    if (!confirmResumeScanConsent()) return
    scanningRef.current = true
    setScanning(true)
    setError('')
    setNotice('')
    try {
      const resumeId = pendingRescan?.fileName === file.name ? pendingRescan.resumeId : null
      const result = await scanResume(file, { resumeId })
      setAnalysis(result)
      setHistory((current) => [result.scanRecord, ...current.filter((item) => item.id !== result.scanRecord.id)])
      setHistoryError('')
      setPendingRescan(null)
      setSelectedKeyword('')
      setNotice(`Analysis of ${result.metadata.originalFilename} completed. This is an AI-generated heuristic estimate, not an official ATS score.`)
    } catch (scanError) {
      if (scanError.scanRecord) setHistory((current) => [scanError.scanRecord, ...current.filter((item) => item.id !== scanError.scanRecord.id)])
      setError(scanError.message || 'Resume scanning failed. Your selected file is still available; retry when ready.')
    } finally {
      scanningRef.current = false
      setScanning(false)
    }
  }

  function clearFile() {
    setFile(null)
    setAnalysis(null)
    setReport(null)
    setPendingRescan(null)
    setError('')
    setNotice('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function copyKeyword() {
    if (!selectedKeyword) {
      setNotice('Choose a suggested keyword first.')
      return
    }
    try {
      await navigator.clipboard.writeText(selectedKeyword)
      setNotice(`Copied “${selectedKeyword}”. Only include it if it accurately reflects your experience.`)
    } catch (clipboardError) {
      setError(`Could not copy the keyword: ${clipboardError.message}`)
    }
  }

  function showReport(item) {
    setReport(item.report)
  }

  function requestRescan(item) {
    setPendingRescan(item)
    setNotice(`The uploaded file is not retained. Select ${item.fileName} again to create a new scan linked to the same resume.`)
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }

  async function removeScan(item) {
    if (!window.confirm(`Delete scan history for ${item.fileName}? The original uploaded file was not stored.`)) return
    try {
      await deleteResumeScan(item.id)
      setHistory((current) => current.filter((entry) => entry.id !== item.id))
      setNotice('Scan history entry deleted.')
      if (report?.metadata?.scanId === item.id) setReport(null)
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const score = analysis?.overview.score ?? null
  const scoreBreakdown = analysis?.overview.breakdown ?? []
  const recommendations = analysis?.recommendations ?? []
  const sections = analysis?.sections ?? []
  const missingKeywords = analysis?.keywords.potentiallyMissing ?? []

  return <section className="resume-tool-page resume-scanner-page">
    <header className="rwx-hero rsn-hero">
      <div><span className="rwx-eyebrow">RESUME STUDIO</span><h1>Know Your Resume's <span>Strength</span></h1><p>Scan your resume for ATS issues, missing keywords, and ways to stand out.</p></div>
      <div className="rwx-illustration rsn-illustration" aria-hidden="true">
        <i className="rsn-orbit rsn-orbit-one" /><i className="rsn-orbit rsn-orbit-two" />
        <div className="rsn-illustration-paper"><span /><span /><span /><span /><i><FileSearch size={29} /></i></div>
        <b className="rsn-illustration-label rsn-label-keywords">Better Keywords</b>
        <b className="rsn-illustration-label rsn-label-stronger">Stronger Resume</b>
        <b className="rsn-illustration-label rsn-label-noticed">Get Noticed</b>
      </div>
    </header>
    {notice && <p className="rwx-notice" role="status">{notice}</p>}
    <div className="rsn-layout">
      <section className="rw-card rsn-upload-card">
        <header className="rw-card-heading"><span className="rw-icon-box"><UploadCloud size={17} /></span><div><h2>Scan Your Resume</h2><p>Upload your resume and get a detailed analysis with AI-powered suggestions.</p></div><span className="rw-sample-tag">{scanning ? 'ANALYZING' : 'SECURE SCAN'}</span></header>
        <div className={`rsn-dropzone${dragging ? ' is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }} onDrop={onDrop}>
          <UploadCloud size={39} />
          <strong>Drag and drop your resume here,</strong><span>or click to browse</span>
          <small>Supports PDF, DOCX · Max 5MB</small>
          <button type="button" className="rw-primary-button" disabled={scanning} onClick={() => inputRef.current?.click()}><FileText size={15} />Choose Resume</button>
          <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { void validateFile(event.target.files?.[0]) }} aria-label="Choose a PDF or DOCX resume" />
          <div className="rsn-format-badges" aria-hidden="true"><span><b>PDF</b> PDF</span><span><b>DOCX</b> DOCX</span></div>
        </div>
        {file && <div className="rsn-selected-file"><FileText size={17} /><span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB · validated and ready to scan</small></span><button type="button" aria-label="Remove selected file" disabled={scanning} onClick={clearFile}><X size={16} /></button></div>}
        {error && <p className="rw-error-message" role="alert"><ShieldAlert size={14} />{error}</p>}
        <button type="button" className="rw-primary-button rsn-scan-button" disabled={!file || scanning} onClick={startScan}>{scanning ? `Analyzing ${file?.name ?? 'resume'}…` : analysis ? 'Re-scan Resume' : 'Scan Resume'} {!scanning && <ArrowRight size={14} />}</button>
        {scanning && <p className="rsn-privacy-note" role="status">Uploading and analyzing the selected document securely. Do not close this page.</p>}
        {!scanning && <p className="rsn-privacy-note">Before scanning, you’ll be asked to consent to sending this file to Gemini. Google’s free-tier terms say submitted content may be used to improve its products. Uploaded files are processed temporarily and not retained by this scanner.</p>}
        {analysis && <button className="rsn-copy-keyword" type="button" onClick={() => showReport(analysis)}><FileSearch size={12} />View Full Report</button>}
      </section>

      <section className="rw-card rsn-health-card">
        <header className="rw-card-heading"><span className="rw-icon-box"><BarChart3 size={17} /></span><div><h2>Resume Health Overview</h2><p>See how well your resume performs and what to improve.</p></div><span className="rw-sample-tag">{analysis ? 'AI HEURISTIC' : 'NO SCAN'}</span></header>
        {analysis ? <>
          <div className="rsn-score-overview"><ScoreRing score={score} /><div className="rsn-good-progress"><Check size={16} /><span><strong>{scoreStatus(score)}</strong><small>{analysis.overview.scoringMethod}</small></span></div></div>
          {score === null && <p className="rsn-privacy-note">{analysis.overview.limitation}</p>}
          <div className="rsn-metric-list">{scoreBreakdown.map((item, index) => {
            const MetricIcon = [Target, FileText, BriefcaseBusiness, Sparkles][index]
            return <div className={`rsn-metric-row metric-${scoreColor(item.score)}`} key={item.label}><span><MetricIcon size={14} />{item.label}</span><div><i style={{ width: `${item.score ?? 0}%` }} /></div><b>{item.score === null ? '—' : `${item.score}%`}</b></div>
          })}</div>
          <p className="rsn-privacy-note">AI-generated heuristic estimate only; not an official ATS vendor result.</p>
        </> : <p className="rsn-privacy-note">No analysis yet. Select a PDF or DOCX and run a scan to see results here.</p>}
      </section>

      <section className="rw-card rsn-keywords-card">
        <header className="rw-card-heading"><span className="rw-icon-box icon-yellow"><FileSearch size={17} /></span><div><h2>Missing Keywords</h2><p>{analysis ? 'Suggestions based on the uploaded resume.' : 'No resume has been analyzed yet.'}</p></div><span className="rw-sample-tag">{analysis ? 'SCAN RESULT' : 'NO SCAN'}</span></header>
        {analysis && analysis.keywords.found.length > 0 && <p className="rsn-privacy-note"><b>Found in document:</b> {analysis.keywords.found.join(' · ')}</p>}
        {analysis && missingKeywords.length > 0 ? <div className="rsn-keywords">{missingKeywords.map((item) => <button type="button" key={item.keyword} className={selectedKeyword === item.keyword ? 'is-selected' : ''} aria-pressed={selectedKeyword === item.keyword} title={item.reason} onClick={() => { setSelectedKeyword(item.keyword); setNotice(`${item.keyword}: ${item.reason} Only add it if it is accurate for you.`) }}>{item.keyword}</button>)}</div>
          : <p className="rsn-privacy-note">{analysis ? 'No potentially missing keywords were identified from this document.' : 'Keyword suggestions will appear after a real scan.'}</p>}
        {analysis && <p className="rsn-privacy-note">{analysis.keywords.disclaimer}</p>}
        <button className="rsn-copy-keyword" type="button" disabled={!selectedKeyword} onClick={copyKeyword}><Copy size={12} />Copy selected suggestion</button>
      </section>

      <section className="rw-card rsn-improvements-card">
        <header className="rw-card-heading"><span className="rw-icon-box"><Lightbulb size={17} /></span><div><h2>Recommended Improvements</h2><p>Specific suggestions from the uploaded document.</p></div><span className="rw-sample-tag">{analysis ? 'SCAN RESULT' : 'NO SCAN'}</span></header>
        {analysis && recommendations.length > 0 ? <div className="rsn-improvement-list">{recommendations.map((item, index) => <article key={`${item.title}-${index}`}>
          <button type="button" aria-expanded={expandedSuggestion === index} onClick={() => setExpandedSuggestion((current) => current === index ? null : index)}><span>{index + 1}</span><strong>{item.title}</strong><ChevronRight size={15} /></button>
          {expandedSuggestion === index && <p>{item.detail}{item.example && <><br /><b>Example:</b> {item.example}</>} <small>AI suggestion · verify accuracy before using</small></p>}
        </article>)}</div> : <p className="rsn-privacy-note">{analysis ? 'No specific improvements were returned for this resume.' : 'Recommendations from your scan will appear here.'}</p>}
        {analysis && analysis.overview.strengths.length > 0 && <div className="rsn-privacy-note"><b>Strengths:</b> {analysis.overview.strengths.join(' · ')}</div>}
      </section>

      <section className="rw-card rsn-sections-card">
        <header className="rw-card-heading"><span className="rw-icon-box"><FileText size={17} /></span><div><h2>Section-wise Analysis</h2><p>Assessments based on the selected document.</p></div><span className="rw-sample-tag">{analysis ? 'SCAN RESULT' : 'NO SCAN'}</span></header>
        {analysis ? <div className="rsn-section-list">{sections.map((section) => {
          const SectionIcon = sectionIcons[section.label] ?? FileText
          return <div className={`rsn-section-row metric-${scoreColor(section.score)}`} key={section.label}><span><SectionIcon size={14} />{section.label}</span><i><b style={{ width: `${section.score ?? 0}%` }} /></i><strong>{section.score === null ? '—' : `${section.score}%`}</strong><small>{section.status}: {section.feedback}</small></div>
        })}</div> : <p className="rsn-privacy-note">Section assessments will appear here after a real scan.</p>}
      </section>

      <section className="rw-card rsn-history-card">
        <header className="rw-card-heading"><span className="rw-icon-box"><Clock3 size={17} /></span><div><h2>Scan History</h2><p>Saved reports from your account.</p></div><span className="rw-sample-tag">SAVED HISTORY</span></header>
        <div className="rw-table-wrap rsn-history-table-wrap"><table><thead><tr><th>File Name</th><th>Scanned On</th><th>ATS Score</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {historyLoading ? <tr><td colSpan="5">Loading your scan history…</td></tr>
            : historyError ? <tr><td colSpan="5" role="alert">{historyError}</td></tr>
              : history.length ? history.map((item) => <tr key={item.id}>
                <td><FileText size={14} />{item.fileName}</td>
                <td>{formatScanTime(item.createdAt)}</td>
                <td><span className="rsn-history-score">{item.score === null ? '—' : `${item.score}/100`}</span></td>
                <td><span className={`rsn-history-status ${statusClass(item.status === 'completed' ? scoreStatus(item.score) : item.status)}`}><i />{displayScanStatus(item.status)}</span></td>
                <td><div className="rsn-history-actions">
                  <button type="button" disabled={!item.report?.overview} onClick={() => showReport(item)}><FileSearch size={12} />View Report</button>
                  <button type="button" onClick={() => requestRescan(item)}><RotateCw size={12} />Re-scan</button>
                  <button type="button" aria-label={`Delete scan history for ${item.fileName}`} onClick={() => { void removeScan(item) }}><X size={12} />Delete</button>
                </div>{item.report?.error && <small className="rsn-history-note">{item.report.error}</small>}</td>
              </tr>)
                : <tr><td colSpan="5">No scans yet. Select a PDF or DOCX resume to create your first scan report.</td></tr>}
        </tbody></table></div>
        <p className="rsn-history-note">{historyError ? 'Scan history is available only after the pending resume persistence migration is applied.' : 'History stores your structured reports and file metadata only. Uploaded PDF/DOCX files are not retained.'}</p>
      </section>
    </div>

    {report && <div className="rsn-report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReport(null) }}>
      <section className="rsn-report-dialog" role="dialog" aria-modal="true" aria-labelledby="rsn-report-title">
        <header><div><span className="rw-sample-tag">{report.error ? 'FAILED SCAN' : 'AI-GENERATED REPORT'}</span><h2 id="rsn-report-title">{report.metadata.originalFilename}</h2><p>Analyzed {new Date(report.metadata.scannedAt).toLocaleString()} · Derived from uploaded file</p></div><button type="button" aria-label="Close report" onClick={() => setReport(null)}><X size={17} /></button></header>
        {report.error ? <p role="alert">{report.error}</p> : <>
        <div className="rsn-report-summary"><strong>{report.overview.score === null ? '—' : report.overview.score}<small>{report.overview.score === null ? '' : '/100'}</small></strong><span>AI heuristic estimate · not an official ATS score</span><b className={`rsn-history-status ${statusClass(scoreStatus(report.overview.score))}`}><i />{scoreStatus(report.overview.score)}</b></div>
        {report.overview.limitation && <p>{report.overview.limitation}</p>}
        <h3>Strengths</h3><ul>{report.overview.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul>
        <h3>Areas to improve</h3><ul>{report.overview.improvements.map((item, index) => <li key={index}>{item}</li>)}</ul>
        <h3>Section assessments</h3>{report.sections.map((section) => <p key={section.label}><b>{section.label} · {section.status}</b>{section.score !== null && ` · ${section.score}/100`}<br />{section.feedback}</p>)}
        <h3>Recommendations</h3>{report.recommendations.map((item, index) => <p key={`${item.title}-${index}`}><b>{item.title}</b><br />{item.detail}{item.example && <><br /><i>Example: {item.example}</i></>}</p>)}
        <p>{report.keywords.disclaimer}</p>
        </>}
        <button className="rw-outline-button" type="button" onClick={() => setReport(null)}>Close</button>
      </section>
    </div>}
  </section>
}
