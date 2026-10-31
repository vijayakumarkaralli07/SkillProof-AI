export const applicationStatuses = [
  { value: 'saved', label: 'Saved' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'applied', label: 'Applied — student-confirmed' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

export function lifecycleStatusLabel(status, source) {
  if (status === 'applied' && source === 'platform_submission') return 'Applied · submitted through SkillProof AI'
  return applicationStatuses.find((item) => item.value === status)?.label ?? 'Saved'
}

export function statusHistoryDescription(entry) {
  const sourceLabels = {
    student_reported: 'Student-reported',
    employer_reported: 'Employer-reported manually',
    verified_employer_integration: 'Verified employer integration',
    platform_submission: 'Submitted through SkillProof AI',
    system_backfill: 'Existing tracker record',
  }
  const previous = entry.previousStatus ? lifecycleStatusLabel(entry.previousStatus) : 'Created'
  const details = [
    entry.note,
    entry.eventType === 'follow_up_updated'
      ? entry.followUpDate ? `Follow-up reminder set for ${entry.followUpDate}` : 'Follow-up reminder removed'
      : entry.followUpDate ? `Follow-up: ${entry.followUpDate}` : '',
    entry.assessmentAt ? `Assessment: ${new Date(entry.assessmentAt).toLocaleString()}` : '',
    entry.interviewAt ? `Interview: ${new Date(entry.interviewAt).toLocaleString()}` : '',
  ].filter(Boolean)

  return {
    id: entry.id,
    time: new Date(entry.changedAt).toLocaleString(),
    title: entry.eventType === 'follow_up_updated'
      ? 'Follow-up reminder updated'
      : `${previous} → ${lifecycleStatusLabel(entry.newStatus)}`,
    description: [sourceLabels[entry.source] || 'Status update', ...details].join(' · '),
  }
}
