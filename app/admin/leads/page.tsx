'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, X } from 'lucide-react'
import { formatDate, LEAD_STATUSES } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Lead } from '@/types/database'

const LEAD_STATUS_ORDER: Lead['status'][] = ['new', 'contacted', 'interested', 'converted', 'discarded']

const CHANNELS = ['Instagram', 'WhatsApp', 'Referido', 'Evento', 'Web', 'Manual', 'Otro']

interface AddLeadModalProps {
  onClose: () => void
  onSave: () => void
}

function AddLeadModal({ onClose, onSave }: AddLeadModalProps) {
  const supabase = createClientComponentClient()
  const [form, setForm] = useState({
    name: '', phone: '', email: '', channel: 'Manual', interest: '', status: 'new' as Lead['status'], notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { toast.error('El nombre es obligatorio'); return }
    setLoading(true)
    const { error } = await supabase.from('leads').insert(form)
    setLoading(false)
    if (!error) { toast.success('Lead agregado ✅'); onSave(); onClose() }
    else toast.error('Error al guardar')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-black text-gray-900">Nuevo lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Nombre *" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
          <div className="grid grid-cols-2 gap-3">
            <input type="tel" placeholder="Teléfono" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold">
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Lead['status'] }))}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold">
              {Object.entries(LEAD_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <input type="text" placeholder="Producto de interés" value={form.interest}
            onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
          <textarea placeholder="Notas" value={form.notes} rows={2}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold resize-none" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90 disabled:opacity-60">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const supabase = createClientComponentClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateStatus = async (id: string, status: Lead['status']) => {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  const leadsByStatus = LEAD_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status)
    return acc
  }, {} as Record<Lead['status'], Lead[]>)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Leads / Prospectos 🎯</h1>
          <p className="text-gray-500 font-semibold mt-1">{leads.length} leads en total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
        >
          <Plus size={16} /> Nuevo lead
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {LEAD_STATUS_ORDER.filter(s => s !== 'discarded').map(status => {
          const config = LEAD_STATUSES[status]
          const statusLeads = leadsByStatus[status] || []
          return (
            <div key={status} className="min-w-[220px]">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-black px-3 py-1.5 rounded-full ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs font-black text-gray-400 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">
                  {statusLeads.length}
                </span>
              </div>
              <div className="space-y-3">
                {statusLeads.map(lead => (
                  <div key={lead.id} className="admin-card p-4 cursor-grab">
                    <p className="font-black text-gray-900 text-sm mb-1">{lead.name}</p>
                    {lead.phone && <p className="text-xs text-gray-500 font-semibold">{lead.phone}</p>}
                    {lead.channel && (
                      <span className="inline-block text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full mt-1">
                        {lead.channel}
                      </span>
                    )}
                    {lead.interest && (
                      <p className="text-xs text-[#FF6B9D] font-bold mt-1">🎯 {lead.interest}</p>
                    )}
                    {lead.notes && <p className="text-xs text-gray-400 mt-1 italic">{lead.notes}</p>}
                    <p className="text-xs text-gray-300 font-semibold mt-2">{formatDate(lead.created_at)}</p>

                    {/* Quick status change */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {LEAD_STATUS_ORDER.filter(s => s !== status && s !== 'discarded').map(s => (
                        <button key={s}
                          onClick={() => updateStatus(lead.id, s)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          → {LEAD_STATUSES[s].label}
                        </button>
                      ))}
                      <button
                        onClick={() => updateStatus(lead.id, 'discarded')}
                        className="text-xs font-bold text-red-300 hover:text-red-500 transition-colors"
                      >
                        × Descartar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Discarded */}
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-black px-3 py-1.5 rounded-full ${LEAD_STATUSES.discarded.color}`}>
              Descartado
            </span>
            <span className="text-xs font-black text-gray-400 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">
              {(leadsByStatus.discarded || []).length}
            </span>
          </div>
          <div className="space-y-3 opacity-60">
            {(leadsByStatus.discarded || []).slice(0, 3).map(lead => (
              <div key={lead.id} className="admin-card p-4">
                <p className="font-black text-gray-700 text-sm">{lead.name}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">{lead.channel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onSave={fetchLeads} />}
    </div>
  )
}
