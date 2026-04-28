# Handoff: TheHomeFile — Landing Page

## Overview
Marketing landing page for **TheHomeFile**, a service positioned as "CARFAX for your home" — a complete archive of every appliance, room, receipt, warranty, and service visit. The page educates the visitor, demonstrates the product via an animated mockup, and converts to a waitlist signup.

The brand voice is editorial / archival. Visual reference points: a bound case file, an annual report, a literary magazine masthead. The page is a single-column long-scroll document divided into numbered "files" (FILE 01, FILE 02, …), each separated by a hairline rule.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate this design in the target codebase's existing environment** (Next.js, Astro, Remix, Vue, SvelteKit, etc.) using its established patterns, component library, and styling conventions.

The HTML prototype uses Babel-in-the-browser, inline JSX, and React 18 from a CDN — convenient for design iteration, but **not** the way to ship this. Re-implement the components in the target framework using the same structure, copy, and design tokens.

## Fidelity
**High-fidelity (hifi).** All colors, typography, spacing, copy, and section composition are final. Reproduce pixel-faithfully against the tokens in this document. Layout breakpoints and responsive behavior are described per-section.

## Files in this bundle

| Path | Purpose |
| --- | --- |
| `Landing.html` | Page shell — `<head>` (font links, design tokens, base styles), `<body>` mount point, script tag order |
| `tweaks-panel.jsx` | In-design tweaks panel (dev-only — **do not ship**). Provides the `useTweaks` hook + `TweaksPanel` UI used to flip aesthetics during design review. Strip it from production. |
| `components/landing-app.jsx` | The page itself — the root `LandingApp` component plus every section (Nav, Hero, Marquee, Ledger, Manifesto, WhatWeFile, HowItWorks, ReceiptDemo, AISection, UseCases, PullQuote, Binder, Pricing, Waitlist, Footer) |
| `components/landing-mockup.jsx` | The animated product mockup that lives in the hero. A scripted carousel of five "screens" (Overview · Rooms · Calendar · Vault · Binder) auto-advancing with timed durations. |
| `components/landing-icons.jsx` | The lightweight stroke-icon set used throughout the page (Home, Book, Wrench, Users, Lock, Folder, ArrowRight, etc.). All inline SVG, single-stroke, 1.2px default weight. |

## Aesthetic system

Two dimensions of variation, both currently exposed via the dev-only Tweaks panel. **For production, ship the defaults below and remove the Tweaks panel.**

| Tweak | Default | Notes |
| --- | --- | --- |
| `aesthetic` | `editorial` | The other option (`bold`) is a Marketing-Bold variant with much larger display type. Designer chose Editorial as the shipping default. |
| `darkTone` | `slate` | Decision made during review — slate beats ink. Drop the toggle; lock to slate. |
| `darkHero` | `false` | Dev-only, do not expose. |
| `showAnnotations` | `true` | Floating callout cards in the hero. Keep on. |

## Design tokens

### Color (cream/slate system, shipping defaults)

```css
--bg:          #F2EEE6;   /* page background — warm cream */
--paper:       #FAF7F1;   /* slightly lighter cream for raised cards */
--ink:         #1B2540;   /* near-black slate, primary text + dark backgrounds */
--ink-2:       #2F3A55;   /* secondary text, slightly lighter slate */
--ink-3:       #6E695F;   /* warm grey, eyebrows + meta */
--ink-4:       #A39C8E;   /* warm grey, mutest meta */
--rule:        #D8D1C2;   /* hairline rule, default border */
--rule-soft:   #E5DFD2;   /* even softer rule, internal dividers */
--slate:       #4A5A78;   /* mid slate, accent on dark surfaces */
--slate-soft:  #C7CFDD;
--accent:      #6B2D2A;   /* deep oxblood — wordmark dot, accents */
--accent-soft: #E8D6CF;
--gold:        #8C6E3A;
--gold-soft:   #E8DEC6;
--green:       #4F6650;
--green-soft:  #D5DECF;
```

