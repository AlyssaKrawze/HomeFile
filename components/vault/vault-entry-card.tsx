'use client'

import { useState } from 'react'
import { Wifi, ShieldCheck, Car, DoorOpen, Key, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'
import type { VaultEntryDecrypted, VaultCategory } from '@/lib/types'

const CATEGORY_ICONS: Record<VaultCategory, React.ElementType> = {
  wifi: Wifi,
  alarm: ShieldCheck,
  garage: Car,
  gate: DoorOpen,
  custom: Key,
}

interface VaultEntryCardProps {
  entry: VaultEntryDecrypted
  homeId: string
  onDeleted: (id: string) => void
}

export default function VaultEntryCard({ entry, homeId, onDeleted }: VaultEntryCardProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState(false)

  const Icon = CATEGORY_ICONS[entry.category]

  function toggleReveal(field: string) {
    setRevealed(prev => ({ ...prev, [field]: !prev[field] }))
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${entry.label}"?`)) return
    setDeleting(true)
    const res = await fetch(`/api/homes/${homeId}/vault/entries/${entry.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDeleted(entry.id)
    } else {
      setDeleting(false)
    }
  }

  function MaskedField({ value, fieldKey, label }: { value: string; fieldKey: string; label: string }) {
    const isRevealed = revealed[fieldKey]
    return (
      <div>
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono ${isRevealed ? 'text-[#2F3437]' : 'text-slate-400 tracking-widest'}`}>
            {isRevealed ? value : '••••••••'}
          </span>
          <button
            onClick={() => toggleReveal(fieldKey)}
            className="text-slate-400 hover:text-[#5B6C8F] transition-colors"
            title={isRevealed ? 'Hide' : 'Show'}
          >
            {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2] p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#eef1f6] flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-[#5B6C8F]" />
          </div>
          <div>
            <p className="font-semibold text-[#2F3437] text-sm">{entry.label}</p>
            <p className="text-xs text-slate-400 capitalize">
              {entry.category === 'wifi' ? 'WiFi' :
               entry.category === 'alarm' ? 'Alarm Code' :
               entry.category === 'garage' ? 'Garage Code' :
               entry.category === 'gate' ? 'Gate Code' : 'Custom'}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-40"
          title="Delete entry"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#E0D9D0] pt-3">
        {entry.category === 'wifi' && (
          <>
            {entry.ssid && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Network (SSID)</p>
                <p className="text-sm text-[#2F3437]">{entry.ssid}</p>
              </div>
            )}
            {entry.password !== undefined && (
              <MaskedField value={entry.password} fieldKey="password" label="Password" />
            )}
          </>
        )}
        {(entry.category === 'alarm' || entry.category === 'garage' || entry.category === 'gate') && entry.code !== undefined && (
          <MaskedField value={entry.code} fieldKey="code" label="Code" />
        )}
        {entry.category === 'custom' && (
          <>
            {entry.fieldLabel && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Field</p>
                <p className="text-sm text-[#2F3437]">{entry.fieldLabel}</p>
              </div>
            )}
            {entry.fieldValue !== undefined && (
              <MaskedField value={entry.fieldValue} fieldKey="fieldValue" label="Value" />
            )}
          </>
        )}
        {entry.notes && (
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Notes</p>
            <p className="text-xs text-slate-600">{entry.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
