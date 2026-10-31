# Service layer

Supabase Auth client and account operations live here. Add job/resume API request logic only when real backend endpoints are defined; do not add mock API implementations.

`resumeService.js` lists, loads, and inserts user-owned records in `public.resumes`; its RLS policies restrict access to the authenticated owner, and inserts create new records instead of overwriting existing ones. Resume Builder saves only the entered form content and template (not preview fallback content). Open a saved record with its ID to load its saved content and template; saving edits creates a separate record. Apply the pending `20261027000200_resumes.sql` and `20261027000300_resume_persistence.sql` migrations before using account resume storage. The `resume-ai` Supabase Edge Function validates authenticated requests and keeps the Gemini key server-side. The browser asks for explicit consent before each AI request.

`resumePdfService.js` generates a paginated PDF from a saved resume's actual content and template ID, then downloads it with a sanitized filename. It does not render the preview or include template sample data; Saved Resumes reloads the selected account record through `resumeService.js` before export.

`resumeScannerService.js` submits an authenticated PDF/DOCX multipart upload to the existing `resume-ai` Edge Function after explicit consent. PDFs are sent as Gemini PDF document input; DOCX XML text is extracted transiently in the function. The original file is not retained. The scanner writes pending, completed, or failed scan metadata and the structured report to `public.resume_scans`, with owner-only RLS access; apply the resume persistence migration before scanning.

`mockInterviewQuestionService.js` supplies the live interview with clearly labelled sample questions from `src/data/sampleMockInterviewQuestions.js`. It selects a fixed 10-question set using the chosen topics, interview type, difficulty, and role. Replace this provider only when an authorized, user-scoped question service is available. Live microphone capture is temporary and local to the browser; audio is not uploaded or retained, and transcription/evaluation history is not persisted.

`codingTestService.js` reads published collections and questions from Supabase and creates owner-scoped attempts through `start_coding_test`. The linked database currently contains 20 published collections with five published questions per collection; the bank is short of the requested 50 distinct questions per daily session. The pending `20261029000200_coding_daily_sessions.sql` migration reuses attempts and their ordered question assignments as per-user, per-collection daily sessions. It uses UTC dates, retains existing assignments as exposure history, and picks unseen questions before least-recently-seen questions. The service restores saved order, drafts, submissions, and timer state for a resumed attempt. Submission and evaluation run through the authenticated `coding-execution` Edge Function and Judge0; only its configured JavaScript, Python, and TypeScript function adapters execute code. Other languages remain save-only.

`careerJourneyService.js` is the replaceable account-data boundary for Build Your Career. No career-journey table, migration, or API is configured in this project, so the service retains demo changes in volatile memory keyed by the authenticated user ID only while the app remains open. It does not use browser storage and does not claim account persistence. Connect an authorized user-scoped backend before treating questionnaire answers, self-assessments, plans, milestones, project evidence, or completion status as saved.

`careerProjectsService.js` provides the curated Build Real Projects catalogue and a browser-session demo store keyed by the authenticated user ID. Project attempts, saved project IDs, milestone self-checks, and edited HTML/CSS/JavaScript are retained in `sessionStorage` for refresh recovery during the current browser session; no project database or backend API is configured. The workspace preview uses a sandboxed iframe and does not provide backend execution, automated tests, external evaluation, deployment, or portfolio publishing. Submission is labelled awaiting review, and the portfolio action reports unavailable until a user-scoped service is connected.

`himalayasJobsService.js` requests real job results from the authenticated `jobs-search` Edge Function. The function forwards only validated keyword, country, seniority, employment type, and page filters to Himalayas' public search API; it requires the user's Supabase JWT, has no provider API key, and returns validated provider fields. Apply actions use the provider's `applicationLink` unchanged. The Jobs page visibly attributes listings and links the Himalayas API terms.

## Application delivery

`nativeApplicationService.js` separates SkillProof AI employer submissions from the existing student-owned `job_applications` tracker. Native listings live in `public.native_jobs`; submitted records live in `public.native_job_applications`. The additive `20261027000400_native_job_applications.sql` migration enforces open-job ownership, authenticated applicant identity, saved-resume ownership/content, required job questions, duplicate prevention, recruiter-only status updates, and applicant/employer read access through PostgreSQL constraints, a validation trigger, and RLS. The selected resume is snapshotted into the private application row after the applicant explicitly reviews and submits it; no public Storage bucket or external document upload is used.

Native job records are currently provisioned by an authorized administrator in Supabase SQL Editor. The signup `Recruiter` role is only a navigation hint and is not an authorization claim. Set `employer_id` to the authenticated recruiter account UUID, and use only a company name and job details verified by your organization. Example (replace the values before running):

```sql
insert into public.native_jobs (
  employer_id, title, company_name, location, employment_type,
  description, status, required_fields
) values (
  'REPLACE_WITH_RECRUITER_USER_UUID',
  'Product Designer',
  'Verified Example Employer',
  'Remote',
  'Full Time',
  'Replace with the approved job description.',
  'open',
  '[{"id":"portfolio_url","label":"Portfolio URL","type":"url","required":false}]'::jsonb
);
```

Apply the pending schema migrations with `npx supabase db push --linked`. A recruiter assigned to the inserted job can review its applications at `/recruiter/applications`; RLS returns no other employer's applications. Email delivery is not configured, so new submissions are visible in this authenticated dashboard only.

The additive `20261027000500_application_lifecycle.sql` migration adds the common `saved`, `preparing`, `applied`, `assessment`, `under_review`, `interview`, `offer`, `rejected`, and `withdrawn` lifecycle, plus a protected append-only status history. Applicant and assigned-employer status changes are captured atomically with the actor, timestamp, source, note, and available follow-up/assessment/interview dates. Recruiter dashboard changes are labeled employer-reported manual updates; this project has no ATS/webhook integration and does not create verified employer events. Statuses do not change automatically with time.

The Himalayas `Prepare Application` flow is separate. It opens the API-provided application link unchanged and saves a user-owned `preparing` tracker entry. The student must explicitly confirm submission before it can be marked applied; the saved event is student-reported, not independently verified. SkillProof AI does not submit external applications.

To deploy and smoke-test the live job search after reviewing the Edge Function:

1. `npx supabase functions deploy jobs-search` — success reports that `jobs-search` deployed; JWT verification remains enabled.
2. Sign in to SkillProof AI, open Jobs, and search for `software engineer`, then `frontend developer`. Successful searches show current Himalayas listings, the provider attribution, and application links.
3. Search for a deliberately unique phrase such as `zzqv-no-such-role-2026`; the UI should show an empty state without sample listings.
4. To test rate-limit and upstream error UI, use the function's returned `429` or `502` response via a controlled staging stub or provider response; do not generate excess public API traffic. The UI presents a retry action.

The public provider can rate-limit unauthenticated upstream traffic. A provider API key is intentionally not required or configured for this initial phase.