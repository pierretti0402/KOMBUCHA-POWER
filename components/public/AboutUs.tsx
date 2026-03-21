interface AboutUsProps {
  title: string
  text: string
}

export default function AboutUs({ title, text }: AboutUsProps) {
  const paragraphs = text.split('\n\n').filter(Boolean)

  return (
    <section id="nosotros" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image/illustration side */}
          <div className="order-2 md:order-1">
            <div className="relative">
              <div
                className="w-full aspect-square rounded-3xl flex items-center justify-center text-center p-10"
                style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8C42 50%, #FFD93D 100%)' }}
              >
                <div>
                  <div className="text-8xl mb-4">🍹</div>
                  <p className="text-white font-black text-2xl">Hecho con ❤️</p>
                  <p className="text-white/90 font-bold text-lg mt-1">en Argentina 🇦🇷</p>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 rotate-6">
                <span className="text-2xl">🌿</span>
                <p className="text-xs font-black text-gray-800 mt-1">100% Orgánico</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 -rotate-6">
                <span className="text-2xl">⚡</span>
                <p className="text-xs font-black text-gray-800 mt-1">Artesanal</p>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="order-1 md:order-2">
            <span className="text-[#FF6B9D] font-bold text-lg uppercase tracking-wide">Quiénes somos</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-6">{title}</h2>
            <div className="space-y-4">
              {paragraphs.map((paragraph, idx) => (
                <p key={idx} className="text-gray-600 font-semibold text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { icon: '🌿', label: 'Orgánica' },
                { icon: '🐮', label: 'Vegana' },
                { icon: '🌾', label: 'Gluten Free' },
                { icon: '🦠', label: 'Con Probióticos' },
              ].map(value => (
                <div key={value.label} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <span className="text-2xl">{value.icon}</span>
                  <span className="font-black text-gray-800 text-sm">{value.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
