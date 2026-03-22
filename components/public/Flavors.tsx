'use client'

import Image from 'next/image'
import { Product } from '@/types/database'

export const FLAVOR_META: Record<string, {
  emoji: string
  description: string
  tags: string[]
  gradient: string
  bgColor: string
  borderColor: string
  tagColor: string
}> = {
  'Pomelo Rosado y Jengibre': {
    emoji: '🌸',
    description: 'Cítrico, fresco y con un toque picante de jengibre. Refrescante de punta a punta.',
    tags: ['Cítrico', 'Refrescante', 'Probióticos'],
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    tagColor: 'bg-pink-100 text-pink-700',
  },
  'Naranja, Frutilla y Guaraná': {
    emoji: '🍊',
    description: 'Tropical y energizante. La combinación de naranja y frutilla con el poder del guaraná.',
    tags: ['Energizante', 'Tropical', 'Con Guaraná'],
    gradient: 'from-orange-400 to-yellow-400',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  'Manzana Verde, Guaraná y Cayena': {
    emoji: '🍏',
    description: 'Suave y atrevido a la vez. La manzana verde con el calor de la cayena te va a sorprender.',
    tags: ['Especiado', 'Único', 'Con Guaraná'],
    gradient: 'from-green-400 to-teal-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    tagColor: 'bg-green-100 text-green-700',
  },
}

interface FlavorsProps {
  products: Product[]
}

export default function Flavors({ products }: FlavorsProps) {
  // Match each flavor meta to its product (for image_url)
  const flavors = Object.entries(FLAVOR_META).map(([name, meta]) => ({
    name,
    ...meta,
    imageUrl: products.find(p => p.flavor === name)?.image_url ?? null,
  }))

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
          {flavors.map((flavor) => (
            <div
              key={flavor.name}
              className={`${flavor.bgColor} border-2 ${flavor.borderColor} rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col`}
            >
              {/* Product image */}
              <div className={`relative w-full h-56 bg-gradient-to-br ${flavor.gradient}`}>
                {flavor.imageUrl ? (
                  <Image
                    src={flavor.imageUrl}
                    alt={flavor.name}
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-2">{flavor.emoji}</div>
                      <div className="bg-white/30 backdrop-blur-sm rounded-xl px-3 py-1">
                        <span className="text-white font-black text-sm">POWER ⚡</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-7 flex flex-col flex-1">
                <h3 className="text-xl font-black text-gray-900 mb-3">{flavor.name}</h3>
                <p className="text-gray-600 font-semibold mb-4 flex-1">{flavor.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {flavor.tags.map(tag => (
                    <span key={tag} className={`${flavor.tagColor} text-xs font-bold px-3 py-1 rounded-full`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href="#tienda"
                  className="w-full text-center bg-gray-900 text-white font-bold py-3 rounded-full hover:bg-gray-700 transition-colors"
                >
                  Ver packs →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
