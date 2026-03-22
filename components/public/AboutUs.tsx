interface AboutUsProps {
  title: string
  text: string
}

export default function AboutUs({ title, text }: AboutUsProps) {
  const paragraphs = text.split('\n\n').filter(Boolean)

  return (
    <section id="nosotros" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div>
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
