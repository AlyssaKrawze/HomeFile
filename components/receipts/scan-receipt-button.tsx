'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2 } from 'lucide-react'

interface ScanReceiptButtonProps {
  homeId: string
  variant?: 'inline' | 'fab'
}

export default function ScanReceiptButton({ homeId, variant = 'inline' }: ScanReceiptButtonProps) {
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
        alert(err.error || 'Failed to scan receipt')
        return
      }

      const data = await res.json()

      if (data.action === 'updated') {
        alert(`Updated ${data.item_name} with receipt info`)
      } else {
        alert(`${data.item_name} saved — assign a room on your next visit`)
      }

      router.refresh()
    } catch {
      alert('Failed to scan receipt')
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ''
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
    </>
  )
}
