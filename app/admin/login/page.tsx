'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('Email o contraseña incorrectos')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8C42 50%, #FFD93D 100%)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42] bg-clip-text text-transparent">
            POWER ⚡
          </div>
          <p className="text-gray-500 font-bold mt-1">Panel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@powerkombucha.com"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none font-semibold transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FF8C42] text-white font-black rounded-full hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar al panel'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm font-semibold mt-6">
          ¿No tenés acceso?{' '}
          <a href="mailto:admin@powerkombucha.com" className="text-[#FF6B9D] hover:underline">
            Contactar admin
          </a>
        </p>
      </div>
    </div>
  )
}
