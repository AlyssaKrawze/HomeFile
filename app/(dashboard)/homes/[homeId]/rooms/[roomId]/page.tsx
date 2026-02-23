import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Plus, Wrench, ShieldCheck, ShieldAlert, Clock } from 'lucide-react'
import { ROOM_CATEGORIES, type PermissionCategory } from '@/lib/types'
import AddApplianceModal from '@/components/appliances/add-appliance-modal'

export default async function RoomPage({
  params,
}: {
  params: Promise<{ homeId: string; roomId: string }>
}) {
  const { homeId, roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('home_members')
    .select('role')
    .eq('home_id', homeId)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  const [{ data: home }, { data: room }, { data: appliances }] = await Promise.all([
    supabase.from('homes').select('id, name').eq('id', homeId).single(),
    supabase.from('rooms').select('*').eq('id', roomId).eq('home_id', homeId).single(),
    supabase.from('appliances').select('*').eq('room_id', roomId).order('name'),
  ])

  if (!home || !room) notFound()

  // Fetch last service dates and pending tasks per appliance
  const applianceIds = (appliances || []).map(a => a.id)
  const [{ data: lastServices }, { data: pendingTasks }] = await Promise.all([
    applianceIds.length > 0
      ? supabase
          .from('service_records')
          .select('appliance_id, service_date')
          .in('appliance_id', applianceIds)
          .order('service_date', { ascending: false })
      : Promise.resolve({ data: [] }),
    applianceIds.length > 0
      ? supabase
          .from('scheduled_tasks')
          .select('appliance_id, due_date, priority, status')
          .in('appliance_id', applianceIds)
          .in('status', ['pending', 'in_progress'])
      : Promise.resolve({ data: [] }),
  ])

  const lastServiceByAppliance = (lastServices || []).reduce<Record<string, string>>((acc, s) => {
    if (!acc[s.appliance_id]) acc[s.appliance_id] = s.service_date
    return acc
  }, {})

  type PendingTask = { appliance_id: string; due_date: string; priority: string; status: string }
  const tasksByAppliance = (pendingTasks || []).reduce<Record<string, PendingTask[]>>((acc, t) => {
    if (!acc[t.appliance_id]) acc[t.appliance_id] = []
    acc[t.appliance_id]!.push(t as PendingTask)
    return acc
  }, {})

  const cat = ROOM_CATEGORIES[room.category as PermissionCategory] || ROOM_CATEGORIES.other
  const canManage = ['owner', 'manager'].includes(membership.role)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">{room.name}</span>
      </div>

      {/* Room header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center text-3xl`}>
            {cat.icon}
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#2F3437]">{room.name}</h1>
            <p className={`text-sm font-medium mt-0.5 ${cat.color}`}>{cat.label}</p>
            {room.description && <p className="text-sm text-slate-500 mt-0.5">{room.description}</p>}
          </div>
        </div>
        {canManage && <AddApplianceModal homeId={homeId} roomId={roomId} />}
      </div>

      {/* Appliance grid */}
      {(appliances || []).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(appliances || []).map((appliance) => {
            const lastService = lastServiceByAppliance[appliance.id]
            const tasks = tasksByAppliance[appliance.id] || []
            const hasOverdue = tasks.some(t => t.due_date < today)
            const hasUrgent = tasks.some(t => t.priority === 'urgent')

            // Warranty status
            const warrantyExpiry = appliance.warranty_expiry
            const warrantyDate = warrantyExpiry ? new Date(warrantyExpiry) : null
            const now = new Date()
            const warrantyStatus = !warrantyDate
              ? 'unknown'
              : warrantyDate < now
              ? 'expired'
              : warrantyDate < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
              ? 'expiring'
              : 'active'

            return (
              <Link
                key={appliance.id}
                href={`/dashboard/homes/${homeId}/rooms/${roomId}/appliances/${appliance.id}`}
                className="group bg-white rounded-2xl border border-[#C8BFB2] hover:border-[#9ab0c4] hover:shadow-md transition-all duration-200 p-5"
              >
                {/* Header */}
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

                <h3 className="font-semibold text-[#2F3437] group-hover:text-[#5B6C8F] transition-colors">
                  {appliance.name}
                </h3>
                {(appliance.brand || appliance.model) && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {[appliance.brand, appliance.model].filter(Boolean).join(' · ')}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  {/* Warranty badge */}
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

                  {/* Last service */}
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
            )
          })}

          {/* Add appliance card */}
          {canManage && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#C8BFB2] hover:border-[#9ab0c4] flex items-center justify-center min-h-40 transition-colors">
              <AddApplianceModal homeId={homeId} roomId={roomId} trigger="card" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 text-4xl">
            {cat.icon}
          </div>
          <h2 className="text-xl font-semibold text-[#2F3437] mb-2">
            No items in {room.name} yet
          </h2>
          <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
            Add appliances, systems, or fixtures to start tracking service history and scheduling maintenance.
          </p>
          {canManage && <AddApplianceModal homeId={homeId} roomId={roomId} />}
        </div>
      )}
    </div>
  )
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
