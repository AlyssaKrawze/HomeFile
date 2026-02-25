import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ROOM_CATEGORIES, type PermissionCategory } from '@/lib/types'
import AddApplianceModal from '@/components/appliances/add-appliance-modal'
import RoomNotesSection from '@/components/rooms/room-notes-section'
import RoomAttachmentsSection from '@/components/rooms/room-attachments-section'
import ApplianceSortGrid from '@/components/appliances/appliance-sort-grid'

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

  const [{ data: home }, { data: room }, { data: appliances }, { data: roomAttachments }] = await Promise.all([
    supabase.from('homes').select('id, name').eq('id', homeId).single(),
    supabase.from('rooms').select('*').eq('id', roomId).eq('home_id', homeId).single(),
    supabase.from('appliances').select('*').eq('room_id', roomId).order('name'),
    supabase.from('room_attachments').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
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
        {canManage && <AddApplianceModal homeId={homeId} roomId={roomId} roomCategory={room.category} />}
      </div>

      {/* Room Notes + Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RoomNotesSection
          roomId={roomId}
          homeId={homeId}
          room={{
            paint_color: room.paint_color ?? null,
            floor_type: room.floor_type ?? null,
            dimensions: room.dimensions ?? null,
            room_notes: room.room_notes ?? null,
          }}
          canManage={canManage}
        />
        <RoomAttachmentsSection
          roomId={roomId}
          homeId={homeId}
          attachments={roomAttachments || []}
          canManage={canManage}
        />
      </div>

      {/* Appliance grid */}
      {(appliances || []).length > 0 ? (
        <ApplianceSortGrid
          appliances={appliances || []}
          homeId={homeId}
          roomId={roomId}
          roomCategory={room.category}
          canManage={canManage}
          lastServiceByAppliance={lastServiceByAppliance}
          tasksByAppliance={tasksByAppliance}
        />
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
          {canManage && <AddApplianceModal homeId={homeId} roomId={roomId} roomCategory={room.category} />}
        </div>
      )}
    </div>
  )
}

