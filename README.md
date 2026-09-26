# TaxiAG

UK-wide taxi comparison and booking platform. **Compare. Choose. Book.**

- Product spec: [`TaxiAG_ PRD/Prompts library.md`](TaxiAG_ PRD/Prompts library.md)
- Build plan: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)

## Prerequisites (all free)

- Node.js 24 (`winget install OpenJS.NodeJS.LTS`)
- Docker Desktop running (first launch: open the app once and finish setup)
- Git + GitHub CLI (already set up for this repo)

## Quickstart (local, £0)

```powershell
npm.cmd install
Copy-Item .env.example .env
npm run stack:up   # postgres + redis + mailpit (needs Docker engine green)
```

Mail catcher UI: http://localhost:8025 · Postgres: `localhost:5432` · Redis: `localhost:6379`

## Repo map (Phase 0 target)

```
apps/mobile      # Expo app (scaffold: Phase 0.2+)
apps/web         # Next.js app (scaffold: Phase 0.2+)
services/api     # NestJS modular monolith (scaffold: Phase 0.2)
packages/tokens  # design tokens (done: v1)
packages/ui      # shared components (builds on tokens: Phase 0.3)
docker/osrm      # routing extract (populated when routing profile enabled)
```

## Conventions

- TypeScript everywhere. `£x.xx` formatting only via shared `formatGBP`.
- Never commit `.env`. CI runs lint → typecheck → test → build per workspace.
