# kilab-webapp

A local energy-price dashboard for Germany that turns quarter-hour spot market prices into something a household can actually use: current flex-price reality, fixed-price comparison, monthly cost projection, and actionable cheap time windows.

Built and operated on the `kilab` Proxmox LXC, backed by Postgres, and shaped live during a vibe-coding session with OpenClaw and Codex.

[Live vibe-coding session](https://meintechblog.de/2026/03/07/live-vibe-coding-mit-openclaw-und-codex/)

## Why This Repo Exists

Spot prices are interesting. Real household decisions are more interesting.

This project started as a local web app that shows German quarter-hour electricity prices. It then grew into a decision dashboard that answers better questions:
- Is flexible pricing currently below my fixed tariff?
- What would I realistically pay as an end customer in Schwaebisch Hall?
- What does that mean for my monthly bill?
- When are the next good windows to shift consumption?

## Project Snapshot

- Germany day-ahead and intraday quarter-hour market prices.
- Local storage with backfill and repeatable sync jobs.
- Real-price modelling for Schwaebisch Hall on top of exchange prices.
- Fixed tariff comparison using `25 ct/kWh` plus `12 EUR/month` base charge.
- Decision-focused dashboard with `Flex vs. Fix`, best upcoming windows, scenario deltas, and chart visibility controls.
- Persistent app runtime via `systemd` on the `kilab` container.

## What The App Does

The app combines several layers into one dashboard:
- Raw market view: day-ahead and intraday price curves.
- End-customer view: local surcharges, taxes, fees, and meter scenarios.
- Billing view: monthly projection based on a `BDEW H0` profile for a `3-person house`.
- Decision view: current spread to fixed tariff, cheapest next slots, and best practical hour block.

## Built Live

This repository is part of a public live coding story. The linked article shows the tooling context around the repo and how the project was built iteratively:

- [Live Vibe Coding mit OpenClaw und Codex](https://meintechblog.de/2026/03/07/live-vibe-coding-mit-openclaw-und-codex/)

That context matters here: this repo is not just a static code dump. It is a working project built in public, refined step by step, and kept operational on a real container.

## How It Works

High-level flow:
- `Energy-Charts` provides the market price source data.
- Sync scripts fetch and normalize quarter-hour prices.
- Postgres stores the imported time series and sync metadata.
- Pricing logic derives local real-price scenarios for Schwaebisch Hall.
- Next.js renders the dashboard and exposes the aggregated API.
- `systemd` keeps the production process alive on port `3000`.

For the deeper breakdown, see [docs/architecture.md](/root/projects/kilab-webapp/docs/architecture.md).

## Quickstart

### Install

```bash
pnpm install
pnpm db:push
pnpm backfill:prices
pnpm cron:install
```

### Run Dev Server

```bash
HOST=0.0.0.0 PORT=3000 pnpm dev
```

### Build

```bash
pnpm build
```

### Production Start

```bash
pnpm start -- --hostname 0.0.0.0 --port 3000
```

### Helpful Commands

```bash
pnpm test
pnpm lint
pnpm sync:prices -- --mode=day-ahead
pnpm sync:prices -- --mode=intraday
systemctl restart kilab-webapp.service
journalctl -u kilab-webapp.service -n 100 --no-pager
```

## Current Modelling Assumptions

- Spot sources: Energy-Charts day-ahead and intraday.
- Real-price layer: day-ahead plus Tibber-like procurement costs, local grid fees, taxes, and levies for Schwaebisch Hall.
- Load profile: `BDEW H0`, `3-person house`, `3,500 kWh/year`.
- Fixed-price reference: `25 ct/kWh` energy price plus assumed `12 EUR/month` base fee.
- Scheduler: `10:47`, `12:58`, `13:03`, `13:10`, `15:47`, `22:47` in `Europe/Berlin`.

For source and modelling detail, see [docs/data-sources.md](/root/projects/kilab-webapp/docs/data-sources.md).

## Operations

- Persistent web service: `ops/systemd/kilab-webapp.service`
- Service status: `systemctl status kilab-webapp.service`
- Logs: `journalctl -u kilab-webapp.service -n 100 --no-pager`
- Restart: `systemctl restart kilab-webapp.service`
- Manual health check: `curl -I http://127.0.0.1:3000`

Operational detail lives in [docs/operations.md](/root/projects/kilab-webapp/docs/operations.md).

## Repository Tour

- [`app/`](/root/projects/kilab-webapp/app) Next.js app shell and routes.
- [`src/components/`](/root/projects/kilab-webapp/src/components) dashboard UI, chart, and interaction surfaces.
- [`src/lib/prices/`](/root/projects/kilab-webapp/src/lib/prices) market data querying, dashboard aggregation, and sync integration.
- [`src/lib/pricing/`](/root/projects/kilab-webapp/src/lib/pricing) real-price engine, scenarios, monthly projections, and advisory logic.
- [`scripts/`](/root/projects/kilab-webapp/scripts) fetch and sync scripts used for backfill and recurring updates.
- [`ops/systemd/`](/root/projects/kilab-webapp/ops/systemd) service definition for the persistent runtime.
- [`docs/`](/root/projects/kilab-webapp/docs) architecture, sources, operations, and project notes.

## Documentation Map

- [docs/README.md](/root/projects/kilab-webapp/docs/README.md)
- [docs/architecture.md](/root/projects/kilab-webapp/docs/architecture.md)
- [docs/data-sources.md](/root/projects/kilab-webapp/docs/data-sources.md)
- [docs/operations.md](/root/projects/kilab-webapp/docs/operations.md)
- [docs/devlog.md](/root/projects/kilab-webapp/docs/devlog.md)

## Status

The app currently runs locally on the `kilab` container and is served on port `3000` inside the LAN setup used for this project. The repository is maintained in `meintechblog/kilab` and updated directly from the container workflow.
