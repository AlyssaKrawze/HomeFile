import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, address, city, state, zip, year_built, square_footage } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const { data: home, error: homeErr } = await supabase
    .from('homes')
    .insert({
      name: name.trim(),
      address: address || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      year_built: year_built ? parseInt(year_built) : null,
      square_footage: square_footage ? parseInt(square_footage) : null,
      owner_id: user.id,
    })
    .select()
    .single()

  if (homeErr || !home) {
    return NextResponse.json({ error: homeErr?.message || 'Failed to create home' }, { status: 500 })
  }

  const { error: memberErr } = await supabase
    .from('home_members')
    .insert({ home_id: home.id, user_id: user.id, role: 'owner' })

  if (memberErr) {
    // Rollback the home if we can't insert the member
    await supabase.from('homes').delete().eq('id', home.id)
    return NextResponse.json({ error: 'Failed to set up home membership' }, { status: 500 })
  }

  return NextResponse.json({ id: home.id })
}
