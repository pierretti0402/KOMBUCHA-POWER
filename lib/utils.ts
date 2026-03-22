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

export const PACK_SIZES = [
  { size: 3,  label: 'Pack x3',  price: 12000 },
  { size: 6,  label: 'Pack x6',  price: 20000 },
  { size: 12, label: 'Pack x12', price: 36000 },
  { size: 24, label: 'Pack x24', price: 65000 },
]

export const FLAVOR_NAMES = [
  'Pomelo Rosado y Jengibre',
  'Naranja, Frutilla y Guaraná',
  'Manzana Verde, Guaraná y Cayena',
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
