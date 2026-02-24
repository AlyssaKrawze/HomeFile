import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, CalendarDays } from 'lucide-react'
import { type ProjectStatus, type TaskAssigneeMember } from '@/lib/types'
import ProjectTaskList from '@/components/projects/project-task-list'
import ProjectTagsEditor from '@/components/projects/project-tags-editor'

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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ homeId: string; projectId: string }>
}) {
  const { homeId, projectId } = await params
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

  const [
    { data: home },
    { data: project },
    { data: tasks },
    { data: projectRooms },
    { data: projectAppliances },
    { data: projectMembers },
    { data: allRooms },
    { data: allAppliances },
    { data: homeMembers },
  ] = await Promise.all([
    supabase.from('homes').select('id, name').eq('id', homeId).single(),
    supabase.from('projects').select('*').eq('id', projectId).eq('home_id', homeId).single(),
    supabase.from('project_tasks')
      .select('*, assignee:profiles!assigned_to(id, full_name, email)')
      .eq('project_id', projectId)
      .order('created_at'),
    supabase.from('project_rooms').select('room_id').eq('project_id', projectId),
    supabase.from('project_appliances').select('appliance_id').eq('project_id', projectId),
    supabase.from('project_members').select('user_id').eq('project_id', projectId),
    supabase.from('rooms').select('id, name').eq('home_id', homeId).order('name'),
    supabase.from('appliances').select('id, name').eq('home_id', homeId).order('name'),
    supabase.from('home_members').select('user_id, profiles(id, full_name, email, avatar_url)').eq('home_id', homeId),
  ])

  if (!home || !project) notFound()

  const canManage = ['owner', 'manager'].includes(membership.role)

  const taskMembers: TaskAssigneeMember[] = (homeMembers || []).map(m => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      user_id: m.user_id,
      full_name: p?.full_name ?? null,
      email: p?.email ?? null,
      avatar_url: p?.avatar_url ?? null,
    }
  })

  const taggedRoomIds = (projectRooms || []).map(r => r.room_id)
  const taggedApplianceIds = (projectAppliances || []).map(a => a.appliance_id)
  const taggedMemberIds = (projectMembers || []).map(m => m.user_id)

  // Normalize tasks assignees
  const normalizedTasks = (tasks || []).map(t => ({
    ...t,
    assignee: t.assignee
      ? (Array.isArray(t.assignee) ? t.assignee[0] : t.assignee)
      : undefined,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}/projects`} className="hover:text-slate-600">Projects</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-playfair text-xl sm:text-2xl font-bold text-[#2F3437]">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[project.status as ProjectStatus]}`}>
                {STATUS_LABELS[project.status as ProjectStatus]}
              </span>
              {project.due_date && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={13} />
                  Due {new Date(project.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectTaskList
            projectId={projectId}
            homeId={homeId}
            tasks={normalizedTasks as import('@/lib/types').ProjectTask[]}
            members={taskMembers}
            canManage={canManage}
            userId={user.id}
          />
        </div>
        <div>
          <ProjectTagsEditor
            projectId={projectId}
            homeId={homeId}
            rooms={allRooms || []}
            appliances={allAppliances || []}
            members={taskMembers}
            taggedRoomIds={taggedRoomIds}
            taggedApplianceIds={taggedApplianceIds}
            taggedMemberIds={taggedMemberIds}
            canManage={canManage}
          />
        </div>
      </div>
    </div>
  )
}
