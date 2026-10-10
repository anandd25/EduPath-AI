# EduPath AI Backend — Supabase Auth + owned student profiles

FastAPI and SQLAlchemy API for EduPath AI. All `/api/profiles` endpoints require a valid Supabase access token in `Authorization: Bearer <access_token>`. The API validates the token with Supabase Auth and derives the owner from the verified user ID; it never trusts a user ID supplied by the browser.

## Render environment variables

Set these in the Render backend service (not only in Vercel):

- `DATABASE_URL`: your working PostgreSQL connection URL. URL-encode reserved characters in the username/password; never commit this value.
- `SUPABASE_URL`: the Supabase project URL, e.g. `https://<project-ref>.supabase.co`.
- `SUPABASE_ANON_KEY`: the public anon/publishable key for that same project. Do not use a service-role key.
- `FRONTEND_URL`: `https://edu-path-ai-seven.vercel.app` (or your exact production frontend origin).

The backend also accepts `FRONTEND_ORIGIN` for compatibility with older deployments. Do not put the database password or service-role key in frontend `VITE_` variables.

## Deploy

Use the backend folder as Render's Root Directory if the repo contains the frontend and backend together. Build/install command: `pip install -r requirements.txt`. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.

On startup, the app creates missing tables and adds an `owner_id` column/index to an existing `student_profiles` table if needed. Existing profiles with no owner are intentionally hidden from every user rather than assigned to the first person who signs in. If you need to retain access to old rows, review and assign ownership manually using a trusted admin process before exposing them.

## Routes

- `GET /` and `GET /health`: health checks (no login required)
- `POST /api/profiles`: create a profile for the signed-in user
- `GET /api/profiles`: list only the signed-in user's profiles
- `GET /api/profiles/{id}`: read only a profile owned by the signed-in user
- `PUT /api/profiles/{id}`: update only a profile owned by the signed-in user
- `DELETE /api/profiles/{id}`: delete only a profile owned by the signed-in user

Unauthenticated profile requests return `401`; attempts to access another user's profile return `404`.

## Local development

```bash
python -m venv .venv
# macOS/Linux: source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
cp .env.example .env  # then set real values
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000/docs`. A real Supabase access token is required for profile routes.


## Important: make Supabase PostgreSQL the production database

In Render, set `DATABASE_URL` to the PostgreSQL connection string shown in Supabase → Project Settings → Database (or Connect). Use the PostgreSQL/SQLAlchemy-compatible URI and URL-encode reserved characters in the database password. Do not set this to a `sqlite:///...` path in production. The backend deliberately refuses to start on Render without a PostgreSQL URL so profile saves cannot silently go into a local `edupath.db` file.

The `POST /api/profiles` and `PUT /api/profiles/{id}` endpoints require a valid Supabase access token and assign the profile to that authenticated user. `GET /api/profiles` returns only the current user's profiles. The frontend now treats a failed save as an error rather than offering to continue with an unsaved local-only profile.
