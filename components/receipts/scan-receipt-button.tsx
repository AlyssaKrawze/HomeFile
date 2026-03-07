'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, X, ChevronDown, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Room {
  id: string
  name: string
}

interface ExtractedData {
  name: string | null
  brand: string | null
  model: string | null
  purchase_price: number | null
  purchase_date: string | null
  store_vendor: string | null
  warranty_expiry: string | null
  warranty_provider: string | null
  warranty_contact: string | null
}

interface ScanReceiptButtonProps {
  homeId: string
  rooms: Room[]
  variant?: 'inline' | 'fab'
}

export default function ScanReceiptButton({ homeId, rooms, variant = 'inline' }: ScanReceiptButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`/api/homes/${homeId}/receipts/scan`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`
        try {
          const err = await res.json()
          errorMsg = err.error || errorMsg
        } catch {
          // response wasn't JSON
        }
        alert(errorMsg)
        return
      }

      const data = await res.json()

      if (data.action === 'updated') {
        alert(`Updated ${data.item_name} with receipt info`)
        router.refresh()
      } else if (data.action === 'needs_room') {
        // Show room picker modal
        setExtracted(data.extracted)
        setReceiptUrl(data.receipt_url || null)
        setSelectedRoomId('')
        setShowModal(true)
      }
    } catch {
      alert('Failed to scan receipt')
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSaveToRoom() {
    if (!selectedRoomId || !extracted) return

    setSaving(true)
    try {
      const supabase = createClient()
      const itemName = extracted.name || 'Unknown Item'

      const { data: newAppliance, error } = await supabase.from('appliances').insert({
        home_id: homeId,
        room_id: selectedRoomId,
        name: itemName,
        brand: extracted.brand,
        model: extracted.model,
        purchase_price: extracted.purchase_price,
        purchase_date: extracted.purchase_date,
        warranty_expiry: extracted.warranty_expiry,
        warranty_provider: extracted.warranty_provider,
        warranty_contact: extracted.warranty_contact,
        include_in_binder: true,
      }).select('id').single()

      if (error) {
        alert(`Failed to save item: ${error.message}`)
        return
      }

      // Attach receipt as document linked to the new appliance
      if (receiptUrl) {
        await supabase.from('documents').insert({
          home_id: homeId,
          appliance_id: newAppliance.id,
          name: `Receipt – ${itemName}`,
          file_url: receiptUrl,
          document_type: 'receipt',
          include_in_binder: true,
        })
      }

      setShowModal(false)
      setExtracted(null)
      router.refresh()
    } catch {
      alert('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const input = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*,.pdf"
      className="hidden"
      onChange={handleFile}
    />
  )

  const modal = showModal && extracted && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#C8BFB2]">
          <h2 className="font-playfair text-lg font-bold text-[#2F3437]">
            Where should we file this item?
          </h2>
          <button
            onClick={() => { setShowModal(false); setExtracted(null) }}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Extracted info */}
        <div className="p-5">
          <div className="bg-[#F4F1EA] rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-[#5B6C8F]" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[#2F3437] text-sm">
                  {extracted.name || 'Unknown Item'}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                  {extracted.brand && <span>{extracted.brand}</span>}
                  {extracted.model && <span>{extracted.model}</span>}
                  {extracted.purchase_price != null && (
                    <span>${Number(extracted.purchase_price).toLocaleString()}</span>
                  )}
                  {extracted.store_vendor && <span>{extracted.store_vendor}</span>}
                  {extracted.purchase_date && <span>{extracted.purchase_date}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Room selector */}
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Choose a room
          </label>
          <div className="relative">
            <select
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="w-full appearance-none bg-white border border-[#C8BFB2] rounded-lg px-4 py-2.5 pr-10 text-sm text-[#2F3437] focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]/30"
            >
              <option value="">Select room…</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={() => { setShowModal(false); setExtracted(null) }}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#C8BFB2] text-slate-700 text-sm font-medium hover:bg-[#F4F1EA] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToRoom}
            disabled={!selectedRoomId || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#5B6C8F] text-white text-sm font-medium hover:bg-[#4a5c77] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add to Room'}
          </button>
        </div>
      </div>
    </div>
  )

  if (variant === 'fab') {
    return (
      <>
        {input}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={scanning}
          className="fixed bottom-24 lg:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-[#5B6C8F] text-white shadow-lg hover:bg-[#4a5a7a] hover:shadow-xl hover:scale-105 transition-all disabled:opacity-60 flex items-center justify-center"
          title="Scan Receipt"
        >
          {scanning ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Camera size={22} />
          )}
        </button>
        {modal}
      </>
    )
  }

  return (
    <>
      {input}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={scanning}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[#5B6C8F] text-[#5B6C8F] bg-white hover:bg-[#eef1f6] transition-colors disabled:opacity-60"
      >
        {scanning ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Scanning…
          </>
        ) : (
          <>
            <Camera size={15} />
            Scan Receipt
          </>
        )}
      </button>
      {modal}
    </>
  )
}
