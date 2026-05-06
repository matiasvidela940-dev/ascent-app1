---
Task ID: 1
Agent: Main
Task: Migrate ASCENT RUN CLUB from Prisma/SQLite to Supabase PostgreSQL

Work Log:
- Examined existing project state: Prisma with SQLite, custom JWT auth, Zustand store
- Installed @supabase/supabase-js package
- Created /src/lib/supabase.ts - Supabase client with service_role key support (falls back to anon key)
- Updated /src/lib/auth.ts - authenticateAthlete() now uses Supabase queries instead of Prisma
- Rewrote /src/app/api/auth/route.ts - Uses Supabase nested selects instead of Prisma
- Rewrote /src/app/api/coach/route.ts - All CRUD operations via Supabase client (7 actions)
- Rewrote /src/app/api/training/route.ts - GET/PATCH using Supabase client
- Rewrote /src/app/api/feedback/route.ts - POST upsert + GET via Supabase
- Created /src/app/api/setup/route.ts - GET (check DB connection) + POST (seed demo data)
- Updated .env.local - Added SUPABASE_SERVICE_ROLE_KEY placeholder
- Updated coach-panel.tsx - Added DbSetupBanner component + "Crear atleta de prueba" button
- Tested Supabase REST API: SELECT works, INSERT blocked by RLS (needs service_role key or RLS policies)
- Lint passes cleanly

Stage Summary:
- All API routes now use Supabase client instead of Prisma
- App will work with Supabase once RLS policies are configured (or service_role key is provided)
- The "Crear atleta de prueba" button in coach panel seeds demo data
- DbSetupBanner shows setup instructions when DB can't be written to
- Key blocker: RLS policies on Supabase tables need to be configured for the anon key to work
- Solution: User needs to either (a) add SUPABASE_SERVICE_ROLE_KEY in .env.local, or (b) run RLS policy SQL in Supabase SQL Editor
