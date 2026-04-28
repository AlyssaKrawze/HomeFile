'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { LI, type LIKey } from './landing-icons'

const SCREENS = [
  { id: 'dashboard', label: 'Overview', duration: 5200 },
  { id: 'receipt', label: 'Receipt scan', duration: 6400 },
  { id: 'calendar', label: 'Calendar', duration: 4800 },
  { id: 'vault', label: 'Vault', duration: 5400 },
  { id: 'binder', label: 'Binder', duration: 5200 },
] as const

const mockEyebrow: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  color: 'var(--ink-3)',
}
const mockScrollPad: CSSProperties = {
  padding: '14px 18px 20px',
  height: '100%',
  overflow: 'hidden',
}
const mockMonogram: CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 99,
  border: '1px solid var(--ink-2)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--serif)',
  fontSize: 9,
  color: 'var(--ink)',
  background: 'var(--paper)',
}

export function MobileMockup() {
  const [active, setActive] = useState(0)
  const [internalPause, setInternalPause] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (internalPause) return
    const t = setTimeout(
      () => setActive((a) => (a + 1) % SCREENS.length),
      SCREENS[active].duration,
    )
    return () => clearTimeout(t)
  }, [active, internalPause])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: -py * 6, y: px * 8 })
  }
  const onLeave = () => {
    setTilt({ x: 0, y: 0 })
    setInternalPause(false)
  }

  return (
    <div
      ref={wrapRef}
      className="mockup-wrap"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => setInternalPause(true)}
      style={{
        position: 'relative',
        perspective: '1600px',
        padding: '40px 0',
        userSelect: 'none',
      }}
    >
      <FloatingAnnotations active={active} />

      <div
        style={{
          position: 'relative',
          margin: '0 auto',
          width: 320,
          maxWidth: '100%',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 360ms cubic-bezier(0.2,0.7,0.2,1)',
          willChange: 'transform',
        }}
      >
        <Phone>
          <ScreenStack active={active} />
        </Phone>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -28,
            transform: 'translateX(-50%)',
            width: 240,
            height: 36,
            background: 'radial-gradient(ellipse at center, rgba(27,26,23,0.18), transparent 70%)',
            filter: 'blur(8px)',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            aria-label={s.label}
            style={{
              padding: 0,
              width: 24,
              height: 18,
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                width: i === active ? 18 : 6,
                height: 4,
                borderRadius: 2,
                background: i === active ? 'var(--ink)' : 'var(--ink-4)',
                transition: 'width 280ms cubic-bezier(0.2,0.7,0.2,1), background 200ms ease',
              }}
            />
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          fontSize: 10.5,
          color: 'var(--ink-3)',
        }}
      >
        <span style={{ color: 'var(--ink-4)' }}>
          {String(active + 1).padStart(2, '0')} / {String(SCREENS.length).padStart(2, '0')}
        </span>
        <span style={{ margin: '0 10px', color: 'var(--ink-4)' }}>·</span>
        <span style={{ color: 'var(--ink-2)' }}>{SCREENS[active].label}</span>
      </div>
    </div>
  )
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 320,
        height: 660,
        background: '#0E0D0B',
        borderRadius: 48,
        padding: 7,
        boxShadow: '0 30px 60px -20px rgba(27,26,23,0.30), inset 0 0 0 1px rgba(255,255,255,0.04)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 41,
          background: 'var(--paper)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: 44,
            padding: '8px 22px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
            9:41
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'var(--ink)' }}>
            <svg width="16" height="11" viewBox="0 0 16 11">
              <g fill="currentColor">
                <rect x="0" y="7" width="3" height="4" rx="0.5" />
                <rect x="4" y="5" width="3" height="6" rx="0.5" />
                <rect x="8" y="3" width="3" height="8" rx="0.5" />
                <rect x="12" y="0" width="3" height="11" rx="0.5" />
              </g>
            </svg>
            <svg
              width="14"
              height="11"
              viewBox="0 0 14 11"
              stroke="currentColor"
              fill="none"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M1 4a10 10 0 0112 0" />
              <path d="M3 6.5a7 7 0 018 0" />
              <path d="M5 9a4 4 0 014 0" />
              <circle cx="7" cy="10.6" r="0.6" fill="currentColor" />
            </svg>
            <svg width="24" height="11" viewBox="0 0 24 11">
              <rect
                x="0.5"
                y="0.5"
                width="20"
                height="10"
                rx="2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.5"
              />
              <rect x="22" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
              <rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 11,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 32,
            background: '#0E0D0B',
            borderRadius: 16,
            zIndex: 10,
          }}
        />

        <div style={{ height: 'calc(100% - 44px)', position: 'relative', overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  )
}

