'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FAQ } from '@/types/database'

interface FAQSectionProps {
  faqs: FAQ[]
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#FF8C42] font-bold text-lg uppercase tracking-wide">Preguntas frecuentes</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
            ¿Dudas? Te contestamos 💬
          </h2>
          <p className="text-gray-600 text-lg font-semibold">
            Todo lo que necesitás saber sobre Power Kombucha.
          </p>
        </div>

        <div className="space-y-3">
          {sortedFaqs.map(faq => (
            <div
              key={faq.id}
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                openId === faq.id ? 'border-[#FF6B9D]/40 shadow-md' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-black text-gray-900 pr-4 text-lg">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-[#FF6B9D] transition-transform duration-300 ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-5 bg-white">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-600 font-semibold leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {sortedFaqs.length === 0 && (
          <p className="text-center text-gray-500 font-semibold">No hay preguntas disponibles.</p>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-gray-600 font-semibold mb-4">¿Tenés otra pregunta?</p>
          <a
            href={`https://wa.me/5491135170335?text=Hola!%20Tengo%20una%20consulta%20sobre%20Power%20Kombucha`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
          >
            💬 Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
