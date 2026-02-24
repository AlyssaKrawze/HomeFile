'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#F4F1EA]">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#5B6C8F] flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-[#2F3437] font-semibold text-xl">TheHomePage</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#C8BFB2] p-8">
          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#dce4ef] flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h1 className="text-xl font-bold text-[#2F3437] mb-2">Password updated</h1>
              <p className="text-slate-500 text-sm">Redirecting you to your dashboard…</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#2F3437] mb-1">Set a new password</h1>
              <p className="text-slate-500 text-sm mb-6">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="confirm">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-slate-400">
                <Link href="/login" className="text-[#5B6C8F] hover:text-[#4a5c77]">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
