'use client'

import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'

interface PageTooltipProps {
  pageKey: string
  title: string
  message: string
}

export default function PageTooltip({ pageKey, title, message }: PageTooltipProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check session-level skip first (synchronous, no flicker)
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(`tip_skip_${pageKey}`)) return
    }

    // Check DB for permanent "don't show again"
    fetch(`/api/onboarding/seen?page=${encodeURIComponent(pageKey)}`)
      .then(r => r.json())
      .then(data => { if (!data.seen) setVisible(true) })
      .catch(() => {})
  }, [pageKey])

  function skip() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`tip_skip_${pageKey}`, '1')
    }
    setVisible(false)
  }

  async function dismiss() {
    setVisible(false)
    try {
      await fetch('/api/onboarding/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageKey }),
      })
    } catch {
      // non-critical, ignore
    }
  }

  if (!visible) return null

  return (
    <div className="animate-fade-slide-down mb-6 rounded-2xl border border-[#bfcfdd] bg-[#eef1f6] px-5 py-4 flex gap-3 items-start">
      <Info size={17} className="text-[#5B6C8F] flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-playfair font-semibold text-[#2F3437] text-sm leading-snug mb-1">{title}</p>
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={dismiss}
            className="text-xs font-semibold bg-[#5B6C8F] hover:bg-[#4a5c77] text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Don&apos;t show again
          </button>
          <button
            onClick={skip}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
      <button
        onClick={skip}
        className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  )
}
