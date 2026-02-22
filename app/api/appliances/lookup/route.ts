import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Homefile/1.0)' },
    })
    if (!res.ok) return ''
    const html = await res.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000)
  } catch {
    return ''
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand')?.trim() ?? ''
  const serialNumber = searchParams.get('serialNumber')?.trim() ?? ''
  const model = searchParams.get('model')?.trim() ?? ''

  if (!serialNumber && !model) {
    return NextResponse.json({ found: false })
  }

  try {
    // Build query: model is most useful for product lookup, serial as fallback
    const queryParts = [brand, model || serialNumber].filter(Boolean)
    const query = queryParts.join(' ')

    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) return NextResponse.json({ found: false })

    const data = await res.json()
    const item = data?.items?.[0]
    if (!item) return NextResponse.json({ found: false })

    // Try to fetch product page for richer content (e.g. retailer page with full specs)
    const productUrl: string = item.offers?.[0]?.link ?? ''
    const pageText = productUrl ? await fetchPageText(productUrl) : ''

    const rawDescription = Array.isArray(item.description)
      ? item.description.join('\n')
      : (item.description ?? '')

    const productInfo = [
      `Product: ${item.title ?? ''}`,
      `Brand: ${item.brand ?? brand}`,
      `Model: ${item.model ?? model}`,
      `Category: ${item.category ?? ''}`,
      rawDescription ? `Description:\n${rawDescription}` : '',
    ].filter(Boolean).join('\n')

    const prompt = `You are a home appliance maintenance expert. Analyze this product and provide specific, practical maintenance guidance.

PRODUCT:
${productInfo}${pageText ? `\n\nPRODUCT PAGE (excerpt):\n${pageText}` : ''}

Return ONLY a JSON object with this exact structure:
{
  "notes": "Maintenance summary using bullet points (• format). 3-5 specific, actionable points covering service intervals, filter changes, cleaning procedures, inspections, and care tips for this specific product.",
  "tasks": [
    {
      "title": "Task name (max 60 chars)",
      "description": "Specific instructions for this appliance model (1-2 sentences)",
      "monthsFromNow": 3,
      "priority": "low|medium|high"
    }
  ]
}

Generate 3-5 realistic scheduled maintenance tasks spaced over 6-24 months based on this appliance type and any manufacturer intervals you can infer. Return ONLY valid JSON.`

    let notes = rawDescription
    let tasks: Array<{ title: string; description: string; monthsFromNow: number; priority: string }> = []

    try {
      const aiResponse = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      })
      const textBlock = aiResponse.content.find(b => b.type === 'text')
      if (textBlock?.type === 'text') {
        const match = textBlock.text.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0])
          if (parsed.notes) notes = parsed.notes
          if (Array.isArray(parsed.tasks)) tasks = parsed.tasks
        }
      }
    } catch {
      // Claude call failed — still return product info with raw description
    }

    return NextResponse.json({
      found: true,
      model: item.model ?? '',
      name: item.title ?? '',
      brand: item.brand ?? '',
      category: item.category ?? '',
      notes,
      tasks,
    })
  } catch {
    return NextResponse.json({ found: false })
  }
}
