'use client'

import { useState } from 'react'
import { Users, X, Mail } from 'lucide-react'

export default function InviteMemberModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
      >
        <Users size={15} />
        <span className="hidden sm:inline">Invite Member</span>
        <span className="sm:hidden">Invite</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#2F3437]">Invite a Member</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-4 bg-[#F4F1EA] rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-[#dce4ef] flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-[#5B6C8F]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#2F3437]">Email invitations — Coming Soon</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Email-based invites are on the way. For now, have your household member sign up, then contact support to link their account.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="member@example.com"
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-slate-400 text-sm bg-slate-50 cursor-not-allowed"
              />
            </div>

            <button
              disabled
              className="w-full bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2.5 rounded-lg cursor-not-allowed"
            >
              Send Invite — Coming Soon
            </button>
          </div>
        </div>
      )}
    </>
  )
}
