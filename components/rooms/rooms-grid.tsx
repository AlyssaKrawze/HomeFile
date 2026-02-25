'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutGrid, List, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ROOM_CATEGORIES, type PermissionCategory } from '@/lib/types'
import AddRoomModal from '@/components/rooms/add-room-modal'
import DeleteRoomButton from '@/components/rooms/delete-room-button'

interface Room {
  id: string
  name: string
  category: string
  floor: number
  sort_order: number
}

interface RoomsGridProps {
  rooms: Room[]
  homeId: string
  canManage: boolean
  countsByRoom: Record<string, number>
}

function SortableRoomCard({
  room, homeId, appCount, isDragging, canManage,
}: {
  room: Room
  homeId: string
  appCount: number
  isDragging: boolean
  canManage: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: room.id })
  const router = useRouter()
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'none',
  }
  const cat = ROOM_CATEGORIES[room.category as PermissionCategory] || ROOM_CATEGORIES.other

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => router.push(`/dashboard/homes/${homeId}/rooms/${room.id}`)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-5 select-none ${
        isDragging
          ? 'cursor-grabbing border-[#9ab0c4] shadow-lg'
          : 'cursor-grab border-[#C8BFB2] hover:border-[#9ab0c4] hover:shadow-md'
      }`}
    >
      {/* Drag indicator */}
      <GripVertical
        size={14}
        className="absolute top-3 left-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${cat.bgColor} flex items-center justify-center text-2xl`}>
          {cat.icon}
        </div>
        <div className="flex items-center gap-1">
          {appCount > 0 && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
              {appCount} item{appCount !== 1 ? 's' : ''}
            </span>
          )}
          {canManage && (
            <DeleteRoomButton
              homeId={homeId}
              roomId={room.id}
              roomName={room.name}
              itemCount={appCount}
            />
          )}
        </div>
      </div>
      <h3 className="font-semibold text-[#2F3437] group-hover:text-[#5B6C8F] transition-colors text-sm">
        {room.name}
      </h3>
      <p className={`text-xs font-medium mt-0.5 ${cat.color}`}>{cat.label}</p>
      {room.floor > 1 && (
        <p className="text-xs text-slate-400 mt-0.5">Floor {room.floor}</p>
      )}
      {appCount === 0 && (
        <p className="text-xs text-slate-400 mt-3 italic">No items yet</p>
      )}
    </div>
  )
}

export default function RoomsGrid({ rooms: initialRooms, homeId, canManage, countsByRoom }: RoomsGridProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [view, setView] = useState<'card' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('homefile_rooms_view') as 'card' | 'list') || 'card'
    }
    return 'card'
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const router = useRouter()

  // distance: 8 prevents accidental drags on simple clicks
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleViewToggle(v: 'card' | 'list') {
    setView(v)
    if (typeof window !== 'undefined') localStorage.setItem('homefile_rooms_view', v)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = rooms.findIndex(r => r.id === active.id)
    const newIndex = rooms.findIndex(r => r.id === over.id)
    const newRooms = arrayMove(rooms, oldIndex, newIndex)
    setRooms(newRooms)

    const order = newRooms.map((r, i) => ({ id: r.id, sort_order: i }))
    await fetch(`/api/homes/${homeId}/rooms/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    })
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-700">Rooms & Areas</h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/homes/${homeId}/inventory`}
            className="text-sm text-[#5B6C8F] hover:text-[#4a5c77] font-medium flex items-center gap-1"
          >
            View all items
          </Link>
          <div className="flex items-center border border-[#C8BFB2] rounded-lg overflow-hidden ml-3">
            <button
              onClick={() => handleViewToggle('card')}
              className={`p-1.5 ${view === 'card' ? 'bg-[#5B6C8F] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="Card view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => handleViewToggle('list')}
              className={`p-1.5 ${view === 'list' ? 'bg-[#5B6C8F] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {view === 'card' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={e => setActiveId(String(e.active.id))}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rooms.map(r => r.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map(room => (
                <SortableRoomCard
                  key={room.id}
                  room={room}
                  homeId={homeId}
                  appCount={countsByRoom[room.id] || 0}
                  isDragging={activeId === room.id}
                  canManage={canManage}
                />
              ))}
              {canManage && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-[#C8BFB2] hover:border-[#9ab0c4] flex items-center justify-center min-h-32 transition-colors">
                  <AddRoomModal homeId={homeId} trigger="card" />
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="bg-white rounded-2xl border border-[#C8BFB2] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {rooms.map(room => {
              const cat = ROOM_CATEGORIES[room.category as PermissionCategory] || ROOM_CATEGORIES.other
              const appCount = countsByRoom[room.id] || 0
              return (
                <Link
                  key={room.id}
                  href={`/dashboard/homes/${homeId}/rooms/${room.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F4F1EA] transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg ${cat.bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2F3437] group-hover:text-[#5B6C8F] transition-colors">{room.name}</p>
                    <p className={`text-xs font-medium ${cat.color}`}>{cat.label}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
                    {appCount > 0 && (
                      <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
                        {appCount} item{appCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {room.floor > 1 && <span>Floor {room.floor}</span>}
                  </div>
                </Link>
              )
            })}
          </div>
          {canManage && (
            <div className="px-5 py-3 border-t border-[#E0D9D0]">
              <AddRoomModal homeId={homeId} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
