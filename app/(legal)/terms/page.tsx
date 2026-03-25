import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1
            className="text-3xl font-bold text-[#2F3437] mb-2"
            style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
          >
            TERMS OF USE
          </h1>
          <p className="text-slate-500 text-sm mb-8">Last updated March 14, 2026</p>

          <div className="space-y-8 text-[#4b5563] text-[0.9375rem] leading-[1.7]">
            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                AGREEMENT TO OUR LEGAL TERMS
              </h2>
              <p className="mb-3">
                We are TheHomeFile (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). We operate home-file.vercel.app, as well as any other related products and services that refer or link to these legal terms (the &ldquo;Legal Terms&rdquo;) (collectively, the &ldquo;Services&rdquo;). You can contact us by email at{' '}
                <a href="mailto:alyssakrawze@gmail.com" className="text-[#5B6C8F] underline hover:text-[#4a5c77]">alyssakrawze@gmail.com</a>{' '}
                or by mail to 30 Peabody St, Apt 2401, Nashville, TN 37210.
              </p>
              <p className="mb-3">
                These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&ldquo;you&rdquo;), and TheHomeFile, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
              </p>
              <p>
                We reserve the right to make changes to these Legal Terms at any time. We will alert you about changes by updating the &lsquo;Last updated&rsquo; date. Your continued use of the Services after such changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                OUR SERVICES
              </h2>
              <p>
                The Services are not intended for distribution or use in any jurisdiction where such use would be contrary to law. Users who access the Services from other locations do so on their own initiative and are responsible for compliance with local laws.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                INTELLECTUAL PROPERTY RIGHTS
              </h2>
              <p>
                We own all intellectual property rights in our Services, including source code, databases, functionality, software, website designs, text, photographs, and graphics, as well as all trademarks and logos. We grant you a non-exclusive, non-transferable, revocable license to access the Services for your personal, non-commercial use or internal business purpose only. Any unauthorized use will terminate this license immediately.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                USER REPRESENTATIONS
              </h2>
              <p>
                By using the Services, you represent that you have the legal capacity to agree to these Legal Terms, are not a minor, will not use the Services for any illegal purpose, and that your use will not violate any applicable law or regulation.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                PROHIBITED ACTIVITIES
              </h2>
              <p>
                You may not use the Services for any purpose other than that for which we make them available. Prohibited activities include: systematically retrieving data to build a database or directory; tricking or defrauding other users; circumventing security features; uploading viruses or malicious code; attempting to impersonate another user; using the Services to compete with us; or any other unauthorized use.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                USER GENERATED CONTRIBUTIONS
              </h2>
              <p>
                Users may upload content including photos, documents, and receipts. You retain ownership of all content you upload. By uploading content, you represent that you have the right to do so and that the content does not violate any third-party rights.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                CONTRIBUTION LICENSE
              </h2>
              <p>
                By submitting feedback or suggestions about the Services, you agree that we may use such feedback for any purpose without compensation to you. We do not assert ownership over your uploaded home data, documents, or photos.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                SERVICES MANAGEMENT
              </h2>
              <p>
                We reserve the right to monitor the Services for violations of these Legal Terms, take appropriate action against violators, and manage the Services to protect our rights and facilitate proper functioning.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                TERM AND TERMINATION
              </h2>
              <p>
                These Legal Terms remain in effect while you use the Services. We reserve the right to deny access, terminate accounts, or delete content at any time and for any reason, including breach of these Legal Terms.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                MODIFICATIONS AND INTERRUPTIONS
              </h2>
              <p>
                We reserve the right to change or remove content from the Services at any time without notice. We are not liable for any downtime, interruptions, or modifications to the Services.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                GOVERNING LAW
              </h2>
              <p>
                These Legal Terms are governed by the laws of the State of Tennessee. You irrevocably consent that the courts of Tennessee shall have exclusive jurisdiction to resolve any dispute arising from these Legal Terms.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                DISPUTE RESOLUTION
              </h2>
              <p className="mb-3">
                <strong className="text-[#2F3437]">Informal Negotiations:</strong> Before initiating arbitration, the parties agree to attempt to resolve any dispute informally for at least 30 days via written notice.
              </p>
              <p className="mb-3">
                <strong className="text-[#2F3437]">Binding Arbitration:</strong> Any dispute not resolved informally shall be resolved by binding arbitration. The arbitration shall take place in Nashville, Tennessee, with 1 arbitrator, conducted in English, under the substantive law of Tennessee. No class action arbitration is permitted.
              </p>
              <p>
                <strong className="text-[#2F3437]">Exceptions:</strong> Disputes involving intellectual property rights, theft, piracy, invasion of privacy, or requests for injunctive relief are not subject to arbitration.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                CORRECTIONS
              </h2>
              <p>
                We reserve the right to correct any errors, inaccuracies, or omissions on the Services at any time without prior notice.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                DISCLAIMER
              </h2>
              <p>
                THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                LIMITATIONS OF LIABILITY
              </h2>
              <p>
                OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER SHALL BE LIMITED TO THE AMOUNT PAID BY YOU TO US IN THE 12 MONTHS PRECEDING THE CLAIM. WE ARE NOT LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, INCIDENTAL, OR PUNITIVE DAMAGES.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                INDEMNIFICATION
              </h2>
              <p>
                You agree to defend, indemnify, and hold TheHomeFile harmless from any claims arising from your use of the Services, breach of these Legal Terms, or violation of any third-party rights.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                USER DATA
              </h2>
              <p>
                You are responsible for all data you transmit to the Services. We perform routine backups but are not liable for any loss or corruption of your data.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                ELECTRONIC COMMUNICATIONS
              </h2>
              <p>
                By using the Services, you consent to receive electronic communications and agree that all electronic agreements, notices, and disclosures satisfy any legal requirement that such communications be in writing.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                MISCELLANEOUS
              </h2>
              <p>
                These Legal Terms constitute the entire agreement between you and TheHomeFile. If any provision is found unenforceable, the remaining provisions remain in full effect.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold text-[#2F3437] mb-3"
                style={{ fontFamily: 'var(--font-playfair-display), Georgia, serif' }}
              >
                CONTACT US
              </h2>
              <p>
                TheHomeFile<br />
                30 Peabody St, Apt 2401<br />
                Nashville, TN 37210<br />
                <a href="mailto:alyssakrawze@gmail.com" className="text-[#5B6C8F] underline hover:text-[#4a5c77]">alyssakrawze@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