Note: `--ink` and `--ink-2` are dark-slate-blue (`#1B2540` / `#2F3A55`), not warm black. Body text, headings, and "dark moment" backgrounds (AI section, CTA card, primary buttons, dark footer) all use these. `--ink-3` and `--ink-4` are deliberately *warm* grey — they pair the cream pages and sit alongside the cool slate without clashing.

### Type

| Family | Source | Weights / Optical sizes | Used for |
| --- | --- | --- | --- |
| **Fraunces** | Google Fonts | `9..144`, `300..700`, `0..1` italic | Display headings (`.display`, `.display-italic`). Loaded as variable font with optical-size axis; large hero uses opsz ~144, body display ~14. |
| **Instrument Serif** | Google Fonts | regular + italic | Fallback / pull quotes. |
| **Geist** | Google Fonts | `300..700` | Body, nav, buttons, all UI sans (`--sans`). |
| **JetBrains Mono** | Google Fonts | regular | Eyebrows (`.eyebrow`), file numbers, tabular numerics (`.num`). |

Type vocabulary (defined in `Landing.html`):

```css
.display       { font: 350 var(--hero-display)/1.0 var(--serif); letter-spacing: -0.02em; }
.display-italic{ font: 350 1em/1.0 var(--serif); font-style: italic; letter-spacing: -0.012em; }
.eyebrow       { font: 500 11px/1 var(--mono); text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-3); }
.num           { font: 1em var(--mono); font-variant-numeric: tabular-nums; }
.label-sm      { font-size: 12.5px; color: var(--ink-3); letter-spacing: 0.01em; }
```

Body baseline: `15px / 1.55 Geist`, body color `var(--ink)`.

Display sizes (clamp ranges):
- `--hero-display`: `clamp(56px, 9vw, 132px)`
- `--section-display`: `clamp(40px, 5.5vw, 80px)`

### Spacing & radii

- Container: `max-width: 1320px; padding: 0 40px;` (collapses to `0 20px` below 720px).
- Section vertical rhythm: `100px–120px` top/bottom padding, separated by `border-top: 1px solid var(--rule)`.
- Radii: `--radius: 4px` (buttons, inputs, tags), `--radius-lg: 6px` (cards, the dark CTA card).
- Hairline rules everywhere — borders are `1px solid var(--rule)`.

### Buttons

```css
.btn          { font: 500 14px/1 var(--sans); padding: 12px 20px; border: 1px solid var(--rule); background: var(--paper); color: var(--ink); border-radius: 4px; }
.btn:hover    { background: #fff; border-color: var(--ink-3); transform: translateY(-1px); }
.btn-primary  { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.btn-primary:hover { background: var(--ink-2); border-color: var(--ink-2); }
.btn-lg       { padding: 14px 22px; font-size: 14.5px; }
```

### Tags / chips

```css
.tag      { font: 500 11.5px/1.4 var(--mono); padding: 3px 8px; border: 1px solid var(--rule); background: var(--paper); color: var(--ink-3); border-radius: 3px; }
.tag-ink  { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.dot      { width: 6px; height: 6px; border-radius: 50%; }
```

## Sections (in scroll order)

Each section is wrapped in `<section style={{ padding: '100–120px 0', borderTop: '1px solid var(--rule)' }}>` with a `.container` inside. Most also start with a "file mark" — eyebrow row of `FILE NN` badge + section title + section number on the right.

