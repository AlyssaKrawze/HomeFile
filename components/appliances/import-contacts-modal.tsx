'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Loader2, CheckCircle2, Trash2, FileSpreadsheet } from 'lucide-react'

interface MappedContact {
  name: string
  company: string
  phone: string
  email: string
  notes: string
  _include: boolean
}

interface ImportContactsModalProps {
  applianceId: string
  homeId: string
  onClose: () => void
}

type Step = 'upload' | 'mapping' | 'preview' | 'saving' | 'done'

export default function ImportContactsModal({ applianceId, homeId, onClose }: ImportContactsModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [error, setError] = useState<string | null>(null)
  const [contacts, setContacts] = useState<MappedContact[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleFile(file: File) {
    setError(null)
    setStep('mapping')

    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

      if (rows.length === 0) {
        setError('The spreadsheet appears to be empty.')
        setStep('upload')
        return
      }

      const res = await fetch(
        `/api/homes/${homeId}/appliances/${applianceId}/providers/import-map`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: rows.slice(0, 200) }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to map columns')
      }

      const { mapped } = await res.json()

      if (!mapped || mapped.length === 0) {
        setError('Could not identify any contacts in this file. Check that it has name/contact columns.')
        setStep('upload')
        return
      }

      setContacts(mapped.map((c: Omit<MappedContact, '_include'>) => ({ ...c, _include: true })))
      setStep('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStep('upload')
    }
  }

  function updateContact(index: number, field: keyof MappedContact, value: string | boolean) {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function removeContact(index: number) {
    setContacts(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setStep('saving')
    const toSave = contacts.filter(c => c._include && c.name.trim())

    const { error: dbError } = await supabase.from('service_providers').insert(
      toSave.map(c => ({
        appliance_id: applianceId,
        home_id: homeId,
        name: c.name.trim(),
        company: c.company.trim() || null,
        phone: c.phone.trim() || null,
        email: c.email.trim() || null,
        notes: c.notes.trim() || null,
      }))
    )

    if (dbError) {
      setError(dbError.message)
      setStep('preview')
      return
    }

    setSavedCount(toSave.length)
    setStep('done')
    router.refresh()
  }

  const includedCount = contacts.filter(c => c._include && c.name.trim()).length

  const inputCls =
    'w-full px-2 py-1 rounded border border-transparent hover:border-[#C8BFB2] focus:border-[#7B8EC8] focus:outline-none bg-transparent focus:bg-white transition-colors text-xs'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9D0] flex-shrink-0">
          <div>
            <h2 className="font-semibold text-[#2F3437]">Import Contacts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'upload' && 'Upload an Excel or CSV file to bulk-add service providers'}
              {step === 'mapping' && 'Claude is mapping your spreadsheet columns…'}
              {step === 'preview' && `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} found — review before saving`}
              {step === 'saving' && `Saving ${includedCount} contacts…`}
              {step === 'done' && `${savedCount} contact${savedCount !== 1 ? 's' : ''} imported successfully`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Upload */}
          {step === 'upload' && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-[#C8BFB2] hover:border-[#7B8EC8] rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#eef0fb] flex items-center justify-center group-hover:bg-[#e0e4f5] transition-colors">
                  <FileSpreadsheet size={26} className="text-[#7B8EC8]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#2F3437]">Click to upload a spreadsheet</p>
                  <p className="text-xs text-slate-400 mt-1">.xlsx, .xls, or .csv — any column layout</p>
                </div>
              </button>
              {error && <p className="text-xs text-red-600 mt-3 text-center">{error}</p>}
            </div>
          )}

          {/* Mapping */}
          {step === 'mapping' && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 size={32} className="text-[#7B8EC8] animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Mapping columns with AI…</p>
                <p className="text-xs text-slate-400 mt-1">Claude is reading your spreadsheet layout</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {step === 'preview' && (
            <div>
              {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
              <div className="overflow-x-auto rounded-xl border border-[#E0D9D0]">
                <table className="w-full text-xs min-w-[600px]">
                  <thead>
                    <tr className="bg-[#F4F1EA] text-slate-500">
                      <th className="px-3 py-2.5 text-left font-medium w-8">
                        <input
                          type="checkbox"
                          checked={contacts.length > 0 && contacts.every(c => c._include)}
                          onChange={e => setContacts(prev => prev.map(c => ({ ...c, _include: e.target.checked })))}
                          className="rounded"
                        />
                      </th>
                      <th className="px-3 py-2.5 text-left font-medium">Name *</th>
                      <th className="px-3 py-2.5 text-left font-medium">Company</th>
                      <th className="px-3 py-2.5 text-left font-medium">Phone</th>
                      <th className="px-3 py-2.5 text-left font-medium">Email</th>
                      <th className="px-3 py-2.5 text-left font-medium">Notes</th>
                      <th className="px-3 py-2.5 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EBE3]">
                    {contacts.map((c, i) => (
                      <tr key={i} className={!c._include ? 'opacity-40' : ''}>
                        <td className="px-3 py-1.5">
                          <input
                            type="checkbox"
                            checked={c._include}
                            onChange={e => updateContact(i, '_include', e.target.checked)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input type="text" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} className={`${inputCls} min-w-[100px]`} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="text" value={c.company} onChange={e => updateContact(i, 'company', e.target.value)} className={`${inputCls} min-w-[100px]`} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="text" value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} className={`${inputCls} min-w-[90px]`} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="text" value={c.email} onChange={e => updateContact(i, 'email', e.target.value)} className={`${inputCls} min-w-[130px]`} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="text" value={c.notes} onChange={e => updateContact(i, 'notes', e.target.value)} className={`${inputCls} min-w-[100px]`} />
                        </td>
                        <td className="px-3 py-1.5">
                          <button onClick={() => removeContact(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-2">{includedCount} of {contacts.length} selected · Click any cell to edit</p>
            </div>
          )}

          {/* Saving */}
          {step === 'saving' && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 size={32} className="text-[#7B8EC8] animate-spin" />
              <p className="text-sm font-medium text-slate-700">Saving {includedCount} contacts…</p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#2F3437]">{savedCount} contact{savedCount !== 1 ? 's' : ''} imported</p>
                <p className="text-xs text-slate-400 mt-1">All service providers have been added.</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#7B8EC8] hover:bg-[#5B6C8F] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer — preview step only */}
        {step === 'preview' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E0D9D0] flex-shrink-0 bg-white">
            <button
              onClick={() => { setContacts([]); setError(null); setStep('upload') }}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Upload different file
            </button>
            <button
              onClick={handleSave}
              disabled={includedCount === 0}
              className="flex items-center gap-2 bg-[#7B8EC8] hover:bg-[#5B6C8F] disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Import {includedCount} contact{includedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
