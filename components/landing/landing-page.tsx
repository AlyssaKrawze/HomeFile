'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  Home,
  Wrench,
  Calendar,
  Shield,
  FileText,
  Users,
  ArrowRight,
  Check,
  Star,
  Menu,
  X,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Home,
    title: 'Appliance Inventory',
    description: 'Track every appliance, warranty, and manual in one place. Never lose a receipt again.',
  },
  {
    icon: Wrench,
    title: 'Service History',
    description: 'Log every repair, service call, and maintenance event with dates, costs, and provider details.',
  },
  {
    icon: Calendar,
    title: 'AI Maintenance Scheduling',
    description: 'Claude AI analyzes your appliances and generates smart maintenance reminders before things break.',
  },
  {
    icon: Shield,
    title: 'Encrypted Vault',
    description: 'Store Wi-Fi passwords, security codes, and gate codes in an AES-256 encrypted vault.',
  },
  {
    icon: FileText,
    title: 'Home Binder',
    description: 'Generate a professional PDF binder of your entire home — perfect for selling or insurance claims.',
  },
  {
    icon: Users,
    title: 'Shared Access',
    description: 'Invite family members, property managers, or contractors with role-based permissions.',
  },
]

const STEPS = [
  {
    number: '1',
    title: 'Add your home',
    description: 'Enter your address and start adding rooms, appliances, and documents in minutes.',
  },
  {
    number: '2',
    title: 'Track everything',
    description: 'Log service records, upload receipts, and let AI schedule your maintenance calendar.',
  },
  {
    number: '3',
    title: 'Build your binder',
    description: 'Generate a complete home history — ready for buyers, insurers, or your own peace of mind.',
  },
]

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Get started with the basics.',
    popular: false,
    cta: 'Get started free',
    features: [
      '1 home',
      'Unlimited rooms & appliances (basic info)',
      'Basic service history logging',
      'Manual maintenance reminders',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'Everything you need for one home.',
    popular: false,
    cta: 'Start free trial',
    features: [
      '1 home',
      'Everything in Free, plus:',
      'AI maintenance scheduling',
      'Receipt scanning',
      'Home Binder PDF export',
      'Email reminders',
      'Password vault',
      'Document storage',
    ],
  },
  {
    name: 'Estate',
    price: '$49',
    period: '/month',
    description: 'For property managers and multi-home owners.',
    popular: true,
    cta: 'Start free trial',
    features: [
      'Up to 5 homes',
      'Everything in Pro, plus:',
      'Shared access & roles',
      'Contractor marketplace',
      'Priority support',
    ],
  },
]

