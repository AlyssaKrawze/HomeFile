import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/homes/[homeId]/invites — list pending invites
export async function GET(
  _req: NextRequest,
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

  const { data: invites } = await supabase
    .from('home_invites')
    .select('id, email, role, permissions, created_at, expires_at, accepted_at')
    .eq('home_id', homeId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })

  return NextResponse.json({ invites: invites ?? [] })
}

// POST /api/homes/[homeId]/invites — create and send invite
export async function POST(
  req: NextRequest,
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

  const { email, role, permissions } = await req.json()
  if (!email || !role) {
    return NextResponse.json({ error: 'email and role are required' }, { status: 400 })
  }

  const token = crypto.randomUUID()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`
  const redirectTo = `${appUrl}/auth/callback?next=/invite/${token}`

  // Insert invite record first
  const { error: insertError } = await supabase
    .from('home_invites')
    .insert({
      home_id: homeId,
      email: email.toLowerCase().trim(),
      role,
      permissions: permissions ?? {},
      token,
      invited_by: user.id,
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Send invite email via Supabase Auth admin
  try {
    const admin = createAdminClient()
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      email.toLowerCase().trim(),
      { redirectTo }
    )
    if (inviteError) {
      // Clean up the invite record if email send failed
      await supabase.from('home_invites').delete().eq('token', token)
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }
  } catch {
    await supabase.from('home_invites').delete().eq('token', token)
    return NextResponse.json(
      { error: 'Email sending failed. Make sure SUPABASE_SERVICE_ROLE_KEY is set.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
