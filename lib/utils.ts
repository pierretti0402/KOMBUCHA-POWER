import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function buildWhatsAppMessage(items: { name: string; quantity: number; price: number }[], customerName: string, address?: string): string {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491176315706'

  let message = `¡Hola Power Kombucha! 🍹 Quiero hacer el siguiente pedido:\n\n`
  message += `*Cliente:* ${customerName}\n`
  if (address) message += `*Dirección:* ${address}\n`
  message += `\n*Productos:*\n`

  let total = 0
  items.forEach(item => {
    const subtotal = item.quantity * item.price
    total += subtotal
    message += `• ${item.name} x${item.quantity} = $${subtotal.toLocaleString('es-AR')}\n`
  })

  message += `\n*Total: $${total.toLocaleString('es-AR')}*`
  message += `\n\n¡Gracias! 💪`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
}

export const PRODUCT_PRESENTATIONS = [
  { label: 'Lata individual', value: 'single', multiplier: 1 },
  { label: 'Pack x3', value: 'pack3', multiplier: 3 },
  { label: 'Pack x6', value: 'pack6', multiplier: 6 },
  { label: 'Pack x12', value: 'pack12', multiplier: 12 },
  { label: 'Pack x24', value: 'pack24', multiplier: 24 },
]

export const ORDER_STATUSES = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
}

export const LEAD_STATUSES = {
  new: { label: 'Nuevo', color: 'bg-gray-100 text-gray-800' },
  contacted: { label: 'Contactado', color: 'bg-blue-100 text-blue-800' },
  interested: { label: 'Interesado', color: 'bg-yellow-100 text-yellow-800' },
  converted: { label: 'Convertido', color: 'bg-green-100 text-green-800' },
  discarded: { label: 'Descartado', color: 'bg-red-100 text-red-800' },
}

export const EXPENSE_CATEGORIES = [
  'Compra de producto',
  'Packaging',
  'Transporte',
  'Marketing',
  'Otros',
]
