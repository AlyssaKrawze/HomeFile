'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Task {
  id: string
  title: string
  due_date: string
  status: string
  priority: string
}

interface CalendarViewProps {
  tasks: Task[]
  homeId: string
  userId: string
}

// 2-char abbreviations fit 7-column grid on all screen sizes
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const today = new Date()
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month)
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month)
  const todayStr = today.toISOString().split('T')[0]

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const date = task.due_date
    if (!acc[date]) acc[date] = []
    acc[date].push(task)
    return acc
  }, {})

  function prevMonth() {
    setViewDate(prev =>
      prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 }
    )
  }

  function nextMonth() {
    setViewDate(prev =>
      prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 }
    )
  }

  function getTaskDotColor(task: Task): string {
    if (task.status === 'completed') return 'bg-green-400'
    if (task.due_date < todayStr) return 'bg-red-400'
    if (task.priority === 'urgent') return 'bg-red-400'
    if (task.priority === 'high') return 'bg-amber-400'
    return 'bg-[#7a8fa8]'
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="bg-white rounded-2xl border border-[#C8BFB2] p-3 sm:p-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-[#2F3437]">
          {MONTHS[viewDate.month]} {viewDate.year}
        </h2>
        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(day => (
          <div key={day} className="text-center text-[11px] font-semibold text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-12 sm:h-16" />
          }

          const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayTasks = tasksByDate[dateStr] || []
          const isToday = dateStr === todayStr

          return (
            <div
              key={dateStr}
              className={`h-12 sm:h-16 rounded-lg sm:rounded-xl p-1 sm:p-1.5 border transition-colors ${
                isToday
                  ? 'bg-[#eef1f6] border-[#9ab0c4]'
                  : dayTasks.length > 0
                  ? 'bg-[#F4F1EA] border-[#C8BFB2]'
                  : 'border-transparent'
              }`}
            >
              <span className={`text-[11px] sm:text-xs font-medium block leading-none ${
                isToday ? 'text-[#4a5c77]' : 'text-slate-600'
              }`}>
                {day}
              </span>
              {dayTasks.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {dayTasks.slice(0, 3).map((task, ti) => (
                    <div
                      key={ti}
                      title={task.title}
                      className={`w-1.5 h-1.5 rounded-full ${getTaskDotColor(task)}`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] sm:text-xs text-slate-400">+{dayTasks.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-[#E0D9D0]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7a8fa8] flex-shrink-0" />
          Pending
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
          High priority
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
          Overdue
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
          Completed
        </div>
      </div>
    </div>
  )
}
