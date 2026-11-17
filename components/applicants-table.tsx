'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Eye, LoaderCircle, Search, Trash2 } from 'lucide-react'
import { DashboardStats, type ApplicationStats } from '@/components/dashboard-stats'

type Application = { id: string; full_name: string; email: string; phone: string; position: string; status: string; created_at: string; cv_filename: string }
type DashboardPayload = { applications: Application[]; total: number; page: number; pageSize: number; stats: ApplicationStats }
const fetcher = async (url: string): Promise<DashboardPayload> => {
  const response = await fetch(url, { cache: 'no-store' })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Could not load applications.')
  return data
}
const statusClass: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  reviewed: 'bg-violet-50 text-violet-800 ring-violet-200',
  accepted: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-800 ring-rose-200',
}

export function ApplicantsTable() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [selected, setSelected] = useState<Application | null>(null)
  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 250)
    return () => window.clearTimeout(timer)
  }, [search])

  const url = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), sort })
    if (debouncedSearch) params.set('query', debouncedSearch)
    if (position) params.set('position', position)
    if (status) params.set('status', status)
    return `/api/admin/applications?${params.toString()}`
  }, [page, sort, debouncedSearch, position, status])
  const { data, error, isLoading, mutate } = useSWR<DashboardPayload>(url, fetcher, { keepPreviousData: true, revalidateOnFocus: false })

  async function changeStatus(application: Application, nextStatus: string) {
    setBusyId(application.id); setActionError('')
    const response = await fetch('/api/admin/update-status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: application.id, status: nextStatus }) })
    const result = await response.json()
    if (!response.ok) setActionError(result.message || 'Could not update application.')
    else await mutate()
    setBusyId('')
  }

  async function downloadCv(application: Application) {
    setBusyId(application.id); setActionError('')
    const response = await fetch('/api/admin/download-cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: application.id }) })
    const result = await response.json()
    if (!response.ok) setActionError(result.message || 'Could not prepare CV download.')
    else window.location.assign(result.url)
    setBusyId('')
  }

  async function deleteApplication(application: Application) {
    if (!window.confirm(`Delete the application from ${application.full_name}? This also removes their CV.`)) return
    setBusyId(application.id); setActionError('')
    const response = await fetch('/api/admin/applications', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: application.id }) })
    const result = await response.json()
    if (!response.ok) setActionError(result.message || 'Could not delete application.')
    else { setSelected(null); await mutate() }
    setBusyId('')
  }

  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 10)))
  const selectClass = 'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
  return (
    <div className="mt-8 flex flex-col gap-6">
      {data && <DashboardStats stats={data.stats} />}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <div><h2 className="text-lg font-semibold text-[#14233f]">Applicant management</h2><p className="mt-1 text-sm text-slate-500">Review submissions and keep each application moving.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative min-w-0 flex-1 sm:max-w-xs"><span className="sr-only">Search applicants by name</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name…" className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
            <label><span className="sr-only">Filter by position</span><select className={selectClass} value={position} onChange={(event) => { setPosition(event.target.value); setPage(1) }}><option value="">All positions</option><option value="crew">Crew</option><option value="cashier">Cashier</option><option value="redemption">Redemption</option></select></label>
            <label><span className="sr-only">Filter by status</span><select className={selectClass} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">All statuses</option><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select></label>
            <button type="button" onClick={() => setSort((current) => current === 'newest' ? 'oldest' : 'newest')} className={`${selectClass} inline-flex items-center justify-center gap-2 font-medium`} aria-label={`Sort by submission date, currently ${sort}`}><span>Date</span>{sort === 'newest' ? <ArrowDown size={15} /> : <ArrowUp size={15} />}</button>
          </div>
        </div>
        {actionError && <p role="alert" className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-5">{actionError}</p>}
        {(error || isLoading) ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">{isLoading ? <><LoaderCircle size={18} className="animate-spin" /> Loading applications…</> : error?.message}</div> : data?.applications.length ? <>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Applicant</th><th className="px-4 py-3.5">Position</th><th className="px-4 py-3.5">Submitted</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{data.applications.map((application) => <tr key={application.id} className="transition hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-[#14233f]">{application.full_name}</p><p className="mt-1 text-xs text-slate-500">{application.email} · {application.phone}</p></td><td className="px-4 py-4 capitalize text-slate-600">{application.position}</td><td className="px-4 py-4 whitespace-nowrap text-slate-600">{new Date(application.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass[application.status] || statusClass.pending}`}>{application.status}</span></td><td className="px-4 py-4"><div className="flex items-center gap-1"><button type="button" onClick={() => setSelected(application)} aria-label={`View ${application.full_name}`} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700"><Eye size={16} /></button><button type="button" onClick={() => downloadCv(application)} disabled={busyId === application.id} aria-label={`Download CV for ${application.full_name}`} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"><Download size={16} /></button><select aria-label={`Change status for ${application.full_name}`} value={application.status} disabled={busyId === application.id} onChange={(event) => changeStatus(application, event.target.value)} className="h-9 max-w-28 rounded-lg border border-slate-200 bg-white px-2 text-xs capitalize text-slate-600"><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select><button type="button" onClick={() => deleteApplication(application)} disabled={busyId === application.id} aria-label={`Delete ${application.full_name}`} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3.5 text-sm text-slate-500 sm:px-5"><span>{data.total} application{data.total === 1 ? '' : 's'} · Page {page} of {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="grid size-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={17} /></button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="grid size-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Next page"><ChevronRight size={17} /></button></div></div>
        </> : <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Search size={21} /></span><h3 className="mt-4 font-semibold text-[#14233f]">No applications found</h3><p className="mt-1 max-w-sm text-sm text-slate-500">New submissions will appear here. Try changing your filters or search.</p></div>}
      </section>
      {selected && <div role="dialog" aria-modal="true" aria-labelledby="applicant-detail-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-blue-700">Applicant details</p><h2 id="applicant-detail-title" className="mt-2 text-xl font-semibold text-[#14233f]">{selected.full_name}</h2></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Close</button></div><dl className="mt-6 grid gap-4 sm:grid-cols-2">{[['Email', selected.email], ['Phone', selected.phone], ['Position', selected.position], ['Status', selected.status], ['Submitted', new Date(selected.created_at).toLocaleString()], ['CV filename', selected.cv_filename]].map(([label, value]) => <div key={label}><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-medium capitalize text-slate-700">{value}</dd></div>)}</dl><button type="button" onClick={() => downloadCv(selected)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#142b4b] px-4 py-2.5 text-sm font-semibold text-white"><Download size={16} /> Download CV</button></section></div>}
    </div>
  )
}
