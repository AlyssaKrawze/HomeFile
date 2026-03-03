import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, BookOpen, Download, FileText, ShieldCheck, Wrench, Users } from 'lucide-react'
import HomeContactsImportTrigger from '@/components/contacts/home-contacts-import-modal-trigger'

export default async function BinderPage({
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

  const isOwnerOrManager = ['owner', 'manager'].includes(membership.role)

  const { data: home } = await supabase
    .from('homes')
    .select('id, name')
    .eq('id', homeId)
    .single()

  if (!home) notFound()

  const [
    { count: applianceCount },
    { count: taskCount },
    { count: contactCount },
    { data: recentContacts },
  ] = await Promise.all([
    supabase
      .from('appliances')
      .select('*', { count: 'exact', head: true })
      .eq('home_id', homeId),
    supabase
      .from('scheduled_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('home_id', homeId)
      .eq('status', 'completed'),
    supabase
      .from('home_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('home_id', homeId),
    supabase
      .from('home_contacts')
      .select('id, name, company, category, phone, email')
      .eq('home_id', homeId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Home Binder</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#dce4ef] flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} className="text-[#5B6C8F]" />
        </div>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#2F3437]">Home Binder</h1>
          <p className="text-sm text-slate-500">A complete PDF record of {home.name}</p>
        </div>
      </div>

      {/* What's included */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] p-6 mb-6">
        <h2 className="font-playfair font-semibold text-[#2F3437] mb-4">What&apos;s included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eef1f6] flex items-center justify-center flex-shrink-0">
              <Wrench size={14} className="text-[#5B6C8F]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2F3437]">Appliance records</p>
              <p className="text-xs text-slate-500 mt-0.5">{applianceCount ?? 0} appliances with specs, warranty info, and service history</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eef1f6] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={14} className="text-[#5B6C8F]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2F3437]">Disaster &amp; storm plans</p>
              <p className="text-xs text-slate-500 mt-0.5">Emergency procedures for every appliance that has one</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eef1f6] flex items-center justify-center flex-shrink-0">
              <FileText size={14} className="text-[#5B6C8F]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2F3437]">Maintenance log</p>
              <p className="text-xs text-slate-500 mt-0.5">{taskCount ?? 0} completed tasks plus full service records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors & Contacts */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] mb-6">
        <div className="px-6 py-4 border-b border-[#E0D9D0] flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Users size={15} className="text-[#5B6C8F]" />
              <h2 className="font-semibold text-[#2F3437]">Vendors &amp; Contacts</h2>
            </div>
            <p className="text-xs text-slate-500">
              {contactCount
                ? `${contactCount} contact${contactCount !== 1 ? 's' : ''} in your home directory`
                : 'Import your plumbers, electricians, and service contacts'}
            </p>
          </div>
          {isOwnerOrManager && (
            <HomeContactsImportTrigger
              homeId={homeId}
              contactCount={contactCount ?? 0}
              buttonVariant="primary"
            />
          )}
        </div>

        {recentContacts && recentContacts.length > 0 ? (
          <div className="divide-y divide-[#F0EBE3]">
            {recentContacts.map(c => (
              <div key={c.id} className="px-6 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2F3437]">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {c.company && <span className="text-xs text-slate-500">{c.company}</span>}
                    {c.category && (
                      <span className="text-xs text-[#5B6C8F] bg-[#eef1f6] px-1.5 py-0.5 rounded-full">
                        {c.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {c.phone && <p className="text-xs text-slate-500">{c.phone}</p>}
                  {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                </div>
              </div>
            ))}
            {(contactCount ?? 0) > 5 && (
              <div className="px-6 py-3 text-center">
                <p className="text-xs text-slate-400">+{(contactCount ?? 0) - 5} more contacts</p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-6 text-center">
            <p className="text-xs text-slate-400">
              No contacts yet.{' '}
              {isOwnerOrManager && 'Upload a spreadsheet to bulk-import your vendor list.'}
            </p>
          </div>
        )}
      </div>

      {/* Download */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-[#2F3437] text-sm">Ready to generate</p>
          <p className="text-xs text-slate-500 mt-0.5">Your binder reflects the current state of your home. Re-download anytime.</p>
        </div>
        <a
          href={`/api/homes/${homeId}/binder`}
          download
          className="flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          <Download size={15} />
          Download PDF
        </a>
      </div>

      {applianceCount === 0 && (
        <p className="text-xs text-slate-400 text-center mt-4">
          Add appliances to your rooms first to make the binder useful.{' '}
          <Link href={`/dashboard/homes/${homeId}/inventory`} className="text-[#5B6C8F] hover:underline">
            Go to Inventory →
          </Link>
        </p>
      )}
    </div>
  )
}