function ScreenStack({ active }: { active: number }) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {SCREENS.map((s, i) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === active ? 1 : 0,
            transform: i === active ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 540ms cubic-bezier(0.2,0.7,0.2,1), transform 540ms cubic-bezier(0.2,0.7,0.2,1)',
            pointerEvents: i === active ? 'auto' : 'none',
          }}
        >
          {i === 0 && <ScreenDashboard live={i === active} />}
          {i === 1 && <ScreenReceipt live={i === active} />}
          {i === 2 && <ScreenCalendar live={i === active} />}
          {i === 3 && <ScreenVault live={i === active} />}
          {i === 4 && <ScreenBinder live={i === active} />}
        </div>
      ))}
    </div>
  )
}

function ScreenDashboard({ live }: { live: boolean }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => setTick((x) => x + 1), 1200)
    return () => clearInterval(t)
  }, [live])

  const upcoming = [
    { d: 'MAR 12', t: 'Replace furnace filter', m: 'DC', acc: 'gold' as const },
    { d: 'MAR 17', t: 'Annual HVAC service', m: 'DC', acc: 'accent' as const },
    { d: 'MAR 21', t: 'Generator service', m: 'DC', acc: 'accent' as const },
  ]
  const stats: [string, string][] = [
    ['Appliances', '142'],
    ['Tasks', '07'],
    ['Members', '08'],
    ['Documents', '236'],
  ]
  const rooms = [
    { l: 'K', n: 'Kitchen' },
    { l: 'L', n: 'Living' },
    { l: 'M', n: 'Master' },
    { l: 'D', n: 'Dining' },
    { l: 'B', n: 'Bath' },
    { l: 'G', n: 'Garage' },
    { l: 'P', n: 'Pool' },
    { l: '+', n: '17 more' },
  ]

  return (
    <div style={mockScrollPad}>
      <div style={mockEyebrow}>FILE 01 · ESTATE</div>
      <div className="display" style={{ fontSize: 28, lineHeight: 1.0, marginTop: 6, marginBottom: 16, color: 'var(--ink)' }}>
        <span className="display-italic">Cliffwood</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          borderTop: '1px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        {stats.map(([k, v], i) => (
          <div
            key={k}
            style={{
              padding: '10px 12px',
              borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
              borderBottom: i < 2 ? '1px solid var(--rule)' : 'none',
            }}
          >
            <div className="num" style={{ fontSize: 18, color: 'var(--ink)' }}>
              {v}
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 8.5,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--ink-3)',
                marginTop: 2,
              }}
            >
              {k}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: 'var(--mono)',
          fontSize: 9.5,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--ink-3)',
        }}
      >
        UPCOMING
      </div>
      <div style={{ marginTop: 8 }}>
        {upcoming.map((r, i) => (
          <div
            key={r.t}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderBottom: '1px solid var(--rule-soft)',
              transform: live ? `translateX(${tick % 4 === i ? '2px' : '0'})` : 'none',
              transition: 'transform 300ms',
            }}
          >
            <span className="num" style={{ fontSize: 9.5, color: 'var(--ink-3)', width: 50 }}>
              {r.d}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink)', flex: 1 }}>{r.t}</span>
            <span
              className="dot"
              style={{ background: r.acc === 'accent' ? 'var(--accent)' : 'var(--gold)' }}
            />
            <div style={mockMonogram}>{r.m}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          fontFamily: 'var(--mono)',
          fontSize: 9.5,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--ink-3)',
        }}
      >
        ROOMS · 24
      </div>
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {rooms.map((r) => (
          <div
            key={r.n}
            style={{
              aspectRatio: '1/1',
              border: '1px solid var(--rule)',
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              padding: '4px 2px',
              background: 'var(--paper)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: r.l === '+' ? 'normal' : 'italic',
                fontWeight: 350,
                fontSize: 16,
                lineHeight: 1,
                color: r.l === '+' ? 'var(--ink-3)' : 'var(--ink)',
              }}
            >
              {r.l}
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 6.5,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                lineHeight: 1,
              }}
            >
              {r.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenReceipt({ live }: { live: boolean }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!live) {
      setStep(0)
      return
    }
    const t1 = setTimeout(() => setStep(1), 1100)
    const t2 = setTimeout(() => setStep(2), 2200)
    const t3 = setTimeout(() => setStep(3), 4400)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [live])

  const fields = [
    { k: 'Item', v: 'Wolf 36" Range', delay: 0 },
    { k: 'Brand', v: 'Wolf', delay: 250 },
    { k: 'Model', v: 'GR364C-LP', delay: 500 },
    { k: 'Price', v: '$11,420.00', delay: 750 },
    { k: 'Warranty', v: '2 years', delay: 1000 },
  ]

  return (
    <div style={mockScrollPad}>
      <div style={mockEyebrow}>NEW RECEIPT</div>
      <div className="display" style={{ fontSize: 22, lineHeight: 1.05, marginTop: 4, marginBottom: 14 }}>
        <span className="display-italic">Scan</span> in progress
      </div>

      <div
        style={{
          width: '100%',
          aspectRatio: '0.66',
          background: '#FFF',
          border: '1px solid var(--rule)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 6px 18px -8px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ padding: 12, fontFamily: 'var(--mono)', fontSize: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 4 }}>HUDSON HEARTH & HOME</div>
          <div style={{ fontSize: 7, color: '#888', marginBottom: 8 }}>Greenwich, CT · #00482</div>
          <div style={{ fontSize: 7, color: '#888' }}>Order #29481</div>
          <div style={{ fontSize: 7, color: '#888', marginBottom: 8 }}>Mar 04, 2026 · 14:22</div>
          <div style={{ borderTop: '1px dashed #ccc', paddingTop: 6, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.5 }}>
              <span>Wolf 36&quot; GR Range</span>
              <span>10,899.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.5 }}>
              <span>Install kit</span>
              <span>89.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7.5 }}>
              <span>Warranty +2yr</span>
              <span>432.00</span>
            </div>
          </div>
          <div
            style={{
              borderTop: '1px solid #000',
              marginTop: 8,
              paddingTop: 4,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 8,
              fontWeight: 600,
            }}
          >
            <span>TOTAL</span>
            <span>$11,420.00</span>
          </div>
        </div>

        {step < 2 && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 60,
                background: 'linear-gradient(180deg, transparent 0%, rgba(75,90,120,0.18) 50%, transparent 100%)',
                animation: live ? 'lf-scanSweep 2.4s ease-in-out infinite' : 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 1.5,
                background: 'rgba(108, 45, 42, 0.45)',
                boxShadow: '0 0 8px rgba(108,45,42,0.35)',
                animation: live ? 'lf-scanLine 2.4s ease-in-out infinite' : 'none',
              }}
            />
          </div>
        )}

        {step >= 1 && (
          <div
            style={{
              position: 'absolute',
              inset: 8,
              border: '1.5px solid var(--accent)',
              borderRadius: 3,
              animation: 'lf-pulseBox 1s ease-out',
            }}
          />
        )}
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--mono)',
          fontSize: 8.5,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--ink-3)',
        }}
      >
        <span
          className="dot"
          style={{
            background: step === 3 ? 'var(--green)' : 'var(--accent)',
            animation: step < 3 ? 'lf-pulse 1.2s ease-in-out infinite' : 'none',
          }}
        />
        <span>
          {step === 0 ? 'Scanning…' : step === 1 ? 'Receipt detected' : step === 2 ? 'Reading fields…' : 'Saved to Kitchen'}
        </span>
      </div>

      <div style={{ marginTop: 10 }}>
        {fields.map((f) => (
          <div
            key={f.k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid var(--rule-soft)',
              opacity: step >= 2 ? 1 : 0,
              transform: step >= 2 ? 'translateY(0)' : 'translateY(4px)',
              transition: `opacity 320ms ${f.delay}ms ease, transform 320ms ${f.delay}ms ease`,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 8.5,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--ink-3)',
              }}
            >
              {f.k}
            </span>
            <span className="num" style={{ fontSize: 11, color: 'var(--ink)' }}>
              {f.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenCalendar({ live }: { live: boolean }) {
  const [highlight, setHighlight] = useState(12)
  useEffect(() => {
    if (!live) return
    const days = [12, 17, 21, 28]
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % days.length
      setHighlight(days[i])
    }, 900)
    return () => clearInterval(t)
  }, [live])

  const dots: Record<number, number> = { 4: 1, 8: 1, 12: 3, 17: 1, 21: 2, 23: 2, 28: 2, 30: 1 }

  return (
    <div style={mockScrollPad}>
      <div style={mockEyebrow}>MARCH 2026</div>
      <div className="display" style={{ fontSize: 22, lineHeight: 1.05, marginTop: 4, marginBottom: 14 }}>
        <span className="display-italic">Calendar</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
          fontFamily: 'var(--mono)',
          fontSize: 8,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderTop: '1px solid var(--rule)',
          borderLeft: '1px solid var(--rule)',
        }}
      >
        {Array.from({ length: 35 }, (_, i) => {
          const day = i + 1
          const isMonth = day <= 31
          const isHi = day === highlight
          const dotCount = dots[day] || 0
          return (
            <div
              key={i}
              style={{
                aspectRatio: '1/1',
                borderRight: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)',
                padding: '3px 4px',
                background: isHi ? 'var(--paper)' : 'transparent',
                transition: 'background 300ms',
                position: 'relative',
              }}
            >
              {isMonth && (
                <>
                  <div
                    className="num"
                    style={{
                      fontSize: 8.5,
                      color: isHi ? 'var(--paper)' : 'var(--ink)',
                      background: isHi ? 'var(--ink)' : 'transparent',
                      padding: isHi ? '1px 4px' : 0,
                      borderRadius: 99,
                      display: 'inline-block',
                    }}
                  >
                    {day}
                  </div>
                  {dotCount > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1.5,
                      }}
                    >
                      {Array.from({ length: dotCount }, (_, j) => (
                        <span
                          key={j}
                          style={{
                            width: 3,
                            height: 3,
                            borderRadius: 2,
                            background:
                              dotCount === 3
                                ? 'var(--accent)'
                                : dotCount === 2
                                ? 'var(--gold)'
                                : 'var(--green)',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 8.5,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--ink-3)',
          }}
        >
          MAR {String(highlight).padStart(2, '0')} · 03 TASKS
        </div>
        <div style={{ marginTop: 6 }}>
          {[
            { t: '08:00', n: 'Replace furnace filter', d: 'gold' as const },
            { t: '11:00', n: 'Descale espresso boiler', d: 'green' as const },
            { t: '15:00', n: 'Inspect attic insulation', d: 'green' as const },
          ].map((r) => (
            <div
              key={r.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 0',
                borderBottom: '1px solid var(--rule-soft)',
                fontSize: 10,
                color: 'var(--ink)',
              }}
            >
              <span className="num" style={{ fontSize: 9, color: 'var(--ink-3)' }}>
                {r.t}
              </span>
              <span className="dot" style={{ background: r.d === 'gold' ? 'var(--gold)' : 'var(--green)' }} />
              <span style={{ flex: 1 }}>{r.n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenVault({ live }: { live: boolean }) {
  const [step, setStep] = useState(0)
  const [pin, setPin] = useState(0)
  useEffect(() => {
    if (!live) {
      setStep(0)
      setPin(0)
      return
    }
    const ts: ReturnType<typeof setTimeout>[] = []
    ;[400, 700, 1000, 1300].forEach((d, i) => {
      ts.push(setTimeout(() => setPin(i + 1), d))
    })
    ts.push(setTimeout(() => setStep(1), 1500))
    ts.push(setTimeout(() => setStep(2), 2200))
    return () => ts.forEach(clearTimeout)
  }, [live])

  return (
    <div style={mockScrollPad}>
      <div style={mockEyebrow}>FILE 06 · VAULT</div>
      <div className="display" style={{ fontSize: 22, lineHeight: 1.05, marginTop: 4, marginBottom: 16 }}>
        <span className="display-italic">Vault</span>
      </div>

      {step < 2 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 99,
              border: '1px solid var(--rule)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink)',
            }}
          >
            <LI.Lock size={22} stroke={1.4} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-2)', marginBottom: 14 }}>Enter PIN to unlock</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  border: '1.2px solid var(--ink)',
                  background: i < pin ? 'var(--ink)' : 'transparent',
                  transition: 'background 200ms',
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              maxWidth: 200,
              margin: '0 auto',
            }}
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <div
                key={n}
                style={{
                  aspectRatio: '1.4/1',
                  border: '1px solid var(--rule)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--mono)',
                  fontSize: 14,
                  color: 'var(--ink-2)',
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="ifade">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              border: '1px solid var(--green-soft)',
              background: 'var(--green-soft)',
              color: 'var(--green)',
              borderRadius: 3,
              fontFamily: 'var(--mono)',
              fontSize: 8.5,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 12,
            }}
          >
            <span className="dot" style={{ background: 'var(--green)' }} />
            Unlocked · 14:32
          </div>
          {[
            { k: 'WIFI', n: 'Cliffwood Main', v: '••••••••••' },
            { k: 'GATE', n: 'Front gate code', v: '47•••' },
            { k: 'ALARM', n: 'House alarm', v: '••••' },
            { k: 'GARAGE', n: 'Garage code', v: '•••••' },
          ].map((r) => (
            <div
              key={r.k}
              style={{
                padding: '8px 10px',
                border: '1px solid var(--rule)',
                borderRadius: 4,
                marginBottom: 6,
                background: 'var(--paper)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 8,
                      color: 'var(--ink-3)',
                      letterSpacing: '0.12em',
                    }}
                  >
                    {r.k}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink)', marginTop: 2 }}>{r.n}</div>
                </div>
                <div className="num" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.05em' }}>
                  {r.v}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScreenBinder({ live }: { live: boolean }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!live) {
      setProgress(0)
      return
    }
    let p = 0
    const t = setInterval(() => {
      p = Math.min(p + 4, 100)
      setProgress(p)
      if (p >= 100) clearInterval(t)
    }, 80)
    return () => clearInterval(t)
  }, [live])

  const items = [
    { p: 12, k: 'Cover & summary' },
    { p: 28, k: '24 rooms · floorplans' },
    { p: 48, k: '142 appliances · specs' },
    { p: 70, k: 'Service history · 18 mo' },
    { p: 88, k: 'Documents · warranties' },
    { p: 99, k: 'Vendors & contacts' },
  ]

  return (
    <div style={mockScrollPad}>
      <div style={mockEyebrow}>FILE 07 · BINDER</div>
      <div className="display" style={{ fontSize: 22, lineHeight: 1.05, marginTop: 4, marginBottom: 4 }}>
        Building <span className="display-italic">your binder</span>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginBottom: 14 }}>148 pages · ready in 2 minutes</div>

      <div style={{ height: 2, background: 'var(--rule)', borderRadius: 1, overflow: 'hidden', marginBottom: 14 }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--ink)',
            transition: 'width 80ms linear',
          }}
        />
      </div>

      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--ink-3)',
          marginBottom: 8,
        }}
      >
        CONTENTS
      </div>
      {items.map((r) => {
        const done = progress >= r.p
        return (
          <div
            key={r.k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 0',
              borderBottom: '1px solid var(--rule-soft)',
              color: done ? 'var(--ink)' : 'var(--ink-4)',
              transition: 'color 240ms',
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 99,
                border: `1px solid ${done ? 'var(--ink)' : 'var(--rule)'}`,
                background: done ? 'var(--ink)' : 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 240ms, border-color 240ms',
                color: 'var(--paper)',
              }}
            >
              {done && <LI.Check size={9} stroke={2.2} />}
            </span>
            <span style={{ flex: 1, fontSize: 10.5 }}>{r.k}</span>
          </div>
        )
      })}

      {progress >= 100 && (
        <div
          className="ifade"
          style={{
            marginTop: 14,
            padding: 12,
            border: '1px solid var(--ink)',
            borderRadius: 4,
            background: 'var(--ink)',
            color: 'var(--paper)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', marginBottom: 4 }}>
            Binder ready.
          </div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              opacity: 0.7,
            }}
          >
            Tap to download · 8.4 MB
          </div>
        </div>
      )}
    </div>
  )
}

