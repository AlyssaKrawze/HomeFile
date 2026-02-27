'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  X, ArrowRight, ArrowLeft,
  Sparkles, Home, LayoutGrid, Wrench, Calendar, BookOpen, Users,
} from 'lucide-react'

interface OnboardingModalProps {
  userId: string
  show: boolean
}

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to TheHomePage',
    description:
      "TheHomePage is your home's complete history — like CARFAX but for your house. Every appliance, every repair, every document, all in one place. Let's take a quick tour.",
  },
  {
    icon: Home,
    title: 'Add Your Home',
    description:
      'Start by giving your home a name, address, and year built. This becomes the foundation for everything — your inventory, maintenance schedule, and Home Binder PDF.',
  },
  {
    icon: LayoutGrid,
    title: 'Rooms & Inventory',
    description:
      'Organize your home into rooms, then add appliances to each one. Browse by room or view your full inventory at a glance. Click any appliance to see its complete history.',
  },
  {
    icon: Wrench,
    title: 'Appliance Details',
    description:
      'Every appliance gets its own record — model number, serial number, warranty expiration, service history, and manuals. Look up a model number to auto-fill specs instantly.',
  },
  {
    icon: Sparkles,
    title: 'AI Maintenance Scheduling',
    description:
      "Once your appliances are added, AI generates a personalized maintenance calendar based on each item's make, model, and your location. Filter changes, inspections, and seasonal prep — all handled for you.",
  },
  {
    icon: Calendar,
    title: 'Maintenance Calendar',
    description:
      'See all your tasks color-coded by status — overdue, upcoming, and completed. Mark tasks complete, assign them to household members, and get seasonal alerts based on your location.',
  },
  {
    icon: BookOpen,
    title: 'Home Binder',
    description:
      'Generate a complete PDF guide of your home with one click — every appliance, warranty info, service history, and emergency procedures. Perfect for insurance claims, house sitters, or home sales.',
  },
  {
    icon: Users,
    title: 'Members & Password Vault',
    description:
      'Add your housekeeper, landscaper, or family with custom permission levels. Use the Password Vault to securely store WiFi passwords, alarm codes, and gate PINs — encrypted and locked behind your personal PIN.',
  },
]

const LS_KEY = 'homefile_onboarding_seen'

export default function OnboardingModal({ userId, show: initialShow }: OnboardingModalProps) {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!initialShow) return
    if (localStorage.getItem(LS_KEY) !== 'true') {
      setShow(true)
    }
  }, [initialShow])
  const supabase = createClient()

  if (!show) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  async function dismiss() {
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Accent bar */}
        <div className="h-1 bg-[#5B6C8F]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={dismiss}
            className="text-slate-400 hover:text-slate-600 transition-colors -mr-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#dce4ef] flex items-center justify-center mb-5">
            <Icon size={26} className="text-[#5B6C8F]" />
          </div>

          {/* Text */}
          <h2 className="font-playfair text-xl font-bold text-[#2F3437] mb-2">
            {current.title}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Progress dots + navigation */}
          <div className="flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === step
                      ? 'w-5 h-2 bg-[#5B6C8F]'
                      : i < step
                      ? 'w-2 h-2 bg-[#5B6C8F] opacity-40'
                      : 'w-2 h-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {/* Skip — always visible on first step, Back on subsequent */}
              {step === 0 ? (
                <button
                  onClick={dismiss}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Skip
                </button>
              ) : (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              )}

              <button
                onClick={next}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#5B6C8F] hover:bg-[#4a5c77] px-4 py-2 rounded-lg transition-colors"
              >
                {isLast ? 'Get Started' : 'Next'}
                {!isLast && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
