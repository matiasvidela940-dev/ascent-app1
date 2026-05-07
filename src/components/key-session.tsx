'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Flame,
  ChevronLeft,
  Check,
  MessageSquare,
  ArrowRight,
} from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FeedbackPanel } from '@/components/feedback-panel'

export function KeySession() {
  const { currentWeek, selectedDayId, setView, selectDay, toggleCompleted } = useAppStore()
  const [showFeedback, setShowFeedback] = useState(false)

  const day = currentWeek?.days.find(d => d.id === selectedDayId)

  if (!day) {
    setView('plan')
    return null
  }

  if (showFeedback) {
    return <FeedbackPanel onBack={() => setShowFeedback(false)} />
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      {/* Header */}
      <button
        onClick={() => setView('plan')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Planificación
      </button>

      {/* Session card */}
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-100 p-5 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <Badge className="bg-orange-100 text-orange-600 border-orange-200 text-[10px] font-bold mb-1.5">
              SESIÓN CLAVE 🔥
            </Badge>
            <h2 className="text-lg font-bold leading-tight">{day.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{day.dayLabel} · {day.description}</p>
          </div>
        </div>

        {/* Stats */}
        {(day.distance || day.terrain || day.pace) && (
          <div className="flex flex-wrap gap-3">
            {day.distance && (
              <div className="bg-white/60 rounded-lg px-3 py-1.5 text-sm">
                <span className="font-semibold">{day.distance}</span>
                {day.terrain && <span className="text-muted-foreground"> · {day.terrain}</span>}
              </div>
            )}
            {day.pace && (
              <div className="bg-white/60 rounded-lg px-3 py-1.5 text-sm">
                Ritmo: <span className="font-semibold">{day.pace}</span>
              </div>
            )}
            {day.heartRateMin && day.heartRateMax && (
              <div className="bg-white/60 rounded-lg px-3 py-1.5 text-sm">
                FC: <span className="font-semibold">{day.heartRateMin}–{day.heartRateMax} bpm</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session breakdown */}
      <div className="space-y-4">
        {day.warmup && (
          <div className="rounded-xl bg-card border border-border/60 p-4 space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Calentamiento</h4>
            <p className="text-sm leading-relaxed whitespace-pre-line">{day.warmup}</p>
          </div>
        )}

        {day.mainBlock && (
          <div className="rounded-xl bg-cyan/5 border border-cyan/15 p-4 space-y-2">
            <h4 className="text-xs font-bold text-cyan uppercase tracking-wider">Bloque Principal</h4>
            <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{day.mainBlock}</p>
          </div>
        )}

        {day.cooldown && (
          <div className="rounded-xl bg-card border border-border/60 p-4 space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vuelta a la Calma</h4>
            <p className="text-sm leading-relaxed whitespace-pre-line">{day.cooldown}</p>
          </div>
        )}
      </div>

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
