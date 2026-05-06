'use client'

import { useAppStore, CoachAthleteData } from '@/lib/store'
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
  Zap,
  Copy,
  Target,
  Flag,
  Trophy,
  Pencil,
  Sparkles,
} from '@/lib/icons'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

const weekTypes = ['BASE', 'CARGA', 'PICO', 'DESCARGA']
const levels = [
  { value: 'ELITE', label: 'Elite', desc: '100+ km/sem', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { value: 'INTERMEDIO', label: 'Intermedio', desc: '40-70 km/sem', color: 'bg-cyan/10 text-cyan border-cyan/20' },
  { value: 'AMATEUR', label: 'Amateur', desc: '20-35 km/sem', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
]
const dayTypes = [
  { value: 'running', label: 'Running', icon: Footprints },
  { value: 'trail', label: 'Trail', icon: Mountain },
  { value: 'fuerza', label: 'Fuerza', icon: Dumbbell },
  { value: 'descanso', label: 'Descanso', icon: BedDouble },
]

// ── Week templates per level ──────────────────────────────
const weekTemplates: Record<string, Array<{
  type: string; title: string; description: string; distance: string;
  terrain: string; pace: string; intensity: string; heartRateMin: string; heartRateMax: string;
  isKeySession: boolean; isLongRun: boolean; elevation: string;
  warmup: string; mainBlock: string; cooldown: string; coachTip: string;
  hydration: string; recommendations: string;
}>> = {
  BASE: [
    { type: 'running', title: 'Rodaje Suave Z1', description: 'Trote regenerativo para arrancar la semana', distance: '5-6 km', terrain: 'plano', pace: 'muy fácil', intensity: 'Z1', heartRateMin: '120', heartRateMax: '135', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'fuerza', title: 'Fuerza General', description: 'Circuito de fuerza: piernas, core y upper', distance: '', terrain: 'gimnasio', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'running', title: 'Rodaje Z2', description: 'Rodaje aeróbico en zona 2', distance: '8 km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'descanso', title: 'Descanso Activo', description: 'Recuperación: caminata suave o estiramientos', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'running', title: 'Técnica de Carrera', description: 'Drills de técnica + rectas cortas', distance: '7 km', terrain: 'pista', pace: 'progresivo', intensity: 'Z3', heartRateMin: '130', heartRateMax: '160', isKeySession: true, isLongRun: false, elevation: '', warmup: '10 min trote suave + drills', mainBlock: '6 × 200m a ritmo 5K', cooldown: '10 min trote suave', coachTip: 'La técnica es la base de todo. 💪', hydration: '', recommendations: '' },
    { type: 'trail', title: 'Fondo Largo ⛰️', description: 'Fondo progresivo en trail', distance: '14-16 km', terrain: 'trail', pace: 'progresivo', intensity: 'Z2-Z3', heartRateMin: '135', heartRateMax: '155', isKeySession: false, isLongRun: true, elevation: '350m+', warmup: '', mainBlock: '', cooldown: '', coachTip: 'Empezá suave, terminá fuerte. 🌿', hydration: '1L mínimo. Geles cada 45 min.', recommendations: '• Elegí un trail que disfrutes\n• Empezá suave\n• Prestá atención al terreno técnico' },
    { type: 'descanso', title: 'Descanso Total', description: 'El cuerpo crece cuando descansa', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
  ],
  CARGA: [
    { type: 'running', title: 'Rodaje Suave Z1', description: 'Trote regenerativo para iniciar la semana', distance: '6 km', terrain: 'plano', pace: 'muy fácil', intensity: 'Z1', heartRateMin: '120', heartRateMax: '135', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'fuerza', title: 'Fuerza Funcional', description: 'Circuito de fuerza enfocado en piernas y core', distance: '', terrain: 'gimnasio', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'running', title: 'Rodaje Z2', description: 'Rodaje en zona 2 para construir base aeróbica', distance: '10 km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '155', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'descanso', title: 'Descanso Activo', description: 'Día de recuperación. Opcional: caminata o estiramientos', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'trail', title: 'Series en Cuesta 🔥', description: 'Trabajo de fuerza y potencia en subida', distance: '8 km', terrain: 'trail con desnivel', pace: 'variable', intensity: 'Z4-Z5', heartRateMin: '155', heartRateMax: '175', isKeySession: true, isLongRun: false, elevation: '', warmup: '15 min de trote suave + movilidad', mainBlock: '8 × 2 min en subida a ritmo fuerte\nBajada trotando como recuperación', cooldown: '10 min de trote suave', coachTip: 'Las últimas dos van con todo. 💪', hydration: '', recommendations: '' },
    { type: 'trail', title: 'Fondo Largo ⛰️', description: 'Fondo largo en trail para resistencia mental y física', distance: '20-22 km', terrain: 'trail montañoso', pace: 'conversacional', intensity: 'Z2', heartRateMin: '135', heartRateMax: '150', isKeySession: false, isLongRun: true, elevation: '600m+', warmup: '', mainBlock: '', cooldown: '', coachTip: 'No es carrera, es entrenamiento. 🏔️', hydration: '1.5L mínimo. Tomá cada 20-25 min.', recommendations: '• Empezá suave\n• Últimos 5 km más exigentes\n• Llevá gel para después del km 14' },
    { type: 'descanso', title: 'Descanso Total', description: 'Recuperación completa. El cuerpo crece cuando descansa.', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
  ],
  PICO: [
    { type: 'running', title: 'Rodaje Regenerativo', description: 'Trote muy suave, solo para activar', distance: '5 km', terrain: 'plano', pace: 'muy fácil', intensity: 'Z1', heartRateMin: '115', heartRateMax: '130', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'running', title: 'Intervalos Z4-Z5 🔥', description: 'Sesión de calidad: intervalos largos a ritmo umbral', distance: '9 km', terrain: 'pista o plano', pace: 'fuerte', intensity: 'Z4-Z5', heartRateMin: '165', heartRateMax: '185', isKeySession: true, isLongRun: false, elevation: '', warmup: '15 min trote suave + 4 rectas de 100m', mainBlock: '5 × 1000m a ritmo 5K\nRecovery: 2 min trote\nÚltima al máximo', cooldown: '12 min trote suave + estiramientos', coachTip: 'Esta es la sesión que te prepara para competir. Dá todo. 🔥', hydration: '', recommendations: '' },
    { type: 'descanso', title: 'Descanso Activo', description: 'Caminata suave, foam roller, estiramientos', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'running', title: 'Rodaje Z2 Corto', description: 'Rodaje aeróbico corto para mantener sensación', distance: '7 km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: '140', heartRateMax: '150', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'fuerza', title: 'Fuerza Mantenimiento', description: 'Sesión ligera de fuerza. Sin cargar.', distance: '', terrain: 'gimnasio', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'trail', title: 'Fondo Largo ⛰️', description: 'Último fondo largo antes de la descarga', distance: '18-20 km', terrain: 'trail', pace: 'conversacional', intensity: 'Z2', heartRateMin: '135', heartRateMax: '150', isKeySession: false, isLongRun: true, elevation: '500m+', warmup: '', mainBlock: '', cooldown: '', coachTip: 'Último largo, no aprietes. 🏔️', hydration: '1.5L + geles', recommendations: '• Ritmo cómodo\n• No forzar\n• Disfrutar el trail' },
    { type: 'descanso', title: 'Descanso Total', description: 'Recuperación completa', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
  ],
  DESCARGA: [
    { type: 'running', title: 'Rodaje Suave Z1', description: 'Trote regenerativo muy fácil', distance: '4 km', terrain: 'plano', pace: 'muy fácil', intensity: 'Z1', heartRateMin: '115', heartRateMax: '130', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'running', title: 'Rodaje Progresivo', description: 'Rodaje corto con progresión final', distance: '6 km', terrain: 'mixto', pace: 'progresivo', intensity: 'Z1-Z3', heartRateMin: '120', heartRateMax: '155', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: 'Dejá que el cuerpo se recupere. Sin forzar. 🧘', hydration: '', recommendations: '' },
    { type: 'descanso', title: 'Descanso Total', description: 'Día libre. Hacé lo que te guste.', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'running', title: 'Técnica + Rectas', description: 'Drills de técnica y rectas cortas sin forzar', distance: '5 km', terrain: 'pista', pace: 'moderado', intensity: 'Z2-Z3', heartRateMin: '130', heartRateMax: '155', isKeySession: false, isLongRun: false, elevation: '', warmup: 'Drills de técnica', mainBlock: '4 × 150m a 80% esfuerzo', cooldown: 'Trote suave 10 min', coachTip: '', hydration: '', recommendations: '' },
    { type: 'descanso', title: 'Descanso Activo', description: 'Yoga, natación o caminata', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
    { type: 'trail', title: 'Fondo Suave ⛰️', description: 'Fondo corto y suave en trail', distance: '10-12 km', terrain: 'trail', pace: 'muy fácil', intensity: 'Z1-Z2', heartRateMin: '120', heartRateMax: '145', isKeySession: false, isLongRun: true, elevation: '200m+', warmup: '', mainBlock: '', cooldown: '', coachTip: 'Semana de descarga, no de competencia. 🌿', hydration: '', recommendations: '' },
    { type: 'descanso', title: 'Descanso Total', description: 'Preparáte para la próxima semana de carga', distance: '', terrain: '', pace: '', intensity: '', heartRateMin: '', heartRateMax: '', isKeySession: false, isLongRun: false, elevation: '', warmup: '', mainBlock: '', cooldown: '', coachTip: '', hydration: '', recommendations: '' },
  ],
}

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

function getLevelColor(level: string) {
  const l = levels.find(lv => lv.value === level)
  return l?.color || 'bg-muted text-muted-foreground'
}

function getLevelLabel(level: string) {
  const l = levels.find(lv => lv.value === level)
  return l?.label || level
}

function getLevelDesc(level: string) {
  const l = levels.find(lv => lv.value === level)
  return l?.desc || ''
}

// ── Athletes List ──────────────────────────────
function AthletesList() {
  const { coachAthletes, selectAthlete, setCoachView } = useAppStore()

  // Group by level
  const eliteAthletes = coachAthletes.filter(a => a.level === 'ELITE')
  const intermedioAthletes = coachAthletes.filter(a => a.level === 'INTERMEDIO')
  const amateurAthletes = coachAthletes.filter(a => a.level === 'AMATEUR' || !a.level)

  const renderGroup = (title: string, athletes: CoachAthleteData[], colorClass: string) => (
    athletes.length > 0 && (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={cn('text-[10px] font-semibold border', colorClass)}>{title}</Badge>
          <span className="text-[10px] text-muted-foreground">{athletes.length} atleta{athletes.length !== 1 ? 's' : ''}</span>
        </div>
        {athletes.map(athlete => (
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
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{athlete.accessCode}</span>
                  {athlete.targetRace && (
                    <>
                      <span className="text-[10px] text-muted-foreground/40">·</span>
                      <span className="text-[10px] text-cyan font-medium flex items-center gap-0.5">
                        <Flag className="w-2.5 h-2.5" /> {athlete.targetRace}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-cyan">{athlete.weeks.length} sem.</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    )
  )

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

      <div className="space-y-4">
        {renderGroup('ELITE · 100+ km/sem', eliteAthletes, 'bg-rose-50 text-rose-600 border-rose-200')}
        {renderGroup('INTERMEDIO · 40-70 km/sem', intermedioAthletes, 'bg-cyan/10 text-cyan border-cyan/20')}
        {renderGroup('AMATEUR · 20-35 km/sem', amateurAthletes, 'bg-emerald-50 text-emerald-600 border-emerald-200')}
      </div>

      {coachAthletes.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay atletas aún</p>
          <Button onClick={() => setCoachView('create-athlete')} variant="outline" className="mt-3 rounded-xl text-xs">
            <Plus className="w-3 h-3 mr-1" /> Crear primer atleta
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Create Athlete Form ──────────────────────
function CreateAthleteForm() {
  const { createAthlete, setCoachView } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [level, setLevel] = useState('INTERMEDIO')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !accessCode) return
    setIsCreating(true)
    try {
      await createAthlete(name, email, accessCode, level)
      toast.success('Atleta creado correctamente')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear atleta')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athletes')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Atletas
      </button>
      <h2 className="text-xl font-bold tracking-tight">Nuevo Atleta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Nombre completo</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Mateo Ruiz" className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="mateo@email.com" type="email" className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Código de acceso</Label>
          <Input value={accessCode} onChange={e => setAccessCode(e.target.value.toUpperCase())} placeholder="Ej: ASCENT03" className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl uppercase" />
          <p className="text-[10px] text-muted-foreground/60">El atleta usará este código para ingresar</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Nivel</Label>
          <div className="grid grid-cols-3 gap-2">
            {levels.map(lv => (
              <button key={lv.value} type="button" onClick={() => setLevel(lv.value)}
                className={cn('flex flex-col items-center gap-0.5 p-3 rounded-xl border-2 transition-all',
                  level === lv.value ? 'border-cyan bg-cyan/5' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                <span className={cn('text-xs font-bold', level === lv.value ? 'text-cyan' : 'text-muted-foreground')}>{lv.label}</span>
                <span className="text-[9px] text-muted-foreground">{lv.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={!name || !email || !accessCode || isCreating} className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white">
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Crear Atleta
        </Button>
      </form>
    </div>
  )
}

// ── Edit Athlete Form ──────────────────────
function EditAthleteForm() {
  const { coachAthletes, selectedAthleteId, updateAthlete, setCoachView } = useAppStore()
  const athlete = coachAthletes.find(a => a.id === selectedAthleteId)
  const [name, setName] = useState(athlete?.name || '')
  const [email, setEmail] = useState(athlete?.email || '')
  const [level, setLevel] = useState(athlete?.level || 'INTERMEDIO')
  const [targetRace, setTargetRace] = useState(athlete?.targetRace || '')
  const [raceDate, setRaceDate] = useState(athlete?.raceDate ? new Date(athlete.raceDate).toISOString().split('T')[0] : '')
  const [isSaving, setIsSaving] = useState(false)

  if (!athlete) { setCoachView('athletes'); return null }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateAthlete(athlete.id, name, email, level, targetRace, raceDate)
      toast.success('Atleta actualizado')
      setCoachView('athlete-detail')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athlete-detail')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> {athlete.name}
      </button>

      <div className="flex items-center gap-2">
        <Pencil className="w-5 h-5 text-cyan" />
        <h2 className="text-xl font-bold tracking-tight">Editar Atleta</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Nombre completo</Label>
          <Input value={name} onChange={e => setName(e.target.value)} className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Nivel</Label>
          <div className="grid grid-cols-3 gap-2">
            {levels.map(lv => (
              <button key={lv.value} type="button" onClick={() => setLevel(lv.value)}
                className={cn('flex flex-col items-center gap-0.5 p-3 rounded-xl border-2 transition-all',
                  level === lv.value ? 'border-cyan bg-cyan/5' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                <span className={cn('text-xs font-bold', level === lv.value ? 'text-cyan' : 'text-muted-foreground')}>{lv.label}</span>
                <span className="text-[9px] text-muted-foreground">{lv.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-card border border-cyan/20 p-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan" />
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Carrera Objetivo</h4>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold text-muted-foreground">Nombre de la carrera</Label>
            <Input value={targetRace} onChange={e => setTargetRace(e.target.value)} placeholder="Ej: Ultra Trail Catedral 80K" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold text-muted-foreground">Fecha de la carrera</Label>
            <Input value={raceDate} onChange={e => setRaceDate(e.target.value)} type="date" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
          </div>
          <p className="text-[10px] text-muted-foreground/60">Definí una carrera objetivo para usar el Planificador de Carrera</p>
        </div>

        <Button type="submit" disabled={isSaving} className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Guardar Cambios
        </Button>
      </form>
    </div>
  )
}

// ── Athlete Detail (weeks) ──────────────────────
function AthleteDetail() {
  const { coachAthletes, selectedAthleteId, selectWeek, setCoachView, deleteItem } = useAppStore()
  const athlete = coachAthletes.find(a => a.id === selectedAthleteId)

  if (!athlete) { setCoachView('athletes'); return null }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athletes')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Atletas
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan/10 text-cyan flex items-center justify-center font-bold text-lg">
          {athlete.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{athlete.name}</h2>
            <Badge className={cn('text-[10px] font-semibold border', getLevelColor(athlete.level))}>
              {getLevelLabel(athlete.level)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{getLevelDesc(athlete.level)} · {athlete.accessCode}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCoachView('athlete-edit')} className="w-9 h-9 text-muted-foreground hover:text-cyan">
          <Pencil className="w-4 h-4" />
        </Button>
      </div>

      {/* Race target card */}
      {athlete.targetRace && (
        <div className="rounded-2xl bg-gradient-to-r from-cyan/5 to-cyan/10 border border-cyan/20 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-cyan" />
            <span className="text-xs font-bold text-cyan uppercase tracking-wider">Carrera Objetivo</span>
          </div>
          <h3 className="text-sm font-semibold">{athlete.targetRace}</h3>
          {athlete.raceDate && (
            <p className="text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(athlete.raceDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => setCoachView('quick-week')} className="h-10 rounded-xl text-xs font-semibold bg-cyan hover:bg-cyan/90 text-white">
          <Zap className="w-3.5 h-3.5 mr-1" /> Carga Rápida
        </Button>
        <Button onClick={() => setCoachView('race-planner')} className="h-10 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan to-cyan/80 text-white hover:opacity-90">
          <Target className="w-3.5 h-3.5 mr-1" /> Planificar Carrera
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Planificaciones ({athlete.weeks.length})</h3>
        <Button onClick={() => setCoachView('create-week')} variant="outline" className="h-7 rounded-xl text-[10px] font-medium border-border/80 px-2">
          <Plus className="w-3 h-3 mr-0.5" /> Semana vacía
        </Button>
      </div>

      <div className="space-y-2">
        {athlete.weeks.map(week => {
          const completedDays = week.days.filter(d => d.completed).length
          const feedbackCount = week.days.filter(d => d.feedback).length
          return (
            <div key={week.id} className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => selectWeek(week.id)}>
                  <Calendar className="w-4 h-4 text-cyan" />
                  <span className="text-sm font-semibold">Semana {week.weekNumber}</span>
                  <Badge className={cn('text-[10px] font-semibold border', getWeekTypeColor(week.weekType))}>{week.weekType}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground/50 hover:text-cyan" title="Duplicar semana"
                    onClick={() => setCoachView('duplicate-week')}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground/50 hover:text-destructive"
                    onClick={async () => {
                      if (confirm('¿Eliminar esta semana y todos sus días?')) {
                        try { await deleteItem('deleteWeek', week.id); toast.success('Semana eliminada') } catch { toast.error('Error al eliminar') }
                      }
                    }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{week.days.length} días</span><span>·</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-cyan" /> {completedDays} completados</span>
                {feedbackCount > 0 && <><span>·</span><span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {feedbackCount} feedback</span></>}
              </div>
              <div className="flex gap-1">
                {week.days.map(day => (
                  <div key={day.id} className={cn('w-7 h-7 rounded-md flex items-center justify-center text-xs',
                    day.completed ? 'bg-cyan/10 text-cyan' : day.isKeySession ? 'bg-orange-50 text-orange-500' : day.isLongRun ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'
                  )} title={day.title}>
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

// ── Race Planner ──────────────────────────────
function RacePlanner() {
  const { coachAthletes, selectedAthleteId, generateRacePlan, setCoachView } = useAppStore()
  const athlete = coachAthletes.find(a => a.id === selectedAthleteId)

  const [raceName, setRaceName] = useState(athlete?.targetRace || '')
  const [raceDate, setRaceDate] = useState(athlete?.raceDate ? new Date(athlete.raceDate).toISOString().split('T')[0] : '')
  const [totalWeeks, setTotalWeeks] = useState('8')
  const [level, setLevel] = useState(athlete?.level || 'INTERMEDIO')
  const [isCreating, setIsCreating] = useState(false)

  // Generate preview of week types
  const getWeekType = (weekIndex: number, total: number): string => {
    const weeksFromRace = total - weekIndex
    if (weeksFromRace <= 2) return 'DESCARGA'
    if (weeksFromRace === 3) return 'PICO'
    return weekIndex % 2 === 0 ? 'BASE' : 'CARGA'
  }

  const numWeeks = parseInt(totalWeeks) || 0
  const previewWeeks = Array.from({ length: numWeeks }, (_, i) => ({
    number: i + 1,
    type: getWeekType(i, numWeeks),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAthleteId || !raceDate || !totalWeeks) return
    setIsCreating(true)
    try {
      await generateRacePlan(selectedAthleteId, raceName, raceDate, totalWeeks, level)
      toast.success(`¡Plan de ${totalWeeks} semanas generado para ${raceName || 'la carrera'}!`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al generar plan')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athlete-detail')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> {athlete?.name || 'Atleta'}
      </button>

      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-cyan" />
        <h2 className="text-xl font-bold tracking-tight">Planificador de Carrera</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Generá automáticamente todas las semanas de entrenamiento hacia atrás desde la fecha de la carrera, con la periodización correcta (BASE → CARGA → PICO → DESCARGA).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 rounded-2xl bg-card border border-cyan/20 p-4">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-cyan" />
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Datos de la Carrera</h4>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold text-muted-foreground">Nombre de la carrera</Label>
            <Input value={raceName} onChange={e => setRaceName(e.target.value)} placeholder="Ej: Ultra Trail Catedral 80K" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold text-muted-foreground">Fecha de la carrera</Label>
            <Input value={raceDate} onChange={e => setRaceDate(e.target.value)} type="date" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan" />
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Configuración del Plan</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Semanas totales</Label>
              <Input value={totalWeeks} onChange={e => setTotalWeeks(e.target.value)} type="number" min="4" max="20" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Nivel del atleta</Label>
              <div className="space-y-1">
                {levels.map(lv => (
                  <button key={lv.value} type="button" onClick={() => setLevel(lv.value)}
                    className={cn('w-full flex items-center justify-between p-1.5 rounded-lg text-[10px] font-semibold border-2 transition-all',
                      level === lv.value ? 'border-cyan bg-cyan/5 text-cyan' : 'border-transparent bg-muted/30 text-muted-foreground')}>
                    <span>{lv.label}</span>
                    <span className="text-[9px] opacity-60">{lv.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview timeline */}
        {numWeeks >= 4 && (
          <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vista previa del plan</h4>
            <div className="flex flex-wrap gap-1.5">
              {previewWeeks.map(w => (
                <div key={w.number} className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-muted-foreground font-medium">S{w.number}</span>
                  <Badge className={cn('text-[8px] font-bold border px-1.5 py-0', getWeekTypeColor(w.type))}>
                    {w.type.slice(0, 3)}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan" /> BASE</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> PICO</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" /> DESCARGA</span>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1">
          <p className="text-[10px] font-semibold text-amber-700">⚡ Esto generará {numWeeks} semanas completas con 7 días cada una</p>
          <p className="text-[10px] text-amber-600">Las plantillas se ajustan automáticamente al nivel del atleta ({getLevelLabel(level)}: {getLevelDesc(level)}). Podés editar cada día después.</p>
        </div>

        <Button type="submit" disabled={!raceDate || !totalWeeks || isCreating || numWeeks < 4} className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan to-cyan/80 text-white hover:opacity-90">
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
          Generar Plan de {totalWeeks} Semanas
        </Button>
      </form>
    </div>
  )
}

// ── Create Week Form (empty) ──────────────────────
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
    try { await createWeek(selectedAthleteId, parseInt(weekNumber), weekType, startDate); toast.success('Semana creada') }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Error') }
    finally { setIsCreating(false) }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athlete-detail')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Atleta
      </button>
      <h2 className="text-xl font-bold tracking-tight">Nueva Semana (vacía)</h2>
      <p className="text-xs text-muted-foreground">Creá la semana y después agregá los días manualmente. Para crear todo junto, usá &quot;Carga Rápida&quot;.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Número de semana</Label>
          <Input value={weekNumber} onChange={e => setWeekNumber(e.target.value)} type="number" min="1" className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Tipo de semana</Label>
          <div className="grid grid-cols-2 gap-2">
            {weekTypes.map(type => (
              <button key={type} type="button" onClick={() => setWeekType(type)}
                className={cn('p-3 rounded-xl text-xs font-semibold border-2 transition-all', weekType === type ? 'border-cyan bg-cyan/5 text-cyan' : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted')}>{type}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Fecha de inicio</Label>
          <Input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className="h-11 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-xl" />
        </div>
        <Button type="submit" disabled={!weekNumber || !weekType || isCreating} className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white">
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Crear Semana
        </Button>
      </form>
    </div>
  )
}

// ── Quick Week Creation ──────────────────────
function QuickWeekForm() {
  const { selectedAthleteId, coachAthletes, createWeekWithDays, setCoachView } = useAppStore()
  const athlete = coachAthletes.find(a => a.id === selectedAthleteId)
  const [weekNumber, setWeekNumber] = useState('1')
  const [weekType, setWeekType] = useState('CARGA')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [isCreating, setIsCreating] = useState(false)
  const [useTemplate, setUseTemplate] = useState(true)

  const template = weekTemplates[weekType] || weekTemplates.BASE
  const [days, setDays] = useState(template.map((t, i) => ({ ...t, dayNumber: String(i + 1), dayLabel: `Día ${i + 1}` })))

  const handleWeekTypeChange = (type: string) => {
    setWeekType(type)
    if (useTemplate) {
      const t = weekTemplates[type] || weekTemplates.BASE
      setDays(t.map((d, i) => ({ ...d, dayNumber: String(i + 1), dayLabel: `Día ${i + 1}` })))
    }
  }

  const updateDay = (index: number, field: string, value: string | boolean) => {
    setDays(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAthleteId) return
    setIsCreating(true)
    try {
      await createWeekWithDays(selectedAthleteId, parseInt(weekNumber), weekType, startDate, days.filter(d => d.title))
      toast.success(`Semana ${weekNumber} creada con ${days.filter(d => d.title).length} días`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear semana')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athlete-detail')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Atleta
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan" />
          <h2 className="text-xl font-bold tracking-tight">Carga Rápida</h2>
        </div>
        {athlete && (
          <Badge className={cn('text-[10px] font-semibold border', getLevelColor(athlete.level))}>
            {getLevelLabel(athlete.level)}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 rounded-2xl bg-card border border-cyan/20 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Semana Nº</Label>
              <Input value={weekNumber} onChange={e => setWeekNumber(e.target.value)} type="number" min="1" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-muted-foreground">Fecha inicio</Label>
              <Input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Tipo de semana</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {weekTypes.map(type => (
                <button key={type} type="button" onClick={() => handleWeekTypeChange(type)}
                  className={cn('p-2 rounded-xl text-[10px] font-semibold border-2 transition-all', weekType === type ? 'border-cyan bg-cyan/5 text-cyan' : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted')}>{type}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => {
              const next = !useTemplate
              setUseTemplate(next)
              if (next) {
                const t = weekTemplates[weekType] || weekTemplates.BASE
                setDays(t.map((d, i) => ({ ...d, dayNumber: String(i + 1), dayLabel: `Día ${i + 1}` })))
              }
            }} className="flex items-center gap-1.5 text-xs text-cyan font-medium">
              <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center', useTemplate ? 'bg-cyan border-cyan' : 'border-muted-foreground/40')}>
                {useTemplate && <Check className="w-3 h-3 text-white" />}
              </div>
              Usar plantilla
            </button>
            <span className="text-[10px] text-muted-foreground/50">{days.filter(d => d.title).length} días</span>
          </div>
        </div>

        <div className="space-y-2">
          {days.map((day, index) => (
            <div key={index} className={cn(
              'rounded-xl border bg-card p-3 space-y-2',
              day.isKeySession ? 'border-orange-200' : day.isLongRun ? 'border-emerald-200' : 'border-border/40'
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  day.isKeySession ? 'bg-orange-50 text-orange-500' : day.isLongRun ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan/10 text-cyan'
                )}>
                  {getTypeIcon(day.type, 'w-3.5 h-3.5')}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium w-10">{day.dayLabel}</span>
                <input value={day.title} onChange={e => updateDay(index, 'title', e.target.value)} placeholder="Título del entrenamiento"
                  className="flex-1 text-sm font-semibold bg-transparent outline-none placeholder:text-muted-foreground/40" />
                <div className="flex items-center gap-1">
                  {dayTypes.map(dt => {
                    const Icon = dt.icon
                    return (
                      <button key={dt.value} type="button" onClick={() => updateDay(index, 'type', dt.value)}
                        className={cn('w-6 h-6 rounded-md flex items-center justify-center transition-all',
                          day.type === dt.value ? 'bg-cyan/10 text-cyan' : 'text-muted-foreground/30 hover:text-muted-foreground'
                        )} title={dt.label}>
                        <Icon className="w-3 h-3" />
                      </button>
                    )
                  })}
                </div>
              </div>
              <input value={day.description} onChange={e => updateDay(index, 'description', e.target.value)} placeholder="Descripción breve"
                className="w-full text-xs bg-muted/20 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-cyan/30 placeholder:text-muted-foreground/40" />
              <div className="flex flex-wrap gap-2">
                <input value={day.distance || ''} onChange={e => updateDay(index, 'distance', e.target.value)} placeholder="10 km"
                  className="w-16 text-[10px] bg-muted/20 rounded px-1.5 py-0.5 outline-none text-center placeholder:text-muted-foreground/40" />
                <input value={day.intensity || ''} onChange={e => updateDay(index, 'intensity', e.target.value)} placeholder="Z2"
                  className="w-10 text-[10px] bg-muted/20 rounded px-1.5 py-0.5 outline-none text-center placeholder:text-muted-foreground/40" />
                <input value={day.pace || ''} onChange={e => updateDay(index, 'pace', e.target.value)} placeholder="Ritmo"
                  className="w-16 text-[10px] bg-muted/20 rounded px-1.5 py-0.5 outline-none text-center placeholder:text-muted-foreground/40" />
                <input value={day.elevation || ''} onChange={e => updateDay(index, 'elevation', e.target.value)} placeholder="600m+"
                  className="w-14 text-[10px] bg-muted/20 rounded px-1.5 py-0.5 outline-none text-center placeholder:text-muted-foreground/40" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { updateDay(index, 'isKeySession', !day.isKeySession); if (!day.isKeySession) updateDay(index, 'isLongRun', false) }}
                  className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all',
                    day.isKeySession ? 'bg-orange-50 text-orange-500' : 'text-muted-foreground/40 hover:text-muted-foreground')}>
                  🔥 Clave
                </button>
                <button type="button" onClick={() => { updateDay(index, 'isLongRun', !day.isLongRun); if (!day.isLongRun) updateDay(index, 'isKeySession', false) }}
                  className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all',
                    day.isLongRun ? 'bg-emerald-50 text-emerald-600' : 'text-muted-foreground/40 hover:text-muted-foreground')}>
                  ⛰️ Fondo
                </button>
                <input value={day.coachTip || ''} onChange={e => updateDay(index, 'coachTip', e.target.value)} placeholder="💡 Tip del entrenador"
                  className="flex-1 text-[10px] bg-muted/20 rounded px-2 py-0.5 outline-none placeholder:text-muted-foreground/40" />
              </div>
              {(day.isKeySession || day.isLongRun) && (
                <div className="space-y-1.5 pt-1 border-t border-border/30">
                  {day.isKeySession && (
                    <>
                      <textarea value={day.warmup || ''} onChange={e => updateDay(index, 'warmup', e.target.value)} placeholder="Calentamiento" rows={1}
                        className="w-full text-[10px] bg-muted/20 rounded-lg px-2.5 py-1.5 outline-none resize-none placeholder:text-muted-foreground/40" />
                      <textarea value={day.mainBlock || ''} onChange={e => updateDay(index, 'mainBlock', e.target.value)} placeholder="Bloque principal" rows={2}
                        className="w-full text-[10px] bg-muted/20 rounded-lg px-2.5 py-1.5 outline-none resize-none placeholder:text-muted-foreground/40" />
                      <textarea value={day.cooldown || ''} onChange={e => updateDay(index, 'cooldown', e.target.value)} placeholder="Vuelta a la calma" rows={1}
                        className="w-full text-[10px] bg-muted/20 rounded-lg px-2.5 py-1.5 outline-none resize-none placeholder:text-muted-foreground/40" />
                    </>
                  )}
                  {day.isLongRun && (
                    <>
                      <textarea value={day.hydration || ''} onChange={e => updateDay(index, 'hydration', e.target.value)} placeholder="💧 Hidratación" rows={1}
                        className="w-full text-[10px] bg-muted/20 rounded-lg px-2.5 py-1.5 outline-none resize-none placeholder:text-muted-foreground/40" />
                      <textarea value={day.recommendations || ''} onChange={e => updateDay(index, 'recommendations', e.target.value)} placeholder="📋 Recomendaciones" rows={2}
                        className="w-full text-[10px] bg-muted/20 rounded-lg px-2.5 py-1.5 outline-none resize-none placeholder:text-muted-foreground/40" />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isCreating || !days.some(d => d.title)} className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white">
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
          Crear Semana Completa ({days.filter(d => d.title).length} días)
        </Button>
      </form>
    </div>
  )
}

// ── Duplicate Week ──────────────────────
function DuplicateWeekForm() {
  const { coachAthletes, selectedAthleteId, duplicateWeek, setCoachView } = useAppStore()
  const sourceAthlete = coachAthletes.find(a => a.id === selectedAthleteId)
  const [targetAthleteId, setTargetAthleteId] = useState(selectedAthleteId || '')
  const [sourceWeekId, setSourceWeekId] = useState(sourceAthlete?.weeks[0]?.id || '')
  const [newWeekNumber, setNewWeekNumber] = useState('')
  const [newWeekType, setNewWeekType] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const sourceWeek = sourceAthlete?.weeks.find(w => w.id === sourceWeekId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceWeekId || !targetAthleteId) return
    setIsCreating(true)
    try {
      const wn = newWeekNumber ? parseInt(newWeekNumber) : (sourceWeek?.weekNumber || 1)
      const wt = newWeekType || (sourceWeek?.weekType || 'BASE')
      await duplicateWeek(sourceWeekId, targetAthleteId, wn, wt)
      toast.success('Semana duplicada correctamente')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al duplicar')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athlete-detail')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Atleta
      </button>
      <div className="flex items-center gap-2">
        <Copy className="w-5 h-5 text-cyan" />
        <h2 className="text-xl font-bold tracking-tight">Duplicar Semana</h2>
      </div>
      <p className="text-xs text-muted-foreground">Copiá una semana existente para el mismo atleta u otro.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Semana origen</Label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {sourceAthlete?.weeks.map(week => (
              <button key={week.id} type="button" onClick={() => { setSourceWeekId(week.id); setNewWeekType(week.weekType) }}
                className={cn('w-full text-left p-3 rounded-xl border-2 transition-all',
                  sourceWeekId === week.id ? 'border-cyan bg-cyan/5' : 'border-border/40 bg-card hover:border-border')}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-cyan" />
                  <span className="text-sm font-semibold">Semana {week.weekNumber}</span>
                  <Badge className={cn('text-[9px] font-semibold border', getWeekTypeColor(week.weekType))}>{week.weekType}</Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto">{week.days.length} días</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Copiar a atleta</Label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {coachAthletes.map(a => (
              <button key={a.id} type="button" onClick={() => setTargetAthleteId(a.id)}
                className={cn('w-full text-left p-3 rounded-xl border-2 transition-all',
                  targetAthleteId === a.id ? 'border-cyan bg-cyan/5' : 'border-border/40 bg-card hover:border-border')}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan/10 text-cyan flex items-center justify-center text-xs font-bold">{a.name.charAt(0)}</div>
                  <span className="text-sm font-semibold">{a.name}</span>
                  <Badge className={cn('text-[9px] font-semibold border ml-auto', getLevelColor(a.level))}>{getLevelLabel(a.level)}</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Nueva semana Nº</Label>
            <Input value={newWeekNumber} onChange={e => setNewWeekNumber(e.target.value)} placeholder={String(sourceWeek?.weekNumber || '')} type="number" min="1"
              className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">Tipo</Label>
            <div className="grid grid-cols-2 gap-1">
              {weekTypes.map(type => (
                <button key={type} type="button" onClick={() => setNewWeekType(type)}
                  className={cn('p-1.5 rounded-lg text-[9px] font-semibold border-2 transition-all',
                    (newWeekType || sourceWeek?.weekType) === type ? 'border-cyan bg-cyan/5 text-cyan' : 'border-transparent bg-muted/50 text-muted-foreground')}>{type}</button>
              ))}
            </div>
          </div>
        </div>
        <Button type="submit" disabled={!sourceWeekId || !targetAthleteId || isCreating} className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white">
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-1" />} Duplicar Semana
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

  if (!week || !athlete) { setCoachView('athletes'); return null }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('athlete-detail')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> {athlete.name}
      </button>
      <div>
        <h2 className="text-lg font-bold">Semana {week.weekNumber}
          <Badge className={cn('ml-2 text-[10px] font-semibold border', getWeekTypeColor(week.weekType))}>{week.weekType}</Badge>
        </h2>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{week.days.length} días</span>
        <Button onClick={() => setCoachView('create-day')} className="h-8 rounded-xl text-xs font-semibold bg-cyan hover:bg-cyan/90 text-white">
          <Plus className="w-3 h-3 mr-1" /> Agregar Día
        </Button>
      </div>
      <div className="space-y-2">
        {week.days.map(day => (
          <div key={day.id} className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                  day.isKeySession ? 'bg-orange-50 text-orange-500' : day.isLongRun ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan/10 text-cyan')}>
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
              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground/50 hover:text-destructive"
                onClick={async () => { if (confirm('¿Eliminar este día?')) { try { await deleteItem('deleteDay', day.id); toast.success('Día eliminado') } catch { toast.error('Error') } } }}>
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

// ── Create Day Form (single) ──────────────────────
function CreateDayForm() {
  const { selectedWeekId, createDay, setCoachView } = useAppStore()
  const [form, setForm] = useState({
    dayNumber: '1', dayLabel: 'Día 1', type: 'running', title: '', description: '',
    distance: '', terrain: '', pace: '', heartRateMin: '', heartRateMax: '',
    isKeySession: false, isLongRun: false, warmup: '', mainBlock: '', cooldown: '',
    coachTip: '', elevation: '', intensity: '', hydration: '', recommendations: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const updateForm = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'dayNumber') setForm(prev => ({ ...prev, dayLabel: `Día ${value}` }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWeekId || !form.title || !form.description) return
    setIsCreating(true)
    try { await createDay({ weekId: selectedWeekId, ...form }); toast.success('Día creado') }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Error') }
    finally { setIsCreating(false) }
  }

  return (
    <div className="px-5 py-5 space-y-5 fade-in">
      <button onClick={() => setCoachView('week-detail')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Semana
      </button>
      <h2 className="text-xl font-bold tracking-tight">Nuevo Día</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Info básica</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Nº de día</Label><Input value={form.dayNumber} onChange={e => updateForm('dayNumber', e.target.value)} type="number" min="1" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Etiqueta</Label><Input value={form.dayLabel} onChange={e => updateForm('dayLabel', e.target.value)} placeholder="Día 1 o Lunes" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
          </div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Tipo</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {dayTypes.map(dt => { const Icon = dt.icon; return (
                <button key={dt.value} type="button" onClick={() => updateForm('type', dt.value)}
                  className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl text-[10px] font-semibold border-2 transition-all',
                    form.type === dt.value ? 'border-cyan bg-cyan/5 text-cyan' : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted')}>
                  <Icon className="w-4 h-4" />{dt.label}
                </button>
              )})}
            </div>
          </div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Título *</Label><Input value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="Ej: Rodaje Z2" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Descripción *</Label><Textarea value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Breve descripción" className="min-h-[60px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none" /></div>
        </div>
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Datos</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Distancia</Label><Input value={form.distance} onChange={e => updateForm('distance', e.target.value)} placeholder="10 km" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Terreno</Label><Input value={form.terrain} onChange={e => updateForm('terrain', e.target.value)} placeholder="mixto" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Ritmo</Label><Input value={form.pace} onChange={e => updateForm('pace', e.target.value)} placeholder="conversacional" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Intensidad</Label><Input value={form.intensity} onChange={e => updateForm('intensity', e.target.value)} placeholder="Z2" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">FC mín</Label><Input value={form.heartRateMin} onChange={e => updateForm('heartRateMin', e.target.value)} placeholder="140" type="number" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">FC máx</Label><Input value={form.heartRateMax} onChange={e => updateForm('heartRateMax', e.target.value)} placeholder="155" type="number" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
          </div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Desnivel</Label><Input value={form.elevation} onChange={e => updateForm('elevation', e.target.value)} placeholder="600m+" className="h-10 bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm" /></div>
        </div>
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de sesión</h4>
          <div className="flex gap-3">
            <button type="button" onClick={() => { updateForm('isKeySession', !form.isKeySession); if (!form.isKeySession) updateForm('isLongRun', false) }}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all', form.isKeySession ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-transparent bg-muted/50 text-muted-foreground')}>
              <Flame className="w-4 h-4" /> 🔥 Clave
            </button>
            <button type="button" onClick={() => { updateForm('isLongRun', !form.isLongRun); if (!form.isLongRun) updateForm('isKeySession', false) }}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all', form.isLongRun ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-transparent bg-muted/50 text-muted-foreground')}>
              <Mountain className="w-4 h-4" /> ⛰️ Fondo
            </button>
          </div>
        </div>
        <div className="space-y-3 rounded-2xl bg-card border border-border/60 p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estructura y extras</h4>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Calentamiento</Label><Textarea value={form.warmup} onChange={e => updateForm('warmup', e.target.value)} placeholder="15 min trote suave" className="min-h-[40px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Bloque principal</Label><Textarea value={form.mainBlock} onChange={e => updateForm('mainBlock', e.target.value)} placeholder="8 × 2 min subida..." className="min-h-[60px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Vuelta a la calma</Label><Textarea value={form.cooldown} onChange={e => updateForm('cooldown', e.target.value)} placeholder="10 min trote suave" className="min-h-[40px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Tip del entrenador</Label><Textarea value={form.coachTip} onChange={e => updateForm('coachTip', e.target.value)} placeholder="Mensaje motivador..." className="min-h-[40px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Hidratación</Label><Textarea value={form.hydration} onChange={e => updateForm('hydration', e.target.value)} placeholder="1.5L cada 20 min" className="min-h-[40px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-semibold text-muted-foreground">Recomendaciones</Label><Textarea value={form.recommendations} onChange={e => updateForm('recommendations', e.target.value)} placeholder="• Empezá suave..." className="min-h-[40px] bg-muted/30 border-0 focus-visible:ring-cyan/30 rounded-lg text-sm resize-none" /></div>
        </div>
        <Button type="submit" disabled={!form.title || !form.description || isCreating} className="w-full h-11 rounded-xl text-sm font-semibold bg-cyan hover:bg-cyan/90 text-white">
          {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} Crear Día
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
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center"><Mountain className="w-4 h-4 text-cyan" /></div>
            <div>
              <span className="text-sm font-bold tracking-tight">ASCENT</span>
              <span className="text-[10px] tracking-[0.2em] text-cyan ml-1.5 font-semibold">ENTRENADOR</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="w-8 h-8 text-muted-foreground hover:text-foreground"><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-8">
        {coachView === 'athletes' && <AthletesList />}
        {coachView === 'create-athlete' && <CreateAthleteForm />}
        {coachView === 'athlete-edit' && <EditAthleteForm />}
        {coachView === 'athlete-detail' && <AthleteDetail />}
        {coachView === 'race-planner' && <RacePlanner />}
        {coachView === 'create-week' && <CreateWeekForm />}
        {coachView === 'quick-week' && <QuickWeekForm />}
        {coachView === 'duplicate-week' && <DuplicateWeekForm />}
        {coachView === 'week-detail' && <WeekDetail />}
        {coachView === 'create-day' && <CreateDayForm />}
      </main>
    </div>
  )
}
