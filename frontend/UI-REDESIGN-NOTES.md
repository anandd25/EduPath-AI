# EduPath UI Refresh

## Design direction
- Warm cream canvas (`#F4FAFF`) with deep teal typography (`#174F6B`).
- Muted blue primary actions (`#398FC4`) and sage-green supporting accents (`#438F85`).
- DM Sans body typography and DM Serif Display headings, with system fallbacks.
- Higher body-text contrast and stronger readability.
- Local SVG illustration at `public/edupath-learning.svg`; no third-party image URL is required.
- Existing Supabase auth, routes, profile wizard and API service are preserved.

## Run locally
1. Extract this ZIP.
2. Copy `.env.example` to `.env.local` and fill in your Supabase values.
3. Run `npm install`.
4. Run `npm run dev`.
5. Run `npm run build` to verify production compilation.

Google Fonts are loaded from Google Fonts when internet access is available; system fallbacks are provided.
