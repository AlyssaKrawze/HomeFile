import Link from 'next/link'

export default function FooterLinks() {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Link href="/privacy" className="text-slate-500 text-sm hover:text-slate-700 transition-colors">
        Privacy Policy
      </Link>
      <span className="text-slate-300">|</span>
      <Link href="/terms" className="text-slate-500 text-sm hover:text-slate-700 transition-colors">
        Terms of Service
      </Link>
    </div>
  )
}
