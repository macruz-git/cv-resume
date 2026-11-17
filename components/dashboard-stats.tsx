import { CheckCheck, Clock3, FileText, UserRoundCheck, UserRoundX } from 'lucide-react'

export type ApplicationStats = { total: number; pending: number; reviewed: number; accepted: number; rejected: number }

const cards = [
  { key: 'total', title: 'Total applications', icon: FileText, color: 'text-blue-700 bg-blue-50' },
  { key: 'pending', title: 'Pending review', icon: Clock3, color: 'text-amber-700 bg-amber-50' },
  { key: 'reviewed', title: 'Reviewed', icon: CheckCheck, color: 'text-violet-700 bg-violet-50' },
  { key: 'accepted', title: 'Accepted', icon: UserRoundCheck, color: 'text-emerald-700 bg-emerald-50' },
  { key: 'rejected', title: 'Rejected', icon: UserRoundX, color: 'text-rose-700 bg-rose-50' },
] as const

export function DashboardStats({ stats }: { stats: ApplicationStats }) {
  return <section aria-label="Application overview" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{cards.map(({ key, title, icon: Icon, color }) => <article key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-slate-500 sm:text-sm">{title}</span><span className={`grid size-9 shrink-0 place-items-center rounded-xl ${color}`}><Icon size={17} /></span></div><p className="mt-4 text-2xl font-semibold tracking-tight text-[#14233f]">{stats[key]}</p></article>)}</section>
}
