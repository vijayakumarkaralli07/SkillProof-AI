const roles = ['Student', 'Recruiter', 'College']

export default function RoleSelector({ value, onChange }) {
  return <div className="role-selector" role="tablist" aria-label="Choose your role">
    {roles.map((role) => <button key={role} type="button" role="tab" aria-selected={value === role} className={value === role ? 'selected' : ''} onClick={() => onChange(role)}>{role}</button>)}
  </div>
}