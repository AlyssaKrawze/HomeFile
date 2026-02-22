import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { appliance, serviceHistory, location } = body

  if (!appliance?.name) {
    return NextResponse.json({ error: 'Appliance information required' }, { status: 400 })
  }

  // Calculate appliance age
  const installDate = appliance.installation_date || appliance.purchase_date
  const ageYears = installDate
    ? Math.floor((Date.now() - new Date(installDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  const lastService = serviceHistory?.[0]
  const daysSinceService = lastService
    ? Math.floor((Date.now() - new Date(lastService.date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const today = new Date().toISOString().split('T')[0]

  const locationLine = location?.city && location?.state
    ? `${location.city}, ${location.state}`
    : location?.state || location?.city || null

  const prompt = `You are a home maintenance expert. Analyze this appliance and generate 3-5 specific, actionable maintenance task suggestions.
${locationLine ? `
HOME LOCATION: ${locationLine}
Use this to tailor suggestions to the local climate. Examples: cold-climate homes (Wisconsin, Minnesota, etc.) need pipe winterization, outdoor faucet shutoff, heating system prep; humid/hot climates (Florida, Texas, etc.) need extra AC maintenance, mold/humidity checks, hurricane prep; dry climates (Arizona, Nevada) need humidifier maintenance, dust/filter checks more frequently. Prioritize seasonally relevant tasks based on the region.
` : ''}
APPLIANCE:
- Name: ${appliance.name}
- Category: ${appliance.category || 'General'}
- Brand: ${appliance.brand || 'Unknown'}
- Model: ${appliance.model || 'Unknown'}
- Age: ${ageYears !== null ? `${ageYears} years old` : 'Unknown'}
- Warranty expires: ${appliance.warranty_expiry || 'Unknown or expired'}

SERVICE HISTORY:
${serviceHistory && serviceHistory.length > 0
  ? serviceHistory.slice(0, 5).map((s: Record<string, string>) =>
      `- ${s.date}: ${s.type} — ${s.description}${s.next_service_date ? ` (next service: ${s.next_service_date})` : ''}`
    ).join('\n')
  : '- No service history recorded'
}
${daysSinceService !== null ? `Days since last service: ${daysSinceService}` : ''}

TODAY'S DATE: ${today}

Generate maintenance suggestions as a JSON object with this exact structure:
{
  "suggestions": [
    {
      "title": "Brief task name (max 60 chars)",
      "description": "What to do and why (2-3 sentences)",
      "due_date": "YYYY-MM-DD (date when this should be done)",
      "priority": "low|medium|high|urgent",
      "reasoning": "Why this is needed based on the appliance data (1-2 sentences)"
    }
  ]
}

Guidelines:
- Due dates should be realistic (spread over next 6-18 months based on urgency)
- Consider the appliance age, type, and service history gaps
- Suggest manufacturer-recommended maintenance intervals
- Flag anything that might be overdue based on gaps in service history
- For HVAC: filter changes (every 3 months), annual tune-up
- For water heaters: annual flushing, anode rod inspection every 2-3 years
- For refrigerators: coil cleaning annually, door gasket check
- For washers/dryers: drum cleaning, vent cleaning
- Return ONLY valid JSON, no other text`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract text content (skip thinking blocks)
    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Parse JSON from response
    const text = textContent.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])

    if (!Array.isArray(result.suggestions)) {
      return NextResponse.json({ error: 'Invalid suggestions format' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('AI suggestions error:', err)
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API error: ${err.message}` },
        { status: err.status || 500 }
      )
    }
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
