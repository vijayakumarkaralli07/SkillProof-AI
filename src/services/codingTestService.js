import { getSupabaseClient, getSupabaseConfigError } from './supabaseClient.js'
import { normalizeCodingCollections } from './codingTestData.js'

const pageSize = 1000
const collectionFields = 'id,slug,title,description,category,difficulty,duration_minutes,supported_languages,publication_status'
const questionFields = 'id,collection_id,slug,title,problem_statement,difficulty,topic_tags,constraints,examples,starter_code_by_language,points,question_order'

async function getAuthenticatedClient(userId) {
  if (!userId) throw new Error('Sign in to access the coding test catalogue.')
  const client = await getSupabaseClient()
  if (!client) throw new Error(getSupabaseConfigError() || 'Supabase is unavailable.')
  const { data, error } = await client.auth.getUser()
  if (error) {
    const code = error.code ? ` (${error.code})` : ''
    throw new Error(`Your signed-in account could not be verified${code}. Sign in again.`)
  }
  if (!data.user || data.user.id !== userId) {
    throw new Error('Your signed-in account could not be verified. Sign in again.')
  }
  return { client, user: data.user }
}

function throwQueryError(error, fallback, operation, resource) {
  if (!error) return
  const context = `${operation} ${resource}`
  const diagnostic = error.code ? ` (${error.code}; ${context})` : ` (${context})`
  if (['PGRST204', 'PGRST205'].includes(error.code)) {
    throw new Error(`${fallback} PostgREST could not resolve the table or column in its schema cache${diagnostic}. Verify the queried name against the migration; if it exists in the database, refresh the API schema cache.`)
  }
  if (error.code === '42P01') {
    throw new Error(`${fallback} The queried relation does not exist${diagnostic}. Check the linked project and migration history; do not reapply a migration until those are confirmed.`)
  }
  if (error.code === '42703') {
    throw new Error(`${fallback} The queried column does not exist${diagnostic}. Align the query with the applied table definition.`)
  }
  if (error.code === '42501') {
    throw new Error(`${fallback} Database access was denied by permissions or row-level security${diagnostic}. Verify the signed-in session and the published-record policies.`)
  }
  if (['PGRST301', 'PGRST302'].includes(error.code)) {
    throw new Error(`${fallback} Supabase rejected the request authentication${diagnostic}. Refresh the user's session and retry.`)
  }
  throw new Error(`${fallback}${diagnostic}${error.message ? `: ${error.message}` : ''}`)
}

async function readAll(queryFactory, fallback, resource) {
  const rows = []
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await queryFactory().range(offset, offset + pageSize - 1)
    throwQueryError(error, fallback, 'SELECT', resource)
    rows.push(...(data || []))
    if (!data || data.length < pageSize) return rows
  }
}

export async function listCodingTests(userId) {
  const { client } = await getAuthenticatedClient(userId)
  const [collections, questions, availabilityResult] = await Promise.all([
    readAll(() => client.from('coding_test_sets')
      .select(collectionFields)
      .eq('publication_status', 'published')
      .order('title', { ascending: true }), 'Coding test collections could not be loaded.', 'public.coding_test_sets'),
    readAll(() => client.from('coding_questions')
      .select(questionFields)
      .eq('publication_status', 'published')
      .order('question_order', { ascending: true }), 'Published coding questions could not be loaded.', 'public.coding_questions'),
    client.rpc('get_coding_question_availability'),
  ])
  throwQueryError(availabilityResult.error, 'Eligible coding question counts could not be loaded.', 'RPC', 'get_coding_question_availability')
  return normalizeCodingCollections(collections, questions, availabilityResult.data || [])
}

