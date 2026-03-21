import { MapPin, Clock, Truck } from 'lucide-react'
import { PickupPoint } from '@/types/database'

interface WhereToFindProps {
  pickupPoints: PickupPoint[]
  deliveryText: string
}

export default function WhereToFind({ pickupPoints, deliveryText }: WhereToFindProps) {
  return (
    <section id="donde" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#4CAF82] font-bold text-lg uppercase tracking-wide">Dónde encontrarnos</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
            Tu Power, cerca tuyo 📍
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-semibold">
            Retirá en nuestros puntos de pick up o pedí el envío a domicilio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Delivery */}
          <div className="bg-gradient-to-br from-[#FF6B9D]/10 to-[#FF8C42]/10 rounded-3xl p-8 border-2 border-[#FF6B9D]/20">
            <div className="w-14 h-14 bg-[#FF6B9D] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
              <Truck size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Envío a domicilio</h3>
            <p className="text-gray-600 font-semibold leading-relaxed mb-4">{deliveryText}</p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491176315706'}?text=Hola!%20Quiero%20consultar%20sobre%20env%C3%ADo%20a%20domicilio`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-5 py-3 rounded-full hover:bg-green-600 transition-colors"
            >
              <span>💬</span> Consultar por WhatsApp
            </a>
          </div>

          {/* Pick Up */}
          <div className="bg-gradient-to-br from-[#4FC3F7]/10 to-[#4CAF82]/10 rounded-3xl p-8 border-2 border-[#4FC3F7]/20">
            <div className="w-14 h-14 bg-[#4FC3F7] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
              <MapPin size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Pick Up</h3>
            <p className="text-gray-600 font-semibold mb-5">
              Retirá sin costo adicional en nuestros puntos de pick up.
            </p>

            {pickupPoints.length > 0 ? (
              <div className="space-y-4">
                {pickupPoints.map(point => (
                  <div key={point.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-[#4FC3F7] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-black text-gray-900">{point.name}</p>
                        <p className="text-gray-600 text-sm font-semibold">{point.address}</p>
                        {point.schedule && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={12} className="text-gray-400" />
                            <p className="text-gray-500 text-xs font-semibold">{point.schedule}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-semibold">Consultá por WhatsApp para coordinar.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
