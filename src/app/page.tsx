'use client'

import { useAppStore } from '@/lib/store'
import { LoginScreen } from '@/components/login-screen'
import { AppShell } from '@/components/app-shell'
import { CoachPanel } from '@/components/coach-panel'

export default function Home() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated)
  const isCoach = useAppStore(s => s.isCoach)

  if (!isAuthenticated) return <LoginScreen />
  if (isCoach) return <CoachPanel />
  return <AppShell />
}
