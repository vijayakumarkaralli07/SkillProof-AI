# SkillProof AI

SkillProof AI is a React/Vite career-development frontend. Email/password authentication and Google and GitHub OAuth are implemented through Supabase Auth. Provider flows require the project and external provider configuration below; they have not been verified against real provider credentials in this repository. Jobs, Applications, Analytics, Saved Jobs, Resume Studio, and Interview Prep include frontend demo experiences. Coding Knowledge stores its catalogue, attempts, saved answers, and evaluated submissions in Supabase; the `coding-execution` Edge Function uses Judge0 for its configured function-based languages. The additive daily-session migration described below is pending and must be applied before deploying the matching frontend. The Resume Builder supports an in-session draft and browser print-to-PDF; scanner upload checks run locally, while scan scores, writing suggestions, job matching, saved records, and resume history are illustrative. Secure resume storage, file scanning, job feeds, and live AI services are not connected.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
Copy-Item .env.example .env.local
# Edit .env.local with your Supabase values and exact app origin
npm run dev
```

Vite prints its URL. Use that exact origin consistently for local callback configuration. Run `npm run build` and `npm run lint` for checks.

`.env.local` must define:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_APP_ORIGIN=http://127.0.0.1:5173
```

Set `VITE_APP_ORIGIN` to the exact origin you open in the browser (including scheme and port; no path). For local development, use either `http://127.0.0.1:5173` or `http://localhost:5173` consistently. The code rejects auth callbacks from any other origin. The publishable key is intended for frontend use. Never put provider client secrets, a Supabase service-role key, or other private credentials in Vite variables or frontend code. Supabase persists its own auth session; passwords are never written by this app to local storage.

If configuration is missing or invalid, email and provider actions show an error and protected routes remain closed. There is no fake-auth fallback.

### Database migrations

Database schema and row-level security migrations are in `supabase/migrations`. Before applying them, inspect the project's migration history and reconcile any migration that has already been applied. For a new or up-to-date project, apply the files in filename order with the Supabase CLI (`supabase link --project-ref <project-ref>` followed by `supabase db push`). The user-data schema migration creates missing service-backed tables; the following migration enables owner-only access, and the latest migration also requires each lesson-progress row to reference a plan owned by the same user. Do not mark migrations as applied unless their SQL has actually run successfully.

#### Coding tests

The applied catalogue migrations create `coding_test_sets`, `coding_questions`, and `coding_test_cases`. A read-only count query against the linked project found 20 published collections and **five published questions per collection** (100 total). The new `20261029000300_coding_question_bank_batch_01.sql` migration adds two distinct questions per collection (40 total), but is not yet applied; even after it is applied, the bank will have only seven questions per collection and will not support 50-question daily sessions. Authenticated users can read published sets and questions, and visible cases for published questions. Hidden cases are denied by Row Level Security to ordinary client roles.

The applied attempt and practice-improvement migrations add owner-protected `coding_test_attempts` and `coding_test_attempt_questions`, plus the authenticated-only `start_coding_test(uuid, text, integer)` RPC. Assigning a question to an attempt records that exposure even when the student skips or leaves it unanswered; answer drafts, order, language, timer, and submissions are stored separately per attempt. Submission history and Judge0-backed execution use `coding_test_submissions` and the `coding-execution` Edge Function. Only the function's configured function-based JavaScript, Python, and TypeScript adapters are executed; other languages remain save-only.

The `20261029000200_coding_daily_sessions.sql` migration reuses attempts as daily sessions, keyed by authenticated user, collection, and UTC date. Same-day requests return the saved attempt; new sessions select unseen questions first and then least-recently-seen questions without duplicates. UTC is used because the coding feature has no saved user timezone setting. Existing attempts are not rewritten, and historical question assignments continue to count as exposure. This migration removes the former one-active-attempt-per-track index so a new day's attempt can coexist with an older paused attempt; a unique partial index prevents duplicate daily sessions.

The latest `npx supabase db push --linked --dry-run` listed only `20261029000300_coding_question_bank_batch_01.sql` as pending. After reviewing it, `npx supabase db push --linked` applies all pending migrations; it does not select a single file. A full 50-question session is available only after each collection has at least 50 valid published questions, and two full non-repeating daily sessions require at least 100. Do not mark migrations as applied or expose the Supabase service-role credential to the browser.

