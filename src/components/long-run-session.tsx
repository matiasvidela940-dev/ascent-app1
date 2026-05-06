'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mountain,
  ChevronLeft,
  Check,
  MessageSquare,
  Droplets,
  Route,
} from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FeedbackPanel } from '@/components/feedback-panel'

export function LongRunSession() {
  const { currentWeek, selectedDayId, setView, toggleCompleted } = useAppStore()
  const [showFeedback, setShowFeedback] = useState(false)

  // Find the long run day
  const day = currentWeek?.days.find(d =>
    d.isLongRun && (selectedDayId ? d.id === selectedDayId : true)
  )

  if (!day) {
    // Show a placeholder
    return (
      <div className="px-5 py-5 space-y-5 fade-in">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Inicio
        </button>
        <div className="text-center py-12">
          <Mountain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay fondo largo esta semana</p>
        </div>
      </div>
    )
  }

  if (showFeedback) {
    return <FeedbackPanel onBack={() => setShowFeedback(false)} />
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      {/* Header */}
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Inicio
      </button>

      {/* Session card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 p-5 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Mountain className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200 text-[10px] font-bold mb-1.5">
              FONDO LARGO ⛰️
            </Badge>
            <h2 className="text-lg font-bold leading-tight">{day.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{day.dayLabel} · {day.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {day.distance && (
            <div className="bg-white/60 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Distancia</p>
              <p className="text-lg font-bold">{day.distance}</p>
            </div>
          )}
          {day.elevation && (
            <div className="bg-white/60 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Desnivel</p>
              <p className="text-lg font-bold">{day.elevation}</p>
            </div>
          )}
          {day.intensity && (
            <div className="bg-white/60 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Intensidad</p>
              <p className="text-lg font-bold text-cyan">{day.intensity}</p>
            </div>
          )}
          {day.pace && (
            <div className="bg-white/60 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Ritmo</p>
              <p className="text-lg font-bold">{day.pace}</p>
            </div>
          )}
        </div>
      </div>

      {/* Indications */}
      {day.warmup && (
        <div className="rounded-xl bg-card border border-border/60 p-4 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Indicaciones</h4>
          <div className="space-y-3">
            {day.warmup && (
              <div>
                <p className="text-[10px] font-bold text-cyan uppercase tracking-wider mb-1">Calentamiento</p>
                <p className="text-sm leading-relaxed">{day.warmup}</p>
              </div>
            )}
            {day.mainBlock && (
              <div>
                <p className="text-[10px] font-bold text-cyan uppercase tracking-wider mb-1">Recorrido</p>
                <p className="text-sm leading-relaxed whitespace-pre-line">{day.mainBlock}</p>
              </div>
            )}
            {day.cooldown && (
              <div>
                <p className="text-[10px] font-bold text-cyan uppercase tracking-wider mb-1">Vuelta a la calma</p>
                <p className="text-sm leading-relaxed">{day.cooldown}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hydration */}
      {day.hydration && (
        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 space-y-2">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5" />
            Hidratación
          </h4>
          <p className="text-sm leading-relaxed">{day.hydration}</p>
        </div>
      )}

      {/* Recommendations */}
      {day.recommendations && (
        <div className="rounded-xl bg-card border border-border/60 p-4 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recomendaciones</h4>
          <p className="text-sm leading-relaxed whitespace-pre-line">{day.recommendations}</p>
        </div>
      )}

      {/* Coach tip */}
      {day.coachTip && (
        <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-4 space-y-2">
          <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            💡 Tip del entrenador
          </h4>
          <p className="text-sm leading-relaxed text-amber-900/80">{day.coachTip}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          onClick={() => toggleCompleted(day.id)}
          className={cn(
            'flex-1 h-12 rounded-xl text-sm font-semibold transition-all duration-200',
            day.completed
              ? 'bg-cyan/10 text-cyan hover:bg-cyan/20 border border-cyan/20'
              : 'bg-cyan text-white hover:bg-cyan/90'
          )}
        >
          {day.completed ? (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              Realizado
            </>
          ) : (
            'Marcar como realizado'
          )}
        </Button>
        <Button
          onClick={() => setShowFeedback(true)}
          variant="outline"
          className="h-12 px-5 rounded-xl text-sm font-medium border-border/80 hover:bg-cyan/5 hover:text-cyan hover:border-cyan/30"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" />
          Feedback
        </Button>
      </div>
    </div>
  )
}
