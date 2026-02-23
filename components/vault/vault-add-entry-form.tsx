'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { VaultEntryDecrypted, VaultCategory } from '@/lib/types'
import { VAULT_CATEGORY_META } from '@/lib/types'

interface VaultAddEntryFormProps {
  homeId: string
  onAdded: (entry: VaultEntryDecrypted) => void
  onCancel: () => void
}

export default function VaultAddEntryForm({ homeId, onAdded, onCancel }: VaultAddEntryFormProps) {
  const [category, setCategory] = useState<VaultCategory>('wifi')
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldValue, setFieldValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const body: Record<string, string> = { category, label, notes }
    if (category === 'wifi') { body.ssid = ssid; body.password = password }
    if (category === 'alarm' || category === 'garage' || category === 'gate') { body.code = code }
    if (category === 'custom') { body.fieldLabel = fieldLabel; body.fieldValue = fieldValue }

    const res = await fetch(`/api/homes/${homeId}/vault/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      onAdded(data.entry)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to add entry')
    }
  }

  return (
    <div className="bg-[#F4F1EA] rounded-2xl border border-[#C8BFB2] p-5 mb-6">
      <h3 className="font-semibold text-[#2F3437] mb-4">Add New Entry</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as VaultCategory)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] bg-white"
            >
              {(Object.keys(VAULT_CATEGORY_META) as VaultCategory[]).map(cat => (
                <option key={cat} value={cat}>{VAULT_CATEGORY_META[cat].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Label *</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Home WiFi"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
            />
          </div>
        </div>

        {category === 'wifi' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Network name (SSID)</label>
              <input
                type="text"
                value={ssid}
                onChange={e => setSsid(e.target.value)}
                placeholder="WiFi network name"
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password *</label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="WiFi password"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] font-mono"
              />
            </div>
          </>
        )}

        {(category === 'alarm' || category === 'garage' || category === 'gate') && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Code *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Access code"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] font-mono"
            />
          </div>
        )}

        {category === 'custom' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Field name *</label>
              <input
                type="text"
                value={fieldLabel}
                onChange={e => setFieldLabel(e.target.value)}
                placeholder="e.g. Gate PIN"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Value *</label>
              <input
                type="text"
                value={fieldValue}
                onChange={e => setFieldValue(e.target.value)}
                placeholder="Secret value"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] font-mono"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes"
            className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-[#F4F1EA]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}
