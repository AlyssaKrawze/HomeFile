import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ homeId: string; applianceId: string }> }
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

  const client = new Anthropic()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are a data mapping assistant. The user uploaded a spreadsheet of service provider contacts with unknown column names.

Raw rows as JSON:
${JSON.stringify(rows.slice(0, 200), null, 2)}

Map each row to these standard fields:
- name: person's name or primary contact name (REQUIRED — skip rows with no identifiable name)
- company: business or company name
- phone: phone number (any format)
- email: email address
- notes: any other useful info such as address, specialty, hourly rate, license number, etc.

Rules:
- Combine first + last name columns into a single name string
- If a field is not present, use empty string ""
- Skip rows that are clearly column headers or completely empty
- Return ONLY valid JSON in this exact shape, no explanation:
{ "mapped": [ { "name": "", "company": "", "phone": "", "email": "", "notes": "" } ] }`,
    }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  type MappedRow = { name: string; company: string; phone: string; email: string; notes: string }
  let mapped: MappedRow[] = []

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      mapped = (parsed.mapped ?? []).filter((r: Partial<MappedRow>) => r.name?.trim())
    } catch {
      // keep empty array
    }
  }

  return NextResponse.json({ mapped })
}
