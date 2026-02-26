import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Shield, Edit3 } from 'lucide-react'
import InviteMemberModal from '@/components/homes/invite-member-modal'

export default async function MembersPage({
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

  const [{ data: home }, { data: members }] = await Promise.all([
    supabase.from('homes').select('id, name').eq('id', homeId).single(),
    supabase
      .from('home_members')
      .select('*, profiles(id, full_name, email, avatar_url)')
      .eq('home_id', homeId)
      .order('created_at'),
  ])

  if (!home) notFound()

  const isOwner = membership.role === 'owner'

  const ROLE_DESCRIPTIONS: Record<string, { label: string; color: string; bg: string; description: string }> = {
    owner: {
      label: 'Owner',
      color: 'text-[#4a5c77]',
      bg: 'bg-[#dce4ef]',
      description: 'Full access — manage everything including members and settings',
    },
    manager: {
      label: 'Manager',
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      description: 'Can edit records, manage schedules, and add service history',
    },
    limited: {
      label: 'Limited Access',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      description: 'Custom per-category permissions set by owner or manager',
    },
  }

  const ROLE_TEMPLATES = [
    { name: 'Housekeeper', description: 'Access to kitchen, bathrooms, and living areas', icon: '🧹' },
    { name: 'Landscaper', description: 'Access to outdoor areas and relevant systems', icon: '🌿' },
    { name: 'Dog Walker', description: 'Limited access to entry and outdoor areas', icon: '🐕' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Members</span>
      </div>

      <div className="flex items-center justify-between mb-8 gap-3">
        <h1 className="font-playfair text-2xl font-bold text-[#2F3437]">Members &amp; Access</h1>
        {isOwner && <InviteMemberModal />}
      </div>

      {/* Current members */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] mb-6">
        <div className="px-4 py-4 sm:px-6 border-b border-[#E0D9D0]">
          <h2 className="font-semibold text-[#2F3437]">
            Current Members ({(members || []).length})
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(members || []).map((member) => {
            const profile = member.profiles as Record<string, string> | null
            const role = ROLE_DESCRIPTIONS[member.role] || ROLE_DESCRIPTIONS.limited
            return (
              <div key={member.id} className="px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 rounded-full bg-[#dce4ef] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#4a5c77]">
                    {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2F3437]">
                    {profile?.full_name || profile?.email || 'Unknown user'}
                    {member.user_id === user.id && (
                      <span className="text-xs text-slate-400 ml-1">(you)</span>
                    )}
                  </p>
                  {profile?.full_name && (
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${role.bg} ${role.color}`}>
                    {role.label}
                  </span>
                  {isOwner && member.user_id !== user.id && (
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Role descriptions */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] mb-6">
        <div className="px-6 py-4 border-b border-[#E0D9D0]">
          <h2 className="font-semibold text-[#2F3437]">Roles</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {Object.entries(ROLE_DESCRIPTIONS).map(([key, role]) => (
            <div key={key} className="px-4 py-3 sm:px-6 sm:py-4 flex items-start gap-3">
              <Shield size={16} className={`mt-0.5 ${role.color} flex-shrink-0`} />
              <div>
                <p className="text-sm font-medium text-[#2F3437]">{role.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role templates */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2]">
        <div className="px-6 py-4 border-b border-[#E0D9D0]">
          <h2 className="font-semibold text-[#2F3437]">Role Templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-configured permission sets for common roles — fully editable after assignment.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {ROLE_TEMPLATES.map((template) => (
            <div key={template.name} className="px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
              <span className="text-xl">{template.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2F3437]">{template.name}</p>
                <p className="text-xs text-slate-500">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
