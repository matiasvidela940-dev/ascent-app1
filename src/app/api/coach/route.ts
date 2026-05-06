import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTemplatesForLevel } from '@/lib/training-templates'

// Helper to normalize feedback (Supabase may return array for one-to-many FK)
function normalizeFeedback(day: Record<string, unknown>) {
  if (day.feedback && Array.isArray(day.feedback)) {
    day.feedback = (day.feedback as Record<string, unknown>[])[0] || null
  }
}

// Helper to sort nested data for athletes
function sortAthleteData(athletes: Record<string, unknown>[]) {
  athletes.forEach((athlete) => {
    const weeks = (athlete.weeks || []) as Record<string, unknown>[]
    weeks.sort((a, b) => (b.weekNumber as number) - (a.weekNumber as number))
    weeks.forEach((w) => {
      const days = (w.days || []) as Record<string, unknown>[]
      days.sort((a, b) => (a.order as number) - (b.order as number))
      days.forEach(normalizeFeedback)
    })
  })
}

// GET - List all athletes with their weeks
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    // Allow both JWT session and code-based auth for backward compat
    const isCoachSession = session?.role === 'coach'
    const isCodeValid = code === 'ENTRENADOR'

    if (!isCoachSession && !isCodeValid) {
      return NextResponse.json({ error: 'Código de entrenador inválido' }, { status: 403 })
    }

    const { data: athletes, error } = await supabase
      .from('athletes')
      .select('*, weeks:training_weeks(*, days:training_days(*, feedback:feedbacks(*)))')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 })
    }

    sortAthleteData(athletes as Record<string, unknown>[])

    return NextResponse.json({ athletes })
  } catch (error) {
    console.error('Coach GET error:', error)
    return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 })
  }
}

