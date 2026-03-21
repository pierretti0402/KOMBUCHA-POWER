'use client'

import { useState } from 'react'
import { ShoppingCart, Menu, X, Instagram } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, setIsOpen } = useCart()

  const links = [
    { href: '#sabores', label: 'Sabores' },
    { href: '#tienda', label: 'Tienda' },
    { href: '#kombucha', label: 'Beneficios' },
    { href: '#donde', label: 'Dónde encontrarnos' },
    { href: '#nosotros', label: 'Nosotros' },
    { href: '#contacto', label: 'Contacto' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42] bg-clip-text text-transparent">
              POWER ⚡
            </span>
            <span className="text-2xl font-black text-gray-800">KOMBUCHA</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[#FF6B9D] font-semibold text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/powerkombucha"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#FF6B9D] transition-colors hidden sm:block"
            >
              <Instagram size={20} />
            </a>
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 bg-[#FF6B9D] text-white rounded-full hover:bg-opacity-90 transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF8C42] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-gray-700 font-semibold hover:text-[#FF6B9D] border-b border-gray-50 last:border-0"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
