'use client'

import { useAppStore, TrainingDayData } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Footprints,
  Mountain,
  Dumbbell,
  BedDouble,
  Flame,
  Check,
  ChevronLeft,
  MessageSquare,
} from '@/lib/icons'
import { cn } from '@/lib/utils'

function getTypeIcon(type: string, className?: string) {
  const c = className || 'w-5 h-5'
  switch (type) {
    case 'running': return <Footprints className={c} />
    case 'trail': return <Mountain className={c} />
    case 'fuerza': return <Dumbbell className={c} />
    case 'descanso': return <BedDouble className={c} />
    default: return <Footprints className={c} />
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'running': return 'bg-cyan/10 text-cyan'
    case 'trail': return 'bg-emerald-50 text-emerald-600'
    case 'fuerza': return 'bg-amber-50 text-amber-600'
    case 'descanso': return 'bg-violet-50 text-violet-500'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getTypeBorderColor(type: string) {
  switch (type) {
    case 'running': return 'border-l-cyan'
    case 'trail': return 'border-l-emerald-500'
    case 'fuerza': return 'border-l-amber-500'
    case 'descanso': return 'border-l-violet-400'
    default: return 'border-l-muted'
  }
}

function DayCard({ day, onSelect }: { day: TrainingDayData; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-2xl border border-border/60 bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-cyan/20',
        'border-l-4',
        getTypeBorderColor(day.type),
        day.completed && 'opacity-75'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          day.completed ? 'bg-cyan/10 text-cyan' : getTypeColor(day.type)
        )}>
          {day.completed ? <Check className="w-5 h-5" /> : getTypeIcon(day.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-muted-foreground font-medium">{day.dayLabel}</span>
            {day.isKeySession && (
              <Badge className="bg-orange-50 text-orange-500 border-orange-200 text-[9px] font-bold px-1.5 py-0">
                <Flame className="w-2.5 h-2.5 mr-0.5" /> CLAVE
              </Badge>
            )}
            {day.isLongRun && (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] font-bold px-1.5 py-0">
                <Mountain className="w-2.5 h-2.5 mr-0.5" /> FONDO
              </Badge>
            )}
          </div>
          <h3 className={cn(
            'text-sm font-semibold leading-snug',
            day.completed && 'line-through text-muted-foreground'
          )}>
            {day.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{day.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {day.distance && (
              <span className="text-xs font-medium text-foreground/70">{day.distance}</span>
            )}
            {day.intensity && (
              <span className="text-[10px] font-semibold text-cyan bg-cyan/8 px-1.5 py-0.5 rounded-md">
                {day.intensity}
              </span>
            )}
            {day.feedback && (
              <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-0.5">
                <MessageSquare className="w-2.5 h-2.5" /> Feedback
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export function WeeklyPlan() {
  const { currentWeek, setView, selectDay } = useAppStore()

  if (!currentWeek) return null

  const completedCount = currentWeek.days.filter(d => d.completed).length
  const keySessions = currentWeek.days.filter(d => d.isKeySession)
  const longRuns = currentWeek.days.filter(d => d.isLongRun)

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      {/* Header */}
      <div className="space-y-1">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Inicio
        </button>
        <h2 className="text-xl font-bold tracking-tight">Planificación Semanal</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Semana {currentWeek.weekNumber} · {currentWeek.weekType}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-sm font-medium text-cyan">{completedCount}/{currentWeek.days.length} completados</span>
        </div>
      </div>

      {/* Highlighted sessions */}
      {(keySessions.length > 0 || longRuns.length > 0) && (
        <div className="flex gap-2">
          {keySessions.map(day => (
            <button
              key={day.id}
              onClick={() => selectDay(day.id)}
              className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-orange-100 transition-colors"
            >
              <Flame className="w-3.5 h-3.5" />
              Sesión Clave
            </button>
          ))}
          {longRuns.map(day => (
            <button
              key={day.id}
              onClick={() => selectDay(day.id)}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Mountain className="w-3.5 h-3.5" />
              Fondo Largo
            </button>
          ))}
        </div>
      )}

      {/* Day cards */}
      <div className="space-y-3">
        {currentWeek.days.map(day => (
          <DayCard
            key={day.id}
            day={day}
            onSelect={() => selectDay(day.id)}
          />
        ))}
      </div>

      {/* Brand phrase */}
      <div className="pt-6 pb-2 text-center">
        <p className="text-xs tracking-[0.25em] text-muted-foreground/40 font-semibold">
          PROCESO &gt; RESULTADO
        </p>
      </div>
    </div>
  )
}
