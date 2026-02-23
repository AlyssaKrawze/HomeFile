'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Home,
  Calendar,
  FileText,
  Settings,
  Users,
  LogOut,
  Plus,
  LayoutGrid,
  Bell,
  BookOpen,
  Download,
  Lock,
} from 'lucide-react'

interface SidebarProps {
  homes: { id: string; name: string }[]
  userName?: string | null
}

export default function Sidebar({ homes, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Extract homeId from current path
  const homeIdMatch = pathname.match(/\/dashboard\/homes\/([^/]+)/)
  const currentHomeId = homeIdMatch?.[1]

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const homeNavItems = currentHomeId ? [
    { href: `/dashboard/homes/${currentHomeId}`, label: 'Overview', icon: Home },
    { href: `/dashboard/homes/${currentHomeId}/inventory`, label: 'Inventory', icon: LayoutGrid },
    { href: `/dashboard/homes/${currentHomeId}/calendar`, label: 'Calendar', icon: Calendar },
    { href: `/dashboard/homes/${currentHomeId}/alerts`, label: 'Alerts', icon: Bell },
    { href: `/dashboard/homes/${currentHomeId}/members`, label: 'Members', icon: Users },
    { href: `/dashboard/homes/${currentHomeId}/vault`, label: 'Vault', icon: Lock },
    { href: `/dashboard/homes/${currentHomeId}/settings`, label: 'Settings', icon: Settings },
  ] : []

  return (
    <aside className="w-64 bg-[#1e2635] flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2d3a52]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5B6C8F] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">H</span>
          </div>
          <span className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}>HomeFile</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        {/* Homes list */}
        <div className="px-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              My Homes
            </span>
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-[#7a8fa8] transition-colors"
              title="Manage homes"
            >
              <Plus size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-0.5">
            {homes.map((home) => {
              const isActive = currentHomeId === home.id
              return (
                <Link
                  key={home.id}
                  href={`/dashboard/homes/${home.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group ${
                    isActive
                      ? 'bg-[#2d3a52] text-white'
                      : 'text-slate-300 hover:bg-[#2d3a52] hover:text-white'
                  }`}
                >
                  <span className="text-base">🏠</span>
                  <span className="truncate flex-1">{home.name}</span>
                </Link>
              )
            })}

            {homes.length === 0 && (
              <p className="text-slate-500 text-xs px-3 py-2 italic">
                No homes yet.
              </p>
            )}
          </div>
        </div>

        {/* Home navigation - only shown when inside a home */}
        {currentHomeId && (
          <div className="px-3 mt-4 border-t border-[#2d3a52] pt-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-2 mb-2 block">
              {homes.find(h => h.id === currentHomeId)?.name || 'Home'}
            </span>
            <div className="flex flex-col gap-0.5">
              {homeNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[#5B6C8F] text-white'
                        : 'text-slate-400 hover:bg-[#2d3a52] hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <a
                href={`/api/homes/${currentHomeId}/binder`}
                download
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-slate-400 hover:bg-[#2d3a52] hover:text-white"
              >
                <BookOpen size={15} />
                <span>Home Binder</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Getting started guide */}
      <div className="px-3 pb-2">
        <a
          href="/api/guide"
          download
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-slate-500 hover:bg-[#2d3a52] hover:text-white"
        >
          <Download size={14} />
          <span>Getting Started Guide</span>
        </a>
      </div>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-[#2d3a52]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-[#5B6C8F] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(userName || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">
              {userName || 'User'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
