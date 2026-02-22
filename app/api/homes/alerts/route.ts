import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { city, state } = await req.json()

  if (!city && !state) {
    return NextResponse.json({ alerts: [] })
  }

  const location = [city, state].filter(Boolean).join(', ')
  const month = new Date().toLocaleString('en-US', { month: 'long' })

  const prompt = `You are a home maintenance expert. Generate seasonal home maintenance alerts for a homeowner.

LOCATION: ${location}
CURRENT MONTH: ${month}

Generate 3-5 relevant, actionable seasonal alerts based on the location's climate and current time of year. For example:
- Cold-climate areas (Midwest, Northeast, Mountain) in fall/winter: pipe winterization, heating system checks, roof ice dam prevention, chimney inspection
- Hot/humid areas (Southeast, Gulf Coast) in summer: AC tune-ups, humidity and mold checks, hurricane prep (June–November)
- Wildfire-prone areas (California, Pacific Northwest, Rockies) in summer: defensible space, gutter clearing, ember-resistant vents
- Spring everywhere: HVAC filter change, gutter cleaning, roof inspection after winter
- Be specific to the location's actual seasonal risks

Return ONLY a JSON object:
{
  "alerts": [
    {
      "title": "Short alert title (max 60 chars)",
      "description": "1-2 sentences explaining why this matters right now for this location.",
      "urgency": "info|warning|danger",
      "checklist": ["Action item 1", "Action item 2", "Action item 3"]
    }
  ]
}

Rules:
- urgency "danger" = time-sensitive safety risk (e.g. freeze warning, hurricane season active)
- urgency "warning" = important maintenance that should happen soon
- urgency "info" = good-to-know seasonal tip
- Each checklist should have 3-5 specific, actionable items
- Return ONLY valid JSON, no markdown fencing`

  try {
    const aiResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = aiResponse.content.find(b => b.type === 'text')
    if (textBlock?.type === 'text') {
      const match = textBlock.text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed.alerts)) {
          return NextResponse.json({ alerts: parsed.alerts })
        }
      }
    }
  } catch {
    // fall through
  }

  return NextResponse.json({ alerts: [] })
}
