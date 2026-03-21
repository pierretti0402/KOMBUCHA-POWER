import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, customer_phone, customer_email, customer_address, items, total, notes } = body

    if (!customer_name || !items || !total) {
      return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })
    }

    // Find or create customer
    let customerId: string | null = null
    if (customer_phone || customer_email) {
      const query = supabase.from('customers').select('id')
      if (customer_phone) {
        query.eq('phone', customer_phone)
      } else if (customer_email) {
        query.eq('email', customer_email)
      }
      const { data: existingCustomer } = await query.single()

      if (existingCustomer) {
        customerId = existingCustomer.id
        // Update total spent
        await supabase.rpc('increment_customer_stats', {
          cust_id: customerId,
          amount: total,
        }).catch(() => {}) // ignore if function doesn't exist
      } else {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert({
            name: customer_name,
            phone: customer_phone,
            email: customer_email,
            address: customer_address,
            tags: [],
            total_spent: total,
            order_count: 1,
          })
          .select('id')
          .single()
        customerId = newCustomer?.id || null
      }
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        customer_name,
        customer_phone: customer_phone || '',
        customer_email,
        customer_address,
        items,
        total,
        status: 'pending',
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json({ error: 'Error creando pedido' }, { status: 500 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
