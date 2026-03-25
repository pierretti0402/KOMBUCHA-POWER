import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Fuzzy_Bubbles, Fredoka } from 'next/font/google'

const fuzzyBubbles = Fuzzy_Bubbles({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-fuzzy-bubbles',
})

const fredoka = Fredoka({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-fredoka',
})

export const metadata: Metadata = {
  title: 'Power Kombucha - La gaseosa del futuro',
  description: 'Kombucha artesanal argentina. Vegana, Gluten Free, Orgánica. Con probióticos naturales para tu bienestar. Sabores: Naranja Frutilla Jengibre, Pomelo Rosado Jengibre, Manzana Menta Limón.',
  keywords: 'kombucha, argentina, probióticos, vegano, gluten free, bebida saludable, fermentada',
  openGraph: {
    title: 'Power Kombucha - La gaseosa del futuro',
    description: 'Kombucha artesanal argentina con probióticos naturales.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${fuzzyBubbles.variable} ${fredoka.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: '600',
            },
          }}
        />
      </body>
    </html>
  )
}
