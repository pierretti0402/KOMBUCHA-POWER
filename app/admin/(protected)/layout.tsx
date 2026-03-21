import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
