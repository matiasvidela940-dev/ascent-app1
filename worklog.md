---
Task ID: 1
Agent: Main
Task: Migrate from SQLite/localStorage to Supabase PostgreSQL + secure JWT auth

Work Log:
- Analyzed current architecture: SQLite via Prisma, Zustand in-memory auth
- Created prisma/schema.postgresql.prisma for Supabase deployment (with @@map table names, directUrl)
- Attempted NextAuth.js v4 integration — caused Turbopack OOM crashes
- Replaced NextAuth with custom JWT auth using `jose` library + httpOnly cookies
- Created /src/lib/auth.ts with: encrypt/decrypt JWT, createSession, getSession, destroySession, authenticateAthlete
- Cookie: `ascent-session` — httpOnly, sameSite=lax, maxAge=30 days, secure in production
- Updated /src/lib/store.ts: added checkSession() for auto-login on page load, isSessionChecked to prevent login flash
- Updated /src/app/page.tsx: checks session on mount, shows loading spinner while checking
- Updated /src/app/api/auth/route.ts: POST (login), GET (session check), DELETE (logout)
- Updated /src/app/api/training/route.ts: added getSession() auth check
- Updated /src/app/api/feedback/route.ts: added getSession() auth check
- Updated /src/app/api/coach/route.ts: added getSession() auth check, removed readFileSync
- Created .env.example with Supabase instructions
- All tests pass: login, session persistence, coach login, logout

Stage Summary:
- Database is REAL (SQLite via Prisma for dev, PostgreSQL/Supabase ready for prod)
- Auth is SECURE: JWT in httpOnly cookies (no localStorage!)
- Session persists across page reloads (cookie-based)
- For Vercel deploy: replace prisma/schema.prisma with schema.postgresql.prisma content, set DATABASE_URL + DIRECT_URL env vars
