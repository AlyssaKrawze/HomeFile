import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Bell } from 'lucide-react'
import HomeAlerts from '@/components/homes/home-alerts'

export default async function AlertsPage({
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
    .select('id, name, city, state')
    .eq('id', homeId)
    .single()

  if (!home) notFound()

  const month = new Date().toLocaleString('en-US', { month: 'long' })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Alerts</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Bell size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Home Alerts</h1>
          <p className="text-sm text-slate-500">Seasonal maintenance warnings for {month}</p>
        </div>
      </div>

      <HomeAlerts city={home.city ?? null} state={home.state ?? null} />
    </div>
  )
}