const TESTIMONIALS = [
  {
    quote: 'TheHomeFile saved me hours when we sold our house. The buyers were impressed with the complete history.',
    name: 'Sarah M.',
    role: 'Homeowner',
    placeholder: true,
  },
  {
    quote: 'I manage 12 properties and this is the first tool that actually keeps everything organized in one place.',
    name: 'James K.',
    role: 'Property Manager',
    placeholder: true,
  },
  {
    quote: 'The AI maintenance reminders caught a furnace filter I forgot about for 6 months. Worth it just for that.',
    name: 'Lisa T.',
    role: 'Homeowner',
    placeholder: true,
  },
]

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [heroEmail, setHeroEmail] = useState('')
  const [ctaEmail, setCtaEmail] = useState('')
  const [heroStatus, setHeroStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [ctaStatus, setCtaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [heroMessage, setHeroMessage] = useState('')
  const [ctaMessage, setCtaMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSubmit(
    e: FormEvent,
    email: string,
    setStatus: typeof setHeroStatus,
    setMessage: typeof setHeroMessage,
    setEmail: typeof setHeroEmail,
  ) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      } else {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  function EmailForm({
    email,
    setEmail,
    status,
    message,
    onSubmit,
    dark = false,
  }: {
    email: string
    setEmail: (v: string) => void
    status: string
    message: string
    onSubmit: (e: FormEvent) => void
    dark?: boolean
  }) {
    if (status === 'success') {
      return (
        <div className={`flex items-center gap-2 text-sm font-medium ${dark ? 'text-green-400' : 'text-green-700'}`}>
          <Check size={16} />
          {message}
        </div>
      )
    }

    return (
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] ${
            dark
              ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
              : 'bg-white border-[#C8BFB2] text-[#2F3437] placeholder-slate-400'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Joining...' : 'Get Early Access'}
        </button>
        {status === 'error' && <p className="text-red-500 text-xs sm:col-span-2">{message}</p>}
      </form>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#2F3437]">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#C8BFB2]/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5B6C8F] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-playfair text-lg font-bold text-[#2F3437]">TheHomeFile</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-[#5B6C8F] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-[#5B6C8F] transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-[#5B6C8F] transition-colors">Pricing</a>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm text-slate-600 hover:text-[#5B6C8F] transition-colors">
                  Sign in
                </Link>
                <a
                  href="#hero-email"
                  className="bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Get Early Access
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#2F3437]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#C8BFB2]/40 bg-white px-6 py-4 flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-[#5B6C8F]">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-[#5B6C8F]">How it works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-[#5B6C8F]">Pricing</a>
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-[#5B6C8F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-[#5B6C8F]">
                  Sign in
                </Link>
                <a href="#hero-email" onClick={() => setMobileMenuOpen(false)} className="bg-[#5B6C8F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center">
                  Get Early Access
                </a>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Beta badge */}
        <div className="inline-flex items-center gap-2 bg-[#5B6C8F]/10 text-[#5B6C8F] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-[#5B6C8F] rounded-full animate-pulse" />
          Now in private beta
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
          Think of it as{' '}
          <span className="text-[#5B6C8F]">CARFAX</span>{' '}
          for your home.
        </h1>

        <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
          Track appliances, schedule maintenance, store documents, and build a complete home history — all in one place.
        </p>

        {/* Email capture */}
        <div id="hero-email" className="flex justify-center mb-16">
          <EmailForm
            email={heroEmail}
            setEmail={setHeroEmail}
            status={heroStatus}
            message={heroMessage}
            onSubmit={(e) => handleSubmit(e, heroEmail, setHeroStatus, setHeroMessage, setHeroEmail)}
          />
        </div>

        {/* App mockup placeholder */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#C8BFB2] shadow-lg overflow-hidden">
          <div className="bg-[#5B6C8F]/5 border-b border-[#C8BFB2]/40 px-6 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C8BFB2]" />
            <div className="w-3 h-3 rounded-full bg-[#C8BFB2]" />
            <div className="w-3 h-3 rounded-full bg-[#C8BFB2]" />
            <div className="flex-1 bg-[#C8BFB2]/30 rounded-full h-5 max-w-xs mx-auto" />
          </div>
          <div className="p-8 sm:p-12">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F4F1EA] rounded-xl h-24" />
              <div className="bg-[#F4F1EA] rounded-xl h-24" />
              <div className="bg-[#F4F1EA] rounded-xl h-24" />
            </div>
            <div className="space-y-3">
              <div className="bg-[#F4F1EA] rounded-lg h-4 w-3/4" />
              <div className="bg-[#F4F1EA] rounded-lg h-4 w-1/2" />
              <div className="bg-[#F4F1EA] rounded-lg h-4 w-2/3" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-[#C8BFB2]/60 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#C8BFB2]/60">
          {[
            { value: '40+', label: 'Features Built' },
            { value: 'AI', label: 'Powered Scheduling' },
            { value: '100%', label: 'Home History' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-4 sm:py-0">
              <div className="text-3xl font-bold text-[#5B6C8F] font-playfair">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything your home needs</h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            From appliance tracking to AI-powered maintenance — TheHomeFile keeps your home running smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-[#C8BFB2] p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-[#5B6C8F]/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-[#5B6C8F]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="bg-[#F4F1EA] border-y border-[#C8BFB2]/60">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-slate-600 max-w-lg mx-auto">
              Get started in minutes. No complicated setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 bg-[#5B6C8F] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5 font-playfair">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Start free forever. Upgrade when you need more.
          </p>
        </div>

        {/* Trial banner */}
        <div className="max-w-3xl mx-auto mb-12 bg-[#5B6C8F]/8 border border-[#5B6C8F]/20 rounded-2xl px-6 py-5 text-center">
          <p className="text-sm text-[#2F3437] leading-relaxed">
            <span className="font-semibold">All plans start with a 30-day free Pro trial.</span>{' '}
            No credit card required. See what AI-powered home management feels like, then decide.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            After the trial, accounts revert to Free — all data is kept, new additions become manual only.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-8 relative ${
                plan.popular
                  ? 'border-2 border-[#5B6C8F] shadow-lg'
                  : 'border border-[#C8BFB2]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5B6C8F] text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold font-playfair">{plan.price}</span>
                {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={16} className="text-[#5B6C8F] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#hero-email"
                className={`block text-center text-sm font-semibold px-6 py-3 rounded-xl transition-colors ${
                  plan.popular
                    ? 'bg-[#5B6C8F] hover:bg-[#4a5c77] text-white'
                    : 'bg-[#5B6C8F]/10 hover:bg-[#5B6C8F]/20 text-[#5B6C8F]'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-[#2F3437] text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What homeowners are saying</h2>
            <p className="text-white/60 text-sm">Placeholder testimonials — real ones coming soon.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-semibold text-white/60">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{testimonial.name}</div>
                    <div className="text-xs text-white/50">{testimonial.role}</div>
                  </div>
                </div>
                {testimonial.placeholder && (
                  <div className="mt-3 text-xs text-white/30 italic">Placeholder</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to take control of your home?</h2>
        <p className="text-slate-600 max-w-lg mx-auto mb-10">
          Join the private beta and be the first to experience TheHomeFile.
        </p>
        <div className="flex justify-center">
          <EmailForm
            email={ctaEmail}
            setEmail={setCtaEmail}
            status={ctaStatus}
            message={ctaMessage}
            onSubmit={(e) => handleSubmit(e, ctaEmail, setCtaStatus, setCtaMessage, setCtaEmail)}
          />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#C8BFB2]/60 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#5B6C8F] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-playfair text-sm font-bold text-[#2F3437]">TheHomeFile</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-[#5B6C8F] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-[#5B6C8F] transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-400">&copy; 2026 TheHomeFile. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
