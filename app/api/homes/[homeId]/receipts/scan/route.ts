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

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  const mediaType = (file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'application/pdf') || 'image/jpeg'

  // Upload receipt to storage
  const ext = file.name.split('.').pop() || 'jpg'
  const storagePath = `${homeId}/${crypto.randomUUID()}.${ext}`
  await supabase.storage.from('receipts').upload(storagePath, buffer, {
    contentType: file.type,
  })
  const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(storagePath)

  // Extract receipt data with Claude Haiku vision
  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif', data: base64 },
          },
          {
            type: 'text',
            text: `Extract product/item information from this receipt or invoice. Return ONLY a JSON object with these fields:
- name (product/item name)
- brand (manufacturer/brand)
- model (model number)
- purchase_price (numeric, no currency symbol)
- purchase_date (YYYY-MM-DD format)
- store_vendor (store or vendor name)
- warranty_expiry (YYYY-MM-DD if visible)
- warranty_provider (warranty company if visible)
- warranty_contact (warranty phone/email if visible)
Use null for any field you cannot find. Do not include any explanation, just the JSON.`,
          },
        ],
      },
    ],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  let extracted = {
    name: null as string | null,
    brand: null as string | null,
    model: null as string | null,
    purchase_price: null as number | null,
    purchase_date: null as string | null,
    store_vendor: null as string | null,
    warranty_expiry: null as string | null,
    warranty_provider: null as string | null,
    warranty_contact: null as string | null,
  }
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      extracted = { ...extracted, ...parsed }
    } catch {
      // keep defaults
    }
  }

  // Try to match an existing appliance by model number or name
  const { data: appliances } = await supabase
    .from('appliances')
    .select('id, name, model, room_id')
    .eq('home_id', homeId)

  let matchedAppliance: { id: string; name: string; model: string | null; room_id: string } | null = null
  if (appliances && appliances.length > 0) {
    // Exact model match first
    if (extracted.model) {
      matchedAppliance = appliances.find(
        a => a.model && a.model.toLowerCase() === extracted.model!.toLowerCase()
      ) || null
    }
    // Fall back to case-insensitive name match
    if (!matchedAppliance && extracted.name) {
      matchedAppliance = appliances.find(
        a => a.name.toLowerCase() === extracted.name!.toLowerCase()
      ) || null
    }
  }

  if (matchedAppliance) {
    // Update appliance with receipt data
    const updates: Record<string, unknown> = {}
    if (extracted.purchase_price != null) updates.purchase_price = extracted.purchase_price
    if (extracted.purchase_date) updates.purchase_date = extracted.purchase_date
    if (extracted.warranty_expiry) updates.warranty_expiry = extracted.warranty_expiry
    if (extracted.warranty_provider) updates.warranty_provider = extracted.warranty_provider
    if (extracted.warranty_contact) updates.warranty_contact = extracted.warranty_contact
    if (extracted.brand) updates.brand = extracted.brand

    if (Object.keys(updates).length > 0) {
      await supabase.from('appliances').update(updates).eq('id', matchedAppliance.id)
    }

    // Attach receipt as a document
    await supabase.from('documents').insert({
      home_id: homeId,
      appliance_id: matchedAppliance.id,
      name: `Receipt – ${extracted.name || matchedAppliance.name}`,
      file_url: publicUrl.publicUrl,
      file_type: file.type,
      file_size: file.size,
      document_type: 'receipt',
      include_in_binder: true,
      created_by: user.id,
    })

    return NextResponse.json({
      action: 'updated' as const,
      item_name: matchedAppliance.name,
    })
  }

  // No match — insert as pending receipt
  await supabase.from('pending_receipts').insert({
    home_id: homeId,
    name: extracted.name || 'Unknown Item',
    brand: extracted.brand,
    model: extracted.model,
    category: null,
    purchase_price: extracted.purchase_price,
    purchase_date: extracted.purchase_date,
    store_vendor: extracted.store_vendor,
    warranty_expiry: extracted.warranty_expiry,
    warranty_provider: extracted.warranty_provider,
    warranty_contact: extracted.warranty_contact,
    receipt_image_url: publicUrl.publicUrl,
    scanned_by: user.id,
  })

  return NextResponse.json({
    action: 'pending' as const,
    item_name: extracted.name || 'Unknown Item',
  })
}
