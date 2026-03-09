# GitHub Docs Refresh Design

## Goal
- Turn the repository into a stronger product showcase on GitHub.
- Keep the repo technically useful for operators while making the project easier to understand for curious readers, builders, and people arriving from the live vibe-coding session.

## Recommended Direction
- Use the root README as the primary landing page.
- Add a small set of curated docs behind it instead of scattering information across ad-hoc notes.
- Keep the tone practical and builder-oriented, but add enough narrative so the repo feels intentional and worth exploring.

## README Structure
- Hero block with clear positioning: what the project is, what makes it interesting, and where it runs.
- Prominent link to the live session article:
  - https://meintechblog.de/2026/03/07/live-vibe-coding-mit-openclaw-und-codex/
- Snapshot section with the core product capabilities.
- Why it exists / what it solves.
- How it works at a high level.
- Quickstart for developers and operators.
- Repository tour with the most important paths.
- Documentation map linking to the deeper docs.

## Supporting Docs
- `docs/README.md`
  - navigation page for all deeper documentation.
- `docs/architecture.md`
  - explain system shape, data flow, storage, sync jobs, and dashboard composition.
- `docs/data-sources.md`
  - explain market sources, local real-price assumptions, and what is a hard source vs. a modelling assumption.
- `docs/operations.md`
  - explain service management, sync commands, cron schedule, logs, and recovery commands.

## Tone and Style
- Product-showcase first, but not marketing fluff.
- Clear sectioning, concise bullets, short explanatory paragraphs.
- Strong scanability for GitHub readers.
- Make the repo feel “built live, but engineered on purpose”.

## Verification
- Verify links and file structure.
- Re-run the normal app verification path after doc changes to ensure no accidental collateral edits.
