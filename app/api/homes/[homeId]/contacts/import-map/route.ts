import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

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

  const body = await req.json()
  const rows: Record<string, unknown>[] = body.rows
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  }

  // ── Debug logging ──────────────────────────────────────────────────────────
  const headers = Object.keys(rows[0] ?? {})
  console.log('[import-map] Column headers:', headers)
  console.log('[import-map] Row 1:', JSON.stringify(rows[0]))
  console.log('[import-map] Row 2:', JSON.stringify(rows[1]))
  console.log('[import-map] Row 3:', JSON.stringify(rows[2]))
  console.log('[import-map] Total rows received:', rows.length)

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `You are a data mapping assistant. Map every row of this contact spreadsheet to standard fields.

Column headers: ${JSON.stringify(headers)}

All rows (JSON):
${JSON.stringify(rows.slice(0, 200), null, 2)}

Map each row to these fields:
- name: The PRIMARY identifier. Priority order:
    1. A dedicated "Contact Person", "Person", "First Name"+"Last Name" column
    2. A combined "Name/Company", "Name", "Full Name" column — use its value even if it looks like a business name
    3. The company/business name as a fallback
    Never return name as "" if any text identifier exists anywhere in the row.
- company: Business or company name (separate from person name when both exist; otherwise "")
- phone: Primary phone number. If multiple phone columns exist, use the first; add extras to notes.
- email: Email address
- category: Service/vendor category. If a "Category", "Type", or "Role" column exists, copy its value directly.
- notes: Combine any remaining useful info — alternate phone numbers, address, specialty, rates, etc.

SKIP a row ONLY if name, company, phone, AND email are ALL empty (truly blank rows).
Use "" for any field that is absent or empty.

Return ONLY this JSON with no explanation:
{ "mapped": [ { "name": "", "company": "", "phone": "", "email": "", "category": "", "notes": "" } ] }`,
    }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
  console.log('[import-map] Claude response length:', text.length)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  type MappedRow = { name: string; company: string; phone: string; email: string; category: string; notes: string }
  let mapped: MappedRow[] = []

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      // Keep any row that has at least one of: name, company, phone, or email
      mapped = (parsed.mapped ?? []).filter(
        (r: Partial<MappedRow>) =>
          r.name?.trim() || r.company?.trim() || r.phone?.trim() || r.email?.trim()
      )
    } catch {
      console.error('[import-map] JSON parse failed. Raw response:', text.slice(0, 500))
    }
  } else {
    console.error('[import-map] No JSON found in response. Raw:', text.slice(0, 500))
  }

  console.log('[import-map] Mapped contacts returned:', mapped.length)
  return NextResponse.json({ mapped })
}
