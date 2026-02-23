'use client'

import { useState, useCallback } from 'react'
import { Lock, Plus, Loader2 } from 'lucide-react'
import VaultLockScreen from './vault-lock-screen'
import VaultEntryCard from './vault-entry-card'
import VaultAddEntryForm from './vault-add-entry-form'
import type { VaultEntryDecrypted } from '@/lib/types'

interface VaultContentProps {
  homeId: string
  hasPinSet: boolean
}

export default function VaultContent({ homeId, hasPinSet }: VaultContentProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [entries, setEntries] = useState<VaultEntryDecrypted[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [fetchingEntries, setFetchingEntries] = useState(false)

  const fetchEntries = useCallback(async () => {
    setFetchingEntries(true)
    const res = await fetch(`/api/homes/${homeId}/vault/entries`)
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
    }
    setFetchingEntries(false)
  }, [homeId])

  async function handleUnlocked() {
    setUnlocked(true)
    await fetchEntries()
  }

  function handleLock() {
    setUnlocked(false)
    setEntries([])
    setShowAddForm(false)
  }

  function handleAdded(entry: VaultEntryDecrypted) {
    setEntries(prev => [...prev, entry])
    setShowAddForm(false)
  }

  function handleDeleted(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  if (!unlocked) {
    return <VaultLockScreen homeId={homeId} hasPinSet={hasPinSet} onUnlocked={handleUnlocked} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
          >
            <Plus size={15} />
            Add Entry
          </button>
          <button
            onClick={handleLock}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors ml-2"
            title="Lock vault"
          >
            <Lock size={14} />
            Lock
          </button>
        </div>
      </div>

      {showAddForm && (
        <VaultAddEntryForm
          homeId={homeId}
          onAdded={handleAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {fetchingEntries ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <Lock size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No entries yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first credential above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entries.map(entry => (
            <VaultEntryCard
              key={entry.id}
              entry={entry}
              homeId={homeId}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
