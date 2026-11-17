'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BriefcaseBusiness, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminSidebar({ email, children }: { email: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }
  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <button type="button" aria-label="Open navigation" onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"><Menu size={18} /></button>
      {open && <button type="button" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-5 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <a href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="text-sm font-bold tracking-tight text-[#14233f]">Toms World<span className="text-blue-600">.</span></span></a>
          <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"><X size={17} /></button>
        </div>
        <div className="mt-10"><p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Recruitment</p><a href="/admin" className="mt-3 flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-800"><BriefcaseBusiness size={17} /> Applications</a></div>
        <div className="mt-auto border-t border-slate-100 pt-4"><p className="truncate px-2 text-xs font-medium text-slate-500" title={email}>{email}</p><button onClick={signOut} type="button" className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#14233f]"><LogOut size={16} /> Sign out</button></div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
