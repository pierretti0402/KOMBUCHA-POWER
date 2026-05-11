'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, Plus, Edit2, X, Save, Trash2, ShoppingBag, Building2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Customer } from '@/types/database'

type B2BEstado = 'Activo' | 'Inactivo' | 'Prospecto' | 'En pausa'

const ESTADO_OPTIONS: B2BEstado[] = ['Activo', 'Inactivo', 'Prospecto', 'En pausa']

const ESTADO_COLORS: Record<B2BEstado, string> = {
  'Activo':    'bg-green-100 text-green-700',
  'Inactivo':  'bg-red-100 text-red-600',
  'Prospecto': 'bg-yellow-100 text-yellow-700',
  'En pausa':  'bg-gray-100 text-gray-500',
}

interface B2BCustomer {
  id: string
  nombre: string
  empresa: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  notas: string | null
  estado: B2BEstado | null
  created_at: string
}

const EMPTY_B2B = { nombre: '', empresa: '', telefono: '', email: '', direccion: '', notas: '', estado: 'Prospecto' as B2BEstado }

export default function CustomersPage() {
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b'>('b2c')

  // B2C state
  const [b2cCustomers, setB2cCustomers] = useState<Customer[]>([])
  const [b2cSearch, setB2cSearch] = useState('')
  const [b2cLoading, setB2cLoading] = useState(true)

  // B2B state
  const [b2bCustomers, setB2bCustomers] = useState<B2BCustomer[]>([])
  const [b2bSearch, setB2bSearch] = useState('')
  const [b2bLoading, setB2bLoading] = useState(true)
  const [editingB2BId, setEditingB2BId] = useState<string | null>(null)
  const [editB2BForm, setEditB2BForm] = useState<Partial<B2BCustomer>>({})
  const [showAddB2B, setShowAddB2B] = useState(false)
  const [newB2B, setNewB2B] = useState(EMPTY_B2B)

  const fetchB2C = useCallback(async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    setB2cCustomers(data || [])
    setB2cLoading(false)
  }, [supabase])

  const fetchB2B = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from('b2b_customers').select('*').order('created_at', { ascending: false })
    if (!error) setB2bCustomers(data || [])
    setB2bLoading(false)
  }, [supabase])

  useEffect(() => { fetchB2C(); fetchB2B() }, [fetchB2C, fetchB2B])

  // ── B2C ──────────────────────────────────────────────────────────────────────
  const deleteB2C = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name} permanentemente? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (!error) {
      toast.success('Cliente eliminado ✅')
      setB2cCustomers(prev => prev.filter(c => c.id !== id))
    } else {
      toast.error('Error al eliminar')
    }
  }

  // ── B2B ──────────────────────────────────────────────────────────────────────
  const handleAddB2B = async () => {
    if (!newB2B.nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('b2b_customers').insert({ ...newB2B })
    if (!error) {
      toast.success('Mayorista agregado ✅')
      setShowAddB2B(false)
      setNewB2B(EMPTY_B2B)
      fetchB2B()
    } else {
      toast.error(`Error: ${error.message}`)
    }
  }

  const handleSaveB2B = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('b2b_customers').update(editB2BForm).eq('id', id)
    if (!error) {
      toast.success('Mayorista actualizado ✅')
      setEditingB2BId(null)
      fetchB2B()
    } else {
      toast.error(`Error: ${error.message}`)
    }
  }

  const deleteB2B = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar a ${nombre} permanentemente? Esta acción no se puede deshacer.`)) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('b2b_customers').delete().eq('id', id)
    if (!error) {
      toast.success('Mayorista eliminado ✅')
      setB2bCustomers(prev => prev.filter(c => c.id !== id))
    } else {
      toast.error('Error al eliminar')
    }
  }

  const filteredB2C = b2cCustomers.filter(c =>
    !b2cSearch ||
    c.name.toLowerCase().includes(b2cSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(b2cSearch)) ||
    (c.email && c.email.toLowerCase().includes(b2cSearch.toLowerCase()))
  )

  const filteredB2B = b2bCustomers.filter(c =>
    !b2bSearch ||
    c.nombre.toLowerCase().includes(b2bSearch.toLowerCase()) ||
    (c.empresa && c.empresa.toLowerCase().includes(b2bSearch.toLowerCase())) ||
    (c.telefono && c.telefono.includes(b2bSearch)) ||
    (c.email && c.email.toLowerCase().includes(b2bSearch.toLowerCase()))
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Clientes 👥</h1>
        <p className="text-gray-500 font-semibold mt-1">
          {b2cCustomers.length} clientes web · {b2bCustomers.length} mayoristas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
        {([
          { key: 'b2c', icon: ShoppingBag, label: 'Clientes Web (B2C)', count: b2cCustomers.length },
          { key: 'b2b', icon: Building2,   label: 'Mayoristas (B2B)',   count: b2bCustomers.length },
        ] as const).map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === key
                ? 'bg-white text-[#FF6B9D] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
              activeTab === key ? 'bg-pink-100 text-[#FF6B9D]' : 'bg-gray-200 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── B2C Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'b2c' && (
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-5">
            Creados automáticamente cuando alguien realiza un pedido en la tienda. Solo lectura.
          </p>

          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={b2cSearch}
              onChange={e => setB2cSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
            />
          </div>

          {b2cLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B9D]" />
            </div>
          ) : (
            <div className="admin-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-black text-gray-600">Cliente</th>
                      <th className="px-4 py-3 font-black text-gray-600">Contacto</th>
                      <th className="px-4 py-3 font-black text-gray-600">Pedidos</th>
                      <th className="px-4 py-3 font-black text-gray-600">Total gastado</th>
                      <th className="px-4 py-3 font-black text-gray-600">Desde</th>
                      <th className="px-4 py-3 font-black text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredB2C.map(c => (
                      <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-black text-gray-900">{c.name}</p>
                          {c.address && (
                            <p className="text-xs text-gray-400 font-semibold truncate max-w-[200px]">{c.address}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.phone && <p className="font-semibold text-gray-700">{c.phone}</p>}
                          {c.email && <p className="text-xs text-gray-400 font-semibold">{c.email}</p>}
                        </td>
                        <td className="px-4 py-3 font-black text-gray-900">{c.order_count}</td>
                        <td className="px-4 py-3 font-black text-[#FF6B9D]">{formatCurrency(c.total_spent)}</td>
                        <td className="px-4 py-3 font-semibold text-gray-500 whitespace-nowrap">{formatDate(c.created_at)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteB2C(c.id, c.name)}
                            className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredB2C.length === 0 && (
                  <p className="text-center py-10 text-gray-400 font-bold">
                    {b2cSearch ? 'No hay clientes que coincidan' : 'Aún no hay clientes web'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── B2B Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'b2b' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-gray-400">
              Cafés, restaurantes y clientes mayoristas gestionados manualmente.
            </p>
            <button
              onClick={() => setShowAddB2B(true)}
              className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
            >
              <Plus size={16} /> Nuevo mayorista
            </button>
          </div>

          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa, teléfono o email..."
              value={b2bSearch}
              onChange={e => setB2bSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
            />
          </div>

          {b2bLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B9D]" />
            </div>
          ) : (
            <div className="admin-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-black text-gray-600">Nombre</th>
                      <th className="px-4 py-3 font-black text-gray-600">Empresa</th>
                      <th className="px-4 py-3 font-black text-gray-600">Contacto</th>
                      <th className="px-4 py-3 font-black text-gray-600">Dirección</th>
                      <th className="px-4 py-3 font-black text-gray-600">Notas</th>
                      <th className="px-4 py-3 font-black text-gray-600">Estado</th>
                      <th className="px-4 py-3 font-black text-gray-600">Desde</th>
                      <th className="px-4 py-3 font-black text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredB2B.map(c => (
                      <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {editingB2BId === c.id ? (
                            <input
                              value={editB2BForm.nombre || ''}
                              onChange={e => setEditB2BForm(f => ({ ...f, nombre: e.target.value }))}
                              className="w-full px-2 py-1 rounded-lg border-2 border-[#FF6B9D] outline-none text-sm font-semibold"
                            />
                          ) : (
                            <p className="font-black text-gray-900">{c.nombre}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingB2BId === c.id ? (
                            <input
                              value={editB2BForm.empresa || ''}
                              onChange={e => setEditB2BForm(f => ({ ...f, empresa: e.target.value }))}
                              placeholder="Empresa"
                              className="w-full px-2 py-1 rounded-lg border border-gray-200 outline-none text-sm font-semibold"
                            />
                          ) : (
                            <p className="font-semibold text-gray-600">{c.empresa || '—'}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingB2BId === c.id ? (
                            <div className="space-y-1">
                              <input
                                value={editB2BForm.telefono || ''}
                                onChange={e => setEditB2BForm(f => ({ ...f, telefono: e.target.value }))}
                                placeholder="Teléfono"
                                className="w-full px-2 py-1 rounded-lg border border-gray-200 outline-none text-xs font-semibold"
                              />
                              <input
                                value={editB2BForm.email || ''}
                                onChange={e => setEditB2BForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="Email"
                                className="w-full px-2 py-1 rounded-lg border border-gray-200 outline-none text-xs font-semibold"
                              />
                            </div>
                          ) : (
                            <div>
                              {c.telefono && <p className="font-semibold text-gray-700">{c.telefono}</p>}
                              {c.email && <p className="text-xs text-gray-400 font-semibold">{c.email}</p>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingB2BId === c.id ? (
                            <input
                              value={editB2BForm.direccion || ''}
                              onChange={e => setEditB2BForm(f => ({ ...f, direccion: e.target.value }))}
                              placeholder="Dirección"
                              className="w-full px-2 py-1 rounded-lg border border-gray-200 outline-none text-sm font-semibold"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 font-semibold max-w-[160px] truncate">{c.direccion || '—'}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingB2BId === c.id ? (
                            <input
                              value={editB2BForm.notas || ''}
                              onChange={e => setEditB2BForm(f => ({ ...f, notas: e.target.value }))}
                              placeholder="Notas"
                              className="w-full px-2 py-1 rounded-lg border border-gray-200 outline-none text-sm font-semibold"
                            />
                          ) : (
                            <p className="text-xs text-gray-400 font-semibold max-w-[140px] truncate">{c.notas || '—'}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingB2BId === c.id ? (
                            <select
                              value={editB2BForm.estado || 'Prospecto'}
                              onChange={e => setEditB2BForm(f => ({ ...f, estado: e.target.value as B2BEstado }))}
                              className="px-2 py-1 rounded-lg border border-gray-200 outline-none text-xs font-semibold bg-white"
                            >
                              {ESTADO_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ESTADO_COLORS[(c.estado || 'Prospecto') as B2BEstado]}`}>
                              {c.estado || 'Prospecto'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-500 whitespace-nowrap">{formatDate(c.created_at)}</td>
                        <td className="px-4 py-3">
                          {editingB2BId === c.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveB2B(c.id)}
                                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={() => setEditingB2BId(null)}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingB2BId(c.id); setEditB2BForm(c) }}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteB2B(c.id, c.nombre)}
                                className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredB2B.length === 0 && (
                  <p className="text-center py-10 text-gray-400 font-bold">
                    {b2bSearch ? 'No hay mayoristas que coincidan' : 'Aún no hay clientes mayoristas'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── B2B Add Modal ────────────────────────────────────────────────────── */}
      {showAddB2B && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900">Nuevo mayorista</h3>
              <button
                onClick={() => { setShowAddB2B(false); setNewB2B(EMPTY_B2B) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text" placeholder="Nombre *" value={newB2B.nombre}
                onChange={e => setNewB2B(f => ({ ...f, nombre: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
              <input
                type="text" placeholder="Empresa / Local" value={newB2B.empresa}
                onChange={e => setNewB2B(f => ({ ...f, empresa: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
              <input
                type="tel" placeholder="Teléfono" value={newB2B.telefono}
                onChange={e => setNewB2B(f => ({ ...f, telefono: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
              <input
                type="email" placeholder="Email" value={newB2B.email}
                onChange={e => setNewB2B(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
              <input
                type="text" placeholder="Dirección" value={newB2B.direccion}
                onChange={e => setNewB2B(f => ({ ...f, direccion: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
              <textarea
                placeholder="Notas" value={newB2B.notas} rows={2}
                onChange={e => setNewB2B(f => ({ ...f, notas: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold resize-none"
              />
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Estado</label>
                <select
                  value={newB2B.estado}
                  onChange={e => setNewB2B(f => ({ ...f, estado: e.target.value as B2BEstado }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold bg-white"
                >
                  {ESTADO_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddB2B(false); setNewB2B(EMPTY_B2B) }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddB2B}
                className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
