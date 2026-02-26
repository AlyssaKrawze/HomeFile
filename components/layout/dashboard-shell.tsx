'use client'

import Link from 'next/link'
import Sidebar from '@/components/layout/sidebar'
import MobileNav from '@/components/layout/mobile-nav'
import OnboardingModal from '@/components/onboarding/onboarding-modal'

interface DashboardShellProps {
  homes: { id: string; name: string }[]
  userName?: string | null
  userId: string
  showOnboarding: boolean
  children: React.ReactNode
}

export default function DashboardShell({
  homes,
  userName,
  userId,
  showOnboarding,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F1EA]">
      {/* ── Sidebar (hidden on mobile) ───────────────────── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar homes={homes} userName={userName} userId={userId} />
      </div>

      {/* ── Mobile top bar ──────────────────────────────── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-30 h-12 flex items-center px-4 bg-[#F4F1EA] border-b border-[#C8BFB2]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#5B6C8F] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-[#2F3437] text-base" style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}>TheHomePage</span>
        </Link>
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-12 lg:pt-0 pb-20 lg:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <MobileNav homes={homes} userName={userName} />

      <OnboardingModal userId={userId} show={showOnboarding} />
    </div>
  )
}