1. **Nav** — sticky-ish header. Wordmark left, link cluster right (What we file · How it works · The binder · Pricing · See the app → · Join the waitlist [primary]).
2. **Hero** — section-display "The complete file for the place you live." with a short paragraph and the animated mockup (`<LandingMockup />`) on the right. Optional floating annotation cards. Below the headline: the animated product mockup auto-cycling through 5 product screens (see `landing-mockup.jsx`). Each screen has its own scripted choreography and time budget.
3. **Marquee** — an infinite horizontal scroll of category words ("APPLIANCES · ROOMS · RECEIPTS · WARRANTIES · MEMBERS · …"). CSS keyframe-driven `@keyframes marquee` translateX 0 → -50%.
4. **Ledger (FILE 02)** — by-the-numbers grid. 4 columns of stat cards: appliances filed, hours saved, warranty $, etc.
5. **Manifesto** — a single large display paragraph in serif. Italic emphasis on "record".
6. **WhatWeFile (FILE 03)** — six-category catalog. Two-column intro then a 6-tile grid of categories (Appliances, Rooms, Receipts, Documents, People, Service log) with icon, title, short copy.
7. **HowItWorks (FILE 04)** — four numbered steps stacked vertically: Walk through · Forward receipts · Invite your people · Live with it.
8. **ReceiptDemo (FILE 05)** — left/right split: a stylized receipt visual on one side, a structured "extracted record" card on the other. Demonstrates the AI receipt → record extraction.
9. **AISection (FILE 06)** — full-width dark-slate panel, `background: var(--ink); color: var(--paper)`. Two-column: headline + paragraph on the left, a list of three example Q&A exchanges on the right (subtle border + hairlines between them). This is the section that motivated the cream-vs-slate dark-tone decision; ship slate.
10. **UseCases (FILE 07)** — 4×1 grid (4 cells, single row, 280px tall) bordered by hairlines: For owners · For staff · For vendors · For sale. Each cell has icon, title, copy, audience eyebrow. Collapses to 2×2 below 980px and 1×4 below 640px.
11. **PullQuote** — single full-width testimonial. Open-quote glyph in serif at `80px` color `var(--rule)`. The quote in `.pull` style. Avatar (initials in a circle filled with `--ink`) + name/role beneath.
12. **Binder (FILE 08)** — annual printed binder pitch. Left: copy + 4-stat grid (148 pages / $89 / 8.4MB / Yearly). Right: the `BinderVisual` component — a stylized rendering of a linen-bound book with spine + cover.
13. **Pricing (FILE 09)** — three tiers in a horizontal grid: Notebook ($0) · File ($24/mo) · Estate ($98/mo). Each tier card: tier number, name, price + cadence, blurb, feature list with checkmarks, primary CTA.
14. **Waitlist** — full-width dark CTA card (`.cta-card`, `background: var(--ink); color: var(--paper)`) with email input and "Join the waitlist" button. Above: short paragraph "We're rolling out by city, starting in the Northeast."
15. **Footer** — wordmark + tagline left, three columns of links right (Product · Company · Legal). Bottom row: copyright + "Made in New England" or similar.

## Interactions & behavior

- **Reveal-on-scroll**. Elements with `.reveal` start at `opacity: 0; transform: translateY(14px)` and animate to `.reveal.in` (opacity 1, no translate) when intersected. Implementation in the inline `<script>` at the bottom of `Landing.html`. Use IntersectionObserver in production.
- **Marquee** runs perpetually via CSS keyframes; pause on hover is *not* implemented but feel free to add.
- **Mockup carousel** auto-advances through 5 screens with per-screen durations (`landing-mockup.jsx` SCREENS array). Each screen has internal animations (typing effects, list-fill staggers, progress bars). On screen change, fade-out current → fade-in next.
- **Buttons** have `transform: translateY(-1px)` on hover and a subtle border-darken.
- **Inputs** focus state: border darkens to `var(--ink)` and bg becomes pure white.
- **Anchor links** in nav (`#what`, `#how`, `#binder`, `#pricing`) — smooth-scroll suggested but not currently implemented; CSS `scroll-behavior: smooth` on `html` is enough.

## Responsive behavior

- Container width: `1320px` desktop max, padding scales.
- Hero columns collapse to single column below ~960px.
- WhatWeFile six-tile grid: 3 cols → 2 cols → 1 col.
- UseCases: 4 cols → 2×2 → 1×4 (breakpoints in component-scoped `<style>`).
- Pricing: 3 cols → stacked single column below ~840px.
- Mockup: scales proportionally; on narrow viewports, render below the hero copy instead of beside it.
- Type clamps automatically via `clamp()` in display sizes.

Treat `1320px` as the design width. Test 1440 / 1280 / 1024 / 768 / 414.

