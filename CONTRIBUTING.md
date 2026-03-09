# Contributing

Thanks for contributing to `kilab-webapp`.

## Ground Rules

- Keep changes pragmatic and aligned with the current product direction.
- If you touch user-facing behavior, update the relevant documentation.
- If you change operations or data assumptions, update the docs in `docs/`.
- If UI changes materially, include a screenshot in the PR.

## Local Workflow

Primary working environment for this project is the `kilab` container.

Typical flow:

```bash
ssh kilab
cd /root/projects/kilab-webapp
pnpm install
pnpm test
pnpm lint
pnpm build
```

For local development mode:

```bash
HOST=0.0.0.0 PORT=3000 pnpm dev
```

## Data And Operations

Useful commands:

```bash
pnpm sync:prices -- --mode=day-ahead
pnpm sync:prices -- --mode=intraday
systemctl restart kilab-webapp.service
journalctl -u kilab-webapp.service -n 100 --no-pager
```

## Pull Requests

Before opening a PR, make sure to run:

```bash
pnpm test
pnpm lint
pnpm build
```

A good PR should explain:
- what changed
- why it changed
- how it was verified
- whether docs were updated

## Scope

This repo is intentionally compact. Prefer focused improvements over broad refactors unless the refactor is clearly justified by the feature or fix.
