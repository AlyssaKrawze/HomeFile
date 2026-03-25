import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { privacyPolicyHtml } from './privacy-html'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      <header className="border-b border-[#C8BFB2] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#5B6C8F] flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-[#2F3437]">TheHomeFile</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border border-[#C8BFB2] p-8 md:p-12">
          <div
            className="privacy-content"
            dangerouslySetInnerHTML={{ __html: privacyPolicyHtml }}
          />
        </div>
      </main>

      <style>{`
        .privacy-content h1 {
          font-family: var(--font-playfair-display), Georgia, serif;
          font-size: 1.875rem;
          font-weight: 700;
          color: #2F3437;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .privacy-content h2 {
          font-family: var(--font-playfair-display), Georgia, serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #2F3437;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .privacy-content [data-custom-class="subtitle"] {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          display: block;
        }
        .privacy-content [data-custom-class="body_text"],
        .privacy-content [data-custom-class="body_text"] * {
          font-family: inherit !important;
          color: #4b5563 !important;
          font-size: 0.9375rem !important;
          line-height: 1.7 !important;
        }
        .privacy-content [data-custom-class="heading_1"],
        .privacy-content [data-custom-class="heading_1"] * {
          font-family: var(--font-playfair-display), Georgia, serif !important;
          color: #2F3437 !important;
        }
        .privacy-content [data-custom-class="heading_2"],
        .privacy-content [data-custom-class="heading_2"] * {
          font-family: var(--font-playfair-display), Georgia, serif !important;
          color: #2F3437 !important;
          font-size: 1.1rem !important;
        }
        .privacy-content [data-custom-class="link"],
        .privacy-content [data-custom-class="link"] * {
          color: #5B6C8F !important;
          font-family: inherit !important;
          font-size: 0.9375rem !important;
        }
        .privacy-content [data-custom-class="title"],
        .privacy-content [data-custom-class="title"] * {
          font-family: var(--font-playfair-display), Georgia, serif !important;
          color: #2F3437 !important;
        }
        .privacy-content div {
          line-height: 1.7;
        }
        .privacy-content ul {
          list-style-type: square;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .privacy-content ul > li > ul {
          list-style-type: circle;
        }
        .privacy-content ul > li > ul > li > ul {
          list-style-type: square;
        }
        .privacy-content li {
          font-size: 0.9375rem;
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 0.25rem;
        }
        .privacy-content a {
          color: #5B6C8F;
          text-decoration: underline;
        }
        .privacy-content a:hover {
          color: #4a5c77;
        }
        .privacy-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .privacy-content td, .privacy-content th {
          border: 1px solid #C8BFB2;
          padding: 0.75rem;
          font-size: 0.875rem;
          color: #4b5563;
        }
      `}</style>
    </div>
  )
}
