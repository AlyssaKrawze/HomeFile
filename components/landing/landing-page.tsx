'use client'

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import './landing.css'
import { LI, type LIKey } from './landing-icons'
import { MobileMockup } from './landing-mockup'

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      el.classList.add('in')
      return
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function Reveal({
  as: As = 'div',
  className = '',
  style,
  children,
}: {
  as?: 'div' | 'section' | 'article'
  className?: string
  style?: React.CSSProperties
  children: ReactNode
}) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <As ref={ref as React.Ref<HTMLDivElement>} className={`reveal ${className}`} style={style}>
      {children}
    </As>
  )
}

function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <Link href="/" className="wordmark" style={{ fontSize: size }}>
      The<span className="it">Home</span>File
      <span style={{ color: 'var(--accent)', marginLeft: 2 }}>.</span>
    </Link>
  )
}

function Nav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Wordmark />
        <nav className="nav-links">
          <a href="#what">What we file</a>
          <a href="#how">How it works</a>
          <a href="#binder">The binder</a>
          <a href="#pricing">Pricing</a>
          {isLoggedIn ? (
            <Link href="/dashboard" className="ulink">
              Go to dashboard →
            </Link>
          ) : (
            <Link href="/login" className="ulink">
              Sign in →
            </Link>
          )}
          <a href="#waitlist" className="btn btn-primary">
            Join the waitlist
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div
              className="ifade"
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}
            >
              <span className="eyebrow">The Home File · Vol. I</span>
              <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
              <span className="num" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                EST. 2026
              </span>
            </div>

            <h1 className="hero-display ifade d1">
              It&rsquo;s like
              <br />
              <span className="display-italic">CARFAX</span>,<br />
              for your home.
            </h1>

            <p
              className="ifade d2"
              style={{
                marginTop: 32,
                fontSize: 18,
                lineHeight: 1.5,
                color: 'var(--ink-2)',
                maxWidth: 520,
              }}
            >
              A complete archive of every appliance, room, receipt, warranty and service visit. Filed,
              indexed, and ready when you need it. The record your house never had.
            </p>

            <div
              className="ifade d3"
              style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <a href="#waitlist" className="btn btn-primary btn-lg">
                Start your file <LI.Arrow size={14} stroke={1.6} />
              </a>
              <a href="#what" className="btn btn-lg">
                Tour the app
              </a>
            </div>

            <div
              className="ifade d4"
              style={{
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: 'var(--ink-3)',
              }}
            >
              <span className="dot" style={{ background: 'var(--green)' }} />
              <span>Private beta · 1,247 households on the list</span>
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: 740 }}>
            <MobileMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const items = [
    'WARRANTIES',
    'MODEL NUMBERS',
    'SERVICE HISTORY',
    'PAINT COLORS',
    'WIFI CODES',
    'CONTRACTORS',
    'FILTER SIZES',
    'APPLIANCE MANUALS',
    'CLOSING DOCS',
    'INSURANCE',
    'PROPERTY TAXES',
    'FLOOR PLANS',
    'FINISHES',
    'KEY COPIES',
    'GATE CODES',
    'INSPECTION REPORTS',
  ]
  return (
    <div
      style={{
        borderTop: '1px solid var(--rule)',
        borderBottom: '1px solid var(--rule)',
        padding: '18px 0',
        overflow: 'hidden',
      }}
    >
      <div className="marquee-mask">
        <div className="marquee">
          {[...items, ...items].map((it, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontWeight: 350,
                fontSize: 28,
                color: i % 4 === 0 ? 'var(--ink)' : 'var(--ink-3)',
                letterSpacing: '-0.01em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 56,
              }}
            >
              {it}
              <span
                style={{
                  color: 'var(--ink-4)',
                  fontStyle: 'normal',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                }}
              >
                ※
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function FileMark({ num, title, meta }: { num: string; title: string; meta: string }) {
  return (
    <Reveal className="file-mark" style={{ marginBottom: 48 }}>
      <span className="num-badge">{num}</span>
      <span>{title}</span>
      <span style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}>{meta}</span>
    </Reveal>
  )
}

function Ledger() {
  const rows = [
    { v: '142', k: 'Appliances filed', sub: 'in an average home' },
    { v: '$4,800', k: 'Annual maintenance', sub: 'preventable spending' },
    { v: '7 yrs', k: 'Median ownership', sub: 'longer than you think' },
    { v: '38%', k: 'Resale uplift', sub: 'with documented history' },
  ]
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container">
        <FileMark num="FILE 02" title="By the numbers" meta="§ 2.0 · household statistics" />
        <Reveal className="ledger">
          {rows.map((r) => (
            <div key={r.k}>
              <div className="display num" style={{ fontSize: 48, color: 'var(--ink)' }}>
                {r.v}
              </div>
              <div className="eyebrow" style={{ marginTop: 10 }}>
                {r.k}
              </div>
              <div className="label-sm" style={{ marginTop: 6, color: 'var(--ink-3)' }}>
                {r.sub}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section style={{ padding: '40px 0 100px' }}>
      <div className="container">
        <Reveal
          className="manifesto-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: 80,
            alignItems: 'start',
          }}
        >
          <div>
            <div className="eyebrow">A note from the editors</div>
          </div>
          <div
            className="display"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              lineHeight: 1.18,
              fontWeight: 350,
              letterSpacing: '-0.012em',
            }}
          >
            Your home is the largest, most complicated thing you&rsquo;ll ever own, and almost nobody has a real{' '}
            <span className="display-italic">record</span> of it. We started TheHomeFile because the receipt for
            your $11,000 range shouldn&rsquo;t live in a kitchen drawer, and the WiFi password shouldn&rsquo;t live{' '}
            <span className="display-italic">only</span> in your spouse&rsquo;s head.
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function WhatWeFile() {
  const cats = [
    {
      n: '01',
      t: 'Appliances',
      d: 'Brand, model, serial, install date, warranty, manual, every service visit. From your fridge to your sump pump.',
      tags: ['Wolf range', 'Sub-Zero 648PRO', 'Bosch dishwasher', 'Trane XR16', '+ 138 more'],
    },
    {
      n: '02',
      t: 'Rooms & finishes',
      d: 'Paint colors with formulas, flooring specs, fixtures, hardware. The exact off-white in the entry hall.',
      tags: ['BM Decorator White', 'Walnut #4 oak', 'Carrara honed', 'Lutron Caséta', '+ 80 more'],
    },
    {
      n: '03',
      t: 'Documents',
      d: "Closing docs, surveys, insurance, deeds, tax records, inspection reports. Organized, OCR'd, searchable.",
      tags: ['Closing docs', 'Survey', 'Title', 'Tax records', 'Insurance', 'Permits'],
    },
    {
      n: '04',
      t: 'Vendors & contacts',
      d: 'Your plumber, electrician, landscaper, cleaner. With history of every job, every invoice, every photo.',
      tags: ['Riverside Plumbing', 'Greene Electric', 'Lawn & Order', '+ 14 more'],
    },
    {
      n: '05',
      t: 'Codes & credentials',
      d: 'WiFi, alarm, gate, garage, smart home. Encrypted in the Vault, shareable to staff for a window of time.',
      tags: ['WiFi', 'Alarm', 'Gate', 'Garage', 'Nest', 'Lutron'],
    },
    {
      n: '06',
      t: 'Maintenance',
      d: 'AI-suggested schedules. Filter changes, gutter cleans, HVAC service, seasonal turnovers. Assigned to people.',
      tags: [
        'Furnace filter · monthly',
        'HVAC · semi-annual',
        'Gutters · spring/fall',
        'Generator · annual',
      ],
    },
  ]

  return (
    <section id="what" style={{ padding: '80px 0', borderTop: '1px solid var(--rule)' }}>
      <div className="container">
        <FileMark num="FILE 03" title="The catalog" meta="§ 3.0 · what gets filed" />

        <Reveal
          className="what-intro"
          style={{
            marginBottom: 40,
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: 60,
            alignItems: 'baseline',
          }}
        >
          <h2 className="display" style={{ fontSize: 'var(--section-display)', margin: 0 }}>
            What we
            <br />
            <span className="display-italic">file</span>.
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.5,
              color: 'var(--ink-2)',
              margin: 0,
              maxWidth: 540,
            }}
          >
            Six categories. Hundreds of items per home. We start with what you&rsquo;ve got: receipts in a drawer,
            photos on a phone, model numbers in your head, and end with a clean, searchable archive.
          </p>
        </Reveal>

        <Reveal className="three-col">
          {cats.map((c) => (
            <article key={c.n}>
              <div
                className="num"
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  letterSpacing: '0.1em',
                  marginBottom: 12,
                }}
              >
                {c.n}
              </div>
              <h3 className="display" style={{ fontSize: 28, margin: '0 0 10px', fontWeight: 350 }}>
                {c.t}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--ink-2)',
                  lineHeight: 1.55,
                  margin: '0 0 18px',
                }}
              >
                {c.d}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      t: 'Walk through',
      d: 'Open the app and walk room by room. Snap a photo of every appliance, and we read the model number, find the manual, file the warranty.',
    },
    {
      n: '02',
      t: 'Forward receipts',
      d: 'Forward every home receipt to your private inbox. Or drop a folder of PDFs. Our AI reads them and links each to the right room.',
    },
    {
      n: '03',
      t: 'Invite your people',
      d: 'Add your spouse, your contractor, your house manager. Each gets the right level of access. Read-only, full edit, or just one wing.',
    },
    {
      n: '04',
      t: 'Live with it',
      d: 'Reminders arrive when filters need changing. Vendors get the model numbers they ask for. The closet light bulb is the same kind, every time.',
    },
  ]
  return (
    <section
      id="how"
      style={{ padding: '80px 0', borderTop: '1px solid var(--rule)', background: 'var(--paper)' }}
    >
      <div className="container">
        <FileMark num="FILE 04" title="How it works" meta="§ 4.0 · four steps" />

        <Reveal style={{ marginBottom: 56 }}>
          <h2 className="display" style={{ fontSize: 'var(--section-display)', margin: 0 }}>
            Onboard in an
            <br />
            <span className="display-italic">afternoon</span>.
          </h2>
        </Reveal>

        <Reveal
          className="how-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderTop: '1px solid var(--rule)',
            borderLeft: '1px solid var(--rule)',
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                padding: '32px 28px',
                borderRight: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)',
                position: 'relative',
                minHeight: 280,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  border: '1px solid var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                }}
              >
                <LI.Arrow size={14} stroke={1.6} />
              </div>
              <div
                className="num"
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  letterSpacing: '0.1em',
                  marginBottom: 16,
                }}
              >
                STEP {s.n}
              </div>
              <h3 className="display" style={{ fontSize: 26, margin: '0 0 12px', fontWeight: 350 }}>
                {s.t}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function ReceiptDemo() {
  return (
    <section style={{ padding: '120px 0', borderTop: '1px solid var(--rule)' }}>
      <div className="container">
        <FileMark num="FILE 05" title="Demonstration · Receipt → Record" meta="§ 5.0 · AI extraction" />

        <Reveal
          className="receipt-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
          }}
        >
          <div>
            <h2 className="display" style={{ fontSize: 'clamp(40px, 5vw, 72px)', margin: '0 0 28px' }}>
              From a crumpled
              <br />
              receipt to a
              <br />
              <span className="display-italic">filed record</span>.
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                color: 'var(--ink-2)',
                maxWidth: 520,
                marginBottom: 28,
              }}
            >
              Snap, forward, or drag-and-drop. Our model reads the brand, model, serial, price and warranty
              terms. It looks up the manual, links the right room, and adds the right maintenance schedule,
              automatically.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Reads handwritten + printed receipts',
                'Pulls manuals from manufacturer libraries',
                'Detects duplicates, attaches to existing records',
                'Always reviewable. Never auto-trusted',
              ].map((x) => (
                <li
                  key={x}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--rule-soft)',
                    fontSize: 14,
                    color: 'var(--ink)',
                  }}
                >
                  <span style={{ color: 'var(--green)', marginTop: 2 }}>
                    <LI.Check size={14} stroke={2} />
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>

          <ReceiptToRecord />
        </Reveal>
      </div>
    </section>
  )
}

