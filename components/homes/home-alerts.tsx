'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Info, Bell, Loader2, RefreshCw } from 'lucide-react'

interface Alert {
  title: string
  description: string
  urgency: 'info' | 'warning' | 'danger'
  checklist: string[]
}

interface HomeAlertsProps {
  city: string | null
  state: string | null
}

const URGENCY_STYLES = {
  danger: {
    card: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    description: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    check: 'text-red-400',
  },
  warning: {
    card: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    description: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    check: 'text-amber-400',
  },
  info: {
    card: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    description: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    check: 'text-blue-400',
  },
}

const URGENCY_LABELS = {
  danger: 'Urgent',
  warning: 'Action needed',
  info: 'Tip',
}

function UrgencyIcon({ urgency }: { urgency: Alert['urgency'] }) {
  const cls = URGENCY_STYLES[urgency].icon
  if (urgency === 'danger') return <AlertTriangle size={18} className={cls} />
  if (urgency === 'warning') return <AlertTriangle size={18} className={cls} />
  return <Info size={18} className={cls} />
}

export default function HomeAlerts({ city, state }: HomeAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const location = [city, state].filter(Boolean).join(', ')
  const hasLocation = Boolean(city || state)

  async function generate() {
    if (!hasLocation) return
    setLoading(true)
    try {
      const res = await fetch('/api/homes/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state }),
      })
      const data = await res.json()
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
      setGenerated(true)
    }
  }

  useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!hasLocation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200">
        <Bell size={40} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No location set</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Add your home&apos;s city and state in Settings to get seasonal maintenance alerts tailored to your area.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200">
        <Loader2 size={32} className="text-teal-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500">Generating alerts for {location}...</p>
      </div>
    )
  }

  if (generated && alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200">
        <Bell size={40} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No alerts right now</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-4">
          Your home in {location} looks good for this time of year.
        </p>
        <button
          onClick={generate}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Seasonal alerts for <span className="font-medium text-slate-700">{location}</span>
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {alerts.map((alert, i) => {
        const s = URGENCY_STYLES[alert.urgency] ?? URGENCY_STYLES.info
        return (
          <div key={i} className={`rounded-2xl border p-5 ${s.card}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <UrgencyIcon urgency={alert.urgency} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={`text-sm font-semibold ${s.title}`}>{alert.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
                    {URGENCY_LABELS[alert.urgency]}
                  </span>
                </div>
                <p className={`text-sm mb-3 ${s.description}`}>{alert.description}</p>
                {alert.checklist?.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {alert.checklist.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className={`mt-0.5 flex-shrink-0 ${s.check}`}>•</span>
                        <span className={`text-sm ${s.description}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
