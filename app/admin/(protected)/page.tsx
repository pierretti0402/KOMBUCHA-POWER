import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import DashboardCharts from '@/components/admin/DashboardCharts'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies })
  const today = new Date().toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [ordersToday, ordersPending, productsLowStock, ordersMonth, ordersWeek, allProducts] = await Promise.all([
    supabase.from('orders').select('total').gte('created_at', today).in('status', ['confirmed', 'shipped', 'delivered']),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('products').select('*').filter('stock', 'lte', 'min_stock').eq('active', true),
    supabase.from('orders').select('total, created_at').gte('created_at', startOfMonth).in('status', ['confirmed', 'shipped', 'delivered']),
    supabase.from('orders').select('total, created_at').gte('created_at', startOfWeek).in('status', ['confirmed', 'shipped', 'delivered']),
    supabase.from('products').select('*').eq('active', true),
  ])

  const todaySales = ordersToday.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
  const pendingCount = ordersPending.count || 0
  const lowStockProducts = productsLowStock.data?.filter(p => p.stock <= p.min_stock) || []
  const monthSales = ordersMonth.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

  // Build weekly data for chart
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const dayOrders = ordersWeek.data?.filter(o => o.created_at.startsWith(dateStr)) || []
    const total = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    return {
      date: date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
      ventas: total,
    }
  })

  // Profitability per product
  const profitData = (allProducts.data || []).slice(0, 8).map(p => ({
    name: `${p.flavor.split(',')[0]} - ${p.presentation}`,
    margen: p.sale_price > 0 ? Math.round(((p.sale_price - p.cost_price) / p.sale_price) * 100) : 0,
    ganancia: p.sale_price - p.cost_price,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Dashboard 👋</h1>
        <p className="text-gray-500 font-semibold mt-1">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#FF6B9D]/10 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-[#FF6B9D]" />
            </div>
            <span className="text-sm font-bold text-gray-500">Ventas hoy</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(todaySales)}</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#FF8C42]/10 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-[#FF8C42]" />
            </div>
            <span className="text-sm font-bold text-gray-500">Pedidos pendientes</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle size={20} className={lowStockProducts.length > 0 ? 'text-red-500' : 'text-green-500'} />
            </div>
            <span className="text-sm font-bold text-gray-500">Stock crítico</span>
          </div>
          <p className={`text-2xl font-black ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-gray-900'}`}>
            {lowStockProducts.length} productos
          </p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#4FC3F7]/10 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-[#4FC3F7]" />
            </div>
            <span className="text-sm font-bold text-gray-500">Ventas del mes</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(monthSales)}</p>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts weeklyData={weeklyData} profitData={profitData} />

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="admin-card mt-8 border-l-4 border-red-400">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={20} className="text-red-500" />
            <h3 className="font-black text-gray-900 text-lg">⚠️ Productos con stock bajo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-bold border-b">
                  <th className="pb-2">Producto</th>
                  <th className="pb-2">Stock actual</th>
                  <th className="pb-2">Stock mínimo</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {lowStockProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2 font-semibold">{p.flavor} - {p.presentation}</td>
                    <td className="py-2 font-black text-red-500">{p.stock}</td>
                    <td className="py-2 text-gray-500">{p.min_stock}</td>
                    <td className="py-2">
                      {p.stock === 0
                        ? <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Sin stock</span>
                        : <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">Stock bajo</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