function ReceiptToRecord() {
  const fields: [string, string][] = [
    ['Brand', 'Wolf'],
    ['Model', 'GR364C-LP'],
    ['Serial', '47-2-0184'],
    ['Installed', 'Mar 04, 2026'],
    ['Warranty', '2 years · ends 2028'],
    ['Cost', '$11,420.00'],
    ['Vendor', 'Hudson Hearth & Home'],
  ]
  return (
    <div style={{ position: 'relative', minHeight: 460 }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '5%',
          width: 220,
          background: '#fff',
          padding: 18,
          borderRadius: 4,
          boxShadow: '0 20px 50px -20px rgba(27,26,23,0.25)',
          transform: 'rotate(-4deg)',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          lineHeight: 1.6,
          zIndex: 2,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 11 }}>HUDSON HEARTH & HOME</div>
        <div style={{ fontSize: 8, color: '#888' }}>Greenwich, CT · #00482</div>
        <div style={{ fontSize: 8, color: '#888' }}>Order #29481 · Mar 04, 2026</div>
        <div style={{ borderTop: '1px dashed #ccc', marginTop: 10, paddingTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Wolf 36&quot; GR</span>
            <span>10,899.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Install kit</span>
            <span>89.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Warranty +2yr</span>
            <span>432.00</span>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid #000',
            marginTop: 8,
            paddingTop: 6,
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 600,
          }}
        >
          <span>TOTAL</span>
          <span>$11,420.00</span>
        </div>
        <div
          style={{
            marginTop: 14,
            height: 18,
            background: 'repeating-linear-gradient(90deg, #000 0 1.5px, transparent 1.5px 3px)',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '38%',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--mono)',
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--ink-3)',
        }}
      >
        <div style={{ width: 60, height: 1, background: 'var(--ink-3)' }} />
        <span>AI</span>
        <div style={{ width: 16, height: 1, background: 'var(--ink-3)' }} />
        <LI.Arrow size={12} />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 0,
          width: 280,
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 6,
          padding: 22,
          boxShadow: '0 24px 60px -24px rgba(27,26,23,0.20)',
          zIndex: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <div className="eyebrow">RECORD · APPLIANCE</div>
          <span className="tag tag-ink">FILED</span>
        </div>
        <div className="display" style={{ fontSize: 22, fontWeight: 350, marginBottom: 4 }}>
          Wolf 36&quot; Range
        </div>
        <div className="display-italic" style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 16 }}>
          Kitchen · primary cooktop
        </div>

        <div style={{ borderTop: '1px solid var(--rule-soft)' }}>
          {fields.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '7px 0',
                borderBottom: '1px solid var(--rule-soft)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}
              >
                {k}
              </span>
              <span className="num" style={{ fontSize: 12, color: 'var(--ink)' }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="tag">
            <LI.File size={9} /> Receipt.pdf
          </span>
          <span className="tag">
            <LI.Book size={9} /> Manual.pdf
          </span>
          <span className="tag">
            <LI.Calendar size={9} /> 4 tasks scheduled
          </span>
        </div>
      </div>
    </div>
  )
}

