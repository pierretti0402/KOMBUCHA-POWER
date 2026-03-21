import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

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
    <html lang="es">
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
