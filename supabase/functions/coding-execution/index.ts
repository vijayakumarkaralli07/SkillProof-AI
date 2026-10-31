import { createClient } from 'npm:@supabase/supabase-js@2'
import { normalizeCodingOutput } from '../_shared/codingOutput.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const maxBodyBytes = 120_000
const maxSourceLength = 100_000
const runnerLanguages: Record<string, number> = {
  JavaScript: 63,
  Python: 71,
  TypeScript: 74,
}
const terminalJudge0Statuses = new Set([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

type JsonRecord = Record<string, unknown>
type CaseResult = {
  caseOrder: number
  input: string
  expectedOutput: string
  actualOutput: string
  status: 'passed' | 'failed' | 'compile_error' | 'runtime_error' | 'time_limit'
}

function diagnosticLog(requestId: string, stage: string, details: JsonRecord = {}) {
  console.info(JSON.stringify({ event: 'coding_execution', requestId, stage, ...details }))
}

function safeErrorDetails(error: unknown) {
  if (error instanceof Error) return { errorType: error.name, errorMessage: error.message.slice(0, 240) }
  return { errorType: 'UnknownError' }
}

function normalizedJudgeBaseUrl(value: string) {
  const parsed = new URL(value)
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('JUDGE0_API_URL must be an HTTPS base URL without credentials, query, or fragment.')
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, '')
  if (/\/submissions$/i.test(parsed.pathname)) {
    parsed.pathname = parsed.pathname.replace(/\/submissions$/i, '')
  }
  return parsed.toString().replace(/\/+$/, '')
}

async function providerErrorSummary(response: Response) {
  let summary = response.statusText || 'Provider rejected the request.'
  try {
    const body: unknown = await response.clone().json()
    if (isRecord(body)) {
      const code = [body.error_code, body.code].find((item) => typeof item === 'string')
      if (typeof code === 'string' && /^[A-Z0-9_ -]{1,60}$/i.test(code)) summary = code
    }
  } catch {
    summary = response.statusText || 'Provider returned a non-JSON error.'
  }
  return `${response.status} ${summary}`
    .replace(/(?:Bearer|Basic)\s+\S+/gi, '[credential redacted]')
    .replace(/(?:X-Auth-Token|X-RapidAPI-Key)\s*[:=]\s*\S+/gi, '[credential redacted]')
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 120)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' && value.length <= maxLength ? value : null
}

function splitTopLevel(source: string, separator: string) {
  const parts: string[] = []
  let start = 0
  let depth = 0
  let quote = ''
  let escaped = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === quote) quote = ''
    } else if (character === '"' || character === "'") {
      quote = character
    } else if ('[{('.includes(character)) {
      depth += 1
    } else if (']})'.includes(character)) {
      depth -= 1
      if (depth < 0) throw new Error('Malformed test input.')
    } else if (character === separator && depth === 0) {
      parts.push(source.slice(start, index).trim())
      start = index + 1
    }
  }
  if (quote || depth !== 0) throw new Error('Malformed test input.')
  parts.push(source.slice(start).trim())
  return parts.filter(Boolean)
}

function parseLiteral(source: string): unknown {
  const value = source.trim()
  try {
    return JSON.parse(value)
  } catch {
    const pythonLiteral = value
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
    return JSON.parse(pythonLiteral)
  }
}

function parseCaseArguments(input: string): unknown[] {
  const trimmed = input.trim()
  if (!trimmed) return []
  const fields = splitTopLevel(trimmed, ',')
  if (fields.every((field) => /^[A-Za-z_$][\w$]*\s*=/.test(field))) {
    return fields.map((field) => parseLiteral(field.slice(field.indexOf('=') + 1)))
  }
  if (fields.length === 1) return [parseLiteral(trimmed)]
  throw new Error('This question uses a test-input format the configured runner cannot parse.')
}

