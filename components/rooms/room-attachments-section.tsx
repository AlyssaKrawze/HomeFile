'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, FileText, FileImage, File, ExternalLink, Trash2, Paperclip } from 'lucide-react'
import { type RoomAttachment } from '@/lib/types'

interface RoomAttachmentsSectionProps {
  roomId: string
  homeId: string
  attachments: RoomAttachment[]
  canManage: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return <File size={16} />
  if (fileType.startsWith('image/')) return <FileImage size={16} className="text-pink-500" />
  if (fileType === 'application/pdf') return <FileText size={16} className="text-red-500" />
  return <File size={16} className="text-slate-400" />
}

export default function RoomAttachmentsSection({
  roomId, homeId, attachments, canManage
}: RoomAttachmentsSectionProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [form, setForm] = useState({ description: '', include_in_binder: true })
  const router = useRouter()
  const supabase = createClient()

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)

    const fileExt = selectedFile.name.split('.').pop()
    const fileName = `${roomId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('room-attachments')
      .upload(fileName, selectedFile)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('room-attachments')
      .getPublicUrl(fileName)

    await supabase.from('room_attachments').insert({
      room_id: roomId,
      home_id: homeId,
      name: selectedFile.name,
      file_url: publicUrl,
      file_type: selectedFile.type,
      file_size: selectedFile.size,
      description: form.description || null,
      include_in_binder: form.include_in_binder,
    })

    setShowUpload(false)
    setSelectedFile(null)
    setForm({ description: '', include_in_binder: true })
    setUploading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('room_attachments').delete().eq('id', id)
    router.refresh()
  }

  async function toggleBinder(attachment: RoomAttachment) {
    await supabase.from('room_attachments')
      .update({ include_in_binder: !attachment.include_in_binder })
      .eq('id', attachment.id)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0D9D0]">
        <div>
          <h2 className="font-semibold text-[#2F3437]">Attachments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {attachments.length === 0 ? 'No files uploaded' : `${attachments.length} file${attachments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
          >
            <Upload size={13} />
            Upload
          </button>
        )}
      </div>

      {showUpload && (
        <div className="px-5 py-4 border-b border-[#E0D9D0] bg-[#F4F1EA]">
          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">File *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                required
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#5B6C8F] file:text-white hover:file:bg-[#4a5c77] file:cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional note"
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-xs focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include_in_binder_upload"
                checked={form.include_in_binder}
                onChange={e => setForm(p => ({ ...p, include_in_binder: e.target.checked }))}
                className="rounded border-[#C8BFB2]"
              />
              <label htmlFor="include_in_binder_upload" className="text-xs text-slate-700">Include in Home Binder</label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-[#C8BFB2] text-slate-700 text-xs font-medium hover:bg-[#F4F1EA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex-1 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-xs font-medium px-3 py-2 rounded-lg"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {attachments.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <Paperclip size={22} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No attachments yet.</p>
            <p className="text-xs text-slate-400 mt-1">Upload photos, PDFs, or documents for this room.</p>
          </div>
        ) : (
          attachments.map((att) => (
            <div key={att.id} className="px-5 py-3 flex items-center gap-3">
              <div className="text-slate-400 flex-shrink-0">
                {getFileIcon(att.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2F3437] truncate">{att.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {att.description && (
                    <span className="text-xs text-slate-500">{att.description}</span>
                  )}
                  {att.file_size && (
                    <span className="text-xs text-slate-400">{formatBytes(att.file_size)}</span>
                  )}
                  {canManage && (
                    <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={att.include_in_binder}
                        onChange={() => toggleBinder(att)}
                        className="rounded border-[#C8BFB2] w-3 h-3"
                      />
                      Binder
                    </label>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#5B6C8F] transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
                {canManage && (
                  <button
                    onClick={() => handleDelete(att.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
