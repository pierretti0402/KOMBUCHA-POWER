'use client'

import { useCart } from '@/context/CartContext'
import { Product } from '@/types/database'
import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const FLAVORS = [
  {
    flavor: 'Naranja, Frutilla y Jengibre',
    emoji: '🍊🍓',
    description: 'Refrescante, energizante y digestivo. El toque de jengibre le da ese punch que te despierta.',
    tags: ['Energizante', 'Refrescante', 'Digestivo'],
    gradient: 'from-orange-400 to-yellow-400',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    tagColor: 'bg-orange-100 text-orange-700',
    canColor: '🟠',
  },
  {
    flavor: 'Pomelo Rosado y Jengibre',
    emoji: '🍋‍🟩🌸',
    description: 'Cítrico, intenso y con un final picante. El favorito de los que se animan a más.',
    tags: ['Cítrico', 'Intenso', 'Probióticos'],
    gradient: 'from-pink-400 to-red-400',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    tagColor: 'bg-pink-100 text-pink-700',
    canColor: '🟣',
  },
  {
    flavor: 'Manzana, Menta y Limón',
    emoji: '🍎🌿',
    description: 'Fresco, suave y equilibrado. La opción perfecta para todos los días y para toda la familia.',
    tags: ['Fresco', 'Suave', 'Para todos'],
    gradient: 'from-teal-400 to-blue-400',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    tagColor: 'bg-teal-100 text-teal-700',
    canColor: '🔵',
  },
]

interface FlavorsProps {
  products: Product[]
}

export default function Flavors({ products }: FlavorsProps) {
  const { addItem } = useCart()

  const handleAddFlavor = (flavorName: string) => {
    const product = products.find(
      p => p.flavor === flavorName && p.presentation === 'Lata individual'
    )
    if (product) {
      addItem(product, 1)
      toast.success(`¡${product.flavor.split(',')[0]} agregado al carrito! 🎉`)
    }
  }

  return (
    <section id="sabores" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#FF6B9D] font-bold text-lg uppercase tracking-wide">Nuestros sabores</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
            ¿Cuál es el tuyo? 🤤
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-semibold">
            Tres sabores únicos, fermentados artesanalmente con ingredientes orgánicos seleccionados.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {FLAVORS.map((flavor, idx) => (
            <div
              key={idx}
              className={`${flavor.bgColor} border-2 ${flavor.borderColor} rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col`}
            >
              {/* Can illustration */}
              <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${flavor.gradient} flex items-center justify-center mb-6 shadow-inner`}>
                <div className="text-center">
                  <div className="text-7xl mb-2">{flavor.emoji}</div>
                  <div className="bg-white/30 backdrop-blur-sm rounded-xl px-3 py-1">
                    <span className="text-white font-black text-sm">POWER ⚡</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-black text-gray-900 mb-3">{flavor.flavor}</h3>
              <p className="text-gray-600 font-semibold mb-4 flex-1">{flavor.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {flavor.tags.map(tag => (
                  <span key={tag} className={`${flavor.tagColor} text-xs font-bold px-3 py-1 rounded-full`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddFlavor(flavor.flavor)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Agregar
                </button>
                <a
                  href="#tienda"
                  className="flex-1 text-center bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-full hover:border-gray-400 transition-colors"
                >
                  Ver packs
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
