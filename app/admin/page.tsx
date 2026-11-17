import { requireAdminPage } from '@/lib/supabase/access'
import { AdminSidebar } from '@/components/admin-sidebar'
import { ApplicantsTable } from '@/components/applicants-table'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await requireAdminPage()
  return (
    <AdminSidebar email={user.email || ''}>
      <header className="border-b border-slate-200 bg-white px-5 py-5 pl-16 sm:px-8 sm:pl-20 lg:px-10 lg:pl-10">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Recruitment workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#14233f]">Applications</h1>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        <ApplicantsTable />
      </main>
    </AdminSidebar>
  )
}
