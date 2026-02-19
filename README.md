# ABS Challenge Engine

A decision-support tool for optimizing ball-strike challenge decisions under MLB's Automated Ball-Strike (ABS) system. Built for front office analysts and dugout strategy staff.

**[Live Demo →](https://abs-challenge.vercel.app/)**

## What It Does

When a pitch is called, a manager has seconds to decide: challenge or hold? This tool quantifies that decision using count-level run expectancy.

The core model:

```
EV(challenge) = P(success) × ΔRE − P(failure) × OptionCost
```

It computes the break-even confidence threshold for every valid challenge transition (ball→strike, strike→ball) given the current base-out state, then recommends **CHALLENGE** or **HOLD** based on the user's estimated probability of success.

## Why Inning & Score Don't Matter

Leverage index — how much a run matters for winning — scales all challenge opportunities equally. A high-leverage situation makes this challenge more valuable in win probability terms, but it also makes every future challenge opportunity more valuable by the same factor. The multiplier cancels out. The challenge decision reduces to: is this ΔRE big enough relative to the option value of saving the challenge for a potentially bigger ΔRE later? Only the base-out state determines that.

## Features

**Simulator** — Set count, outs, base runners, inning, perspective (batting/fielding), and challenge inventory. Adjust your confidence estimate and get real-time CHALLENGE/HOLD verdicts with full EV breakdowns. Math details are always visible on desktop; collapsible on mobile.

**Live Game Mode** — Connects to the MLB Stats API and polls the linescore every 5 seconds during live games. Auto-populates count, outs, runners, inning, and score. Falls back to the manual calculator when no games are in progress.

**Terminal Transitions** — Models strikeouts and walks as full base-out state changes, not just count changes. Overturning a ball on a 3-2 count produces a strikeout (outs +1, runners stay); overturning a strike on 3-2 produces a walk (batter to 1st, forced runners advance, bases-loaded walk scores a run). All x-2 and 3-x counts handle terminal outcomes correctly.

**RE288 Matrix** — Interactive heatmap of all 288 run expectancy states (12 counts × 8 base states × 3 out states) with three views:
- **Run Expectancy** — Absolute expected runs from each state through end of half-inning
- **Run Values** — Marginal runs relative to the 0-0 count in each base-out state ([Tango's "second chart"](https://tangotiger.com/index.php/site/comments/re288-run-expectancy-by-the-24-base-out-states-x-12-plate-count-states-recu))
- **Count Δ** — RE shift when a ball is overturned to a strike, including terminal strikeout deltas for x-2 counts

**Methodology** — Full documentation of the decision framework, data sources, simplifying assumptions, and production extensions.

## The Model

The decision framework weighs three factors:

| Factor | Description |
|---|---|
| **ΔRE** | Run expectancy difference between the called count and corrected count (including terminal K/BB state changes) |
| **Matchup** | OPS-based multiplier scaling ΔRE for the current batter-pitcher pairing vs. league average (live mode only) |
| **Option Value** | Opportunity cost of expending a challenge (scales with remaining innings and inventory) |
| **Confidence** | User's estimate of challenge success probability |

A challenge is recommended when the expected value is positive and confidence exceeds the break-even threshold:

```
adjustedΔRE = ΔRE × (batterOPS/lgOPS) × (pitcherOPSagainst/lgOPS)
Break-even = OptionCost / (|adjustedΔRE| + OptionCost)
```

### Known Limitations (documented in-app)

- Matchup adjustment uses full-season OPS, not platoon splits or recent form
- Option value uses linear scaling rather than Monte Carlo simulation
- Challenge success probability is manual input; production would use Hawk-Eye pitch location data relative to the ABS zone boundary
  
## Quick Start

```bash
git clone https://github.com/sdm-commits/abs-challenge-engine.git
cd abs-challenge-engine
npm install
npm run dev
```

Open `http://localhost:5173` to run locally.

## Deploy

Connect this repo to [Vercel](https://vercel.com) — it auto-detects Vite and deploys with zero configuration. Or manually:

```bash
npm run build
npx vercel --prod
```

## Tech

Single-file React application (~500 lines). No external dependencies beyond React itself.

- React hooks for state management (`useState`, `useMemo`, `useEffect`, `useRef`)
- MLB Stats API for live game data (`statsapi.mlb.com/api/v1`)
- CSS-in-JS (inline styles, no build dependencies)
- Responsive: math details always visible on desktop, collapsible on mobile

## Data Attribution

RE288 values derived from [Tom Tango's recursive run expectancy model](https://tangotiger.com/index.php/site/comments/re288-run-expectancy-by-the-24-base-out-states-x-12-plate-count-states-recu), computed using 2010–2015 Retrosheet play-by-play data. The RE288 framework and the concept of count-level run values are one of Tango's many contributions to modern sabermetrics.

Methodology follows Tango, Lichtman & Dolphin, [*The Book: Playing the Percentages in Baseball*](https://www.amazon.com/Book-Playing-Percentages-Baseball/dp/1597971294).

Live game data from the [MLB Stats API](https://statsapi.mlb.com). Use of MLB data is subject to the [MLB copyright notice](http://gdx.mlb.com/components/copyright.txt).

## License

MIT
