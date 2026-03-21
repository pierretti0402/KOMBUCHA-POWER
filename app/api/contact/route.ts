import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 })
    }

    // In production, integrate with email service (Resend, SendGrid, etc.)
    // For now, log and return success
    console.log('Contact form submission:', { name, email, message })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
