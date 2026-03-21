'use client'

import { useState } from 'react'
import { X, ShoppingCart, Plus, Minus, Trash2, MessageCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatCurrency, buildWhatsAppMessage } from '@/lib/utils'

export default function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, itemCount } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')

  if (!isOpen) return null

  const handleWhatsApp = () => {
    if (!customerName.trim()) {
      alert('Por favor ingresá tu nombre')
      return
    }

    const orderItems = items.map(item => ({
      name: `${item.product.flavor} - ${item.product.presentation}`,
      quantity: item.quantity,
      price: item.product.sale_price,
    }))

    const address = deliveryType === 'pickup'
      ? `PICK UP (${customerAddress || 'a coordinar'})`
      : customerAddress

    const url = buildWhatsAppMessage(orderItems, customerName, address)
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42]">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart size={24} />
            <h2 className="text-xl font-black">Tu pedido ({itemCount} items)</h2>
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
              <p className="text-sm mt-2">¡Agregá tu kombucha favorita!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-200 to-orange-200 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.product.flavor.includes('Naranja') ? '🍊' :
                     item.product.flavor.includes('Pomelo') ? '🌸' : '🍎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{item.product.flavor}</p>
                    <p className="text-xs text-gray-500 font-semibold">{item.product.presentation}</p>
                    <p className="text-[#FF6B9D] font-black text-sm mt-1">
                      {formatCurrency(item.product.sale_price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors ml-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout form */}
        {items.length > 0 && (
          <div className="border-t p-5 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-xl font-black">
              <span className="text-gray-900">Total</span>
              <span className="text-[#FF6B9D]">{formatCurrency(total)}</span>
            </div>

            {/* Customer form */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tu nombre *"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm transition-colors"
              />
              <input
                type="tel"
                placeholder="Tu teléfono (opcional)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm transition-colors"
              />

              {/* Delivery type */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    deliveryType === 'delivery'
                      ? 'bg-[#FF6B9D] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🚚 Envío
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    deliveryType === 'pickup'
                      ? 'bg-[#FF6B9D] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  📍 Pick Up
                </button>
              </div>

              <input
                type="text"
                placeholder={deliveryType === 'delivery' ? 'Tu dirección de envío' : 'Punto de pick up preferido'}
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold text-sm transition-colors"
              />
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 bg-green-500 text-white font-black text-lg py-4 rounded-full hover:bg-green-600 transition-colors shadow-lg"
            >
              <MessageCircle size={22} />
              Confirmar pedido por WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400 font-semibold">
              Te abrimos WhatsApp con tu pedido armado. ¡Solo lo enviás!
            </p>
          </div>
        )}
      </div>
    </>
  )
}
