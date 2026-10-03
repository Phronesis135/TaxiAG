# TaxiAG — Implementation Plan

**Source:** `TaxiAG_ PRD/Prompts library.md` (product-level PRD, MVP-to-scale)
**Market:** United Kingdom, English-first at launch
**Document status:** Living plan — update as provider integrations and resourcing are confirmed.

This plan translates the PRD into buildable phases: design system → architecture →
MVP → Phase 2 → Phase 3, plus cross-cutting concerns (security, testing, DevOps,
analytics) and risks.

---

## 0. Guiding decisions (locked before build starts)

| # | Decision | Recommendation | Why |
|---|----------|----------------|-----|
| 1 | Client strategy | **React Native (Expo)** for iOS/Android + **Next.js** responsive web app | One language (TypeScript) across clients; Expo covers guest-first mobile quickly; Next.js covers SEO landing pages + desktop booking |
| 2 | Backend language | **TypeScript — NestJS** (modular monolith first) | Matches client language; modules map cleanly to future microservices; strong validation/scheduling support |
| 3 | Database | **PostgreSQL + PostGIS** (local Docker, free) | Same engine as production; relational bookings + geospatial queries (pickup areas, ETAs, nearest-provider logic); £0 until cloud hosting at scale |
| 4 | Cache / realtime backbone | **Redis** (local Docker, free) + **WebSockets** (in-API gateway, free) | Quote TTLs + live tracking with no paid service; Redis runs alongside Postgres locally |
| 5 | Payments | **PayPal** (Checkout + sandbox, free for dev) | No monthly fees; sandbox covers direct vs provider-charged flows (PRD §16/§30) now; Apple Pay/Google Pay via PayPal where available; reassess split-payout options at scale |
| 6 | Maps & places | **OpenStreetMap stack, free** — Leaflet (maps) + Nominatim/Photon (geocode/autocomplete) + OSRM (routing, local Docker) | £0 with strong UK coverage; Google Maps Platform becomes the paid upgrade at scale (better autocomplete/SLAs) |
| 7 | Auth | **Better Auth** (open-source, self-hosted, free) | Apple/Google social + email OTP + phone OTP plugins cover PRD §15 with no per-user fees; runs inside our API, data stays local |
| 8 | Notifications | **Twilio** (SMS) + **Resend** (email) + **Expo Push/FCM** (push) | Decided providers: trial/free credits cover dev, pay-as-you-go at scale; Twilio gives UK sender ID + delivery receipts, Resend delivers payment receipts (Postmark kept as fallback option, PRD §19) |
| 9 | Hosting | **Local dev machine** (Docker Compose: API + Postgres + Redis + OSRM + Mailpit) + **GitHub Actions** CI (free tier) | £0; staging = second Compose profile on the same/another local machine; cloud (AWS/GCP) + Terraform deferred to scale |
| 10 | Architecture shape | **Modular monolith → extract services** at Phase 2 | MVP speed without painting into a corner; extraction triggers defined in §6 |
| 11 | Object storage | **Cloudflare R2** (generous free tier, zero egress fees) | Verification docs, vehicle/driver photos, receipts; S3-compatible so code stays portable |

> **Cost constraint (pre-scale):** £0 paid services — everything below runs on the local machine (Docker Compose) or on free tiers/sandbox/trial credits. Paid upgrades (cloud hosting, Google Maps, Stripe/Connect review) are deferred to Phase 2/3 scale; Twilio/Postmark run on trial credits in dev, pay-as-you-go in production.
>
> If any decision changes, only §§1–6 need re-review; phase scopes (§§7–9) are stack-agnostic.

---

## 1. Design system (build first — it paces every screen)

### 1.1 Principles (from PRD §§2, 33–36)
- **Trust-first:** price type and verification status visible on every card, no dark patterns.
- **Cheapest is the hero:** ranking, type scale and colour must make the cheapest real option unmissable.
- **Comparison-led, not checkout-led:** results screen is the product's centre of gravity.
- **Accessible by default:** WCAG 2.2 AA across app + web; the interface *and* the vehicle data must be accessible (§36).

