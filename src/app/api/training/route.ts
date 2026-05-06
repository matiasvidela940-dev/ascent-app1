import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const athleteId = searchParams.get('athleteId')

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Se requiere athleteId' },
        { status: 400 }
      )
    }

    const weeks = await db.trainingWeek.findMany({
      where: { athleteId },
      include: {
        days: {
          include: { feedback: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { weekNumber: 'desc' },
    })

    return NextResponse.json({ weeks })
  } catch (error) {
    console.error('Training fetch error:', error)
    return NextResponse.json(
      { error: 'Error al cargar la planificación' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { dayId, completed } = await request.json()

    if (!dayId) {
      return NextResponse.json(
        { error: 'Se requiere dayId' },
        { status: 400 }
      )
    }

    const day = await db.trainingDay.update({
      where: { id: dayId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json({ day })
  } catch (error) {
    console.error('Training update error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el entrenamiento' },
      { status: 500 }
    )
  }
}
