'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Phone, Mail, Building2, ScanLine, Loader2, Users } from 'lucide-react'
import { type ServiceProvider } from '@/lib/types'

interface ProvidersSectionProps {
  applianceId: string
  homeId: string
  providers: ServiceProvider[]
  canManage: boolean
}

export default function ProvidersSection({
  applianceId, homeId, providers, canManage
}: ProvidersSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', notes: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    if (field === 'name') setNameError(false)
  }

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/homes/${homeId}/appliances/${applianceId}/providers/scan`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      setForm(p => ({
        ...p,
        name: data.name ?? p.name,
        company: data.company ?? p.company,
        phone: data.phone ?? p.phone,
        email: data.email ?? p.email,
      }))
    } catch {
      // ignore scan errors
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setNameError(true)
      return
    }
    setLoading(true)
    await supabase.from('service_providers').insert({
      appliance_id: applianceId,
      home_id: homeId,
      name: form.name.trim(),
      company: form.company || null,
      phone: form.phone || null,
      email: form.email || null,
      notes: form.notes || null,
    })
    setShowForm(false)
    setNameError(false)
    setForm({ name: '', company: '', phone: '', email: '', notes: '' })
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('service_providers').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9D0]">
        <div>
          <h2 className="font-semibold text-[#2F3437]">Service Providers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {providers.length === 0 ? 'No providers yet' : `${providers.length} provider${providers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
          >
            <Plus size={15} />
            Add Provider
          </button>
        )}
      </div>

      {showForm && (
        <div className="px-6 py-5 border-b border-[#E0D9D0] bg-[#F4F1EA]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-600">Provider details</p>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleScan}
                  className="hidden"
                  id="scan-invoice"
                />
                <label
                  htmlFor="scan-invoice"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#5B6C8F] hover:text-[#4a5c77] cursor-pointer transition-colors"
                >
                  {scanning ? <Loader2 size={13} className="animate-spin" /> : <ScanLine size={13} />}
                  {scanning ? 'Scanning...' : 'Scan invoice'}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Contact name"
                  className={`w-full px-3 py-2 rounded-lg border text-[#2F3437] text-sm focus:outline-none focus:ring-2 ${
                    nameError ? 'border-red-400 focus:ring-red-300' : 'border-[#C8BFB2] focus:ring-[#5B6C8F]'
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-red-600 mt-1">Name is required</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => update('company', e.target.value)}
                  placeholder="Business name"
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-[#F4F1EA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : 'Save Provider'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {providers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Users size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No service providers yet.</p>
            {canManage && (
              <p className="text-xs text-slate-400 mt-1">Add contractors, technicians, and vendors you use for this item.</p>
            )}
          </div>
        ) : (
          providers.map(p => (
            <div key={p.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2F3437]">{p.name}</p>
                  {p.company && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 size={12} className="text-slate-400" />
                      <p className="text-xs text-slate-600">{p.company}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 text-xs text-[#5B6C8F] hover:underline">
                        <Phone size={11} />
                        {p.phone}
                      </a>
                    )}
                    {p.email && (
                      <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 text-xs text-[#5B6C8F] hover:underline">
                        <Mail size={11} />
                        {p.email}
                      </a>
                    )}
                  </div>
                  {p.notes && <p className="text-xs text-slate-500 mt-1 italic">{p.notes}</p>}
                </div>
                {canManage && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
