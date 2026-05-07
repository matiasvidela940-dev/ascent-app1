'use client'

import { useAppStore } from '@/lib/store'
import { Home, Calendar, Mountain } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'home' as const, label: 'Inicio', icon: Home },
  { id: 'plan' as const, label: 'Plan', icon: Calendar },
  { id: 'longrun' as const, label: 'Trail', icon: Mountain },
]

export function BottomNav() {
  const { currentView, setView, selectedDayId } = useAppStore()

  const handleNav = (id: 'home' | 'plan' | 'longrun') => {
    if (id === 'longrun') {
      // Find the long run day
      const state = useAppStore.getState()
      const longRunDay = state.currentWeek?.days.find(d => d.isLongRun)
      if (longRunDay) {
        useAppStore.setState({ selectedDayId: longRunDay.id })
      }
    }
    setView(id)
  }

  // Map current views to nav items
  const activeNav = currentView === 'plan' ? 'plan' :
    currentView === 'longrun' ? 'longrun' :
    currentView === 'session' || currentView === 'feedback' ? 'home' : 'home'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 max-w-lg mx-auto">
      <div className="flex items-center justify-around px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-cyan'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
