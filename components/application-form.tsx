'use client'

import { useState } from 'react'
import { AlertCircle, ArrowRight, LoaderCircle, ShieldCheck } from 'lucide-react'
import { UploadZone } from '@/components/upload-zone'
import { SuccessScreen } from '@/components/success-screen'

const positions = [{ value: 'crew', label: 'Crew' }, { value: 'cashier', label: 'Cashier' }, { value: 'redemption', label: 'Redemption' }]
type FormValues = { fullName: string; email: string; phone: string; position: string }

function uploadWithProgress(formData: FormData, onProgress: (progress: number) => void) {
  return new Promise<{ ok: boolean; message?: string }>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/submit-application')
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)) }
    request.onload = () => {
      let result: { message?: string } = {}
      try { result = JSON.parse(request.responseText) } catch { /* Ignore non-JSON error bodies. */ }
      if (request.status >= 200 && request.status < 300) resolve({ ok: true })
      else resolve({ ok: false, message: result.message || 'We couldn’t submit your application. Please try again.' })
    }
    request.onerror = () => reject(new Error('A network error interrupted the upload. Please check your connection and try again.'))
    request.onabort = () => reject(new Error('The upload was canceled. Please try again.'))
    request.send(formData)
  })
}

export function ApplicationForm() {
  const [values, setValues] = useState<FormValues>({ fullName: '', email: '', phone: '', position: '' })
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [consent, setConsent] = useState(false)

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFileError('')
    if (!file) { setFileError('Please attach your CV before submitting.'); return }
    if (!consent) {
      setError('Please agree to the privacy notice before submitting.')
      document.getElementById('privacyConsent')?.focus()
      return
    }
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setError('Please complete all required fields and review any highlighted values.')
      form.reportValidity()
      return
    }
    setBusy(true)
    setProgress(0)
    const payload = new FormData()
    payload.set('fullName', values.fullName.trim())
    payload.set('email', values.email.trim())
    payload.set('phone', values.phone.trim())
    payload.set('position', values.position)
    payload.set('website', '')
    payload.set('consent', consent ? 'on' : '')
    payload.set('cv', file)
    try {
      const result = await uploadWithProgress(payload, setProgress)
      if (!result.ok) { setError(result.message || 'Please try again.'); return }
      setSubmitted(true)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (submitted) return <SuccessScreen onReset={() => { setSubmitted(false); setValues({ fullName: '', email: '', phone: '', position: '' }); setConsent(false); setFile(null); setProgress(0); setError('') }} />

  const fieldClass = 'mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#14233f] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50'
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="fullName">Full name <span className="text-blue-700">*</span>
          <input id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={120} value={values.fullName} onChange={(event) => update('fullName', event.target.value)} className={fieldClass} placeholder="e.g. Jordan Lee" disabled={busy} />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email address <span className="text-blue-700">*</span>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={(event) => update('email', event.target.value)} className={fieldClass} placeholder="you@example.com" disabled={busy} />
        </label>
        <label className="text-sm font-semibold text-slate-700" htmlFor="phone">Phone number <span className="text-blue-700">*</span>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} value={values.phone} onChange={(event) => update('phone', event.target.value)} className={fieldClass} placeholder="+63 917 123 4567" disabled={busy} />
        </label>
      </div>
      <label className="text-sm font-semibold text-slate-700" htmlFor="position">Position applying for
        <select id="position" name="position" required value={values.position} onChange={(event) => update('position', event.target.value)} className={`${fieldClass} appearance-none`} disabled={busy}>
          <option value="">Select a position</option>{positions.map((position) => <option key={position.value} value={position.value}>{position.label}</option>)}
        </select>
      </label>
      <UploadZone file={file} onChange={(nextFile) => { setFile(nextFile); setFileError('') }} disabled={busy} error={fileError} />
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input type="checkbox" id="privacyConsent" name="consent" required checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy} className="mt-1 size-4 shrink-0 appearance-auto rounded border border-slate-300 bg-white accent-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" />
        <span>I agree that my contact details and CV may be collected and reviewed by the recruitment team for this application. <span className="text-blue-700">*</span></span>
      </label>
      <label className="sr-only" htmlFor="website">Leave this field empty</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" className="absolute -left-[10000px]" aria-hidden="true" />
      {error && <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
      {busy && <div aria-live="polite" className="rounded-xl bg-slate-50 p-3.5"><div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600"><span>Uploading securely…</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-[width] duration-200" style={{ width: `${progress}%` }} /></div></div>}
      <button type="submit" disabled={busy} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#142b4b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c3c65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70">{busy ? <><LoaderCircle size={17} className="animate-spin" /> Uploading your application…</> : <>Submit application <ArrowRight size={17} /></>}</button>
      <p className="flex items-start justify-center gap-1.5 text-center text-xs leading-5 text-slate-500"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" /> Your CV is sent securely and only reviewed by our recruitment team.</p>
    </form>
  )
}
