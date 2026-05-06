import { create } from 'zustand'

export interface TrainingDayData {
  id: string
  dayNumber: number
  dayLabel: string
  type: string
  title: string
  description: string
  distance: string | null
  terrain: string | null
  pace: string | null
  heartRateMin: number | null
  heartRateMax: number | null
  isKeySession: boolean
  isLongRun: boolean
  warmup: string | null
  mainBlock: string | null
  cooldown: string | null
  coachTip: string | null
  elevation: string | null
  intensity: string | null
  hydration: string | null
  recommendations: string | null
  completed: boolean
  completedAt: string | null
  order: number
  feedback?: {
    id: string
    feeling: string
    comment: string | null
    createdAt: string
  } | null
}

export interface WeekData {
  id: string
  weekNumber: number
  weekType: string
  startDate: string
  days: TrainingDayData[]
}

export interface AthleteData {
  id: string
  name: string
  email: string
  level: string
  targetRace: string | null
  raceDate: string | null
}

export interface CoachAthleteData extends AthleteData {
  weeks: WeekData[]
}

type ViewType = 'home' | 'plan' | 'session' | 'longrun' | 'feedback'
type CoachViewType = 'athletes' | 'athlete-detail' | 'week-detail' | 'create-athlete' | 'create-week' | 'create-day' | 'quick-week' | 'duplicate-week' | 'race-planner' | 'athlete-edit'

interface AppState {
  // Auth
  athlete: AthleteData | null
  currentWeek: WeekData | null
  isAuthenticated: boolean
  isCoach: boolean
  isLoading: boolean
  authError: string | null

  // Navigation (athlete)
  currentView: ViewType
  selectedDayId: string | null

  // Coach state
  coachAthletes: CoachAthleteData[]
  coachView: CoachViewType
  selectedAthleteId: string | null
  selectedWeekId: string | null

  // Actions
  login: (identifier: string) => Promise<void>
  logout: () => void
  setView: (view: ViewType) => void
  selectDay: (dayId: string) => void
  toggleCompleted: (dayId: string) => Promise<void>
  submitFeedback: (dayId: string, feeling: string, comment: string) => Promise<void>

