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

    // ── Step 1: Auth ──────────────────────────────────────
    step = 'auth'
    console.log('[receipt-scan] Step 1: Authenticating user')
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
    console.log('[receipt-scan] Auth OK — role:', membership.role)

    // ── Step 2: Read file ─────────────────────────────────
    step = 'read-file'
    console.log('[receipt-scan] Step 2: Reading uploaded file')
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
    console.log('[receipt-scan] File OK — name:', file.name, 'type:', file.type, 'size:', buffer.length, 'bytes')

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty', step }, { status: 400 })
    }

    // ── Step 3: Upload to Supabase Storage ────────────────
    step = 'storage-upload'
    console.log('[receipt-scan] Step 3: Uploading to Supabase Storage bucket "receipts"')
    const ext = file.name.split('.').pop() || 'jpg'
    const storagePath = `${homeId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(storagePath, buffer, { contentType: file.type })

    let receiptUrl: string | null = null
    if (uploadError) {
      console.error('[receipt-scan] Storage upload FAILED:', uploadError.message)
      console.error('[receipt-scan] This usually means the "receipts" bucket does not exist in Supabase Storage.')
      console.error('[receipt-scan] Create it in Supabase Dashboard → Storage → New Bucket → name: "receipts", public: true')
      // Non-fatal — continue without stored file
    } else {
      const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(storagePath)
      receiptUrl = publicUrl.publicUrl
      console.log('[receipt-scan] Storage upload OK — URL:', receiptUrl)
    }

    // ── Step 4: Claude AI vision extraction ───────────────
    step = 'claude-api'
    console.log('[receipt-scan] Step 4: Calling Claude Haiku vision API')

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('[receipt-scan] ANTHROPIC_API_KEY is not set!')
      return NextResponse.json(
        { error: 'AI service not configured — ANTHROPIC_API_KEY environment variable is missing', step },
        { status: 500 }
      )
    }
    console.log('[receipt-scan] ANTHROPIC_API_KEY is set (starts with:', apiKey.substring(0, 8) + '...)')

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
        messages: [
          {
            role: 'user',
            content: [fileBlock, { type: 'text', text: prompt }],
          },
        ],
      })
      console.log('[receipt-scan] Claude API OK — stop_reason:', message.stop_reason)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[receipt-scan] Claude API FAILED:', msg)
      return NextResponse.json(
        { error: `AI scan failed: ${msg}`, step },
        { status: 502 }
      )
    }

    const aiText = message.content[0]?.type === 'text' ? message.content[0].text : ''
    console.log('[receipt-scan] Claude raw response:', aiText.substring(0, 500))

    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        extracted = { ...extracted, ...parsed }
        console.log('[receipt-scan] Parsed extraction:', JSON.stringify(extracted))
      } catch (e) {
        console.error('[receipt-scan] JSON parse failed on AI output:', e)
      }
    } else {
      console.warn('[receipt-scan] No JSON found in AI response')
    }

    // ── Step 5: Match existing appliance ──────────────────
    step = 'match-appliance'
    console.log('[receipt-scan] Step 5: Matching against existing appliances')
    const { data: appliances, error: appError } = await supabase
      .from('appliances')
      .select('id, name, model, room_id')
      .eq('home_id', homeId)

    if (appError) {
      console.error('[receipt-scan] Appliance query failed:', appError.message)
    }

    let matchedAppliance: { id: string; name: string; model: string | null; room_id: string } | null = null
    if (appliances && appliances.length > 0) {
      console.log('[receipt-scan] Found', appliances.length, 'appliances to match against')
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
      console.log('[receipt-scan] Matched appliance:', matchedAppliance.name, matchedAppliance.id)
      step = 'update-appliance'
      const updates: Record<string, unknown> = {}
      if (extracted.purchase_price != null) updates.purchase_price = extracted.purchase_price
      if (extracted.purchase_date) updates.purchase_date = extracted.purchase_date
      if (extracted.warranty_expiry) updates.warranty_expiry = extracted.warranty_expiry
      if (extracted.warranty_provider) updates.warranty_provider = extracted.warranty_provider
      if (extracted.warranty_contact) updates.warranty_contact = extracted.warranty_contact
      if (extracted.brand) updates.brand = extracted.brand

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase.from('appliances').update(updates).eq('id', matchedAppliance.id)
        if (updateErr) console.error('[receipt-scan] Appliance update failed:', updateErr.message)
        else console.log('[receipt-scan] Appliance updated with:', Object.keys(updates).join(', '))
      }

      if (receiptUrl) {
        const { error: docErr } = await supabase.from('documents').insert({
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
        if (docErr) console.error('[receipt-scan] Document insert failed:', docErr.message)
        else console.log('[receipt-scan] Receipt document attached')
      }

      console.log('[receipt-scan] DONE — action: updated')
      return NextResponse.json({
        action: 'updated' as const,
        item_name: matchedAppliance.name,
      })
    }

    // ── Step 6: Save as pending receipt ───────────────────
    step = 'save-pending'
    console.log('[receipt-scan] Step 6: No match — saving as pending receipt')
    const itemName = extracted.name || 'Unknown Item'
    const { error: pendingError } = await supabase.from('pending_receipts').insert({
      home_id: homeId,
      name: itemName,
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
      console.error('[receipt-scan] pending_receipts insert FAILED:', pendingError.message)
      console.error('[receipt-scan] The "pending_receipts" table probably does not exist.')
      console.error('[receipt-scan] Run: supabase db push  (or apply migration 021_pending_receipts.sql)')
      // Return extracted data so the user still sees something useful
      return NextResponse.json({
        action: 'scanned' as const,
        item_name: itemName,
        extracted,
        warning: `Scanned OK but could not save: ${pendingError.message}`,
      })
    }

    console.log('[receipt-scan] DONE — action: pending, item:', itemName)
    return NextResponse.json({
      action: 'pending' as const,
      item_name: itemName,
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[receipt-scan] UNHANDLED error at step "${step}":`, msg)
    console.error(err)
    return NextResponse.json(
      { error: `Receipt scan failed at step "${step}": ${msg}`, step },
      { status: 500 }
    )
  }
}
