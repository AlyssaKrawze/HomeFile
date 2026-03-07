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

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  const isPdf = file.type === 'application/pdf'

  // 1. Upload receipt to storage
  const ext = file.name.split('.').pop() || 'jpg'
  const storagePath = `${homeId}/${crypto.randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(storagePath, buffer, { contentType: file.type })

  let receiptUrl: string | null = null
  if (uploadError) {
    // Storage upload failed — continue without storing the image
    // Most likely the "receipts" bucket doesn't exist
    console.error('Receipt storage upload failed:', uploadError.message)
  } else {
    const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(storagePath)
    receiptUrl = publicUrl.publicUrl
  }

  // 2. Extract receipt data with Claude Haiku vision
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

  try {
    const client = new Anthropic()

    const prompt = `Extract product/item information from this receipt or invoice. Return ONLY a JSON object with these fields:
- name (product/item name)
- brand (manufacturer/brand)
- model (model number)
- purchase_price (numeric, no currency symbol)
- purchase_date (YYYY-MM-DD format)
- store_vendor (store or vendor name)
- warranty_expiry (YYYY-MM-DD if visible)
- warranty_provider (warranty company if visible)
- warranty_contact (warranty phone/email if visible)
Use null for any field you cannot find. Do not include any explanation, just the JSON.`

    // Build the content block — PDFs use 'document' type, images use 'image' type
    const fileBlock = isPdf
      ? {
          type: 'document' as const,
          source: {
            type: 'base64' as const,
            media_type: 'application/pdf' as const,
            data: base64,
          },
        }
      : {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            data: base64,
          },
        }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            fileBlock,
            { type: 'text', text: prompt },
          ],
        },
      ],
    })

    const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        extracted = { ...extracted, ...parsed }
      } catch {
        // AI returned non-JSON — keep defaults
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Claude API error during receipt scan:', msg)
    return NextResponse.json(
      { error: `AI scan failed: ${msg}` },
      { status: 502 }
    )
  }

  // 3. Try to match an existing appliance by model number or name
  const { data: appliances } = await supabase
    .from('appliances')
    .select('id, name, model, room_id')
    .eq('home_id', homeId)

  let matchedAppliance: { id: string; name: string; model: string | null; room_id: string } | null = null
  if (appliances && appliances.length > 0) {
    if (extracted.model) {
      matchedAppliance = appliances.find(
        a => a.model && a.model.toLowerCase() === extracted.model!.toLowerCase()
      ) || null
    }
    if (!matchedAppliance && extracted.name) {
      matchedAppliance = appliances.find(
        a => a.name.toLowerCase() === extracted.name!.toLowerCase()
      ) || null
    }
  }

  if (matchedAppliance) {
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

    if (receiptUrl) {
      await supabase.from('documents').insert({
        home_id: homeId,
        appliance_id: matchedAppliance.id,
        name: `Receipt – ${extracted.name || matchedAppliance.name}`,
        file_url: receiptUrl,
        file_type: file.type,
        file_size: file.size,
        document_type: 'receipt',
        include_in_binder: true,
        created_by: user.id,
      })
    }

    return NextResponse.json({
      action: 'updated' as const,
      item_name: matchedAppliance.name,
    })
  }

  // 4. No match — try to insert as pending receipt
  const { error: pendingError } = await supabase.from('pending_receipts').insert({
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
    receipt_image_url: receiptUrl,
    scanned_by: user.id,
  })

  if (pendingError) {
    // pending_receipts table likely doesn't exist (migration 021 not applied)
    console.error('Failed to save pending receipt:', pendingError.message)
    // Still return success with the extracted data so the user sees results
    return NextResponse.json({
      action: 'scanned' as const,
      item_name: extracted.name || 'Unknown Item',
      extracted,
      warning: 'Receipt scanned but could not be saved. Run migration 021 to enable pending receipts.',
    })
  }

  return NextResponse.json({
    action: 'pending' as const,
    item_name: extracted.name || 'Unknown Item',
  })
}
