'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CalendarPlus, CheckCircle2, Clock, AlertTriangle, Check, Trash2, Loader2 } from 'lucide-react'
import { PRIORITY_LABELS, type ScheduledTask, type TaskPriority, type UserRole, type TaskAssigneeMember } from '@/lib/types'

interface ScheduledTasksSectionProps {
  applianceId: string
  homeId: string
  tasks: ScheduledTask[]
  canManage: boolean
  userId: string
  userRole: UserRole
  members: TaskAssigneeMember[]
}

export default function ScheduledTasksSection({
  applianceId, homeId, tasks, canManage, userId, userRole, members
}: ScheduledTasksSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [completing, setCompleting] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as TaskPriority,
    assigned_to: '',
  })
  const router = useRouter()
  const supabase = createClient()

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.due_date) return
    setLoading(true)

    await supabase.from('scheduled_tasks').insert({
      home_id: homeId,
      appliance_id: applianceId,
      title: form.title.trim(),
      description: form.description || null,
      due_date: form.due_date,
      priority: form.priority,
      source: 'manual',
      created_by: userId,
      assigned_to: form.assigned_to || null,
    })

    setShowForm(false)
    setForm({ title: '', description: '', due_date: '', priority: 'medium', assigned_to: '' })
    setLoading(false)
    router.refresh()
  }

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

  const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const completed = tasks.filter(t => t.status === 'completed')
  const today = new Date().toISOString().split('T')[0]

  // Members available in the assign-to dropdown
  const assignableMembers = userRole === 'limited'
    ? members.filter(m => m.user_id === userId)
    : members

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9D0]">
        <div>
          <h2 className="font-semibold text-[#2F3437]">Maintenance Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {pending.length === 0 ? 'No pending tasks' : `${pending.length} pending`}
            {completed.length > 0 && ` · ${completed.length} completed`}
          </p>
        </div>
        {(canManage || userRole === 'limited') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
          >
            <CalendarPlus size={15} />
            Add to Calendar
          </button>
        )}
      </div>

      {/* Add-to-calendar form */}
      {showForm && (
        <div className="px-6 py-4 border-b border-[#E0D9D0] bg-[#F4F1EA]">
          <p className="text-xs text-slate-500 mb-3">
            This task will appear on your Maintenance Calendar.
          </p>
          <form onSubmit={handleAddTask} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Task name *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Replace HVAC filter"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] bg-white"
                >
                  {Object.entries(PRIORITY_LABELS).map(([val, meta]) => (
                    <option key={val} value={val}>{meta.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {assignableMembers.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign to</label>
                <select
                  value={form.assigned_to}
                  onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] bg-white"
                >
                  <option value="">Unassigned</option>
                  {assignableMembers.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.full_name || m.email || m.user_id}
                      {m.user_id === userId ? ' (you)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-[#F4F1EA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CalendarPlus size={14} />
                )}
                {loading ? 'Adding...' : 'Add to Calendar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Clock size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No tasks scheduled</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a task manually or use AI suggestions below.
            </p>
          </div>
        ) : (
          <>
            {/* ── Pending tasks ─────────────────────────── */}
            {pending.map((task) => {
              const isOverdue = task.due_date < today
              const priority = PRIORITY_LABELS[task.priority]
              const isCompleting = completing === task.id
              const isDeleting = deleting === task.id
              const canComplete = canManage || task.assigned_to === userId

              return (
                <div
                  key={task.id}
                  className={`px-5 py-4 ${isOverdue ? 'bg-red-50/40' : ''}`}
                >
                  {/* Task header row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className={`text-sm font-semibold leading-snug ${isOverdue ? 'text-red-800' : 'text-[#2F3437]'}`}>
                        {task.title}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${priority.bg} ${priority.color}`}>
                        {priority.label}
                      </span>
                      {task.source === 'ai' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                          AI
                        </span>
                      )}
                    </div>
                    {canManage && (
                      <button
                        onClick={() => deleteTask(task.id)}
                        disabled={isDeleting}
                        className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-40 p-0.5"
                        title="Delete task"
                      >
                        {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-slate-500 mb-1.5 leading-relaxed">{task.description}</p>
                  )}

                  {/* Due date */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {isOverdue ? (
                      <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                    ) : (
                      <Clock size={12} className="text-slate-400 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                      {isOverdue ? 'Overdue — ' : 'Due '}
                      {new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Assignee display */}
                  {task.assigned_to && task.assignee && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-4 h-4 rounded-full bg-[#dce4ef] flex items-center justify-center">
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

                  {/* Mark Complete button */}
                  {canComplete && (
                    <button
                      onClick={() => markComplete(task.id)}
                      disabled={isCompleting}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        border transition-all
                        ${isOverdue
                          ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-500'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isCompleting ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} strokeWidth={2.5} />
                      )}
                      {isCompleting ? 'Marking done…' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              )
            })}

            {/* ── Completed tasks ───────────────────────── */}
            {completed.length > 0 && (
              <div className="px-5 py-3 bg-[#F4F1EA]/60">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Completed
                </p>
                <div className="flex flex-col gap-2">
                  {completed.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2.5 group">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-500 line-through">{task.title}</span>
                        {task.completed_at && (
                          <span className="text-[11px] text-slate-400 ml-2">
                            {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {canManage && (
                        <button
                          onClick={() => deleteTask(task.id)}
                          disabled={deleting === task.id}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-slate-300 hover:text-red-500 transition-all disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {completed.length > 3 && (
                    <p className="text-[11px] text-slate-400">+{completed.length - 3} more completed</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
