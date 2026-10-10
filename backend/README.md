# EduPath AI — Updated Backend

FastAPI backend for the EduPath AI frontend: authenticated student profile CRUD, budget-aware pathway graph generation, node expansion, and what-if scenario planning.

## Run locally

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Render configuration

Set the Render root directory to the folder containing `main.py` (the extracted backend folder), and use build command `pip install -r requirements.txt` and start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.

Required environment variables:
- `DATABASE_URL`: PostgreSQL/Supabase database connection string for deployed data persistence.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: public anon/publishable key used by the backend to validate the user's bearer token.
- `FRONTEND_ORIGIN`: `https://edu-path-ai-seven.vercel.app` (or comma-separated allowed Vercel origins).
- `GROQ_API_KEY`: optional; enables model-generated pathway graphs. Without it, a deterministic budget-aware fallback graph is returned.
- `GROQ_MODEL`: optional, defaults to `llama-3.3-70b-versatile`.

Never place a Supabase service-role key in frontend variables or commit real `.env` credentials.

## Endpoints

- `GET /health` — health check.
- `POST /api/profiles`, `GET /api/profiles`, `GET/PUT/DELETE /api/profiles/{profile_id}` — authenticated, owner-scoped profile storage.
- `POST /api/roadmap` — authenticated graph generation; accepts `student_profile_snapshot`, with optional `current_graph`, `current_node_ids_to_expand`, `candidate_node_count`, and `generation_intent` for expand-node requests.
- `POST /api/pathways` — compatibility alias for roadmap generation.
- `POST /api/scenarios` — budget reduction and unavailable-course scenario planning. This is a transparent deterministic simulation, not a live market-data service.

Roadmap output distinguishes AI vs fallback source. The fallback includes budget planning, multiple pathway stages, funding comparison factors, alternative scenarios, and a decision matrix. It does not claim to have live-verified institution fees, scholarships, admissions, or lender terms.

The profile API requires a valid Supabase access token in `Authorization: Bearer <access_token>`. Configure Supabase auth in the frontend and `SUPABASE_URL`/`SUPABASE_ANON_KEY` on the backend. Existing databases get a safe additive `owner_id` column migration; old rows with no owner are not exposed to authenticated users automatically.
