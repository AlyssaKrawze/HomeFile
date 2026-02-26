import Link from 'next/link'
import { Home, ChevronRight } from 'lucide-react'

export default function GuidePage() {
  const steps = [
    {
      step: '1',
      title: 'Add your home',
      body: 'From the dashboard, click "Add Home" and fill in your address and details. You can track multiple homes.',
    },
    {
      step: '2',
      title: 'Add rooms',
      body: 'Go to your home overview and add rooms (kitchen, bathroom, garage, etc.). Drag them to reorder.',
    },
    {
      step: '3',
      title: 'Add items to each room',
      body: 'Inside a room, add appliances and fixtures — refrigerator, HVAC, water heater, and more. Use "Look up product" to auto-fill details.',
    },
    {
      step: '4',
      title: 'Log service history',
      body: 'On each item\'s page, record service visits, repairs, and inspections. Track cost, technician, and next service date.',
    },
    {
      step: '5',
      title: 'Schedule maintenance',
      body: 'Add scheduled tasks with due dates and priorities. View them all on the Calendar. Get alerts when tasks are overdue.',
    },
    {
      step: '6',
      title: 'Invite household members',
      body: 'Go to Members & Access to add your family or property manager with different permission levels.',
    },
    {
      step: '7',
      title: 'Use the Home Binder',
      body: 'Generate a PDF of all your home\'s items, warranties, and service history — perfect for insurance or selling your home.',
    },
    {
      step: '8',
      title: 'Secure the Vault',
      body: 'Store sensitive info (WiFi passwords, safe combinations, alarm codes) in the encrypted Vault, protected by a 4-digit PIN.',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Getting Started Guide</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#5B6C8F] flex items-center justify-center flex-shrink-0">
          <Home size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-2xl text-[#2F3437]" style={{ fontFamily: 'Georgia, serif' }}>
            Getting Started Guide
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">TheHomePage in 8 simple steps</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((s) => (
          <div key={s.step} className="bg-white rounded-2xl border border-[#C8BFB2] p-5 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#dce4ef] flex items-center justify-center flex-shrink-0 font-bold text-[#4a5c77] text-sm">
              {s.step}
            </div>
            <div>
              <h3 className="font-semibold text-[#2F3437] mb-1">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#dce4ef] rounded-2xl p-5 text-center">
        <p className="text-sm font-medium text-[#2F3437] mb-3">Ready to get started?</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Go to My Homes
        </Link>
      </div>
    </div>
  )
}
