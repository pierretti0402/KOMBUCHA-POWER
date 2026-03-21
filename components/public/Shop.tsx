'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { Product } from '@/types/database'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const FLAVOR_CONFIGS: Record<string, { gradient: string; emoji: string }> = {
  'Naranja, Frutilla y Jengibre': { gradient: 'from-orange-400 to-yellow-400', emoji: '🍊🍓' },
  'Pomelo Rosado y Jengibre': { gradient: 'from-pink-400 to-red-400', emoji: '🍋‍🟩🌸' },
  'Manzana, Menta y Limón': { gradient: 'from-teal-400 to-blue-400', emoji: '🍎🌿' },
}

const PRESENTATION_ORDER = ['Lata individual', 'Pack x3', 'Pack x6', 'Pack x12', 'Pack x24']

interface ShopProps {
  products: Product[]
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const config = FLAVOR_CONFIGS[product.flavor] || { gradient: 'from-gray-400 to-gray-600', emoji: '🍵' }

  const handleAdd = () => {
    addItem(product, quantity)
    toast.success(`¡Agregado al carrito! 🛒`, {
      icon: '⚡',
      style: { background: '#FF6B9D', color: 'white' },
    })
    setQuantity(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Product image area */}
      <div className={`h-44 bg-gradient-to-br ${config.gradient} flex items-center justify-center relative`}>
        <div className="text-center">
          <div className="text-5xl mb-1">{config.emoji}</div>
          <div className="bg-white/30 backdrop-blur-sm rounded-lg px-2 py-0.5">
            <span className="text-white font-black text-xs">POWER ⚡</span>
          </div>
        </div>
        {product.stock <= product.min_stock && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
            ¡Últimas unidades!
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-black px-4 py-2 rounded-full">Sin stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{product.presentation}</p>
          <h3 className="font-black text-gray-900 text-sm leading-snug mb-2">{product.flavor}</h3>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-black text-[#FF6B9D] mb-3">{formatCurrency(product.sale_price)}</p>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-[#FF6B9D] text-white font-bold py-2.5 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ShoppingCart size={16} />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Shop({ products }: ShopProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const flavors = ['all', ...Array.from(new Set(products.map(p => p.flavor)))]

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.flavor === activeFilter)

  const sortedProducts = [...filteredProducts].sort((a, b) =>
    PRESENTATION_ORDER.indexOf(a.presentation) - PRESENTATION_ORDER.indexOf(b.presentation)
  )

  return (
    <section id="tienda" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#FF8C42] font-bold text-lg uppercase tracking-wide">Tienda online</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
            Tu Power, a domicilio 🚀
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-semibold">
            Elegí tu sabor y presentación favorita. El pedido va directo a nuestro WhatsApp.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {flavors.map(flavor => (
            <button
              key={flavor}
              onClick={() => setActiveFilter(flavor)}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                activeFilter === flavor
                  ? 'bg-[#FF6B9D] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {flavor === 'all' ? '🛒 Todos' : flavor}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">🍵</div>
            <p className="font-bold text-lg">Productos cargando...</p>
          </div>
        )}
      </div>
    </section>
  )
}
