'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle2, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { type Appliance, type ServiceRecord, type AISuggestion, PRIORITY_LABELS } from '@/lib/types'

interface AISuggestionsSectionProps {
  appliance: Appliance
  homeId: string
  serviceRecords: ServiceRecord[]
  canManage: boolean
  userId: string
  city?: string | null
  state?: string | null
}

export default function AISuggestionsSection({
  appliance, homeId, serviceRecords, canManage, userId, city, state
}: AISuggestionsSectionProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<number | null>(null)
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<number | null>(null)
  const [generated, setGenerated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function generateSuggestions() {
    setLoading(true)
    setError(null)
    setSuggestions([])
    setDismissed(new Set())

    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appliance: {
            name: appliance.name,
            category: appliance.category,
            brand: appliance.brand,
            model: appliance.model,
            purchase_date: appliance.purchase_date,
            installation_date: appliance.installation_date,
            warranty_expiry: appliance.warranty_expiry,
          },
          serviceHistory: serviceRecords.map(r => ({
            date: r.service_date,
            type: r.service_type,
            description: r.description,
            next_service_date: r.next_service_date,
          })),
          location: { city: city ?? null, state: state ?? null },
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to generate suggestions')
      }

      // Stream the response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
        }
      }

      // Parse the accumulated JSON
      const result = JSON.parse(buffer)
      setSuggestions(result.suggestions || [])
      setGenerated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function acceptSuggestion(suggestion: AISuggestion, index: number) {
    setAccepting(index)

    await supabase.from('scheduled_tasks').insert({
      home_id: homeId,
      appliance_id: appliance.id,
      title: suggestion.title,
      description: suggestion.description,
      due_date: suggestion.due_date,
      priority: suggestion.priority,
      source: 'ai',
      ai_reasoning: suggestion.reasoning,
      created_by: userId,
    })

    setAccepting(null)
    router.refresh()
  }

  function dismiss(index: number) {
    setDismissed(prev => new Set([...prev, index]))
  }

  const visibleSuggestions = suggestions.filter((_, i) => !dismissed.has(i))

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      <div className="px-5 py-4 border-b border-[#E0D9D0]">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-[#6B7EB8]" />
          <h2 className="font-semibold text-[#2F3437]">AI Suggestions</h2>
        </div>
        <p className="text-xs text-slate-500">
          Claude analyzes your appliance and service history to suggest maintenance tasks.
        </p>
      </div>

      <div className="px-5 py-4">
        {!canManage ? (
          <p className="text-xs text-slate-500 text-center py-4">
            Only owners and managers can generate AI suggestions.
          </p>
        ) : (
          <>
            {/* Generate button */}
            {(!generated || suggestions.length === 0) && !loading && (
              <button
                onClick={generateSuggestions}
                className="w-full flex items-center justify-center gap-2 bg-[#6B7EB8] hover:bg-[#5B6C8F] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Sparkles size={15} />
                {generated ? 'Generate Again' : 'Generate Suggestions'}
              </button>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 size={24} className="text-[#6B7EB8] animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">Analyzing appliance data...</p>
                  <p className="text-xs text-slate-400 mt-1">Claude is reviewing your service history</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs text-red-700">{error}</p>
                <button
                  onClick={generateSuggestions}
                  className="text-xs text-red-600 underline mt-1"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Suggestions */}
            {visibleSuggestions.length > 0 && (
              <div className="flex flex-col gap-3">
                {suggestions.map((suggestion, i) => {
                  if (dismissed.has(i)) return null
                  const priority = PRIORITY_LABELS[suggestion.priority]
                  const isExpanded = expanded === i
                  return (
                    <div
                      key={i}
                      className="border border-[#c5ccdf] bg-[#eef0f7] rounded-xl p-4"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-[#2F3437]">
                              {suggestion.title}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>
                              {priority.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Due: {new Date(suggestion.due_date).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => dismiss(i)}
                          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                        {suggestion.description}
                      </p>

                      {/* Reasoning toggle */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : i)}
                        className="flex items-center gap-1 text-xs text-[#6B7EB8] mt-2"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        Why this suggestion?
                      </button>

                      {isExpanded && (
                        <p className="text-xs text-slate-500 mt-2 bg-white/60 rounded-lg p-2 leading-relaxed">
                          {suggestion.reasoning}
                        </p>
                      )}

                      {/* Accept button */}
                      <button
                        onClick={() => acceptSuggestion(suggestion, i)}
                        disabled={accepting === i}
                        className="w-full mt-3 flex items-center justify-center gap-1.5 bg-white border border-[#c5ccdf] hover:bg-[#6B7EB8] hover:text-white hover:border-[#6B7EB8] text-[#6B7EB8] text-xs font-medium px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                      >
                        {accepting === i ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {accepting === i ? 'Adding...' : 'Add to Schedule'}
                      </button>
                    </div>
                  )
                })}

                {/* Regenerate button */}
                <button
                  onClick={generateSuggestions}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-[#6B7EB8] transition-colors py-1"
                >
                  <Sparkles size={11} />
                  Regenerate suggestions
                </button>
              </div>
            )}

            {generated && visibleSuggestions.length === 0 && !loading && (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500">All suggestions dismissed.</p>
                <button
                  onClick={generateSuggestions}
                  className="text-xs text-[#6B7EB8] underline mt-1"
                >
                  Generate new suggestions
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
