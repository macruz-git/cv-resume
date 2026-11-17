import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BriefcaseBusiness, LockKeyhole } from 'lucide-react'
import { AdminLoginForm } from '@/components/admin-login-form'
import { getAdminUser } from '@/lib/supabase/access'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getAdminUser()
  if (user) redirect('/admin')
  const params = await searchParams
  return (
    <main className="flex min-h-screen flex-col bg-[#f5f7fb]">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8"><Link href="/" className="mx-auto flex max-w-7xl items-center gap-3"><span className="text-sm font-bold text-[#14233f]">Toms World<span className="text-blue-600">.</span></span></Link></header>
      <section className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_-35px_rgba(15,35,65,.28)] sm:p-9">
          <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><LockKeyhole size={21} /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-blue-700">Restricted access</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#14233f]">Admin sign in</h1>
          <p className="mt-2 mb-7 text-sm leading-6 text-slate-500">Sign in with your recruitment account to manage applications.</p>
          {params.error === 'not-authorized' && <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">This account is not authorized to access the recruitment dashboard.</p>}
          <AdminLoginForm />
          <p className="mt-5 text-center text-xs leading-5 text-slate-400">Only accounts listed in the server-side allowlist can access applicant records.</p>
        </div>
      </section>
    </main>
  )
}
