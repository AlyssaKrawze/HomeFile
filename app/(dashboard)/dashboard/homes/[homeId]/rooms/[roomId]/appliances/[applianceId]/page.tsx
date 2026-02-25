import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ChevronRight, ShieldCheck, ShieldAlert, ShieldX,
  Calendar, DollarSign, Hash, Tag, FileText, Wrench,
} from 'lucide-react'
import { ROOM_CATEGORIES, SERVICE_TYPE_LABELS, type PermissionCategory, type TaskAssigneeMember } from '@/lib/types'
import ServiceHistorySection from '@/components/appliances/service-history-section'
import DocumentsSection from '@/components/appliances/documents-section'
import ScheduledTasksSection from '@/components/appliances/scheduled-tasks-section'
import AISuggestionsSection from '@/components/appliances/ai-suggestions-section'
import EditApplianceModal from '@/components/appliances/edit-appliance-modal'
import DisasterPlanSection from '@/components/appliances/disaster-plan-section'
import ProvidersSection from '@/components/appliances/providers-section'
import DeleteApplianceButton from '@/components/appliances/delete-appliance-button'

export default async function AppliancePage({
  params,
}: {
  params: Promise<{ homeId: string; roomId: string; applianceId: string }>
}) {
  const { homeId, roomId, applianceId } = await params
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

  const [{ data: home }, { data: room }, { data: appliance }] = await Promise.all([
    supabase.from('homes').select('id, name, city, state').eq('id', homeId).single(),
    supabase.from('rooms').select('id, name, category').eq('id', roomId).single(),
    supabase.from('appliances').select('*').eq('id', applianceId).eq('home_id', homeId).single(),
  ])

  if (!home || !room || !appliance) notFound()

  const [{ data: serviceRecords }, { data: documents }, { data: scheduledTasks }, { data: homeMembers }, { data: providers }] = await Promise.all([
    supabase
      .from('service_records')
      .select('*')
      .eq('appliance_id', applianceId)
      .order('service_date', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('appliance_id', applianceId)
      .order('created_at', { ascending: false }),
    supabase
      .from('scheduled_tasks')
      .select('*, assignee:profiles!assigned_to(id, full_name, email, avatar_url)')
      .eq('appliance_id', applianceId)
      .order('due_date'),
    supabase
      .from('home_members')
      .select('user_id, profiles(id, full_name, email, avatar_url)')
      .eq('home_id', homeId),
    supabase
      .from('service_providers')
      .select('*')
      .eq('appliance_id', applianceId)
      .order('created_at', { ascending: false }),
  ])

  const taskMembers: TaskAssigneeMember[] = (homeMembers || []).map(m => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      user_id: m.user_id,
      full_name: p?.full_name ?? null,
      email: p?.email ?? null,
      avatar_url: p?.avatar_url ?? null,
    }
  })

  const cat = ROOM_CATEGORIES[room.category as PermissionCategory] || ROOM_CATEGORIES.other
  const canManage = ['owner', 'manager'].includes(membership.role)

  // Warranty status
  const warrantyDate = appliance.warranty_expiry ? new Date(appliance.warranty_expiry) : null
  const now = new Date()
  const warrantyStatus = !warrantyDate
    ? 'unknown'
    : warrantyDate < now
    ? 'expired'
    : warrantyDate < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    ? 'expiring'
    : 'active'

  // Age calculation
  const installDate = appliance.installation_date || appliance.purchase_date
  const ageYears = installDate
    ? Math.floor((now.getTime() - new Date(installDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  // Last service
  const lastService = (serviceRecords || [])[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}/rooms/${roomId}`} className="hover:text-slate-600">{room.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">{appliance.name}</span>
      </div>

      {/* Appliance Header */}
      <div className="bg-white rounded-2xl border border-[#C8BFB2] p-4 sm:p-6 mb-6">
        {/* Top row: icon + name + edit button */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${cat.bgColor} flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0`}>
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-playfair text-xl sm:text-2xl font-bold text-[#2F3437] leading-tight">{appliance.name}</h1>
              {canManage && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <EditApplianceModal appliance={appliance} />
                  <DeleteApplianceButton
                    homeId={homeId}
                    roomId={roomId}
                    applianceId={applianceId}
                    applianceName={appliance.name}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {appliance.brand && (
                <span className="text-sm text-slate-600">{appliance.brand}</span>
              )}
              {appliance.brand && appliance.model && (
                <span className="text-slate-300">·</span>
              )}
              {appliance.model && (
                <span className="text-sm text-slate-600">{appliance.model}</span>
              )}
              {appliance.category && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {appliance.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Warranty badge — sits below name row, full width on mobile */}
        {warrantyStatus !== 'unknown' && (
          <div className="mt-3">
            {warrantyStatus === 'active' && (
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <ShieldCheck size={15} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-800">Under Warranty</p>
                  <p className="text-xs text-green-600">
                    Until {new Date(appliance.warranty_expiry!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {warrantyStatus === 'expiring' && (
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <ShieldAlert size={15} className="text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Expiring Soon</p>
                  <p className="text-xs text-amber-600">
                    {new Date(appliance.warranty_expiry!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {warrantyStatus === 'expired' && (
              <div className="inline-flex items-center gap-2 bg-[#F4F1EA] border border-[#C8BFB2] rounded-xl px-3 py-2">
                <ShieldX size={15} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-600">Warranty Expired</p>
                  <p className="text-xs text-slate-400">
                    {new Date(appliance.warranty_expiry!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detail grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-[#E0D9D0]">
          {ageYears !== null && (
            <DetailItem icon={<Calendar size={14} />} label="Age" value={`${ageYears} yr${ageYears !== 1 ? 's' : ''} old`} />
          )}
          {appliance.purchase_price && (
            <DetailItem
              icon={<DollarSign size={14} />}
              label="Purchase price"
              value={`$${Number(appliance.purchase_price).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            />
          )}
          {appliance.serial_number && (
            <DetailItem icon={<Hash size={14} />} label="Serial number" value={appliance.serial_number} mono />
          )}
          {appliance.warranty_provider && (
            <DetailItem icon={<Tag size={14} />} label="Warranty provider" value={appliance.warranty_provider} />
          )}
          {lastService && (
            <DetailItem
              icon={<Wrench size={14} />}
              label="Last serviced"
              value={new Date(lastService.service_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            />
          )}
          {(serviceRecords || []).length > 0 && (
            <DetailItem
              icon={<FileText size={14} />}
              label="Service records"
              value={`${(serviceRecords || []).length} record${(serviceRecords || []).length !== 1 ? 's' : ''}`}
            />
          )}
        </div>

        {appliance.notes && (
          <div className="mt-4 pt-4 border-t border-[#E0D9D0]">
            <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
            <p className="text-sm text-slate-700 leading-relaxed">{appliance.notes}</p>
          </div>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Service history + Scheduled tasks */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ServiceHistorySection
            applianceId={applianceId}
            homeId={homeId}
            serviceRecords={serviceRecords || []}
            canManage={canManage}
            userId={user.id}
          />

          <ProvidersSection
            applianceId={applianceId}
            homeId={homeId}
            providers={providers || []}
            canManage={canManage}
          />

          <ScheduledTasksSection
            applianceId={applianceId}
            homeId={homeId}
            tasks={scheduledTasks || []}
            canManage={canManage}
            userId={user.id}
            userRole={membership.role as import('@/lib/types').UserRole}
            members={taskMembers}
          />

          <DisasterPlanSection
            applianceId={applianceId}
            initialPlan={appliance.disaster_plan ?? null}
            canManage={canManage}
          />
        </div>

        {/* Right: Documents + AI Suggestions */}
        <div className="flex flex-col gap-6">
          <DocumentsSection
            applianceId={applianceId}
            homeId={homeId}
            documents={documents || []}
            canManage={canManage}
          />

          <AISuggestionsSection
            appliance={appliance}
            homeId={homeId}
            serviceRecords={serviceRecords || []}
            canManage={canManage}
            userId={user.id}
            city={home.city}
            state={home.state}
          />
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value, mono }: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-sm font-medium text-[#2F3437] ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}
