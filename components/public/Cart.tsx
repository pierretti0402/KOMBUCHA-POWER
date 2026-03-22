'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ShoppingCart, Plus, Minus, Trash2, MessageCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib/utils'
import { FLAVOR_META } from '@/components/public/Flavors'

export default function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, itemCount } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer')

  if (!isOpen) return null

  const cashTotal = Math.round(total * 0.9)

  const handleWhatsApp = () => {
    if (!customerName.trim()) {
      alert('Por favor ingresá tu nombre')
      return
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491176315706'
    let msg = `¡Hola Power Kombucha! ⚡🍹 Quiero hacer el siguiente pedido:\n\n`
    msg += `*Cliente:* ${customerName}\n`
    const addr = deliveryType === 'pickup'
      ? `PICK UP (${customerAddress || 'a coordinar'})`
      : customerAddress
    if (addr) msg += `*Dirección:* ${addr}\n`
    msg += `*Pago:* ${paymentMethod === 'cash' ? '💵 Efectivo (10% OFF)' : '🏦 Transferencia'}\n\n`
    msg += `*Pedido:*\n`

    items.forEach(item => {
      msg += `\n📦 *${item.packLabel}* × ${item.quantity}\n`
      item.flavors.forEach(f => {
        msg += `  • ${f.flavorName}: ${f.count} ud.\n`
      })
      const lineTotal = paymentMethod === 'cash'
        ? Math.round(item.price * 0.9) * item.quantity
        : item.price * item.quantity
      msg += `  Subtotal: *${formatCurrency(lineTotal)}*\n`
    })

    const displayTotal = paymentMethod === 'cash' ? cashTotal : total
    msg += `\n*TOTAL: ${formatCurrency(displayTotal)}*`
    if (paymentMethod === 'cash') msg += ` _(10% OFF en efectivo)_`
    msg += `\n\n¡Gracias! 💪`

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42]">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart size={24} />
            <h2 className="text-xl font-black">Tu pedido ({itemCount} packs)</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-80 transition-opacity">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart size={64} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">Tu carrito está vacío</p>
              <p className="text-sm mt-2">¡Elegí tu pack y combiná sabores!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.cartId} className="bg-gray-50 rounded-2xl p-4">
                  {/* Pack header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-black text-gray-900">{item.packLabel}</p>
                      <p className="text-[#FF6B9D] font-black text-sm">
                        {formatCurrency(item.price)}
                        <span className="text-green-600 ml-2 text-xs">
                          (efectivo: {formatCurrency(Math.round(item.price * 0.9))})
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-black text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors ml-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Flavor breakdown */}
                  <div className="flex flex-wrap gap-2">
                    {item.flavors.map(f => {
                      const meta = FLAVOR_META[f.flavorName]
                      return (
                        <div key={f.flavorName} className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 shadow-sm border border-gray-100">
                          {f.imageUrl ? (
                            <div className="relative w-6 h-6 rounded-md overflow-hidden flex-shrink-0">
                              <Image src={f.imageUrl} alt={f.flavorName} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <span className="text-base">{meta?.emoji ?? '🍵'}</span>
                          )}
                          <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                            {f.flavorName.split(',')[0]} ×{f.count}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout */}
        {items.length > 0 && (
          <div className="border-t p-5 space-y-4">
            {/* Totals */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between font-bold text-gray-600">
                <span>Total transferencia</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between font-black text-green-700 text-lg">
                <span>💵 Total efectivo (−10%)</span>
                <span>{formatCurrency(cashTotal)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="flex gap-3">
              {(['transfer', 'cash'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    paymentMethod === method
                      ? method === 'cash' ? 'bg-green-500 text-white' : 'bg-[#FF6B9D] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {method === 'cash' ? '💵 Efectivo' : '🏦 Transferencia'}
                </button>
              ))}
            </div>

            {/* Customer info */}
            <input
              type="text"
              placeholder="Tu nombre *"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${deliveryType === 'delivery' ? 'bg-[#FF6B9D] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                🚚 Envío
              </button>
              <button
                onClick={() => setDeliveryType('pickup')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${deliveryType === 'pickup' ? 'bg-[#FF6B9D] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                📍 Pick Up
              </button>
            </div>
            <input
              type="text"
              placeholder={deliveryType === 'delivery' ? 'Dirección de envío' : 'Punto de pick up preferido'}
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm transition-colors"
            />

            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 bg-green-500 text-white font-black text-lg py-4 rounded-full hover:bg-green-600 transition-colors shadow-lg"
            >
              <MessageCircle size={22} />
              Confirmar por WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400 font-semibold">
              Te abrimos WhatsApp con el pedido armado. ¡Solo lo enviás!
            </p>
          </div>
        )}
      </div>
    </>
  )
}