## Supabase setup

1. Create a Supabase project. In **Project Settings → API**, copy the project URL and publishable key into `.env.local`.
2. In **Authentication → URL Configuration**, set the Site URL to the production app origin. Add exact app callback URLs to the redirect allow list, including the local origin used by Vite, for example `http://127.0.0.1:5173/auth/callback` and `http://localhost:5173/auth/callback`, plus the production `https://your-domain/auth/callback`. Keep `VITE_APP_ORIGIN` in sync with the exact origin being used.
3. In **Authentication → Providers**, enable Email and decide whether email confirmation is required. The app waits for a session before opening the dashboard; when confirmation is required, the user must follow Supabase's email link first.
4. In Supabase Auth URL Configuration, set the email confirmation redirect to an allowed app callback URL if your email templates or project settings require it.

The app uses a fixed `/auth/callback` on the current origin. It does not accept a user-supplied `next` redirect. OAuth roles are kept temporarily in session storage while redirecting and saved to Supabase user metadata only if no supported role is already present. This role is profile information only, not authorization. Do not use client metadata to enforce recruiter/college permissions. Database profile and career records are keyed to the Supabase Auth user ID and protected by row-level security after the migrations above are applied.

## OAuth provider checklist

For each provider, copy the **Supabase callback URL** shown on that provider's page under **Authentication → Providers**. It is normally `https://<project-ref>.supabase.co/auth/v1/callback`. Register that URL with the provider, then enter its client ID and client secret in the Supabase Dashboard provider settings. Do not put provider secrets in `.env.local`.

**Identity-linking security gate:** Supabase Auth currently automatically links provider identities that have the same verified email address. This happens server-side, before this frontend can inspect the resulting session; client code cannot prevent or undo it. The app does not invoke `linkIdentity()` or merge profiles itself. Before enabling social providers, review the current manual identity-linking setting in Supabase Auth and verify the hosted project's behavior against your policy. If matching verified email must never cause an automatic link and your Supabase configuration cannot disable that behavior, leave social providers disabled until the account-linking architecture is changed. Do not treat matching email alone as application authorization.

### Google

- In Google Cloud Console, configure the OAuth consent screen / Google Auth Platform audience and create a Web OAuth client.
- Add the local app origin (for example `http://127.0.0.1:5173`) and production origin as authorized JavaScript origins.
- Add the Supabase callback URL as an authorized redirect URI. Configure the basic `openid`, email, and profile access required by Supabase; no additional Google APIs are requested here.
- Enable Google in Supabase **Authentication → Providers** and enter the Google client ID and secret.
- The app asks Google to show its account-selection screen with `prompt=select_account`; Google itself handles account authentication, consent, and verification.

### GitHub

- In GitHub **Settings → Developer settings → OAuth Apps**, register an OAuth app with the correct app homepage.
- Set its Authorization callback URL to the Supabase callback URL.
- Enable GitHub in Supabase **Authentication → Providers** and enter the GitHub client ID and secret. Keep the requested profile/email access to the minimum required by the provider configuration.

Provider dashboard labels can change. Confirm the callback and permitted scopes shown by each current console before testing. OAuth has not been end-to-end tested until these credentials and redirect entries are configured.

## Test flows

- Without `.env.local`, try Login, Create Account, and each provider button: each should display a configuration error, and `/dashboard` should redirect to `/login`.
- With Supabase Email enabled, register using a valid email and the selected role. With confirmations enabled, follow the email link and return through `/auth/callback`; without confirmation, a successful session goes to the dashboard immediately.
- Test incorrect credentials, an unverified email, provider denial/cancel, refresh after sign-in, and Log out. A refresh should restore only the Supabase-managed session.
- Social OAuth can only be tested after completing the provider checklist and adding the app callback URL to Supabase's redirect allow list. No provider credentials are included in this repo.

## Project layout

```text
public/                 Brand assets
src/components/auth/    Login, role selector, shared OAuth controls
src/hooks/              Supabase session listener and auth context
src/pages/              Auth, dashboard, and career-tool pages
src/services/           Supabase client, auth operations, and demo listing data
src/styles/             Responsive white-and-green application UI
src/utils/               Form validation
```
