'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function DeleteApplianceButton({
  homeId,
  roomId,
  applianceId,
  applianceName,
}: {
  homeId: string
  roomId: string
  applianceId: string
  applianceName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const { error } = await supabase
      .from('appliances')
      .delete()
      .eq('id', applianceId)
      .eq('home_id', homeId)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(`/dashboard/homes/${homeId}/rooms/${roomId}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
        title="Delete item"
      >
        <Trash2 size={15} />
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2F3437]">Delete &ldquo;{applianceName}&rdquo;?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will permanently delete the item along with all service records, scheduled tasks, documents, and providers. This cannot be undone.
                </p>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