  // Coach actions
  loadCoachData: () => Promise<void>
  setCoachView: (view: CoachViewType) => void
  selectAthlete: (id: string) => void
  selectWeek: (id: string) => void
  createAthlete: (name: string, email: string, accessCode: string, level?: string) => Promise<void>
  updateAthlete: (id: string, name: string, email: string, level: string, targetRace: string | null, raceDate: string | null) => Promise<void>
  generateRacePlan: (athleteId: string, raceName: string, raceDate: string, totalWeeks: number, level: string) => Promise<void>
  createWeek: (athleteId: string, weekNumber: number, weekType: string, startDate: string) => Promise<void>
  createDay: (data: Record<string, unknown>) => Promise<void>
  createWeekWithDays: (athleteId: string, weekNumber: number, weekType: string, startDate: string, days: Record<string, unknown>[]) => Promise<void>
  duplicateWeek: (sourceWeekId: string, targetAthleteId: string, newWeekNumber: number, newWeekType: string) => Promise<void>
  deleteItem: (action: string, id: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  athlete: null,
  currentWeek: null,
  isAuthenticated: false,
  isCoach: false,
  isLoading: false,
  authError: null,
  currentView: 'home',
  selectedDayId: null,

  // Coach state
  coachAthletes: [],
  coachView: 'athletes',
  selectedAthleteId: null,
  selectedWeekId: null,

  login: async (identifier: string) => {
    set({ isLoading: true, authError: null })

    // Check for coach code
    if (identifier.trim().toUpperCase() === 'ENTRENADOR') {
      set({ isCoach: true, isAuthenticated: true, isLoading: false })
      // Load coach data
      try {
        const res = await fetch('/api/coach?code=ENTRENADOR')
        if (res.ok) {
          const data = await res.json()
          set({ coachAthletes: data.athletes, coachView: 'athletes' })
        }
      } catch (error) {
        console.error('Coach data load error:', error)
      }
      return
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })

      const data = await res.json()

      if (!res.ok) {
        set({ authError: data.error, isLoading: false })
        return
      }

      set({
        athlete: data.athlete,
        currentWeek: data.currentWeek,
        isAuthenticated: true,
        isCoach: false,
        isLoading: false,
        currentView: 'home',
      })
    } catch {
      set({ authError: 'Error de conexión. Intentá de nuevo.', isLoading: false })
    }
  },

  logout: () => {
    set({
      athlete: null,
      currentWeek: null,
      isAuthenticated: false,
      isCoach: false,
      currentView: 'home',
      selectedDayId: null,
      coachAthletes: [],
      coachView: 'athletes',
      selectedAthleteId: null,
      selectedWeekId: null,
    })
  },

  setView: (view: ViewType) => set({ currentView: view }),

  selectDay: (dayId: string) => {
    const state = get()
    const day = state.currentWeek?.days.find(d => d.id === dayId)
    if (!day) return

    if (day.isKeySession) {
      set({ selectedDayId: dayId, currentView: 'session' })
    } else if (day.isLongRun) {
      set({ selectedDayId: dayId, currentView: 'longrun' })
    } else {
      set({ selectedDayId: dayId, currentView: 'feedback' })
    }
  },

  toggleCompleted: async (dayId: string) => {
    const state = get()
    const day = state.currentWeek?.days.find(d => d.id === dayId)
    if (!day) return

    const newCompleted = !day.completed

    try {
      const res = await fetch('/api/training', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, completed: newCompleted }),
      })

      if (!res.ok) return

      const { day: updatedDay } = await res.json()

      if (state.currentWeek) {
        const updatedDays = state.currentWeek.days.map(d =>
          d.id === dayId
            ? { ...d, completed: updatedDay.completed, completedAt: updatedDay.completedAt }
            : d
        )
        set({
          currentWeek: { ...state.currentWeek, days: updatedDays },
        })
      }
    } catch (error) {
      console.error('Toggle completed error:', error)
    }
  },

  submitFeedback: async (dayId: string, feeling: string, comment: string) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingDayId: dayId, feeling, comment }),
      })

      if (!res.ok) return

      const { feedback } = await res.json()

      const state = get()
      if (state.currentWeek) {
        const updatedDays = state.currentWeek.days.map(d =>
          d.id === dayId ? { ...d, feedback } : d
        )
        set({ currentWeek: { ...state.currentWeek, days: updatedDays } })
      }
    } catch (error) {
      console.error('Feedback error:', error)
    }
  },

  // Coach actions
  loadCoachData: async () => {
    try {
      const res = await fetch('/api/coach?code=ENTRENADOR')
      if (res.ok) {
        const data = await res.json()
        set({ coachAthletes: data.athletes })
      }
    } catch (error) {
      console.error('Coach data load error:', error)
    }
  },

  setCoachView: (view: CoachViewType) => set({ coachView: view }),

  selectAthlete: (id: string) => set({ selectedAthleteId: id, coachView: 'athlete-detail' }),
  selectWeek: (id: string) => set({ selectedWeekId: id, coachView: 'week-detail' }),

  createAthlete: async (name: string, email: string, accessCode: string, level?: string) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createAthlete', name, email, accessCode, level }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await get().loadCoachData()
      set({ coachView: 'athletes' })
    } catch (error) {
      throw error
    }
  },

  updateAthlete: async (id: string, name: string, email: string, level: string, targetRace: string | null, raceDate: string | null) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateAthlete', id, name, email, level, targetRace, raceDate }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await get().loadCoachData()
    } catch (error) {
      throw error
    }
  },

  generateRacePlan: async (athleteId: string, raceName: string, raceDate: string, totalWeeks: number, level: string) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateRacePlan', athleteId, raceName, raceDate, totalWeeks, level }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await get().loadCoachData()
      set({ coachView: 'athlete-detail' })
    } catch (error) {
      throw error
    }
  },

  createWeek: async (athleteId: string, weekNumber: number, weekType: string, startDate: string) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createWeek', athleteId, weekNumber, weekType, startDate }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await get().loadCoachData()
      set({ coachView: 'athlete-detail' })
    } catch (error) {
      throw error
    }
  },

  createDay: async (data: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createDay', ...data }),
      })
      if (!res.ok) {
        const respData = await res.json()
        throw new Error(respData.error)
      }
      await get().loadCoachData()
      set({ coachView: 'week-detail' })
    } catch (error) {
      throw error
    }
  },

  createWeekWithDays: async (athleteId: string, weekNumber: number, weekType: string, startDate: string, days: Record<string, unknown>[]) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createWeekWithDays', athleteId, weekNumber, weekType, startDate, days }),
      })
      if (!res.ok) {
        const respData = await res.json()
        throw new Error(respData.error)
      }
      await get().loadCoachData()
      set({ coachView: 'athlete-detail' })
    } catch (error) {
      throw error
    }
  },

  duplicateWeek: async (sourceWeekId: string, targetAthleteId: string, newWeekNumber: number, newWeekType: string) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicateWeek', sourceWeekId, targetAthleteId, newWeekNumber, newWeekType }),
      })
      if (!res.ok) {
        const respData = await res.json()
        throw new Error(respData.error)
      }
      await get().loadCoachData()
      set({ coachView: 'athletes' })
    } catch (error) {
      throw error
    }
  },

  deleteItem: async (action: string, id: string) => {
    try {
      const res = await fetch(`/api/coach?action=${action}&id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await get().loadCoachData()
    } catch (error) {
      throw error
    }
  },
}))
