'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wrench, ShieldCheck, ShieldAlert, Clock, ArrowUpDown, Trash2, AlertTriangle } from 'lucide-react'
import AddApplianceModal from '@/components/appliances/add-appliance-modal'

type SortOption = 'name_asc' | 'name_desc' | 'added_newest' | 'added_oldest' | 'category' | 'warranty_soonest'

interface Appliance {
  id: string
  name: string
  brand: string | null
  model: string | null
  category: string | null
  warranty_expiry: string | null
  created_at: string
  home_id: string
}

interface PendingTask {
  due_date: string
  priority: string
  status: string
}

interface ApplianceSortGridProps {
  appliances: Appliance[]
  homeId: string
  roomId: string
  roomCategory: string
  canManage: boolean
  lastServiceByAppliance: Record<string, string>
  tasksByAppliance: Record<string, PendingTask[]>
}

function getApplianceEmoji(hint: string): string {
  const h = hint.toLowerCase()
  if (h.includes('refriger') || h.includes('fridge')) return '🧊'
  if (h.includes('dishwasher')) return '🍽️'
  if (h.includes('oven') || h.includes('range') || h.includes('stove')) return '🔥'
  if (h.includes('microwave')) return '📡'
  if (h.includes('washer') || h.includes('washing')) return '🫧'
  if (h.includes('dryer')) return '🌀'
  if (h.includes('hvac') || h.includes('furnace') || h.includes('heater') || h.includes('heat')) return '🌡️'
  if (h.includes('ac') || h.includes('air condition') || h.includes('cool')) return '❄️'
  if (h.includes('water heater')) return '💧'
  if (h.includes('toilet')) return '🚽'
  if (h.includes('shower') || h.includes('bath')) return '🚿'
  if (h.includes('window')) return '🪟'
  if (h.includes('door')) return '🚪'
  if (h.includes('fireplace')) return '🔥'
  if (h.includes('garage')) return '🚗'
  if (h.includes('generator')) return '⚡'
  if (h.includes('water softener') || h.includes('filter')) return '💧'
  if (h.includes('pool')) return '🏊'
  if (h.includes('tv') || h.includes('television')) return '📺'
  return '🔧'
}

function sortAppliances(appliances: Appliance[], sort: SortOption): Appliance[] {
  const sorted = [...appliances]
  switch (sort) {
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'added_newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'added_oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'category':
      return sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
    case 'warranty_soonest':
      return sorted.sort((a, b) => {
        if (!a.warranty_expiry && !b.warranty_expiry) return 0
        if (!a.warranty_expiry) return 1
        if (!b.warranty_expiry) return -1
        return new Date(a.warranty_expiry).getTime() - new Date(b.warranty_expiry).getTime()
      })
  }
}

export default function ApplianceSortGrid({
  appliances: initialAppliances,
  homeId,
  roomId,
  roomCategory,
  canManage,
  lastServiceByAppliance,
  tasksByAppliance,
}: ApplianceSortGridProps) {
  const [sort, setSort] = useState<SortOption>('name_asc')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [appliances, setAppliances] = useState(initialAppliances)
  const router = useRouter()
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    const { error } = await supabase
      .from('appliances')
      .delete()
      .eq('id', deleteTarget.id)
      .eq('home_id', homeId)
    if (error) {
      setDeleteError(error.message)
      setDeleteLoading(false)
      return
    }
    setAppliances(prev => prev.filter(a => a.id !== deleteTarget.id))
    setDeleteTarget(null)
    router.refresh()
  }

  const sorted = sortAppliances(appliances, sort)

  return (
    <div>
      {/* Sort controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-700">Items</h2>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-slate-400" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="text-xs text-slate-600 border border-[#C8BFB2] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
          >
            <option value="name_asc">Name (A–Z)</option>
            <option value="name_desc">Name (Z–A)</option>
            <option value="added_newest">Date Added (Newest)</option>
            <option value="added_oldest">Date Added (Oldest)</option>
            <option value="category">Category</option>
            <option value="warranty_soonest">Warranty Expiry (Soonest)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(appliance => {
          const lastService = lastServiceByAppliance[appliance.id]
          const tasks = tasksByAppliance[appliance.id] || []
          const hasOverdue = tasks.some(t => t.due_date < today)
          const hasUrgent = tasks.some(t => t.priority === 'urgent')

          const warrantyExpiry = appliance.warranty_expiry
          const warrantyDate = warrantyExpiry ? new Date(warrantyExpiry) : null
          const warrantyStatus = !warrantyDate
            ? 'unknown'
            : warrantyDate < now
            ? 'expired'
            : warrantyDate < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
            ? 'expiring'
            : 'active'

          return (
            <div key={appliance.id} className="relative group">
              <Link
                href={`/dashboard/homes/${homeId}/rooms/${roomId}/appliances/${appliance.id}`}
                className="group/card bg-white rounded-2xl border border-[#C8BFB2] hover:border-[#9ab0c4] hover:shadow-md transition-all duration-200 p-5 block"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                    {getApplianceEmoji(appliance.category || appliance.name)}
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {hasOverdue && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        Overdue
                      </span>
                    )}
                    {hasUrgent && !hasOverdue && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        Urgent
                      </span>
                    )}
                    {tasks.length > 0 && !hasOverdue && !hasUrgent && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-[#2F3437] group-hover/card:text-[#5B6C8F] transition-colors">
                  {appliance.name}
                </h3>
                {(appliance.brand || appliance.model) && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {[appliance.brand, appliance.model].filter(Boolean).join(' · ')}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    {warrantyStatus === 'active' && (
                      <>
                        <ShieldCheck size={13} className="text-green-500" />
                        <span className="text-xs text-green-700">
                          Warranty until {new Date(warrantyExpiry!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </>
                    )}
                    {warrantyStatus === 'expiring' && (
                      <>
                        <ShieldAlert size={13} className="text-amber-500" />
                        <span className="text-xs text-amber-700">Warranty expiring soon</span>
                      </>
                    )}
                    {warrantyStatus === 'expired' && (
                      <>
                        <ShieldAlert size={13} className="text-slate-400" />
                        <span className="text-xs text-slate-400">Warranty expired</span>
                      </>
                    )}
                  </div>
                  {lastService && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span className="text-xs text-slate-500">
                        Serviced {new Date(lastService).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {!lastService && (
                    <div className="flex items-center gap-1.5">
                      <Wrench size={13} className="text-slate-300" />
                      <span className="text-xs text-slate-400 italic">No service history</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Delete button — overlays card top-right corner */}
              {canManage && (
                <button
                  onClick={e => { e.preventDefault(); setDeleteTarget({ id: appliance.id, name: appliance.name }) }}
                  className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                  title="Delete item"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )
        })}

        {canManage && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#C8BFB2] hover:border-[#9ab0c4] flex items-center justify-center min-h-40 transition-colors">
            <AddApplianceModal homeId={homeId} roomId={roomId} roomCategory={roomCategory} trigger="card" />
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setDeleteTarget(null); setDeleteError(null) }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2F3437]">Delete &ldquo;{deleteTarget.name}&rdquo;?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will permanently delete the item and all its service records, tasks, and documents. This cannot be undone.
                </p>
              </div>
            </div>
            {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
