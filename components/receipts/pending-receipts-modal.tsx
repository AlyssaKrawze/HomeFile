'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Package, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { PendingReceipt } from '@/lib/types'

interface Room {
  id: string
  name: string
}

export default function PendingReceiptsModal({
  homeId,
  pendingReceipts,
  rooms,
}: {
  homeId: string
  pendingReceipts: PendingReceipt[]
  rooms: Room[]
}) {
  const [open, setOpen] = useState(true)
  const [items, setItems] = useState(
    pendingReceipts.map(r => ({ ...r, selectedRoomId: '' }))
  )
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  if (!open || items.length === 0) return null

  function setRoom(id: string, roomId: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selectedRoomId: roomId } : i))
  }

  async function skip(id: string) {
    const supabase = createClient()
    await supabase.from('pending_receipts').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    if (items.length <= 1) {
      setOpen(false)
      router.refresh()
    }
  }

  async function confirmAll() {
    const assigned = items.filter(i => i.selectedRoomId)
    if (assigned.length === 0) {
      toast.error('Select a room for at least one item, or skip them')
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      // Create appliances for assigned items
      for (const item of assigned) {
        await supabase.from('appliances').insert({
          home_id: homeId,
          room_id: item.selectedRoomId,
          name: item.name,
          brand: item.brand,
          model: item.model,
          purchase_price: item.purchase_price,
          purchase_date: item.purchase_date,
          warranty_expiry: item.warranty_expiry,
          warranty_provider: item.warranty_provider,
          warranty_contact: item.warranty_contact,
          include_in_binder: true,
        })

        // Attach receipt image as document if present
        if (item.receipt_image_url) {
          await supabase.from('documents').insert({
            home_id: homeId,
            name: `Receipt – ${item.name}`,
            file_url: item.receipt_image_url,
            document_type: 'receipt',
            include_in_binder: true,
          })
        }

        await supabase.from('pending_receipts').delete().eq('id', item.id)
      }

      toast.success(`${assigned.length} item${assigned.length > 1 ? 's' : ''} added to rooms`)
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to save items')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#C8BFB2]">
          <div>
            <h2 className="font-playfair text-lg font-bold text-[#2F3437]">Pending Receipts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assign scanned items to a room</p>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-[#F4F1EA] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-[#5B6C8F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2F3437] text-sm truncate">{item.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                    {item.brand && <span>{item.brand}</span>}
                    {item.model && <span>{item.model}</span>}
                    {item.purchase_price != null && (
                      <span>${Number(item.purchase_price).toLocaleString()}</span>
                    )}
                    {item.store_vendor && <span>{item.store_vendor}</span>}
                  </div>

                  {/* Room selector */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={item.selectedRoomId}
                        onChange={e => setRoom(item.id, e.target.value)}
                        className="w-full appearance-none bg-white border border-[#C8BFB2] rounded-lg px-3 py-1.5 pr-8 text-xs text-[#2F3437] focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]/30"
                      >
                        <option value="">Select room…</option>
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => skip(item.id)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#C8BFB2]">
          <button
            onClick={confirmAll}
            disabled={saving}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-[#5B6C8F] text-white hover:bg-[#4a5a7a] transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Confirm All'}
          </button>
        </div>
      </div>
    </div>
  )
}
