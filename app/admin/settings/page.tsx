'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Save, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import type { FAQ, PickupPoint, SiteContent } from '@/types/database'

export default function SettingsPage() {
  const supabase = createClientComponentClient()
  const [content, setContent] = useState<Record<string, string>>({})
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [pickups, setPickups] = useState<PickupPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'faq' | 'pickup'>('content')

  // FAQ form
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })
  const [showAddFaq, setShowAddFaq] = useState(false)

  // Pickup form
  const [newPickup, setNewPickup] = useState({ name: '', address: '', schedule: '' })
  const [showAddPickup, setShowAddPickup] = useState(false)

  const fetchData = useCallback(async () => {
    const [contentRes, faqRes, pickupRes] = await Promise.all([
      supabase.from('site_content').select('*'),
      supabase.from('faq').select('*').order('order'),
      supabase.from('pickup_points').select('*').order('created_at'),
    ])
    const contentMap: Record<string, string> = {}
    contentRes.data?.forEach((c: SiteContent) => { contentMap[c.key] = c.value })
    setContent(contentMap)
    setFaqs(faqRes.data || [])
    setPickups(pickupRes.data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const saveContent = async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_content')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (!error) toast.success('Guardado ✅')
    else toast.error('Error al guardar')
  }

  const saveFaq = async () => {
    if (!newFaq.question || !newFaq.answer) { toast.error('Completá pregunta y respuesta'); return }
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 1
    const { error } = await supabase.from('faq').insert({
      question: newFaq.question,
      answer: newFaq.answer,
      order: maxOrder,
      active: true,
    })
    if (!error) { toast.success('FAQ agregada ✅'); setNewFaq({ question: '', answer: '' }); setShowAddFaq(false); fetchData() }
  }

  const deleteFaq = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return
    await supabase.from('faq').delete().eq('id', id)
    toast.success('Eliminada')
    fetchData()
  }

  const savePickup = async () => {
    if (!newPickup.name || !newPickup.address) { toast.error('Completá nombre y dirección'); return }
    const { error } = await supabase.from('pickup_points').insert({
      name: newPickup.name,
      address: newPickup.address,
      schedule: newPickup.schedule || null,
      active: true,
    })
    if (!error) { toast.success('Punto de pick up agregado ✅'); setNewPickup({ name: '', address: '', schedule: '' }); setShowAddPickup(false); fetchData() }
  }

  const deletePickup = async (id: string) => {
    if (!confirm('¿Eliminar este punto de pick up?')) return
    await supabase.from('pickup_points').delete().eq('id', id)
    toast.success('Eliminado')
    fetchData()
  }

  const EDITABLE_CONTENT = [
    { key: 'hero_title', label: 'Título principal (Hero)', multiline: false },
    { key: 'hero_subtitle', label: 'Tagline (Hero)', multiline: false },
    { key: 'hero_description', label: 'Descripción del Hero', multiline: true },
    { key: 'about_title', label: 'Título "Quiénes somos"', multiline: false },
    { key: 'about_text', label: 'Texto "Quiénes somos"', multiline: true },
    { key: 'delivery_text', label: 'Texto de envíos', multiline: true },
    { key: 'contact_email', label: 'Email de contacto', multiline: false },
    { key: 'instagram_url', label: 'URL de Instagram', multiline: false },
    { key: 'whatsapp_number', label: 'Número de WhatsApp (sin +)', multiline: false },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Configuración ⚙️</h1>
        <p className="text-gray-500 font-semibold mt-1">Editá los textos y configuraciones del sitio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-0">
        {[
          { id: 'content', label: '📝 Textos del sitio' },
          { id: 'faq', label: '❓ FAQ' },
          { id: 'pickup', label: '📍 Pick Up' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-5 py-3 font-black text-sm rounded-t-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-white border-2 border-b-0 border-gray-200 text-[#FF6B9D]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {activeTab === 'content' && (
        <div className="space-y-5">
          {EDITABLE_CONTENT.map(({ key, label, multiline }) => (
            <div key={key} className="admin-card">
              <label className="block text-sm font-black text-gray-700 mb-2">{label}</label>
              {multiline ? (
                <textarea
                  value={content[key] || ''}
                  onChange={e => setContent(prev => ({ ...prev, [key]: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={content[key] || ''}
                  onChange={e => setContent(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
                />
              )}
              <button
                onClick={() => saveContent(key, content[key] || '')}
                className="mt-3 flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-4 py-2 rounded-full text-sm hover:bg-opacity-90 transition-colors"
              >
                <Save size={14} /> Guardar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FAQ tab */}
      {activeTab === 'faq' && (
        <div>
          <div className="flex justify-end mb-5">
            <button onClick={() => setShowAddFaq(true)}
              className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 shadow-md">
              <Plus size={16} /> Agregar pregunta
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={faq.id} className="admin-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-black text-gray-900 mb-1">{faq.question}</p>
                    <p className="text-gray-600 font-semibold text-sm">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col gap-1">
                      <button disabled={idx === 0}
                        onClick={async () => {
                          const prev = faqs[idx - 1]
                          await Promise.all([
                            supabase.from('faq').update({ order: prev.order }).eq('id', faq.id),
                            supabase.from('faq').update({ order: faq.order }).eq('id', prev.id),
                          ])
                          fetchData()
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                        <ChevronUp size={14} />
                      </button>
                      <button disabled={idx === faqs.length - 1}
                        onClick={async () => {
                          const next = faqs[idx + 1]
                          await Promise.all([
                            supabase.from('faq').update({ order: next.order }).eq('id', faq.id),
                            supabase.from('faq').update({ order: faq.order }).eq('id', next.id),
                          ])
                          fetchData()
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <button onClick={() => deleteFaq(faq.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddFaq && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-black">Nueva pregunta</h3>
                  <button onClick={() => setShowAddFaq(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Pregunta" value={newFaq.question}
                    onChange={e => setNewFaq(f => ({ ...f, question: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                  <textarea placeholder="Respuesta" value={newFaq.answer} rows={4}
                    onChange={e => setNewFaq(f => ({ ...f, answer: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => setShowAddFaq(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200">Cancelar</button>
                    <button onClick={saveFaq}
                      className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90">Guardar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pickup tab */}
      {activeTab === 'pickup' && (
        <div>
          <div className="flex justify-end mb-5">
            <button onClick={() => setShowAddPickup(true)}
              className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 shadow-md">
              <Plus size={16} /> Agregar punto
            </button>
          </div>

          <div className="space-y-3">
            {pickups.map(pickup => (
              <div key={pickup.id} className="admin-card flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-gray-900">{pickup.name}</p>
                  <p className="text-gray-600 font-semibold text-sm">📍 {pickup.address}</p>
                  {pickup.schedule && <p className="text-gray-500 text-sm font-semibold">🕐 {pickup.schedule}</p>}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                    pickup.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {pickup.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <button onClick={() => deletePickup(pickup.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {showAddPickup && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-black">Nuevo punto de pick up</h3>
                  <button onClick={() => setShowAddPickup(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Nombre del punto" value={newPickup.name}
                    onChange={e => setNewPickup(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                  <input type="text" placeholder="Dirección completa" value={newPickup.address}
                    onChange={e => setNewPickup(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                  <input type="text" placeholder="Horarios (ej: Lunes a Viernes 10-18hs)" value={newPickup.schedule}
                    onChange={e => setNewPickup(f => ({ ...f, schedule: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
                  <div className="flex gap-3">
                    <button onClick={() => setShowAddPickup(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200">Cancelar</button>
                    <button onClick={savePickup}
                      className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90">Guardar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
