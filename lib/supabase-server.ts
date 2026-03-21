import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createServerClient() {
  return createServerComponentClient<Database>({ cookies })
}
