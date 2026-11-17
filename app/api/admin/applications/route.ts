import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/access'
import { createAdminClient } from '@/lib/supabase/admin'

const pageSize = 10
const statuses = ['pending', 'reviewed', 'accepted', 'rejected'] as const

export async function GET(request: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const params = request.nextUrl.searchParams
  const page = Math.max(1, Number(params.get('page')) || 1)
  const query = (params.get('query') || '').trim().replace(/[%_*]/g, '').slice(0, 100)
  const position = params.get('position') || ''
  const status = params.get('status') || ''
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest'
  const supabase = createAdminClient()

  let listQuery = supabase.from('applications')
    .select('id, full_name, email, phone, position, status, created_at, cv_filename', { count: 'exact' })
    .order('created_at', { ascending: sort === 'oldest' })
    .range((page - 1) * pageSize, page * pageSize - 1)
  if (query) listQuery = listQuery.ilike('full_name', `%${query}%`)
  if (['crew', 'cashier', 'redemption'].includes(position)) listQuery = listQuery.eq('position', position)
  if (statuses.includes(status as (typeof statuses)[number])) listQuery = listQuery.eq('status', status)

  const statQueries = await Promise.all([
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    ...statuses.map((value) => supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', value)),
  ])
  const { data, error, count } = await listQuery
  if (error || statQueries.some((result) => result.error)) {
    console.error('[cv-portal] Admin application listing failed:', error?.message || 'Unable to load dashboard stats')
    return NextResponse.json({ message: 'Could not load applications.' }, { status: 500 })
  }

  return NextResponse.json({
    applications: data || [],
    total: count || 0,
    page,
    pageSize,
    stats: {
      total: statQueries[0].count || 0,
      pending: statQueries[1].count || 0,
      reviewed: statQueries[2].count || 0,
      accepted: statQueries[3].count || 0,
      rejected: statQueries[4].count || 0,
    },
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function DELETE(request: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  let body: { id?: string }
  try { body = await request.json() } catch { return NextResponse.json({ message: 'Invalid request.' }, { status: 400 }) }
  if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) return NextResponse.json({ message: 'Invalid application.' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: application, error: findError } = await supabase.from('applications').select('id, cv_path').eq('id', body.id).maybeSingle()
  if (findError) return NextResponse.json({ message: 'Could not load this application.' }, { status: 500 })
  if (!application) return NextResponse.json({ message: 'Application not found.' }, { status: 404 })

  const { error: storageError } = await supabase.storage.from('applicant-cvs').remove([application.cv_path])
  if (storageError) {
    console.error('[cv-portal] CV deletion failed:', storageError.message)
    return NextResponse.json({ message: 'Could not delete the private CV. The application was not removed.' }, { status: 502 })
  }
  const { error: deleteError } = await supabase.from('applications').delete().eq('id', body.id)
  if (deleteError) {
    console.error('[cv-portal] Application deletion failed:', deleteError.message)
    return NextResponse.json({ message: 'The CV was removed, but the application record could not be deleted.' }, { status: 500 })
  }
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
