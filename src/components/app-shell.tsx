'use client'

import { useAppStore } from '@/lib/store'
import { HomePanel } from '@/components/home-panel'
import { WeeklyPlan } from '@/components/weekly-plan'
import { KeySession } from '@/components/key-session'
import { LongRunSession } from '@/components/long-run-session'
import { FeedbackPanel } from '@/components/feedback-panel'
import { BottomNav } from '@/components/bottom-nav'
import { Mountain, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppShell() {
  const { currentView, athlete, logout, currentWeek } = useAppStore()

  const completedCount = currentWeek?.days.filter(d => d.completed).length || 0
  const totalCount = currentWeek?.days.length || 0

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-lg mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center">
              <Mountain className="w-4 h-4 text-cyan" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">ASCENT</span>
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground ml-1.5 font-medium">RUN CLUB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              {completedCount}/{totalCount}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-24">
        {currentView === 'home' && <HomePanel />}
        {currentView === 'plan' && <WeeklyPlan />}
        {currentView === 'session' && <KeySession />}
        {currentView === 'longrun' && <LongRunSession />}
        {currentView === 'feedback' && <FeedbackPanel />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
