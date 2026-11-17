import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasPdfSignature, MAX_CV_SIZE, validateApplicant } from '@/lib/validation'

export const runtime = 'nodejs'
export const maxDuration = 60

const rateWindowMs = 60 * 60 * 1000
const maxPerWindow = 5
const submissionsByIp = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(request: NextRequest) {
  const now = Date.now()
  for (const [ip, record] of submissionsByIp) if (record.resetAt <= now) submissionsByIp.delete(ip)
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const current = submissionsByIp.get(ip)
  if (current && current.count >= maxPerWindow) return true
  submissionsByIp.set(ip, current ? { ...current, count: current.count + 1 } : { count: 1, resetAt: now + rateWindowMs })
  return false
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  if (!request.headers.get('content-type')?.includes('multipart/form-data')) return errorResponse('Invalid submission format.', 415)
  if (isRateLimited(request)) return errorResponse('Too many applications from this network. Please try again later.', 429)

  let formData: FormData
  try { formData = await request.formData() } catch { return errorResponse('The submitted form could not be read.', 400) }
  if (String(formData.get('website') || '').trim()) return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  if (formData.get('consent') !== 'on') return errorResponse('Please confirm the privacy notice before submitting.', 400)

  const validated = validateApplicant({
    fullName: String(formData.get('fullName') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    position: String(formData.get('position') || ''),
  })
  if (!validated.ok) return errorResponse(validated.error, 400)

  const file = formData.get('cv')
  if (!(file instanceof File)) return errorResponse('Please attach a PDF CV.', 400)
  if (!file.size || file.size > MAX_CV_SIZE) return errorResponse('Your CV must be a non-empty PDF no larger than 10 MB.', 400)
  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) return errorResponse('Only PDF files are accepted.', 400)
  if (!hasPdfSignature(new Uint8Array(await file.slice(0, 5).arrayBuffer()))) return errorResponse('The uploaded file is not a valid PDF.', 400)

  const originalName = Array.from(file.name.slice(0, 180), (character) => {
    const code = character.charCodeAt(0)
    return code < 32 || character === '/' || character === String.fromCharCode(92) ? '_' : character
  }).join('') || 'resume.pdf'
  const path = `${randomUUID()}.pdf`
  const supabase = createAdminClient()
  const { error: uploadError } = await supabase.storage.from('applicant-cvs').upload(path, file, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (uploadError) {
    console.error('[cv-portal] CV storage upload failed:', uploadError.message)
    return errorResponse('We could not upload your CV. Please try again later.', 502)
  }

  const { error: insertError } = await supabase.from('applications').insert({
    full_name: validated.value.fullName,
    email: validated.value.email,
    phone: validated.value.phone,
    position: validated.value.position,
    cv_path: path,
    cv_filename: originalName,
  })
  if (insertError) {
    const { error: cleanupError } = await supabase.storage.from('applicant-cvs').remove([path])
    if (cleanupError) console.error('[cv-portal] Failed to remove orphaned CV:', cleanupError.message)
    console.error('[cv-portal] Application record insert failed:', insertError.message)
    return errorResponse('We could not complete your application. Please try again later.', 502)
  }

  return NextResponse.json({ success: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
