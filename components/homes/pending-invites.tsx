'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Trash2, Clock } from 'lucide-react'

interface PendingInvite {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
}

interface PendingInvitesProps {
  homeId: string
  invites: PendingInvite[]
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  limited: 'Limited Access',
}

export default function PendingInvites({ homeId, invites: initialInvites }: PendingInvitesProps) {
  const [invites, setInvites] = useState(initialInvites)
  const [revoking, setRevoking] = useState<string | null>(null)
  const router = useRouter()

  if (invites.length === 0) return null

  async function revoke(inviteId: string) {
    setRevoking(inviteId)
    const res = await fetch(`/api/homes/${homeId}/invites/${inviteId}`, { method: 'DELETE' })
    if (res.ok) {
      setInvites(prev => prev.filter(i => i.id !== inviteId))
      router.refresh()
    }
    setRevoking(null)
  }

  function expiresLabel(expiresAt: string) {
    const diff = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return 'Expired'
    if (diff === 1) return 'Expires tomorrow'
    return `Expires in ${diff} days`
  }

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2] mb-6">
      <div className="px-4 py-4 sm:px-6 border-b border-[#E0D9D0]">
        <h2 className="font-semibold text-[#2F3437]">Pending Invites ({invites.length})</h2>
        <p className="text-xs text-slate-500 mt-0.5">Awaiting acceptance — links expire in 7 days</p>
      </div>
      <div className="divide-y divide-slate-100">
        {invites.map(invite => (
          <div key={invite.id} className="px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F4F1EA] flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2F3437] truncate">{invite.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">
                  {ROLE_LABELS[invite.role] ?? invite.role}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={10} />
                  {expiresLabel(invite.expires_at)}
                </span>
              </div>
            </div>
            <button
              onClick={() => revoke(invite.id)}
              disabled={revoking === invite.id}
              className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
              title="Revoke invite"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