function mapAttempt(row, attemptQuestions, tests, savedSubmissions = [], evaluationStorageAvailable = true) {
  const test = tests.find((item) => item.collectionId === row.collection_id)
  if (!test) throw new Error('This coding test collection is no longer available.')
  const questions = attemptQuestions.map((item) => {
    const question = test.questions.find((candidate) => candidate.id === item.question_id)
    if (!question) throw new Error('A question in this attempt is no longer available.')
    return { question, attemptQuestion: item }
  }).sort((left, right) => left.attemptQuestion.question_order - right.attemptQuestion.question_order)
  const drafts = {}
  const submissions = {}
  for (const { question, attemptQuestion } of questions) {
    const codeByLanguage = attemptQuestion.code_by_language || {}
    for (const [language, code] of Object.entries(codeByLanguage)) {
      if (typeof code === 'string') drafts[`${question.id}::${language}`] = code
    }
    if (attemptQuestion.submitted_at) {
      submissions[question.id] = {
        code: typeof codeByLanguage[row.language] === 'string' ? codeByLanguage[row.language] : '',
        language: row.language,
        submittedAt: new Date(attemptQuestion.submitted_at).getTime(),
        status: 'submitted-ungraded',
      }
    }
    const restoredEvaluations = new Set()
    for (const savedSubmission of savedSubmissions) {
      if (restoredEvaluations.has(savedSubmission.question_id)) continue
      const attemptQuestion = questions.find(({ question }) => question.id === savedSubmission.question_id)
      if (!attemptQuestion) continue
      restoredEvaluations.add(savedSubmission.question_id)
      const code = attemptQuestion.attemptQuestion.code_by_language?.[savedSubmission.language]
      submissions[savedSubmission.question_id] = {
        code: typeof code === 'string' ? code : '',
        language: savedSubmission.language,
        submittedAt: new Date(savedSubmission.created_at).getTime(),
        status: savedSubmission.status,
        evaluation: {
          status: savedSubmission.status,
          passedTests: savedSubmission.passed_tests,
          totalTests: savedSubmission.total_tests,
          hiddenPassed: savedSubmission.hidden_passed,
          hiddenTotal: savedSubmission.hidden_total,
          score: savedSubmission.score,
          maxScore: savedSubmission.max_score,
          executionTimeMs: savedSubmission.execution_time_ms,
          memoryKb: savedSubmission.memory_kb,
          stdout: savedSubmission.stdout,
          stderr: savedSubmission.stderr,
          compileOutput: savedSubmission.compile_output,
          visibleResults: savedSubmission.visible_results,
        },
      }
    }
  }
  const deadlineAt = row.deadline_at ? new Date(row.deadline_at).getTime() : null
  const remainingSeconds = ['paused', 'completed'].includes(row.status)
    ? Math.max(0, row.remaining_seconds || 0)
    : deadlineAt ? Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000)) : 0
  const attempt = {
    id: row.id,
    testId: test.id,
    status: row.status === 'in_progress' ? 'in-progress' : row.status,
    language: row.language,
    questionIds: questions.map(({ question }) => question.id),
    questionCount: questions.length,
    requestedQuestionCount: row.selected_question_count ?? questions.length,
    difficulty: test.difficulty,
    durationMinutes: test.durationMinutes,
    totalSeconds: test.durationMinutes * 60,
    minutesPerQuestion: Math.ceil(test.durationMinutes / questions.length),
    currentQuestionIndex: 0,
    sessionDate: row.daily_session_date ?? null,
    drafts,
    submissions,
    startedAt: new Date(row.started_at).getTime(),
    deadlineAt,
    remainingSeconds,
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
    completionReason: row.status === 'completed' ? 'Attempt completed' : null,
    evaluationStorageAvailable,
  }
  return { attempt, test: { ...test, questions: questions.map(({ question }) => question) } }
}

export async function loadCodingAttempt(userId, attemptId, tests) {
  const { client } = await getAuthenticatedClient(userId)
  const { data: attempt, error: attemptError } = await client.from('coding_test_attempts')
    .select('id,user_id,collection_id,language,selected_question_count,status,started_at,deadline_at,remaining_seconds,completed_at,daily_session_date')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .maybeSingle()
  throwQueryError(attemptError, 'Coding test attempt could not be loaded.', 'SELECT', 'public.coding_test_attempts')
  if (!attempt) throw new Error('This coding test attempt is unavailable for your account.')
  const { data: questions, error: questionsError } = await client.from('coding_test_attempt_questions')
    .select('question_id,question_order,code_by_language,submitted_at')
    .eq('attempt_id', attemptId)
    .order('question_order', { ascending: true })
  throwQueryError(questionsError, 'Questions and saved answers for this attempt could not be loaded.', 'SELECT', 'public.coding_test_attempt_questions')
  if (!questions?.length) throw new Error('This attempt has no selected questions. Return to the catalogue and start a new test.')
  const { data: submissions, error: submissionsError } = await client.from('coding_test_submissions')
    .select('question_id,language,status,passed_tests,total_tests,hidden_passed,hidden_total,score,max_score,execution_time_ms,memory_kb,stdout,stderr,compile_output,visible_results,created_at')
    .eq('attempt_id', attemptId)
    .order('created_at', { ascending: false })
    .limit(500)
  const evaluationStorageUnavailable = ['42P01', 'PGRST205'].includes(submissionsError?.code)
  if (submissionsError && !evaluationStorageUnavailable) {
    throwQueryError(submissionsError, 'Saved coding evaluations could not be loaded.', 'SELECT', 'public.coding_test_submissions')
  }
  return mapAttempt(attempt, questions, tests, submissions || [], !evaluationStorageUnavailable)
}

export async function listActiveCodingAttempts(userId, tests) {
  const { client } = await getAuthenticatedClient(userId)
  const { data, error } = await client.from('coding_test_attempts')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['in_progress', 'paused'])
    .order('started_at', { ascending: false })
    .limit(100)
  throwQueryError(error, 'Your active coding test could not be loaded.', 'SELECT', 'public.coding_test_attempts')
  return Promise.all((data || []).map(({ id }) => loadCodingAttempt(userId, id, tests)))
}

