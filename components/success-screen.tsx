'use client'

import { Check, RotateCcw, ShieldCheck } from 'lucide-react'

export function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <section aria-live="polite" className="py-8 text-center sm:py-12">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60"><Check size={30} strokeWidth={2.5} /></span>
      <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Submission received</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#14233f]">Application Submitted Successfully!</h2>
      <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">Thank you for your interest in joining our team. Your application and CV have been received. Our recruitment team will review your submission.</p>
      <div className="mx-auto mt-7 flex max-w-md items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-blue-700" /><p className="text-sm leading-6 text-slate-600">Your information is stored securely and will only be used to consider you for relevant opportunities.</p></div>
      <button type="button" onClick={onReset} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#142b4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c3c65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><RotateCcw size={16} /> Submit another application</button>
    </section>
  )
}
