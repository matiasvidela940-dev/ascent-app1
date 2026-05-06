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
