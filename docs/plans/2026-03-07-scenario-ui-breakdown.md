# Scenario UI Breakdown Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the scenario UI so the cards become the primary control surface and add visible current-price and monthly-cost calculation breakdowns.

**Architecture:** Keep the data model server-driven. Extend pricing summary payloads with explicit breakdown structures, then render those structures in the dashboard while removing the redundant top selector/checkbox block.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Tailwind

---

### Task 1: Breakdown data contract

**Files:**
- Modify: `src/lib/pricing/types.ts`
- Modify: `src/lib/pricing/engine.ts`
- Test: `src/lib/pricing/engine.test.ts`

**Step 1:** Add a failing test for explicit VAT/subtotal breakdown fields.
**Step 2:** Run the targeted test and verify the failure.
**Step 3:** Extend the engine output with the missing breakdown fields.
**Step 4:** Re-run the targeted test and verify it passes.

### Task 2: Scenario summary breakdowns

**Files:**
- Modify: `src/lib/pricing/dashboard.ts`
- Test: `src/lib/pricing/dashboard.test.ts`

**Step 1:** Add a failing test for current-price and monthly-cost breakdowns in scenario summaries.
**Step 2:** Run the targeted test and verify the failure.
**Step 3:** Implement the minimal summary payload changes.
**Step 4:** Re-run the targeted test and verify it passes.

### Task 3: Dashboard UX simplification

**Files:**
- Modify: `src/components/price-dashboard.tsx`
- Modify: `src/components/price-chart.tsx`

**Step 1:** Remove the redundant top selector block.
**Step 2:** Make scenario cards the primary activation/comparison controls.
**Step 3:** Render current-price composition and monthly-cost breakdown panels.
**Step 4:** Keep the chart wired to the active/comparison scenarios.

### Task 4: Verify and document

**Files:**
- Modify: `README.md`
- Modify: `docs/devlog.md` if present

**Step 1:** Run `pnpm test`, `pnpm lint`, and `pnpm build`.
**Step 2:** Check the live dashboard/API output on port `3000`.
**Step 3:** Commit and push the verified state to `main`.
