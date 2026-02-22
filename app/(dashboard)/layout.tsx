import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user's homes via membership
  const { data: memberships } = await supabase
    .from('home_members')
    .select('home_id, homes(id, name)')
    .eq('user_id', user.id)

  const homeList = (memberships || [])
    .map((m: Record<string, unknown>) => {
      const h = m.homes as { id: string; name: string } | null
      return h ? { id: h.id, name: h.name } : null
    })
    .filter(Boolean) as { id: string; name: string }[]

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || profile?.email || user.email

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar homes={homeList} userName={displayName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
