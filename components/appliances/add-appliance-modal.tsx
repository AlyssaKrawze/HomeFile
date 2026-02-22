'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Search, X } from 'lucide-react'

interface AddApplianceModalProps {
  homeId: string
  roomId: string
  trigger?: 'button' | 'card'
}

const APPLIANCE_CATEGORIES = [
  'Kitchen Appliance', 'HVAC', 'Plumbing', 'Electrical',
  'Laundry', 'Water System', 'Safety System', 'Outdoor',
  'Structural', 'Entertainment', 'Other',
]

export default function AddApplianceModal({ homeId, roomId, trigger = 'button' }: AddApplianceModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    installation_date: '',
    purchase_price: '',
    warranty_expiry: '',
    warranty_provider: '',
    notes: '',
  })
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupStatus, setLookupStatus] = useState<null | 'found' | 'not_found'>(null)
  const [suggestedTasks, setSuggestedTasks] = useState<Array<{
    title: string; description: string; monthsFromNow: number; priority: string
  }>>([])
  const router = useRouter()
  const supabase = createClient()

  async function handleLookup() {
    if (!form.model.trim()) return
    setLookupLoading(true)
    setLookupStatus(null)
    setSuggestedTasks([])
    try {
      const params = new URLSearchParams({ brand: form.brand, model: form.model })
      const res = await fetch(`/api/appliances/lookup?${params}`)
      const data = await res.json()
      if (data.found) {
        setForm(p => ({
          ...p,
          model: p.model || data.model || p.model,
          name: p.name || data.name || p.name,
          brand: p.brand || data.brand || p.brand,
          notes: p.notes || data.notes || p.notes,
        }))
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          setSuggestedTasks(data.tasks)
        }
        setLookupStatus('found')
      } else {
        setLookupStatus('not_found')
      }
    } catch {
      setLookupStatus('not_found')
    } finally {
      setLookupLoading(false)
    }
  }

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    const { data: newAppliance, error } = await supabase.from('appliances').insert({
      home_id: homeId,
      room_id: roomId,
      name: form.name.trim(),
      category: form.category || null,
      brand: form.brand || null,
      model: form.model || null,
      serial_number: form.serial_number || null,
      purchase_date: form.purchase_date || null,
      installation_date: form.installation_date || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      warranty_expiry: form.warranty_expiry || null,
      warranty_provider: form.warranty_provider || null,
      notes: form.notes || null,
    }).select('id').single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (newAppliance && suggestedTasks.length > 0) {
      const now = Date.now()
      await supabase.from('scheduled_tasks').insert(
        suggestedTasks.map(task => ({
          home_id: homeId,
          appliance_id: newAppliance.id,
          title: task.title,
          description: task.description || null,
          due_date: new Date(now + task.monthsFromNow * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: task.priority,
          source: 'ai',
        }))
      )
    }

    setOpen(false)
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
      <span className="text-xs font-medium">Add item</span>
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
    >
      <Plus size={15} />
      Add Item
    </button>
  )

  return (
    <>
      {triggerEl}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add an Item</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="e.g. Refrigerator, HVAC System, Water Heater"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => update('category', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">Select category</option>
                    {APPLIANCE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => update('brand', e.target.value)}
                    placeholder="e.g. Samsung, Carrier"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.model}
                      onChange={e => { update('model', e.target.value); setLookupStatus(null); setSuggestedTasks([]) }}
                      placeholder="Model number"
                      className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={handleLookup}
                      disabled={lookupLoading || !form.model.trim()}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {lookupLoading
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Search size={14} />}
                      Look up product
                    </button>
                  </div>
                  {lookupStatus === 'found' && (
                    <p className="mt-1.5 text-xs text-teal-600">
                      Details filled in ✓{suggestedTasks.length > 0 ? ` · ${suggestedTasks.length} maintenance task${suggestedTasks.length !== 1 ? 's' : ''} suggested below` : ''}
                    </p>
                  )}
                  {lookupStatus === 'not_found' && (
                    <p className="mt-1.5 text-xs text-slate-500">No product data found — fill in manually</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Serial number</label>
                  <input
                    type="text"
                    value={form.serial_number}
                    onChange={e => update('serial_number', e.target.value)}
                    placeholder="SN..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase date</label>
                  <input
                    type="date"
                    value={form.purchase_date}
                    onChange={e => update('purchase_date', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Installation date</label>
                  <input
                    type="date"
                    value={form.installation_date}
                    onChange={e => update('installation_date', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase price ($)</label>
                  <input
                    type="number"
                    value={form.purchase_price}
                    onChange={e => update('purchase_price', e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty expires</label>
                  <input
                    type="date"
                    value={form.warranty_expiry}
                    onChange={e => update('warranty_expiry', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty provider</label>
                  <input
                    type="text"
                    value={form.warranty_provider}
                    onChange={e => update('warranty_provider', e.target.value)}
                    placeholder="e.g. Samsung, Home Warranty of America"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => update('notes', e.target.value)}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                {suggestedTasks.length > 0 && (
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-slate-700">Suggested maintenance tasks</p>
                      <span className="text-xs text-slate-400">added to schedule on save</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {suggestedTasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-medium text-slate-800">{task.title}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                task.priority === 'low' ? 'bg-slate-100 text-slate-600' :
                                'bg-blue-100 text-blue-700'
                              }`}>{task.priority}</span>
                              <span className="text-xs text-slate-400">in {task.monthsFromNow}mo</span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSuggestedTasks(prev => prev.filter((_, j) => j !== i))}
                            className="flex-shrink-0 text-slate-300 hover:text-slate-500 mt-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
