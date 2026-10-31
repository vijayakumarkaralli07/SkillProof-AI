import { useState } from 'react'
import {
  ArrowRight, BarChart3, CaseSensitive, Check, ChevronRight, CircleCheck, FileText,
  Lightbulb, MessageCircle, Sparkles, UserRound, X, Zap,
} from 'lucide-react'
import { confirmResumeAiConsent, generateResumeAi, removeResumeContactLines } from '../services/resumeAiService'
import { saveResume } from '../services/resumeService'

const categories = [
  { label: 'Impact & Achievements', Icon: BarChart3 },
  { label: 'Clarity', Icon: MessageCircle },
  { label: 'Grammar', Icon: CaseSensitive },
  { label: 'Action Verbs', Icon: Zap },
]

const tips = [
  { title: 'Replace vague verbs with stronger action verbs', Icon: Zap, detail: 'Choose a precise verb that describes what you actually did.' },
  { title: 'Add measurable outcomes only when verified', Icon: BarChart3, detail: 'Use real results only when you can substantiate them. Never invent metrics.' },
  { title: 'Remove repetitive or generic statements', Icon: FileText, detail: 'Keep wording that best explains your actual contribution.' },
  { title: 'Improve summary and objective for clarity', Icon: UserRound, detail: 'Keep claims specific to your own experience.' },
]

function ScoreRing() {
  return <div className="rwi-score-ring" aria-label="Writing quality is not scored">
    <strong>—<small>/100</small></strong><span>Not yet scored</span>
  </div>
}

