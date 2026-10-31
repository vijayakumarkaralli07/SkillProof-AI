import { useEffect, useMemo, useState } from 'react'
import {
  Check, Circle, Code2, GraduationCap, Link2, MapPin, Pencil, Plus, ShieldCheck,
  Sparkles, Trash2, UserRound, X,
} from 'lucide-react'
import { getProfileFromUser, loadProfileForUser, requestPasswordReset, saveProfileForUser } from '../services/profileService'
import SectionBackButton from '../components/common/SectionBackButton'
import '../styles/profile.css'

const emptyProfile = {
  name: '', headline: '', phone: '', location: '', professionalStatus: '', opportunityStatus: '', learningProgress: '',
  education: [], skills: [], interests: [], targetRole: '', careerGoals: '', socialLinks: [], avatarUrl: '',
}

function splitItems(value) {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))]
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}

function DisplayValue({ children }) {
  return children || <span className="profile-not-set">Not added</span>
}

function SectionHeading({ icon: Icon, title, action, onAction }) {
  return <header className="profile-card-heading">
    <span className="profile-card-icon"><Icon size={17} /></span>
    <h2>{title}</h2>
    {onAction && <button type="button" className="profile-edit-button" onClick={onAction}>{action || 'Edit'} <Pencil size={12} /></button>}
  </header>
}

function Field({ label, value, onChange, placeholder = '', type = 'text', required = false, autoFocus = false, disabled = false }) {
  return <label className="profile-field">
    <span>{label}{required && <i aria-hidden="true">*</i>}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} autoFocus={autoFocus} disabled={disabled} />
  </label>
}

function TextAreaField({ label, value, onChange, placeholder = '' }) {
  return <label className="profile-field">
    <span>{label}</span>
    <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} />
  </label>
}

function ProfileDialog({ title, onClose, onSubmit, children, saving, error, onCancel }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onCancel])

  return <div className="profile-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title">
      <header className="profile-dialog-header"><div><span className="profile-eyebrow">PROFILE SETTINGS</span><h2 id="profile-dialog-title">{title}</h2></div><button type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></header>
      <form onSubmit={onSubmit}>
        <div className="profile-dialog-content">{children}</div>
        {error && <p className="profile-form-error" role="alert">{error}</p>}
        <footer className="profile-dialog-actions"><button type="button" className="profile-cancel-button" onClick={onCancel}>Back to Profile</button><button type="submit" className="profile-save-button" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></footer>
      </form>
    </section>
  </div>
}