### 1.2 Design tokens
- **Colour:** base neutrals (light/dark themes); semantic tokens — `price-fixed` (green), `price-estimated` (amber), `price-metered` (grey/blue), `verified` (green check), `sponsored` (distinct neutral container + "Sponsored" label, never price-semantic colours — §31); safety-critical red reserved for safety/emergency actions.
- **Typography:** system stack (SF Pro / Roboto) + web fallback (Inter); minimum 16px body; tabular numerals for all prices; price always `£x.xx` formatted via shared `formatGBP`.
- **Spacing/radius:** 4pt grid; cards 12–16px radius; touch targets ≥ 48×48dp.
- **Motion:** subtle only; full `prefers-reduced-motion` support.

### 1.3 Component inventory (each: Figma spec → coded component → a11y test)
1. `SearchForm` (From / To / When / Passengers + secondary options drawer: return, airport/station, stops, accessibility, vehicle, max price, preferences) — PRD §33.
2. `ResultCard` (collapsed: provider, price, price-type badge, pickup time, vehicle, rating, verified tick) + `ResultCardExpanded` (vehicle, duration, capacity, luggage, accessibility, payment, cancellation, reliability, tracking, provider info) — §34.
3. `PriceBadge` variants: **Price locked — £18.50** / **Estimated — £16–£21** / **From £15** + `WhyThisPrice` explainer sheet — §§7, 35.
4. `ProviderProfile` (reliability stats block, verification block with date, reviews) — §§20, 23, 24.
5. `BookingFlow` (passenger details incl. booking-for-other, price-freeze confirm, responsibility banner: *who controls booking/payment/cancellation/refund/support*) — §§5, 40.
6. `TrackingView` (live map *or* explicit **Tracking unavailable** state — never fake tracking, §18) + safety toolkit (share journey, driver contact, emergency, report) — §§18, 38.
7. `ReceiptView` + `JourneyHistory` + `ReviewForm` (verified-journey-gated) — §§24, completion step.
8. `SponsoredSlot` (labelled, visually separated, excluded from organic ranking logic) — §§30, 31.
9. System components: `EmptyState` (e.g. *"No suitable vehicles under £25"* — §9), `ErrorState`, `NotificationPreferences`, `CancellationTerms`, `AccessibilityFilters`.

### 1.4 Accessibility checklist (PRD §36, enforced in CI)
Screen-reader labels on all price/CTA elements · keyboard-trapped-free modals · visible focus states · contrast ≥ 4.5:1 · dynamic type support · plain-language error messages · non-visual alternatives for every map-dependent fact (ETA/pickup point also as text).

### 1.5 Deliverables
Figma library + coded component library (React Native Paper/Tamagui-based + shared web tokens) with Storybook; token JSON as single source of truth.

---

## 2. System architecture

### 2.1 High-level view

```
┌──────────────┐  ┌──────────────┐
│ Expo mobile  │  │ Next.js web  │
└──────┬───────┘  └──────┬───────┘
       └────────┬────────┘
        API Gateway (auth, rate-limit, validation)
                │
   ┌────────────┼─────────────────────────────┐
   │ Modular monolith (NestJS)                │
   │ ┌──────┐ ┌────────┐ ┌──────┐ ┌────────┐  │
   │ │Search│ │Pricing │ │Book- │ │Tracking│  │
   │ │Rank  │ │Quotes  │ │ings  │ │Safety  │  │
   │ └──────┘ └────────┘ └──────┘ └────────┘  │
   │ ┌──────────┐ ┌─────────┐ ┌────────────┐  │
   │ │Providers │ │Payments │ │Notify/User │  │
   │ │Verify    │ │Reviews  │ │Accounts    │  │
   │ └──────────┘ └─────────┘ └────────────┘  │
   └────────────┬─────────────────────────────┘
      ┌─────────┼──────────┐
  PostgreSQL   Redis    PayPal sandbox / OSM /
  + PostGIS   (quotes,  Twilio + Postmark /
   (system    realtime) Expo Push + Better
   of record,  Auth / R2 (trial +
   local Docker) free tiers for dev)
      │
  Provider Adapter Layer ──► Ride-hailing APIs
                             Aggregators (e.g. Autocab/iCabbi-type dispatch systems)
                             Local operators (API → portal → deep-link fallback)
```

