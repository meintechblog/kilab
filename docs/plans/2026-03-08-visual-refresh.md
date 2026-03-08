# Visual Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the dashboard into a higher-contrast, more intentional energy-market interface without changing the underlying product behavior.

**Architecture:** Add a minimal render-test harness for the dashboard, then refactor the page shell, dashboard cards, and chart container to a dark technical design system while preserving the current component structure and data contract.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Tailwind

---

### Task 1: Add failing render tests
- Update Vitest include patterns for component tests.
- Add a minimal server-render render test for the dashboard shell.
- Verify the test fails before implementation.

### Task 2: Refresh the global page shell
- Update `app/globals.css`, `app/layout.tsx`, and `app/page.tsx`.
- Introduce the darker palette, stronger hero framing, and improved contrast.

### Task 3: Refresh dashboard panels and cards
- Update `src/components/price-dashboard.tsx`.
- Strengthen KPI cards, scenario cards, breakdown panels, and sync/status surface.

### Task 4: Refresh chart presentation
- Update `src/components/price-chart.tsx`.
- Improve dark-mode chart contrast, legend readability, and fixed-price emphasis.

### Task 5: Verify and ship
- Run `pnpm test`, `pnpm lint`, `pnpm build`.
- Check live HTTP response.
- Commit and push verified changes.
