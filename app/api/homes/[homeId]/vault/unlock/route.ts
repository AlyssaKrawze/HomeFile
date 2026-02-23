import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPin, createVaultSessionCookie, VAULT_COOKIE_NAME, SESSION_TTL_SECONDS } from '@/lib/vault-crypto'
import { cookies } from 'next/headers'

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
  const { method, pin, password } = body as { method: 'pin' | 'password'; pin?: string; password?: string }

  if (method === 'pin') {
    const { data: vaultPin } = await supabase
      .from('vault_pins')
      .select('pin_hash, salt')
      .eq('home_id', homeId)
      .eq('user_id', user.id)
      .single()

    if (!vaultPin) {
      return NextResponse.json({ noPinSet: true })
    }

    const valid = verifyPin(pin ?? '', vaultPin.salt, vaultPin.pin_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }
  } else if (method === 'password') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const email = profile?.email
    if (!email || !password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
  } else {
    return NextResponse.json({ error: 'Invalid method' }, { status: 400 })
  }

  const cookieValue = createVaultSessionCookie(user.id, homeId)
  const cookieStore = await cookies()
  cookieStore.set(VAULT_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  return NextResponse.json({ success: true })
}
