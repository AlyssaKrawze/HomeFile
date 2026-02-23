'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Calendar, Bell, Settings } from 'lucide-react'

interface MobileNavProps {
  homes: { id: string; name: string }[]
  userName?: string | null
}

const TAB_DEFS = [
  { label: 'Overview',  icon: Home,        path: '' },
  { label: 'Inventory', icon: LayoutGrid,   path: '/inventory' },
  { label: 'Calendar',  icon: Calendar,     path: '/calendar' },
  { label: 'Alerts',    icon: Bell,         path: '/alerts' },
  { label: 'Settings',  icon: Settings,     path: '/settings' },
]

export default function MobileNav({ }: MobileNavProps) {
  const pathname = usePathname()

  const homeIdMatch = pathname.match(/\/dashboard\/homes\/([^/]+)/)
  const currentHomeId = homeIdMatch?.[1]

  function isActive(path: string): boolean {
    if (!currentHomeId) return false
    const href = `/dashboard/homes/${currentHomeId}${path}`
    return path === '' ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {TAB_DEFS.map(({ label, icon: Icon, path }) => {
          const href = currentHomeId ? `/dashboard/homes/${currentHomeId}${path}` : null
          const active = isActive(path)

          if (!href) {
            return (
              <div
                key={label}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-slate-300 select-none"
              >
                <Icon size={22} strokeWidth={1.75} />
                <span>{label}</span>
              </div>
            )
          }

          return (
            <Link
              key={label}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-teal-600' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
