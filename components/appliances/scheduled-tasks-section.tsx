'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, CheckCircle2, Clock, AlertTriangle, Circle, Trash2 } from 'lucide-react'
import { PRIORITY_LABELS, type ScheduledTask, type TaskPriority } from '@/lib/types'

interface ScheduledTasksSectionProps {
  applianceId: string
  homeId: string
  tasks: ScheduledTask[]
  canManage: boolean
  userId: string
}

export default function ScheduledTasksSection({
  applianceId, homeId, tasks, canManage, userId
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
    })

    setShowForm(false)
    setForm({ title: '', description: '', due_date: '', priority: 'medium' })
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-semibold text-slate-900">Maintenance Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {pending.length === 0 ? 'No pending tasks' : `${pending.length} pending`}
            {completed.length > 0 && ` · ${completed.length} completed`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            <Plus size={15} />
            Add Task
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleAddTask} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Task *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Replace HVAC filter"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {Object.entries(PRIORITY_LABELS).map(([val, meta]) => (
                    <option key={val} value={val}>{meta.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="px-6 py-6 text-center">
            <Clock size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No tasks scheduled.</p>
            <p className="text-xs text-slate-400 mt-1">Add a task manually or use AI suggestions below.</p>
          </div>
        ) : (
          <>
            {pending.map((task) => {
              const isOverdue = task.due_date < today
              const priority = PRIORITY_LABELS[task.priority]
              return (
                <div key={task.id} className="px-6 py-3.5 flex items-start gap-3">
                  <button
                    onClick={() => markComplete(task.id)}
                    disabled={completing === task.id}
                    className="mt-0.5 flex-shrink-0 text-slate-300 hover:text-teal-500 transition-colors disabled:opacity-50"
                  >
                    <Circle size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>
                        {priority.label}
                      </span>
                      {task.source === 'ai' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                          AI
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      {isOverdue ? (
                        <AlertTriangle size={12} className="text-red-500" />
                      ) : (
                        <Clock size={12} className="text-slate-400" />
                      )}
                      <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                        {isOverdue ? 'Overdue · ' : 'Due '}
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      disabled={deleting === task.id}
                      className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            })}

            {completed.slice(0, 3).map((task) => (
              <div key={task.id} className="px-6 py-3 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-600 line-through">{task.title}</span>
                  {task.completed_at && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Completed {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
                {canManage && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    disabled={deleting === task.id}
                    className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