export default function ResumeImproverPage() {
  const [category, setCategory] = useState(categories[0].label)
  const [resumeText, setResumeText] = useState('')
  const [draftText, setDraftText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedImprovement, setSelectedImprovement] = useState(-1)
  const [activeSuggestion, setActiveSuggestion] = useState('')
  const visibleSuggestions = suggestions
  const pendingSuggestions = visibleSuggestions.filter((suggestion) => suggestion.status === 'pending')
  const selectedCount = pendingSuggestions.filter((suggestion) => suggestion.selected).length
  const allSelected = pendingSuggestions.length > 0 && selectedCount === pendingSuggestions.length
  const draftChanges = suggestions.filter((suggestion) => suggestion.status === 'accepted')

  function updateSuggestion(id, changes) {
    setSuggestions((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item))
    setNotice('')
  }

  async function getSuggestions() {
    if (!resumeText.trim()) {
      setNotice('Enter resume text to review. Avoid including contact details that are not needed.')
      return
    }
    if (!confirmResumeAiConsent()) return
    const sections = resumeText.split(/\r?\n/)
      .map((text, index) => ({ id: `line-${index + 1}`, text }))
      .filter((section) => section.text.trim()
        && section.text.length <= 800
        && removeResumeContactLines(section.text).trim() === section.text.trim())
      .slice(0, 20)
    if (!sections.length) {
      setNotice('No supported resume lines remain. Contact lines are excluded, and each submitted line must be 800 characters or fewer.')
      return
    }
    setLoading(true)
    setNotice('')
    try {
      const result = await generateResumeAi('improve_resume', { sections, category })
      const next = result.suggestions.map((item) => ({ ...item, category, status: 'pending', selected: true }))
      setSuggestions(next)
      setDraftText(resumeText)
      setActiveSuggestion('')
      setNotice(next.length ? `${next.length} suggestion${next.length === 1 ? '' : 's'} ready for your review.` : 'No safe edits were identified for this category.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  function applySuggestion(item) {
    const updated = replaceResumeLine(draftText, item)
    if (updated === null) return false
    setDraftText(updated)
    return true
  }

  function replaceResumeLine(text, item) {
    const match = item.sectionId.match(/^line-(\d+)$/)
    if (!match) return null
    const lines = text.split(/\r?\n/)
    const lineIndex = Number(match[1]) - 1
    if (lines[lineIndex] !== item.original) return null
    lines[lineIndex] = item.proposed
    return lines.join(text.includes('\r\n') ? '\r\n' : '\n')
  }

  function acceptSuggestion(id) {
    const suggestion = suggestions.find((item) => item.id === id)
    if (!suggestion || suggestion.status !== 'pending') return
    if (!applySuggestion(suggestion)) {
      setNotice('This suggestion no longer matches the edited text. Generate fresh suggestions before accepting it.')
      return
    }
    updateSuggestion(id, { status: 'accepted', selected: false })
    setNotice('Accepted only this suggested text. Other resume content is unchanged.')
  }

  function rejectSuggestion(id) {
    updateSuggestion(id, { status: 'rejected', selected: false })
    setNotice('Suggestion rejected. The original wording remains unchanged.')
  }

  function applySelected() {
    const selected = pendingSuggestions.filter((item) => item.selected)
    if (!selected.length) {
      setNotice('Select at least one pending suggestion.')
      return
    }
    let updated = draftText
    const appliedIds = []
    for (const item of selected) {
      const next = replaceResumeLine(updated, item)
      if (next === null) continue
      updated = next
      appliedIds.push(item.id)
    }
    if (!appliedIds.length) {
      setNotice('None of the selected suggestions match the current text. Generate fresh suggestions before accepting.')
      return
    }
    setDraftText(updated)
    setSuggestions((current) => current.map((item) => appliedIds.includes(item.id) ? { ...item, status: 'accepted', selected: false } : item))
    setNotice(`${appliedIds.length} selected change${appliedIds.length === 1 ? '' : 's'} accepted. Other resume text was preserved.`)
  }

  function resetReview() {
    setDraftText(resumeText)
    setSuggestions((current) => current.map((item) => ({ ...item, status: 'pending', selected: true })))
    setNotice('Accepted changes were removed from the review draft. Your source text is unchanged.')
  }

  async function saveApprovedDraft() {
    if (!draftChanges.length || draftText === resumeText) {
      setNotice('Accept at least one suggestion before saving a new resume.')
      return
    }
    setSaving(true)
    try {
      await saveResume({ name: 'Improved Resume', content: { rawText: draftText } })
      setNotice('Approved wording was saved as a new resume. Your original was not overwritten.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSaving(false)
    }
  }

  function toggleSelectAll(checked) {
    setSuggestions((current) => current.map((item) => item.status === 'pending' ? { ...item, selected: checked } : item))
  }

  return <section className="resume-tool-page resume-improver-page">
    <header className="rwx-hero rwi-hero">
      <div><span className="rwx-eyebrow">RESUME STUDIO</span><h1>Make Every Line <span>Stronger</span></h1><p>Improve clarity, impact, and professionalism without changing your story.</p></div>
      <div className="rwx-illustration rwi-illustration" aria-hidden="true">
        <i className="rwi-orbit rwi-orbit-one" /><i className="rwi-orbit rwi-orbit-two" />
        <div className="rwi-illustration-paper"><span /><span /><span /><i><FileText size={26} /></i></div>
        <b className="rwi-illustration-label rwi-label-wording">Better Wording</b>
        <b className="rwi-illustration-label rwi-label-story">Clearer Story</b>
        <b className="rwi-illustration-label rwi-label-impact">Stronger Impact</b>
      </div>
    </header>
    {notice && <p className="rwx-notice" role="status">{notice}</p>}

    <div className="rwi-workspace-grid">
      <div className="rwi-main-column">
        <section className="rw-card rwi-resume-input">
          <label htmlFor="rwi-resume-text"><span><FileText size={17} />Resume text to improve</span><textarea id="rwi-resume-text" rows="7" maxLength={10000} disabled={loading} value={resumeText} onChange={(event) => {
            setResumeText(event.target.value)
            setSuggestions([])
            setDraftText(event.target.value)
          }} placeholder="Paste only the resume content you want reviewed. Remove contact details and other unnecessary personal information." /></label>
          <small>{resumeText.length}/10,000 characters · up to 20 lines are sent after consent; contact-detail lines are excluded.</small>
          <button type="button" className="rw-primary-button" disabled={loading || !resumeText.trim()} onClick={getSuggestions}>{loading ? 'Reviewing…' : 'Get AI Suggestions'}</button>
        </section>

        <nav className="rwi-category-tabs" aria-label="Improvement categories">
          {categories.map(({ label, Icon }) => <button type="button" key={label} disabled={loading} className={category === label ? 'active' : ''} aria-pressed={category === label} onClick={() => { setCategory(label); setSuggestions([]); setDraftText(resumeText); setNotice('') }}><Icon size={14} />{label}</button>)}
        </nav>

        <section className="rw-card rwi-review-card">
          <header className="rw-card-heading"><span className="rw-icon-box"><Sparkles size={17} /></span><div><h2>Resume Content Review</h2><p>Review and accept only the wording changes you want.</p></div></header>
          {!visibleSuggestions.length ? <div className="rwi-empty-suggestions">Paste resume text and request suggestions to begin.</div> : <div className="rwi-suggestions">
            {visibleSuggestions.map((item) => <article className={`rwi-suggestion${item.status !== 'pending' ? ` is-${item.status}` : ''}`} key={item.id}>
              <div className="rwi-suggestion-row">
                <label className="rwi-select-suggestion" aria-label={`Select ${item.sectionId} suggestion`}><input type="checkbox" checked={item.selected} disabled={item.status !== 'pending'} onChange={(event) => updateSuggestion(item.id, { selected: event.target.checked })} /></label>
                <div className="rwi-suggestion-content">
                  <strong className="rwi-section-label">{item.sectionId}</strong>
                  <div className="rwi-comparison">
                    <section className="rwi-original"><strong>Original</strong><p><mark>{item.original}</mark></p></section>
                    <ArrowRight size={17} aria-hidden="true" />
                    <section className="rwi-improved"><strong><Sparkles size={12} />Suggested Wording</strong><p><mark>{item.proposed}</mark></p></section>
                  </div>
                  <p className="rwi-explanation">{item.explanation}</p>
                  <div className="rwi-suggestion-actions">
                    {item.status === 'pending'
                      ? <><button type="button" className="rwi-accept" onClick={() => acceptSuggestion(item.id)}><Check size={13} />Accept</button><button type="button" className="rwi-reject" onClick={() => rejectSuggestion(item.id)}><X size={13} />Reject</button></>
                      : <span className={`rwi-status status-${item.status}`}>{item.status === 'accepted' ? 'Accepted' : 'Rejected'}</span>}
                    <button type="button" className="rwi-explain" onClick={() => setActiveSuggestion(activeSuggestion === item.id ? '' : item.id)} aria-expanded={activeSuggestion === item.id}>Why this change?</button>
                  </div>
                  {activeSuggestion === item.id && <p className="rwi-explanation-detail">{item.explanation}</p>}
                </div>
              </div>
            </article>)}
          </div>}
          <div className="rwi-bulk-actions">
            <label><input type="checkbox" checked={allSelected} disabled={!pendingSuggestions.length} onChange={(event) => toggleSelectAll(event.target.checked)} />Select All Suggestions <small>{selectedCount} selected</small></label>
            <button type="button" className="rw-primary-button" disabled={!selectedCount} onClick={applySelected}>Accept Selected Changes <ArrowRight size={14} /></button>
          </div>
          <section className="rwi-draft-preview" aria-live="polite">
            <header><div><h3>Temporary Draft Preview</h3><p>Only accepted text is changed; the source above remains untouched.</p></div><div><button type="button" className="rw-outline-button" disabled={!draftChanges.length} onClick={resetReview}>Reset Draft</button>{draftChanges.length > 0 && <button type="button" className="rw-primary-button" disabled={saving} onClick={saveApprovedDraft}>{saving ? 'Saving…' : 'Save as New Resume'}</button>}</div></header>
            {!draftChanges.length
              ? <p className="rwi-no-changes">Accept a suggestion to preview the separate draft here.</p>
              : <><div className="rwi-draft-list"><article><span><CircleCheck size={14} />Approved resume text</span><p>{draftText}</p><small>New version · original preserved</small></article></div></>}
          </section>
        </section>
      </div>

      <aside className="rwi-side-column">
        <section className="rw-card rwi-score-card">
          <header className="rw-card-heading"><span className="rw-icon-box"><Sparkles size={16} /></span><div><h2>Improvement Score</h2><p>No unsupported score is shown.</p></div></header>
          <div className="rwi-score-overview"><ScoreRing /><div className="rwi-score-feedback"><Sparkles size={17} /><span><strong>Review each change</strong><small>Accept only wording that accurately reflects your experience.</small></span></div></div>
          <p className="rwi-score-note">Suggestions do not predict hiring outcomes.</p>
        </section>
        <section className="rw-card rwi-tips-card">
          <header className="rw-card-heading"><span className="rw-icon-box icon-yellow"><Lightbulb size={16} /></span><div><h2>Suggested Improvements</h2><p>General writing guidance.</p></div></header>
          {tips.map(({ title, Icon, detail }, index) => <button className="rwi-tip" type="button" key={title} onClick={() => setSelectedImprovement(selectedImprovement === index ? -1 : index)} aria-expanded={selectedImprovement === index}><span className={`rwi-tip-icon rwi-tip-icon-${index}`}><Icon size={13} /></span><strong>{title}</strong><ChevronRight size={14} />{selectedImprovement === index && <small>{detail}</small>}</button>)}
        </section>
      </aside>
    </div>
  </section>
}
