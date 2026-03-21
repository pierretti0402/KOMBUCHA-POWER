'use client'

import { useState } from 'react'
import { Instagram, MessageCircle, Mail, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface ContactProps {
  email: string
  instagram: string
}

export default function Contact({ email, instagram }: ContactProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Por favor completá todos los campos')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('¡Mensaje enviado! Te respondemos pronto 💪')
        setForm({ name: '', email: '', message: '' })
      } else {
        toast.error('Error al enviar. Probá por WhatsApp.')
      }
    } catch {
      toast.error('Error al enviar. Probá por WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contacto" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#FF6B9D] font-bold text-lg uppercase tracking-wide">Contacto</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
            ¡Hablemos! 👋
          </h2>
          <p className="text-gray-600 text-lg font-semibold max-w-xl mx-auto">
            Tenés preguntas, querés hacer un pedido mayorista, o simplemente querés saludar. Escribinos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-5">Encontranos en</h3>

              <div className="space-y-4">
                <a
                  href={`https://wa.me/5491176315706?text=Hola%20Power%20Kombucha!%20🍹`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-100 rounded-2xl hover:border-green-300 transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                    <MessageCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900">WhatsApp</p>
                    <p className="text-gray-600 text-sm font-semibold">+54 9 11 7631-5706</p>
                  </div>
                </a>

                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-pink-50 border-2 border-pink-100 rounded-2xl hover:border-pink-300 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B9D] to-[#FF8C42] rounded-xl flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                    <Instagram size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900">Instagram</p>
                    <p className="text-gray-600 text-sm font-semibold">@powerkombucha</p>
                  </div>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl hover:border-blue-300 transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#4FC3F7] rounded-xl flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900">Email</p>
                    <p className="text-gray-600 text-sm font-semibold">{email}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-black text-gray-900 mb-6">Envianos un mensaje</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tu nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: María López"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tu email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="maria@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tu mensaje</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="¿En qué te podemos ayudar?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold resize-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B9D] text-white font-black py-4 rounded-full hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-60"
              >
                <Send size={18} />
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
