# 🏆 World Cup Knockout Simulator

An interactive, production-quality bracket simulator for the FIFA World Cup
knockout stage. Predict every match from the **Round of 32** all the way to the
**Final** — pick a winner and they instantly advance, with every downstream round
recalculating automatically. Dark-mode-first, fully responsive, and built to feel
like a premium sports app.

![Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Final → Champion](#)

---

## ✨ Features

- **Full knockout bracket** — Round of 32 → R16 → QF → SF → Final → Champion.
- **Click to advance** — selecting a winner animates them into the next round.
- **Automatic recalculation** — change any earlier result and every dependent
  prediction downstream is recomputed and pruned. The bracket can never end up in
  an inconsistent state (see [Architecture](#-architecture)).
- **Animated connectors** — curved lines between rounds light up and "flow" as
  teams advance.
- **Champion celebration** — trophy, flag, glow and a confetti burst when the
  Final is decided.
- **Auto-save** — your bracket persists across refreshes (localStorage).
- **Export / Import** — download your predictions as JSON and load them back.
- **Shareable links** — encode the whole bracket into a compact URL.
- **Responsive** — desktop, tablet, and mobile (horizontal touch-scroll bracket).
- **Accessible & motion-aware** — keyboard focus states, ARIA labels, and respects
  `prefers-reduced-motion`.

---

## 🧱 Tech stack & why

| Concern | Choice | Why this over the alternatives |
| --- | --- | --- |
| Framework | **React 18 + Vite + TypeScript** | Vite gives instant HMR and a tiny, static production build that drops straight onto any static host. TS makes the bracket/domain model self-documenting and safe to refactor. |
| State | **Zustand + `persist`** | The state here is tiny (a `matchId → teamId` map). Zustand gives surgical subscriptions (a card re-renders only when *its* pick changes) without Redux/Context boilerplate, and `persist` is the auto-save with zero extra code. |
| Animation | **Framer Motion** | Declarative `layout`/`AnimatePresence` handles "team slides into the next round", the champion reveal, and toasts far more cleanly than hand-rolled CSS transitions. |
| Styling | **Tailwind CSS** | A consistent design system (spacing, color palette, glassmorphism) with no context-switching to CSS files. Dark-mode-first via design tokens in `tailwind.config.js`. |
| Confetti | **canvas-confetti** | Tiny, dependency-free, GPU-friendly. |
| Share links | **lz-string** | URL-safe compression so a full 31-match bracket fits comfortably in a hash fragment. |
| Icons | **lucide-react** | Crisp, tree-shakeable SVG icons. |
| Flags | **flagcdn.com** | High-quality CDN-hosted SVG flags — no need to bundle ~32 assets. Swappable in one file (`src/lib/flags.ts`). |

---

## 🏗 Architecture

### Single source of truth: the picks map

The **only** state we store is a map of `matchId → winning teamId`:

```ts
type Picks = Record<string, string>; // e.g. { "r0m0": "ar", "r1m0": "ar" }
```

Everything else — each round's participants, the champion, the progress count —
is **derived** from that map on read by a pure function, `buildBracket(picks)`.

This is the key design decision and it makes the trickiest requirement
("changing an earlier result recalculates all later rounds and removes invalid
predictions") essentially free and impossible to get wrong:

- A match in round *r* gets its two teams from the **winners** of matches `2i` and
  `2i+1` in round *r − 1*.
- A stored pick is only honoured if the chosen team is actually one of those two
  derived participants. If an upstream change means the team is no longer present,
  the pick **silently evaporates** — and so do all picks that depended on it,
  cascading automatically with no manual tree-walking.

**Trade-off considered:** the alternative is storing a mutable bracket tree and
hand-writing the cascade ("when match X changes, find and clear the downstream
match, then *its* downstream…"). That's more code and a classic source of
state-sync bugs. Rebuilding all 31 matches on each change is microseconds of work
and is memoised by `picks` reference at the React layer, so we pay it at most once
per interaction. We trade a negligible amount of compute for **guaranteed
consistency** and dramatically simpler code.

After every mutation we also `prunePicks()` so the persisted/exported/shared state
stays clean — no orphaned entries ever leak out.

### Connector lines

Layout alignment is pure CSS: every round column is the same height and uses
`justify-around`, so a round with half as many matches places each match exactly
at the midpoint of its two feeders. The *curved lines* are drawn by an SVG overlay
(`Connectors.tsx`) that measures real card rectangles via a small DOM registry, so
they stay pixel-accurate across breakpoints. Active lines (whose source has a
winner) get a gradient + flowing-dash animation.

### Data flow

```
 src/data (teams, fixtures)  ──►  lib/bracketEngine.buildBracket(picks)  ──►  Match[][]
            ▲                                   ▲                                 │
            │                                   │                                 ▼
   edit to change teams              store/bracketStore (Zustand)          React components
   (no logic changes)                  picks + persist (auto-save)        (Bracket, Round, MatchCard…)
```

---

## 📁 Project structure

```
src/
├── data/                  # ← all team/tournament data lives here (swappable)
│   ├── teams.ts           #   teams, flags, FIFA rankings
│   └── fixtures.ts        #   the 16 Round-of-32 matchups + round metadata
├── types/index.ts         # framework-agnostic domain types
├── lib/
│   ├── bracketEngine.ts   # pure bracket derivation, pruning, pick application
│   ├── serialization.ts   # export / import / share-link encoding (lz-string)
│   └── flags.ts           # flag URL builder (swap the CDN here)
├── store/
│   ├── bracketStore.ts    # Zustand store (picks + persist) + derived hooks
│   └── toastStore.ts      # transient notifications
├── context/
│   └── MatchRegistry.tsx  # DOM registry so connectors can measure cards
├── hooks/
│   └── useConfetti.ts     # champion celebration
├── components/
│   ├── Bracket.tsx        # scrollable bracket + trophy node
│   ├── Round.tsx          # one round column
│   ├── MatchCard.tsx      # a single match (two TeamRows)
│   ├── TeamRow.tsx        # one selectable team
│   ├── Connectors.tsx     # animated SVG connector overlay
│   ├── Flag.tsx           # country flag
│   ├── ChampionBanner.tsx # big celebration section
│   ├── Header.tsx         # app bar + progress + controls
│   ├── Controls.tsx       # reset / export / import / share
│   └── Toasts.tsx         # toast stack
├── App.tsx                # composition + share-link hydration
└── main.tsx               # entry
```

---

## 🚀 Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build locally
```

Requires Node 18+.

---

## 🌍 Deploying

The build output (`dist/`) is fully static — no server required. Share links use
the URL **hash** (`#p=...`), so there's no SPA routing to configure — the same
single `index.html` handles every link out of the box. The same `dist/` deploys
cleanly to Netlify, Vercel, GitHub Pages, or any static host.

There are two ways to ship to Cloudflare Pages:

### Option A — GitHub Actions (included)

This repo ships a workflow at `.github/workflows/deploy.yml` that builds on every
push to `main` and deploys via `wrangler`. The deploy step **skips gracefully**
(CI stays green) until you add two repository secrets, so nothing fails before
it's wired up. One-time setup:

1. **Create a Cloudflare API token** — Cloudflare dashboard → *My Profile → API
   Tokens → Create Token* → use the **"Edit Cloudflare Pages"** template (or a
   custom token with the *Account → Cloudflare Pages → Edit* permission).
2. **Find your Account ID** — on any Cloudflare dashboard page (right sidebar), or
   run `npx wrangler whoami`.
3. **Add both as repo secrets** (Settings → Secrets and variables → Actions → *New
   repository secret*), or from your terminal:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN     # paste the token when prompted
   gh secret set CLOUDFLARE_ACCOUNT_ID    # paste the account id when prompted
   ```
   > Add the token via the prompt (not inline) so it never lands in shell history.

The first deploy creates the `wc-knockout-simulator` Pages project automatically;
subsequent pushes update it. Trigger it by pushing to `main` or via the Actions
tab (*Run workflow*).

### Option B — Cloudflare Pages Git integration (no secrets)

Prefer zero CI maintenance and automatic per-PR preview deployments? Skip the
workflow entirely and connect the repo in the Cloudflare dashboard instead:
*Workers & Pages → Create → Pages → Connect to Git*, then set:

- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`

Cloudflare then builds and deploys on every push. (If you go this route, you can
delete `.github/workflows/deploy.yml` to avoid running both.)

---

## 🔧 Updating the data

Everything tournament-specific is isolated in `src/data/` — **no application or UI
code needs to change** to run a different tournament:

- **`teams.ts`** — add/rename teams, set `code` (the flagcdn country code) and
  `fifaRank`.
- **`fixtures.ts`** — set `ROUND_OF_32` to the 16 opening matchups as
  `[teamIdA, teamIdB]` pairs. The order also defines the bracket geometry (match
  `i` feeds match `floor(i/2)` of the next round).

> The bundled data is the **real 2026 FIFA World Cup Round of 32** — the 32 teams
> that actually advanced from the group stage, laid out in FIFA's official fixed
> bracket order, with FIFA rankings from the 1 April 2026 release.

---

## ♿ Accessibility & performance notes

- Team selections are real `<button>`s with `aria-pressed`, visible focus rings,
  and the bracket region is labelled for screen readers.
- All animations respect `prefers-reduced-motion` (globally + in the confetti).
- Components are memoised and subscribe narrowly, so selecting a winner re-renders
  only the affected cards — not the whole bracket.
- Flags are lazy-loaded SVGs from a CDN; the JS bundle is ~99 kB gzipped.

---

## 📝 License

MIT — do whatever you like.
