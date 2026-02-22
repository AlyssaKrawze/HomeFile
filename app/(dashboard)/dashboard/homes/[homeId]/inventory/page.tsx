import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, ShieldCheck, ShieldAlert, Clock } from 'lucide-react'
import { ROOM_CATEGORIES, type PermissionCategory } from '@/lib/types'

export default async function InventoryPage({
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

  const [{ data: home }, { data: appliances }] = await Promise.all([
    supabase.from('homes').select('id, name').eq('id', homeId).single(),
    supabase
      .from('appliances')
      .select(`
        *,
        rooms(id, name, category)
      `)
      .eq('home_id', homeId)
      .order('name'),
  ])

  if (!home) notFound()

  // Fetch last service dates
  const applianceIds = (appliances || []).map(a => a.id)
  const { data: lastServices } = applianceIds.length > 0
    ? await supabase
        .from('service_records')
        .select('appliance_id, service_date')
        .in('appliance_id', applianceIds)
        .order('service_date', { ascending: false })
    : { data: [] }

  const lastServiceByAppliance = (lastServices || []).reduce<Record<string, string>>((acc, s) => {
    if (!acc[s.appliance_id]) acc[s.appliance_id] = s.service_date
    return acc
  }, {})

  const now = new Date()

  // Group by room
  const byRoom = (appliances || []).reduce<Record<string, typeof appliances>>((acc, a) => {
    const room = a.rooms as Record<string, string> | null
    const key = room?.id || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key]!.push(a)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Inventory</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Full Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">
            {(appliances || []).length} item{(appliances || []).length !== 1 ? 's' : ''} tracked across {Object.keys(byRoom).length} room{Object.keys(byRoom).length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {(appliances || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
          <span className="text-5xl mb-4">📦</span>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No items tracked yet</h2>
          <p className="text-slate-500 text-sm max-w-sm mb-6">
            Go to a room and start adding your appliances, systems, and fixtures.
          </p>
          <Link
            href={`/dashboard/homes/${homeId}`}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Go to rooms
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(byRoom).map(([roomId, items]) => {
            if (!items || items.length === 0) return null
            const firstItem = items[0]
            const room = (firstItem as Record<string, unknown>).rooms as Record<string, string> | null
            if (!room) return null
            const cat = ROOM_CATEGORIES[room.category as PermissionCategory] || ROOM_CATEGORIES.other

            return (
              <div key={roomId}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg ${cat.bgColor} flex items-center justify-center text-lg`}>
                    {cat.icon}
                  </div>
                  <Link
                    href={`/dashboard/homes/${homeId}/rooms/${roomId}`}
                    className="font-semibold text-slate-700 hover:text-teal-600 transition-colors"
                  >
                    {room.name}
                  </Link>
                  <span className="text-xs text-slate-400">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                  {items.map((appliance) => {
                    const lastService = lastServiceByAppliance[appliance.id]
                    const warrantyDate = appliance.warranty_expiry ? new Date(appliance.warranty_expiry) : null
                    const warrantyStatus = !warrantyDate ? 'none'
                      : warrantyDate < now ? 'expired'
                      : warrantyDate < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) ? 'expiring'
                      : 'active'

                    return (
                      <Link
                        key={appliance.id}
                        href={`/dashboard/homes/${homeId}/rooms/${roomId}/appliances/${appliance.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                          🔧
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-800 group-hover:text-teal-600 transition-colors">
                              {appliance.name}
                            </span>
                            {appliance.brand && (
                              <span className="text-xs text-slate-400">{appliance.brand}</span>
                            )}
                          </div>
                          {appliance.category && (
                            <p className="text-xs text-slate-500 mt-0.5">{appliance.category}</p>
                          )}
                        </div>

                        {/* Warranty */}
                        <div className="hidden md:flex items-center gap-1.5 text-xs flex-shrink-0">
                          {warrantyStatus === 'active' && (
                            <>
                              <ShieldCheck size={13} className="text-green-500" />
                              <span className="text-green-700">
                                {new Date(appliance.warranty_expiry!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </>
                          )}
                          {warrantyStatus === 'expiring' && (
                            <>
                              <ShieldAlert size={13} className="text-amber-500" />
                              <span className="text-amber-700">Expiring</span>
                            </>
                          )}
                          {warrantyStatus === 'expired' && (
                            <>
                              <ShieldAlert size={13} className="text-slate-300" />
                              <span className="text-slate-400">Expired</span>
                            </>
                          )}
                        </div>

                        {/* Last service */}
                        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0 w-36">
                          <Clock size={12} />
                          <span>
                            {lastService
                              ? new Date(lastService).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'No service record'
                            }
                          </span>
                        </div>

                        <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-500 flex-shrink-0 transition-colors" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
