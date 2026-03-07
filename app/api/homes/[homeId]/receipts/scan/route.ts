import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  let step = 'init'
  try {
    const { homeId } = await params

    step = 'auth'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not logged in', step }, { status: 401 })

    const { data: membership } = await supabase
      .from('home_members')
      .select('role')
      .eq('home_id', homeId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'You need owner or manager role to scan receipts', step }, { status: 403 })
    }

    step = 'read-file'
    let formData: FormData
    try {
      formData = await req.formData()
    } catch (e) {
      console.error('[receipt-scan] FormData parse failed:', e)
      return NextResponse.json({ error: 'Could not read uploaded file', step }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file attached', step }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const isPdf = file.type === 'application/pdf'

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty', step }, { status: 400 })
    }

    // Upload receipt to storage (non-fatal if bucket missing)
    step = 'storage-upload'
    const ext = file.name.split('.').pop() || 'jpg'
    const storagePath = `${homeId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(storagePath, buffer, { contentType: file.type })

    let receiptUrl: string | null = null
    if (uploadError) {
      console.error('[receipt-scan] Storage upload failed:', uploadError.message)
    } else {
      const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(storagePath)
      receiptUrl = publicUrl.publicUrl
    }

    // Claude AI vision extraction
    step = 'claude-api'
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured — ANTHROPIC_API_KEY environment variable is missing', step },
        { status: 500 }
      )
    }

    const base64 = buffer.toString('base64')
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

    const fileBlock = isPdf
      ? {
          type: 'document' as const,
          source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
        }
      : {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            data: base64,
          },
        }

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

    let message
    try {
      const client = new Anthropic()
      message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: [fileBlock, { type: 'text', text: prompt }] }],
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[receipt-scan] Claude API failed:', msg)
      return NextResponse.json({ error: `AI scan failed: ${msg}`, step }, { status: 502 })
    }

    const aiText = message.content[0]?.type === 'text' ? message.content[0].text : ''
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        extracted = { ...extracted, ...JSON.parse(jsonMatch[0]) }
      } catch {
        // keep defaults
      }
    }

    // Match existing appliance
    step = 'match-appliance'
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

    // Match found → update appliance + attach receipt document
    if (matchedAppliance) {
      step = 'update-appliance'
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

    // No match → return extracted data so client can prompt for room
    return NextResponse.json({
      action: 'needs_room' as const,
      extracted,
      receipt_url: receiptUrl,
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[receipt-scan] UNHANDLED error at step "${step}":`, msg)
    return NextResponse.json(
      { error: `Receipt scan failed at step "${step}": ${msg}`, step },
      { status: 500 }
    )
  }
}
