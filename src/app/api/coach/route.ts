import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const COACH_CODE = 'ENTRENADOR'

// GET - List all athletes with their weeks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (code !== COACH_CODE) {
      return NextResponse.json({ error: 'Código de entrenador inválido' }, { status: 403 })
    }

    const athletes = await db.athlete.findMany({
      include: {
        weeks: {
          include: {
            days: {
              include: { feedback: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { weekNumber: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ athletes })
  } catch (error) {
    console.error('Coach GET error:', error)
    return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 })
  }
}

// POST - Create athlete, week, or day
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'createAthlete': {
        const { name, email, accessCode } = body
        if (!name || !email || !accessCode) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }
        const athlete = await db.athlete.create({
          data: { name, email: email.toLowerCase(), accessCode: accessCode.toUpperCase() },
        })
        return NextResponse.json({ athlete })
      }

      case 'createWeek': {
        const { athleteId, weekNumber, weekType, startDate } = body
        if (!athleteId || !weekNumber || !weekType) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }
        const week = await db.trainingWeek.create({
          data: {
            athleteId,
            weekNumber: parseInt(weekNumber),
            weekType,
            startDate: startDate ? new Date(startDate) : new Date(),
          },
        })
        return NextResponse.json({ week })
      }

      case 'createDay': {
        const { weekId, dayNumber, dayLabel, type, title, description, distance, terrain, pace,
                heartRateMin, heartRateMax, isKeySession, isLongRun, warmup, mainBlock, cooldown,
                coachTip, elevation, intensity, hydration, recommendations, order } = body

        if (!weekId || !dayNumber || !dayLabel || !type || !title || !description) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const day = await db.trainingDay.create({
          data: {
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
          },
        })
        return NextResponse.json({ day })
      }

      case 'createWeekWithDays': {
        const { athleteId, weekNumber, weekType, startDate, days } = body
        if (!athleteId || !weekNumber || !weekType || !days || !Array.isArray(days)) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const week = await db.trainingWeek.create({
          data: {
            athleteId,
            weekNumber: parseInt(weekNumber),
            weekType,
            startDate: startDate ? new Date(startDate) : new Date(),
          },
        })

        const createdDays = []
        for (const d of days) {
          if (!d.title || !d.type) continue
          const day = await db.trainingDay.create({
            data: {
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
            },
          })
          createdDays.push(day)
        }

        return NextResponse.json({ week, days: createdDays })
      }

      case 'duplicateWeek': {
        const { sourceWeekId, targetAthleteId, newWeekNumber, newWeekType } = body
        if (!sourceWeekId || !targetAthleteId) {
          return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        const sourceWeek = await db.trainingWeek.findUnique({
          where: { id: sourceWeekId },
          include: { days: { orderBy: { order: 'asc' } } },
        })

        if (!sourceWeek) {
          return NextResponse.json({ error: 'Semana origen no encontrada' }, { status: 404 })
        }

        const newWeek = await db.trainingWeek.create({
          data: {
            athleteId: targetAthleteId,
            weekNumber: parseInt(newWeekNumber) || sourceWeek.weekNumber,
            weekType: newWeekType || sourceWeek.weekType,
            startDate: new Date(),
          },
        })

        const createdDays = []
        for (const d of sourceWeek.days) {
          const day = await db.trainingDay.create({
            data: {
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
            },
          })
          createdDays.push(day)
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
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Se requiere id' }, { status: 400 })
    }

    switch (action) {
      case 'deleteAthlete': {
        await db.athlete.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      case 'deleteWeek': {
        await db.trainingWeek.delete({ where: { id } })
        return NextResponse.json({ success: true })
      }
      case 'deleteDay': {
        await db.trainingDay.delete({ where: { id } })
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
