'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Footprints,
  Mountain,
  Dumbbell,
  BedDouble,
  Flame,
  ChevronRight,
  Check,
  MessageSquare,
  Timer,
  Heart,
  Route,
  Flag,
  Trophy,
} from '@/lib/icons'
import { cn } from '@/lib/utils'

function getWeekTypeColor(type: string) {
  switch (type) {
    case 'CARGA': return 'bg-cyan/10 text-cyan border-cyan/20'
    case 'BASE': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
    case 'PICO': return 'bg-amber-50 text-amber-600 border-amber-200'
    case 'DESCARGA': return 'bg-violet-50 text-violet-600 border-violet-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'running': return <Footprints className="w-4 h-4" />
    case 'trail': return <Mountain className="w-4 h-4" />
    case 'fuerza': return <Dumbbell className="w-4 h-4" />
    case 'descanso': return <BedDouble className="w-4 h-4" />
    default: return <Footprints className="w-4 h-4" />
  }
}

export function HomePanel() {
  const { athlete, currentWeek, setView, selectDay, toggleCompleted } = useAppStore()

  if (!currentWeek) return null

  // Find today's training (simplified: use current day of week or first incomplete)
  const todayIndex = new Date().getDay() // 0=Sun, 1=Mon...
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1 // Mon=0
  const todayDay = currentWeek.days[adjustedIndex] || currentWeek.days.find(d => !d.completed) || currentWeek.days[0]

  const completedCount = currentWeek.days.filter(d => d.completed).length
  const totalCount = currentWeek.days.length
  const progressPct = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="px-5 py-5 space-y-6 fade-in">
      {/* Greeting */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground font-medium">Hola,</p>
          {athlete?.level && (
            <Badge className={cn('text-[9px] font-bold border',
              athlete.level === 'ELITE' ? 'bg-rose-50 text-rose-600 border-rose-200' :
              athlete.level === 'INTERMEDIO' ? 'bg-cyan/10 text-cyan border-cyan/20' :
              'bg-emerald-50 text-emerald-600 border-emerald-200'
            )}>{athlete.level}</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{athlete?.name?.split(' ')[0]}</h1>
      </div>

      {/* Race target */}
      {athlete?.targetRace && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan/5 border border-cyan/15">
          <Trophy className="w-3.5 h-3.5 text-cyan" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-cyan truncate">{athlete.targetRace}</p>
            {athlete.raceDate && (
              <p className="text-[10px] text-muted-foreground">{new Date(athlete.raceDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            )}
          </div>
          <Flag className="w-3.5 h-3.5 text-cyan/40" />
        </div>
      )}

      {/* Week Status */}
      <div className="flex items-center gap-3">
        <div>
          <span className="text-sm text-muted-foreground">Semana {currentWeek.weekNumber}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge className={cn('text-xs font-semibold border', getWeekTypeColor(currentWeek.weekType))}>
              {currentWeek.weekType}
            </Badge>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">{completedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Today's Training Card */}
      <div className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              todayDay.type === 'running' ? 'bg-cyan/10 text-cyan' :
              todayDay.type === 'trail' ? 'bg-emerald-50 text-emerald-600' :
              todayDay.type === 'fuerza' ? 'bg-amber-50 text-amber-600' :
              'bg-violet-50 text-violet-500'
            )}>
              {getTypeIcon(todayDay.type)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{todayDay.dayLabel}</p>
              <h2 className="text-base font-semibold leading-tight">{todayDay.title}</h2>
            </div>
          </div>
          {todayDay.isKeySession && (
            <Badge className="bg-orange-50 text-orange-500 border-orange-200 text-[10px] font-bold">
              <Flame className="w-3 h-3 mr-0.5" /> CLAVE
            </Badge>
          )}
          {todayDay.isLongRun && (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-bold">
              <Mountain className="w-3 h-3 mr-0.5" /> FONDO
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{todayDay.description}</p>

        {/* Stats row */}
        {(todayDay.distance || todayDay.terrain || todayDay.pace) && (
          <div className="flex flex-wrap gap-3">
            {todayDay.distance && (
              <div className="flex items-center gap-1.5 text-sm">
                <Route className="w-3.5 h-3.5 text-cyan" />
                <span className="font-medium">{todayDay.distance}</span>
                {todayDay.terrain && (
                  <span className="text-muted-foreground">· {todayDay.terrain}</span>
                )}
              </div>
            )}
            {todayDay.pace && (
              <div className="flex items-center gap-1.5 text-sm">
                <Timer className="w-3.5 h-3.5 text-cyan" />
                <span>{todayDay.pace}</span>
              </div>
            )}
            {todayDay.heartRateMin && todayDay.heartRateMax && (
              <div className="flex items-center gap-1.5 text-sm">
                <Heart className="w-3.5 h-3.5 text-cyan" />
                <span>{todayDay.heartRateMin}–{todayDay.heartRateMax} bpm</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => toggleCompleted(todayDay.id)}
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-200',
              todayDay.completed
                ? 'bg-cyan/10 text-cyan hover:bg-cyan/20 border border-cyan/20'
                : 'bg-cyan text-white hover:bg-cyan/90'
            )}
          >
            {todayDay.completed ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Realizado
              </>
            ) : (
              'Marcar como realizado'
            )}
          </Button>
          <Button
            onClick={() => selectDay(todayDay.id)}
            variant="outline"
            className="h-11 px-4 rounded-xl text-sm font-medium border-border/80 hover:bg-cyan/5 hover:text-cyan hover:border-cyan/30"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Feedback
          </Button>
        </div>
      </div>

      {/* Quick Plan Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Tu semana</h3>
          <button
            onClick={() => setView('plan')}
            className="text-xs text-cyan font-medium flex items-center gap-0.5 hover:underline"
          >
            Ver todo <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {currentWeek.days.map((day) => (
            <button
              key={day.id}
              onClick={() => {
                selectDay(day.id)
              }}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200',
                day.completed
                  ? 'bg-cyan/10'
                  : day.id === todayDay.id
                  ? 'bg-cyan/5 ring-1 ring-cyan/20'
                  : 'hover:bg-muted/50'
              )}
            >
              <span className="text-[10px] text-muted-foreground font-medium">
                {day.dayLabel.replace('Día ', 'D')}
              </span>
              <div className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center',
                day.completed
                  ? 'bg-cyan text-white'
                  : day.isKeySession
                  ? 'bg-orange-50 text-orange-500'
                  : day.isLongRun
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-muted text-muted-foreground'
              )}>
                {day.completed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  getTypeIcon(day.type)
                )}
              </div>
            </button>
          ))}
        </div>
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
