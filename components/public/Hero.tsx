'use client'

import { ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8C42 40%, #FFD93D 100%)',
      }}
    >
      {/* Decorative bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              width: `${40 + (i * 23) % 80}px`,
              height: `${40 + (i * 23) % 80}px`,
              background: 'white',
              left: `${(i * 137) % 100}%`,
              top: `${(i * 97) % 100}%`,
              animationDelay: `${(i * 0.5) % 3}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-bold animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          🌿 Vegana · Gluten Free · Orgánica · Probióticos
        </div>

        {/* Main title */}
        <h1
          className="text-6xl md:text-8xl font-black mb-4 leading-tight animate-fade-in-up"
          style={{ animationDelay: '0.2s', textShadow: '2px 4px 20px rgba(0,0,0,0.15)' }}
        >
          POWER ⚡<br />KOMBUCHA
        </h1>

        {/* Tagline */}
        <p
          className="text-2xl md:text-3xl font-bold mb-4 opacity-95 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          La gaseosa del futuro
        </p>

        <p
          className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto font-semibold animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          Fermentada con amor en Argentina 🇦🇷 · Sabores únicos que te van a volar la cabeza
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          <a
            href="#tienda"
            className="bg-white text-[#FF6B9D] font-black text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
          >
            🛒 Comprar ahora
          </a>
          <a
            href="#sabores"
            className="border-2 border-white text-white font-black text-lg px-8 py-4 rounded-full hover:bg-white hover:text-[#FF6B9D] transition-all duration-200"
          >
            Ver sabores
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <ArrowDown size={28} className="opacity-80" />
        </div>
      </div>
    </section>
  )
}
