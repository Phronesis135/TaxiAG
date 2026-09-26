# @taxiag/ui

Shared UI primitives for the Expo app and Next.js web app.

Phase 0.3 starts with **pure formatting** (no framework deps, fully tested):
- `formatGBP` — the only way to render pounds (tokens: `en-GB`/`GBP`).
- `priceDisplayText` — PRD §7 strings: fixed / estimated / metered.

Component library (`SearchForm`, `ResultCard`, `PriceBadge`, …) builds on these
and `@taxiag/tokens` in later phases.
