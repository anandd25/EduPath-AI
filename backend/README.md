# EduPath AI backend

FastAPI service combining the B2 Supabase-authenticated profile API with the friend's graph-generation engine.

## Run locally
```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Required environment
- `DATABASE_URL`: use a Supabase PostgreSQL connection string in Render. URL-encode special characters in the database password.
- `SUPABASE_URL`: Supabase Project URL.
- `SUPABASE_ANON_KEY`: Supabase publishable/anon key used to verify bearer tokens against Supabase Auth.
- `FRONTEND_ORIGIN`: deployed Vercel URL, e.g. `https://edu-path-ai-seven.vercel.app`.
- `GROQ_API_KEY` (optional): enables the supplied Groq graph generation logic. If absent or provider generation fails, `/api/roadmap` returns a deterministic school-to-career fallback immediately.

Never use a Supabase service-role/secret key in the browser.

## Endpoints
- `GET /health`
- `POST /api/profiles` — save authenticated student's profile.
- `GET /api/profiles` — list only the authenticated student's profiles.
- `GET /api/profiles/{profile_id}` / `PUT` / `DELETE` — owner-scoped profile operations.
- `POST /api/roadmap` — accepts `{ "student_profile_snapshot": <saved profile response> }`; returns `{ "graph": ..., "source": "ai" | "fallback" }`.

The roadmap endpoint is called immediately after a successful profile save. Legacy profiles with no `owner_id` are not visible to authenticated users; migrate them deliberately if needed.
