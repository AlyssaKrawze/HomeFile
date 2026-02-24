'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { type TaskAssigneeMember } from '@/lib/types'

interface ProjectTagsEditorProps {
  projectId: string
  homeId: string
  rooms: { id: string; name: string }[]
  appliances: { id: string; name: string }[]
  members: TaskAssigneeMember[]
  taggedRoomIds: string[]
  taggedApplianceIds: string[]
  taggedMemberIds: string[]
  canManage: boolean
}

export default function ProjectTagsEditor({
  projectId, homeId,
  rooms, appliances, members,
  taggedRoomIds, taggedApplianceIds, taggedMemberIds,
  canManage,
}: ProjectTagsEditorProps) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selRooms, setSelRooms] = useState<string[]>(taggedRoomIds)
  const [selAppliances, setSelAppliances] = useState<string[]>(taggedApplianceIds)
  const [selMembers, setSelMembers] = useState<string[]>(taggedMemberIds)
  const router = useRouter()
  const supabase = createClient()

  function toggle<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter(x => x !== item) : [...list, item]
  }

  async function handleSave() {
    setLoading(true)
    // Sync rooms
    await supabase.from('project_rooms').delete().eq('project_id', projectId)
    if (selRooms.length > 0) {
      await supabase.from('project_rooms').insert(selRooms.map(room_id => ({ project_id: projectId, room_id })))
    }
    // Sync appliances
    await supabase.from('project_appliances').delete().eq('project_id', projectId)
    if (selAppliances.length > 0) {
      await supabase.from('project_appliances').insert(selAppliances.map(appliance_id => ({ project_id: projectId, appliance_id })))
    }
    // Sync members
    await supabase.from('project_members').delete().eq('project_id', projectId)
    if (selMembers.length > 0) {
      await supabase.from('project_members').insert(selMembers.map(user_id => ({ project_id: projectId, user_id })))
    }
    setEditing(false)
    setLoading(false)
    router.refresh()
  }

  const taggedRooms = rooms.filter(r => taggedRoomIds.includes(r.id))
  const taggedAppliances = appliances.filter(a => taggedApplianceIds.includes(a.id))
  const taggedMembers = members.filter(m => taggedMemberIds.includes(m.user_id))

  const hasAny = taggedRooms.length > 0 || taggedAppliances.length > 0 || taggedMembers.length > 0

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9D0]">
        <h2 className="font-semibold text-[#2F3437]">Related</h2>
        {canManage && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm font-medium text-[#5B6C8F] hover:text-[#4a5c77] transition-colors"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <div className="px-6 py-4 flex flex-col gap-4">
        {editing ? (
          <>
            {rooms.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Rooms</p>
                <div className="flex flex-wrap gap-1.5">
                  {rooms.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelRooms(s => toggle(s, r.id))}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                        selRooms.includes(r.id)
                          ? 'bg-[#5B6C8F] border-[#5B6C8F] text-white'
                          : 'border-[#C8BFB2] text-slate-600 hover:border-[#7a8fa8]'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {appliances.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Appliances</p>
                <div className="flex flex-wrap gap-1.5">
                  {appliances.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelAppliances(s => toggle(s, a.id))}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                        selAppliances.includes(a.id)
                          ? 'bg-[#5B6C8F] border-[#5B6C8F] text-white'
                          : 'border-[#C8BFB2] text-slate-600 hover:border-[#7a8fa8]'
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {members.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Team</p>
                <div className="flex flex-wrap gap-1.5">
                  {members.map(m => (
                    <button
                      key={m.user_id}
                      type="button"
                      onClick={() => setSelMembers(s => toggle(s, m.user_id))}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                        selMembers.includes(m.user_id)
                          ? 'bg-[#5B6C8F] border-[#5B6C8F] text-white'
                          : 'border-[#C8BFB2] text-slate-600 hover:border-[#7a8fa8]'
                      }`}
                    >
                      {m.full_name || m.email}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : hasAny ? (
          <>
            {taggedRooms.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Rooms</p>
                <div className="flex flex-wrap gap-1.5">
                  {taggedRooms.map(r => (
                    <span key={r.id} className="text-xs px-2.5 py-1 rounded-full bg-[#d6d9ee] text-[#5a628a] font-medium">{r.name}</span>
                  ))}
                </div>
              </div>
            )}
            {taggedAppliances.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Appliances</p>
                <div className="flex flex-wrap gap-1.5">
                  {taggedAppliances.map(a => (
                    <span key={a.id} className="text-xs px-2.5 py-1 rounded-full bg-[#eee8cc] text-[#8a7a3a] font-medium">{a.name}</span>
                  ))}
                </div>
              </div>
            )}
            {taggedMembers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Team</p>
                <div className="flex flex-wrap gap-1.5">
                  {taggedMembers.map(m => (
                    <span key={m.user_id} className="text-xs px-2.5 py-1 rounded-full bg-[#d6ede8] text-[#5a8a7d] font-medium">{m.full_name || m.email}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">
            No rooms, appliances, or team members tagged.
            {canManage && ' Click Edit to add them.'}
          </p>
        )}
      </div>
    </div>
  )
}
