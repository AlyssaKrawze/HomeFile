import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, FolderOpen, CalendarDays } from 'lucide-react'
import AddProjectModal from '@/components/projects/add-project-modal'
import { type ProjectStatus } from '@/lib/types'

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  complete: 'Complete',
}
const STATUS_COLORS: Record<ProjectStatus, string> = {
  planned: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
}

export default async function ProjectsPage({
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

  const [{ data: home }, { data: projects }, { data: taskCounts }] = await Promise.all([
    supabase.from('homes').select('id, name').eq('id', homeId).single(),
    supabase.from('projects').select('*').eq('home_id', homeId).order('created_at', { ascending: false }),
    supabase.from('project_tasks').select('project_id, status').eq('home_id', homeId),
  ])

  if (!home) notFound()

  const canManage = ['owner', 'manager'].includes(membership.role)

  const tasksByProject = (taskCounts || []).reduce<Record<string, { total: number; done: number }>>((acc, t) => {
    if (!acc[t.project_id]) acc[t.project_id] = { total: 0, done: 0 }
    acc[t.project_id]!.total++
    if (t.status === 'completed') acc[t.project_id]!.done++
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Projects</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#2F3437]">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Track renovation, repair, and improvement projects</p>
        </div>
        {canManage && <AddProjectModal homeId={homeId} />}
      </div>

      {(projects || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 text-4xl">
            🏗️
          </div>
          <h2 className="text-xl font-semibold text-[#2F3437] mb-2">No projects yet</h2>
          <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
            Create a project to track renovations, repairs, or any home improvement work.
          </p>
          {canManage && <AddProjectModal homeId={homeId} />}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(projects || []).map(project => {
            const counts = tasksByProject[project.id] || { total: 0, done: 0 }
            return (
              <Link
                key={project.id}
                href={`/dashboard/homes/${homeId}/projects/${project.id}`}
                className="group bg-white rounded-2xl border border-[#C8BFB2] hover:border-[#9ab0c4] hover:shadow-md transition-all duration-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#eef1f6] flex items-center justify-center flex-shrink-0">
                      <FolderOpen size={18} className="text-[#5B6C8F]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#2F3437] group-hover:text-[#5B6C8F] transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{project.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status as ProjectStatus]}`}>
                          {STATUS_LABELS[project.status as ProjectStatus]}
                        </span>
                        {counts.total > 0 && (
                          <span className="text-xs text-slate-500">
                            {counts.done}/{counts.total} tasks done
                          </span>
                        )}
                        {project.due_date && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <CalendarDays size={11} />
                            {new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-[#5B6C8F] flex-shrink-0 mt-1 transition-colors" />
                </div>
                {counts.total > 0 && (
                  <div className="mt-3 ml-12">
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-[#5B6C8F] h-1.5 rounded-full transition-all"
                        style={{ width: `${(counts.done / counts.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