type Annot = {
  side: 'left' | 'right'
  top: string
  title: string
  sub: string
  icon: LIKey
}

const ANNOTATIONS: Record<number, Annot[]> = {
  0: [
    { side: 'left', top: '8%', title: '24 rooms', sub: 'Filed and indexed', icon: 'Inventory' },
    { side: 'right', top: '34%', title: 'Live tasks', sub: 'AI + manual schedules', icon: 'Calendar' },
    { side: 'left', top: '62%', title: '08 members', sub: 'Owner · staff · vendors', icon: 'Users' },
  ],
  1: [
    { side: 'right', top: '14%', title: 'Snap a receipt', sub: 'Or upload PDF', icon: 'Camera' },
    { side: 'left', top: '46%', title: 'AI extracts fields', sub: 'Brand · model · price', icon: 'Sparkle' },
    { side: 'right', top: '70%', title: 'Auto-filed', sub: 'Linked to the right room', icon: 'Folder' },
  ],
  2: [
    { side: 'left', top: '12%', title: 'Maintenance schedule', sub: 'Predicted by season', icon: 'Sparkle' },
    { side: 'right', top: '40%', title: 'Assigned to staff', sub: 'They get reminders', icon: 'Users' },
    { side: 'left', top: '70%', title: 'Service history', sub: 'Every visit, recorded', icon: 'Wrench' },
  ],
  3: [
    { side: 'right', top: '20%', title: 'Encrypted at rest', sub: 'AES-256-GCM', icon: 'Shield' },
    { side: 'left', top: '50%', title: 'PIN protected', sub: '15-minute session', icon: 'Lock' },
    { side: 'right', top: '74%', title: 'Codes & passwords', sub: 'WiFi, alarm, gate', icon: 'Wifi' },
  ],
  4: [
    { side: 'left', top: '14%', title: 'One PDF, full archive', sub: 'For sale or storage', icon: 'Book' },
    { side: 'right', top: '46%', title: '148 pages, organized', sub: 'Beautiful index', icon: 'File' },
    { side: 'left', top: '74%', title: 'Hand to a buyer', sub: 'Trust at closing', icon: 'Home' },
  ],
}

