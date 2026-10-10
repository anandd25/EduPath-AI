# EduPath AI frontend

Dark, neon-gradient React/Vite UI with animated login, profile collection and career roadmap nodes.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```

Vite config explicitly maps only `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the frontend Supabase client, preserving your current deployment variable names. Only use the public anon/publishable key here, never the service-role key. `VITE_API_BASE` points to the FastAPI service.

## Deploy
- Vercel frontend environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VITE_API_BASE`.
- Render backend environment variables: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `FRONTEND_ORIGIN`, and optionally `GROQ_API_KEY`.
- Redeploy after changing environment variables.
