import { Instagram, MessageCircle, Mail } from 'lucide-react'

interface FooterProps {
  instagram: string
  email: string
}

export default function Footer({ instagram, email }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-black bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42] bg-clip-text text-transparent">
                POWER ⚡
              </span>
              <span className="text-3xl font-black text-white">KOMBUCHA</span>
            </div>
            <p className="text-gray-400 font-semibold mb-4">
              La gaseosa del futuro.
            </p>
            <div className="flex gap-4">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[#FF6B9D] rounded-xl flex items-center justify-center transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/5491176315706"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href={`mailto:${email}`}
                className="w-10 h-10 bg-white/10 hover:bg-[#4FC3F7] rounded-xl flex items-center justify-center transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-black text-lg mb-4">Navegación</h4>
            <ul className="space-y-2">
              {[
                { href: '#sabores', label: 'Nuestros sabores' },
                { href: '#tienda', label: 'Tienda online' },
                { href: '#kombucha', label: '¿Qué es la kombucha?' },
                { href: '#donde', label: 'Dónde encontrarnos' },
                { href: '#nosotros', label: 'Quiénes somos' },
                { href: '#faq', label: 'Preguntas frecuentes' },
                { href: '#contacto', label: 'Contacto' },
              ].map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white font-semibold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-black text-lg mb-4">Nuestros sabores</h4>
            <ul className="space-y-2">
              <li className="text-gray-400 font-semibold">🍊 Naranja, Frutilla y Guaraná</li>
              <li className="text-gray-400 font-semibold">🌸 Pomelo Rosado y Jengibre</li>
              <li className="text-gray-400 font-semibold">🍏 Manzana Verde, Guaraná y Cayena</li>
            </ul>

            <div className="mt-6">
              <h4 className="font-black text-lg mb-3">Atributos</h4>
              <div className="flex flex-wrap gap-2">
                {['🌿 Vegana', '🌾 Gluten Free', '✅ Orgánica', '🦠 Probióticos'].map(attr => (
                  <span key={attr} className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-semibold">
            © {currentYear} Power Kombucha. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-sm font-semibold">
            Power Kombucha Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}
