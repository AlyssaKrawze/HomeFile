import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashPin, generateSalt } from '@/lib/vault-crypto'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ homeId: string }> }
) {
  const { homeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('home_members')
    .select('role')
    .eq('home_id', homeId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { pin } = body as { pin: string }

  if (!/^\d{4}$/.test(pin ?? '')) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
  }

  const salt = generateSalt()
  const pin_hash = hashPin(pin, salt)

  await supabase
    .from('vault_pins')
    .upsert(
      { home_id: homeId, user_id: user.id, pin_hash, salt, updated_at: new Date().toISOString() },
      { onConflict: 'home_id,user_id' }
    )

  return NextResponse.json({ success: true })
}
