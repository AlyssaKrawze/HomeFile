'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Desktop sidebar ─────────────────────────────── */}
      {!isMobile && (
        <div className="flex-shrink-0">
          <Sidebar homes={homes} userName={userName} />
        </div>
      )}

      {/* ── Mobile sidebar overlay ──────────────────────── */}
      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full z-50">
            <Sidebar homes={homes} userName={userName} />
          </div>
        </>
      )}

      {/* ── Mobile top bar ──────────────────────────────── */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 z-30 h-12 flex items-center px-4 bg-white border-b border-slate-100"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-3 p-1 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-slate-900 text-base">HomeFile</span>
          </Link>
        </div>
      )}

      {/* ── Main content ────────────────────────────────── */}
      <main
        className="flex-1 min-w-0 overflow-y-auto"
        style={{
          paddingTop: isMobile ? '3rem' : undefined,
          paddingBottom: isMobile ? '5rem' : undefined,
        }}
      >
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <MobileNav homes={homes} userName={userName} isMobile={isMobile} />

      <OnboardingModal userId={userId} show={showOnboarding} />
    </div>
  )
}
