'use client'

import { ArrowDown } from 'lucide-react'
import PowerLogo from '@/components/ui/PowerLogo'

const HERO_IMAGE =
  'https://tbhlhhdbnuvggwywxzzw.supabase.co/storage/v1/object/public/FOTOS%20POWERKOMBUCHA/PHOTO-2023-09-18-20-46-30%202.jpeg'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('${HERO_IMAGE}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Subtle floating bubbles (keep the energy) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-float"
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
        {/* Brand logo */}
        <div
          className="flex justify-center mb-8 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <PowerLogo size="lg" circleColor="rgba(179,229,252,0.92)" />
        </div>

        {/* Tagline */}
        <p
          className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up"
          style={{
            animationDelay: '0.25s',
            fontFamily: "'Fredoka One', cursive",
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          La gaseosa del futuro
        </p>

        {/* Attributes badge */}
        <div
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8 text-sm font-bold animate-fade-in"
          style={{ animationDelay: '0.35s' }}
        >
          🌿 Vegana · Gluten Free · Orgánica · Probióticos
        </div>

        <p
          className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto font-semibold animate-fade-in-up"
          style={{ animationDelay: '0.4s', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
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
            className="bg-[#FF6B9D] text-white font-black text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
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
          <ArrowDown size={28} className="opacity-70" />
        </div>
      </div>
    </section>
  )
}
