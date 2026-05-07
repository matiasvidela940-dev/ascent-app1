import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// Helper to normalize feedback (Supabase may return array for one-to-many FK)
function normalizeFeedback(day: Record<string, unknown>) {
  if (day.feedback && Array.isArray(day.feedback)) {
    day.feedback = (day.feedback as Record<string, unknown>[])[0] || null
  }
}

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

    const { data: weeks, error } = await supabase
      .from('training_weeks')
      .select('*, days:training_days(*, feedback:feedbacks(*))')
      .eq('athleteId', athleteId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al cargar la planificación' },
        { status: 500 }
      )
    }

    // Sort weeks by weekNumber desc
    const sortedWeeks = (weeks || []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (b.weekNumber as number) - (a.weekNumber as number)
    )

    // Sort days within each week by order asc, normalize feedback
    sortedWeeks.forEach((w: Record<string, unknown>) => {
      const days = (w.days || []) as Record<string, unknown>[]
      days.sort((a, b) => (a.order as number) - (b.order as number))
      days.forEach(normalizeFeedback)
    })

    return NextResponse.json({ weeks: sortedWeeks })
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

    const { data: day, error } = await supabase
      .from('training_days')
      .update({
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      })
      .eq('id', dayId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el entrenamiento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ day })
  } catch (error) {
    console.error('Training update error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el entrenamiento' },
      { status: 500 }
    )
  }
}
