'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, Plus, Edit2, X, Save, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Customer } from '@/types/database'

const CUSTOMER_TAGS = ['Frecuente', 'Potencial', 'Inactivo', 'Mayorista', 'VIP']

export default function CustomersPage() {
  const supabase = createClientComponentClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Customer>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '', notes: '', tags: [] as string[] })

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
    setCustomers(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase.from('customers').update(editForm).eq('id', id)
    if (!error) {
      toast.success('Cliente actualizado ✅')
      setEditingId(null)
      fetchCustomers()
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name) { toast.error('El nombre es obligatorio'); return }
    const { error } = await supabase.from('customers').insert({
      ...newCustomer,
      total_spent: 0,
      order_count: 0,
    })
    if (!error) {
      toast.success('Cliente agregado ✅')
      setShowAddModal(false)
      setNewCustomer({ name: '', phone: '', email: '', address: '', notes: '', tags: [] })
      fetchCustomers()
    }
  }

  const deleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`¿Eliminar a ${customerName} permanentemente? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('customers').delete().eq('id', customerId)
    if (!error) {
      toast.success('Cliente eliminado ✅')
      setCustomers(prev => prev.filter(c => c.id !== customerId))
    } else {
      toast.error('Error al eliminar')
    }
  }

  const toggleTag = (tag: string, tags: string[], setFn: (t: string[]) => void) => {
    setFn(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])
  }

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  )

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'Frecuente': 'bg-green-100 text-green-700',
      'Potencial': 'bg-blue-100 text-blue-700',
      'Inactivo': 'bg-gray-100 text-gray-600',
      'Mayorista': 'bg-purple-100 text-purple-700',
      'VIP': 'bg-yellow-100 text-yellow-700',
    }
    return colors[tag] || 'bg-gray-100 text-gray-600'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Clientes 👥</h1>
          <p className="text-gray-500 font-semibold mt-1">{customers.length} clientes registrados</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
        />
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-black text-gray-600">Cliente</th>
                <th className="px-4 py-3 font-black text-gray-600">Contacto</th>
                <th className="px-4 py-3 font-black text-gray-600">Pedidos</th>
                <th className="px-4 py-3 font-black text-gray-600">Total gastado</th>
                <th className="px-4 py-3 font-black text-gray-600">Etiquetas</th>
                <th className="px-4 py-3 font-black text-gray-600">Desde</th>
                <th className="px-4 py-3 font-black text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(customer => (
                <tr key={customer.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {editingId === customer.id ? (
                      <input value={editForm.name || ''}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-2 py-1 rounded-lg border-2 border-[#FF6B9D] outline-none text-sm font-semibold"
                      />
                    ) : (
                      <div>
                        <p className="font-black text-gray-900">{customer.name}</p>
                        {customer.address && <p className="text-xs text-gray-400 font-semibold">{customer.address}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === customer.id ? (
                      <div className="space-y-1">
                        <input value={editForm.phone || ''}
                          onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="Teléfono"
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 outline-none text-xs font-semibold"
                        />
                        <input value={editForm.email || ''}
                          onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="Email"
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 outline-none text-xs font-semibold"
                        />
                      </div>
                    ) : (
                      <div>
                        {customer.phone && <p className="font-semibold text-gray-700">{customer.phone}</p>}
                        {customer.email && <p className="text-xs text-gray-400 font-semibold">{customer.email}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-black text-gray-900">{customer.order_count}</td>
                  <td className="px-4 py-3 font-black text-[#FF6B9D]">{formatCurrency(customer.total_spent)}</td>
                  <td className="px-4 py-3">
                    {editingId === customer.id ? (
                      <div className="flex flex-wrap gap-1">
                        {CUSTOMER_TAGS.map(tag => (
                          <button key={tag}
                            onClick={() => toggleTag(tag, editForm.tags || [], (t) => setEditForm(f => ({ ...f, tags: t })))}
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${
                              (editForm.tags || []).includes(tag) ? getTagColor(tag) + ' border-current' : 'bg-white text-gray-400 border-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(customer.tags || []).map(tag => (
                          <span key={tag} className={`text-xs font-bold px-2 py-0.5 rounded-full ${getTagColor(tag)}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-500">{formatDate(customer.created_at)}</td>
                  <td className="px-4 py-3">
                    {editingId === customer.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleSaveEdit(customer.id)}
                          className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingId(customer.id); setEditForm(customer) }}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id, customer.name)}
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
          {filtered.length === 0 && (
            <p className="text-center py-10 text-gray-400 font-bold">No hay clientes que coincidan</p>
          )}
        </div>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900">Nuevo cliente</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Nombre *" value={newCustomer.name}
                onChange={e => setNewCustomer(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
              <input type="tel" placeholder="Teléfono" value={newCustomer.phone}
                onChange={e => setNewCustomer(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
              <input type="email" placeholder="Email" value={newCustomer.email}
                onChange={e => setNewCustomer(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
              <input type="text" placeholder="Dirección" value={newCustomer.address}
                onChange={e => setNewCustomer(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold" />
              <textarea placeholder="Notas" value={newCustomer.notes}
                onChange={e => setNewCustomer(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold resize-none" />
              <div>
                <p className="text-sm font-bold text-gray-600 mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {CUSTOMER_TAGS.map(tag => (
                    <button key={tag}
                      onClick={() => toggleTag(tag, newCustomer.tags, (t) => setNewCustomer(f => ({ ...f, tags: t })))}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        newCustomer.tags.includes(tag)
                          ? 'bg-[#FF6B9D] text-white border-[#FF6B9D]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={handleAddCustomer}
                className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
