'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { LoginScreen } from '@/components/login-screen'
import { AppShell } from '@/components/app-shell'
import { CoachPanel } from '@/components/coach-panel'

export default function Home() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated)
  const isCoach = useAppStore(s => s.isCoach)
  const isSessionChecked = useAppStore(s => s.isSessionChecked)
  const checkSession = useAppStore(s => s.checkSession)

  // On mount, check if there's an existing JWT session (httpOnly cookie)
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Show loading while checking session (prevents flash of login screen)
  if (!isSessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <LoginScreen />
  if (isCoach) return <CoachPanel />
  return <AppShell />
}