function AISection() {
  const qa = [
    {
      q: 'When did we last service the boiler?',
      a: 'Riverside Mechanical, Nov 14, 2025. Replaced expansion tank ($412). Next service: May 2026.',
    },
    {
      q: 'What kind of light bulbs in the dining room?',
      a: 'Philips Hue White Ambiance E26, 75W equivalent. 6 in chandelier, 4 in sconces. Last bought Feb 2025.',
    },
    {
      q: 'How much have we spent on the kitchen this year?',
      a: '$14,832. Largest line: Wolf range ($11,420). Itemized in Records › Kitchen.',
    },
  ]
  return (
    <section
      style={{
        padding: '100px 0',
        borderTop: '1px solid var(--rule)',
        background: 'var(--ink)',
        color: 'var(--paper)',
      }}
    >
      <div className="container">
        <Reveal style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 40 }}>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--ink-4)',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            FILE 06 · INTELLIGENCE
          </span>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.18)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-4)' }}>§ 6.0</span>
        </Reveal>

        <Reveal
          className="ai-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'start',
          }}
        >
          <div>
            <h2
              className="display"
              style={{ fontSize: 'var(--section-display)', margin: 0, color: 'var(--paper)' }}
            >
              An AI that
              <br />
              actually <span className="display-italic">knows</span>
              <br />
              your house.
            </h2>
            <p
              style={{
                marginTop: 32,
                fontSize: 17,
                lineHeight: 1.55,
                color: 'rgba(250,247,241,0.75)',
                maxWidth: 520,
              }}
            >
              Ask in plain English. Get answers from your own home&rsquo;s history. Not a generic chatbot. Every
              answer cites the receipt, manual, or log entry it came from.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              padding: 24,
            }}
          >
            {qa.map((r, i) => (
              <div
                key={r.q}
                style={{
                  borderBottom: i < qa.length - 1 ? '1px solid rgba(255,255,255,0.10)' : 'none',
                  padding: '14px 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--ink-4)',
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      marginTop: 4,
                    }}
                  >
                    YOU
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: 17,
                      color: 'var(--paper)',
                    }}
                  >
                    {r.q}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span
                    style={{
                      color: 'var(--ink-4)',
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      marginTop: 4,
                    }}
                  >
                    HF
                  </span>
                  <span
                    style={{
                      fontSize: 13.5,
                      color: 'rgba(250,247,241,0.85)',
                      lineHeight: 1.55,
                    }}
                  >
                    {r.a}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function UseCases() {
  const cases: { t: string; d: string; who: string; icon: LIKey }[] = [
    {
      t: 'For owners',
      d: 'Stop hunting for the manual. Stop missing the warranty window. Know what you own.',
      who: 'You · your spouse',
      icon: 'Home',
    },
    {
      t: 'For staff',
      d: 'House manager, cleaner, contractor. They get the codes, models, and schedules they need, nothing more.',
      who: 'House manager · cleaner',
      icon: 'Users',
    },
    {
      t: 'For vendors',
      d: "They ask for the model, you tap a button, it's in their inbox. No hunting in the basement.",
      who: 'Plumber · electrician',
      icon: 'Wrench',
    },
    {
      t: 'For sale',
      d: 'Hand the next owner a beautiful, complete archive at closing. The home keeps its memory.',
      who: 'Buyers · agents',
      icon: 'Book',
    },
  ]
  return (
    <section style={{ padding: '100px 0', borderTop: '1px solid var(--rule)' }}>
      <div className="container">
        <FileMark num="FILE 07" title="Who it's for" meta="§ 7.0 · four audiences" />
        <Reveal style={{ marginBottom: 48 }}>
          <h2 className="display" style={{ fontSize: 'var(--section-display)', margin: 0 }}>
            One file.
            <br />
            Many <span className="display-italic">readers</span>.
          </h2>
        </Reveal>
        <Reveal
          className="use-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            borderTop: '1px solid var(--rule)',
            borderLeft: '1px solid var(--rule)',
          }}
        >
          {cases.map((c) => {
            const Ico = LI[c.icon] || LI.Home
            return (
              <div
                key={c.t}
                style={{
                  padding: '36px 28px',
                  borderRight: '1px solid var(--rule)',
                  borderBottom: '1px solid var(--rule)',
                  minHeight: 280,
                }}
              >
                <Ico size={28} stroke={1.2} />
                <h3 className="display" style={{ fontSize: 26, margin: '24px 0 10px', fontWeight: 350 }}>
                  {c.t}
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    color: 'var(--ink-2)',
                    lineHeight: 1.55,
                    margin: '0 0 20px',
                  }}
                >
                  {c.d}
                </p>
                <div className="eyebrow">{c.who}</div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

function PullQuote() {
  return (
    <section style={{ padding: '120px 0', borderTop: '1px solid var(--rule)', background: 'var(--paper)' }}>
      <div className="container">
        <Reveal style={{ maxWidth: 980 }}>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 80,
              lineHeight: 1,
              color: 'var(--rule)',
              marginBottom: -12,
            }}
          >
            &ldquo;
          </div>
          <p className="pull">
            We sold our house last spring. The buyer&rsquo;s agent said the file we handed them. Every receipt,
            every paint color, every service visit, added six figures to the offer. That&rsquo;s not{' '}
            <span className="display-italic">marketing</span>. That&rsquo;s what actually happened.
          </p>
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 99,
                background: 'var(--ink)',
                color: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 18,
              }}
            >
              EM
            </div>
            <div>
              <div style={{ fontSize: 14, color: 'var(--ink)' }}>Eleanor Marchetti</div>
              <div className="label-sm">Sold a 1928 colonial · Greenwich, CT · 2025</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Binder() {
  const stats: [string, string][] = [
    ['148', 'Pages, indexed'],
    ['$89', 'Per linen binder'],
    ['8.4 MB', 'PDF, free'],
    ['Yearly', 'Auto-refresh'],
  ]
  return (
    <section id="binder" style={{ padding: '120px 0', borderTop: '1px solid var(--rule)' }}>
      <div className="container">
        <FileMark num="FILE 08" title="The Binder" meta="§ 8.0 · printed archive" />

        <Reveal
          className="binder-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 80,
            alignItems: 'center',
          }}
        >
          <div>
            <h2 className="display" style={{ fontSize: 'var(--section-display)', margin: 0 }}>
              Print it. Hand it
              <br />
              over at <span className="display-italic">closing</span>.
            </h2>
            <p
              style={{
                marginTop: 32,
                fontSize: 17,
                lineHeight: 1.55,
                color: 'var(--ink-2)',
                maxWidth: 540,
              }}
            >
              Once a year, or whenever you want, generate a beautiful printed binder of your entire archive.
              Linen-bound, indexed, organized by room. We ship it. Or download a 148-page PDF and print it
              yourself.
            </p>
            <div
              style={{
                marginTop: 32,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 24,
                maxWidth: 480,
              }}
            >
              {stats.map(([v, k]) => (
                <div key={k}>
                  <div className="num display" style={{ fontSize: 28, color: 'var(--ink)' }}>
                    {v}
                  </div>
                  <div className="eyebrow" style={{ marginTop: 4 }}>
                    {k}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BinderVisual />
        </Reveal>
      </div>
    </section>
  )
}

function BinderVisual() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 320,
          height: 420,
          background: 'linear-gradient(135deg, #6B2D2A 0%, #5A2522 100%)',
          borderRadius: '4px 8px 8px 4px',
          padding: '32px 36px',
          boxShadow:
            '0 30px 60px -20px rgba(27,26,23,0.45), inset -4px 0 0 rgba(0,0,0,0.15), inset 4px 0 0 rgba(255,255,255,0.05)',
          color: '#F5E9DA',
          position: 'relative',
          transform: 'rotate(-2deg)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: '40px 0',
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: '#3A1715',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
              }}
            />
          ))}
        </div>

        <div style={{ paddingLeft: 24 }}>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            VOLUME I · 2026
          </div>
          <div
            style={{
              width: 80,
              height: 1,
              background: 'rgba(245,233,218,0.4)',
              margin: '14px 0 28px',
            }}
          />
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 400,
              fontSize: 38,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            The
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 350 }}>Cliffwood</span>
            <br />
            House
          </div>
          <div style={{ marginTop: 20, fontSize: 12.5, opacity: 0.8, lineHeight: 1.5 }}>
            Estate archive · 24 rooms
            <br />
            142 appliances · 236 documents
            <br />
            Compiled by The Marchetti Family
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 60,
              right: 36,
              borderTop: '1px solid rgba(245,233,218,0.3)',
              paddingTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              opacity: 0.6,
            }}
          >
            <span>theHomeFile</span>
            <span>148 pp.</span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: 12,
          transform: 'translateY(-50%) rotate(6deg)',
          width: 200,
          height: 280,
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 2,
          padding: 18,
          boxShadow: '0 16px 40px -16px rgba(27,26,23,0.3)',
          fontFamily: 'var(--mono)',
          fontSize: 7,
          lineHeight: 1.6,
          color: 'var(--ink-2)',
          zIndex: 0,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 6 }}>§ 3 · KITCHEN</div>
        <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 6 }}>
          {[
            ['Wolf 36" Range', 'p.49'],
            ['Sub-Zero 648PRO', 'p.51'],
            ['Bosch dishwasher', 'p.53'],
            ['Miele coffee', 'p.55'],
            ['BlueStar hood', 'p.57'],
            ['Sharp drawer mw.', 'p.59'],
          ].map(([n, p]) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{n}</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 9, fontWeight: 600 }}>§ 4 · LIVING</div>
        <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 6 }}>
          {[
            ['Sonos amp', 'p.62'],
            ['Lutron Caséta', 'p.64'],
          ].map(([n, p]) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{n}</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Pricing() {
  const tiers = [
    {
      n: '01',
      t: 'Notebook',
      p: '$0',
      sub: 'free, forever',
      d: 'For trying it out. One home, up to 25 appliances, 2 members.',
      f: ['1 home', '25 appliances', '2 members', 'Email receipts', 'Mobile + web', 'Community support'],
      cta: 'Start free',
      primary: false,
    },
    {
      n: '02',
      t: 'File',
      p: '$24',
      sub: '/ month',
      d: 'For most homeowners. Unlimited everything, family sharing, vault.',
      f: [
        'Unlimited appliances',
        'Unlimited documents',
        'Up to 6 members',
        'Encrypted Vault',
        'AI receipt scanning',
        'Annual binder PDF',
        'Priority support',
      ],
      cta: 'Join the waitlist',
      primary: true,
    },
    {
      n: '03',
      t: 'Estate',
      p: '$98',
      sub: '/ month',
      d: 'For multi-property households, with staff and concierge.',
      f: [
        'Up to 5 homes',
        'Unlimited members',
        'Staff + role permissions',
        'Vendor portal',
        'Concierge onboarding',
        'Printed binder yearly',
        'White-glove migration',
      ],
      cta: 'Talk to us',
      primary: false,
    },
  ]
  return (
    <section id="pricing" style={{ padding: '120px 0', borderTop: '1px solid var(--rule)' }}>
      <div className="container">
        <FileMark num="FILE 09" title="Subscriptions" meta="§ 9.0 · three tiers" />

        <Reveal style={{ marginBottom: 48 }}>
          <h2 className="display" style={{ fontSize: 'var(--section-display)', margin: 0 }}>
            Pay for what you
            <br />
            actually <span className="display-italic">file</span>.
          </h2>
        </Reveal>

        <Reveal
          className="pricing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            borderTop: '1px solid var(--rule)',
            borderLeft: '1px solid var(--rule)',
          }}
        >
          {tiers.map((t) => (
            <div
              key={t.n}
              style={{
                padding: '40px 32px 36px',
                borderRight: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)',
                background: t.primary ? 'var(--ink)' : 'transparent',
                color: t.primary ? 'var(--paper)' : 'var(--ink)',
                position: 'relative',
              }}
            >
              {t.primary && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '3px 7px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: 3,
                    color: 'var(--paper)',
                  }}
                >
                  RECOMMENDED
                </div>
              )}
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: t.primary ? 'rgba(250,247,241,0.6)' : 'var(--ink-3)',
                }}
              >
                {t.n} · {t.t}
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span
                  className="display num"
                  style={{ fontSize: 56, color: t.primary ? 'var(--paper)' : 'var(--ink)' }}
                >
                  {t.p}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: t.primary ? 'rgba(250,247,241,0.6)' : 'var(--ink-3)',
                  }}
                >
                  {t.sub}
                </span>
              </div>
              <p
                style={{
                  marginTop: 14,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: t.primary ? 'rgba(250,247,241,0.75)' : 'var(--ink-2)',
                }}
              >
                {t.d}
              </p>
              <div
                style={{
                  height: 1,
                  background: t.primary ? 'rgba(255,255,255,0.18)' : 'var(--rule)',
                  margin: '24px 0',
                }}
              />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {t.f.map((x) => (
                  <li
                    key={x}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '6px 0',
                      fontSize: 13.5,
                    }}
                  >
                    <span
                      style={{
                        marginTop: 2,
                        color: t.primary ? 'rgba(250,247,241,0.9)' : 'var(--green)',
                      }}
                    >
                      <LI.Check size={13} stroke={2} />
                    </span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className="btn btn-lg"
                style={{
                  marginTop: 28,
                  width: '100%',
                  justifyContent: 'center',
                  background: t.primary ? 'var(--paper)' : 'transparent',
                  color: 'var(--ink)',
                  borderColor: t.primary ? 'var(--paper)' : 'var(--ink)',
                }}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      } else {
        setStatus('success')
        setMessage(data.message || "You're on the list. We'll be in touch.")
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section id="waitlist" style={{ padding: '100px 0', borderTop: '1px solid var(--rule)' }}>
      <div className="container">
        <Reveal className="cta-card">
          <div
            className="cta-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 60,
              alignItems: 'center',
            }}
          >
            <div>
              <div className="eyebrow">JOIN THE PRIVATE BETA</div>
              <h2
                className="display"
                style={{
                  fontSize: 'clamp(40px, 5vw, 72px)',
                  margin: '16px 0 24px',
                  color: 'var(--paper)',
                }}
              >
                Start your
                <br />
                <span className="display-italic">file</span>.
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: 'rgba(250,247,241,0.7)',
                  maxWidth: 460,
                  margin: 0,
                }}
              >
                We&rsquo;re rolling out by city, starting in the Northeast. Drop your email, and we&rsquo;ll get
                you onboarded and ship you a welcome packet.
              </p>
            </div>

            <div>
              {status !== 'success' ? (
                <form onSubmit={onSubmit}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="input"
                      type="email"
                      required
                      placeholder="you@yourhome.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-lg" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Joining…' : 'Join'} <LI.Arrow size={14} stroke={1.6} />
                    </button>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 12,
                      color:
                        status === 'error' ? '#F0B5AE' : 'rgba(250,247,241,0.55)',
                    }}
                  >
                    {status === 'error'
                      ? message
                      : 'No spam. We send one note per quarter. Unsubscribe anytime.'}
                  </div>
                </form>
              ) : (
                <div
                  style={{
                    padding: 18,
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: 'var(--paper)' }}>
                      <LI.Check size={16} stroke={2} />
                    </span>
                    <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18 }}>
                      You&rsquo;re on the list.
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(250,247,241,0.7)' }}>{message}</div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  const product = [
    { href: '#what', label: 'What we file' },
    { href: '#how', label: 'How it works' },
    { href: '#binder', label: 'The Binder' },
    { href: '#pricing', label: 'Pricing' },
  ]
  const company = ['About', 'Journal', 'Press', 'Careers', 'Contact']
  const legal: { href: string; label: string }[] = [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '#', label: 'Security' },
    { href: '#', label: 'DPA' },
  ]
  return (
    <footer className="footer">
      <div className="container">
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            gap: 40,
            marginBottom: 56,
          }}
        >
          <div>
            <Wordmark size={24} />
            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: 'var(--ink-3)',
                lineHeight: 1.55,
                maxWidth: 320,
              }}
            >
              A complete archive of your home. Appliances, rooms, receipts, warranties, and people. Like
              CARFAX, but for the place you live.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              <span className="tag">Made in Brooklyn</span>
              <span className="tag">Est. 2026</span>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              PRODUCT
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 13.5,
              }}
            >
              {product.map((x) => (
                <li key={x.href}>
                  <a href={x.href}>{x.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              COMPANY
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 13.5,
              }}
            >
              {company.map((x) => (
                <li key={x}>
                  <a href="#">{x}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              LEGAL
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 13.5,
              }}
            >
              {legal.map((x) => (
                <li key={x.label}>
                  {x.href.startsWith('/') ? (
                    <Link href={x.href}>{x.label}</Link>
                  ) : (
                    <a href={x.href}>{x.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--rule)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--ink-3)',
              letterSpacing: '0.1em',
            }}
          >
            © 2026 THEHOMEFILE, INC. · ALL RIGHTS RESERVED
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="landing-root">
      <Nav isLoggedIn={isLoggedIn} />
      <Hero />
      <Marquee />
      <Ledger />
      <Manifesto />
      <WhatWeFile />
      <HowItWorks />
      <ReceiptDemo />
      <AISection />
      <UseCases />
      <PullQuote />
      <Binder />
      <Pricing />
      <Waitlist />
      <Footer />
    </div>
  )
}
