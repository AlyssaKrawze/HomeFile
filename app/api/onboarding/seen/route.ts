import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')
  if (!page) return NextResponse.json({ seen: false })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ seen: false })

  const { data } = await supabase
    .from('user_onboarding_seen')
    .select('id')
    .eq('user_id', user.id)
    .eq('page_key', page)
    .single()

  return NextResponse.json({ seen: !!data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { page } = await request.json() as { page: string }
  if (!page) return NextResponse.json({ error: 'Missing page' }, { status: 400 })

  await supabase
    .from('user_onboarding_seen')
    .upsert(
      { user_id: user.id, page_key: page, seen_at: new Date().toISOString() },
      { onConflict: 'user_id,page_key' }
    )

  return NextResponse.json({ success: true })
}
