'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertTriangle, Trash2, Check, Loader2 } from 'lucide-react'
import { PRIORITY_LABELS, type TaskPriority } from '@/lib/types'

interface Task {
  id: string
  title: string
  due_date: string
  status: string
  priority: string
  source: string
  completed_at: string | null
  assigned_to: string | null
  assignee: { id: string; full_name: string | null; email: string | null } | null
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
  userId: string
}

export default function CalendarTaskList({
  overdue, upcoming, future, completed, homeId, canManage, userId
}: CalendarTaskListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function deleteTask(taskId: string) {
    setDeleting(taskId)
    await supabase.from('scheduled_tasks').delete().eq('id', taskId)
    setDeleting(null)
    router.refresh()
  }

  async function markComplete(taskId: string) {
    setCompleting(taskId)
    await supabase
      .from('scheduled_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: userId,
      })
      .eq('id', taskId)
    setCompleting(null)
    router.refresh()
  }

  function TaskRow({ task, variant }: { task: Task; variant: 'overdue' | 'upcoming' | 'future' | 'completed' }) {
    const priority = PRIORITY_LABELS[task.priority as TaskPriority]
    const appliance = task.appliance
    const room = appliance?.rooms ?? null
    const canComplete = canManage || task.assigned_to === userId
    const isCompleting = completing === task.id
    const isDeleting = deleting === task.id

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
            <span className={`text-sm font-medium ${variant === 'completed' ? 'text-slate-500 line-through' : 'text-[#2F3437]'}`}>
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
              className="text-xs text-[#5B6C8F] hover:text-[#4a5c77] mt-0.5 block"
            >
              {appliance.name}
              {room ? ` · ${room.name}` : ''}
            </Link>
          )}
          {task.assigned_to && task.assignee && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-4 h-4 rounded-full bg-[#dce4ef] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-[#4a5c77]">
                  {(task.assignee.full_name || task.assignee.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {task.assigned_to === userId
                  ? 'Assigned to you'
                  : `Assigned to ${task.assignee.full_name || task.assignee.email}`}
              </span>
            </div>
          )}
          <p className={`text-xs mt-0.5 ${variant === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
            {variant === 'completed' && task.completed_at
              ? `Completed ${new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : `Due ${new Date(task.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {canComplete && variant !== 'completed' && (
            <button
              onClick={() => markComplete(task.id)}
              disabled={isCompleting}
              className="text-slate-300 hover:text-green-500 transition-colors disabled:opacity-50"
              title="Mark complete"
            >
              {isCompleting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
            </button>
          )}
          {canManage && (
            <button
              onClick={() => deleteTask(task.id)}
              disabled={isDeleting}
              className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete task"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
      </div>
    )
  }

  const headerColors = {
    overdue: { border: 'border-red-200', text: 'text-red-700' },
    upcoming: { border: 'border-amber-200', text: 'text-amber-700' },
    future: { border: 'border-[#C8BFB2]', text: 'text-slate-700' },
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
      <div className="bg-white rounded-2xl border border-[#C8BFB2]">
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