function getFunctionName(source: string, language: string) {
  const matcher = language === 'Python'
    ? /^\s*def\s+([A-Za-z_]\w*)\s*\(/m
    : /^\s*(?:export\s+)?(?:default\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/m
  return source.match(matcher)?.[1] ?? null
}

function makeSource(source: string, language: string, arguments_: unknown[]) {
  const functionName = getFunctionName(source, language)
  if (!functionName) throw new Error(`A named function is required for ${language} execution.`)
  const args = JSON.stringify(arguments_)
  if (language === 'Python') {
    return `${source}\n\nimport json as __sp_json\n__sp_args = __sp_json.loads(${JSON.stringify(args)})\n__sp_result = ${functionName}(*__sp_args)\nif isinstance(__sp_result, str):\n    print(__sp_result, end='')\nelse:\n    print(__sp_json.dumps(__sp_result, separators=(',', ':')))\n`
  }
  return `${source}\n\nconst __sp_args = JSON.parse(${JSON.stringify(args)});\nconst __sp_result = ${functionName}(...__sp_args);\nprocess.stdout.write(typeof __sp_result === 'string' ? __sp_result : JSON.stringify(__sp_result));\n`
}

function judgeHeaders(apiKey: string, apiHost: string | null) {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (apiHost) {
    headers.set('X-RapidAPI-Key', apiKey)
    headers.set('X-RapidAPI-Host', apiHost)
  } else if (apiKey) {
    headers.set('X-Auth-Token', apiKey)
  }
  return headers
}

async function executeCase(
  baseUrl: string,
  headers: Headers,
  languageId: number,
  sourceCode: string,
  evaluationDeadline: number,
  requestId: string,
) {
  const submissionResponse = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      language_id: languageId,
      source_code: sourceCode,
      stdin: '',
      cpu_time_limit: 2,
      cpu_extra_time: 1,
      wall_time_limit: 5,
      memory_limit: 128_000,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!submissionResponse.ok) {
    const summary = await providerErrorSummary(submissionResponse)
    diagnosticLog(requestId, 'judge0.submit.rejected', {
      httpStatus: submissionResponse.status,
      providerMessage: summary,
    })
    throw new Error(`Judge0 rejected the submission (${submissionResponse.status}): ${summary}`)
  }
  const queued: unknown = await submissionResponse.json()
  if (!isRecord(queued) || typeof queued.token !== 'string') {
    diagnosticLog(requestId, 'judge0.submit.invalid_response')
    throw new Error('Judge0 returned a malformed queue response.')
  }
  diagnosticLog(requestId, 'judge0.submit.queued')

  const token = encodeURIComponent(queued.token)
  for (let poll = 0; poll < 20; poll += 1) {
    await delay(500)
    const remaining = evaluationDeadline - Date.now()
    if (remaining <= 0) throw new Error('Evaluation exceeded the server execution window.')
    const pollResponse = await fetch(
      `${baseUrl}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory`,
      { headers, signal: AbortSignal.timeout(Math.min(4_000, remaining)) },
    )
    if (!pollResponse.ok) {
      const summary = await providerErrorSummary(pollResponse)
      diagnosticLog(requestId, 'judge0.poll.rejected', { httpStatus: pollResponse.status, poll, providerMessage: summary })
      throw new Error(`Judge0 result polling failed (${pollResponse.status}): ${summary}`)
    }
    const payload: unknown = await pollResponse.json()
    if (!isRecord(payload) || !isRecord(payload.status)) {
      diagnosticLog(requestId, 'judge0.poll.invalid_response', { poll })
      throw new Error('Judge0 returned a malformed result.')
    }
    const statusId = Number(payload.status.id)
    if (!terminalJudge0Statuses.has(statusId)) {
      diagnosticLog(requestId, 'judge0.poll.pending', { poll, statusId })
      continue
    }
    diagnosticLog(requestId, 'judge0.poll.terminal', { poll, statusId })
    return {
      statusId,
      stdout: typeof payload.stdout === 'string' ? payload.stdout : '',
      stderr: typeof payload.stderr === 'string' ? payload.stderr : '',
      compileOutput: typeof payload.compile_output === 'string' ? payload.compile_output : '',
      message: typeof payload.message === 'string' ? payload.message : '',
      time: typeof payload.time === 'number' ? payload.time
        : typeof payload.time === 'string' ? Number(payload.time) : null,
      memory: typeof payload.memory === 'number' ? payload.memory
        : typeof payload.memory === 'string' ? Number(payload.memory) : null,
    }
  }
  diagnosticLog(requestId, 'judge0.poll.timeout')
  throw new Error('Judge0 did not finish within the polling window.')
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID().slice(0, 12)
  const log = (nextStage: string, details: JsonRecord = {}) => diagnosticLog(requestId, nextStage, details)
  try {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  log('request.validating')
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return jsonResponse({ error: 'Sign in to run code.' }, 401)
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (contentLength > maxBodyBytes) return jsonResponse({ error: 'Request is too large.' }, 413)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400)
  }
  if (!isRecord(body)) return jsonResponse({ error: 'Invalid execution request.' }, 400)
  const attemptId = cleanText(body.attemptId, 80)
  const questionId = cleanText(body.questionId, 80)
  const language = cleanText(body.language, 40)
  if (typeof body.code === 'string' && body.code.length > maxSourceLength) {
    return jsonResponse({ error: 'Source code must be 100,000 characters or fewer.' }, 413)
  }
  const code = cleanText(body.code, maxSourceLength)
  const mode = body.mode
  const idempotencyKey = cleanText(body.idempotencyKey, 80)
  if (!attemptId || !questionId || !language || !code?.trim() || !idempotencyKey || !['run', 'submit'].includes(String(mode))) {
    return jsonResponse({ error: 'Attempt, question, language, code, mode, and idempotency key are required.' }, 400)
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return jsonResponse({ error: 'The idempotency key must be a UUID.' }, 400)
  }
  if (!runnerLanguages[language]) {
    return jsonResponse({ error: `Execution is not configured for ${language}. No code was run or graded.` }, 422)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const judgeUrl = Deno.env.get('JUDGE0_API_URL')?.replace(/\/+$/, '')
  const judgeKey = Deno.env.get('JUDGE0_API_KEY') ?? ''
  const judgeHost = Deno.env.get('JUDGE0_API_HOST') ?? null
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    log('configuration.missing_supabase_secret')
    return jsonResponse({ error: 'The execution service is not configured.', requestId }, 503)
  }
  if (!judgeUrl) {
    log('configuration.missing_judge0_url')
    return jsonResponse({ error: 'Judge0 is not configured. Set JUDGE0_API_URL in Edge Function secrets.', requestId }, 503)
  }
  if (judgeHost && !judgeKey) {
    log('configuration.missing_rapidapi_key')
    return jsonResponse({ error: 'JUDGE0_API_KEY is required when using a RapidAPI-hosted Judge0 endpoint.', requestId }, 503)
  }
  let baseUrl: string
  try {
    baseUrl = normalizedJudgeBaseUrl(judgeUrl)
  } catch (error) {
    log('configuration.invalid_judge0_url', { ...safeErrorDetails(error) })
    return jsonResponse({ error: 'JUDGE0_API_URL must be an HTTPS Judge0 base URL.', requestId }, 503)
  }

  log('authentication.start')
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) {
    log('authentication.failed', { errorCode: authError?.code ?? null })
    return jsonResponse({ error: 'Your session is invalid or expired. Sign in again.' }, 401)
  }
  log('authentication.succeeded')

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  log('attempt.lookup.start')
  const { data: attempt, error: attemptError } = await adminClient.from('coding_test_attempts')
    .select('id,user_id,collection_id,language,status')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (attemptError) {
    log('attempt.lookup.failed', { errorCode: attemptError.code ?? null })
    return jsonResponse({ error: 'The coding attempt could not be verified.', requestId }, 503)
  }
  if (!attempt || attempt.status !== 'in_progress') return jsonResponse({ error: 'This attempt is not active or is not owned by you.' }, 403)
  if (attempt.language !== language) return jsonResponse({ error: 'The selected language does not match this attempt.' }, 400)
  log('attempt.lookup.succeeded', { language })

  log('attempt.question_lookup.start')
  const { data: assignment, error: assignmentError } = await adminClient.from('coding_test_attempt_questions')
    .select('question_id,code_by_language')
    .eq('attempt_id', attempt.id)
    .eq('question_id', questionId)
    .maybeSingle()
  if (assignmentError) {
    log('attempt.question_lookup.failed', { errorCode: assignmentError.code ?? null })
    return jsonResponse({ error: 'The attempt question could not be verified.', requestId }, 503)
  }
  if (!assignment) return jsonResponse({ error: 'This question is not assigned to the active attempt.' }, 403)

  const { data: question, error: questionError } = await adminClient.from('coding_questions')
    .select('id,collection_id,publication_status,starter_code_by_language,points')
    .eq('id', questionId)
    .eq('collection_id', attempt.collection_id)
    .eq('publication_status', 'published')
    .maybeSingle()
  if (questionError) {
    log('question.lookup.failed', { errorCode: questionError.code ?? null })
    return jsonResponse({ error: 'The coding question could not be loaded.', requestId }, 503)
  }
  if (!question || typeof question.starter_code_by_language?.[language] !== 'string') {
    return jsonResponse({ error: 'This question has no compatible starter contract for the selected language.' }, 422)
  }

  const { data: cases, error: caseError } = await adminClient.from('coding_test_cases')
    .select('case_order,test_input,expected_output,visibility')
    .eq('question_id', question.id)
    .order('case_order', { ascending: true })
  if (caseError) {
    log('test_cases.lookup.failed', { errorCode: caseError.code ?? null })
    return jsonResponse({ error: 'Test cases could not be loaded securely.', requestId }, 503)
  }
  const selectedCases = (cases ?? []).filter((testCase) => mode === 'submit' || testCase.visibility === 'visible')
  if (!selectedCases.length) return jsonResponse({ error: 'No eligible test cases are configured for this question.' }, 422)
  if (selectedCases.length > 10) return jsonResponse({ error: 'This question has more than 10 test cases; split its evaluation before enabling execution.' }, 422)

  const existingResult = mode === 'submit'
    ? await adminClient.from('coding_test_submissions')
      .select('id,status,passed_tests,total_tests,hidden_passed,hidden_total,score,max_score,visible_results,stdout,stderr,compile_output,execution_time_ms,memory_kb')
      .eq('user_id', user.id)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()
    : { data: null, error: null }
  if (existingResult.error) {
    log('submission.idempotency_lookup.failed', { errorCode: existingResult.error.code ?? null })
    return jsonResponse({ error: 'Submission state could not be checked.', requestId }, 503)
  }
  if (existingResult.data) {
    const saved = existingResult.data
    return jsonResponse({
      submissionId: saved.id,
      status: saved.status,
      passedTests: saved.passed_tests,
      totalTests: saved.total_tests,
      hiddenPassed: saved.hidden_passed,
      hiddenTotal: saved.hidden_total,
      score: saved.score,
      maxScore: saved.max_score,
      visibleResults: saved.visible_results,
      stdout: saved.stdout,
      stderr: saved.stderr,
      compileOutput: saved.compile_output,
      executionTimeMs: saved.execution_time_ms,
      memoryKb: saved.memory_kb,
      message: saved.status === 'accepted' ? 'All evaluation test cases passed.' : 'The saved evaluation result was restored.',
    })
  }

  log('rate_limit.reserve.start')
  const { data: allowed, error: rateError } = await adminClient.rpc('reserve_coding_execution', { p_user_id: user.id })
  if (rateError) {
    log('rate_limit.reserve.failed', { errorCode: rateError.code ?? null })
    return jsonResponse({ error: 'Execution rate limiting is unavailable.', requestId }, 503)
  }
  if (allowed !== true) return jsonResponse({ error: 'Execution limit reached. Wait one minute and retry.' }, 429)
  log('rate_limit.reserve.succeeded', { caseCount: selectedCases.length, mode })

  const headers = judgeHeaders(judgeKey, judgeHost)
  const caseResults: CaseResult[] = []
  let totalTimeMs = 0
  let maxMemoryKb = 0
  let finalStatus = 'accepted'
  let visibleStdout = ''
  let visibleStderr = ''
  let visibleCompileOutput = ''
  const evaluationDeadline = Date.now() + 45_000
  log('evaluation.start', { mode, language, caseCount: selectedCases.length })

  try {
    for (const testCase of selectedCases) {
      const args = parseCaseArguments(testCase.test_input)
      const sourceCode = makeSource(code, language, args)
      const run = await executeCase(
        baseUrl,
        headers,
        runnerLanguages[language],
        sourceCode,
        evaluationDeadline,
        requestId,
      )
      if (run.statusId === 13) throw new Error('Judge0 reported an internal execution error.')
      totalTimeMs += run.time === null ? 0 : Math.round(run.time * 1000)
      maxMemoryKb = Math.max(maxMemoryKb, run.memory ?? 0)
      if (testCase.visibility === 'visible') {
        visibleStdout = normalizeCodingOutput(run.stdout)
        visibleStderr = run.stderr
        visibleCompileOutput = run.compileOutput
      }

      const status: CaseResult['status'] = run.statusId === 6 ? 'compile_error'
        : run.statusId === 5 ? 'time_limit'
          : [7, 8, 9, 10, 11, 12, 14].includes(run.statusId) ? 'runtime_error'
            : run.statusId === 3 && normalizeCodingOutput(run.stdout) === normalizeCodingOutput(testCase.expected_output) ? 'passed' : 'failed'
      caseResults.push({
        caseOrder: testCase.case_order,
        input: testCase.visibility === 'visible' ? testCase.test_input : '',
        expectedOutput: testCase.visibility === 'visible' ? testCase.expected_output : '',
        actualOutput: testCase.visibility === 'visible' ? normalizeCodingOutput(run.stdout) : '',
        status,
      })
      log('evaluation.case.finished', { caseOrder: testCase.case_order, visibility: testCase.visibility, status })
      if (status === 'compile_error') finalStatus = 'compile_error'
      else if (status === 'runtime_error' && finalStatus !== 'compile_error') finalStatus = 'runtime_error'
      else if (status === 'time_limit' && !['compile_error', 'runtime_error'].includes(finalStatus)) finalStatus = 'time_limit'
      else if (status === 'failed' && finalStatus === 'accepted') finalStatus = 'wrong_answer'
    }
  } catch (error) {
    log('evaluation.provider_failed', { ...safeErrorDetails(error) })
    const message = error instanceof Error ? error.message : 'Judge0 execution request failed.'
    return jsonResponse({ error: message, status: 'service_error', requestId, passedTests: 0, totalTests: selectedCases.length }, 503)
  }

  const passedTests = caseResults.filter((item) => item.status === 'passed').length
  const visibleResults = caseResults.filter((_, index) => selectedCases[index]?.visibility === 'visible')
  const hiddenTotal = mode === 'submit' ? selectedCases.filter((item) => item.visibility === 'hidden').length : 0
  const hiddenPassed = mode === 'submit'
    ? caseResults.filter((item, index) => selectedCases[index]?.visibility === 'hidden' && item.status === 'passed').length
    : 0
  const maxScore = Number(question.points) || 0
  const score = mode === 'submit' && selectedCases.length > 0
    ? Math.floor(maxScore * passedTests / selectedCases.length)
    : 0
  const responseStatus = mode === 'run' && finalStatus === 'accepted' ? 'passed' : finalStatus
  const publicResult = {
    status: responseStatus,
    message: finalStatus === 'accepted'
      ? mode === 'run' ? 'All visible test cases passed.' : 'All evaluation test cases passed.'
      : finalStatus === 'wrong_answer' ? 'One or more test cases failed.'
        : finalStatus === 'compile_error' ? 'The program did not compile.'
          : finalStatus === 'time_limit' ? 'The program exceeded the execution time limit.'
            : 'The program terminated with a runtime error.',
    stdout: visibleStdout,
    stderr: visibleStderr,
    compileOutput: visibleCompileOutput,
    passedTests,
    totalTests: selectedCases.length,
    hiddenPassed,
    hiddenTotal,
    score,
    maxScore,
    executionTimeMs: totalTimeMs,
    memoryKb: maxMemoryKb || null,
    visibleResults,
  }

  if (mode === 'submit') {
    log('submission.attempt_revalidation.start')
    const { data: currentAttempt, error: currentAttemptError } = await adminClient.from('coding_test_attempts')
      .select('id')
      .eq('id', attempt.id)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .maybeSingle()
    if (currentAttemptError) {
      log('submission.attempt_revalidation.failed', { errorCode: currentAttemptError.code ?? null })
      return jsonResponse({ error: 'The attempt status could not be revalidated before saving evaluation.', requestId }, 503)
    }
    if (!currentAttempt) return jsonResponse({ error: 'The attempt is no longer active; the evaluation was not saved as a submission.' }, 409)

    log('submission.persist.start', { status: finalStatus, passedTests, totalTests: selectedCases.length })
    const { data: savedSubmission, error: saveError } = await adminClient.from('coding_test_submissions')
      .insert({
        attempt_id: attempt.id,
        question_id: question.id,
        user_id: user.id,
        idempotency_key: idempotencyKey,
        language,
        mode,
        status: finalStatus,
        passed_tests: passedTests,
        total_tests: selectedCases.length,
        hidden_passed: hiddenPassed,
        hidden_total: hiddenTotal,
        score,
        max_score: maxScore,
        execution_time_ms: totalTimeMs,
        memory_kb: maxMemoryKb || null,
        stdout: visibleStdout.slice(0, 20_000),
        stderr: visibleStderr.slice(0, 20_000),
        compile_output: visibleCompileOutput.slice(0, 20_000),
        visible_results: visibleResults,
      })
      .select('id')
      .single()
    if (saveError || !savedSubmission) {
      log('submission.persist.failed', { errorCode: saveError?.code ?? null })
      return jsonResponse({ error: 'The evaluated submission could not be saved.', requestId }, 503)
    }
    const { error: answerSaveError } = await adminClient.from('coding_test_attempt_questions')
      .update({
        code_by_language: { ...(assignment.code_by_language ?? {}), [language]: code },
        submitted_at: new Date().toISOString(),
      })
      .eq('attempt_id', attempt.id)
      .eq('question_id', question.id)
    if (answerSaveError) {
      log('submission.answer_persist.failed', { errorCode: answerSaveError.code ?? null })
      return jsonResponse({ error: 'Evaluation was saved, but the submitted answer state could not be updated.', requestId }, 503)
    }
    log('submission.persist.succeeded')
    return jsonResponse({ ...publicResult, submissionId: savedSubmission.id })
  }
  return jsonResponse(publicResult)
  } catch (error) {
    log('request.unhandled_exception', { ...safeErrorDetails(error) })
    return jsonResponse({
      error: 'The coding execution request failed unexpectedly.',
      status: 'service_error',
      requestId,
    }, 503)
  }
})
