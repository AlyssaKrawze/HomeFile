'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import HomeContactsImportModal from './home-contacts-import-modal'

interface Props {
  homeId: string
  contactCount: number
  buttonVariant?: 'primary' | 'subtle'
}

export default function HomeContactsImportTrigger({ homeId, contactCount, buttonVariant = 'primary' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {buttonVariant === 'primary' ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 border border-[#C8BFB2] hover:border-[#5B6C8F] text-slate-600 hover:text-[#5B6C8F] text-sm font-medium px-3 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          <Upload size={14} />
          <span className="hidden sm:inline">Import Contacts</span>
          <span className="sm:hidden">Import</span>
          {contactCount > 0 && (
            <span className="ml-1 text-xs text-slate-400">({contactCount})</span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
        >
          <Upload size={14} />
          Import
        </button>
      )}

      {open && (
        <HomeContactsImportModal homeId={homeId} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
