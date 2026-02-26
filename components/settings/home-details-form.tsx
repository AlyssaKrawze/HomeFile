'use client'

import { useState } from 'react'
import { Pencil, X, Check, Loader2 } from 'lucide-react'

interface Home {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  year_built: number | null
  square_footage: number | null
}

export default function HomeDetailsForm({ home }: { home: Home }) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: home.name,
    address: home.address ?? '',
    city: home.city ?? '',
    state: home.state ?? '',
    zip: home.zip ?? '',
    year_built: home.year_built ? String(home.year_built) : '',
    square_footage: home.square_footage ? String(home.square_footage) : '',
  })

  function u(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/homes/${home.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        square_footage: form.square_footage ? parseInt(form.square_footage) : null,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error || 'Failed to save')
      return
    }
    setEditing(false)
    window.location.reload()
  }

  if (!editing) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Home name</label>
            <p className="text-sm text-[#2F3437]">{home.name}</p>
          </div>
          {home.year_built && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Year built</label>
              <p className="text-sm text-[#2F3437]">{home.year_built}</p>
            </div>
          )}
          {home.address && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
              <p className="text-sm text-[#2F3437]">
                {[home.address, home.city, home.state, home.zip].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
          {home.square_footage && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Square footage</label>
              <p className="text-sm text-[#2F3437]">{home.square_footage.toLocaleString()} sq ft</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="self-start flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors mt-4"
        >
          <Pencil size={13} />
          Edit Details
        </button>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Home name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => u('name', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Street address</label>
          <input
            type="text"
            value={form.address}
            onChange={e => u('address', e.target.value)}
            placeholder="123 Main St"
            className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
          <input type="text" value={form.city} onChange={e => u('city', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
            <input type="text" value={form.state} onChange={e => u('state', e.target.value)} maxLength={2} className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ZIP</label>
            <input type="text" value={form.zip} onChange={e => u('zip', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Year built</label>
          <input type="number" value={form.year_built} onChange={e => u('year_built', e.target.value)} placeholder="2005" min={1800} max={2100} className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Square footage</label>
          <input type="number" value={form.square_footage} onChange={e => u('square_footage', e.target.value)} placeholder="2000" min={0} className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading || !form.name.trim()}
          className="flex items-center gap-1.5 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => { setEditing(false); setError(null) }}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <X size={13} />
          Cancel
        </button>
      </div>
    </div>
  )
}
