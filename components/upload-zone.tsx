'use client'

import { useRef, useState } from 'react'
import { FileCheck2, FileUp, RefreshCw, Trash2 } from 'lucide-react'

const MAX_FILE_BYTES = 10 * 1024 * 1024

type UploadZoneProps = {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  error?: string
}

function formatSize(size: number) {
  return size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`
}

export function UploadZone({ file, onChange, disabled, error }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  function selectFile(candidate?: File) {
    setLocalError('')
    if (!candidate) return
    if (candidate.type !== 'application/pdf' || !candidate.name.toLowerCase().endsWith('.pdf')) {
      setLocalError('Please choose a PDF file.')
      return
    }
    if (candidate.size > MAX_FILE_BYTES) {
      setLocalError('Your file must be 10 MB or smaller.')
      return
    }
    if (candidate.size === 0) {
      setLocalError('This file is empty. Please choose another PDF.')
      return
    }
    onChange(candidate)
  }

  const message = error || localError
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-700">Upload CV <span className="text-blue-700">*</span></span>
      {file ? (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm"><FileCheck2 size={21} /></span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#14233f]">{file.name}</p><p className="mt-0.5 text-xs text-slate-500">PDF · {formatSize(file.size)}</p></div>
          <button type="button" onClick={() => { onChange(null); setLocalError(''); if (inputRef.current) inputRef.current.value = '' }} disabled={disabled} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-blue-700 disabled:opacity-50" aria-label={`Remove ${file.name}`}><Trash2 size={15} /> <span className="hidden sm:inline">Remove</span></button>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-blue-700 disabled:opacity-50" aria-label="Replace CV"><RefreshCw size={15} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]) }} disabled={disabled} className={`flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-7 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/40'} disabled:cursor-not-allowed disabled:opacity-60`} aria-describedby="upload-hint">
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-white text-blue-700 shadow-sm"><FileUp size={21} /></span>
          <span className="text-sm font-semibold text-[#14233f]">Drop your CV here or <span className="text-blue-700">browse files</span></span>
          <span id="upload-hint" className="mt-1.5 text-xs text-slate-500">PDF only · Max file size 10 MB</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" disabled={disabled} onChange={(event) => { selectFile(event.target.files?.[0]); event.currentTarget.value = '' }} aria-label="Choose a PDF CV" />
      {message && <p role="alert" className="mt-2 text-sm text-red-600">{message}</p>}
    </div>
  )
}
