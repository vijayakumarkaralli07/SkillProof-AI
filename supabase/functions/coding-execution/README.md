# Coding execution setup

The `coding-execution` Edge Function validates the signed-in user and active attempt, reads cases with the server-side service role, and sends compatible submissions to a sandboxed Judge0 endpoint. Hidden cases and expected outputs are not returned to the browser or written into submission results.

The current function-call adapter supports JavaScript (Judge0 language 63), Python (71), and TypeScript (74). It requires a named function and test inputs formatted as JSON values or named assignments such as `values = [1, 2], target = 3`. SQL has no isolated fixture runner, and C, C++, Java, Go, and C# function harnesses are not implemented; these languages must not be represented as executed or graded.

The function submits asynchronously with `wait=false` and polls the returned Judge0 token. Set `JUDGE0_API_URL` to the HTTPS API base URL (for example, `https://ce.judge0.com`); the function normalizes a trailing slash or `/submissions` suffix. Each request writes structured stage logs with a request ID, without logging credentials or student source. Include the returned request ID when investigating provider failures in Supabase Edge Function logs.

## Configure and deploy

Set secrets for the linked Supabase project. For a self-hosted Judge0 instance, set `JUDGE0_API_URL` and `JUDGE0_API_KEY` if its API authentication is enabled. For RapidAPI, also set `JUDGE0_API_HOST`.

```powershell
npx supabase secrets set JUDGE0_API_URL=https://YOUR-JUDGE0-HOST JUDGE0_API_KEY=YOUR-SECRET JUDGE0_API_HOST=YOUR-RAPIDAPI-HOST --project-ref YOUR_PROJECT_REF
npx supabase functions deploy coding-execution --project-ref YOUR_PROJECT_REF
```

Do not put any of these values in `VITE_*` variables or browser code. If using a self-hosted endpoint without a key, omit `JUDGE0_API_KEY` and `JUDGE0_API_HOST`.

Apply the schema migration separately after reviewing it:

```powershell
npx supabase db push --linked
```

The function enforces a per-user limit of five requests per minute, a 100,000-character source limit, a ten-case cap per evaluation, and Judge0 CPU/wall-time/memory limits. Provider configuration and representative runtime results must be verified before treating execution as available.
