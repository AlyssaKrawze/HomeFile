'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { ROOM_CATEGORIES, type PermissionCategory } from '@/lib/types'

interface AddRoomModalProps {
  homeId: string
  trigger?: 'button' | 'card'
}

export default function AddRoomModal({ homeId, trigger = 'button' }: AddRoomModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    category: 'other' as PermissionCategory,
    floor: '1',
    description: '',
  })
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('rooms').insert({
      home_id: homeId,
      name: form.name.trim(),
      category: form.category,
      floor: parseInt(form.floor) || 1,
      description: form.description || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setOpen(false)
    setForm({ name: '', category: 'other', floor: '1', description: '' })
    router.refresh()
  }

  const triggerEl = trigger === 'card' ? (
    <button
      onClick={() => setOpen(true)}
      className="flex flex-col items-center gap-3 text-slate-400 hover:text-teal-600 transition-colors"
    >
      <div className="w-11 h-11 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-400 flex items-center justify-center transition-colors">
        <Plus size={18} />
      </div>
      <span className="text-xs font-medium">Add room</span>
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
    >
      <Plus size={15} />
      Add Room
    </button>
  )

  return (
    <>
      {triggerEl}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add a Room</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Room name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Main Kitchen, Master Bathroom"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(ROOM_CATEGORIES) as [PermissionCategory, typeof ROOM_CATEGORIES[PermissionCategory]][]).map(([key, cat]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, category: key }))}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        form.category === key
                          ? 'border-teal-400 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Floor</label>
                <select
                  value={form.floor}
                  onChange={(e) => setForm(p => ({ ...p, floor: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="0">Basement</option>
                  <option value="1">Ground floor (1st)</option>
                  <option value="2">2nd floor</option>
                  <option value="3">3rd floor</option>
                  <option value="4">Attic</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.name.trim()}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
