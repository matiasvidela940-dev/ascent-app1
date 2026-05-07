import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

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

    // Upsert feedback using Supabase upsert
    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .upsert(
        {
          id: crypto.randomUUID(),
          trainingDayId,
          feeling,
          comment: comment || null,
        },
        { onConflict: 'trainingDayId' }
      )
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al guardar el feedback' },
        { status: 500 }
      )
    }

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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const trainingDayId = searchParams.get('trainingDayId')

    if (!trainingDayId) {
      return NextResponse.json(
        { error: 'Se requiere trainingDayId' },
        { status: 400 }
      )
    }

    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('trainingDayId', trainingDayId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine (feedback is null)
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al cargar el feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ feedback: feedback || null })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { error: 'Error al cargar el feedback' },
      { status: 500 }
    )
  }
}