export async function listCodingAttemptHistory(userId) {
  const { client } = await getAuthenticatedClient(userId)
  const { data, error } = await client.from('coding_test_attempts')
    .select('id,collection_id,status,started_at,completed_at,daily_session_date,selected_question_count')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(10)
  throwQueryError(error, 'Coding test history could not be loaded.', 'SELECT', 'public.coding_test_attempts')
  return data || []
}

export async function startCodingAttempt(userId, collectionId, requestedCount, language, tests) {
  const { client } = await getAuthenticatedClient(userId)
  const { data, error } = await client.rpc('start_coding_test', {
    p_collection_id: collectionId,
    p_language: language,
    p_requested_count: requestedCount,
  })
  if (error?.code === '23505') {
    const { data: activeAttempt, error: activeAttemptError } = await client.from('coding_test_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('collection_id', collectionId)
      .in('status', ['in_progress', 'paused'])
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    throwQueryError(activeAttemptError, 'The existing coding test attempt could not be loaded.', 'SELECT', 'public.coding_test_attempts')
    if (activeAttempt) return loadCodingAttempt(userId, activeAttempt.id, tests)
  }
  throwQueryError(error, 'A coding test attempt could not be created. Please retry.', 'RPC', 'start_coding_test')
  const attemptId = typeof data === 'string' ? data : data?.id
  if (!attemptId) throw new Error('Supabase did not return the created coding test attempt.')
  return loadCodingAttempt(userId, attemptId, tests)
}

export async function saveCodingAnswer(userId, attemptId, questionId, language, code, submitted = false) {
  const { client } = await getAuthenticatedClient(userId)
  if (typeof code !== 'string' || code.length > 100_000) {
    throw new Error('Code must be 100,000 characters or fewer.')
  }
  const { data: existing, error: readError } = await client.from('coding_test_attempt_questions')
    .select('code_by_language')
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
    .maybeSingle()
  throwQueryError(readError, 'Your coding answer could not be loaded before saving.', 'SELECT', 'public.coding_test_attempt_questions')
  if (!existing) throw new Error('This question is not part of your active attempt.')

  const { data, error } = await client.from('coding_test_attempt_questions')
    .update({
      code_by_language: { ...(existing.code_by_language || {}), [language]: code },
      ...(submitted ? { submitted_at: new Date().toISOString() } : {}),
    })
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
    .select('question_id')
    .maybeSingle()
  throwQueryError(error, 'Your coding answer could not be saved.', 'UPDATE', 'public.coding_test_attempt_questions')
  if (!data) throw new Error('This attempt is no longer active. Your latest changes were not saved.')
  return submitted ? new Date().toISOString() : null
}

export async function updateCodingAttempt(userId, attemptId, changes) {
  const { client } = await getAuthenticatedClient(userId)
  const { data, error } = await client.from('coding_test_attempts')
    .update(changes)
    .eq('id', attemptId)
    .eq('user_id', userId)
    .select('id,language,status,deadline_at,remaining_seconds,completed_at')
    .maybeSingle()
  throwQueryError(error, 'Coding test attempt could not be updated.', 'UPDATE', 'public.coding_test_attempts')
  if (!data) throw new Error('This coding test attempt is no longer available to update.')
  return data
}

export async function runCodingSubmission({ code, language, questionId }) {
  if (!code || !language || !questionId) {
    return { status: 'unavailable', message: 'A code-execution service is not configured. Your code was not run.' }
  }
  return {
    status: 'unavailable',
    message: 'Code execution is not configured in this phase. Your code was saved, but it was not run or graded.',
  }
}

export async function runCodingAttemptCode(userId, { attemptId, questionId, language, code, mode }) {
  if (!userId || !attemptId || !questionId || !language || !code?.trim() || !['run', 'submit'].includes(mode)) {
    throw new Error('Choose an active attempt, question, language, and non-empty solution before running code.')
  }
  const { client } = await getAuthenticatedClient(userId)
  const { data, error } = await client.functions.invoke('coding-execution', {
    body: {
      attemptId,
      questionId,
      language,
      code,
      mode,
      idempotencyKey: crypto.randomUUID(),
    },
  })
  if (error) {
    let message = error.message || 'The secure execution service could not be reached.'
    if (error.context instanceof Response) {
      try {
        const body = await error.context.clone().json()
        if (typeof body?.error === 'string') message = body.error
        else if (typeof body?.message === 'string') message = body.message
      } catch {
        message = 'The secure execution service returned an unreadable error.'
      }
    }
    throw new Error(message)
  }
  if (!data || typeof data.status !== 'string') {
    throw new Error('The secure execution service returned an invalid result.')
  }
  return data
}
