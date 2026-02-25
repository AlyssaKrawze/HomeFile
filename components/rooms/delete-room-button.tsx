'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function DeleteRoomButton({
  homeId,
  roomId,
  roomName,
  itemCount,
  variant = 'icon',
}: {
  homeId: string
  roomId: string
  roomName: string
  itemCount: number
  /** 'icon' = small trash icon for room cards; 'button' = labeled button for room page */
  variant?: 'icon' | 'button'
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/homes/${homeId}/rooms/${roomId}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to delete room')
      setLoading(false)
      return
    }
    router.push(`/dashboard/homes/${homeId}`)
  }

  const trigger = variant === 'button' ? (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
    >
      <Trash2 size={15} />
      Delete Room
    </button>
  ) : (
    <button
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      title="Delete room"
    >
      <Trash2 size={13} />
    </button>
  )

  return (
    <>
      {trigger}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => e.stopPropagation()}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setOpen(false); setError(null) }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2F3437]">Delete &ldquo;{roomName}&rdquo;?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {itemCount > 0
                    ? `This will permanently delete the room and all ${itemCount} item${itemCount !== 1 ? 's' : ''} inside it, including service records, tasks, and documents. This cannot be undone.`
                    : 'This will permanently delete the room. This cannot be undone.'}
                </p>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setOpen(false); setError(null) }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
