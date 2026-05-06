'use client'

import { useAppStore, TrainingDayData } from '@/lib/store'
import { LoginScreen } from '@/components/login-screen'
import { AppShell } from '@/components/app-shell'

export default function Home() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated)

  return isAuthenticated ? <AppShell /> : <LoginScreen />
}
