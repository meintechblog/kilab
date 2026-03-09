# Development Log

## 2026-03-07
- Initial kilab webapp scaffolded on the `kilab` LXC with Next.js, pnpm, Postgres, sync scripts, and cron-based price imports.
- Added Day-Ahead and Intraday quarter-hour ingestion with 14-day backfill and dashboard API.
- Added Schwäbisch Hall real-price scenarios, monthly cost projection, calculation breakdown panels, and a 25 ct/kWh fixed-price comparison.
- Updated fixed-price comparison to include an assumed 12 EUR monthly base charge from the current contract.
- Replaced the ephemeral app process with a persistent systemd service after the March 8, 2026 outage.
- Applied a dark technical dashboard refresh using the ui-ux-pro-max design direction.
- Added a decision-focused advisory layer with flex-vs-fix guidance, best upcoming windows, scenario deltas, and chart visibility controls.
- Rebuilt the GitHub-facing documentation into a product-style landing page with curated architecture, sources, and operations docs.
- Added README showcase polish with a real dashboard screenshot, architecture diagram, and roadmap.
- Added MIT licensing, contribution guidance, changelog, and GitHub issue/PR templates for a more complete repo workflow.
