import { NextRequest, NextResponse } from 'next/server'
import { authenticateAthlete, createSession, getSession, destroySession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// POST /api/auth — Login
export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json()

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: 'Ingresá tu email o código de acceso' },
        { status: 400 }
      )
    }

    const session = await authenticateAthlete(identifier.trim())

    if (!session) {
      return NextResponse.json(
        { error: 'No encontramos tu cuenta. Verificá tu email o código.' },
        { status: 404 }
      )
    }

    // Create JWT session in httpOnly cookie
    await createSession(session)

    // Return appropriate data based on role
    if (session.role === 'coach') {
      return NextResponse.json({
        role: 'coach',
        user: { name: session.name, email: session.email },
      })
    }

    // Fetch athlete data with weeks and days
    const { data: athlete, error } = await supabase
      .from('athletes')
      .select('*, weeks:training_weeks(*, days:training_days(*))')
      .eq('id', session.athleteId!)
      .single()

    if (error || !athlete) {
      return NextResponse.json({ error: 'Atleta no encontrado' }, { status: 404 })
    }

    // Sort weeks by weekNumber desc, days by order asc
    const weeks = (athlete.weeks || []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (b.weekNumber as number) - (a.weekNumber as number)
    )
    weeks.forEach((w: Record<string, unknown>) => {
      if (Array.isArray(w.days)) {
        w.days.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.order as number) - (b.order as number)
        )
      }
    })

    const currentWeek = weeks[0]

    return NextResponse.json({
      role: 'athlete',
      athlete: {
        id: athlete.id,
        name: athlete.name,
        email: athlete.email,
        accessCode: athlete.accessCode,
        level: athlete.level,
        targetRace: athlete.targetRace,
        raceDate: athlete.raceDate || null,
      },
      currentWeek: currentWeek
        ? {
            id: currentWeek.id,
            weekNumber: currentWeek.weekNumber,
            weekType: currentWeek.weekType,
            startDate: currentWeek.startDate,
            days: currentWeek.days,
          }
        : null,
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Error al ingresar. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}

// GET /api/auth — Check session
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    if (session.role === 'coach') {
      return NextResponse.json({
        authenticated: true,
        role: 'coach',
        user: { name: session.name, email: session.email },
      })
    }

    // Fetch fresh athlete data
    const { data: athlete, error } = await supabase
      .from('athletes')
      .select('*, weeks:training_weeks(*, days:training_days(*))')
      .eq('id', session.athleteId!)
      .single()

    if (error || !athlete) {
      return NextResponse.json({ authenticated: false })
    }

    // Sort weeks by weekNumber desc, days by order asc
    const weeks = (athlete.weeks || []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (b.weekNumber as number) - (a.weekNumber as number)
    )
    weeks.forEach((w: Record<string, unknown>) => {
      if (Array.isArray(w.days)) {
        w.days.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.order as number) - (b.order as number)
        )
      }
    })

    const currentWeek = weeks[0]

    return NextResponse.json({
      authenticated: true,
      role: 'athlete',
      athlete: {
        id: athlete.id,
        name: athlete.name,
        email: athlete.email,
        level: athlete.level,
        targetRace: athlete.targetRace,
        raceDate: athlete.raceDate || null,
      },
      currentWeek: currentWeek
        ? {
            id: currentWeek.id,
            weekNumber: currentWeek.weekNumber,
            weekType: currentWeek.weekType,
            startDate: currentWeek.startDate,
            days: currentWeek.days,
          }
        : null,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false })
  }
}

// DELETE /api/auth — Logout
export async function DELETE() {
  await destroySession()
  return NextResponse.json({ success: true })
}
