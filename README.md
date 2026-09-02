# ABS Challenge Engine

A decision-support tool for ball-strike challenge decisions under MLB's Automated Ball-Strike (ABS) system, and a trainer for making them in two seconds.

**[Live App →](https://abs-challenge.vercel.app/)**

Built by [Scott Middlecamp](https://x.com/sdmiddlecamp). Cost model after [Tango](https://tangotiger.com/index.php/site/article/probably-right-valuation-for-abs-challenge-skill-is-jt-the-best-or-worst-in-the-league).

## What It Does

Under ABS, a player has about two seconds to decide whether to challenge a called pitch, with no outside help. This tool turns that into two numbers: how much the call is worth, and how sure you need to be.

The core model:

```
benefit   = |ΔRE| of flipping the call            (RE288, 2026)
cost      = 0.001 R × outs remaining              (two challenges in hand)
          = 0.003 R × outs remaining              (one challenge in hand)

Break-even = cost / (benefit + cost)
CHALLENGE when P(the call was wrong) ≥ break-even
```

A lost challenge does not cost a run. It costs the option value of the challenges you can no longer make, which shrinks with every out. Measured on every 2026 game, that is about 0.001 runs per out remaining while holding two and 0.003 while holding the last one, the values Tango arrived at independently. So the bar is a suspicion, not a certainty: with two in hand, a 0.20-run call needs a 21% chance the umpire was wrong in the 1st inning and 3% in the 9th.

## Why Outs Matter and Score Doesn't

The cost falls with outs remaining, so the same call gets cheaper to challenge every inning. Holding your last challenge triples it. Those two things move the threshold further than the count does.

Score is deliberately left out. The engine values calls in runs (RE288), not win probability, which matches Tango's framing: challenge decisions are about converting the umpire's misses, and the run value of a miss does not depend on who is ahead.

## Features

**Simulator** — Set count, outs, base runners, inning, half, challenges in hand, and perspective (batting or pitching). See run expectancy, the break-even confidence for this state, and the recommendation for every valid transition. Plot a pitch on the zone (or feed one in) and the zone card adds:

- **Distance and confidence** from the pitch's location against the batter's ABS zone.
- **A CHALLENGE / HOLD verdict** from confidence versus break-even, or **NOT CHALLENGEABLE** when the team has no challenges left or a position player is pitching.
- **Savant's "reasonable pitch" flag**: looks missed, or within 3 inches worth at least 0.30 runs, or a pitch other players challenge 20% of the time or more, from a challenge-probability model calibrated to Baseball Savant.
- **Batter side** (RHB / LHB), taken from the feed or demo when available and settable by hand otherwise.

**Live Game Mode** — Polls the MLB Stats API: linescore every 5 seconds for count, outs, runners, inning, and score; the live feed every 10 seconds for each called pitch's coordinates and the batter's own ABS zone limits. From the feed it also reads:

- **Challenges remaining** for each team, by counting lost challenges in the play-by-play. The challenging team's count drives the cost tier automatically ("FROM FEED"). In extras a team with none left is floored at one.
- **Batter side** from the current matchup.
- **Position players pitching**, which makes the call unchallengeable.

On game selection it preloads season xwOBA for both rosters through a [Vercel serverless endpoint](#xwoba-api) and computes a matchup multiplier for each at-bat.

**Training Mode** — Timed flashcards: a game state and pitch location, two seconds to decide, then a tiered verdict.

- **Six verdict tiers**: 🎯 Perfect, 🧊 Disciplined hold, 👁 Smart but costly, 🤏 Tough hold, ⚠ Missed opportunity, ✗ Bad challenge, each with a plain-English reason.
- **Three difficulty levels**, with corner pitches at levels 2 and 3, and adaptive tightening once you are running hot.
- **Challenge budget modes**: Unlimited, 2 challenges (MLB rules), or 1.
- **Historical games**: real Statcast pitches from 2025 World Series Game 7, the 2024 AL Wild Card, Angel Hernández's worst game, and Domingo Germán's perfect game, with batter side.
- **Two ledgers**: runs banked by the challenges you made, and runs given up versus the RE-optimal decision (0.000 is a perfect round).
- **On reveal**: both sides of the overturn, the reasonable-pitch flag, a one-line break-even intuition, and a replay reel at the end.

**Signal Mode** — A green/red/yellow indicator for the current game state, for internalizing the decision before it comes up.

**Trackman Integration** — Pitch location by CSV upload, coordinate paste, or websocket. Accepts Trackman V3 field names (`PlateLocSide`, `PlateLocHeight`, `PitchCall`), Statcast aliases, and shorthand.

**World Series Game 7 Demo** — Eight pivotal called pitches from LAD–TOR Game 7 with real coordinates and 2025 xwOBA.

**Terminal Transitions** — Strikeouts and walks are full base-out state changes, not count changes. Overturning a ball on an x-2 count adds an out; overturning a strike on a 3-x count walks the batter, advances forced runners, and scores the run with the bases loaded.

**RE288 Matrix** — All 288 run-expectancy states (12 counts × 8 base states × 3 outs) in three views: run expectancy, run values relative to 0-0 in each base-out state, and the count delta of a ball-to-strike overturn including terminal deltas.

**Thresholds** — Tango's February 2025 threshold table, kept for reference. The engine no longer reads it; thresholds are computed from the cost model and run far lower.

**Methodology** — The decision framework, the cost model, the zone model, the matchup math, data sources, and limitations.

## The Model

| Factor | Description |
|---|---|
| **ΔRE** | Run-expectancy difference between the called count and the corrected count, including terminal K/BB state changes. RE288 from the 2026 regular season through the All-Star break (419,418 pitches; cells under 300 pitches shrunk toward the pooled 2024–26 shape). |
| **Challenge cost** | 0.001 R per out remaining with two challenges in hand, 0.003 with one (Tango, Aug 2026). Measured on all 2026 team-inning states: future overturn runs fall linearly with outs remaining, and a team with one challenge left collects about three-quarters of what a team with two does. |
| **Zone confidence** | P(the call was wrong) from the pitch's signed distance to the strike/ball boundary. See Zone Model. |
| **Matchup multiplier** | xwOBA-based scaling of ΔRE for the batter-pitcher pairing versus league average (live and demo modes). |

```
batterFactor  = batterXwOBA / leagueXwOBA
pitcherFactor = pitcherXwOBA_against / leagueXwOBA
matchupMultiplier = batterFactor × pitcherFactor    (clamped to [0.5, 2.0])
adjustedΔRE = ΔRE × matchupMultiplier

Break-even = cost / (|adjustedΔRE| + cost)
```

## Zone Model

A pitch is a strike when any part of the ball touches the batter's ABS zone (17 inches wide, 27% to 53.5% of the batter's height) at the middle of the plate.

```
d          = signed distance from ball center to the strike/ball line, inches (+ = outside)
confidence = Φ((d − offset) / σ)
```

Measured on 8,252 ABS-resolved 2026 pitches, public Statcast coordinates against the feed's own zone reproduce the ruling almost deterministically: it flips 0.047 inches **inside** the geometric line and is otherwise one-way. So for Hawk-Eye-sourced pitches (live, signal, demo) σ is 0.05 in with that offset, a near step function. For manual placement and Trackman σ stays 1.0 in.

Zone limits come from the feed's `strikeZoneTop` / `strikeZoneBottom` when present (in 2026 these are the batter's ABS zone), and from configurable defaults (3.5 / 1.6 ft) for Trackman CSVs without them.

## xwOBA API

A Vercel serverless function (`/api/xwoba`) fetches season xwOBA from Baseball Savant for qualified batters and pitchers:

- Fetches batter and pitcher CSVs in parallel and returns `{ season, updated, lg_xwoba, players: { [id]: { name, xwoba, pa, type } } }`
- In-memory cache with a 12-hour TTL; serves stale data if Savant is down
- Falls back to a statsapi OPS→xwOBA conversion for players missing from Savant

## Known Limitations

- **ABS outages** are not detected live; a call is treated as challengeable whenever the team has a challenge left.
- **Extra innings**: the extra challenge is modeled as a floor of one from the 10th on, an assumption rather than a parsed rule, and outs remaining floors at one.
- **Score** is not part of the value; see above.
- **Umpire tendencies** are not used. The plate umpire is known from the feed but the engine does not adjust for which edges a crew misses.
- **Matchup xwOBA** is full-season; no platoon splits, recent form, or pitch-type edges.
- **Trackman CSVs** carry no per-batter zone heights or umpire identity.

## Quick Start

```bash
git clone https://github.com/sdm-commits/abs-challenge.git
cd abs-challenge
npm install
npm run dev
```

Open `http://localhost:5173`. Live game mode and the xwOBA API work in local dev through Vite's proxy.

## Deploy

Connect the repo to [Vercel](https://vercel.com); it detects Vite and deploys with no configuration, including the `/api/xwoba` function.

```bash
npm run build
npx vercel --prod
```

## Tech

Single-file React application (`src/App.jsx`) with small data files beside it: the 2026 first-half RE288, the Savant-calibrated challenge-probability model, and a per-zone table of 2026 challenge outcomes. No dependencies beyond React.

- React hooks for state
- [MLB Stats API](https://statsapi.mlb.com/api/v1) for live game data, play-by-play, and player stats
- [Baseball Savant](https://baseballsavant.mlb.com) for season xwOBA, through the serverless function
- Trackman V3 / Statcast pitch data by CSV, websocket, or coordinate paste
- Inline styles, responsive layout

## Data Attribution

Run expectancy: RE288 computed from 2026 Statcast pitch data (regular season through the All-Star break), following [Tango's RE288 framework](https://tangotiger.com/index.php/site/comments/re288-run-expectancy-by-the-24-base-out-states-x-12-plate-count-states-recu).

Challenge cost and the valuation framing: [Tango, "Probably-Right Valuation for ABS Challenge Skill"](https://tangotiger.com/index.php/site/article/probably-right-valuation-for-abs-challenge-skill-is-jt-the-best-or-worst-in-the-league) (Aug 2026). The reference threshold table is from [Tango's cost/benefit analysis](https://tangotiger.com/index.php/site/article/cost-benefit-analysis-of-making-an-abs-challenge) (Feb 2025).

Reasonable-pitch and challenge-opportunity definitions: [Baseball Savant ABS metrics documentation](https://baseballsavant.mlb.com/abs-metrics-documentation).

Methodology follows Tango, Lichtman & Dolphin, [*The Book: Playing the Percentages in Baseball*](https://www.amazon.com/Book-Playing-Percentages-Baseball/dp/1597971294).

xwOBA from [Baseball Savant](https://baseballsavant.mlb.com). Live game data from the [MLB Stats API](https://statsapi.mlb.com); use of MLB data is subject to the [MLB copyright notice](http://gdx.mlb.com/components/copyright.txt).

## License

MIT
