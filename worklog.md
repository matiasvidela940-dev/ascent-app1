---
Task ID: 2
Agent: Main
Task: Fix app to work with real Supabase data - remove mock data, add athlete creation form, fix column name mismatch

Work Log:
- Diagnosed blank page issue: dev server wasn't running + Supabase tables were empty
- Discovered critical column name mismatch: SQL schema used snake_case (access_code) but code used camelCase (accessCode)
- Verified Supabase tables exist with camelCase columns (user ran updated SQL)
- Inserted test data directly via Supabase REST API:
  - Mateo Ruiz (ASCENT01, INTERMEDIO) with 7 training days (BASE week)
  - Valentina Torres (ASCENT02, ELITE) with 7 training days (CARGA week)
- Fixed Supabase client to use lazy initialization (Proxy pattern) for better stability with Turbopack
- Fixed /api/setup route: removed write test from GET (caused crashes), added createdAt/updatedAt to POST insert
- Fixed /api/coach route: added createdAt/updatedAt to createAthlete insert
- Fixed /api/auth route: added accessCode to athlete response object
- Updated store.ts: added accessCode to AthleteData interface
- Verified all API endpoints work: auth, coach, setup, training, feedback
- Dev server memory issues identified: NODE_OPTIONS='--max-old-space-size=2048' needed for stability
- Lint passes cleanly

Stage Summary:
- App fully connected to Supabase with real data (2 athletes, 2 weeks, 14 training days)
- All API routes use Supabase client (no mock/seed data)
- Coach panel already has "Nuevo Atleta" form and "Crear atleta de prueba" button
- Test credentials: ASCENT01 (Mateo), ASCENT02 (Valentina), ENTRENADOR (coach)
- Dev server needs NODE_OPTIONS='--max-old-space-size=2048' for stability with Turbopack
