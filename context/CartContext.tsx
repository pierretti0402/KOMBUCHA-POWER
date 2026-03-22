'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { PackCartItem, FlavorChoice } from '@/types/database'

interface CartContextType {
  items: PackCartItem[]
  addPack: (item: Omit<PackCartItem, 'cartId'>) => void
  removeItem: (cartId: string) => void
  updateQuantity: (cartId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PackCartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addPack = useCallback((item: Omit<PackCartItem, 'cartId'>) => {
    const cartId = `${item.packSize}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setItems(prev => [...prev, { ...item, cartId }])
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId))
  }, [])

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.cartId !== cartId))
    } else {
      setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity } : i))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addPack, removeItem, updateQuantity, clearCart,
      total, itemCount, isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
