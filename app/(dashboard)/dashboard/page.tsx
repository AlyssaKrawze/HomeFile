import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Home, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import AddHomeModal from '@/components/homes/add-home-modal'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch homes with member role
  const { data: memberships } = await supabase
    .from('home_members')
    .select(`
      role,
      homes(
        id, name, address, city, state, year_built, square_footage, image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at')

  type HomeRow = {
    id: string; name: string; address: string | null; city: string | null
    state: string | null; year_built: number | null; square_footage: number | null
    image_url: string | null; member_role: string
  }
  const homes = (memberships || []).map((m: Record<string, unknown>) => {
    const h = m.homes as Record<string, unknown> | null
    return h ? { ...h, member_role: m.role } : null
  }).filter(Boolean) as HomeRow[]

  // If user has exactly one home, redirect there
  if (homes.length === 1) {
    redirect(`/dashboard/homes/${homes[0].id}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Homes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {homes.length === 0
              ? 'Add your first home to get started.'
              : `${homes.length} home${homes.length !== 1 ? 's' : ''} tracked`
            }
          </p>
        </div>
        <AddHomeModal userId={user.id} />
      </div>

      {/* Homes grid */}
      {homes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homes.map((home) => (
            <Link
              key={home.id as string}
              href={`/dashboard/homes/${home.id as string}`}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Home image area */}
              <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                {home.image_url ? (
                  <img
                    src={home.image_url as string}
                    alt={home.name as string}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Home size={48} className="text-slate-300" />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    home.member_role === 'owner'
                      ? 'bg-teal-100 text-teal-700'
                      : home.member_role === 'manager'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {(home.member_role as string).charAt(0).toUpperCase() + (home.member_role as string).slice(1)}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {home.name as string}
                    </h2>
                    {(home.address || home.city) && (
                      <p className="text-slate-500 text-sm mt-0.5">
                        {[home.address as string, home.city as string, home.state as string].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-500 flex-shrink-0 mt-0.5 transition-colors" />
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  {home.year_built && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800">{String(home.year_built)}</p>
                      <p className="text-xs text-slate-400">Built</p>
                    </div>
                  )}
                  {home.square_footage && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800">
                        {Number(home.square_footage).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">Sq ft</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Add home card */}
          <AddHomeCard userId={user.id} />
        </div>
      ) : (
        <EmptyState userId={user.id} />
      )}
    </div>
  )
}

function AddHomeCard({ userId }: { userId: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-300 flex items-center justify-center min-h-48 transition-colors group cursor-pointer">
      <AddHomeModal userId={userId} trigger="card" />
    </div>
  )
}

function EmptyState({ userId }: { userId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <Home size={36} className="text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Add your first home</h2>
      <p className="text-slate-500 max-w-md mb-8 text-sm leading-relaxed">
        HomeFile helps you track every appliance, schedule maintenance, store documents,
        and keep your home running smoothly.
      </p>
      <AddHomeModal userId={userId} />
    </div>
  )
}
