import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Settings, Home, Trash2, Users } from 'lucide-react'
import SignOutButton from '@/components/layout/sign-out-button'

export default async function SettingsPage({
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

  const { data: home } = await supabase
    .from('homes')
    .select('*')
    .eq('id', homeId)
    .single()

  if (!home) notFound()

  const isOwner = membership.role === 'owner'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Settings</span>
      </div>

      <h1 className="font-playfair text-2xl font-bold text-[#2F3437] mb-8">Home Settings</h1>

      {/* Home details */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] mb-6">
        <div className="px-6 py-4 border-b border-[#E0D9D0] flex items-center gap-2">
          <Home size={16} className="text-slate-500" />
          <h2 className="font-semibold text-[#2F3437]">Home Details</h2>
        </div>
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Home name</label>
              <p className="text-sm text-[#2F3437]">{home.name}</p>
            </div>
            {home.year_built && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Year built</label>
                <p className="text-sm text-[#2F3437]">{home.year_built}</p>
              </div>
            )}
            {home.address && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                <p className="text-sm text-[#2F3437]">
                  {[home.address, home.city, home.state, home.zip].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            {home.square_footage && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Square footage</label>
                <p className="text-sm text-[#2F3437]">{home.square_footage.toLocaleString()} sq ft</p>
              </div>
            )}
          </div>
          {isOwner && (
            <button className="self-start bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Notification settings */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] mb-6">
        <div className="px-6 py-4 border-b border-[#E0D9D0]">
          <h2 className="font-semibold text-[#2F3437]">Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">Default alert schedule for upcoming tasks</p>
        </div>
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          {[
            { label: '1 month before due date', enabled: true },
            { label: '1 week before due date', enabled: true },
            { label: '1 day before due date', enabled: false },
          ].map((notif) => (
            <div key={notif.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{notif.label}</span>
              <div className={`w-10 h-5 rounded-full transition-colors ${notif.enabled ? 'bg-[#5B6C8F]' : 'bg-slate-200'} flex items-center px-0.5`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notif.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members — visible on mobile since Members isn't a bottom tab */}
      <div className="lg:hidden bg-white rounded-2xl border border-[#C8BFB2] mb-6">
        <Link
          href={`/dashboard/homes/${homeId}/members`}
          className="flex items-center gap-3 px-5 py-4 hover:bg-[#F4F1EA] transition-colors rounded-2xl"
        >
          <Users size={16} className="text-slate-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#2F3437]">Members &amp; Access</p>
            <p className="text-xs text-slate-500 mt-0.5">Manage who can view or edit this home</p>
          </div>
          <ChevronRight size={15} className="text-slate-400 flex-shrink-0" />
        </Link>
      </div>

      {/* Danger zone */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-red-200 mb-6">
          <div className="px-6 py-4 border-b border-red-100">
            <h2 className="font-semibold text-red-700">Danger Zone</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#2F3437]">Delete this home</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permanently delete all rooms, items, records, and documents.
                </p>
              </div>
              <button className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors self-start sm:self-auto flex-shrink-0">
                <Trash2 size={14} />
                Delete Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account — sign out (mobile only) */}
      <div className="lg:hidden bg-white rounded-2xl border border-[#C8BFB2]">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#2F3437]">Account</p>
            <p className="text-xs text-slate-500 mt-0.5">Sign out of TheHomePage</p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
