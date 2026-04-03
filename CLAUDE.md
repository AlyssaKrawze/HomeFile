# CLAUDE.md — TheHomeFile

## Project Overview

**TheHomeFile** is the "CARFAX for your home" — a centralized digital home management platform where homeowners track appliances, maintenance history, service providers, documents, and projects. When selling, the home binder becomes a trust-building asset for buyers.

- **Target users:** Homeowners, property managers, real estate agents
- **Monetization:** Freemium SaaS — free tier + paid plans (Stripe integration planned)
- **Launch status:** Private beta. No public marketing yet. Attorney meeting pending re: NDA.
- **Brand name:** Always use **TheHomeFile** in user-facing text (not "TheHomePage", "Homefile", or "Home File")

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (Turbopack) |
| Language | TypeScript 5 |
| Auth & DB | Supabase (project: `aejykugouiubhwjixvvc`) |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) — Claude Haiku for receipt/invoice scanning |
| Hosting | Vercel |
| Styling | Tailwind CSS 4 |
| Email | Resend |
| PDF | @react-pdf/renderer |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| Icons | lucide-react |
| Dates | date-fns |
| Spreadsheet | xlsx |
| Toasts | sonner |

## Design System

| Token | Value |
|-------|-------|
| Slate Blue (primary) | `#5B6C8F` |
| Warm Cream (background) | `#F4F1EA` |
| Soft Taupe (accent) | `#C8BFB2` |
| Deep Charcoal (text) | `#2F3437` |
| Headings font | Playfair Display |
| Body font | Inter |

## Domain & URLs

- **Production:** https://thehomefile.app
- **GitHub:** https://github.com/alyssakrawze/homefile
- **Supabase Dashboard:** https://supabase.com/dashboard/project/aejykugouiubhwjixvvc
- **Anthropic Console:** https://console.anthropic.com (API key rotation needed)

## Environment Variables

All required env vars (see `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anonymous key
ANTHROPIC_API_KEY               # Claude API key (needs rotation)
NEXT_PUBLIC_APP_URL             # App URL, http://localhost:3000 for dev
RESEND_API_KEY                  # Resend email service
CRON_SECRET                     # Vercel cron job auth
VAULT_ENCRYPTION_KEY            # 64-char hex for AES-256-GCM vault encryption
TEST_USER_EMAIL                 # Playwright test user email
TEST_USER_PASSWORD              # Playwright test user password
```

Generate `VAULT_ENCRYPTION_KEY`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Database

- **Engine:** Supabase (PostgreSQL)
- **RLS:** Enabled on all tables — uses `get_home_member_role(home_id, auth.uid())` helper function
- **Migrations:** `supabase/migrations/` — 001 through 024 applied
- **Health check:** `GET /api/health`
- **Tables (21):**

| # | Table | Migration |
|---|-------|-----------|
| 1 | profiles | 001 |
| 2 | homes | 001 |
| 3 | role_templates | 001 |
| 4 | home_members | 001 |
| 5 | home_member_permissions | 001 |
| 6 | rooms | 001 |
| 7 | appliances | 001 |
| 8 | service_records | 001 |
| 9 | documents | 001 |
| 10 | scheduled_tasks | 001 |
| 11 | vault_entries | 012 |
| 12 | vault_pins | 012 |
| 13 | service_providers | 015 |
| 14 | projects | 016 |
| 15 | project_tasks | 016 |
| 16 | project_rooms | 016 |
| 17 | project_appliances | 016 |
| 18 | project_members | 016 |
| 19 | home_contacts | 020 |
| 20 | home_invites | 020 |
| 21 | pending_receipts | 021 |

## App Architecture

- **Two parallel route trees** — `/homes/[homeId]/...` and `/dashboard/homes/[homeId]/...` — always update BOTH when changing page logic
- **Key shared types:** `lib/types.ts`
- **Vault crypto:** `lib/vault-crypto.ts` (AES-256-GCM, scrypt PIN, HMAC session cookies)
- **Sidebar nav:** `components/layout/sidebar.tsx` — Overview, Inventory, Calendar, Alerts, Members, Projects, Vault, Binder, Settings

### Supabase Profiles Join Pattern

```typescript
// home_members → profiles join
select('user_id, profiles(id, full_name, email, avatar_url)')
// profiles may be array or object:
const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
```

## Testing

### Playwright (E2E)

- **Config:** `playwright.config.ts`
- **Test dir:** `tests/`
- **Test files (9):** login, receipt-scan, add-home, add-appliance, vault, binder, alerts, ai-maintenance, invite-member
- **Total test cases:** ~20
- **Projects (7):** setup, smoke (Desktop Chrome 1280x720), mobile (iPhone 14 390x844), android (Pixel 6 412x915), firefox (Desktop Firefox), webkit (Desktop Safari), no-auth

```bash
npx playwright test              # Run all tests
npx playwright test --project=smoke  # Run smoke only
npx playwright show-report       # View HTML report
```

### k6 Load Tests

- **Script:** `k6/smoke.js`
- **SauceLabs account:** `oauth-Alyssakrawze-4ce92`

### Build Check

```bash
npm run build    # Always passes TypeScript check — run before committing
```

## Features Live

- **Home Management** — Create homes, add rooms with drag-to-reorder, room details (paint color, floor type, dimensions, notes)
- **Appliance Inventory** — Add/edit appliances per room, outdoor quick-pick chips, service records
- **Room Attachments** — File uploads to Supabase Storage `room-attachments` bucket, include-in-binder toggle
- **Calendar & Alerts** — Scheduled maintenance tasks, AI-generated maintenance schedules, "My Tasks" filter
- **Task Assignment** — Assign tasks to home members, limited users can self-assign and mark own tasks complete
- **Password Vault** — AES-256-GCM encrypted credentials, scrypt PIN, HMAC session cookie (15min TTL), owner/manager only
- **Document Binder** — Aggregated view of appliances and documents marked "include in binder", PDF export
- **Service Providers** — Per-appliance vendor directory, AI invoice scanning (Claude Haiku)
- **Projects** — Home improvement projects with tasks, linked rooms/appliances/members, tags
- **Members & Roles** — Owner, manager, limited roles with fine-grained permissions
- **Invitations** — Email invites with token-based acceptance flow
- **Home Contacts** — Home-level vendor/contact directory
- **Receipt Scanning** — AI-powered receipt parsing, pending receipts queue
- **Scheduled Reminders** — Email reminders via Resend + Vercel cron
- **Onboarding** — First-time user guided setup flow

## Known Bugs

1. **New user signup database error** — Likely missing `home_members` row on initial home creation. The signup trigger may not be inserting the owner row correctly.
2. **Anthropic API key needs rotation** — Current key may be expiring; rotate at https://console.anthropic.com

## Planned Features

- Stripe integration + pricing page
- iOS and Android native apps
- Contractor marketplace
- Public marketing site

## Important Conventions

### Code

- Run `npm run build` to verify TypeScript before committing
- Two parallel route trees (`/homes/[homeId]/...` and `/dashboard/homes/[homeId]/...`) — always update both
- Vault session cookie name: `vault_session`, 15min TTL

### Database / Supabase

- **Never run migrations automatically** — always paste SQL manually in the Supabase SQL Editor
- RLS policies: always `DROP POLICY IF EXISTS` before `CREATE POLICY` to avoid conflicts
- After schema changes: `NOTIFY pgrst, 'reload schema'` to clear PostgREST cache
- Supabase Storage buckets: `room-attachments` for room files

### Naming

- User-facing brand: **TheHomeFile** (always capitalize T, H, F)
- Never use: "TheHomePage", "Homefile", "Home File", "the home file"
