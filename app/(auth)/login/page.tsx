'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5B6C8F] flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-white font-semibold text-xl">TheHomePage</span>
        </div>
        <div>
          <blockquote className="text-slate-300 text-2xl font-light leading-relaxed">
            "Think of it as CARFAX for your home — complete history, smart reminders, total peace of mind."
          </blockquote>
          <div className="mt-8 flex flex-col gap-4">
            {[
              { icon: '📋', text: 'Full service history for every appliance' },
              { icon: '🤖', text: 'AI-powered maintenance scheduling' },
              { icon: '📅', text: 'Calendar view with smart reminders' },
              { icon: '📁', text: 'Document storage for manuals & warranties' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-slate-400">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-500 text-sm">© 2025 TheHomePage. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#5B6C8F] flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-[#2F3437] font-semibold text-xl">TheHomePage</span>
          </div>

          <h1 className="text-3xl font-bold text-[#2F3437] mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your TheHomePage account</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#5B6C8F] hover:text-[#4a5c77]">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#5B6C8F] hover:text-[#4a5c77] font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
