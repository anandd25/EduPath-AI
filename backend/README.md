# PathPilot Backend

FastAPI + LangChain + Groq backend corresponding to the React frontend.

## 1. Create environment
Python 3.10+ recommended.

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Configure Groq

Copy `.env.example` to `.env` and add:

```env
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_ORIGIN=http://localhost:5173
```

If `GROQ_API_KEY` is empty, the backend automatically uses deterministic fallback pathway/scenario data, so the frontend can still be developed locally.

## 3. Run

```bash
uvicorn app.main:app --reload --port 8000
```

API:
- `GET /health`
- `POST /api/pathways`
- `POST /api/scenarios`

Swagger UI: `http://localhost:8000/docs`

## Architecture

React/Vite
  -> FastAPI
    -> Pydantic validation
    -> LangChain prompt + structured output
    -> Groq model
    -> transparent PathwayResponse / ScenarioResponse
    -> fallback engine if Groq is unavailable

Important production extension:
Live institution, scholarship, admissions, visa and loan data should come from verified/current providers or official sources rather than being invented by the LLM. The API deliberately labels assumptions and uncertainty.
