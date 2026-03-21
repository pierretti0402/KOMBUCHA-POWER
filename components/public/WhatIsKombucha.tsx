export default function WhatIsKombucha() {
  const benefits = [
    {
      icon: '🦠',
      title: 'Probióticos naturales',
      description: 'Bacterias beneficiosas que mejoran tu microbiota intestinal y refuerzan tu sistema inmune.',
    },
    {
      icon: '🌱',
      title: '100% Vegana',
      description: 'Sin ningún ingrediente de origen animal. Buena para vos y para el planeta.',
    },
    {
      icon: '🌾',
      title: 'Gluten Free',
      description: 'Libre de gluten, apta para celíacos y personas sensibles.',
    },
    {
      icon: '🌿',
      title: 'Orgánica',
      description: 'Ingredientes cultivados sin pesticidas ni químicos. Naturaleza en estado puro.',
    },
    {
      icon: '💧',
      title: 'Bajo en azúcar',
      description: 'El azúcar es consumido durante la fermentación. Mucho menos que cualquier gaseosa convencional.',
    },
    {
      icon: '⚡',
      title: 'Energía natural',
      description: 'Vitaminas del grupo B y ácidos orgánicos que te dan energía sin caída posterior.',
    },
  ]

  return (
    <section id="kombucha" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#4FC3F7] font-bold text-lg uppercase tracking-wide">La ciencia detrás</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
            ¿Qué es la kombucha? 🍵
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto font-semibold leading-relaxed">
            La kombucha es una bebida fermentada milenaria hecha con té, azúcar y un cultivo vivo llamado SCOBY.
            Durante la fermentación se generan{' '}
            <strong className="text-[#FF6B9D]">probióticos naturales</strong>,{' '}
            <strong className="text-[#FF8C42]">ácidos orgánicos</strong> y{' '}
            <strong className="text-[#4FC3F7]">vitaminas B</strong> que hacen maravillas por tu cuerpo.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-orange-50 transition-all duration-300 hover:shadow-md group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="font-black text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm font-semibold leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Fun fact banner */}
        <div
          className="rounded-3xl p-8 md:p-12 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8C42 100%)' }}
        >
          <div className="text-5xl mb-4">🌍</div>
          <h3 className="text-2xl md:text-3xl font-black mb-3">Bebida milenaria, sabor del futuro</h3>
          <p className="text-lg opacity-90 font-semibold max-w-2xl mx-auto">
            La kombucha se consume hace más de 2.000 años en Asia. Nosotros le dimos un giro argentino
            con sabores únicos y un proceso artesanal que preserva todos sus beneficios.
          </p>
        </div>
      </div>
    </section>
  )
}
