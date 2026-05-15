'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, Filter, Download, ChevronDown, Trash2, Plus, X, Minus, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate, ORDER_STATUSES } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Order, Product } from '@/types/database'

// ─── Local types ──────────────────────────────────────────────────────────────
interface B2BCustomer {
  id: string
  nombre: string
  empresa: string | null
  telefono: string | null
  email: string | null
}

interface OrderLine {
  flavorName: string
  quantity: number
  unitPrice: number
}

// ─── Manual order modal ───────────────────────────────────────────────────────
interface ManualOrderModalProps {
  onClose: () => void
  onSaved: () => void
}

function ManualOrderModal({ onClose, onSaved }: ManualOrderModalProps) {
  const supabase = createClientComponentClient()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [b2bCustomers, setB2bCustomers] = useState<B2BCustomer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Customer selector
  const [customerSearch, setCustomerSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<B2BCustomer | null>(null)

  // Order form
  const [lines, setLines] = useState<OrderLine[]>([{ flavorName: '', quantity: 1, unitPrice: 0 }])
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [stockError, setStockError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [b2bRes, prodRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('b2b_customers').select('id, nombre, empresa, telefono, email').order('nombre'),
        supabase.from('products').select('id, flavor, stock, sale_price').eq('active', true).order('flavor'),
      ])
      setB2bCustomers(b2bRes.data || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProducts((prodRes.data as any) || [])
      setLoadingData(false)
    }
    load()
  }, [supabase])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredCustomers = b2bCustomers.filter(c =>
    !customerSearch ||
    c.nombre.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.empresa && c.empresa.toLowerCase().includes(customerSearch.toLowerCase()))
  )

  const stockByFlavor: Record<string, number> = {}
  const priceByFlavor: Record<string, number> = {}
  products.forEach(p => {
    stockByFlavor[p.flavor] = p.stock
    priceByFlavor[p.flavor] = p.sale_price
  })

  const flavorOptions = products.map(p => ({ flavor: p.flavor, stock: p.stock }))

  const orderTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)

  const addLine = () => setLines(prev => [...prev, { flavorName: '', quantity: 1, unitPrice: 0 }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const updateLine = (i: number, patch: Partial<OrderLine>) => {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l
      const updated = { ...l, ...patch }
      // Auto-fill unit price when flavor changes
      if (patch.flavorName !== undefined && patch.flavorName && !patch.unitPrice) {
        updated.unitPrice = priceByFlavor[patch.flavorName] ?? 0
      }
      return updated
    }))
    setStockError(null)
  }

  const handleSave = async () => {
    if (!selectedCustomer) { toast.error('Seleccioná un cliente'); return }
    const validLines = lines.filter(l => l.flavorName && l.quantity > 0)
    if (validLines.length === 0) { toast.error('Agregá al menos un producto'); return }

    // Stock validation
    const needed: Record<string, number> = {}
    for (const l of validLines) {
      needed[l.flavorName] = (needed[l.flavorName] || 0) + l.quantity
    }
    const errors: string[] = []
    for (const [flavor, qty] of Object.entries(needed)) {
      const available = stockByFlavor[flavor] ?? 0
      if (qty > available) {
        errors.push(`${flavor.split(',')[0]}: necesitás ${qty}, disponibles ${available}`)
      }
    }
    if (errors.length > 0) {
      setStockError(errors.join('\n'))
      return
    }

    setSaving(true)
    try {
      const displayTotal = paymentMethod === 'cash' ? Math.round(orderTotal * 0.9) : orderTotal
      const orderPayload = {
        customer_name: `${selectedCustomer.nombre}${selectedCustomer.empresa ? ` — ${selectedCustomer.empresa}` : ''}`,
        customer_phone: selectedCustomer.telefono || '',
        customer_email: selectedCustomer.email || null,
        customer_address: null,
        items: validLines.map(l => ({
          flavor: l.flavorName,
          quantity: l.quantity,
          price: l.unitPrice,
        })),
        total: displayTotal,
        status: 'confirmed' as const,
        notes: `Pedido manual B2B${notes ? ` — ${notes}` : ''} | Pago: ${paymentMethod === 'cash' ? 'Efectivo (10% OFF)' : 'Transferencia'}`,
      }

      const { error: orderError } = await supabase.from('orders').insert(orderPayload)
      if (orderError) throw orderError

      // Decrement stock
      for (const [flavor, qty] of Object.entries(needed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: product } = await (supabase as any)
          .from('products').select('id, stock').eq('flavor', flavor).single()
        if (product) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('products')
            .update({ stock: Math.max(0, product.stock - qty) }).eq('id', product.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('stock_movements').insert({
            product_id: product.id,
            type: 'out',
            quantity: qty,
            notes: `Pedido manual B2B — ${selectedCustomer.nombre}`,
          })
        }
      }

      toast.success('Pedido creado ✅')
      onSaved()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B9D] mx-auto" />
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-black text-gray-900">Nuevo pedido manual (B2B)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. Customer selector */}
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">Cliente mayorista *</label>
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder={selectedCustomer ? `${selectedCustomer.nombre}${selectedCustomer.empresa ? ` — ${selectedCustomer.empresa}` : ''}` : 'Buscar cliente...'}
                value={selectedCustomer ? '' : customerSearch}
                onFocus={() => { setShowDropdown(true); if (selectedCustomer) { setSelectedCustomer(null); setCustomerSearch('') } }}
                onChange={e => { setCustomerSearch(e.target.value); setShowDropdown(true) }}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm"
              />
              {selectedCustomer && (
                <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                  <span className="font-black text-gray-900 text-sm">
                    {selectedCustomer.nombre}{selectedCustomer.empresa ? ` — ${selectedCustomer.empresa}` : ''}
                  </span>
                </div>
              )}
              {showDropdown && !selectedCustomer && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400 font-semibold">Sin resultados</p>
                  ) : filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(''); setShowDropdown(false) }}
                      className="w-full text-left px-4 py-2.5 hover:bg-pink-50 transition-colors"
                    >
                      <p className="font-black text-sm text-gray-900">{c.nombre}</p>
                      {c.empresa && <p className="text-xs text-gray-500 font-semibold">{c.empresa}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Product lines */}
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">Productos *</label>
            <div className="space-y-2">
              {lines.map((line, i) => {
                const stock = line.flavorName ? (stockByFlavor[line.flavorName] ?? 0) : null
                const overStock = stock !== null && line.quantity > stock
                return (
                  <div key={i} className="flex gap-2 items-start">
                    {/* Flavor */}
                    <select
                      value={line.flavorName}
                      onChange={e => updateLine(i, { flavorName: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm bg-white"
                    >
                      <option value="">— Sabor —</option>
                      {flavorOptions.map(f => (
                        <option key={f.flavor} value={f.flavor}>
                          {f.flavor.split(',')[0]} (stock: {f.stock})
                        </option>
                      ))}
                    </select>

                    {/* Quantity */}
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#FF6B9D]">
                      <button
                        type="button"
                        onClick={() => updateLine(i, { quantity: Math.max(1, line.quantity - 1) })}
                        className="px-2 py-2.5 text-gray-400 hover:text-gray-700"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={e => updateLine(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className={`w-14 text-center py-2.5 outline-none font-black text-sm ${overStock ? 'text-red-600' : 'text-gray-900'}`}
                      />
                      <button
                        type="button"
                        onClick={() => updateLine(i, { quantity: line.quantity + 1 })}
                        className="px-2 py-2.5 text-gray-400 hover:text-gray-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Unit price */}
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                      <input
                        type="number"
                        min={0}
                        value={line.unitPrice}
                        onChange={e => updateLine(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-7 pr-2 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm"
                      />
                    </div>

                    {/* Line total */}
                    <div className="w-24 text-right py-2.5">
                      <p className="font-black text-sm text-[#FF6B9D]">{formatCurrency(line.quantity * line.unitPrice)}</p>
                      {overStock && (
                        <p className="text-[10px] text-red-500 font-bold">stock: {stock}</p>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      className="p-2.5 text-red-400 hover:text-red-600 disabled:opacity-20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={addLine}
              className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[#FF6B9D] hover:text-pink-600"
            >
              <Plus size={15} /> Agregar producto
            </button>

            {stockError && (
              <div className="mt-3 flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700 whitespace-pre-line">{stockError}</p>
              </div>
            )}
          </div>

          {/* 3. Payment method */}
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">Método de pago</label>
            <div className="flex gap-3">
              {(['transfer', 'cash'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    paymentMethod === method
                      ? method === 'cash' ? 'bg-green-500 text-white' : 'bg-[#FF6B9D] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {method === 'cash' ? '💵 Efectivo (−10%)' : '🏦 Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Notes */}
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Instrucciones de entrega, acuerdos especiales..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm resize-none"
            />
          </div>

          {/* 5. Total */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
            <div className="flex justify-between text-sm font-bold text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(orderTotal)}</span>
            </div>
            {paymentMethod === 'cash' && (
              <div className="flex justify-between text-sm font-bold text-green-600">
                <span>Descuento efectivo (10%)</span>
                <span>−{formatCurrency(Math.round(orderTotal * 0.1))}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-gray-900 text-lg pt-1 border-t border-gray-200">
              <span>Total</span>
              <span className="text-[#FF6B9D]">
                {formatCurrency(paymentMethod === 'cash' ? Math.round(orderTotal * 0.9) : orderTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-[#FF6B9D] text-white font-black rounded-full hover:bg-opacity-90 disabled:opacity-70"
          >
            {saving ? 'Guardando...' : 'Crear pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Orders page ──────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const supabase = createClientComponentClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showManualOrder, setShowManualOrder] = useState(false)

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (!error) {
      toast.success('Estado actualizado ✅')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))

      if (status === 'cancelled') {
        const order = orders.find(o => o.id === orderId)
        if (order && Array.isArray(order.items)) {
          const flavorTotals: Record<string, number> = {}
          for (const item of order.items as { flavor?: string; flavors?: { flavorName: string; count: number }[]; quantity: number }[]) {
            // B2B manual order format
            if (item.flavor) {
              flavorTotals[item.flavor] = (flavorTotals[item.flavor] || 0) + item.quantity
            }
            // B2C pack order format
            if (item.flavors) {
              for (const f of item.flavors) {
                flavorTotals[f.flavorName] = (flavorTotals[f.flavorName] || 0) + f.count * item.quantity
              }
            }
          }
          for (const [flavorName, units] of Object.entries(flavorTotals)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: product } = await (supabase as any).from('products').select('id, stock').eq('flavor', flavorName).single()
            if (product) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any).from('products').update({ stock: product.stock + units }).eq('id', product.id)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any).from('stock_movements').insert({
                product_id: product.id,
                type: 'in',
                quantity: units,
                notes: `Restauración por cancelación de pedido ${orderId.slice(0, 8)}`,
              })
            }
          }
        }
      }
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('¿Eliminár este pedido permanentemente? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (!error) {
      toast.success('Pedido eliminado ✅')
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } else {
      toast.error('Error al eliminar')
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Cliente', 'Teléfono', 'Total', 'Estado', 'Productos']
    const rows = filtered.map(o => [
      o.id.slice(0, 8),
      formatDate(o.created_at),
      o.customer_name,
      o.customer_phone,
      o.total,
      ORDER_STATUSES[o.status]?.label || o.status,
      JSON.stringify(o.items),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filtered = orders.filter(o => {
    const matchesSearch = !search ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search)
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Pedidos 🛍️</h1>
          <p className="text-gray-500 font-semibold mt-1">{orders.length} pedidos totales</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowManualOrder(true)}
            className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-4 py-2.5 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
          >
            <Plus size={16} />
            Nuevo pedido manual
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold px-4 py-2.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-bold appearance-none bg-white"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map(order => {
          const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' }
          const items = Array.isArray(order.items)
            ? order.items as { name?: string; flavor?: string; presentation?: string; quantity: number; price: number }[]
            : []
          const isExpanded = expandedId === order.id
          const isManualB2B = order.notes?.includes('Pedido manual B2B')

          return (
            <div key={order.id} className="admin-card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-gray-900">{order.customer_name}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {isManualB2B && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          B2B
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-semibold mt-0.5">
                      {formatDate(order.created_at)} · {order.customer_phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-[#FF6B9D] text-lg">{formatCurrency(order.total)}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="mb-4">
                    <p className="text-xs font-black text-gray-500 uppercase mb-2">Productos</p>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-700">
                            {item.name || item.flavor || `${item.flavor} - ${item.presentation}`} × {item.quantity}
                          </span>
                          <span className="font-black text-gray-900">{formatCurrency((item.price || 0) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.customer_address && (
                    <p className="text-sm font-semibold text-gray-600 mb-4">📍 {order.customer_address}</p>
                  )}
                  {order.notes && (
                    <p className="text-sm font-semibold text-gray-500 mb-4 italic">💬 {order.notes}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold text-gray-500 self-center">Cambiar estado:</span>
                    {Object.entries(ORDER_STATUSES).map(([key, { label, color }]) => (
                      <button
                        key={key}
                        onClick={() => updateStatus(order.id, key as Order['status'])}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                          order.status === key
                            ? color + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {order.status === 'cancelled' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Trash2 size={13} />
                        Eliminar pedido permanentemente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="font-bold text-lg">No hay pedidos que coincidan</p>
          </div>
        )}
      </div>

      {showManualOrder && (
        <ManualOrderModal
          onClose={() => setShowManualOrder(false)}
          onSaved={fetchOrders}
        />
      )}
    </div>
  )
}
