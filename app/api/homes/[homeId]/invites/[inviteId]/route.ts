import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/homes/[homeId]/invites/[inviteId] — revoke invite
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ homeId: string; inviteId: string }> }
) {
  const { homeId, inviteId } = await params
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

  const { error } = await supabase
    .from('home_invites')
    .delete()
    .eq('id', inviteId)
    .eq('home_id', homeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
