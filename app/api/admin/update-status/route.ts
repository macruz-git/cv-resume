import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/access'
import { createAdminClient } from '@/lib/supabase/admin'

const allowedStatuses = ['pending', 'reviewed', 'accepted', 'rejected'] as const

export async function PATCH(request: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  let body: { id?: string; status?: string }
  try { body = await request.json() } catch { return NextResponse.json({ message: 'Invalid request.' }, { status: 400 }) }
  if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id) || !allowedStatuses.includes(body.status as (typeof allowedStatuses)[number])) {
    return NextResponse.json({ message: 'Invalid application status.' }, { status: 400 })
  }

  const { error } = await createAdminClient().from('applications')
    .update({ status: body.status }).eq('id', body.id)
  if (error) {
    console.error('[cv-portal] Application status update failed:', error.message)
    return NextResponse.json({ message: 'Could not update this application.' }, { status: 500 })
  }
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