// POST - Create athlete, week, or day
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const isCoachSession = session?.role === 'coach'
    if (!isCoachSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'createAthlete': {
        const { name, email, accessCode, level } = body
        if (!name || !email || !accessCode) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }
        const { data: athlete, error } = await supabase
          .from('athletes')
          .insert({
            id: crypto.randomUUID(),
            name,
            email: email.toLowerCase(),
            accessCode: accessCode.toUpperCase(),
            level: level || 'INTERMEDIO',
          })
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          return NextResponse.json({ error: 'Error al crear atleta' }, { status: 500 })
        }
        return NextResponse.json({ athlete })
      }

      case 'updateAthlete': {
        const { id, name, email, level, targetRace, raceDate } = body
        if (!id) return NextResponse.json({ error: 'Se requiere id' }, { status: 400 })

        const updateData: Record<string, unknown> = {}
        if (name) updateData.name = name
        if (email) updateData.email = email.toLowerCase()
        if (level) updateData.level = level
        updateData.targetRace = targetRace || null
        updateData.raceDate = raceDate || null
        updateData.updatedAt = new Date().toISOString()

        const { data: athlete, error } = await supabase
          .from('athletes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          return NextResponse.json({ error: 'Error al actualizar atleta' }, { status: 500 })
        }
        return NextResponse.json({ athlete })
      }

      case 'generateRacePlan': {
        const { athleteId, raceName, raceDate, totalWeeks, level } = body
        if (!athleteId || !raceDate || !totalWeeks) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        // Update athlete with race info
        const { error: updateError } = await supabase
          .from('athletes')
          .update({
            targetRace: raceName || null,
            raceDate: raceDate,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', athleteId)

        if (updateError) {
          console.error('Supabase error:', updateError)
        }

        const raceDay = new Date(raceDate)
        const numWeeks = parseInt(totalWeeks)

        const getWeekType = (weekIndex: number, totalWeeks: number): string => {
          const weeksFromRace = totalWeeks - weekIndex
          if (weeksFromRace <= 2) return 'DESCARGA'
          if (weeksFromRace === 3) return 'PICO'
          return weekIndex % 2 === 0 ? 'BASE' : 'CARGA'
        }

        const templates = getTemplatesForLevel(level || 'INTERMEDIO')

        const createdWeeks = []
        for (let i = 0; i < numWeeks; i++) {
          const weekType = getWeekType(i, numWeeks)
          const raceDayOfWeek = raceDay.getDay()
          const mondayOfRaceWeek = new Date(raceDay)
          mondayOfRaceWeek.setDate(raceDay.getDate() - (raceDayOfWeek === 0 ? 6 : raceDayOfWeek - 1))

          const weekStart = new Date(mondayOfRaceWeek)
          weekStart.setDate(weekStart.getDate() - (numWeeks - 1 - i) * 7)

          const { data: week, error: weekError } = await supabase
            .from('training_weeks')
            .insert({
              id: crypto.randomUUID(),
              athleteId,
              weekNumber: i + 1,
              weekType,
              startDate: weekStart.toISOString(),
            })
            .select()
            .single()

          if (weekError || !week) {
            console.error('Supabase error creating week:', weekError)
            continue
          }

          const dayTemplate = templates[weekType] || templates['BASE']
          for (const [dayIdx, dt] of dayTemplate.entries()) {
            if (!dt.title) continue
            const { error: dayError } = await supabase
              .from('training_days')
              .insert({
                id: crypto.randomUUID(),
                weekId: week.id,
                dayNumber: dayIdx + 1,
                dayLabel: `Día ${dayIdx + 1}`,
                type: dt.type,
                title: dt.title,
                description: dt.description || '',
                distance: dt.distance || null,
                terrain: dt.terrain || null,
                pace: dt.pace || null,
                heartRateMin: dt.heartRateMin ? parseInt(dt.heartRateMin) : null,
                heartRateMax: dt.heartRateMax ? parseInt(dt.heartRateMax) : null,
                isKeySession: dt.isKeySession || false,
                isLongRun: dt.isLongRun || false,
                warmup: dt.warmup || null,
                mainBlock: dt.mainBlock || null,
                cooldown: dt.cooldown || null,
                coachTip: dt.coachTip || null,
                elevation: dt.elevation || null,
                intensity: dt.intensity || null,
                hydration: dt.hydration || null,
                recommendations: dt.recommendations || null,
                order: dayIdx + 1,
              })
            if (dayError) {
              console.error('Supabase error creating day:', dayError)
            }
          }

          createdWeeks.push(week)
        }

        return NextResponse.json({ weeks: createdWeeks, count: createdWeeks.length })
      }

      case 'createWeek': {
        const { athleteId, weekNumber, weekType, startDate } = body
        if (!athleteId || !weekNumber || !weekType) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }
        const { data: week, error } = await supabase
          .from('training_weeks')
          .insert({
            id: crypto.randomUUID(),
            athleteId,
            weekNumber: parseInt(weekNumber),
            weekType,
            startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          return NextResponse.json({ error: 'Error al crear semana' }, { status: 500 })
        }
        return NextResponse.json({ week })
      }

      case 'createDay': {
        const { weekId, dayNumber, dayLabel, type, title, description, distance, terrain, pace,
                heartRateMin, heartRateMax, isKeySession, isLongRun, warmup, mainBlock, cooldown,
                coachTip, elevation, intensity, hydration, recommendations, order } = body

        if (!weekId || !dayNumber || !dayLabel || !type || !title || !description) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const { data: day, error } = await supabase
          .from('training_days')
          .insert({
            id: crypto.randomUUID(),
            weekId,
            dayNumber: parseInt(dayNumber),
            dayLabel,
            type,
            title,
            description,
            distance: distance || null,
            terrain: terrain || null,
            pace: pace || null,
            heartRateMin: heartRateMin ? parseInt(heartRateMin) : null,
            heartRateMax: heartRateMax ? parseInt(heartRateMax) : null,
            isKeySession: isKeySession || false,
            isLongRun: isLongRun || false,
            warmup: warmup || null,
            mainBlock: mainBlock || null,
            cooldown: cooldown || null,
            coachTip: coachTip || null,
            elevation: elevation || null,
            intensity: intensity || null,
            hydration: hydration || null,
            recommendations: recommendations || null,
            order: order ? parseInt(order) : parseInt(dayNumber),
          })
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          return NextResponse.json({ error: 'Error al crear día' }, { status: 500 })
        }
        return NextResponse.json({ day })
      }

      case 'createWeekWithDays': {
        const { athleteId, weekNumber, weekType, startDate, days } = body
        if (!athleteId || !weekNumber || !weekType || !days || !Array.isArray(days)) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const { data: week, error: weekError } = await supabase
          .from('training_weeks')
          .insert({
            id: crypto.randomUUID(),
            athleteId,
            weekNumber: parseInt(weekNumber),
            weekType,
            startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          })
          .select()
          .single()

        if (weekError || !week) {
          console.error('Supabase error:', weekError)
          return NextResponse.json({ error: 'Error al crear semana' }, { status: 500 })
        }

        const createdDays = []
        for (const d of days) {
          if (!d.title || !d.type) continue
          const { data: day, error: dayError } = await supabase
            .from('training_days')
            .insert({
              id: crypto.randomUUID(),
              weekId: week.id,
              dayNumber: parseInt(d.dayNumber) || 1,
              dayLabel: d.dayLabel || `Día ${d.dayNumber}`,
              type: d.type,
              title: d.title,
              description: d.description || '',
              distance: d.distance || null,
              terrain: d.terrain || null,
              pace: d.pace || null,
              heartRateMin: d.heartRateMin ? parseInt(d.heartRateMin) : null,
              heartRateMax: d.heartRateMax ? parseInt(d.heartRateMax) : null,
              isKeySession: d.isKeySession || false,
              isLongRun: d.isLongRun || false,
              warmup: d.warmup || null,
              mainBlock: d.mainBlock || null,
              cooldown: d.cooldown || null,
              coachTip: d.coachTip || null,
              elevation: d.elevation || null,
              intensity: d.intensity || null,
              hydration: d.hydration || null,
              recommendations: d.recommendations || null,
              order: d.order ? parseInt(d.order) : parseInt(d.dayNumber) || 1,
            })
            .select()
            .single()

          if (dayError) {
            console.error('Supabase error creating day:', dayError)
          } else if (day) {
            createdDays.push(day)
          }
        }

        return NextResponse.json({ week, days: createdDays })
      }

      case 'duplicateWeek': {
        const { sourceWeekId, targetAthleteId, newWeekNumber, newWeekType } = body
        if (!sourceWeekId || !targetAthleteId) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        // Fetch source week with its days
        const { data: sourceWeek, error: sourceError } = await supabase
          .from('training_weeks')
          .select('*, days:training_days(*)')
          .eq('id', sourceWeekId)
          .single()

        if (sourceError || !sourceWeek) {
          return NextResponse.json({ error: 'Semana origen no encontrada' }, { status: 404 })
        }

        // Sort source days by order
        const sourceDays = (sourceWeek.days || []).sort(
          (a: Record<string, unknown>, b: Record<string, unknown>) =>
            (a.order as number) - (b.order as number)
        )

        // Create new week
        const { data: newWeek, error: newWeekError } = await supabase
          .from('training_weeks')
          .insert({
            id: crypto.randomUUID(),
            athleteId: targetAthleteId,
            weekNumber: parseInt(newWeekNumber) || sourceWeek.weekNumber,
            weekType: newWeekType || sourceWeek.weekType,
            startDate: new Date().toISOString(),
          })
          .select()
          .single()

        if (newWeekError || !newWeek) {
          console.error('Supabase error:', newWeekError)
          return NextResponse.json({ error: 'Error al crear semana' }, { status: 500 })
        }

        // Duplicate days
        const createdDays = []
        for (const d of sourceDays) {
          const { data: day, error: dayError } = await supabase
            .from('training_days')
            .insert({
              id: crypto.randomUUID(),
              weekId: newWeek.id,
              dayNumber: d.dayNumber,
              dayLabel: d.dayLabel,
              type: d.type,
              title: d.title,
              description: d.description,
              distance: d.distance,
              terrain: d.terrain,
              pace: d.pace,
              heartRateMin: d.heartRateMin,
              heartRateMax: d.heartRateMax,
              isKeySession: d.isKeySession,
              isLongRun: d.isLongRun,
              warmup: d.warmup,
              mainBlock: d.mainBlock,
              cooldown: d.cooldown,
              coachTip: d.coachTip,
              elevation: d.elevation,
              intensity: d.intensity,
              hydration: d.hydration,
              recommendations: d.recommendations,
              order: d.order,
            })
            .select()
            .single()

          if (dayError) {
            console.error('Supabase error duplicating day:', dayError)
          } else if (day) {
            createdDays.push(day)
          }
        }

        return NextResponse.json({ week: newWeek, days: createdDays })
      }

      default:
        return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
    }
  } catch (error: unknown) {
    console.error('Coach POST error:', error)
    const message = error instanceof Error && error.message.includes('Unique')
      ? 'Ya existe un registro con esos datos'
      : 'Error al crear'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Remove athlete, week, or day
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (session?.role !== 'coach') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Se requiere id' }, { status: 400 })
    }

    switch (action) {
      case 'deleteAthlete': {
        const { error } = await supabase
          .from('athletes')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Supabase error:', error)
          return NextResponse.json({ error: 'Error al eliminar atleta' }, { status: 500 })
        }
        return NextResponse.json({ success: true })
      }
      case 'deleteWeek': {
        const { error } = await supabase
          .from('training_weeks')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Supabase error:', error)
          return NextResponse.json({ error: 'Error al eliminar semana' }, { status: 500 })
        }
        return NextResponse.json({ success: true })
      }
      case 'deleteDay': {
        const { error } = await supabase
          .from('training_days')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Supabase error:', error)
          return NextResponse.json({ error: 'Error al eliminar día' }, { status: 500 })
        }
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
    }
  } catch (error) {
    console.error('Coach DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