## State management

The page is largely static. Real state lives in two places:

1. **Tweaks panel** (dev-only). State persisted via `postMessage` to a host iframe — you don't need this in production. Strip the `LandingTweaks` component, the `useTweaks` import, and the `LANDING_DEFAULTS` block. Hardcode the defaults: `aesthetic="editorial"`, `darkTone="slate"`.
2. **Mockup carousel state**. `landing-mockup.jsx` uses `useState` for active screen index + per-screen sub-state (which row is highlighted, progress bar value, etc.). Drive with `setInterval` or `requestAnimationFrame`. See the file's SCREENS array for the timing budget per screen.
3. **Waitlist email form** — needs a real submit handler. Today the form is inert. Wire to whatever backend (Resend, Loops, ConvertKit, or your own API) the codebase already uses; show inline success state inside the CTA card on submit.

## Assets

No raster imagery. Everything is:
- Type (Google Fonts, listed above)
- Inline SVG icons (in `components/landing-icons.jsx`)
- CSS shapes for the binder visual and decorative elements
- The mockup is entirely composed of HTML+CSS+SVG inside `landing-mockup.jsx`

If the production app introduces real product screenshots, swap them into the `LandingMockup` placeholder regions.

## Accessibility notes

- Color contrast on cream + slate ink is comfortably AA (`#1B2540` on `#F2EEE6` ≈ 13:1).
- The dark sections invert: paper on slate ≈ 13:1.
- Marquee should respect `prefers-reduced-motion: reduce` — pause animation. Reveal-on-scroll likewise; gate the IntersectionObserver in a `matchMedia('(prefers-reduced-motion: no-preference)')` check.
- Heading hierarchy: one `h1` in the hero, `h2` per section, `h3` for sub-heads inside a section (UseCases tiles, Pricing tier names, etc.). Verify when porting.
- Nav links should be keyboard-focus-visible; add a focus ring (`outline: 2px solid var(--slate); outline-offset: 2px`) since the design relies on color alone today.

## Production checklist

When porting:

- [ ] Strip `tweaks-panel.jsx` and the `LandingTweaks` UI from `landing-app.jsx`.
- [ ] Hardcode the chosen tweak defaults (`aesthetic="editorial"`, `darkTone="slate"`).
- [ ] Replace CDN React/Babel script tags with the codebase's framework — re-author each section as a real component file.
- [ ] Re-author the icon set in `landing-icons.jsx` as proper components OR swap for the codebase's existing icon library if it has equivalents.
- [ ] Wire the waitlist form to a real backend; show success/error inline.
- [ ] Confirm Google Font loading strategy matches the codebase (e.g., `next/font` for Next.js; locally hosted variable fonts; etc.).
- [ ] Verify all hairline rules render at 1px on the codebase's CSS pipeline (Tailwind users: `border-[var(--rule)]` is fine, but watch `border-[hairline]` plugins).
- [ ] Run reveal-on-scroll through the codebase's preferred animation primitive (Framer Motion, CSS transitions, etc.) — keep the same 700ms cubic-bezier.
- [ ] Add `prefers-reduced-motion` handling to marquee and reveal animations.
- [ ] Implement smooth-scroll for in-page anchors.
- [ ] Bake the meta tags (title, description, OG) into the head.

## Notes for the developer

- This page does **not** depend on any real database. All numbers in the Ledger and Pricing are static copy; treat them as content, not data.
- Numbers in the mockup screens (Cliffwood property, Wolf range model, etc.) are story-detail props. Keep them; they make the demo feel real. Don't replace with lorem.
- The "FILE NN" / "§ N.0" pattern is core brand vocabulary. Don't simplify to "Section 1" / "Section 2" — preserve the archival document framing.
- Italic display words (e.g., the *record* in the Manifesto, *marketing* in the pull quote) are intentional. Use `<em>` styled with `.display-italic` or a dedicated italic component — don't lose them in markdown ports.

Questions? Reference the prototype directly — open `Landing.html` in a browser, it runs standalone with internet for fonts.
