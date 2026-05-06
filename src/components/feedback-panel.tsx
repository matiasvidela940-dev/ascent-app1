'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Send, Check } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

const feelingOptions = [
  { id: 'facil', label: 'Fácil', emoji: '😊', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' },
  { id: 'normal', label: 'Normal', emoji: '😐', color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' },
  { id: 'dificil', label: 'Difícil', emoji: '😤', color: 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' },
]

interface FeedbackPanelProps {
  onBack?: () => void
}

export function FeedbackPanel({ onBack }: FeedbackPanelProps) {
  const { currentWeek, selectedDayId, setView, submitFeedback } = useAppStore()
  const [feeling, setFeeling] = useState<string>('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the selected day, or the first non-rest day
  const day = currentWeek?.days.find(d => d.id === selectedDayId) ||
    currentWeek?.days.find(d => d.type !== 'descanso')

  if (!day) {
    setView('home')
    return null
  }

  // Pre-fill if feedback exists
  const existingFeedback = day.feedback
  const currentFeeling = feeling || existingFeedback?.feeling || ''
  const currentComment = comment || existingFeedback?.comment || ''

  const handleSubmit = async () => {
    if (!currentFeeling) {
      toast.error('Seleccioná cómo te sentiste')
      return
    }

    setIsSubmitting(true)
    try {
      await submitFeedback(day.id, currentFeeling, currentComment)
      toast.success('Feedback enviado al entrenador 👍')
      if (onBack) {
        onBack()
      } else {
        setView('home')
      }
    } catch {
      toast.error('Error al enviar el feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-6 fade-in">
      {/* Header */}
      <button
        onClick={() => onBack ? onBack() : setView('home')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver
      </button>

      {/* Training info */}
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        <p className="text-xs text-muted-foreground font-medium">{day.dayLabel}</p>
        <h3 className="text-base font-semibold">{day.title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{day.description}</p>
      </div>

      {/* Feeling selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">¿Cómo te sentiste?</h4>
        <div className="grid grid-cols-3 gap-2">
          {feelingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFeeling(option.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200',
                currentFeeling === option.id
                  ? 'border-cyan bg-cyan/5 ring-1 ring-cyan/20'
                  : 'border-transparent ' + option.color
              )}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className={cn(
                'text-xs font-semibold',
                currentFeeling === option.id ? 'text-cyan' : ''
              )}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Escribí cómo te sentiste…</h4>
        <Textarea
          value={currentComment === existingFeedback?.comment ? currentComment : comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ej: Las series me costaron más de lo esperado, pero el rodaje inicial estuvo bien. Sentí las piernas pesadas en las últimas repeticiones…"
          className="min-h-[120px] text-sm bg-muted/30 border-0 focus-visible:ring-cyan/30 resize-none rounded-xl"
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!currentFeeling || isSubmitting}
        className="w-full h-12 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white transition-all duration-200"
      >
        {isSubmitting ? (
          'Enviando…'
        ) : (
          <>
            <Send className="w-4 h-4 mr-1.5" />
            Enviar feedback
          </>
        )}
      </Button>

      {/* Brand phrase */}
      <div className="pt-4 pb-2 text-center">
        <p className="text-xs tracking-[0.25em] text-muted-foreground/40 font-semibold">
          PROCESO &gt; RESULTADO
        </p>
      </div>
    </div>
  )
}
