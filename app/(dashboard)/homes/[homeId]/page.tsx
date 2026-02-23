import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ChevronRight, AlertTriangle, CheckCircle2, Clock, Wrench, BookOpen } from 'lucide-react'
import { ROOM_CATEGORIES, type PermissionCategory } from '@/lib/types'
import AddRoomModal from '@/components/rooms/add-room-modal'

export default async function HomeOverviewPage({
  params,
}: {
  params: Promise<{ homeId: string }>
}) {
  const { homeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify membership
  const { data: membership } = await supabase
    .from('home_members')
    .select('role')
    .eq('home_id', homeId)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  // Fetch home details
  const { data: home } = await supabase
    .from('homes')
    .select('*')
    .eq('id', homeId)
    .single()

  if (!home) notFound()

  // Fetch rooms with appliance counts
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('home_id', homeId)
    .order('floor')
    .order('name')

  // Fetch appliance counts per room
  const { data: applianceCounts } = await supabase
    .from('appliances')
    .select('room_id')
    .eq('home_id', homeId)

  // Fetch pending task counts
  const { data: pendingTasks } = await supabase
    .from('scheduled_tasks')
    .select('appliance_id, due_date, priority')
    .eq('home_id', homeId)
    .in('status', ['pending', 'in_progress'])

  const countsByRoom = (applianceCounts || []).reduce<Record<string, number>>((acc, a) => {
    acc[a.room_id] = (acc[a.room_id] || 0) + 1
    return acc
  }, {})

  // Count upcoming tasks (next 30 days) and overdue
  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const allPending = pendingTasks || []
  const overdueTasks = allPending.filter(t => t.due_date < today)
  const upcomingTasks = allPending.filter(t => t.due_date >= today && t.due_date <= thirtyDays)
  const totalItems = Object.values(countsByRoom).reduce((a, b) => a + b, 0)

  const canManage = ['owner', 'manager'].includes(membership.role)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600 transition-colors">My Homes</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">{home.name}</span>
      </div>

      {/* Home header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{home.name}</h1>
          {(home.address || home.city) && (
            <p className="text-slate-500 text-sm mt-1">
              {[home.address, home.city, home.state, home.zip].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        {canManage && <AddRoomModal homeId={homeId} />}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          label="Rooms"
          value={(rooms || []).length}
          icon="🏠"
          color="text-slate-700"
          bg="bg-slate-50"
        />
        <StatCard
          label="Items tracked"
          value={totalItems}
          icon="📦"
          color="text-blue-700"
          bg="bg-blue-50"
        />
        {overdueTasks.length > 0 ? (
          <StatCard
            label="Overdue"
            value={overdueTasks.length}
            icon="⚠️"
            color="text-red-700"
            bg="bg-red-50"
            href={`/dashboard/homes/${homeId}/calendar`}
          />
        ) : (
          <StatCard
            label="All caught up"
            value={0}
            icon="✅"
            color="text-green-700"
            bg="bg-green-50"
          />
        )}
        <StatCard
          label="Due this month"
          value={upcomingTasks.length}
          icon="📅"
          color="text-amber-700"
          bg="bg-amber-50"
          href={`/dashboard/homes/${homeId}/calendar`}
        />
      </div>

      {/* Rooms grid */}
      {(rooms || []).length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-700">Rooms & Areas</h2>
            <Link
              href={`/dashboard/homes/${homeId}/inventory`}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View all items
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(rooms || []).map((room) => {
              const cat = ROOM_CATEGORIES[room.category as PermissionCategory] || ROOM_CATEGORIES.other
              const appCount = countsByRoom[room.id] || 0
              return (
                <Link
                  key={room.id}
                  href={`/dashboard/homes/${homeId}/rooms/${room.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${cat.bgColor} flex items-center justify-center text-2xl`}>
                      {cat.icon}
                    </div>
                    {appCount > 0 && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                        {appCount} item{appCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors text-sm">
                    {room.name}
                  </h3>
                  <p className={`text-xs font-medium mt-0.5 ${cat.color}`}>{cat.label}</p>
                  {room.floor > 1 && (
                    <p className="text-xs text-slate-400 mt-0.5">Floor {room.floor}</p>
                  )}
                  {appCount === 0 && (
                    <p className="text-xs text-slate-400 mt-3 italic">No items yet</p>
                  )}
                </Link>
              )
            })}

            {/* Add room card */}
            {canManage && <AddRoomCard homeId={homeId} />}
          </div>
        </>
      ) : (
        <NoRoomsState homeId={homeId} canManage={canManage} />
      )}

      {/* Quick links */}
      {(rooms || []).length > 0 && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={`/api/homes/${homeId}/binder`}
            download
            className="md:col-span-2 flex items-center gap-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 hover:border-teal-400 hover:shadow-sm transition-all p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <BookOpen size={20} className="text-teal-700" />
            </div>
            <div>
              <p className="font-semibold text-teal-900 text-sm">Download Home Binder</p>
              <p className="text-xs text-teal-700 mt-0.5">
                PDF with all appliances, specs, maintenance notes, and disaster plans
              </p>
            </div>
            <ChevronRight size={16} className="text-teal-400 ml-auto" />
          </a>
          <Link
            href={`/dashboard/homes/${homeId}/calendar`}
            className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Clock size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Maintenance Calendar</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {upcomingTasks.length} task{upcomingTasks.length !== 1 ? 's' : ''} coming up
              </p>
            </div>
            <ChevronRight size={16} className="text-slate-400 ml-auto" />
          </Link>

          <Link
            href={`/dashboard/homes/${homeId}/inventory`}
            className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Wrench size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Full Inventory</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalItems} item{totalItems !== 1 ? 's' : ''} tracked
              </p>
            </div>
            <ChevronRight size={16} className="text-slate-400 ml-auto" />
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label, value, icon, color, bg, href
}: {
  label: string
  value: number
  icon: string
  color: string
  bg: string
  href?: string
}) {
  const content = (
    <div className={`${bg} rounded-2xl p-4 border border-transparent hover:border-slate-200 transition-colors`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

function AddRoomCard({ homeId }: { homeId: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-300 flex items-center justify-center min-h-32 transition-colors">
      <AddRoomModal homeId={homeId} trigger="card" />
    </div>
  )
}

function NoRoomsState({ homeId, canManage }: { homeId: string; canManage: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 text-4xl">
        🏠
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Start adding rooms</h2>
      <p className="text-slate-500 max-w-md mb-8 text-sm leading-relaxed">
        Add the rooms in your home, then track appliances, schedule maintenance,
        and store documents for each one.
      </p>
      {canManage && <AddRoomModal homeId={homeId} />}
    </div>
  )
}
