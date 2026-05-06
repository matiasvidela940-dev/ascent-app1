'use client'

import { useAppStore, CoachAthleteData, WeekData, TrainingDayData } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Mountain,
  ChevronLeft,
  Plus,
  Trash2,
  Footprints,
  Dumbbell,
  BedDouble,
  Flame,
  LogOut,
  Users,
  Calendar,
  Check,
  Loader2,
  UserPlus,
  MessageSquare,
} from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

const weekTypes = ['BASE', 'CARGA', 'PICO', 'DESCARGA']
const dayTypes = [
  { value: 'running', label: 'Running', icon: Footprints },
  { value: 'trail', label: 'Trail', icon: Mountain },
  { value: 'fuerza', label: 'Fuerza', icon: Dumbbell },
  { value: 'descanso', label: 'Descanso', icon: BedDouble },
]

function getTypeIcon(type: string, size = 'w-4 h-4') {
  switch (type) {
    case 'running': return <Footprints className={size} />
    case 'trail': return <Mountain className={size} />
    case 'fuerza': return <Dumbbell className={size} />
    case 'descanso': return <BedDouble className={size} />
    default: return <Footprints className={size} />
  }
}

function getWeekTypeColor(type: string) {
  switch (type) {
    case 'CARGA': return 'bg-cyan/10 text-cyan border-cyan/20'
    case 'BASE': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
    case 'PICO': return 'bg-amber-50 text-amber-600 border-amber-200'
    case 'DESCARGA': return 'bg-violet-50 text-violet-600 border-violet-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

// ── Athletes List ──────────────────────────────
function AthletesList() {
  const { coachAthletes, selectAthlete, setCoachView } = useAppStore()

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Atletas</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{coachAthletes.length} atletas registrados</p>
        </div>
        <Button
          onClick={() => setCoachView('create-athlete')}
          className="h-9 rounded-xl text-xs font-semibold bg-cyan hover:bg-cyan/90 text-white"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          Nuevo
        </Button>
      </div>

      <div className="space-y-2">
        {coachAthletes.map(athlete => (
          <button
            key={athlete.id}
            onClick={() => selectAthlete(athlete.id)}
            className="w-full text-left rounded-2xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-cyan/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 text-cyan flex items-center justify-center font-bold text-sm">
                {athlete.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{athlete.name}</h3>
                <p className="text-xs text-muted-foreground">{athlete.email} · {athlete.accessCode}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-cyan">{athlete.weeks.length} sem.</p>
              </div>
            </div>
          </button>
        ))}

        {coachAthletes.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay atletas aún</p>
            <Button
              onClick={() => setCoachView('create-athlete')}
              variant="outline"
              className="mt-3 rounded-xl text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Crear primer atleta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Create Athlete Form ──────────────────────
function CreateAthleteForm() {
  const { createAthlete, setCoachView } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !accessCode) return
    setIsCreating(true)
    try {
      await createAthlete(name, email, accessCode)
      toast.success('Atleta creado correctamente')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear atleta')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button
        onClick={() => setCoachView('athletes')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Atletas
      </button>

      <h2 className="text-xl font-bold tracking-tight">Nuevo Atleta</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Nombre completo</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Mateo Ruiz"
            className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
          <Input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="mateo@email.com"
            type="email"
            className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Código de acceso</Label>
          <Input
            value={accessCode}
            onChange={e => setAccessCode(e.target.value.toUpperCase())}
            placeholder="Ej: ASCENT03"
            className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl uppercase"
          />
          <p className="text-[10px] text-muted-foreground/60">El atleta usará este código para ingresar</p>
        </div>

        <Button
          type="submit"
          disabled={!name || !email || !accessCode || isCreating}
          className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white"
        >
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
          Crear Atleta
        </Button>
      </form>
    </div>
  )
}

// ── Athlete Detail (weeks) ──────────────────────
function AthleteDetail() {
  const { coachAthletes, selectedAthleteId, selectWeek, setCoachView, deleteItem } = useAppStore()
  const athlete = coachAthletes.find(a => a.id === selectedAthleteId)

  if (!athlete) {
    setCoachView('athletes')
    return null
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button
        onClick={() => setCoachView('athletes')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Atletas
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan/10 text-cyan flex items-center justify-center font-bold text-lg">
          {athlete.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold">{athlete.name}</h2>
          <p className="text-xs text-muted-foreground">{athlete.email} · {athlete.accessCode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Planificaciones ({athlete.weeks.length})</h3>
        <Button
          onClick={() => setCoachView('create-week')}
          className="h-8 rounded-xl text-xs font-semibold bg-cyan hover:bg-cyan/90 text-white"
        >
          <Plus className="w-3 h-3 mr-1" /> Nueva Semana
        </Button>
      </div>

      <div className="space-y-2">
        {athlete.weeks.map(week => {
          const completedDays = week.days.filter(d => d.completed).length
          const feedbackCount = week.days.filter(d => d.feedback).length
          return (
            <div key={week.id} className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1"
                  onClick={() => selectWeek(week.id)}
                >
                  <Calendar className="w-4 h-4 text-cyan" />
                  <span className="text-sm font-semibold">Semana {week.weekNumber}</span>
                  <Badge className={cn('text-[10px] font-semibold border', getWeekTypeColor(week.weekType))}>
                    {week.weekType}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground/50 hover:text-destructive"
                  onClick={async () => {
                    if (confirm('¿Eliminar esta semana y todos sus días?')) {
                      try {
                        await deleteItem('deleteWeek', week.id)
                        toast.success('Semana eliminada')
                      } catch { toast.error('Error al eliminar') }
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{week.days.length} días</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-cyan" /> {completedDays} completados
                </span>
                {feedbackCount > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {feedbackCount} feedback
                    </span>
                  </>
                )}
              </div>
              {/* Mini day grid */}
              <div className="flex gap-1">
                {week.days.map(day => (
                  <div
                    key={day.id}
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-xs',
                      day.completed ? 'bg-cyan/10 text-cyan' :
                      day.isKeySession ? 'bg-orange-50 text-orange-500' :
                      day.isLongRun ? 'bg-emerald-50 text-emerald-600' :
                      'bg-muted text-muted-foreground'
                    )}
                    title={day.title}
                  >
                    {day.completed ? <Check className="w-3 h-3" /> : getTypeIcon(day.type, 'w-3 h-3')}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {athlete.weeks.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin planificaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Create Week Form ──────────────────────
function CreateWeekForm() {
  const { selectedAthleteId, createWeek, setCoachView } = useAppStore()
  const [weekNumber, setWeekNumber] = useState('1')
  const [weekType, setWeekType] = useState('BASE')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAthleteId || !weekNumber || !weekType) return
    setIsCreating(true)
    try {
      await createWeek(selectedAthleteId, parseInt(weekNumber), weekType, startDate)
      toast.success('Semana creada')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear semana')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button
        onClick={() => setCoachView('athlete-detail')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Atleta
      </button>

      <h2 className="text-xl font-bold tracking-tight">Nueva Semana</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Número de semana</Label>
          <Input
            value={weekNumber}
            onChange={e => setWeekNumber(e.target.value)}
            placeholder="1"
            type="number"
            min="1"
            className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Tipo de semana</Label>
          <div className="grid grid-cols-2 gap-2">
            {weekTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setWeekType(type)}
                className={cn(
                  'p-3 rounded-xl text-xs font-semibold border-2 transition-all',
                  weekType === type
                    ? 'border-cyan bg-cyan/5 text-cyan'
                    : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Fecha de inicio</Label>
          <Input
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            type="date"
            className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={!weekNumber || !weekType || isCreating}
          className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white"
        >
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
          Crear Semana
        </Button>
      </form>
    </div>
  )
}

// ── Week Detail (days) ──────────────────────
function WeekDetail() {
  const { coachAthletes, selectedAthleteId, selectedWeekId, setCoachView, deleteItem } = useAppStore()
  const athlete = coachAthletes.find(a => a.id === selectedAthleteId)
  const week = athlete?.weeks.find(w => w.id === selectedWeekId)

  if (!week || !athlete) {
    setCoachView('athletes')
    return null
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button
        onClick={() => setCoachView('athlete-detail')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> {athlete.name}
      </button>

      <div>
        <h2 className="text-lg font-bold">
          Semana {week.weekNumber}
          <Badge className={cn('ml-2 text-[10px] font-semibold border', getWeekTypeColor(week.weekType))}>
            {week.weekType}
          </Badge>
        </h2>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{week.days.length} días</span>
        <Button
          onClick={() => setCoachView('create-day')}
          className="h-8 rounded-xl text-xs font-semibold bg-cyan hover:bg-cyan/90 text-white"
        >
          <Plus className="w-3 h-3 mr-1" /> Nuevo Día
        </Button>
      </div>

      <div className="space-y-2">
        {week.days.map(day => (
          <div
            key={day.id}
            className="rounded-2xl border border-border/60 bg-card p-4 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  day.isKeySession ? 'bg-orange-50 text-orange-500' :
                  day.isLongRun ? 'bg-emerald-50 text-emerald-600' :
                  'bg-cyan/10 text-cyan'
                )}>
                  {getTypeIcon(day.type)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{day.dayLabel}</span>
                    {day.isKeySession && <Flame className="w-3 h-3 text-orange-500" />}
                    {day.isLongRun && <Mountain className="w-3 h-3 text-emerald-600" />}
                  </div>
                  <h4 className="text-sm font-semibold">{day.title}</h4>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground/50 hover:text-destructive"
                onClick={async () => {
                  if (confirm('¿Eliminar este día?')) {
                    try {
                      await deleteItem('deleteDay', day.id)
                      toast.success('Día eliminado')
                    } catch { toast.error('Error al eliminar') }
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{day.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {day.distance && <span className="font-medium">{day.distance}</span>}
              {day.terrain && <span className="text-muted-foreground">· {day.terrain}</span>}
              {day.intensity && <span className="text-cyan font-semibold">{day.intensity}</span>}
              {day.completed && <span className="text-cyan flex items-center gap-0.5"><Check className="w-3 h-3" /> Realizado</span>}
              {day.feedback && <span className="text-muted-foreground flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {day.feedback.feeling}</span>}
            </div>
          </div>
        ))}

        {week.days.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin días de entrenamiento</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Create Day Form ──────────────────────
function CreateDayForm() {
  const { selectedWeekId, createDay, setCoachView } = useAppStore()
  const [form, setForm] = useState({
    dayNumber: '1',
    dayLabel: 'Día 1',
    type: 'running',
    title: '',
    description: '',
    distance: '',
    terrain: '',
    pace: '',
    heartRateMin: '',
    heartRateMax: '',
    isKeySession: false,
    isLongRun: false,
    warmup: '',
    mainBlock: '',
    cooldown: '',
    coachTip: '',
    elevation: '',
    intensity: '',
    hydration: '',
    recommendations: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const updateForm = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Auto-update dayLabel when dayNumber changes
    if (key === 'dayNumber') {
      setForm(prev => ({ ...prev, dayLabel: `Día ${value}` }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWeekId || !form.title || !form.description) return
    setIsCreating(true)
    try {
      await createDay({
        weekId: selectedWeekId,
        ...form,
      })
      toast.success('Día de entrenamiento creado')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear día')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button
        onClick={() => setCoachView('week-detail')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Semana
      </button>

      <h2 className="text-xl font-bold tracking-tight">Nuevo Día</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Info básica</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Nº de día</Label>
              <Input
                value={form.dayNumber}
                onChange={e => updateForm('dayNumber', e.target.value)}
                type="number"
                min="1"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Etiqueta</Label>
              <Input
                value={form.dayLabel}
                onChange={e => updateForm('dayLabel', e.target.value)}
                placeholder="Día 1 o Lunes"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Tipo</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {dayTypes.map(dt => {
                const Icon = dt.icon
                return (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => updateForm('type', dt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2.5 rounded-xl text-[10px] font-semibold border-2 transition-all',
                      form.type === dt.value
                        ? 'border-cyan bg-cyan/5 text-cyan'
                        : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {dt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Título *</Label>
            <Input
              value={form.title}
              onChange={e => updateForm('title', e.target.value)}
              placeholder="Ej: Rodaje Z2"
              className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Descripción *</Label>
            <Textarea
              value={form.description}
              onChange={e => updateForm('description', e.target.value)}
              placeholder="Breve descripción del entrenamiento"
              className="min-h-[60px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Datos del entrenamiento</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Distancia</Label>
              <Input
                value={form.distance}
                onChange={e => updateForm('distance', e.target.value)}
                placeholder="10 km"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Terreno</Label>
              <Input
                value={form.terrain}
                onChange={e => updateForm('terrain', e.target.value)}
                placeholder="mixto, trail, pista"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Ritmo</Label>
              <Input
                value={form.pace}
                onChange={e => updateForm('pace', e.target.value)}
                placeholder="conversacional"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Intensidad</Label>
              <Input
                value={form.intensity}
                onChange={e => updateForm('intensity', e.target.value)}
                placeholder="Z2"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">FC mín</Label>
              <Input
                value={form.heartRateMin}
                onChange={e => updateForm('heartRateMin', e.target.value)}
                placeholder="140"
                type="number"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">FC máx</Label>
              <Input
                value={form.heartRateMax}
                onChange={e => updateForm('heartRateMax', e.target.value)}
                placeholder="155"
                type="number"
                className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Desnivel (trail)</Label>
            <Input
              value={form.elevation}
              onChange={e => updateForm('elevation', e.target.value)}
              placeholder="600m+"
              className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Session type */}
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de sesión</h4>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                updateForm('isKeySession', !form.isKeySession)
                if (!form.isKeySession) updateForm('isLongRun', false)
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all',
                form.isKeySession
                  ? 'border-orange-400 bg-orange-50 text-orange-600'
                  : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <Flame className="w-4 h-4" /> Sesión Clave 🔥
            </button>
            <button
              type="button"
              onClick={() => {
                updateForm('isLongRun', !form.isLongRun)
                if (!form.isLongRun) updateForm('isKeySession', false)
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all',
                form.isLongRun
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                  : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <Mountain className="w-4 h-4" /> Fondo Largo ⛰️
            </button>
          </div>
        </div>

        {/* Session structure (for key sessions) */}
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estructura de sesión</h4>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Calentamiento</Label>
            <Textarea
              value={form.warmup}
              onChange={e => updateForm('warmup', e.target.value)}
              placeholder="15 min de trote suave + movilidad"
              className="min-h-[50px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Bloque principal</Label>
            <Textarea
              value={form.mainBlock}
              onChange={e => updateForm('mainBlock', e.target.value)}
              placeholder="8 × 2 min en subida a ritmo fuerte..."
              className="min-h-[70px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Vuelta a la calma</Label>
            <Textarea
              value={form.cooldown}
              onChange={e => updateForm('cooldown', e.target.value)}
              placeholder="10 min de trote suave + estiramientos"
              className="min-h-[50px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none"
            />
          </div>
        </div>

        {/* Extra details */}
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Detalles extra</h4>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Tip del entrenador</Label>
            <Textarea
              value={form.coachTip}
              onChange={e => updateForm('coachTip', e.target.value)}
              placeholder="Un mensaje cercano y motivador..."
              className="min-h-[50px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Hidratación</Label>
            <Textarea
              value={form.hydration}
              onChange={e => updateForm('hydration', e.target.value)}
              placeholder="Recomendaciones de hidratación..."
              className="min-h-[40px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Recomendaciones</Label>
            <Textarea
              value={form.recommendations}
              onChange={e => updateForm('recommendations', e.target.value)}
              placeholder="Recomendaciones generales para el atleta..."
              className="min-h-[50px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!form.title || !form.description || isCreating}
          className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white"
        >
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
          Crear Día de Entrenamiento
        </Button>
      </form>
    </div>
  )
}

// ── Main Coach Panel ──────────────────────
export function CoachPanel() {
  const { coachView, logout } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-lg mx-auto relative">
      {/* Coach Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center">
              <Mountain className="w-4 h-4 text-cyan" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">ASCENT</span>
              <span className="text-[10px] tracking-[0.2em] text-cyan ml-1.5 font-semibold">ENTRENADOR</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-8">
        {coachView === 'athletes' && <AthletesList />}
        {coachView === 'create-athlete' && <CreateAthleteForm />}
        {coachView === 'athlete-detail' && <AthleteDetail />}
        {coachView === 'create-week' && <CreateWeekForm />}
        {coachView === 'week-detail' && <WeekDetail />}
        {coachView === 'create-day' && <CreateDayForm />}
      </main>
    </div>
  )
}
