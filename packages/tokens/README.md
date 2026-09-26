# @taxiag/tokens

Single source of truth for TaxiAG design tokens (colours, type, spacing).
Any UI change starts here, then flows to `packages/ui` and the apps.

- `tokens.json` — the tokens (consumed by web + mobile theming).
- Keep price-semantic colours (`price.*`) reserved for price badges only —
  sponsored slots must never use them (PRD §31).
