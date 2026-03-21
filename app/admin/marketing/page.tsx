'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, X, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Campaign } from '@/types/database'

const PLATFORMS = ['Instagram Ads', 'Google Ads', 'TikTok Ads', 'Influencer', 'Email', 'WhatsApp', 'Evento', 'Otro']

export default function MarketingPage() {
  const supabase = createClientComponentClient()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', platform: PLATFORMS[0],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '', budget: '',
    reach: '', clicks: '', conversions: '', attributed_sales: '',
  })

  const fetchCampaigns = useCallback(async () => {
    const { data } = await supabase.from('campaigns').select('*').order('start_date', { ascending: false })
    setCampaigns(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      platform: form.platform,
      start_date: form.start_date,
      end_date: form.end_date || null,
      budget: parseFloat(form.budget) || 0,
      reach: form.reach ? parseInt(form.reach) : null,
      clicks: form.clicks ? parseInt(form.clicks) : null,
      conversions: form.conversions ? parseInt(form.conversions) : null,
      attributed_sales: form.attributed_sales ? parseFloat(form.attributed_sales) : null,
    }
    const { error } = editingId
      ? await supabase.from('campaigns').update(payload).eq('id', editingId)
      : await supabase.from('campaigns').insert(payload)

    if (!error) {
      toast.success(editingId ? 'Campaña actualizada ✅' : 'Campaña creada ✅')
      setShowAdd(false)
      setEditingId(null)
      setForm({ name: '', platform: PLATFORMS[0], start_date: new Date().toISOString().split('T')[0], end_date: '', budget: '', reach: '', clicks: '', conversions: '', attributed_sales: '' })
      fetchCampaigns()
    }
  }

  const openEdit = (c: Campaign) => {
    setForm({
      name: c.name, platform: c.platform,
      start_date: c.start_date, end_date: c.end_date || '',
      budget: String(c.budget), reach: String(c.reach || ''),
      clicks: String(c.clicks || ''), conversions: String(c.conversions || ''),
      attributed_sales: String(c.attributed_sales || ''),
    })
    setEditingId(c.id)
    setShowAdd(true)
  }

  // Monthly spend chart
  const monthlySpend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('es-AR', { month: 'short' })
    const spend = campaigns
      .filter(c => c.start_date.startsWith(monthStr))
      .reduce((s, c) => s + c.budget, 0)
    return { month: label, gasto: spend }
  })

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totalSales = campaigns.reduce((s, c) => s + (c.attributed_sales || 0), 0)
  const avgROI = totalBudget > 0 ? ((totalSales - totalBudget) / totalBudget * 100).toFixed(1) : '0'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Marketing 📣</h1>
          <p className="text-gray-500 font-semibold mt-1">{campaigns.length} campañas registradas</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowAdd(true) }}
          className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 shadow-md"
        >
          <Plus size={16} /> Nueva campaña
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">Total invertido</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">Ventas atribuidas</p>
          <p className="text-2xl font-black text-green-600">{formatCurrency(totalSales)}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">ROI total</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-black ${parseFloat(avgROI) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {avgROI}%
            </p>
            <TrendingUp size={18} className="text-green-500" />
          </div>
        </div>
        <div className="admin-card">
          <p className="text-sm font-bold text-gray-500 mb-1">Total conversiones</p>
          <p className="text-2xl font-black text-gray-900">
            {campaigns.reduce((s, c) => s + (c.conversions || 0), 0)}
          </p>
        </div>
      </div>

      {/* Spend chart */}
      <div className="admin-card mb-8">
        <h3 className="font-black text-gray-900 text-lg mb-5">Gasto en ads por mes</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlySpend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Gasto']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
            />
            <Bar dataKey="gasto" fill="#FF6B9D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-black text-gray-600">Campaña</th>
                <th className="px-4 py-3 font-black text-gray-600">Plataforma</th>
                <th className="px-4 py-3 font-black text-gray-600">Fechas</th>
                <th className="px-4 py-3 font-black text-gray-600">Presupuesto</th>
                <th className="px-4 py-3 font-black text-gray-600">Alcance</th>
                <th className="px-4 py-3 font-black text-gray-600">Clics</th>
                <th className="px-4 py-3 font-black text-gray-600">Conversiones</th>
                <th className="px-4 py-3 font-black text-gray-600">Ventas</th>
                <th className="px-4 py-3 font-black text-gray-600">ROI</th>
                <th className="px-4 py-3 font-black text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const roi = c.budget > 0 && c.attributed_sales
                  ? ((c.attributed_sales - c.budget) / c.budget * 100).toFixed(0)
                  : null
                return (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-black text-gray-900">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-700 font-bold text-xs px-2 py-1 rounded-full">{c.platform}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-500 text-xs">
                      {formatDate(c.start_date)}{c.end_date ? ` → ${formatDate(c.end_date)}` : ' → activa'}
                    </td>
                    <td className="px-4 py-3 font-black text-gray-900">{formatCurrency(c.budget)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-600">{c.reach?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-600">{c.clicks?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-600">{c.conversions || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{c.attributed_sales ? formatCurrency(c.attributed_sales) : '—'}</td>
                    <td className="px-4 py-3">
                      {roi !== null ? (
                        <span className={`font-black text-sm px-2 py-1 rounded-full ${parseFloat(roi) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {roi}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(c)}
                        className="text-xs font-bold text-[#FF6B9D] hover:underline">
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {campaigns.length === 0 && (
            <p className="text-center py-10 text-gray-400 font-bold">No hay campañas registradas</p>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900">{editingId ? 'Editar campaña' : 'Nueva campaña'}</h3>
              <button onClick={() => { setShowAdd(false); setEditingId(null) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" placeholder="Nombre de la campaña *" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="number" step="0.01" placeholder="Presupuesto ($) *" required value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Inicio</label>
                  <input type="date" required value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Fin (opcional)</label>
                  <input type="date" value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                </div>
              </div>
              <p className="text-xs font-black text-gray-500 uppercase">Métricas (opcional)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'reach', label: 'Alcance' },
                  { key: 'clicks', label: 'Clics' },
                  { key: 'conversions', label: 'Conversiones' },
                  { key: 'attributed_sales', label: 'Ventas atribuidas ($)' },
                ].map(({ key, label }) => (
                  <input key={key} type="number" placeholder={label}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAdd(false); setEditingId(null) }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200">Cancelar</button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90">
                  {editingId ? 'Actualizar' : 'Crear campaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
