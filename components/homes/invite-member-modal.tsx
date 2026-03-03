'use client'

import { useState } from 'react'
import { Users, X, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Room {
  id: string
  name: string
}

interface InviteMemberModalProps {
  homeId: string
  rooms: Room[]
}

const ROLES = [
  {
    value: 'owner' as const,
    label: 'Owner',
    description: 'Full access — manage everything including members, settings, and the vault.',
  },
  {
    value: 'manager' as const,
    label: 'Manager',
    description: 'Can edit all records, add service history, manage tasks, and invite members.',
  },
  {
    value: 'limited' as const,
    label: 'Limited Access',
    description: 'Can only view and update the specific rooms you select below.',
  },
]

export default function InviteMemberModal({ homeId, rooms }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

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
        <InviteForm
          homeId={homeId}
          rooms={rooms}
          onClose={() => { setOpen(false); router.refresh() }}
        />
      )}
    </>
  )
}

function InviteForm({
  homeId,
  rooms,
  onClose,
}: {
  homeId: string
  rooms: Room[]
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'owner' | 'manager' | 'limited'>('manager')
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedRole = ROLES.find(r => r.value === role)!

  function toggleRoom(roomId: string) {
    setSelectedRooms(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    if (role === 'limited' && selectedRooms.length === 0) {
      setError('Select at least one room for limited access.')
      return
    }
    setError(null)
    setLoading(true)

    const res = await fetch(`/api/homes/${homeId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        role,
        permissions: role === 'limited' ? { room_ids: selectedRooms } : {},
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to send invite.')
      return
    }

    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-[#5B6C8F]" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#2F3437]">Invite a Member</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} className="text-green-500" />
              </div>
              <p className="text-sm font-semibold text-[#2F3437] mb-1">Invite sent!</p>
              <p className="text-xs text-slate-500 mb-4">
                An invitation email has been sent to <strong>{email}</strong>. They&apos;ll be added as{' '}
                <strong>{selectedRole.label}</strong> when they accept.
              </p>
              <button
                onClick={onClose}
                className="text-sm text-[#5B6C8F] hover:text-[#4a5c77] font-medium transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Role</label>
                <div className="flex flex-col gap-2">
                  {ROLES.map(r => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        role === r.value
                          ? 'border-[#5B6C8F] bg-[#eef1f6]'
                          : 'border-[#E0D9D0] hover:border-[#C8BFB2]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={role === r.value}
                        onChange={() => setRole(r.value)}
                        className="mt-0.5 accent-[#5B6C8F]"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#2F3437]">{r.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room checkboxes for limited access */}
              {role === 'limited' && rooms.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Accessible rooms
                  </label>
                  <div className="border border-[#E0D9D0] rounded-xl divide-y divide-[#F0EBE3] max-h-40 overflow-y-auto">
                    {rooms.map(room => (
                      <label
                        key={room.id}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#F4F1EA] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRooms.includes(room.id)}
                          onChange={() => toggleRoom(room.id)}
                          className="rounded accent-[#5B6C8F]"
                        />
                        <span className="text-sm text-[#2F3437]">{room.name}</span>
                      </label>
                    ))}
                  </div>
                  {role === 'limited' && selectedRooms.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1">Select at least one room.</p>
                  )}
                </div>
              )}

              {role === 'limited' && rooms.length === 0 && (
                <p className="text-xs text-slate-500 bg-[#F4F1EA] rounded-lg px-3 py-2">
                  Add rooms to your home first to set up limited access.
                </p>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || (role === 'limited' && selectedRooms.length === 0)}
                className="w-full flex items-center justify-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? 'Sending…' : 'Send Invite'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