### 2.2 Core domain flows
- **Search → compare:** `SearchService` resolves journey + filters → `ProviderMatcher` (service area, hours, vehicle/accessibility capability, availability) → `PricingEngine` produces normalised quotes `{type: fixed|estimated|metered, amount/range, validUntil, fees, cancellationTerms}` → `RankingEngine` sorts cheapest-default; sponsored injected only into labelled slots (§§6, 7, 31).
- **Price protection:** quotes carry TTL; re-validate before booking; on material change → show new price, require explicit confirm, offer cheaper alternatives (§8).
- **Booking:** `BookingOrchestrator` branches direct (TaxiAG-controlled: payment via PayPal sandbox for now, TaxiAG support) vs external (handoff with provider context, responsibility banner) — §§booking steps, 40.
- **Tracking:** provider webhooks/polling → normalised `TrackingEvent` stream; explicit unavailable state (§18).
- **Verification:** provider onboarding state machine (applied → … → bookable); expired licence/insurance pauses affected listings (§§20, 22, 29).

### 2.3 Service extraction triggers (monolith → services in Phase 2)
Extract `tracking-ingestion`, `notifications`, and `provider-adapters` first when any hits: independent deploy need, divergent scaling, or team ownership split.

---

## 3. Data model (core entities, PostgreSQL)

- `users` (guest → registered; auth provider id; notification prefs; trusted contacts — Phase 2)
- `passengers` (saved family/employee profiles; accessibility needs; contact for book-for-other)
- `providers` (identity, licensing, insurance, verification status + dates, service areas as PostGIS polygons, operating hours, payment config, cancellation policy, accessibility capabilities — provider-confirmed only, §11)
- `vehicles` / `drivers` (provider-scoped; capability flags; verification)
- `journeys` (pickup/dropoff geos, stops, schedule, flight/train refs, requirements)
- `quotes` (journey, provider, vehicle class, price type, amount/range, validUntil, fees breakdown, source confidence: verified/supplied/reported/estimated/live — §39)
- `bookings` (journey, quote snapshot, route: direct|external, responsibility model, per-vehicle legs for groups, payment ref, status machine)
- `payments` / `refunds` (who-charged, PayPal refs, commission split)
- `reviews` (booking-gated; category scores; verified flag)
- `reliability_snapshots` (on-time %, cancellation %, avg delay, completed count — only published with sufficient data, §23)
- `promos` (provider-supplied codes/discounts applied transparently to final price, §26)
- `sponsored_placements` (slot, label, audit trail proving no organic-rank influence, §31)
- `notifications_log`, `safety_reports`, event stream for metrics (§41)
- `media` (Cloudflare R2 object keys: verification documents, vehicle/driver photos, receipt PDFs)

---

## 4. API surface (v1, REST + WebSocket)

- `POST /v1/search` → normalised quote list (filters: vehicle, accessibility, maxPrice, preferences)
- `GET /v1/providers/:id` (profile, reliability, verification, reviews)
- `POST /v1/quotes/:id/revalidate` (price-protection check)
- `POST /v1/bookings` (direct) / `POST /v1/handoffs` (external) — idempotency keys throughout
- `GET /v1/bookings/:id` + `WS /v1/tracking/:bookingId`
- `POST /v1/payments/confirm` (PayPal webhooks), `POST /v1/cancellations`, `POST /v1/refunds`
- `POST /v1/reviews` (verified-gated), provider onboarding endpoints (applicant portal), admin verification endpoints
- Every price payload includes `{type, displayText, validUntil, fees[], cancellationSummary, responsibility}`.

