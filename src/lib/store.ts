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
}

type ViewType = 'home' | 'plan' | 'session' | 'longrun' | 'feedback'

interface AppState {
  // Auth
  athlete: AthleteData | null
  currentWeek: WeekData | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null

  // Navigation
  currentView: ViewType
  selectedDayId: string | null

  // Actions
  login: (identifier: string) => Promise<void>
  logout: () => void
  setView: (view: ViewType) => void
  selectDay: (dayId: string) => void
  toggleCompleted: (dayId: string) => Promise<void>
  submitFeedback: (dayId: string, feeling: string, comment: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  athlete: null,
  currentWeek: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  currentView: 'home',
  selectedDayId: null,

  login: async (identifier: string) => {
    set({ isLoading: true, authError: null })
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
      currentView: 'home',
      selectedDayId: null,
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

      // Update local state
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

      // Update local state
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
}))
