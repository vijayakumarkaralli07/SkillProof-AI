import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateAnalytics,
  normalizeAnalyticsApplications,
  normalizeAnalyticsSavedJobs,
} from './analyticsCalculations.js'

const now = new Date('2026-10-27T12:00:00Z')

test('empty accounts show real zero counts and no unsupported percentages', () => {
  const analytics = calculateAnalytics({}, now)

  assert.equal(analytics.totalApplications, 0)
  assert.equal(analytics.submittedApplications, 0)
  assert.equal(analytics.interviews, 0)
  assert.equal(analytics.offers, 0)
  assert.equal(analytics.applicationSuccessRate, null)
  assert.equal(analytics.responseRate, null)
  assert.deepEqual(analytics.trend('3months'), [])
  assert.equal(analytics.trendSummary('3months')[0].value, null)
})

test('saved jobs contribute skill observations but not application counts', () => {
  const analytics = calculateAnalytics({
    savedJobs: normalizeAnalyticsSavedJobs([{ job_id: 'saved-1', skills: ['SQL', 'Python'] }]),
    profileSkills: ['sql', 'Python', 'React'],
  }, now)

  assert.equal(analytics.totalApplications, 0)
  assert.equal(analytics.submittedApplications, 0)
  assert.equal(analytics.matchedSkills, 2)
  assert.equal(analytics.skillDemand.length, 2)
})

test('status history counts distinct applications and keeps tracked-job observations deduplicated', () => {
  const applications = normalizeAnalyticsApplications({
    externalRows: [{
      application_record_id: 'external-1',
      job_id: 'job-1',
      job_title: 'Developer',
      company: 'Example Co',
      status: 'offer',
      applied_at: '2026-10-01T10:00:00Z',
      source_type: 'himalayas',
      skills: ['React'],
    }],
    nativeRows: [{
      id: 'native-1',
      job_id: 'native-job-1',
      job_title: 'Engineer',
      company_name: 'Example Co',
      status: 'interview',
      submitted_at: '2026-10-10T10:00:00Z',
    }],
    historyRows: [
      { id: 'e1', application_kind: 'external', application_id: 'external-1', new_status: 'applied', changed_at: '2026-10-01T10:00:00Z', source: 'student_reported' },
      { id: 'e2', application_kind: 'external', application_id: 'external-1', new_status: 'under_review', changed_at: '2026-10-03T10:00:00Z', source: 'student_reported' },
      { id: 'e3', application_kind: 'external', application_id: 'external-1', new_status: 'interview', changed_at: '2026-10-05T10:00:00Z', source: 'student_reported' },
      { id: 'e4', application_kind: 'external', application_id: 'external-1', new_status: 'offer', changed_at: '2026-10-06T10:00:00Z', source: 'student_reported' },
      { id: 'n1', application_kind: 'native', application_id: 'native-1', new_status: 'applied', changed_at: '2026-10-10T10:00:00Z', source: 'platform_submission' },
      { id: 'n2', application_kind: 'native', application_id: 'native-1', new_status: 'interview', changed_at: '2026-10-12T10:00:00Z', source: 'employer_reported' },
    ],
  })
  const analytics = calculateAnalytics({
    applications,
    savedJobs: normalizeAnalyticsSavedJobs([{ job_id: 'job-1', skills: ['React', 'SQL'] }]),
    profileSkills: ['React', 'SQL'],
  }, now)

  assert.equal(analytics.totalApplications, 2)
  assert.equal(analytics.submittedApplications, 2)
  assert.equal(analytics.interviews, 2)
  assert.equal(analytics.offers, 1)
  assert.equal(analytics.applicationSuccessRate, 100)
  assert.equal(analytics.responseRate, 100)
  assert.equal(analytics.responseCount, 2)
  assert.equal(analytics.matchedSkills, 2)
  assert.equal(analytics.funnel[0].value, 2)
  assert.equal(analytics.trend('3months').length, 1)
  assert.equal(analytics.trendSummary('3months')[0].denominator, 2)
  assert.equal(analytics.responseSampleSize, 2)
  assert.equal(analytics.channels.length, 0)
  assert.equal(analytics.companies.length, 1)
})

test('saved and preparing records are excluded from submitted metrics and trends', () => {
  const applications = normalizeAnalyticsApplications({
    externalRows: [{
      application_record_id: 'preparing-1',
      job_id: 'job-1',
      status: 'preparing',
      application_data: {},
    }],
  })
  const analytics = calculateAnalytics({ applications }, now)

  assert.equal(analytics.totalApplications, 1)
  assert.equal(analytics.submittedApplications, 0)
  assert.equal(analytics.funnel[0].value, 0)
  assert.deepEqual(analytics.trend('30days'), [])
})

test('response metrics exclude backfilled and non-response statuses', () => {
  const applications = normalizeAnalyticsApplications({
    nativeRows: [{
      id: 'native-1',
      job_id: 'job-1',
      status: 'under_review',
      submitted_at: '2026-10-10T10:00:00Z',
    }],
    historyRows: [{
      id: 'history-1',
      application_kind: 'native',
      application_id: 'native-1',
      new_status: 'under_review',
      changed_at: '2026-10-11T10:00:00Z',
      source: 'system_backfill',
    }],
  })
  const analytics = calculateAnalytics({ applications }, now)

  assert.equal(analytics.responseRate, null)
  assert.equal(analytics.responseSampleSize, 0)
  assert.equal(analytics.applicationSuccessRate, 0)
})

test('follow-up changes appear in activity with the persisted change time', () => {
  const applications = normalizeAnalyticsApplications({
    nativeRows: [{
      id: 'native-1',
      job_id: 'job-1',
      job_title: 'Engineer',
      status: 'applied',
      submitted_at: '2026-10-10T10:00:00Z',
    }],
    historyRows: [{
      id: 'history-1',
      application_kind: 'native',
      application_id: 'native-1',
      new_status: 'applied',
      changed_at: '2026-10-20T10:00:00Z',
      source: 'student_reported',
      event_type: 'follow_up_updated',
      follow_up_date: '2026-10-27',
    }],
  })
  const analytics = calculateAnalytics({ applications }, now)

  assert.equal(analytics.activity.length, 1)
  assert.equal(analytics.activity[0].eventType, 'follow_up_updated')
  assert.equal(analytics.activity[0].changedAt, '2026-10-20T10:00:00Z')
  assert.equal(analytics.activity[0].followUpDate, '2026-10-27')
})

test('a student-reported rejection is a response but not an interview or success', () => {
  const applications = normalizeAnalyticsApplications({
    externalRows: [{
      application_record_id: 'external-1',
      job_id: 'job-1',
      status: 'rejected',
      applied_at: '2026-10-10T10:00:00Z',
      source_type: 'himalayas',
    }],
    historyRows: [
      { id: 'e1', application_kind: 'external', application_id: 'external-1', new_status: 'applied', changed_at: '2026-10-10T10:00:00Z', source: 'student_reported' },
      { id: 'e2', application_kind: 'external', application_id: 'external-1', new_status: 'rejected', changed_at: '2026-10-12T10:00:00Z', source: 'student_reported' },
    ],
  })
  const analytics = calculateAnalytics({ applications }, now)

  assert.equal(analytics.interviews, 0)
  assert.equal(analytics.offers, 0)
  assert.equal(analytics.applicationSuccessRate, 0)
  assert.equal(analytics.responseCount, 1)
  assert.equal(analytics.responseRate, 100)
  assert.equal(analytics.responseTime[0].label, 'Within 1 Week')
})
