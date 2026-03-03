'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Home, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type State = 'loading' | 'success' | 'already' | 'error'

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const [homeId, setHomeId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function accept() {
      const res = await fetch(`/api/invites/${token}/accept`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setState('error')
        return
      }

      setHomeId(data.homeId)
      setState(data.alreadyAccepted ? 'already' : 'success')
    }
    accept()
  }, [token])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA]">
        <div className="text-center">
          <Loader2 size={32} className="text-[#5B6C8F] animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600">Accepting invitation…</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA] p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h1 className="font-playfair text-xl font-bold text-[#2F3437] mb-2">Invite Error</h1>
          <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA] p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="text-green-500" />
        </div>
        <h1 className="font-playfair text-xl font-bold text-[#2F3437] mb-2">
          {state === 'already' ? 'Already a Member' : "You're In!"}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {state === 'already'
            ? "You're already a member of this home."
            : "Your invitation has been accepted. Welcome to the home!"}
        </p>
        {homeId ? (
          <button
            onClick={() => router.push(`/dashboard/homes/${homeId}`)}
            className="inline-flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            <Home size={15} />
            Go to Home
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
