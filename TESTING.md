# Testing

## Prerequisites

- Node.js 20+
- [k6](https://k6.io/docs/getting-started/installation/) (for load tests only)
- A test user account in your Supabase instance

## Environment Variables

Add to `.env.local`:

```
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

## Playwright (E2E Smoke Tests)

Install browsers (first time only):

```bash
npx playwright install chromium
```

Run all tests:

```bash
npx playwright test
```

Run a specific test:

```bash
npx playwright test tests/login.spec.ts
```

Run with UI mode:

```bash
npx playwright test --ui
```

View the last HTML report:

```bash
npx playwright show-report
```

### Test Structure

| File | Auth | Purpose |
|------|------|---------|
| `tests/auth.setup.ts` | - | Logs in and saves session for other tests |
| `tests/login.spec.ts` | None | Tests the login flow from scratch |
| `tests/add-home.spec.ts` | Saved | Adds a home from the dashboard |
| `tests/add-appliance.spec.ts` | Saved | Adds an item to a room |
| `tests/receipt-scan.spec.ts` | Saved | Uploads a receipt and files it to a room |

## k6 (Load Tests)

Run against local dev server:

```bash
k6 run k6/smoke.js
```

Run against a deployed URL:

```bash
k6 run -e BASE_URL=https://your-app.vercel.app k6/smoke.js
```

Thresholds: p95 response time < 2s, error rate < 1%.

## CI (GitHub Actions)

The `playwright.yml` workflow runs on push/PR to `main`. Required secrets:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
