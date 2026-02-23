import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, Lock } from 'lucide-react'
import VaultContent from '@/components/vault/vault-content'
import PageTooltip from '@/components/onboarding/page-tooltip'

export default async function VaultPage({
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

  // Limited users cannot access the vault
  if (membership.role === 'limited') {
    redirect(`/dashboard/homes/${homeId}`)
  }

  const { data: home } = await supabase
    .from('homes')
    .select('id, name')
    .eq('id', homeId)
    .single()

  if (!home) notFound()

  const { data: vaultPin } = await supabase
    .from('vault_pins')
    .select('id')
    .eq('home_id', homeId)
    .eq('user_id', user.id)
    .single()

  const hasPinSet = !!vaultPin

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">My Homes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/homes/${homeId}`} className="hover:text-slate-600">{home.name}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Vault</span>
      </div>

      <PageTooltip
        pageKey="vault"
        title="Password Vault"
        message="Securely store sensitive codes and credentials — WiFi passwords, alarm codes, garage and gate PINs. Encrypted and locked behind your personal PIN."
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Lock size={18} className="text-slate-600" />
        </div>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#2F3437]">Password Vault</h1>
          <p className="text-sm text-slate-500">Store WiFi, alarm, and access codes securely</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#C8BFB2] p-6">
        <VaultContent homeId={homeId} hasPinSet={hasPinSet} />
      </div>
    </div>
  )
}
