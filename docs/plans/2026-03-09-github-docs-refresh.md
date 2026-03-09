# GitHub Docs Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the repository documentation into a stronger GitHub-facing product showcase with a clearer README and curated supporting docs.

**Architecture:** Keep `README.md` as the top-level landing page and add a small set of purpose-built documents under `docs/` for architecture, data sources, operations, and navigation. Preserve existing operational accuracy while improving clarity, structure, and discoverability.

**Tech Stack:** Markdown, GitHub repository docs, existing Next.js/Postgres project context

---

### Task 1: Rewrite the root README as a landing page

**Files:**
- Modify: `README.md`

**Step 1: Replace the current minimal README**
- Add a stronger project introduction, feature snapshot, live-session link, quickstart, repo tour, and documentation map.

**Step 2: Review for tone and clarity**
- Ensure the README reads well for both GitHub visitors and operators.

**Step 3: Commit**
- Commit message: `Refresh README as GitHub landing page`

### Task 2: Add curated docs pages

**Files:**
- Create: `docs/README.md`
- Create: `docs/architecture.md`
- Create: `docs/data-sources.md`
- Create: `docs/operations.md`

**Step 1: Add docs index**
- Create a short navigation page linking all deeper docs.

**Step 2: Add architecture guide**
- Document the data flow, storage model, sync process, and dashboard composition.

**Step 3: Add data-sources guide**
- Document market sources and local pricing assumptions.

**Step 4: Add operations guide**
- Document service, cron, logs, manual syncs, and recovery commands.

**Step 5: Commit**
- Commit message: `Add curated project documentation`

### Task 3: Tie docs back into the project narrative

**Files:**
- Modify: `docs/devlog.md`

**Step 1: Add a devlog entry**
- Record the GitHub documentation refresh.

**Step 2: Review all cross-links**
- Make sure README and docs reference each other cleanly.

**Step 3: Commit**
- Commit message: `Document GitHub docs refresh`

### Task 4: Verify and ship

**Files:**
- No additional files required.

**Step 1: Verify repository state**
- Run: `pnpm test`
- Run: `pnpm lint`
- Run: `pnpm build`
- Run: `curl -I http://127.0.0.1:3000`

**Step 2: Commit final verified state**
- Commit message: `Ship GitHub documentation refresh`
