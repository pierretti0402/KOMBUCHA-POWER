import { createClient } from '@supabase/supabase-js'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/public/Navbar'
import Hero from '@/components/public/Hero'
import Flavors from '@/components/public/Flavors'
import WhatIsKombucha from '@/components/public/WhatIsKombucha'
import Shop from '@/components/public/Shop'
import Cart from '@/components/public/Cart'
import WhereToFind from '@/components/public/WhereToFind'
import AboutUs from '@/components/public/AboutUs'
import FAQSection from '@/components/public/FAQSection'
import Contact from '@/components/public/Contact'
import Footer from '@/components/public/Footer'
import { Database } from '@/types/database'

// Revalidate every 5 minutes
export const revalidate = 300

async function getPageData() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [productsRes, faqRes, pickupRes, contentRes] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).order('flavor').order('presentation'),
    supabase.from('faq').select('*').eq('active', true).order('order'),
    supabase.from('pickup_points').select('*').eq('active', true),
    supabase.from('site_content').select('*'),
  ])

  const content: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentRes.data?.forEach((item: any) => {
    content[item.key] = item.value
  })

  return {
    products: productsRes.data || [],
    faqs: faqRes.data || [],
    pickupPoints: pickupRes.data || [],
    content,
  }
}

export default async function HomePage() {
  const { products, faqs, pickupPoints, content } = await getPageData()

  return (
    <CartProvider>
      <Navbar />
      <main>
        <Hero />
        <Flavors products={products} />
        <Shop products={products} />
        <WhatIsKombucha />
        <WhereToFind
          pickupPoints={pickupPoints}
          deliveryText={content.delivery_text || 'Enviamos a toda la zona del AMBA. Para pedidos al interior del país, consultá por WhatsApp.'}
        />
        <AboutUs
          title={content.about_title || 'Nuestra historia'}
          text={content.about_text || 'Power Kombucha nació con una misión simple: llevar los beneficios de la kombucha artesanal a todos los argentinos.'}
        />
        <FAQSection faqs={faqs} />
        <Contact
          email={content.contact_email || 'hola@powerkombucha.com.ar'}
          instagram={content.instagram_url || 'https://www.instagram.com/powerkombucha'}
        />
      </main>
      <Footer
        email={content.contact_email || 'hola@powerkombucha.com.ar'}
        instagram={content.instagram_url || 'https://www.instagram.com/powerkombucha'}
      />
      <Cart />
    </CartProvider>
  )
}
