'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

interface AddHomeModalProps {
  userId: string
  trigger?: 'button' | 'card'
}

export default function AddHomeModal({ userId: _userId, trigger = 'button' }: AddHomeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    year_built: '',
    square_footage: '',
  })
  const router = useRouter()

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/homes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to create home')
      setLoading(false)
      return
    }

    setOpen(false)
    router.refresh()
    router.push(`/dashboard/homes/${data.id}`)
  }

  const triggerEl = trigger === 'card' ? (
    <button
      onClick={() => setOpen(true)}
      className="flex flex-col items-center gap-3 text-slate-400 hover:text-[#5B6C8F] transition-colors group"
    >
      <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-[#7a8fa8] flex items-center justify-center transition-colors">
        <Plus size={20} />
      </div>
      <span className="text-sm font-medium">Add a home</span>
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
    >
      <Plus size={16} />
      Add Home
    </button>
  )

  return (
    <>
      {triggerEl}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0D9D0]">
              <h2 className="font-playfair text-lg font-semibold text-[#2F3437]">Add a Home</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Home name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="e.g. Main House, Beach Cottage"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Street address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    placeholder="Austin"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                    placeholder="TX"
                    maxLength={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ZIP</label>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => updateForm('zip', e.target.value)}
                    placeholder="78701"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Year built</label>
                  <input
                    type="number"
                    value={form.year_built}
                    onChange={(e) => updateForm('year_built', e.target.value)}
                    placeholder="2005"
                    min={1800}
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Square footage</label>
                  <input
                    type="number"
                    value={form.square_footage}
                    onChange={(e) => updateForm('square_footage', e.target.value)}
                    placeholder="2000"
                    min={0}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-[#F4F1EA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.name.trim()}
                  className="flex-1 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Home'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
