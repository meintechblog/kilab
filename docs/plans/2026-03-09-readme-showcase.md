# README Showcase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a screenshot, architecture diagram, roadmap, and stronger showcase polish to the GitHub-facing documentation.

**Architecture:** Generate and store a real screenshot asset from the running app on `kilab`, then update the root README and a small set of docs pages so the repository reads like a polished product showcase while preserving operational accuracy.

**Tech Stack:** Markdown, Mermaid, repository assets, existing Next.js app served on `kilab`

---

### Task 1: Prepare screenshot generation and capture the dashboard

**Files:**
- Create: `docs/assets/dashboard-overview.png`

**Step 1: Install or use headless browser tooling on `kilab`**
- Ensure the container can render a screenshot from the running app.

**Step 2: Capture the dashboard screenshot**
- Use the live app on `http://127.0.0.1:3000`.
- Save a stable screenshot asset into the repository.

**Step 3: Verify the file exists**
- Confirm the asset path is present and non-empty.

### Task 2: Upgrade the README showcase layer

**Files:**
- Modify: `README.md`

**Step 1: Add the screenshot near the top**
- Make the repo feel visually real immediately.

**Step 2: Add architecture diagram and roadmap**
- Improve scanability for both builders and operators.

**Step 3: Tighten narrative flow**
- Keep the README strong but not bloated.

### Task 3: Align supporting docs

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/devlog.md`

**Step 1: Add consistency with the README showcase tone**
- Align docs index and architecture doc with the upgraded landing page.

**Step 2: Record the showcase pass in the devlog**
- Keep the project history accurate.

### Task 4: Verify and ship

**Files:**
- No additional files required.

**Step 1: Run verification**
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `curl -I http://127.0.0.1:3000`

**Step 2: Commit and push**
- Commit message: `Add README showcase assets and polish`
