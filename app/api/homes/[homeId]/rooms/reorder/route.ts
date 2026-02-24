import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

  const body = await req.json()
  const order: { id: string; sort_order: number }[] = body.order

  if (!Array.isArray(order)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  await Promise.all(
    order.map(({ id, sort_order }) =>
      supabase.from('rooms').update({ sort_order }).eq('id', id).eq('home_id', homeId)
    )
  )

  return NextResponse.json({ ok: true })
}
