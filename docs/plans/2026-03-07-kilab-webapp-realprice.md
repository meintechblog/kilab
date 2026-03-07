# Kilab Webapp Real Price Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the existing electricity price dashboard with realistic end-customer price scenarios for Schwäbisch Hall and monthly estimates based on a 3-person-household H0 load profile.

**Architecture:** Keep spot prices in Postgres as the source of truth and add a pure TypeScript pricing engine that applies scenario-specific surcharges and fixed-cost allocation. The API exposes base quarter-hour series plus pricing configuration, and a client-side dashboard computes and compares scenarios responsively.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Postgres, Vitest, Recharts, BDEW H0 load profile asset

---

### Task 1: Pricing Configuration

**Files:**
- Create: `src/lib/pricing/config.ts`
- Create: `src/lib/pricing/types.ts`
- Test: `src/lib/pricing/config.test.ts`

**Step 1: Write the failing test**
Verify Schwäbisch Hall and Tibber constants plus scenario metadata.

**Step 2: Run test to verify it fails**
Run: `pnpm vitest run src/lib/pricing/config.test.ts`
Expected: FAIL because pricing config does not exist.

**Step 3: Write minimal implementation**
Add versioned constants and scenario definitions.

**Step 4: Run test to verify it passes**
Run the same command and confirm PASS.

### Task 2: Cost Engine

**Files:**
- Create: `src/lib/pricing/engine.ts`
- Test: `src/lib/pricing/engine.test.ts`

**Step 1: Write the failing tests**
Cover real-price calculation, module 3 time windows, and fixed-cost monthly allocation.

**Step 2: Run targeted tests to verify they fail**
Run: `pnpm vitest run src/lib/pricing/engine.test.ts`
Expected: FAIL because the engine is missing.

**Step 3: Write minimal implementation**
Implement scenario-specific price transformation and cost breakdowns.

**Step 4: Run targeted tests to verify they pass**
Run the same command and confirm PASS.

### Task 3: H0 Load Profile

**Files:**
- Create: `src/data/h0-profile-2026.json`
- Create: `src/lib/pricing/load-profile.ts`
- Test: `src/lib/pricing/load-profile.test.ts`

**Step 1: Write the failing tests**
Verify scaling to 3.500 kWh/year and month extraction for the estimate.

**Step 2: Run targeted tests to verify they fail**
Run: `pnpm vitest run src/lib/pricing/load-profile.test.ts`
Expected: FAIL because the load-profile module is missing.

**Step 3: Write minimal implementation**
Store the generated normalized H0 profile and add helper functions for monthly slices.

**Step 4: Run targeted tests to verify they pass**
Run the same command and confirm PASS.

### Task 4: Dashboard Data

**Files:**
- Modify: `src/lib/prices/query.ts`
- Modify: `app/api/dashboard/route.ts`
- Test: `src/lib/prices/query.test.ts`

**Step 1: Write the failing tests**
Extend dashboard query expectations to include scenario-ready metadata and current month windows.

**Step 2: Run targeted tests to verify they fail**
Run: `pnpm vitest run src/lib/prices/query.test.ts`
Expected: FAIL because the response shape is too small.

**Step 3: Write minimal implementation**
Expose pricing config, monthly base rows, and scenario defaults from the API.

**Step 4: Run targeted tests to verify they pass**
Run the same command and confirm PASS.

### Task 5: Scenario UI

**Files:**
- Create: `src/components/scenario-dashboard.tsx`
- Modify: `src/components/price-chart.tsx`
- Modify: `src/components/price-summary.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Step 1: Write the failing test**
If practical, add a minimal render test for scenario labels or calculate-first helpers.

**Step 2: Run test to verify it fails**
Run the targeted test command.
Expected: FAIL because the new UI layer does not exist.

**Step 3: Write minimal implementation**
Add scenario selector, comparison mode, cost cards, and real-price chart lines.

**Step 4: Run verification**
Run relevant tests and confirm PASS.

### Task 6: Final Verification

**Files:**
- Modify: `README.md`

**Step 1: Run full verification**
Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

**Step 2: Validate runtime data**
Run API checks against `/api/dashboard` and confirm scenario values are present.

**Step 3: Keep dev server running**
Run: `HOST=0.0.0.0 PORT=3000 pnpm dev`
Expected: dashboard reachable on port 3000.
