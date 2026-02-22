'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertTriangle, Trash2 } from 'lucide-react'
import { PRIORITY_LABELS, type TaskPriority } from '@/lib/types'

interface Task {
  id: string
  title: string
  due_date: string
  status: string
  priority: string
  source: string
  completed_at: string | null
  appliance: {
    id: string
    name: string
    room_id: string
    rooms: { id: string; name: string } | null
  } | null
}

interface CalendarTaskListProps {
  overdue: Task[]
  upcoming: Task[]
  future: Task[]
  completed: Task[]
  homeId: string
  canManage: boolean
}

export default function CalendarTaskList({
  overdue, upcoming, future, completed, homeId, canManage
}: CalendarTaskListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function deleteTask(taskId: string) {
    setDeleting(taskId)
    await supabase.from('scheduled_tasks').delete().eq('id', taskId)
    setDeleting(null)
    router.refresh()
  }

  function TaskRow({ task, variant }: { task: Task; variant: 'overdue' | 'upcoming' | 'future' | 'completed' }) {
    const priority = PRIORITY_LABELS[task.priority as TaskPriority]
    const appliance = task.appliance
    const room = appliance?.rooms ?? null

    return (
      <div className="px-6 py-4 flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {variant === 'completed' ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : variant === 'overdue' ? (
            <AlertTriangle size={18} className="text-red-500" />
          ) : (
            <Clock size={18} className="text-amber-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${variant === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
              {task.title}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
            {task.source === 'ai' && (
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">AI</span>
            )}
          </div>
          {appliance && (
            <Link
              href={`/dashboard/homes/${homeId}/rooms/${appliance.room_id}/appliances/${appliance.id}`}
              className="text-xs text-teal-600 hover:text-teal-700 mt-0.5 block"
            >
              {appliance.name}
              {room ? ` · ${room.name}` : ''}
            </Link>
          )}
          <p className={`text-xs mt-0.5 ${variant === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
            {variant === 'completed' && task.completed_at
              ? `Completed ${new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : `Due ${new Date(task.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
            }
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => deleteTask(task.id)}
            disabled={deleting === task.id}
            className="flex-shrink-0 mt-0.5 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    )
  }

  const headerColors = {
    overdue: { border: 'border-red-200', text: 'text-red-700' },
    upcoming: { border: 'border-amber-200', text: 'text-amber-700' },
    future: { border: 'border-slate-200', text: 'text-slate-700' },
    completed: { border: 'border-green-200', text: 'text-green-700' },
  }

  function TaskSection({ title, tasks, variant }: {
    title: string
    tasks: Task[]
    variant: 'overdue' | 'upcoming' | 'future' | 'completed'
  }) {
    if (tasks.length === 0) return null
    const colors = headerColors[variant]
    return (
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className={`px-6 py-4 border-b ${colors.border}`}>
          <h2 className={`font-semibold ${colors.text}`}>
            {title} <span className="font-normal opacity-60">({tasks.length})</span>
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {tasks.map(task => (
            <TaskRow key={task.id} task={task} variant={variant} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TaskSection title="Overdue" tasks={overdue} variant="overdue" />
      <TaskSection title="Due this month" tasks={upcoming} variant="upcoming" />
      <TaskSection title="Upcoming" tasks={future} variant="future" />
      <TaskSection title="Completed" tasks={completed} variant="completed" />
    </div>
  )
}
