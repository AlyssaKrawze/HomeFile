import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/dashboard-shell'

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

  // Fetch profile (include onboarding flag)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, onboarding_completed')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || profile?.email || user.email
  const showOnboarding = !profile?.onboarding_completed

  return (
    <DashboardShell
      homes={homeList}
      userName={displayName}
      userId={user.id}
      showOnboarding={showOnboarding}
    >
      {children}
    </DashboardShell>
  )
}
