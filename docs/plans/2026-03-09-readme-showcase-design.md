# README Showcase Design

## Goal
- Push the repository documentation from “good project docs” to “strong GitHub showcase”.
- Add visual proof, architecture clarity, and a stronger sense that this is a real project built live and operated for real.

## Recommended Direction
- Keep the current landing-page README structure.
- Add a real dashboard screenshot near the top.
- Add a Mermaid architecture diagram for quick technical orientation.
- Add a short roadmap to signal momentum.
- Tighten supporting docs so the whole documentation set feels curated, not improvised.

## Screenshot Strategy
- Generate the screenshot directly on `kilab` from the running app.
- Store the image in the repository so GitHub renders it immediately.
- Use a stable resolution and current LAN-served app state.

## README Additions
- hero screenshot
- highlights block
- architecture diagram
- roadmap section
- stronger bridge between the GitHub repo and the linked live coding article

## Supporting Docs
- `docs/README.md`
  - mention the visual showcase path more clearly
- `docs/architecture.md`
  - include a matching Mermaid diagram or tighter flow explanation
- keep the rest concise and aligned with the README tone

## Verification
- confirm screenshot file exists in repo
- confirm README references resolve cleanly
- rerun `pnpm test`, `pnpm lint`, `pnpm build`, and HTTP health check
