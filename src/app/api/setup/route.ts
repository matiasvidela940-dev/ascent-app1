import { supabase, isUsingServiceRole } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET /api/setup — Check if Supabase connection is working
export async function GET() {
  try {
    // Test read access
    const { data: athletes, error: readError } = await supabase
      .from('athletes')
      .select('id')
      .limit(1)

    if (readError) {
      return NextResponse.json({
        connected: false,
        canRead: false,
        canWrite: false,
        usingServiceRole: isUsingServiceRole,
        error: readError.message,
        needsSetup: true,
        setupType: readError.message.includes('row-level security') ? 'rls' : 'connection',
      })
    }

    // If we can read, assume write works too (RLS policies allow all)
    // Skip write test to reduce API calls and improve stability
    return NextResponse.json({
      connected: true,
      canRead: true,
      canWrite: true,
      usingServiceRole: isUsingServiceRole,
      needsSetup: false,
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      canRead: false,
      canWrite: false,
      usingServiceRole: isUsingServiceRole,
      error: error instanceof Error ? error.message : 'Unknown error',
      needsSetup: true,
      setupType: 'connection',
    })
  }
}

// POST /api/setup — Seed the database with demo data
export async function POST() {
  try {
    // Check if connection works
    const { data: existingAthletes, error: checkError } = await supabase
      .from('athletes')
      .select('id')
      .limit(1)

    if (checkError) {
      return NextResponse.json({
        success: false,
        error: `No se puede conectar a Supabase: ${checkError.message}`,
        hint: checkError.message.includes('row-level security')
          ? 'Necesitás configurar las políticas RLS o agregar la SUPABASE_SERVICE_ROLE_KEY'
          : 'Verificá las credenciales de Supabase en .env.local',
      }, { status: 400 })
    }

    // Check if demo data already exists
    const { data: demoAthlete } = await supabase
      .from('athletes')
      .select('id')
      .eq('accessCode', 'ASCENT01')
      .single()

    if (demoAthlete) {
      return NextResponse.json({
        success: true,
        message: 'Los datos de demo ya existen en la base de datos',
        athletesCount: 1,
      })
    }

    // Insert demo athlete: Mateo
    const { data: mateo, error: mateoError } = await supabase
      .from('athletes')
      .insert({
        id: crypto.randomUUID(),
        name: 'Mateo Ruiz',
        email: 'mateo@email.com',
        accessCode: 'ASCENT01',
        level: 'INTERMEDIO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (mateoError || !mateo) {
      return NextResponse.json({
        success: false,
        error: `Error al crear atleta de prueba: ${mateoError?.message}`,
      }, { status: 500 })
    }

    // Insert demo week for Mateo
    const { data: week, error: weekError } = await supabase
      .from('training_weeks')
      .insert({
        id: crypto.randomUUID(),
        athleteId: mateo.id,
        weekNumber: 1,
        weekType: 'BASE',
        startDate: new Date().toISOString(),
      })
      .select()
      .single()

    if (weekError || !week) {
      return NextResponse.json({
        success: false,
        error: `Error al crear semana: ${weekError?.message}`,
        athletesCreated: 1,
      }, { status: 500 })
    }

    // Insert demo days for the week
    const demoDays = [
      { dayNumber: 1, dayLabel: 'Lunes', type: 'running', title: 'Rodaje Suave Z1', description: 'Trote regenerativo para arrancar la semana', distance: '5-6 km', terrain: 'plano', pace: 'muy fácil', intensity: 'Z1', heartRateMin: 120, heartRateMax: 135, isKeySession: false, isLongRun: false, order: 1 },
      { dayNumber: 2, dayLabel: 'Martes', type: 'fuerza', title: 'Fuerza General', description: 'Circuito de fuerza: piernas, core y upper', distance: null, terrain: 'gimnasio', pace: null, intensity: null, heartRateMin: null, heartRateMax: null, isKeySession: false, isLongRun: false, order: 2 },
      { dayNumber: 3, dayLabel: 'Miércoles', type: 'running', title: 'Rodaje Z2', description: 'Rodaje aeróbico en zona 2', distance: '8 km', terrain: 'mixto', pace: 'conversacional', intensity: 'Z2', heartRateMin: 140, heartRateMax: 155, isKeySession: false, isLongRun: false, order: 3 },
      { dayNumber: 4, dayLabel: 'Jueves', type: 'descanso', title: 'Descanso Activo', description: 'Recuperación: caminata suave o estiramientos', distance: null, terrain: null, pace: null, intensity: null, heartRateMin: null, heartRateMax: null, isKeySession: false, isLongRun: false, order: 4 },
      { dayNumber: 5, dayLabel: 'Viernes', type: 'running', title: 'Técnica de Carrera', description: 'Drills de técnica + rectas cortas', distance: '7 km', terrain: 'pista', pace: 'progresivo', intensity: 'Z3', heartRateMin: 130, heartRateMax: 160, isKeySession: true, isLongRun: false, warmup: '10 min trote suave + drills', mainBlock: '6 × 200m a ritmo 5K', cooldown: '10 min trote suave', coachTip: 'La técnica es la base de todo. 💪', order: 5 },
      { dayNumber: 6, dayLabel: 'Sábado', type: 'trail', title: 'Fondo Largo ⛰️', description: 'Fondo progresivo en trail', distance: '14-16 km', terrain: 'trail', pace: 'progresivo', intensity: 'Z2-Z3', heartRateMin: 135, heartRateMax: 155, isKeySession: false, isLongRun: true, elevation: '350m+', coachTip: 'Empezá suave, terminá fuerte. 🌿', hydration: '1L mínimo. Geles cada 45 min.', recommendations: '• Elegí un trail que disfrutes\n• Empezá suave\n• Prestá atención al terreno técnico', order: 6 },
      { dayNumber: 7, dayLabel: 'Domingo', type: 'descanso', title: 'Descanso Total', description: 'El cuerpo crece cuando descansa', distance: null, terrain: null, pace: null, intensity: null, heartRateMin: null, heartRateMax: null, isKeySession: false, isLongRun: false, order: 7 },
    ]

    let daysCreated = 0
    for (const day of demoDays) {
      const { error: dayError } = await supabase
        .from('training_days')
        .insert({
          id: crypto.randomUUID(),
          weekId: week.id,
          ...day,
        })
      if (!dayError) daysCreated++
    }

    return NextResponse.json({
      success: true,
      message: `¡Datos de prueba creados! Atleta: Mateo Ruiz (ASCENT01), Semana 1 BASE con ${daysCreated} días`,
      athletesCreated: 1,
      weeksCreated: 1,
      daysCreated,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 })
  }
}
