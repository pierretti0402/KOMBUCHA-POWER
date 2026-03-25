import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/abandoned-carts — save a new abandoned cart, return its id
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, customer_name, items, total } = body

    if (!email || !customer_name || !items) {
      return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('abandoned_carts')
      .insert({ email, customer_name, items, total, recovered: false })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving abandoned cart:', error)
      return NextResponse.json({ error: 'Error guardando carrito' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH /api/abandoned-carts — mark a cart as recovered
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('abandoned_carts')
      .update({ recovered: true })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