export default function ProfilePage({ user }) {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...getProfileFromUser(user) }))
  const [editing, setEditing] = useState('')
  const [draft, setDraft] = useState(null)
  const [baseline, setBaseline] = useState(null)
  const [skillsText, setSkillsText] = useState('')
  const [interestsText, setInterestsText] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [securityNotice, setSecurityNotice] = useState('')

  useEffect(() => {
    let active = true
    loadProfileForUser(user).then((saved) => {
      if (active) setProfile({ ...emptyProfile, ...saved })
    }).catch((loadError) => {
      if (active) setError(loadError.message)
    }).finally(() => {
      if (active) setProfileLoading(false)
    })
    return () => { active = false }
  }, [user])

  const checklist = useMemo(() => {
    const items = [
      { key: 'personal', label: 'Basic information', done: Boolean(profile.name.trim() && user.email && profile.location.trim()) },
      { key: 'education', label: 'Education details', done: profile.education.some((item) => item.institution.trim() && item.degree.trim()) },
      { key: 'skills', label: 'Add skills', done: profile.skills.length > 0 },
      { key: 'interests', label: 'Add career interests', done: profile.interests.length > 0 && Boolean(profile.targetRole.trim()) },
      { key: 'links', label: 'Add social links', done: profile.socialLinks.some((item) => item.label && isHttpUrl(item.url)) },
      { key: 'photo', label: 'Upload profile photo', done: Boolean(profile.avatarUrl) },
    ]
    return { items, percent: Math.round(items.filter((item) => item.done).length / items.length * 100) }
  }, [profile, user.email])

  const displayName = profile.name.trim() || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Account'
  const initial = displayName.trim()[0]?.toUpperCase() || 'U'
  const educationComplete = profile.education.filter((item) => item.institution || item.degree || item.field || item.graduationYear)

  function openEditor(section) {
    const next = {
      ...profile,
      education: profile.education.map((item) => ({ ...item })),
      skills: [...profile.skills],
      interests: [...profile.interests],
      socialLinks: profile.socialLinks.map((item) => ({ ...item })),
    }
    setDraft(next)
    setBaseline(next)
    setSkillsText(next.skills.join(', '))
    setInterestsText(next.interests.join(', '))
    setEditing(section)
    setError('')
    setSecurityNotice('')
  }

  function closeEditor(force = false) {
    const dirty = draft && baseline && (JSON.stringify(draft) !== JSON.stringify(baseline)
      || skillsText !== baseline.skills.join(', ')
      || interestsText !== baseline.interests.join(', '))
    if (!force && dirty && !window.confirm('Discard your unsaved profile changes?')) return
    setEditing('')
    setDraft(null)
    setBaseline(null)
    setError('')
  }

  useEffect(() => {
    if (!editing || !draft || !baseline) return undefined
    const dirty = JSON.stringify(draft) !== JSON.stringify(baseline)
      || skillsText !== baseline.skills.join(', ')
      || interestsText !== baseline.interests.join(', ')
    function confirmLeave(event) {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', confirmLeave)
    return () => window.removeEventListener('beforeunload', confirmLeave)
  }, [editing, draft, baseline, skillsText, interestsText])

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateEducation(index, key, value) {
    setDraft((current) => ({ ...current, education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))
  }

  function updateSocialLink(index, key, value) {
    setDraft((current) => ({ ...current, socialLinks: current.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }))
  }

  async function persistProfile(nextProfile, successMessage) {
    setSaving(true)
    setError('')
    try {
      const saved = await saveProfileForUser(user.id, nextProfile)
      setProfile({ ...emptyProfile, ...saved })
      setNotice(successMessage)
      return true
    } catch (saveError) {
      setError(saveError.message)
      setNotice('')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveEditor(event) {
    event.preventDefault()
    const next = { ...draft }
    if (editing === 'personal' && !next.name.trim()) {
      setError('Enter your name to continue.')
      return
    }
    if (editing === 'education') {
      const entries = next.education.filter((item) => item.institution.trim() || item.degree.trim() || item.field.trim() || item.graduationYear.trim())
      if (entries.some((item) => !item.institution.trim() || !item.degree.trim())) {
        setError('Each education entry needs an institution and degree, or remove the empty entry.')
        return
      }
      next.education = entries
    }
    if (editing === 'skills') next.skills = splitItems(skillsText)
    if (editing === 'interests') next.interests = splitItems(interestsText)
    if (editing === 'links') {
      next.socialLinks = next.socialLinks.filter((item) => item.label.trim() || item.url.trim())
      if (next.socialLinks.some((item) => !item.label.trim() || !isHttpUrl(item.url.trim()))) {
        setError('Each social link needs a name and a valid HTTP or HTTPS URL.')
        return
      }
      next.socialLinks = next.socialLinks.map((item) => ({ label: item.label.trim(), url: new URL(item.url.trim()).href }))
    }

    const didSave = await persistProfile(next, 'Profile changes saved.')
    if (didSave) closeEditor(true)
  }

  async function removeSkill(skill) {
    const next = { ...profile, skills: profile.skills.filter((item) => item !== skill) }
    await persistProfile(next, `${skill} removed from your skills.`)
  }

  async function removeSocialLink(index) {
    const next = { ...profile, socialLinks: profile.socialLinks.filter((_, itemIndex) => itemIndex !== index) }
    await persistProfile(next, 'Social link removed.')
  }

  async function sendPasswordReset() {
    setSaving(true)
    setSecurityNotice('')
    setError('')
    try {
      await requestPasswordReset(user.email)
      setSecurityNotice(`Password reset instructions were sent to ${user.email}.`)
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setSaving(false)
    }
  }

  const sectionTitle = {
    personal: 'Edit Personal Information', education: 'Edit Education', skills: 'Edit Skills',
    interests: 'Edit Career Interests', links: 'Edit Social Links', security: 'Account Security',
  }[editing]

  return <section className="profile-page" aria-labelledby="profile-page-title">
    <SectionBackButton to="/dashboard" label="Back to Dashboard" />
    <header className="profile-page-heading">
      <div><span className="profile-eyebrow">YOUR ACCOUNT</span><h1 id="profile-page-title">Profile Overview</h1><p>Manage your personal information, skills, and account details.</p></div>
      <button type="button" className="profile-primary-button" onClick={() => openEditor('personal')}><Pencil size={14} />Edit Profile</button>
    </header>

    {profileLoading && <p className="profile-notice" role="status">Loading your saved profile…</p>}
    {error && !editing && <p className="profile-form-error" role="alert">{error}</p>}
    {notice && <p className="profile-notice" role="status">{notice}</p>}

    <div className="profile-overview-grid">
      <section className="profile-identity-card">
        <div className="profile-avatar-wrap">
          {profile.avatarUrl ? <img className="profile-avatar-image" src={profile.avatarUrl} alt={`${displayName} profile`} /> : <span className="profile-avatar-fallback">{initial}</span>}
          <span className="profile-avatar-badge"><UserRound size={13} /></span>
        </div>
        <div className="profile-identity-copy">
          <h2>{displayName}</h2>
          <p>{profile.headline || 'Add a professional headline'}</p>
          <div className="profile-identity-location"><MapPin size={13} /><span>{profile.location || 'Location not added'}</span></div>
          <div className="profile-status-tags">
            {profile.professionalStatus && <span>{profile.professionalStatus}</span>}
            {profile.opportunityStatus && <span>{profile.opportunityStatus}</span>}
            {profile.learningProgress && <span>{profile.learningProgress}</span>}
            {!profile.professionalStatus && !profile.opportunityStatus && !profile.learningProgress && <span>Complete your profile to add status</span>}
          </div>
        </div>
        <div className="profile-photo-action"><button type="button" disabled title="Profile photo uploads are not configured">Photo upload unavailable</button><small>Image storage is not configured</small></div>
      </section>

      <section className="profile-completeness-card" aria-labelledby="profile-completeness-title">
        <header><h2 id="profile-completeness-title">Profile Completeness</h2><b>{checklist.percent}%</b></header>
        <div className="profile-progress-track" role="progressbar" aria-label="Profile completeness" aria-valuemin="0" aria-valuemax="100" aria-valuenow={checklist.percent}><span style={{ width: `${checklist.percent}%` }} /></div>
        <div className="profile-checklist">
          {checklist.items.map((item) => <button type="button" key={item.key} onClick={() => item.key === 'photo' ? setNotice('Profile photo upload is unavailable because image storage is not configured.') : openEditor(item.key)} className={item.done ? 'complete' : ''}>
            {item.done ? <Check size={13} /> : <Circle size={13} />}<span>{item.label}</span>
          </button>)}
        </div>
      </section>

      <section className="profile-info-card personal-card">
        <SectionHeading icon={UserRound} title="Personal Information" onAction={() => openEditor('personal')} />
        <dl className="profile-detail-list"><div><dt>Name</dt><dd><DisplayValue>{profile.name || user.user_metadata?.full_name || user.user_metadata?.name}</DisplayValue></dd></div><div><dt>Email</dt><dd>{user.email || 'Not available'}</dd></div><div><dt>Phone</dt><dd><DisplayValue>{profile.phone}</DisplayValue></dd></div><div><dt>Location</dt><dd><DisplayValue>{profile.location}</DisplayValue></dd></div></dl>
      </section>

      <section className="profile-info-card education-card">
        <SectionHeading icon={GraduationCap} title="Education" onAction={() => openEditor('education')} />
        {educationComplete.length ? educationComplete.map((item, index) => <div className="profile-education-entry" key={`${item.institution}-${index}`}><b>{item.degree}{item.field ? `, ${item.field}` : ''}</b><span>{item.institution}</span><small>{item.graduationYear || 'Graduation year not added'}</small></div>) : <p className="profile-empty-copy">Add your institution and degree.</p>}
        <button type="button" className="profile-inline-action" onClick={() => openEditor('education')}><Plus size={12} />Add education</button>
      </section>

      <section className="profile-info-card skills-card">
        <SectionHeading icon={Code2} title="Skills" onAction={() => openEditor('skills')} />
        {profile.skills.length ? <div className="profile-skill-tags">{profile.skills.map((skill) => <span key={skill}>{skill}<button type="button" aria-label={`Remove ${skill}`} title={`Remove ${skill}`} disabled={saving} onClick={() => removeSkill(skill)}><X size={10} /></button></span>)}</div> : <p className="profile-empty-copy">Add skills you can demonstrate.</p>}
        <button type="button" className="profile-inline-action" onClick={() => openEditor('skills')}><Plus size={12} />Add skill</button>
      </section>

      <section className="profile-info-card interests-card">
        <SectionHeading icon={Sparkles} title="Career Interests" onAction={() => openEditor('interests')} />
        <dl className="profile-detail-list"><div><dt>Interested areas</dt><dd>{profile.interests.length ? profile.interests.join(', ') : <DisplayValue />}</dd></div><div><dt>Target role</dt><dd><DisplayValue>{profile.targetRole}</DisplayValue></dd></div><div><dt>Career goals</dt><dd><DisplayValue>{profile.careerGoals}</DisplayValue></dd></div></dl>
      </section>

      <section className="profile-info-card social-card">
        <SectionHeading icon={Link2} title="Social Links" onAction={() => openEditor('links')} />
        <div className="profile-social-list">{profile.socialLinks.map((item, index) => <div key={`${item.label}-${item.url}`}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</a><button type="button" aria-label={`Remove ${item.label} link`} title={`Remove ${item.label} link`} disabled={saving} onClick={() => removeSocialLink(index)}><X size={11} /></button></div>)}{!profile.socialLinks.length && <p className="profile-empty-copy">Add GitHub, LinkedIn, or portfolio links.</p>}</div>
        <button type="button" className="profile-inline-action" onClick={() => openEditor('links')}><Plus size={12} />Add Link</button>
      </section>

      <section className="profile-info-card security-card">
        <SectionHeading icon={ShieldCheck} title="Account Security" onAction={() => openEditor('security')} action="Manage Security" />
        <dl className="profile-detail-list"><div><dt>Password</dt><dd>••••••••••••••••</dd></div><div><dt>Two-factor authentication</dt><dd className="profile-security-unavailable">Not configured</dd></div><div><dt>Account access</dt><dd className="profile-security-enabled">Protected by Supabase Auth</dd></div></dl>
      </section>
    </div>

    {editing && editing !== 'security' && <ProfileDialog title={sectionTitle} onClose={() => closeEditor()} onCancel={() => closeEditor()} onSubmit={saveEditor} saving={saving} error={error}>
      {editing === 'personal' && <div className="profile-form-grid"><Field label="Full name" value={draft.name} onChange={(value) => updateDraft('name', value)} required autoFocus /><Field label="Email" value={user.email || ''} onChange={() => {}} type="email" disabled /><Field label="Phone number" value={draft.phone} onChange={(value) => updateDraft('phone', value)} placeholder="+1 555 0100" /><Field label="Location" value={draft.location} onChange={(value) => updateDraft('location', value)} placeholder="City, country" /><Field label="Professional headline" value={draft.headline} onChange={(value) => updateDraft('headline', value)} placeholder="Aspiring Full Stack Developer" /><label className="profile-field"><span>Student or professional status</span><select value={draft.professionalStatus} onChange={(event) => updateDraft('professionalStatus', event.target.value)}><option value="">Not set</option><option>Student</option><option>Recent graduate</option><option>Professional</option></select></label><label className="profile-field"><span>Opportunity status</span><select value={draft.opportunityStatus} onChange={(event) => updateDraft('opportunityStatus', event.target.value)}><option value="">Not set</option><option>Open to opportunities</option><option>Actively looking</option><option>Not looking right now</option></select></label><label className="profile-field"><span>Learning progress</span><select value={draft.learningProgress} onChange={(event) => updateDraft('learningProgress', event.target.value)}><option value="">Not set</option><option>Learning in Progress</option><option>Course completed</option><option>Taking a break</option></select></label><p className="profile-field-note">Email is managed by your authenticated account and can’t be changed here.</p></div>}

      {editing === 'education' && <div className="profile-editor-list">{draft.education.map((item, index) => <fieldset className="profile-editor-entry" key={`education-${index}`}><legend>Education {index + 1}</legend><button type="button" className="profile-remove-entry" aria-label={`Remove education ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={14} /></button><Field label="Institution" value={item.institution} onChange={(value) => updateEducation(index, 'institution', value)} placeholder="University or school" /><Field label="Degree" value={item.degree} onChange={(value) => updateEducation(index, 'degree', value)} placeholder="B.E. Computer Science" /><Field label="Field of study" value={item.field} onChange={(value) => updateEducation(index, 'field', value)} placeholder="Computer Science" /><Field label="Graduation year" value={item.graduationYear} onChange={(value) => updateEducation(index, 'graduationYear', value)} placeholder="2026" /></fieldset>)}<button type="button" className="profile-add-entry" onClick={() => setDraft((current) => ({ ...current, education: [...current.education, { institution: '', degree: '', field: '', graduationYear: '' }] }))}><Plus size={14} />Add education entry</button></div>}

      {editing === 'skills' && <div className="profile-form-grid"><TextAreaField label="Skills" value={skillsText} onChange={setSkillsText} placeholder="React, TypeScript, SQL" /><p className="profile-field-note">Separate skills with commas or new lines. Use the remove icons on the overview to remove a saved skill.</p></div>}

      {editing === 'interests' && <div className="profile-form-grid"><TextAreaField label="Interested technology areas" value={interestsText} onChange={setInterestsText} placeholder="Web Development, AI & Machine Learning" /><Field label="Target career role" value={draft.targetRole} onChange={(value) => updateDraft('targetRole', value)} placeholder="Frontend Developer" /><TextAreaField label="Career goals" value={draft.careerGoals} onChange={(value) => updateDraft('careerGoals', value)} placeholder="Describe what you want to work toward" /></div>}

      {editing === 'links' && <div className="profile-editor-list">{draft.socialLinks.map((item, index) => <fieldset className="profile-editor-entry profile-link-entry" key={`link-${index}`}><legend>Social link {index + 1}</legend><button type="button" className="profile-remove-entry" aria-label={`Remove social link ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, socialLinks: current.socialLinks.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={14} /></button><Field label="Link name" value={item.label} onChange={(value) => updateSocialLink(index, 'label', value)} placeholder="GitHub" /><Field label="URL" value={item.url} onChange={(value) => updateSocialLink(index, 'url', value)} placeholder="https://github.com/username" type="url" /></fieldset>)}<button type="button" className="profile-add-entry" onClick={() => setDraft((current) => ({ ...current, socialLinks: [...current.socialLinks, { label: '', url: '' }] }))}><Plus size={14} />Add link</button></div>}
    </ProfileDialog>}

    {editing === 'security' && <div className="profile-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor() }}><section className="profile-dialog profile-security-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-security-title"><header className="profile-dialog-header"><div><span className="profile-eyebrow">ACCOUNT SECURITY</span><h2 id="profile-security-title">Manage Security</h2></div><button type="button" aria-label="Close dialog" onClick={() => closeEditor()}><X size={19} /></button></header><div className="profile-dialog-content"><div className="profile-security-row"><span><b>Password</b><small>Reset access through your account email.</small></span><button type="button" className="profile-save-button" disabled={saving || !user.email} onClick={sendPasswordReset}>{saving ? 'Sending…' : 'Send reset link'}</button></div><div className="profile-security-row"><span><b>Two-factor authentication</b><small>Multi-factor setup is not integrated in this application.</small></span><span className="profile-security-unavailable">Unavailable</span></div>{securityNotice && <p className="profile-notice" role="status">{securityNotice}</p>}{error && <p className="profile-form-error" role="alert">{error}</p>}</div><footer className="profile-dialog-actions"><button type="button" className="profile-cancel-button" onClick={() => closeEditor()}>Back to Profile</button></footer></section></div>}
  </section>
}