import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { HomeBinderPDF, type ApplianceForBinder, type HomeForBinder } from '@/components/binder/home-binder-pdf'

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

  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [{ data: home }, { data: appliances }, { data: serviceRecords }] = await Promise.all([
    supabase
      .from('homes')
      .select('name, address, city, state, zip, year_built')
      .eq('id', homeId)
      .single(),
    supabase
      .from('appliances')
      .select(`
        id, name, category, brand, model, serial_number,
        purchase_date, installation_date, warranty_expiry, warranty_provider,
        notes, disaster_plan,
        rooms(name)
      `)
      .eq('home_id', homeId)
      .eq('include_in_binder', true),
    supabase
      .from('service_records')
      .select('appliance_id, service_date')
      .eq('home_id', homeId)
      .order('service_date', { ascending: false }),
  ])

  if (!home) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Last service date per appliance
  const lastService = new Map<string, string>()
  for (const sr of serviceRecords ?? []) {
    if (!lastService.has(sr.appliance_id)) lastService.set(sr.appliance_id, sr.service_date)
  }

  const homeData: HomeForBinder = {
    name: home.name,
    address: home.address,
    city: home.city,
    state: home.state,
    zip: home.zip,
    year_built: home.year_built,
  }

  const applianceData: ApplianceForBinder[] = (appliances ?? [])
    .map(a => ({
      id: a.id,
      name: a.name,
      category: a.category,
      brand: a.brand,
      model: a.model,
      serial_number: a.serial_number,
      purchase_date: a.purchase_date,
      installation_date: a.installation_date,
      warranty_expiry: a.warranty_expiry,
      warranty_provider: a.warranty_provider,
      notes: a.notes,
      disaster_plan: a.disaster_plan,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      room_name: (a.rooms as any)?.name ?? 'Unknown Room',
      last_service_date: lastService.get(a.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.room_name !== b.room_name) return a.room_name.localeCompare(b.room_name)
      return a.name.localeCompare(b.name)
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(HomeBinderPDF, { home: homeData, appliances: applianceData }) as any
  const buffer = await renderToBuffer(element)

  const safeName = home.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}-home-binder.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
