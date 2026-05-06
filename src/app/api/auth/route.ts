import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json()

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: 'Ingresá tu email o código de acceso' },
        { status: 400 }
      )
    }

    const trimmed = identifier.trim().toLowerCase()

    const athlete = await db.athlete.findFirst({
      where: {
        OR: [
          { email: trimmed },
          { accessCode: trimmed.toUpperCase() },
        ],
      },
      include: {
        weeks: {
          include: {
            days: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { weekNumber: 'desc' },
        },
      },
    })

    if (!athlete) {
      return NextResponse.json(
        { error: 'No encontramos tu cuenta. Verificá tu email o código.' },
        { status: 404 }
      )
    }

    // Get the latest week
    const currentWeek = athlete.weeks[0]

    return NextResponse.json({
      athlete: {
        id: athlete.id,
        name: athlete.name,
        email: athlete.email,
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
