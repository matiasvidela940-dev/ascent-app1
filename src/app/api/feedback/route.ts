import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { trainingDayId, feeling, comment } = await request.json()

    if (!trainingDayId || !feeling) {
      return NextResponse.json(
        { error: 'Se requiere trainingDayId y feeling' },
        { status: 400 }
      )
    }

    if (!['facil', 'normal', 'dificil'].includes(feeling)) {
      return NextResponse.json(
        { error: 'Feeling debe ser: facil, normal o dificil' },
        { status: 400 }
      )
    }

    // Upsert feedback
    const feedback = await db.feedback.upsert({
      where: { trainingDayId },
      update: {
        feeling,
        comment: comment || null,
      },
      create: {
        trainingDayId,
        feeling,
        comment: comment || null,
      },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Error al guardar el feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trainingDayId = searchParams.get('trainingDayId')

    if (!trainingDayId) {
      return NextResponse.json(
        { error: 'Se requiere trainingDayId' },
        { status: 400 }
      )
    }

    const feedback = await db.feedback.findUnique({
      where: { trainingDayId },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { error: 'Error al cargar el feedback' },
      { status: 500 }
    )
  }
}
