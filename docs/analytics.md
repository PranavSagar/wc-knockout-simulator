# Analytics & Privacy

How this project understands its usage — at **zero cost**, privacy-first, with no
impact on app performance.

## Overview — two free tools, on purpose

The requirements split into two workloads, each served by the tool that does it
best (and keeps it free longest):

| Workload | Tool | Why |
|---|---|---|
| **Audience / traffic** (visitors, unique, geo, device, browser/OS, referrers, pages) | **Cloudflare Web Analytics** | Free & **unlimited**, cookieless, already on our host, ~zero performance cost. Offloading high-volume pageviews here keeps the product-event budget free. |
| **Product / usage** (brackets, picks, champions, upsets, durations) | **PostHog Cloud (free)** | 1M events/mo free, custom events + breakdowns + funnels + SQL, real dashboards, open-source, EU region. |

The app never imports a vendor SDK directly. Everything goes through a thin,
swappable layer in [`src/lib/analytics/`](../src/lib/analytics) — so changing or
adding a provider is a one-folder change, not an app rewrite.

## What we collect — and what we don't

- **No PII.** No names, emails, or accounts (the app has none).
- **Cookieless.** Anonymous id lives in `localStorage`, not cookies → no consent banner needed.
- **Autocapture & session recording are OFF.** Only the explicit events below are sent.
- **Do-Not-Track is respected**, and there's a one-click opt-out in the footer.
- IP is used only for coarse geolocation (country/region) and not stored raw.

## One-time setup

Analytics is **disabled until configured** — the app builds and runs fine without
any of this (events just log to the console in dev).

### 1. Cloudflare Web Analytics (traffic) — no code, no key

Cloudflare dashboard → **your Pages project → Analytics → Web Analytics → Enable**.
Cloudflare auto-injects the beacon on the deployed site. Done.

### 2. PostHog (product events)

1. Create a free project at [posthog.com](https://posthog.com) (choose the **EU**
   region for GDPR).
2. Copy the **Project API Key** (Settings → Project). It's a *publishable client
   key* — safe to ship in the built site.
3. Provide it at **build time** (Vite inlines `VITE_` vars):
   - **GitHub Actions deploy:** add repo **Variables** `VITE_POSTHOG_KEY` and
     `VITE_POSTHOG_HOST` (Settings → Secrets and variables → Actions → *Variables*).
     The workflow already passes them to the build.
   - **Cloudflare Pages Git integration:** add the same as build environment variables.

### Local dev

Copy `.env.example` → `.env.local` and set the key (or leave it blank — events
then only `console.debug` so you can verify instrumentation without sending data).

## Event catalog

The single source of truth is [`src/lib/analytics/events.ts`](../src/lib/analytics/events.ts).
All names are snake_case and stable; properties are flat for clean breakdowns.

| Event | Properties | Fires when |
|---|---|---|
| `app_loaded` | `has_shared_bracket` | each page load |
| `bracket_started` | `entry` (`fresh`/`shared`/`imported`) | first pick on an empty bracket |
| `match_predicted` | `round, match_id, winner_id, loser_id, winner_rank, loser_rank, is_upset, rank_gap` | a team is picked to win (new or changed) |
| `prediction_changed` | `round, match_id, from_team_id, to_team_id` | an existing pick is changed/cleared |
| `bracket_completed` | `champion_id, runner_up_id, finalist_ids[], semifinalist_ids[], upset_count, changes_count, duration_ms, entry` | the Final is decided |
| `bracket_reset` | `decided_before` | bracket reset |
| `predictions_exported` / `predictions_imported` / `bracket_shared` | `decided_count, completed` | the matching toolbar action |

> Locked/official results (already-played matches) are **not** user picks and emit
> no events.

## Admin dashboard recipes (PostHog + Cloudflare)

Your admin view is **PostHog's built-in dashboards** plus the Cloudflare Web
Analytics page. Build these insights once (New insight → configure → add to a
dashboard):

| Question | Where | How |
|---|---|---|
| Visitors today / unique / D-W-M | Cloudflare WA | Visits & Unique visitors, date range |
| Active right now | Cloudflare WA | Real-time view |
| Visitor countries | Cloudflare WA | Map / Countries |
| Device · browser · OS · screen | Cloudflare WA | Tech breakdowns |
| Traffic sources / referrers | Cloudflare WA | Referrers |
| Traffic over time | PostHog | Trends → `app_loaded`, line, daily |
| Brackets created / completed | PostHog | Trends → count of `bracket_started` / `bracket_completed` |
| Resets / exports / imports / shares | PostHog | Trends → count of the matching event |
| **Most-selected champion** | PostHog | Trends → `bracket_completed`, **breakdown by** `champion_id` |
| **Most popular teams** | PostHog | Trends → `match_predicted`, **breakdown by** `winner_id` |
| **Most frequent upsets** | PostHog | Trends → `match_predicted` filtered `is_upset = true`, breakdown by `match_id` (or `winner_id`) |
| Avg build time | PostHog | Trends → `bracket_completed`, **Average of** `duration_ms` |
| Avg changes per bracket | PostHog | Trends → `bracket_completed`, **Average of** `changes_count` |
| Completion funnel | PostHog | Funnel → `app_loaded` → `bracket_started` → `bracket_completed` |

**Array properties (finalists / semifinalists)** need a one-line HogQL query
(Insights → SQL), because they're lists:

```sql
SELECT arrayJoin(properties.finalist_ids) AS team, count() AS picks
FROM events
WHERE event = 'bracket_completed'
GROUP BY team
ORDER BY picks DESC
```

Swap `finalist_ids` → `semifinalist_ids` for the semifinalists board.

## Adding a new event

1. Add the name + property type to `AnalyticsEventMap` in `events.ts`.
2. Call `track('your_event', { ... })` (fully type-checked) from a hook point, or
   add a domain helper in [`tracking.ts`](../src/lib/analytics/tracking.ts) and call
   it from the store/component.
3. Build a PostHog insight for it. No schema migration, no backend change.

## Limitations of the free tier

- **PostHog free:** ~1M events/mo and ~1yr retention. We stay well under by keeping
  pageviews on Cloudflare and disabling autocapture. If exceeded, ingestion simply
  pauses — **no surprise bill**.
- **Cloudflare WA** is cookieless, so "returning visitors" and exact session
  duration are *approximate*, and it samples at very high traffic.
- Live public "community" numbers will need a small cached serverless endpoint
  (can't expose a query key in the browser) → slight staleness.

## Upgrade path (if you outgrow free)

1. Stay free longer: keep pageviews on Cloudflare; sample/prune product events.
2. Add a **Cloudflare Pages Function** (`functions/api/…`) writing to **Workers
   Analytics Engine / D1** to own raw events in parallel (still free) — this also
   powers the future **public community stats** and an in-app `/admin` page.
3. Only if truly needed: PostHog paid (cheap at small scale) or self-host PostHog.

Because every event flows through `src/lib/analytics`, each step is additive — no
rewrite. The current event model already carries everything the public-stats and
in-app-admin phases need.
