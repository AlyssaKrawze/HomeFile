'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Loader2 } from 'lucide-react'

interface DisasterPlanSectionProps {
  applianceId: string
  initialPlan: string | null
  canManage: boolean
}

export default function DisasterPlanSection({ applianceId, initialPlan, canManage }: DisasterPlanSectionProps) {
  const [enabled, setEnabled] = useState(Boolean(initialPlan))
  const [plan, setPlan] = useState(initialPlan ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggle(checked: boolean) {
    setEnabled(checked)
    setSaved(false)
    if (!checked) {
      setSaving(true)
      await supabase.from('appliances').update({ disaster_plan: null }).eq('id', applianceId)
      setSaving(false)
      setPlan('')
      router.refresh()
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await supabase.from('appliances').update({ disaster_plan: plan.trim() || null }).eq('id', applianceId)
    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber-500" />
          <h2 className="text-base font-semibold text-[#2F3437]">Disaster / Storm Plan</h2>
        </div>
        {canManage && (
          <label className="relative inline-flex items-center cursor-pointer gap-2">
            <span className="text-xs text-slate-500">Has plan</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => handleToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#5B6C8F] transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
        )}
      </div>

      {!enabled ? (
        <p className="text-sm text-slate-500 leading-relaxed">
          {canManage
            ? 'Enable to add emergency or storm procedures — e.g. "Turn off water heater during ice storms." These appear in your Home Binder\'s disaster SOP section.'
            : 'No disaster or storm plan has been set for this appliance.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            What should be done with this appliance during an emergency, storm, or extended power outage?
          </p>
          {canManage ? (
            <>
              <textarea
                value={plan}
                onChange={e => { setPlan(e.target.value); setSaved(false) }}
                placeholder="e.g. Shut off main water valve before evacuating. Turn off gas supply and set to pilot mode during ice storms. Switch to generator bypass during outages."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] resize-none"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !plan.trim()}
                  className="flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? 'Saving...' : 'Save plan'}
                </button>
                {saved && <span className="text-xs text-[#5B6C8F]">Saved ✓</span>}
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {plan || 'No plan entered yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
