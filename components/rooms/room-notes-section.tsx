'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'

interface RoomNotesSectionProps {
  roomId: string
  homeId: string
  room: {
    paint_color: string | null
    floor_type: string | null
    dimensions: string | null
    room_notes: string | null
  }
  canManage: boolean
}

export default function RoomNotesSection({ roomId, homeId, room, canManage }: RoomNotesSectionProps) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    paint_color: room.paint_color ?? '',
    floor_type: room.floor_type ?? '',
    dimensions: room.dimensions ?? '',
    room_notes: room.room_notes ?? '',
  })
  const router = useRouter()
  const supabase = createClient()

  const hasInfo = room.paint_color || room.floor_type || room.dimensions || room.room_notes

  async function handleSave() {
    setLoading(true)
    await supabase.from('rooms').update({
      paint_color: form.paint_color || null,
      floor_type: form.floor_type || null,
      dimensions: form.dimensions || null,
      room_notes: form.room_notes || null,
    }).eq('id', roomId)
    setEditing(false)
    setLoading(false)
    router.refresh()
  }

  function handleCancel() {
    setForm({
      paint_color: room.paint_color ?? '',
      floor_type: room.floor_type ?? '',
      dimensions: room.dimensions ?? '',
      room_notes: room.room_notes ?? '',
    })
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9D0]">
        <div>
          <h2 className="font-semibold text-[#2F3437]">Room Info</h2>
          <p className="text-xs text-slate-500 mt-0.5">Paint, flooring, dimensions and notes</p>
        </div>
        {canManage && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
            >
              <Check size={14} />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-5">
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Paint Color</label>
              <input
                type="text"
                value={form.paint_color}
                onChange={e => setForm(p => ({ ...p, paint_color: e.target.value }))}
                placeholder="e.g. Sherwin-Williams Alabaster"
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Floor Type</label>
              <input
                type="text"
                value={form.floor_type}
                onChange={e => setForm(p => ({ ...p, floor_type: e.target.value }))}
                placeholder="e.g. Hardwood, Tile, Carpet"
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Dimensions</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={e => setForm(p => ({ ...p, dimensions: e.target.value }))}
                placeholder="e.g. 12 x 14 ft"
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={form.room_notes}
                onChange={e => setForm(p => ({ ...p, room_notes: e.target.value }))}
                placeholder="Any additional notes about this room..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] resize-none"
              />
            </div>
          </div>
        ) : hasInfo ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {room.paint_color && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Paint Color</p>
                <p className="text-sm text-[#2F3437]">{room.paint_color}</p>
              </div>
            )}
            {room.floor_type && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Floor Type</p>
                <p className="text-sm text-[#2F3437]">{room.floor_type}</p>
              </div>
            )}
            {room.dimensions && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Dimensions</p>
                <p className="text-sm text-[#2F3437]">{room.dimensions}</p>
              </div>
            )}
            {room.room_notes && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed">{room.room_notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">No room info added yet.</p>
            {canManage && (
              <p className="text-xs text-slate-400 mt-1">Click Edit to add paint color, flooring, dimensions, and notes.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