---

## 5. Provider integration strategy (the critical path)

Three tiers, in priority order — a provider must deliver a **meaningful booking path** (§28) or it doesn't list:

1. **Tier A — API integrations:** major ride-hailing + aggregators/dispatch platforms covering many local firms at once. Highest leverage; start partnerships in Phase 0.
2. **Tier B — Operator portal + lightweight API:** for local firms without APIs — manual fleet/area/capability setup, availability calendar, SMS/email booking confirmations; TaxiAG normalises into quotes.
3. **Tier C — External handoff:** deep-link/app-to-app/affiliate handoff where no booking API exists; responsibility banner mandatory; tracked as `external_handoff_rate` metric.

Each integration implements the `ProviderAdapter` interface (`getQuote`, `createBooking`, `cancel`, `getTracking`, `getCapabilities`) so tiers are interchangeable per journey.

---

## 6. Phased build plan

### Phase 0 — Foundations (target: weeks 1–6)
- [ ] Monorepo setup (`apps/mobile`, `apps/web`, `services/api`, `packages/tokens`, `packages/ui`), CI (lint/type/test/build), Docker Compose local stack (API, Postgres+PostGIS, Redis, OSRM, Mailpit).
- [ ] Design tokens + first 6 components (§1.3 items 1–3, 5, 8 + EmptyState); accessibility CI gates.
- [ ] Better Auth (guest sessions + Apple/Google/email/phone OTP), PostgreSQL+PostGIS schema v1, Redis, PayPal sandbox, OSM stack (Leaflet + Nominatim/Photon + OSRM) wired.
- [ ] Twilio trial account + Postmark test server wired (dev credits; pay-as-you-go at scale).
- [ ] `ProviderAdapter` interface + **2–3 pilot provider integrations** (at least 1 Tier A) in 1–2 UK pilot cities.
- [ ] Analytics event taxonomy covering PRD §41 metrics; error/observability stack (Sentry free tier, logs, dashboards).
- **Exit:** searchable pilot journeys returning real multi-provider quotes in staging; design system v1 published.

### Phase 1 — MVP (target: months 3–7; PRD §43 scope)
Workstreams (parallel, each with PRD-mapped acceptance criteria):
1. **Search & compare** — ride-now + scheduled, passenger count, return/airport/station/multi-stop, max-price + preference filters; cheapest-default ranking with sponsored separation.
2. **Pricing integrity** — fixed/estimated/metered badges, quote TTL, pre-booking revalidation + material-change confirm + cheaper-alternative search (§§7–9).
3. **Provider trust** — verification display, reliability stats (data-gated), verified-only reviews, provider profiles (§§20, 23, 24).
4. **Booking & payment** — guest checkout, book-for-other, direct vs external routes with responsibility banners, PayPal sandbox (cards via PayPal; cash marked where provider-supported), receipts (§§15, 16, 40).
5. **Tracking & safety MVP** — live tracking where available + explicit unavailable state; driver/vehicle ID; safety reporting (§§18, 38).
6. **Cancellation/refunds** — pre-booking terms display; unified TaxiAG-controlled flow; provider-rules explainer for external (§17).
7. **Provider onboarding portal** — application → verification → service-area/pricing/cancellation setup → bookable (§29); admin queue for licence/insurance checks.
8. **Notifications v1** — confirmation, price-change, driver assignment/approach/arrival, completion, payment/refund (§19).
- **Exit (MVP launch, 1–3 cities):** full compare→book→track→receipt loop with ≥2 providers per search in coverage zones; price-type labelling 100%; no fake tracking; metrics dashboard live.

