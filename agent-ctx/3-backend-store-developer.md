# Task 3: Backend + Store Developer - Work Log

## Completed Changes

### 1. Updated Zustand Store (`src/lib/store.ts`)
- Added `level`, `targetRace`, `raceDate` fields to `AthleteData` interface
- Added `'race-planner'` and `'athlete-edit'` to `CoachViewType` union type
- Updated `createAthlete` action signature to accept optional `level` parameter (default "INTERMEDIO")
- Added `updateAthlete` action that calls `/api/coach` with action `updateAthlete` and fields: id, name, email, level, targetRace, raceDate
- Added `generateRacePlan` action that calls `/api/coach` with action `generateRacePlan` and fields: athleteId, raceName, raceDate, totalWeeks, level

### 2. Updated Coach API (`src/app/api/coach/route.ts`)
- Added `DayTemplate`, `WeekTemplate`, and `LevelTemplates` type definitions
- Added `getTemplatesForLevel()` function with complete training templates for all 3 levels:
  - **ELITE**: Higher volume (10km+ runs, 22-32km long runs, 700-900m+ elevation, Z4-Z5 intensity work)
  - **INTERMEDIO**: Medium volume (6km+ runs, 14-22km long runs, 350-600m+ elevation, Z4-Z5 hill work)
  - **AMATEUR**: Lower volume (3-5km runs, 6-14km long runs, 100-300m+ elevation, Z3-Z4 intro intensity)
  - Each level has BASE, CARGA, PICO, DESCARGA week templates with 7 days each
  - Templates include full detail: type, title, description, distance, terrain, pace, intensity, heart rate zones, isKeySession, isLongRun, elevation, warmup, mainBlock, cooldown, coachTip, hydration, recommendations
- Updated `createAthlete` case to accept `level` parameter with default "INTERMEDIO"
- Added `updateAthlete` case to update athlete's level, targetRace, raceDate fields
- Added `generateRacePlan` case that:
  - Updates athlete with race info (targetRace, raceDate)
  - Implements proper periodization: last 2 weeks = DESCARGA (taper), week before taper = PICO (peak), remaining weeks alternate BASE/CARGA
  - Calculates week start dates backwards from race date (Monday-based)
  - Creates training weeks with days populated from level-appropriate templates
- GET handler already returns new athlete fields via Prisma (level, targetRace, raceDate)

### 3. Lint check: Passed with no errors
