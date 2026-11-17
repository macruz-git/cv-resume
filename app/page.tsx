import { ApplicationForm } from '@/components/application-form'
import { ArrowUpRight, BriefcaseBusiness, Check, LockKeyhole, ShieldCheck } from 'lucide-react'

const benefits = [
  'Easy Online Application',
  'Secure CV Submission',
  'Convenient Application Process',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#14233f]">
      <header className="border-b border-slate-200/70 bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Northstar Careers home">
            <span className="text-[15px] font-bold tracking-tight">Toms World<span className="text-blue-600">.</span></span>
          </a>
          <span className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" /> Applications open
          </span>
          <a href="#application" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-blue-300 hover:text-blue-700">Submit your CV <ArrowUpRight className="ml-1 inline" size={15} /></a>
        </div>
      </header>



      <section id="application" className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[.72fr_1.28fr] lg:gap-20 lg:py-20">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-[#14233f] sm:text-4xl">Apply in a few easy steps.</h2>
          <p className="mt-4 max-w-md leading-7 text-slate-600">Tell us a little about yourself and attach your CV. We&apos;ll be in touch if your experience is a match.</p>
          <ul className="mt-8 flex flex-col gap-4">
            {benefits.map((benefit) => <li key={benefit} className="flex items-center gap-3 text-sm font-medium text-slate-600"><span className="grid size-6 place-items-center rounded-full bg-blue-100 text-blue-700"><Check size={14} /></span>{benefit}</li>)}
          </ul>
          <div className="mt-9 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#14233f]"><LockKeyhole size={16} className="text-blue-700" /> Your privacy matters</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">We collect your contact details and CV to evaluate your application. Your information is accessible only to our recruitment team and is not sold or used for unrelated marketing.</p>
          </div>
        </aside>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(15,35,65,.28)] sm:p-8 lg:p-10">
          <div className="mb-8 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-blue-700">Application form</p><h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#14233f]">Let&apos;s get to know you</h3><p className="mt-1 text-sm text-slate-500">Fields marked with <span className="text-blue-700">*</span> are required.</p></div>
            <span className="hidden rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 sm:inline-flex">Step 1 of 1</span>
          </div>
          <ApplicationForm />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© {new Date().getFullYear()} Khen</span><span>Applications are handled with care and confidentiality.</span></div>
      </footer>
    </main>
  )
}
