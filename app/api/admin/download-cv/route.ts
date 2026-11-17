import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/access'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  let body: { id?: string }
  try { body = await request.json() } catch { return NextResponse.json({ message: 'Invalid request.' }, { status: 400 }) }
  if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) return NextResponse.json({ message: 'Invalid application.' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: application, error } = await supabase.from('applications')
    .select('cv_path, cv_filename').eq('id', body.id).maybeSingle()
  if (error || !application) return NextResponse.json({ message: 'Application not found.' }, { status: 404 })

  const { data, error: signedUrlError } = await supabase.storage.from('applicant-cvs')
    .createSignedUrl(application.cv_path, 60, { download: application.cv_filename })
  if (signedUrlError || !data?.signedUrl) {
    console.error('[cv-portal] Signed CV URL creation failed:', signedUrlError?.message)
    return NextResponse.json({ message: 'Could not prepare the private CV download.' }, { status: 502 })
  }
  return NextResponse.json({ url: data.signedUrl }, { headers: { 'Cache-Control': 'private, no-store' } })
}
