'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, Filter, Download, ChevronDown, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, ORDER_STATUSES } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Order } from '@/types/database'

export default function OrdersPage() {
  const supabase = createClientComponentClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

      // Restore stock when cancelling an order
      if (status === 'cancelled') {
        const order = orders.find(o => o.id === orderId)
        if (order && Array.isArray(order.items)) {
          const flavorTotals: Record<string, number> = {}
          for (const item of order.items as { flavors?: { flavorName: string; count: number }[]; quantity: number }[]) {
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
                reason: `Restauración por cancelación de pedido ${orderId.slice(0, 8)}`,
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
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold px-4 py-2.5 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Download size={16} />
          Exportar CSV
        </button>
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
          const items = Array.isArray(order.items) ? order.items as { name?: string; flavor?: string; presentation?: string; quantity: number; price: number }[] : []
          const isExpanded = expandedId === order.id

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
                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-xs font-black text-gray-500 uppercase mb-2">Productos</p>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-700">
                            {item.name || `${item.flavor} - ${item.presentation}`} × {item.quantity}
                          </span>
                          <span className="font-black text-gray-900">{formatCurrency((item.price || 0) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  {order.customer_address && (
                    <p className="text-sm font-semibold text-gray-600 mb-4">
                      📍 {order.customer_address}
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-sm font-semibold text-gray-500 mb-4 italic">
                      💬 {order.notes}
                    </p>
                  )}

                  {/* Status change */}
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

                  {/* Delete — only for cancelled orders */}
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
    </div>
  )
}
