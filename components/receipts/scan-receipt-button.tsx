'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ScanReceiptButton({ homeId }: { homeId: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
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
        const err = await res.json()
        toast.error(err.error || 'Failed to scan receipt')
        return
      }

      const data = await res.json()

      if (data.action === 'updated') {
        toast.success(`Updated ${data.item_name} with receipt info`)
      } else {
        toast.success(`${data.item_name} saved — assign a room on your next visit`)
      }

      router.refresh()
    } catch {
      toast.error('Failed to scan receipt')
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={scanning}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#5B6C8F] text-white shadow-sm hover:bg-[#4a5a7a] hover:shadow-md transition-all disabled:opacity-60"
      >
        {scanning ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Scanning…
          </>
        ) : (
          <>
            <Camera size={18} />
            Scan Receipt
          </>
        )}
      </button>
    </>
  )
}
