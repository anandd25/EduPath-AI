# EduPath AI — Interactive Budget-First Roadmap

This frontend includes the existing Supabase sign-in/profile wizard and the interactive roadmap embedded in the saved Future Profile page.

## Roadmap interaction
- Initially displays one Budget & Pathway Planning node with the student's saved annual budget.
- Clicking the node opens a right-side detail panel.
- The panel covers student fit, pathways from Class 10 to higher education/careers, international institution comparisons, scholarships, education-loan comparison factors, what-if scenarios, and assumptions/uncertainty.
- Select **Expand node** to reveal the roadmap phases. Use **Collapse roadmap** to hide them again.

## Configuration
Set these Vite environment variables before deploying:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE` (defaults to `https://edupath-ai-backend-9van.onrender.com`)

## Backend capability note
This UI is connected to the saved student profile and uses its budget/destination/funding preferences. The scenario explorer currently presents qualitative planning guidance in the frontend. The provided backend project exposes profile persistence only; verified live institution, scholarship, loan quotes, and generated AI pathway/scenario results require backend endpoints and current data sources. Do not treat the displayed framework as confirmed admissions or funding advice.

## Build
Run `npm install`, then `npm run build`.
