# @taxiag/web (MVP)

Search-and-compare UI wired to the live API (`http://localhost:3001`).

## Run (3 terminals or background)

```powershell
npm run stack:up                                  # postgres + redis + mailpit
npm.cmd run build --workspace @taxiag/api         # rebuild API (after changes)
node services/api/dist/main.js                    # API on :3001 (leave running)
npm.cmd run dev --workspace @taxiag/web           # web on :3000
```

Open http://localhost:3000 — search "Cambridge Station" → "London Heathrow
Terminal 5" and real quotes come back cheapest-first.

Notes: addresses are geocoded live via OpenStreetMap Nominatim (free, UK-only);
quotes come from the mock provider until Tier A/B/C integrations land.
