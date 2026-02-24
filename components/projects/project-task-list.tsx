'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Check, Trash2, ClipboardList } from 'lucide-react'
import { type ProjectTask, type ProjectTaskStatus, type TaskAssigneeMember } from '@/lib/types'

interface ProjectTaskListProps {
  projectId: string
  homeId: string
  tasks: ProjectTask[]
  members: TaskAssigneeMember[]
  canManage: boolean
  userId: string
}

const STATUS_LABELS: Record<ProjectTaskStatus, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
}

const STATUS_COLORS: Record<ProjectTaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function ProjectTaskList({
  projectId, homeId, tasks, members, canManage, userId
}: ProjectTaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending' as ProjectTaskStatus,
    assigned_to: '',
    due_date: '',
  })
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    await supabase.from('project_tasks').insert({
      project_id: projectId,
      home_id: homeId,
      title: form.title.trim(),
      description: form.description || null,
      status: form.status,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date || null,
    })
    setShowForm(false)
    setForm({ title: '', description: '', status: 'pending', assigned_to: '', due_date: '' })
    setLoading(false)
    router.refresh()
  }

  async function handleStatusChange(task: ProjectTask, newStatus: ProjectTaskStatus) {
    await supabase.from('project_tasks').update({ status: newStatus }).eq('id', task.id)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('project_tasks').delete().eq('id', id)
    router.refresh()
  }

  const canComplete = (task: ProjectTask) =>
    canManage || task.assigned_to === userId

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9D0]">
        <div>
          <h2 className="font-semibold text-[#2F3437]">Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tasks.length === 0 ? 'No tasks yet' : `${tasks.filter(t => t.status === 'completed').length}/${tasks.length} done`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
          >
            <Plus size={15} />
            Add Task
          </button>
        )}
      </div>

      {showForm && (
        <div className="px-6 py-5 border-b border-[#E0D9D0] bg-[#F4F1EA]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="What needs to be done?"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as ProjectTaskStatus }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] bg-white"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign to</label>
                <select
                  value={form.assigned_to}
                  onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] bg-white"
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.full_name || m.email}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-[#F4F1EA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !form.title.trim()}
                className="flex-1 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <ClipboardList size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No tasks yet.</p>
            {canManage && <p className="text-xs text-slate-400 mt-1">Add tasks to track work for this project.</p>}
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="px-6 py-4 flex items-start gap-3">
              {canComplete(task) && (
                <button
                  onClick={() => handleStatusChange(task, task.status === 'completed' ? 'pending' : 'completed')}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-[#C8BFB2] hover:border-[#5B6C8F]'
                  }`}
                >
                  {task.status === 'completed' && <Check size={11} />}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-[#2F3437]'}`}>
                    {task.title}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 flex-wrap">
                  {task.assignee && <span>→ {task.assignee.full_name || task.assignee.email}</span>}
                  {task.due_date && (
                    <span>Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  )}
                </div>
              </div>
              {canManage && (
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
