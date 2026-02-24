'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
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
            &ldquo;Think of it as CARFAX for your home — complete history, smart reminders, total peace of mind.&rdquo;
          </blockquote>
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

          {sent ? (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#dce4ef] flex items-center justify-center mb-6">
                <span className="text-2xl">📬</span>
              </div>
              <h1 className="text-2xl font-bold text-[#2F3437] mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm mb-6">
                We&apos;ve sent a password reset link to <span className="font-medium text-[#2F3437]">{email}</span>. Click the link in the email to set a new password.
              </p>
              <p className="text-sm text-slate-400">
                Didn&apos;t receive it?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-[#5B6C8F] hover:text-[#4a5c77] font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-[#2F3437] mb-2">Forgot password?</h1>
              <p className="text-slate-500 mb-8 text-sm">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Remember your password?{' '}
                <Link href="/login" className="text-[#5B6C8F] hover:text-[#4a5c77] font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
