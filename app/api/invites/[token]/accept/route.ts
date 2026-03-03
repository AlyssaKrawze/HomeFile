import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/invites/[token]/accept
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: invite, error: fetchError } = await admin
    .from('home_invites')
    .select('*')
    .eq('token', token)
    .single()

  if (fetchError || !invite) {
    return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 404 })
  }

  if (invite.accepted_at) {
    return NextResponse.json({ homeId: invite.home_id, alreadyAccepted: true })
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite link has expired.' }, { status: 410 })
  }

  if (invite.email.toLowerCase() !== (user.email ?? '').toLowerCase()) {
    return NextResponse.json(
      { error: `This invite was sent to ${invite.email}. Please sign in with that email address.` },
      { status: 403 }
    )
  }

  // Check if already a member
  const { data: existing } = await admin
    .from('home_members')
    .select('id')
    .eq('home_id', invite.home_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    const { error: insertError } = await admin.from('home_members').insert({
      home_id: invite.home_id,
      user_id: user.id,
      role: invite.role,
      permissions: invite.permissions,
      invited_by: invite.invited_by,
    })
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  await admin
    .from('home_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return NextResponse.json({ homeId: invite.home_id, homeName: null })
}
