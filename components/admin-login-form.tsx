'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, LoaderCircle, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (signInError) {
      const message = signInError.message.toLowerCase()
      if (message.includes('invalid login credentials')) setError('Invalid email or password.')
      else if (message.includes('email not confirmed')) setError('Please confirm your email before signing in.')
      else if (message.includes('rate limit') || message.includes('too many')) setError('Too many sign-in attempts. Please wait and try again.')
      else setError('Sign-in is temporarily unavailable. Please try again.')
      return
    }
    router.replace('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label htmlFor="admin-email" className="text-sm font-semibold text-slate-700">Email address
        <input id="admin-email" type="email" name="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="admin@company.com" disabled={busy} />
      </label>
      <label htmlFor="admin-password" className="text-sm font-semibold text-slate-700">Password
        <input id="admin-password" type="password" name="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Enter your password" disabled={busy} />
      </label>
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
      <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#142b4b] text-sm font-semibold text-white transition hover:bg-[#1c3c65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70">{busy ? <><LoaderCircle size={17} className="animate-spin" /> Signing in…</> : <>Sign in securely <ArrowRight size={16} /></>}</button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500"><LockKeyhole size={13} /> Admin access is restricted to authorized team members.</p>
    </form>
  )
}
