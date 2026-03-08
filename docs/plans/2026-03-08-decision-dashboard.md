# Decision Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a high-utility decision layer that tells the user when flex is better than the fixed tariff, which upcoming windows are cheapest, and how the active scenario compares in practice.

**Architecture:** Compute advisory insights from the existing dashboard payload and active scenario selection, then render them in new dashboard sections and chart controls without changing the storage model. Keep the existing price and billing panels, but connect them to a new decision-oriented interaction flow.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Tailwind, Recharts

---

### Task 1: Add failing advisory derivation tests

**Files:**
- Create: `src/lib/pricing/advisory.test.ts`
- Create: `src/lib/pricing/advisory.ts`

**Step 1: Write the failing test**
- Add tests for:
  - current delta versus fixed price
  - monthly delta extraction from selected scenario
  - cheapest upcoming windows sorted by effective price
  - graceful handling when future data is missing

**Step 2: Run test to verify it fails**
- Run: `pnpm vitest run src/lib/pricing/advisory.test.ts`
- Expected: fail because the module or exports do not exist yet.

**Step 3: Write minimal implementation**
- Create a focused advisory helper that derives the decision summary from chart rows, scenario summaries, selected scenario id, and fixed-price reference.

**Step 4: Run test to verify it passes**
- Run: `pnpm vitest run src/lib/pricing/advisory.test.ts`
- Expected: pass.

**Step 5: Commit**
- Commit message: `Add dashboard advisory derivation`

### Task 2: Add failing render tests for new decision UI

**Files:**
- Modify: `src/components/price-dashboard.test.tsx`
- Modify: `src/components/price-dashboard.tsx`

**Step 1: Write the failing test**
- Extend the dashboard render test to expect:
  - `Jetzt entscheiden`
  - `Beste Zeitfenster`
  - chart control copy for visible series
  - monthly delta signal on scenario cards

**Step 2: Run test to verify it fails**
- Run: `pnpm vitest run src/components/price-dashboard.test.tsx`
- Expected: fail because the new UI sections are not rendered yet.

**Step 3: Write minimal implementation**
- Add local advisory state usage and new decision panels to the dashboard component.
- Keep scenario cards as the control surface.

**Step 4: Run test to verify it passes**
- Run: `pnpm vitest run src/components/price-dashboard.test.tsx`
- Expected: pass.

**Step 5: Commit**
- Commit message: `Add decision panels to dashboard`

### Task 3: Improve chart interaction and readability

**Files:**
- Modify: `src/components/price-chart.tsx`
- Modify: `src/components/price-dashboard.tsx`

**Step 1: Write the failing test**
- Add or extend render expectations for chart-control labels and active-series framing in the dashboard test.

**Step 2: Run test to verify it fails**
- Run: `pnpm vitest run src/components/price-dashboard.test.tsx`
- Expected: fail because the chart controls are missing.

**Step 3: Write minimal implementation**
- Add visible-series toggles and stronger active-state framing around the selected scenario and fixed-price comparison.

**Step 4: Run test to verify it passes**
- Run: `pnpm vitest run src/components/price-dashboard.test.tsx`
- Expected: pass.

**Step 5: Commit**
- Commit message: `Refine chart controls for decision flow`

### Task 4: Update docs and final verification

**Files:**
- Modify: `README.md`
- Modify: `docs/devlog.md`

**Step 1: Document the new interaction model**
- Update the README feature bullets and append a devlog entry.

**Step 2: Run full verification**
- Run: `pnpm test`
- Run: `pnpm lint`
- Run: `pnpm build`
- Run: `curl -I http://127.0.0.1:3000`
- Expected: tests pass, lint clean, build succeeds, HTTP responds `200 OK` after service restart.

**Step 3: Commit**
- Commit message: `Ship decision-focused dashboard UX`
