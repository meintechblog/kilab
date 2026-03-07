# Kilab Webapp Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local Next.js web app that stores and displays German quarter-hour electricity prices with 14-day backfill, scheduled imports, and a week-based chart.

**Architecture:** Next.js serves the UI and server-side data access, Postgres stores normalized time series, and small import scripts fetch public day-ahead and intraday quarter-hour prices into the database with idempotent upserts. The UI reads only from the database and surfaces sync freshness.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Postgres, Prisma, Vitest, Recharts, node-cron

---

### Task 1: Project Baseline

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/env.ts`
- Create: `src/lib/db.ts`
- Modify: `package.json`
- Modify: `README.md`

**Step 1: Write the failing test**
Create an env parsing test that expects required database configuration and app timezone values.

**Step 2: Run test to verify it fails**
Run: `pnpm vitest run`
Expected: FAIL because env module does not exist.

**Step 3: Write minimal implementation**
Add env parsing, Prisma client bootstrap, and package scripts for db/test workflows.

**Step 4: Run test to verify it passes**
Run: `pnpm vitest run`
Expected: PASS for env parsing test.

### Task 2: Price Import Domain

**Files:**
- Create: `src/lib/prices/energy-charts.ts`
- Create: `src/lib/prices/normalize.ts`
- Create: `src/lib/prices/upsert.ts`
- Create: `src/lib/prices/types.ts`
- Test: `src/lib/prices/energy-charts.test.ts`
- Test: `src/lib/prices/normalize.test.ts`

**Step 1: Write the failing tests**
Cover extraction of day-ahead and intraday quarter-hour series from the public chart dataset and normalization into quarter-hour price points.

**Step 2: Run targeted tests to verify they fail**
Run: `pnpm vitest run src/lib/prices/energy-charts.test.ts src/lib/prices/normalize.test.ts`
Expected: FAIL because import code is missing.

**Step 3: Write minimal implementation**
Implement dataset fetchers, series matchers, timestamp normalization, and derived `ct/kWh` conversion.

**Step 4: Run targeted tests to verify they pass**
Run the same command and confirm PASS.

### Task 3: Sync Workflows

**Files:**
- Create: `src/lib/prices/sync.ts`
- Create: `scripts/backfill-prices.ts`
- Create: `scripts/sync-prices.ts`
- Create: `scripts/install-cron.ts`
- Test: `src/lib/prices/sync.test.ts`

**Step 1: Write the failing tests**
Cover rolling sync windows, sync-run summaries, and cron line generation for scheduled imports.

**Step 2: Run targeted tests to verify they fail**
Run: `pnpm vitest run src/lib/prices/sync.test.ts`
Expected: FAIL because sync code is missing.

**Step 3: Write minimal implementation**
Add sync orchestration, backfill entrypoint, scheduler installer, and idempotent upserts.

**Step 4: Run targeted tests to verify they pass**
Run the same command and confirm PASS.

### Task 4: API and UI

**Files:**
- Create: `src/lib/prices/query.ts`
- Create: `app/api/dashboard/route.ts`
- Create: `src/components/price-chart.tsx`
- Create: `src/components/price-summary.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Test: `src/lib/prices/query.test.ts`

**Step 1: Write the failing tests**
Cover dashboard query windowing and current-price selection.

**Step 2: Run targeted tests to verify they fail**
Run: `pnpm vitest run src/lib/prices/query.test.ts`
Expected: FAIL because query code is missing.

**Step 3: Write minimal implementation**
Build the dashboard query, route handler, and a responsive chart-first UI.

**Step 4: Run targeted tests to verify they pass**
Run the same command and confirm PASS.

### Task 5: Verification and Ops

**Files:**
- Modify: `README.md`
- Optional: `.env`

**Step 1: Run full verification**
Run: `pnpm vitest run && pnpm lint && pnpm build`
Expected: all pass.

**Step 2: Run database and sync commands**
Run: `pnpm prisma db push && pnpm backfill:prices && pnpm cron:install`
Expected: schema created, backfill populated, cron installed.

**Step 3: Run dev server**
Run: `HOST=0.0.0.0 pnpm dev`
Expected: Next.js dev server on port 3000.
