'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Save, Calculator, Tag, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PricingRow {
  key: string
  value: number
  label: string
}

const PACK_KEYS = [
  { key: 'pack_price_3',  label: 'Pack 3 unidades',  size: 3  },
  { key: 'pack_price_6',  label: 'Pack 6 unidades',  size: 6  },
  { key: 'pack_price_12', label: 'Pack 12 unidades', size: 12 },
  { key: 'pack_price_24', label: 'Pack 24 unidades', size: 24 },
]

export default function PricingPage() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cost calculator
  const [costPerUnit, setCostPerUnit] = useState(0)
  const [shippingCostPerUnit, setShippingCostPerUnit] = useState(0)

  // Pricing
  const [priceB2C, setPriceB2C] = useState(0)
  const [priceB2B, setPriceB2B] = useState(0)

  // Pack prices
  const [packPrices, setPackPrices] = useState<Record<string, number>>({
    pack_price_3: 12000,
    pack_price_6: 21000,
    pack_price_12: 40000,
    pack_price_24: 74000,
  })

  const totalCostPerUnit = costPerUnit + shippingCostPerUnit

  const fetchPricing = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('pricing').select('key, value, label')
    if (data) {
      const map: Record<string, number> = {}
      ;(data as PricingRow[]).forEach(row => { map[row.key] = row.value })
      setCostPerUnit(map['cost_per_unit'] ?? 0)
      setShippingCostPerUnit(map['shipping_cost_per_unit'] ?? 0)
      setPriceB2C(map['price_b2c'] ?? 0)
      setPriceB2B(map['price_b2b'] ?? 0)
      setPackPrices({
        pack_price_3:  map['pack_price_3']  ?? 12000,
        pack_price_6:  map['pack_price_6']  ?? 21000,
        pack_price_12: map['pack_price_12'] ?? 40000,
        pack_price_24: map['pack_price_24'] ?? 74000,
      })
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchPricing() }, [fetchPricing])

  const handleSave = async () => {
    setSaving(true)
    const rows = [
      { key: 'cost_per_unit',          value: costPerUnit,              label: 'Costo de la lata (por unidad)' },
      { key: 'shipping_cost_per_unit', value: shippingCostPerUnit,      label: 'Costo de traslado (por unidad)' },
      { key: 'price_b2c',              value: priceB2C,                 label: 'Precio B2C (precio al público)' },
      { key: 'price_b2b',              value: priceB2B,                 label: 'Precio B2B (precio mayorista)' },
      { key: 'pack_price_3',           value: packPrices.pack_price_3,  label: 'Pack 3 unidades' },
      { key: 'pack_price_6',           value: packPrices.pack_price_6,  label: 'Pack 6 unidades' },
      { key: 'pack_price_12',          value: packPrices.pack_price_12, label: 'Pack 12 unidades' },
      { key: 'pack_price_24',          value: packPrices.pack_price_24, label: 'Pack 24 unidades' },
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('pricing')
      .upsert(rows, { onConflict: 'key' })
    if (error) {
      toast.error('Error al guardar')
    } else {
      toast.success('Precios actualizados ✅')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D]" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Costos y Precios 💰</h1>
          <p className="text-gray-500 font-semibold mt-1">Los precios de pack se aplican en la tienda en tiempo real</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#FF6B9D] text-white font-bold px-5 py-3 rounded-full hover:bg-opacity-90 transition-colors shadow-md disabled:opacity-70"
        >
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar todo'}
        </button>
      </div>

      {/* Cost calculator */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <Calculator size={20} className="text-[#FF6B9D]" />
          <h2 className="text-lg font-black text-gray-900">Calculadora de costos</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Costo de la lata (por unidad)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min={0}
                value={costPerUnit}
                onChange={e => setCostPerUnit(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Costo de traslado (por unidad)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min={0}
                value={shippingCostPerUnit}
                onChange={e => setShippingCostPerUnit(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4">
            <span className="font-bold text-gray-700">Costo total por unidad</span>
            <span className="text-2xl font-black text-gray-900">{formatCurrency(totalCostPerUnit)}</span>
          </div>
        </div>
      </div>

      {/* B2C / B2B pricing */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <Tag size={20} className="text-[#FF6B9D]" />
          <h2 className="text-lg font-black text-gray-900">Precios de referencia</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Precio B2C — precio al público (por lata)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min={0}
                value={priceB2C}
                onChange={e => setPriceB2C(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
            </div>
            {costPerUnit > 0 && priceB2C > 0 && (
              <p className="text-xs font-semibold text-gray-400 mt-1">
                Margen: {Math.round(((priceB2C - totalCostPerUnit) / priceB2C) * 100)}% ({formatCurrency(priceB2C - totalCostPerUnit)} por lata)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Precio B2B — mayorista para cafés (por lata)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min={0}
                value={priceB2B}
                onChange={e => setPriceB2B(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
              />
            </div>
            {costPerUnit > 0 && priceB2B > 0 && (
              <p className="text-xs font-semibold text-gray-400 mt-1">
                Margen: {Math.round(((priceB2B - totalCostPerUnit) / priceB2B) * 100)}% ({formatCurrency(priceB2B - totalCostPerUnit)} por lata)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pack prices */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <Package size={20} className="text-[#FF6B9D]" />
          <h2 className="text-lg font-black text-gray-900">Precios de packs (tienda online)</h2>
        </div>
        <div className="space-y-4">
          {PACK_KEYS.map(({ key, label, size }) => {
            const price = packPrices[key] ?? 0
            const perUnit = size > 0 ? Math.round(price / size) : 0
            return (
              <div key={key}>
                <label className="block text-sm font-bold text-gray-600 mb-1">{label}</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={e => setPackPrices(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold"
                    />
                  </div>
                  <div className="text-right min-w-[140px]">
                    <p className="text-sm font-black text-[#FF6B9D]">{formatCurrency(price)}</p>
                    <p className="text-xs text-gray-400 font-semibold">{formatCurrency(perUnit)} / lata</p>
                    {price > 0 && (
                      <p className="text-xs text-green-600 font-semibold">
                        Efectivo: {formatCurrency(Math.round(price * 0.9))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-[#FF6B9D] text-white font-black text-lg py-4 rounded-full hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-70"
      >
        <Save size={20} />
        {saving ? 'Guardando...' : 'Guardar todos los precios'}
      </button>
    </div>
  )
}