function FloatingAnnotations({ active }: { active: number }) {
  const items = ANNOTATIONS[active] || []
  return (
    <>
      {items.map((a, i) => (
        <div
          key={`${active}-${i}`}
          style={{
            position: 'absolute',
            top: a.top,
            [a.side]: 'calc(50% + 200px)',
            width: 200,
            opacity: 0,
            animation: `lf-annotIn 720ms cubic-bezier(0.2,0.7,0.2,1) ${300 + i * 220}ms forwards, lf-annotFloat 5s ease-in-out ${1500 + i * 220}ms infinite`,
            pointerEvents: 'none',
          }}
        >
          <AnnotCard side={a.side} title={a.title} sub={a.sub} icon={a.icon} />
        </div>
      ))}
    </>
  )
}

function AnnotCard({ side, title, sub, icon }: Omit<Annot, 'top'>) {
  const Ico = LI[icon] || LI.Dot
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 6,
        padding: '10px 12px',
        boxShadow: '0 12px 32px -16px rgba(27,26,23,0.18)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          [side === 'right' ? 'left' : 'right']: -42,
          top: '50%',
          width: 42,
          height: 1,
          background: 'var(--rule)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          [side === 'right' ? 'left' : 'right']: -46,
          top: 'calc(50% - 3px)',
          width: 6,
          height: 6,
          borderRadius: 99,
          background: 'var(--ink)',
        }}
      />
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 99,
          border: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--ink-2)',
        }}
      >
        <Ico size={12} stroke={1.4} />
      </div>
      <div>
        <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.3 }}>{sub}</div>
      </div>
    </div>
  )
}
