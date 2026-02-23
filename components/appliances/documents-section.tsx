'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, FileText, FileImage, File, X, ExternalLink } from 'lucide-react'
import { type Document, type DocumentType } from '@/lib/types'

interface DocumentsSectionProps {
  applianceId: string
  homeId: string
  documents: Document[]
  canManage: boolean
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  manual: 'Manual',
  warranty: 'Warranty',
  receipt: 'Receipt',
  inspection: 'Inspection Report',
  photo: 'Photo',
  other: 'Other',
}

const DOC_TYPE_COLORS: Record<DocumentType, string> = {
  manual: 'bg-blue-100 text-blue-700',
  warranty: 'bg-green-100 text-green-700',
  receipt: 'bg-slate-100 text-slate-600',
  inspection: 'bg-purple-100 text-purple-700',
  photo: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-600',
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

export default function DocumentsSection({
  applianceId, homeId, documents, canManage
}: DocumentsSectionProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    document_type: 'manual' as DocumentType,
    description: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)

    // Upload to Supabase Storage
    const fileExt = selectedFile.name.split('.').pop()
    const fileName = `${applianceId}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, selectedFile)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    await supabase.from('documents').insert({
      home_id: homeId,
      appliance_id: applianceId,
      name: selectedFile.name,
      file_url: publicUrl,
      file_type: selectedFile.type,
      file_size: selectedFile.size,
      document_type: uploadForm.document_type,
      description: uploadForm.description || null,
    })

    setShowUpload(false)
    setSelectedFile(null)
    setUploadForm({ document_type: 'manual', description: '' })
    setUploading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0D9D0]">
        <div>
          <h2 className="font-semibold text-[#2F3437]">Documents</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {documents.length === 0 ? 'No files uploaded' : `${documents.length} file${documents.length !== 1 ? 's' : ''}`}
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

      {/* Upload form */}
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Document type</label>
              <select
                value={uploadForm.document_type}
                onChange={e => setUploadForm(p => ({ ...p, document_type: e.target.value as DocumentType }))}
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-xs focus:outline-none focus:ring-2 focus:ring-[#5B6C8F] bg-white"
              >
                {Object.entries(DOC_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={uploadForm.description}
                onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional note"
                className="w-full px-3 py-2 rounded-lg border border-[#C8BFB2] text-[#2F3437] text-xs focus:outline-none focus:ring-2 focus:ring-[#5B6C8F]"
              />
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

      {/* Documents list */}
      <div className="divide-y divide-slate-100">
        {documents.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <FileText size={22} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No documents yet.</p>
            <p className="text-xs text-slate-400 mt-1">Upload manuals, warranties, and receipts.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
              <div className="text-slate-400 flex-shrink-0">
                {getFileIcon(doc.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2F3437] truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${DOC_TYPE_COLORS[doc.document_type]}`}>
                    {DOC_TYPE_LABELS[doc.document_type]}
                  </span>
                  {doc.file_size && (
                    <span className="text-xs text-slate-400">{formatBytes(doc.file_size)}</span>
                  )}
                </div>
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#5B6C8F] transition-colors flex-shrink-0"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
