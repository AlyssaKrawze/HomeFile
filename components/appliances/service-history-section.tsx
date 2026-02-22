'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X, ChevronDown, ChevronUp, Wrench, DollarSign } from 'lucide-react'
import { SERVICE_TYPE_LABELS, type ServiceRecord, type ServiceType } from '@/lib/types'

interface ServiceHistorySectionProps {
  applianceId: string
  homeId: string
  serviceRecords: ServiceRecord[]
  canManage: boolean
  userId: string
}

export default function ServiceHistorySection({
  applianceId, homeId, serviceRecords, canManage, userId
}: ServiceHistorySectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_type: 'maintenance' as ServiceType,
    description: '',
    cost: '',
    provider: '',
    provider_contact: '',
    technician: '',
    notes: '',
    next_service_date: '',
  })
  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim()) return
    setLoading(true)

    await supabase.from('service_records').insert({
      appliance_id: applianceId,
      home_id: homeId,
      service_date: form.service_date,
      service_type: form.service_type,
      description: form.description.trim(),
      cost: form.cost ? parseFloat(form.cost) : null,
      provider: form.provider || null,
      provider_contact: form.provider_contact || null,
      technician: form.technician || null,
      notes: form.notes || null,
      next_service_date: form.next_service_date || null,
      created_by: userId,
    })

    setShowForm(false)
    setForm({
      service_date: new Date().toISOString().split('T')[0],
      service_type: 'maintenance',
      description: '',
      cost: '',
      provider: '',
      provider_contact: '',
      technician: '',
      notes: '',
      next_service_date: '',
    })
    setLoading(false)
    router.refresh()
  }

  const serviceTypeColors: Record<ServiceType, string> = {
    maintenance: 'bg-blue-100 text-blue-700',
    repair: 'bg-red-100 text-red-700',
    inspection: 'bg-purple-100 text-purple-700',
    replacement: 'bg-orange-100 text-orange-700',
    installation: 'bg-green-100 text-green-700',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-semibold text-slate-900">Service History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {serviceRecords.length === 0 ? 'No records yet' : `${serviceRecords.length} record${serviceRecords.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            <Plus size={15} />
            Add Record
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={form.service_date}
                  onChange={e => update('service_date', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type *</label>
                <select
                  value={form.service_type}
                  onChange={e => update('service_type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {Object.entries(SERVICE_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="What was done?"
                required
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Provider</label>
                <input
                  type="text"
                  value={form.provider}
                  onChange={e => update('provider', e.target.value)}
                  placeholder="Company name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cost ($)</label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={e => update('cost', e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Technician</label>
                <input
                  type="text"
                  value={form.technician}
                  onChange={e => update('technician', e.target.value)}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Next service date</label>
                <input
                  type="date"
                  value={form.next_service_date}
                  onChange={e => update('next_service_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !form.description.trim()}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Service records list */}
      <div className="divide-y divide-slate-100">
        {serviceRecords.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Wrench size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No service records yet.</p>
            {canManage && (
              <p className="text-xs text-slate-400 mt-1">Add the first record to start tracking history.</p>
            )}
          </div>
        ) : (
          serviceRecords.map((record) => {
            const isExpanded = expanded === record.id
            return (
              <div key={record.id} className="px-6 py-4">
                <button
                  onClick={() => setExpanded(isExpanded ? null : record.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-teal-400 flex-shrink-0 mt-2" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${serviceTypeColors[record.service_type]}`}>
                            {SERVICE_TYPE_LABELS[record.service_type]}
                          </span>
                          <span className="text-sm font-medium text-slate-800">
                            {record.description.length > 60
                              ? record.description.slice(0, 60) + '...'
                              : record.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>
                            {new Date(record.service_date).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                          {record.provider && <span>· {record.provider}</span>}
                          {record.cost !== null && (
                            <span className="flex items-center gap-0.5">
                              · ${Number(record.cost).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate-400 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 ml-5 pl-3 border-l-2 border-slate-100 flex flex-col gap-2">
                    {record.technician && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Technician:</span> {record.technician}
                      </p>
                    )}
                    {record.provider_contact && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Contact:</span> {record.provider_contact}
                      </p>
                    )}
                    {record.description.length > 60 && (
                      <p className="text-xs text-slate-600">{record.description}</p>
                    )}
                    {record.notes && (
                      <p className="text-xs text-slate-500 italic">{record.notes}</p>
                    )}
                    {record.next_service_date && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 w-fit">
                        <span>Next service:</span>
                        <span className="font-medium">
                          {new Date(record.next_service_date).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
