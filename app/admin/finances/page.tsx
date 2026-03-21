'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, X } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Expense, Order } from '@/types/database'

interface MonthlyData {
  month: string
  ingresos: number
  egresos: number
  neto: number
}

export default function FinancesPage() {
  const supabase = createClientComponentClient()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [form, setForm] = useState({ category: EXPENSE_CATEGORIES[0], amount: '', date: new Date().toISOString().split('T')[0], notes: '' })

  const fetchData = useCallback(async () => {
    const [expRes, ordRes] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('orders').select('total, created_at, status').neq('status', 'cancelled'),
    ])
    setExpenses(expRes.data || [])
    setOrders(ordRes.data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount) return
    const { error } = await supabase.from('expenses').insert({
      category: form.category,
      amount: parseFloat(form.amount),
      date: form.date,
      notes: form.notes || null,
    })
    if (!error) {
      toast.success('Gasto registrado ✅')
      setShowAddExpense(false)
      setForm({ category: EXPENSE_CATEGORIES[0], amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
      fetchData()
    }
  }

  // Build monthly data for last 6 months
  const monthlyData: MonthlyData[] = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })

    const ingresos = orders
      .filter(o => o.created_at.startsWith(monthStr))
      .reduce((sum, o) => sum + (o.total || 0), 0)

    const egresos = expenses
      .filter(e => e.date.startsWith(monthStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    return { month: monthLabel, ingresos, egresos, neto: ingresos - egresos }
  })

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthIncome = orders.filter(o => o.created_at.startsWith(currentMonth)).reduce((s, o) => s + (o.total || 0), 0)
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((s, e) => s + (e.amount || 0), 0)
  const netMargin = monthIncome > 0 ? Math.round(((monthIncome - monthExpenses) / monthIncome) * 100) : 0

  // Expenses by category
  const expensesByCategory = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter(e => e.category === cat && e.date.startsWith(currentMonth))
      .reduce((s, e) => s + e.amount, 0)
    return acc
  }, {} as Record<string, number>)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Finanzas 💰</h1>
          <p className="text-gray-500 font-semibold mt-1">Resumen financiero del negocio</p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 shadow-md"
        >
          <Plus size={16} /> Registrar gasto
        </button>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">Ingresos del mes</p>
          <p className="text-2xl font-black text-green-600">{formatCurrency(monthIncome)}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">Egresos del mes</p>
          <p className="text-2xl font-black text-red-500">{formatCurrency(monthExpenses)}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">Neto del mes</p>
          <p className={`text-2xl font-black ${monthIncome - monthExpenses >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(monthIncome - monthExpenses)}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">Margen neto</p>
          <p className={`text-2xl font-black ${netMargin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {netMargin}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="admin-card">
          <h3 className="font-black text-gray-900 text-lg mb-6">Ingresos vs Egresos (6 meses)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'ingresos' ? 'Ingresos' : name === 'egresos' ? 'Egresos' : 'Neto']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="#4CAF82" radius={[4, 4, 0, 0]} name="Ingresos" />
              <Bar dataKey="egresos" fill="#FF6B9D" radius={[4, 4, 0, 0]} name="Egresos" />
              <Bar dataKey="neto" fill="#4FC3F7" radius={[4, 4, 0, 0]} name="Neto" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card">
          <h3 className="font-black text-gray-900 text-lg mb-5">Egresos del mes por categoría</h3>
          <div className="space-y-3">
            {EXPENSE_CATEGORIES.map(cat => {
              const amount = expensesByCategory[cat] || 0
              const pct = monthExpenses > 0 ? (amount / monthExpenses) * 100 : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-gray-700">{cat}</span>
                    <span className="text-sm font-black text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Expenses list */}
      <div className="admin-card overflow-hidden">
        <h3 className="font-black text-gray-900 text-lg mb-5">Registro de gastos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-black text-gray-600">Fecha</th>
                <th className="px-4 py-3 font-black text-gray-600">Categoría</th>
                <th className="px-4 py-3 font-black text-gray-600">Monto</th>
                <th className="px-4 py-3 font-black text-gray-600">Notas</th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice(0, 20).map(e => (
                <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-500">{formatDate(e.date)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 font-bold text-xs px-2 py-1 rounded-full">{e.category}</span>
                  </td>
                  <td className="px-4 py-3 font-black text-red-500">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-500">{e.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <p className="text-center py-10 text-gray-400 font-bold">No hay gastos registrados</p>
          )}
        </div>
      </div>

      {/* Add expense modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900">Registrar gasto</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold">
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Monto ($)</label>
                  <input type="number" step="0.01" required value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
                  <input type="date" required value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notas</label>
                <input type="text" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Descripción del gasto"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
