import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react'
import CalendarView from '@/components/calendar/calendar-view'
import CalendarTaskList from '@/components/calendar/calendar-task-list'

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ homeId: string }>
}) {
  const { homeId } = await params
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

  const [{ data: home }, { data: tasks }] = await Promise.all([
    supabase.from('homes').select('id, name').eq('id', homeId).single(),
    supabase
      .from('scheduled_tasks')
      .select(`
        *,
        appliance:appliances(id, name, room_id, rooms(id, name))
      `)
      .eq('home_id', homeId)
      .order('due_date'),
  ])

  if (!home) notFound()

  const today = new Date().toISOString().split('T')[0]
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const allTasks = tasks || []
  const pending = allTasks.filter(t => ['pending', 'in_progress'].includes(t.status))
  const overdue = pending.filter(t => t.due_date < today)
  const upcoming = pending.filter(t => t.due_date >= today && t.due_date <= thirtyDays)
  const future = pending.filter(t => t.due_date > thirtyDays)
  const completed = allTasks.filter(t => t.status === 'completed')

  const canManage = ['owner', 'manager'].includes(membership.role)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Calendar</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Maintenance Calendar</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xl sm:text-2xl font-bold text-red-700">{overdue.length}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-red-700">Overdue</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xl sm:text-2xl font-bold text-amber-700">{upcoming.length}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-amber-700">Due this month</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xl sm:text-2xl font-bold text-green-700">{completed.length}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-green-700">Completed</p>
        </div>
      </div>

      {/* Calendar visual */}
      <CalendarView tasks={allTasks} homeId={homeId} userId={user.id} />

      {/* Task lists */}
      <div className="mt-8">
        {allTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200">
            <Calendar size={40} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No tasks scheduled</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Visit an appliance and use AI suggestions or add tasks manually to start building your maintenance schedule.
            </p>
          </div>
        ) : (
          <CalendarTaskList
            overdue={overdue}
            upcoming={upcoming}
            future={future}
            completed={completed.slice(0, 10)}
            homeId={homeId}
            canManage={canManage}
          />
        )}
      </div>
    </div>
  )
}
