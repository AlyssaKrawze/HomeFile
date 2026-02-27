import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Checks a table exists by selecting with limit 0.
// Returns null on pass, error message string on fail.
async function checkTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
): Promise<string | null> {
  const { error } = await supabase.from(table).select('id').limit(0)
  return error ? error.message : null
}

// Checks a column exists on a table by selecting it with limit 0.
async function checkColumn(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  column: string,
): Promise<string | null> {
  const { error } = await supabase.from(table).select(column).limit(0)
  return error ? error.message : null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Table checks ──────────────────────────────────────────────────────────
  const TABLE_CHECKS = [
    'service_providers',
    'vault_entries',
    'vault_pins',
    'projects',
    'project_tasks',
    'project_rooms',
    'project_appliances',
    'project_members',
  ]

  // ── Column checks ─────────────────────────────────────────────────────────
  // All columns from the Appliance interface in lib/types.ts, including
  // migration-added fields (include_in_binder from 017, disaster_plan).
  const APPLIANCE_COLUMNS = [
    'id', 'room_id', 'home_id', 'name',
    'category', 'brand', 'model', 'serial_number',
    'purchase_date', 'installation_date', 'purchase_price',
    'warranty_expiry', 'warranty_provider', 'warranty_contact',
    'notes', 'disaster_plan', 'image_url',
    'include_in_binder',   // migration 017
    'created_at', 'updated_at',
  ]

  // All columns from the Room interface in lib/types.ts, including
  // migration-added fields (migration 014).
  const ROOM_COLUMNS = [
    'id', 'home_id', 'name', 'category', 'floor', 'description',
    'sort_order',   // migration 014
    'paint_color',  // migration 014
    'floor_type',   // migration 014
    'dimensions',   // migration 014
    'room_notes',   // migration 014
    'created_at', 'updated_at',
  ]

  // Bonus: homes columns expected from migrations
  const HOMES_COLUMNS = [
    'notification_prefs',  // migration 019
  ]

  // ── Run all checks in parallel ─────────────────────────────────────────────
  const [tableResults, applianceResults, roomResults, homesResults] = await Promise.all([
    Promise.all(TABLE_CHECKS.map(t => checkTable(supabase, t).then(err => [t, err] as const))),
    Promise.all(APPLIANCE_COLUMNS.map(c => checkColumn(supabase, 'appliances', c).then(err => [c, err] as const))),
    Promise.all(ROOM_COLUMNS.map(c => checkColumn(supabase, 'rooms', c).then(err => [c, err] as const))),
    Promise.all(HOMES_COLUMNS.map(c => checkColumn(supabase, 'homes', c).then(err => [c, err] as const))),
  ])

  // ── Format results ─────────────────────────────────────────────────────────
  function toSection(pairs: readonly (readonly [string, string | null])[]) {
    return Object.fromEntries(
      pairs.map(([key, err]) => [key, err ? `✗  ${err}` : '✓'])
    )
  }

  const tables          = toSection(tableResults)
  const appliance_cols  = toSection(applianceResults)
  const room_cols       = toSection(roomResults)
  const homes_cols      = toSection(homesResults)

  const allResults = [...tableResults, ...applianceResults, ...roomResults, ...homesResults]
  const total  = allResults.length
  const failed = allResults.filter(([, err]) => err !== null).length
  const passed = total - failed

  return NextResponse.json(
    {
      ok: failed === 0,
      summary: { total, passed, failed },
      tables,
      appliance_columns: appliance_cols,
      room_columns: room_cols,
      homes_columns: homes_cols,
    },
    { status: failed === 0 ? 200 : 500 },
  )
}
