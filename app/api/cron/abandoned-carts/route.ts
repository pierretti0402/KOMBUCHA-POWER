import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

function buildEmailHtml(customerName: string, items: CartItem[], total: number): string {
  const itemsHtml = items.map(item => {
    const flavorsHtml = item.flavors
      .map(f => `<li style="margin:2px 0;color:#555;">${f.flavorName}: <strong>${f.count} ud.</strong></li>`)
      .join('')
    return `
      <div style="background:#f9f9f9;border-radius:12px;padding:14px 16px;margin-bottom:12px;">
        <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#111;">
          📦 ${item.packLabel} × ${item.quantity}
        </p>
        <ul style="margin:0 0 6px;padding-left:18px;">${flavorsHtml}</ul>
        <p style="margin:0;font-size:14px;color:#FF6B9D;font-weight:700;">
          Subtotal: ${formatCurrency(item.price * item.quantity)}
        </p>
      </div>`
  }).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#FF6B9D,#FF8C42);padding:32px 32px 28px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:3px;text-transform:uppercase;">POWER</p>
            <p style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:2px;">KOMBUCHA</p>
            <p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.9);">⚡ La gaseosa del futuro</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#111;">
              ¡Hola, ${customerName}! 👋
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              Notamos que dejaste algunos productos en tu carrito de <strong>Power Kombucha</strong>.
              Tu pedido te está esperando — ¡completalo antes de que se agote el stock!
            </p>

            <!-- Items -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:1px;">Tu carrito</p>
            ${itemsHtml}

            <!-- Total -->
            <div style="background:#fff5f8;border:2px solid #FF6B9D;border-radius:12px;padding:14px 16px;margin:20px 0;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:16px;font-weight:700;color:#111;">Total</span>
                <span style="font-size:20px;font-weight:900;color:#FF6B9D;">${formatCurrency(total)}</span>
              </div>
              <p style="margin:6px 0 0;font-size:12px;color:#4CAF50;font-weight:700;">
                💵 10% OFF pagando en efectivo → ${formatCurrency(Math.round(total * 0.9))}
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin:28px 0 8px;">
              <a href="https://power-kombucha.vercel.app"
                style="display:inline-block;background:linear-gradient(135deg,#FF6B9D,#FF8C42);color:#fff;font-size:16px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:50px;box-shadow:0 4px 16px rgba(255,107,157,0.4);">
                Completar mi pedido ⚡
              </a>
            </div>

            <p style="margin:20px 0 0;font-size:13px;color:#999;line-height:1.6;text-align:center;">
              ¿Tenés dudas? Escribinos por
              <a href="https://wa.me/5491135170335" style="color:#FF6B9D;font-weight:700;text-decoration:none;">WhatsApp</a>
              y te ayudamos.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              Power Kombucha · Buenos Aires, Argentina<br>
              <a href="https://power-kombucha.vercel.app" style="color:#FF6B9D;text-decoration:none;">power-kombucha.vercel.app</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface FlavorItem { flavorName: string; count: number }
interface CartItem { packLabel: string; packSize: number; quantity: number; price: number; flavors: FlavorItem[]; subtotal: number }

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: carts, error } = await (supabase as any)
      .from('abandoned_carts')
      .select('*')
      .eq('recovered', false)
      .lt('created_at', oneHourAgo)

    if (error) throw error
    if (!carts || carts.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    let sent = 0
    const errors: string[] = []

    for (const cart of carts) {
      try {
        const items = cart.items as CartItem[]
        const html = buildEmailHtml(cart.customer_name, items, cart.total)

        const { error: emailError } = await resend.emails.send({
          from: 'Power Kombucha <noreply@power-kombucha.vercel.app>',
          to: cart.email,
          subject: `${cart.customer_name}, olvidaste algo en tu carrito ⚡🍹`,
          html,
        })

        if (emailError) {
          errors.push(`${cart.email}: ${emailError.message}`)
        } else {
          // Mark as recovered so we don't re-send (re-use field as "email sent" flag)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('abandoned_carts')
            .update({ recovered: true })
            .eq('id', cart.id)
          sent++
        }
      } catch (err) {
        errors.push(`${cart.email}: ${String(err)}`)
      }
    }

    return NextResponse.json({ sent, errors: errors.length ? errors : undefined })
  } catch (error) {
    console.error('Abandoned cart cron error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
