import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const { homeId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

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
    const { room_id, extracted, receipt_url, file_type, file_size } = body

    if (!room_id || !extracted) {
      return NextResponse.json({ error: 'Missing room_id or extracted data' }, { status: 400 })
    }

    const itemName = extracted.name || 'Unknown Item'

    // Create appliance
    const { data: newAppliance, error: appError } = await supabase.from('appliances').insert({
      home_id: homeId,
      room_id,
      name: itemName,
      brand: extracted.brand || null,
      model: extracted.model || null,
      purchase_price: extracted.purchase_price || null,
      purchase_date: extracted.purchase_date || null,
      warranty_expiry: extracted.warranty_expiry || null,
      warranty_provider: extracted.warranty_provider || null,
      warranty_contact: extracted.warranty_contact || null,
      include_in_binder: true,
    }).select('id').single()

    if (appError) {
      console.error('[receipt-save] Appliance insert failed:', appError.message)
      return NextResponse.json({ error: `Failed to create item: ${appError.message}` }, { status: 500 })
    }

    // Attach receipt as document
    const { error: docError } = await supabase.from('documents').insert({
      home_id: homeId,
      appliance_id: newAppliance.id,
      name: `Receipt – ${itemName}`,
      file_url: receipt_url || '',
      file_type: file_type || null,
      file_size: file_size || null,
      document_type: 'receipt',
      include_in_binder: true,
      created_by: user.id,
    })

    if (docError) {
      console.error('[receipt-save] Document insert failed:', docError.message, docError.code)
      return NextResponse.json({
        success: true,
        appliance_id: newAppliance.id,
        document_error: docError.message,
      })
    }

    return NextResponse.json({
      success: true,
      appliance_id: newAppliance.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[receipt-save] Unhandled error:', msg)
    return NextResponse.json({ error: `Save failed: ${msg}` }, { status: 500 })
  }
}
