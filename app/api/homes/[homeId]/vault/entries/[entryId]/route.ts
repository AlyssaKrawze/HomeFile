import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyVaultSessionCookie, encryptField, decryptField, VAULT_COOKIE_NAME } from '@/lib/vault-crypto'
import { cookies } from 'next/headers'
import type { VaultCategory, VaultEntryDecrypted } from '@/lib/types'

async function authAndVerify(homeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401, supabase: null, user: null }

  const { data: membership } = await supabase
    .from('home_members')
    .select('role')
    .eq('home_id', homeId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { error: 'Forbidden', status: 403, supabase: null, user: null }
  }

  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(VAULT_COOKIE_NAME)?.value
  if (!cookieValue || !verifyVaultSessionCookie(cookieValue, user.id, homeId)) {
    return { error: 'Vault locked', status: 401, supabase: null, user: null }
  }

  return { error: null, status: 200, supabase, user }
}

function decryptEntry(row: { id: string; home_id: string; category: VaultCategory; label: string; credentials: Record<string, unknown>; notes: string | null; created_at: string; updated_at: string }): VaultEntryDecrypted {
  const c = row.credentials
  const entry: VaultEntryDecrypted = {
    id: row.id,
    home_id: row.home_id,
    category: row.category,
    label: row.label,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }

  if (row.category === 'wifi') {
    entry.ssid = c.ssid as string
    entry.password = decryptField(c.password as { ciphertext: string; iv: string; authTag: string })
  } else if (row.category === 'alarm' || row.category === 'garage' || row.category === 'gate') {
    entry.code = decryptField(c.code as { ciphertext: string; iv: string; authTag: string })
  } else if (row.category === 'custom') {
    entry.fieldLabel = c.fieldLabel as string
    entry.fieldValue = decryptField(c.fieldValue as { ciphertext: string; iv: string; authTag: string })
  }

  return entry
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ homeId: string; entryId: string }> }
) {
  const { homeId, entryId } = await params
  const { error, status, supabase, user } = await authAndVerify(homeId)
  if (error || !supabase || !user) return NextResponse.json({ error }, { status })

  const { data: existing } = await supabase
    .from('vault_entries')
    .select('id, home_id')
    .eq('id', entryId)
    .single()

  if (!existing || existing.home_id !== homeId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const { category, label, notes, ssid, password, code, fieldLabel, fieldValue } = body as {
    category: VaultCategory
    label: string
    notes?: string
    ssid?: string
    password?: string
    code?: string
    fieldLabel?: string
    fieldValue?: string
  }

  let credentials: Record<string, unknown> = {}
  if (category === 'wifi') {
    credentials = { ssid, password: encryptField(password ?? '') }
  } else if (category === 'alarm' || category === 'garage' || category === 'gate') {
    credentials = { code: encryptField(code ?? '') }
  } else if (category === 'custom') {
    credentials = { fieldLabel, fieldValue: encryptField(fieldValue ?? '') }
  }

  const { data: row } = await supabase
    .from('vault_entries')
    .update({
      category,
      label,
      credentials,
      notes: notes ?? null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select('*')
    .single()

  if (!row) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({ entry: decryptEntry(row) })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ homeId: string; entryId: string }> }
) {
  const { homeId, entryId } = await params
  const { error, status, supabase, user } = await authAndVerify(homeId)
  if (error || !supabase || !user) return NextResponse.json({ error }, { status })

  const { data: existing } = await supabase
    .from('vault_entries')
    .select('id, home_id')
    .eq('id', entryId)
    .single()

  if (!existing || existing.home_id !== homeId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await supabase.from('vault_entries').delete().eq('id', entryId)

  return NextResponse.json({ success: true })
}