### Phase 2 — Accounts, groups & travel depth (PRD §44)
- Family accounts (saved passengers, shared history) + business accounts (employees, bookers, central billing, policies).
- Multi-vehicle group bookings (one group ref, per-vehicle driver/ETA/price/cancel).
- Flight/train integration (monitoring + pickup adaptation), journey sharing + trusted contacts, expanded safety tooling.
- Provider analytics dashboard; expanded accessibility capabilities; additional UK languages (i18n infra from Phase 0 pays off here).
- Extract first microservices (tracking-ingestion, notifications) per §2.3 triggers.
- **Exit:** repeat-booking + business-account metrics moving (§41 customer metrics); group/airport journeys live.

### Phase 3 — Network scale (PRD §45)
- Broader/local operator coverage (Tier B portal at scale, self-serve onboarding), deeper real-time availability, journey coordination, corporate travel tools, adjacent transport categories only if comparison-consistent.
- **Exit:** multi-city coverage with multi-provider density per search (§41 comparison metrics); unit-economics review (commission vs subscription mix, §30).

### Explicitly out of scope until post-Phase-3 (PRD §46)
Loyalty points/cashback, generic price-drop alerts, opaque provider scores, hidden sponsored ranking, predictive personalisation, unverified listings, street-hail-as-booking, forced accounts.

---

## 7. Cross-cutting concerns

- **Security & compliance (UK):** UK GDPR (consent, retention, DSAR, data-minimisation — location data is sensitive); PCI via PayPal hosted checkout (never touch PANs); safeguarding flows for safety reports; licensing-data handling with providers; pen-test before MVP launch; dependency/SAST scanning in CI.
- **Testing:** unit (pricing/ranking engines — property-based tests: ranking never influenced by commercial fields), contract tests per `ProviderAdapter`, E2E (Playwright/Detox) for search→book→cancel, accessibility audits, chaos/fallback drills for provider outages (graceful Tier-C degradation).
- **DevOps:** staging mirrors prod; feature flags; quote/config remotely tunable (TTL windows, material-change threshold); blue-green deploys; backup/PITR for Postgres.
- **Analytics (PRD §41):** funnels (search → compare → book → complete), price-change frequency/magnitude, reliability aggregates, safety-report rates; weekly product review ritual.

---

## 8. Team & indicative timeline

- **Phase 0–MVP:** 1 PM/founder, 1 designer, 3–4 engineers (full-stack TS), 1 QA/a11y, 0.5 DevOps; partnerships lead for provider Tier-A deals (critical path).
- **Indicative:** Phase 0 ~6 wks; MVP ~4–5 mo after; Phase 2 ~3–4 mo; Phase 3 continuous. Estimates assume pilot provider APIs secured in Phase 0 — **provider access is the #1 schedule risk** (see below).

## 9. Top risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Local firms lack booking APIs | Thin comparison; MVP fails "every realistic option" | Lead with aggregator partnerships; Tier B portal + Tier C handoff so coverage precedes depth |
| Price/availability staleness | Trust damage (core promise) | Quote TTLs + revalidation + explicit estimated/metered labelling; never display stale as fixed |
| Verification ops bottleneck | Unverified supply or launch delay | Self-serve onboarding + admin queue + expiry-pause automation (§22) |
| Sponsored/commercial pressure | Comparison integrity loss | Hard separation in code (ranking function takes no commercial inputs) + audit log + labelled UI |
| Unit economics (commission resistance) | Revenue shortfall | Validate provider willingness-to-pay in Phase 0 pilots; subscriptions as second lever (§30) |
| Safety incident handling | Reputational/regulatory | Safety toolkit + escalation paths for both booking routes from MVP (§§25, 38) |

---

## 10. Immediate next actions
1. Approve tech-stack decisions (§0) or record alternatives.
2. Sign 1–2 pilot provider/aggregator LOIs (unblocks Phase 0 integration work).
3. Stand up repo scaffolding per Phase 0 + Figma project from §1 component list.
4. Define pilot cities + coverage success thresholds (e.g. ≥2 bookable providers on ≥80% of test searches).
