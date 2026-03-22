'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Plus, Minus, X, Check } from 'lucide-react'
import { Product } from '@/types/database'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib/utils'
import { FLAVOR_META } from '@/components/public/Flavors'
import toast from 'react-hot-toast'

// ─── Pack definitions ──────────────────────────────────────────────────────────
export const PACKS = [
  { size: 3,  label: 'Pack x3',  price: 12000, popular: false },
  { size: 6,  label: 'Pack x6',  price: 20000, popular: true  },
  { size: 12, label: 'Pack x12', price: 36000, popular: false },
  { size: 24, label: 'Pack x24', price: 65000, popular: false },
] as const

// ─── Flavor Mix Modal ──────────────────────────────────────────────────────────
interface FlavorModalProps {
  pack: typeof PACKS[number]
  products: Product[]
  onClose: () => void
}

function FlavorModal({ pack, products, onClose }: FlavorModalProps) {
  const { addPack, setIsOpen } = useCart()

  // Initialize with equal distribution across flavors
  const flavorNames = Object.keys(FLAVOR_META)
  const initial: Record<string, number> = {}
  flavorNames.forEach((f, i) => {
    initial[f] = i === 0 ? pack.size : 0
  })
  const [counts, setCounts] = useState<Record<string, number>>(initial)

  const selected = Object.values(counts).reduce((a, b) => a + b, 0)
  const remaining = pack.size - selected
  const isFull = remaining === 0

  const adjust = (flavor: string, delta: number) => {
    setCounts(prev => {
      const next = prev[flavor] + delta
      if (next < 0) return prev
      if (delta > 0 && remaining <= 0) return prev
      return { ...prev, [flavor]: next }
    })
  }

  const handleAdd = () => {
    if (!isFull) {
      toast.error(`Faltan ${remaining} unidades por elegir`)
      return
    }
    const flavors = flavorNames
      .filter(f => counts[f] > 0)
      .map(f => ({
        flavorName: f,
        imageUrl: products.find(p => p.flavor === f)?.image_url ?? null,
        count: counts[f],
      }))

    addPack({
      packSize: pack.size,
      packLabel: pack.label,
      price: pack.price,
      quantity: 1,
      flavors,
    })
    toast.success(`¡${pack.label} agregado! 🎉`, {
      style: { background: '#FF6B9D', color: 'white' },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42]">
          <div>
            <p className="text-white/80 text-sm font-bold">Personalizá tu</p>
            <h3 className="text-white text-2xl font-black">{pack.label}</h3>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-80 transition-opacity">
            <X size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-600">
              {selected} de {pack.size} unidades elegidas
            </span>
            {isFull && (
              <span className="flex items-center gap-1 text-sm font-black text-green-600">
                <Check size={14} /> ¡Listo!
              </span>
            )}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(selected / pack.size) * 100}%`,
                background: isFull
                  ? 'linear-gradient(90deg, #4CAF82, #4FC3F7)'
                  : 'linear-gradient(90deg, #FF6B9D, #FF8C42)',
              }}
            />
          </div>
        </div>

        {/* Flavor pickers */}
        <div className="p-5 space-y-3">
          {flavorNames.map(flavorName => {
            const meta = FLAVOR_META[flavorName]
            const imageUrl = products.find(p => p.flavor === flavorName)?.image_url ?? null
            const count = counts[flavorName]
            const canAdd = remaining > 0

            return (
              <div
                key={flavorName}
                className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-colors ${
                  count > 0 ? 'border-[#FF6B9D]/40 bg-pink-50' : 'border-gray-100 bg-white'
                }`}
              >
                {/* Image / emoji */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${meta.gradient} flex-shrink-0 overflow-hidden`}>
                  {imageUrl ? (
                    <Image src={imageUrl} alt={flavorName} fill className="object-cover" unoptimized />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">
                      {meta.emoji}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm leading-tight">{flavorName}</p>
                  {count > 0 && (
                    <p className="text-xs text-[#FF6B9D] font-bold mt-0.5">{count} unidad{count !== 1 ? 'es' : ''}</p>
                  )}
                </div>

                {/* Counter */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => adjust(flavorName, -1)}
                    disabled={count === 0}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#FF6B9D] hover:text-[#FF6B9D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-black text-gray-900">{count}</span>
                  <button
                    onClick={() => adjust(flavorName, 1)}
                    disabled={!canAdd}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#FF6B9D] hover:text-[#FF6B9D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 space-y-3">
          <button
            onClick={handleAdd}
            className={`w-full flex items-center justify-center gap-3 font-black text-lg py-4 rounded-full shadow-lg transition-all ${
              isFull
                ? 'bg-[#FF6B9D] text-white hover:bg-opacity-90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={20} />
            Agregar {pack.label} — {formatCurrency(pack.price)}
          </button>
          <p className="text-center text-xs text-green-600 font-bold">
            💵 10% OFF pagando en efectivo → {formatCurrency(pack.price * 0.9)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Shop component ───────────────────────────────────────────────────────
interface ShopProps {
  products: Product[]
}

export default function Shop({ products }: ShopProps) {
  const [selectedPack, setSelectedPack] = useState<typeof PACKS[number] | null>(null)

  return (
    <section id="tienda" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-[#FF8C42] font-bold text-lg uppercase tracking-wide">Tienda online</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
            Tu Power, a domicilio 🚀
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-semibold">
            Elegí tu pack y armá tu combinación de sabores. Pedido directo a WhatsApp.
          </p>
        </div>

        {/* Cash discount banner */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 bg-green-50 border-2 border-green-200 rounded-2xl px-5 py-3">
            <span className="text-2xl">💵</span>
            <p className="font-black text-green-800 text-base">
              10% OFF pagando en efectivo
            </p>
          </div>
        </div>

        {/* Pack cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {PACKS.map(pack => {
            const pricePerUnit = Math.round(pack.price / pack.size)
            const cashPrice = Math.round(pack.price * 0.9)

            return (
              <div
                key={pack.size}
                className={`relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer ${
                  pack.popular ? 'ring-2 ring-[#FF6B9D]' : ''
                }`}
                onClick={() => setSelectedPack(pack)}
              >
                {pack.popular && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#FF6B9D] text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap z-10">
                    ⭐ Más elegido
                  </div>
                )}

                {/* Visual header */}
                <div
                  className="h-36 flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D22 0%, #FF8C4222 100%)' }}
                >
                  {/* Stacked product images or emoji cluster */}
                  <div className="flex gap-1 justify-center">
                    {Object.entries(FLAVOR_META).map(([name, meta]) => {
                      const imgUrl = products.find(p => p.flavor === name)?.image_url
                      return imgUrl ? (
                        <div key={name} className="relative w-12 h-20">
                          <Image src={imgUrl} alt={name} fill className="object-contain" unoptimized />
                        </div>
                      ) : (
                        <span key={name} className="text-3xl">{meta.emoji}</span>
                      )
                    })}
                  </div>
                  <div className="absolute bottom-2 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 font-black text-xs px-2 py-1 rounded-full">
                      {pack.size} latas
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{pack.label}</h3>
                  <p className="text-xs text-gray-400 font-bold mb-3">${pricePerUnit.toLocaleString('es-AR')} por lata</p>

                  <div className="mt-auto space-y-1">
                    <p className="text-2xl font-black text-[#FF6B9D]">{formatCurrency(pack.price)}</p>
                    <p className="text-xs font-black text-green-600">
                      💵 Efectivo: {formatCurrency(cashPrice)}
                    </p>
                  </div>

                  <button className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-full hover:bg-gray-700 transition-colors text-sm">
                    <ShoppingCart size={15} />
                    Elegir sabores
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mix info */}
        <p className="text-center text-gray-500 font-semibold text-sm mt-8">
          🎨 Podés combinar los 3 sabores en un mismo pack como quieras
        </p>
      </div>

      {/* Modal */}
      {selectedPack && (
        <FlavorModal
          pack={selectedPack}
          products={products}
          onClose={() => setSelectedPack(null)}
        />
      )}
    </section>
  )
}
