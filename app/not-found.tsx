import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#dce4ef] flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-4xl" style={{ fontFamily: 'Georgia, serif' }}>H</span>
        </div>
        <h1 className="font-bold text-6xl text-[#2F3437] mb-3" style={{ fontFamily: 'Georgia, serif' }}>404</h1>
        <h2 className="text-xl font-semibold text-[#2F3437] mb-2">Page not found</h2>
        <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <Home size={16} />
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
