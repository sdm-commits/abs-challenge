# ABS Challenge Engine

A decision-support tool for optimizing ball-strike challenge decisions under MLB's Automated Ball-Strike (ABS) system. Built for front office analysts, coaching staffs, and player development.

**[Live App →](https://abs-challenge.vercel.app/)**

## What It Does

Under ABS, players have roughly two seconds to decide whether to challenge an umpire's call — with no outside help. This tool quantifies that decision using count-level run expectancy and [Tom Tango's break-even confidence thresholds](https://tangotiger.com/index.php/site/article/cost-benefit-analysis-of-making-an-abs-challenge).

The core model:

```
benefit = |ΔRE| of flipping the call
cost    = ~0.20 runs (empirical, from 2025 AAA challenge data)

Break-even = cost / (benefit + cost)
CHALLENGE when your confidence ≥ break-even
```

Thresholds range from **10%** (bases loaded, 2 outs, full count — challenge on a hunch) to **88%** (bases empty, 0 outs, 0-2 count — hold unless certain).

## Why Inning & Score Don't Matter

Per [Tango's cost/benefit analysis](https://tangotiger.com/index.php/site/article/cost-benefit-analysis-of-making-an-abs-challenge), the average value of an overturned call is ~0.20 runs — and this holds remarkably flat across innings and challenge inventory (1 vs 2 remaining). Because the cost stays constant, leverage index scales both sides of the equation equally and cancels out. The challenge decision reduces to: how big is the ΔRE of this specific count flip relative to the fixed ~0.20 run cost?

## Features

**Simulator** — Set count, outs, base runners, and perspective (batting/pitching). See the break-even confidence threshold, run expectancy, and challenge recommendation for every valid transition.

**Signal Mode** — Visual green/red/yellow indicator showing whether to challenge based on zone confidence vs. break-even threshold for the current game state. Designed for training catchers and batters to internalize challenge decisions before game situations.

**Live Game Mode** — Connects to the MLB Stats API and polls the linescore every 5 seconds during live games. Auto-populates count, outs, runners, inning, and score with team abbreviations. On game selection, preloads season xwOBA for both rosters via a [Vercel serverless endpoint](#xwoba-api) and computes a **matchup multiplier** for each at-bat that adjusts ΔRE based on the current batter-pitcher pairing relative to league average.

**Trackman Integration** — Accepts pitch location data via CSV upload, coordinate paste, or websocket connection. Supports Trackman V3 native field names (`PlateLocSide`, `PlateLocHeight`, `PitchCall`), Statcast aliases (`plate_x`, `plate_z`), and shorthand — case-insensitive, first match wins. Zone confidence is calculated automatically using a Gaussian model (σ=1.0") based on pitch distance from the zone edge.

**World Series Game 7 Demo** — Walk through 8 pivotal at-bats from the LAD-TOR Game 7 with real 2025 Statcast xwOBA data, showing how challenge decisions would have played out under ABS.

**Terminal Transitions** — Models strikeouts and walks as full base-out state changes, not just count changes. Overturning a ball on an x-2 count produces a strikeout (outs +1, runners stay). Overturning a strike on a 3-x count produces a walk (batter to 1st, forced runners advance, bases-loaded walk scores a run).

**RE288 Matrix** — Interactive heatmap of all 288 run expectancy states (12 counts × 8 base states × 3 out states) with three views:
- **Run Expectancy** — Absolute expected runs from each state through end of half-inning
- **Run Values** — Marginal runs relative to the 0-0 count in each base-out state ([Tango's "second chart"](https://tangotiger.com/index.php/site/comments/re288-run-expectancy-by-the-24-base-out-states-x-12-plate-count-states-recu))
- **Count Δ** — RE shift when a ball is overturned to a strike, including terminal strikeout deltas for x-2 counts

**Threshold Matrix** — Full heatmap of Tango's break-even confidence thresholds across all count × base-out states. Blue = low bar (challenge-friendly), red = high bar (hold unless certain).

**Methodology** — Full documentation of the decision framework, data sources, Tango's cost/benefit analysis, matchup adjustment math, and known limitations.

## The Model

| Factor | Description |
|---|---|
| **ΔRE** | Run expectancy difference between the called count and corrected count, including terminal K/BB state changes |
| **Challenge Cost** | ~0.20 runs — empirical average from 2025 AAA data, flat across innings and inventory ([Tango, Feb 2025](https://tangotiger.com/index.php/site/article/cost-benefit-analysis-of-making-an-abs-challenge)) |
| **Matchup Multiplier** | xwOBA-based scaling of ΔRE for the current batter-pitcher pairing vs. league average (live and demo modes) |
| **Zone Confidence** | Gaussian probability estimate based on pitch distance from zone edge (σ=1.0"), computed from Trackman or Statcast pitch coordinates |

```
batterFactor  = batterXwOBA / leagueXwOBA
pitcherFactor = pitcherXwOBA_against / leagueXwOBA
matchupMultiplier = batterFactor × pitcherFactor    (clamped to [0.5, 2.0])
adjustedΔRE = ΔRE × matchupMultiplier

Break-even = 0.20 / (|adjustedΔRE| + 0.20)
```

A league-average matchup produces a multiplier of ~1.0×. An elite hitter facing a weak pitcher pushes ×1.3+, lowering the break-even threshold. A weak hitter vs. an ace compresses ΔRE, raising the bar.

## Zone Model

Zone confidence is calculated automatically from pitch location data:

```
zoneWidth  = (17 + 2.9) / 12    // plate width + ball diameter, in feet
distance   = pitch distance from nearest zone edge
confidence = Φ(distance / σ)     // σ = 1.0 inch
```

Strike zone boundaries use `sz_top` and `sz_bot` from Statcast when available, or configurable defaults (3.5 / 1.6 ft) for Trackman data where per-batter zone heights are not included in the CSV.

## xwOBA API

The app includes a Vercel serverless function (`/api/xwoba`) that fetches season xwOBA data from Baseball Savant for all qualified batters and pitchers:

- Fetches batter + pitcher CSVs from `baseballsavant.mlb.com` in parallel
- Parses and returns JSON: `{ season, updated, lg_xwoba, players: { [id]: { name, xwoba, pa, type } } }`
- In-memory cache with 12-hour TTL; serves stale cache if Savant is down
- Falls back to a statsapi OPS→xwOBA conversion formula for players missing from Savant data

### Known Limitations

- xwOBA uses full-season Statcast data — doesn't capture platoon splits, recent form, or pitch-type matchup edges
- Trackman V3 CSVs do not include per-batter strike zone heights or umpire identity — these must be added manually or configured in the UI
- Zone confidence model assumes Gaussian error distribution; real tracking system accuracy may vary

## Quick Start

```bash
git clone https://github.com/sdm-commits/abs-challenge-engine.git
cd abs-challenge-engine
npm install
npm run dev
```

Open `http://localhost:5173` to run locally. Live game mode and the xwOBA API work in local dev via Vite's proxy.

## Deploy

Connect this repo to [Vercel](https://vercel.com) — it auto-detects Vite and deploys with zero configuration. The `/api/xwoba` serverless function deploys automatically.

```bash
npm run build
npx vercel --prod
```

## Tech

Single-file React application (`src/App.jsx`). No external dependencies beyond React.

- React hooks for state management (`useState`, `useMemo`, `useEffect`, `useRef`)
- [MLB Stats API](https://statsapi.mlb.com/api/v1) for live game data and player stats
- [Baseball Savant](https://baseballsavant.mlb.com) for season xwOBA (via serverless API)
- Vercel serverless function for xwOBA data (`api/xwoba.js`)
- Trackman V3 / Statcast pitch data via CSV, websocket, or coordinate paste
- CSS-in-JS (inline styles, no build dependencies)
- Responsive layout with collapsible math details on mobile

## Data Attribution

RE288 values derived from [Tom Tango's recursive run expectancy model](https://tangotiger.com/index.php/site/comments/re288-run-expectancy-by-the-24-base-out-states-x-12-plate-count-states-recu), computed using 2010–2015 Retrosheet play-by-play data.

Challenge thresholds from [Tango's cost/benefit analysis of ABS challenges](https://tangotiger.com/index.php/site/article/cost-benefit-analysis-of-making-an-abs-challenge) (Feb 2025), validated against 2025 AAA challenge data.

Methodology follows Tango, Lichtman & Dolphin, [*The Book: Playing the Percentages in Baseball*](https://www.amazon.com/Book-Playing-Percentages-Baseball/dp/1597971294).

xwOBA data from [Baseball Savant](https://baseballsavant.mlb.com) (Statcast expected weighted on-base average).

Live game data from the [MLB Stats API](https://statsapi.mlb.com). Use of MLB data is subject to the [MLB copyright notice](http://gdx.mlb.com/components/copyright.txt).

## License

MIT
