'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, AlertTriangle, TrendingDown, TrendingUp, Edit2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product, StockMovement } from '@/types/database'

interface MovementModalProps {
  product: Product
  onClose: () => void
  onSave: () => void
}

function MovementModal({ product, onClose, onSave }: MovementModalProps) {
  const supabase = createClientComponentClient()
  const [form, setForm] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: '',
    cost: '',
    supplier: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error: movError } = await supabase.from('stock_movements').insert({
        product_id: product.id,
        type: form.type,
        quantity: parseInt(form.quantity),
        cost: form.cost ? parseFloat(form.cost) : null,
        supplier: form.supplier || null,
        notes: form.notes || null,
        date: form.date,
      })
      if (movError) throw movError

      // Update product stock
      const newStock = form.type === 'in'
        ? product.stock + parseInt(form.quantity)
        : form.type === 'out'
        ? product.stock - parseInt(form.quantity)
        : parseInt(form.quantity)

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: Math.max(0, newStock) })
        .eq('id', product.id)

      if (stockError) throw stockError

      toast.success('Movimiento registrado ✅')
      onSave()
      onClose()
    } catch (err) {
      toast.error('Error al guardar')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-black text-gray-900 mb-1">Registrar movimiento</h3>
        <p className="text-sm text-gray-500 font-semibold mb-5">{product.flavor} — {product.presentation}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de movimiento</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof f.type }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
            >
              <option value="in">📦 Entrada (compra)</option>
              <option value="out">📤 Salida (venta/merma)</option>
              <option value="adjustment">🔧 Ajuste de inventario</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad</label>
              <input type="number" min="1" required value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
              <input type="date" required value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
            </div>
          </div>
          {form.type === 'in' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Costo total ($)</label>
                <input type="number" step="0.01" value={form.cost}
                  onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Proveedor</label>
                <input type="text" value={form.supplier}
                  onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Notas</label>
            <input type="text" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Opcional"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-[#FF6B9D] text-white font-bold rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-60">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StockPage() {
  const supabase = createClientComponentClient()
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showMovements, setShowMovements] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [priceForm, setPriceForm] = useState({ cost_price: '', sale_price: '' })

  const fetchData = useCallback(async () => {
    const [prodRes, movRes] = await Promise.all([
      supabase.from('products').select('*').eq('active', true).order('flavor').order('presentation'),
      supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    setProducts(prodRes.data || [])
    setMovements(movRes.data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSavePrice = async (productId: string) => {
    const { error } = await supabase.from('products').update({
      cost_price: parseFloat(priceForm.cost_price),
      sale_price: parseFloat(priceForm.sale_price),
    }).eq('id', productId)
    if (!error) {
      toast.success('Precios actualizados ✅')
      setEditingPrice(null)
      fetchData()
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  const lowStock = products.filter(p => p.stock <= p.min_stock)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Gestión de Stock 📦</h1>
          <p className="text-gray-500 font-semibold mt-1">{products.length} productos activos</p>
        </div>
        <button
          onClick={() => setShowMovements(!showMovements)}
          className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 transition-colors shadow-md"
        >
          <Package size={16} />
          {showMovements ? 'Ver productos' : 'Historial'}
        </button>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-black text-red-700">⚠️ {lowStock.length} productos con stock bajo</p>
            <p className="text-red-600 text-sm font-semibold mt-1">
              {lowStock.map(p => `${p.flavor.split(',')[0]} (${p.presentation})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {!showMovements ? (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-black text-gray-600 rounded-l-xl">Producto</th>
                  <th className="px-4 py-3 font-black text-gray-600">Presentación</th>
                  <th className="px-4 py-3 font-black text-gray-600">Stock</th>
                  <th className="px-4 py-3 font-black text-gray-600">Mínimo</th>
                  <th className="px-4 py-3 font-black text-gray-600">Costo</th>
                  <th className="px-4 py-3 font-black text-gray-600">Precio venta</th>
                  <th className="px-4 py-3 font-black text-gray-600">Margen</th>
                  <th className="px-4 py-3 font-black text-gray-600 rounded-r-xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.stock <= p.min_stock
                  const margin = p.sale_price > 0 ? Math.round(((p.sale_price - p.cost_price) / p.sale_price) * 100) : 0
                  return (
                    <tr key={p.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${isLow ? 'bg-red-50/50' : ''}`}>
                      <td className="px-4 py-3 font-black text-gray-900">{p.flavor}</td>
                      <td className="px-4 py-3 font-semibold text-gray-600">{p.presentation}</td>
                      <td className="px-4 py-3">
                        <span className={`font-black text-lg ${p.stock === 0 ? 'text-red-500' : isLow ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {p.stock}
                        </span>
                        {isLow && <AlertTriangle size={14} className="inline ml-1 text-red-500" />}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-500">{p.min_stock}</td>
                      <td className="px-4 py-3">
                        {editingPrice === p.id ? (
                          <input type="number" value={priceForm.cost_price}
                            onChange={e => setPriceForm(f => ({ ...f, cost_price: e.target.value }))}
                            className="w-24 px-2 py-1 rounded-lg border-2 border-[#FF6B9D] outline-none text-sm font-semibold"
                          />
                        ) : (
                          <span className="font-semibold text-gray-600">{formatCurrency(p.cost_price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingPrice === p.id ? (
                          <input type="number" value={priceForm.sale_price}
                            onChange={e => setPriceForm(f => ({ ...f, sale_price: e.target.value }))}
                            className="w-24 px-2 py-1 rounded-lg border-2 border-[#FF6B9D] outline-none text-sm font-semibold"
                          />
                        ) : (
                          <span className="font-black text-[#FF6B9D]">{formatCurrency(p.sale_price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-black text-sm px-2 py-1 rounded-full ${margin >= 50 ? 'bg-green-100 text-green-700' : margin >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {editingPrice === p.id ? (
                            <>
                              <button onClick={() => handleSavePrice(p.id)}
                                className="bg-green-100 text-green-700 font-bold text-xs px-3 py-1.5 rounded-full hover:bg-green-200">
                                Guardar
                              </button>
                              <button onClick={() => setEditingPrice(null)}
                                className="bg-gray-100 text-gray-600 font-bold text-xs px-3 py-1.5 rounded-full hover:bg-gray-200">
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingPrice(p.id); setPriceForm({ cost_price: String(p.cost_price), sale_price: String(p.sale_price) }) }}
                                className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Editar precios"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setSelectedProduct(p)}
                                className="bg-[#FF6B9D]/10 text-[#FF6B9D] font-bold text-xs px-3 py-1.5 rounded-full hover:bg-[#FF6B9D]/20 transition-colors"
                              >
                                + Movimiento
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <h3 className="font-black text-gray-900 text-lg mb-5">Historial de movimientos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-black text-gray-600">Fecha</th>
                  <th className="px-4 py-3 font-black text-gray-600">Producto</th>
                  <th className="px-4 py-3 font-black text-gray-600">Tipo</th>
                  <th className="px-4 py-3 font-black text-gray-600">Cantidad</th>
                  <th className="px-4 py-3 font-black text-gray-600">Costo</th>
                  <th className="px-4 py-3 font-black text-gray-600">Proveedor</th>
                  <th className="px-4 py-3 font-black text-gray-600">Notas</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(m => {
                  const prod = products.find(p => p.id === m.product_id)
                  return (
                    <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-500">{new Date(m.date).toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{prod ? `${prod.flavor.split(',')[0]} - ${prod.presentation}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full w-fit ${
                          m.type === 'in' ? 'bg-green-100 text-green-700' :
                          m.type === 'out' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {m.type === 'in' ? <TrendingUp size={12} /> : m.type === 'out' ? <TrendingDown size={12} /> : null}
                          {m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Salida' : 'Ajuste'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-black text-gray-900">{m.quantity}</td>
                      <td className="px-4 py-3 font-semibold text-gray-600">{m.cost ? formatCurrency(m.cost) : '—'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-600">{m.supplier || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-500">{m.notes || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedProduct && (
        <MovementModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={fetchData}
        />
      )}
    </div>
  )
}
