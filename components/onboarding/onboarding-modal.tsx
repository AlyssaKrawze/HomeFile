'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Home, LayoutGrid, Sparkles, ArrowRight, Download } from 'lucide-react'

interface OnboardingModalProps {
  userId: string
  show: boolean
}

const STEPS = [
  {
    icon: Home,
    iconBg: 'bg-[#dce4ef]',
    iconColor: 'text-[#5B6C8F]',
    accent: 'bg-[#5B6C8F]',
    eyebrow: 'Step 1 of 3',
    title: 'Add your home',
    description:
      "Start by giving your home a name, address, and year built. This becomes the foundation for everything — your appliances, maintenance schedule, and Home Binder PDF.",
    detail: [
      '🏠  Name (e.g. "The Smith House")',
      '📍  Address, city, state',
      '📅  Year built',
    ],
  },
  {
    icon: LayoutGrid,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accent: 'bg-blue-600',
    eyebrow: 'Step 2 of 3',
    title: 'Add rooms & appliances',
    description:
      'Divide your home into rooms, then add appliances to each one. Track model numbers, serial numbers, purchase dates, warranties, and service history for everything.',
    detail: [
      '🛋️  Rooms — Kitchen, HVAC, Garage, etc.',
      '📦  Appliances — refrigerator, water heater, HVAC…',
      '🔍  Look up a model number to auto-fill specs',
    ],
  },
  {
    icon: Sparkles,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    accent: 'bg-purple-600',
    eyebrow: 'Step 3 of 3',
    title: 'Let AI build your schedule',
    description:
      "Once your appliances are in, AI generates a maintenance schedule tailored to each item — filter changes, inspections, seasonal prep — and flags anything overdue.",
    detail: [
      '🤖  AI suggests tasks based on model & location',
      '📆  Maintenance calendar with overdue alerts',
      '📄  One-click Home Binder PDF for everything',
    ],
  },
]

const LS_KEY = 'homefile_onboarding_seen'

export default function OnboardingModal({ userId, show: initialShow }: OnboardingModalProps) {
  const [show, setShow] = useState(() => {
    // Server already knows this user has completed onboarding — don't show.
    if (!initialShow) return false
    // Fallback: localStorage catches the case where the DB migration hasn't
    // been applied yet or the update previously failed silently.
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LS_KEY) !== 'true'
    }
    return true
  })
  const [step, setStep] = useState(0)
  const supabase = createClient()

  if (!show) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  async function dismiss() {
    // Persist locally first so it takes effect immediately on next render,
    // even if the Supabase update is slow or the column doesn't exist yet.
    localStorage.setItem(LS_KEY, 'true')
    setShow(false)
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId)
  }

  function next() {
    if (isLast) {
      dismiss()
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Accent bar */}
        <div className={`h-1 ${current.accent} transition-all duration-300`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {current.eyebrow}
          </span>
          <button
            onClick={dismiss}
            className="text-slate-400 hover:text-slate-600 transition-colors -mr-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${current.iconBg} flex items-center justify-center mb-5`}>
            <Icon size={26} className={current.iconColor} />
          </div>

          {/* Text */}
          <h2 className="font-playfair text-xl font-bold text-[#2F3437] mb-2">{current.title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">{current.description}</p>

          {/* Detail list */}
          <ul className="flex flex-col gap-2 mb-7">
            {current.detail.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 bg-[#F4F1EA] rounded-lg px-3 py-2">
                {item}
              </li>
            ))}
          </ul>

          {/* Guide download — only on last step */}
          {isLast && (
            <a
              href="/api/guide"
              download
              className="flex items-center justify-center gap-2 w-full text-xs text-slate-400 hover:text-slate-600 transition-colors mb-5 py-2 rounded-lg border border-[#C8BFB2] hover:border-slate-300"
            >
              <Download size={12} />
              Download Getting Started Guide (PDF)
            </a>
          )}

          {/* Step dots + actions */}
          <div className="flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === step
                      ? `w-5 h-2 ${current.accent}`
                      : i < step
                      ? `w-2 h-2 ${current.accent} opacity-40`
                      : 'w-2 h-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Back
                </button>
              )}
              {step === 0 && (
                <button
                  onClick={dismiss}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Don&apos;t show again
                </button>
              )}
              <button
                onClick={next}
                className={`flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors ${
                  isLast
                    ? 'bg-[#5B6C8F] hover:bg-[#4a5c77]'
                    : current.accent + ' hover:opacity-90'
                }`}
              >
                {isLast ? "Let's go" : 'Next'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
