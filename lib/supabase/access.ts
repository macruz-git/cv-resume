import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export function isAuthorizedAdmin(email?: string | null) {
  if (!email) return false
  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  return allowedEmails.includes(email.trim().toLowerCase())
}

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user || !isAuthorizedAdmin(user.email)) return null
  return user
}

export async function requireAdminPage() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return user
}
