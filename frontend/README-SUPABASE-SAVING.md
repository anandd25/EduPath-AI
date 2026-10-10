# EduPath AI: Save student profiles to Supabase

## Frontend behavior

- The Save/submit action sends the completed profile to `POST /api/profiles` or `PUT /api/profiles/{id}`.
- A profile is not treated as saved if the API call fails; the UI displays an error instead of offering an offline-only success path.
- After authentication, the app fetches the current user's latest saved profile from the backend. Local storage is only a cache/draft convenience.
- Vercel variable names remain `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `VITE_API_BASE`. `vite.config.ts` exposes the URL and public anon/publishable key to the frontend bundle; never use a service-role key here.

## Required Render setup

1. Open Supabase → Connect (or Project Settings → Database) and copy a PostgreSQL connection URI. Prefer the session pooler URI if direct connections are unavailable from your host.
2. In Render → backend service → Environment, set `DATABASE_URL` to that URI. Do not set it to `sqlite:///./edupath.db`.
3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` on Render for backend JWT verification, plus `FRONTEND_URL=https://edu-path-ai-seven.vercel.app`.
4. Redeploy Render. The backend creates missing profile tables at startup and adds the `owner_id` column to an existing `student_profiles` table when needed. Existing SQLite data is not automatically migrated.
5. Redeploy Vercel so the existing `SUPABASE_URL` and `SUPABASE_ANON_KEY` variables are embedded at build time.

## Verify

- Log in, complete the wizard, and click Save.
- In the browser Network panel, `POST /api/profiles` should return 201 on first save, and `PUT /api/profiles/{id}` should return 200 on subsequent edits.
- In Supabase → Table Editor, check `student_profiles` and the related `student_subjects`, `student_interests`, `student_strengths`, and `student_priorities` tables.
- Sign out and sign in as another user; the first user's profiles must not be returned to the second user.

The app's profile records are stored in Supabase PostgreSQL through the FastAPI backend. Supabase Auth's user list is separate and will not show profile rows.
