'use client'

import { useState } from 'react'

interface NotificationPrefs {
  month: boolean
  week: boolean
  day: boolean
}

const LABELS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'month', label: '1 month before due date' },
  { key: 'week', label: '1 week before due date' },
  { key: 'day', label: '1 day before due date' },
]

export default function NotificationToggles({
  homeId,
  initialPrefs,
}: {
  homeId: string
  initialPrefs: NotificationPrefs
}) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs)
  const [saving, setSaving] = useState<keyof NotificationPrefs | null>(null)

  async function toggle(key: keyof NotificationPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSaving(key)
    await fetch(`/api/homes/${homeId}/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setSaving(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {LABELS.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm text-slate-700">{label}</span>
          <button
            onClick={() => toggle(key)}
            disabled={saving === key}
            className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
              prefs[key] ? 'bg-[#5B6C8F]' : 'bg-slate-200'
            } ${saving === key ? 'opacity-60' : ''}`}
            aria-checked={prefs[key]}
            role="switch"
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${prefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
    </div>
  )
}
