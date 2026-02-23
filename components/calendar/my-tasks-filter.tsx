'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { User } from 'lucide-react'

interface MyTasksFilterProps {
  active: boolean
}

export default function MyTasksFilter({ active }: MyTasksFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    if (active) {
      params.delete('filter')
    } else {
      params.set('filter', 'mine')
    }
    const query = params.toString()
    router.push(query ? `?${query}` : '?')
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
        active
          ? 'bg-[#5B6C8F] text-white border-[#5B6C8F] hover:bg-[#4a5c77]'
          : 'bg-white text-slate-600 border-[#C8BFB2] hover:border-[#7a8fa8] hover:text-[#5B6C8F]'
      }`}
      title={active ? 'Show all tasks' : 'Show my tasks only'}
    >
      <User size={14} />
      My Tasks
    </button>
  )
}
