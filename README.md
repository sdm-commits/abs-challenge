# ABS Challenge Engine

A decision-support tool for ball-strike challenge decisions under MLB's Automated Ball-Strike (ABS) system, and a trainer for making them in two seconds.

**[Live App →](https://abs-challenge.vercel.app/)**

Built by [Scott Middlecamp](https://x.com/sdmiddlecamp). Cost model after [Tango](https://tangotiger.com/index.php/site/article/probably-right-valuation-for-abs-challenge-skill-is-jt-the-best-or-worst-in-the-league).

## What It Does

Under ABS, a player has about two seconds to decide whether to challenge a called pitch, with no outside help. This tool turns that into two numbers: how much the call is worth, and how sure you need to be.

The core model:

```
benefit   = |RE(corrected call) − RE(call as made)|  (RE288, 2026)
cost      = 0.001 R × outs remaining              (two challenges in hand)
          = 0.003 R × outs remaining              (one challenge in hand)

Break-even = cost / (benefit + cost)
CHALLENGE when P(the call was wrong) ≥ break-even
```

A lost challenge does not cost a run. It costs the option value of the challenges you can no longer make, which shrinks with every out. Measured on every 2026 game, that is about 0.001 runs per out remaining while holding two and 0.003 while holding the last one, the values Tango arrived at independently. So the bar is a suspicion, not a certainty: with two in hand, a 0.20-run call needs a 21% chance the umpire was wrong in the 1st inning and 3% in the 9th.

## Why Outs Matter and Score Doesn't

The cost falls with outs remaining, so the same call gets cheaper to challenge every inning. Holding your last challenge triples it. Those two things move the threshold further than the count does.

Score is deliberately left out. The engine values calls in runs (RE288), not win probability, which matches Tango's framing: challenge decisions are about converting the umpire's misses, and the run value of a miss does not depend on who is ahead.

## Probably-Right Valuation

The engine follows Tango's [Probably-Right valuation](https://tangotiger.com/index.php/site/article/probably-right-valuation-for-abs-challenge-skill-is-jt-the-best-or-worst-in-the-league), the method behind Baseball Savant's ABS challenge leaderboard. It has two halves: when to fire, and how to score the challenges a player made.

**When to fire.** A challenge is worth making when the expected gain beats the expected loss:

```
P(wrong) × value of the call  ≥  (1 − P(wrong)) × cost of a lost challenge
```

That is the break-even above. The value of the call is the full swing between the two outcomes, ball versus strike, from the same pre-pitch state. Measuring it from the pre-pitch count instead gives about half. The cost is the option value of the challenge you give up, not a fixed run charge. The earlier convention of a flat ~0.2 R per lost challenge made the bar look like near-certainty; with the outs-aware cost it is closer to "fire if you think it was wrong."

**How to score.** A player is credited against an average challenger on the same pitches:

```
missed call    stake × (overturned − P(average challenger overturns it))
correct call   cost  × (P(average challenger loses it) − lost)

runs above average = Σ over every call the player could have challenged
                   = (runs won on overturns − cost of lost challenges)
                   − (the same two totals expected from an average challenger)
```

Leaving a missed call alone costs the share of it an average challenger would have won back. Firing at a correct call costs only the outs-aware price of the lost challenge, less what an average challenger would have lost there.

**Matching Savant.** The RE288 in the app is the table Savant's leaderboard uses. It was recovered exactly: the leaderboard's per-player runs gained, set against the overturned pitches behind each row, pin 263 of the 288 call values. Tango's published RE288 rule (each count a fixed share of the walk or strikeout value, on top of RE24) reproduces all 263 to five decimals and fills the rest. The cost per lost challenge (0.001 / 0.003 R per out remaining, every extra inning priced like the 9th) reproduces Savant's `runs_cost` exactly for every catcher and every club. That takes dropping one challenge that sits in Savant's raw flags but not on its leaderboard (Tyler Soderstrom, May 30 vs NYY: the strike stood though the pitch tracked 0.77 in. outside, the only failed hitter challenge tracked as a ball). On the catcher side Savant leaves out pitcher-initiated challenges; with that, the per-pitch rebuild matches Savant's challenges, overturns and failed challenges for every catcher and club exactly.

The **Zones** tab shows Savant's own leaderboard numbers for each catcher and club (missed calls, overturns, challenges, runs above average). Savant publishes no split by location, so the heatmap, ring and runs by edge come from the per-pitch rebuild, with each of the four Probably-Right terms (runs won, lost-challenge cost, and their average-challenger expectations) scaled to that player's Savant totals. The location split therefore always sums to Savant's runs above average.

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

**RE288 Matrix** — All 288 run-expectancy states (12 counts × 8 base states × 3 outs) in three views: run expectancy, run values relative to 0-0 in each base-out state, and the call value (ball minus strike, the runs riding on the call) including ball four and strike three.

**Thresholds** — The break-even for every count and base state from the cost model, with inning, half, outs and challenges left as controls.

**Zones** — Where each catcher (40+ games) and each club's hitters (RHB / LHB) leave and challenge missed calls: a KDE heatmap against the league and a ring of share challenged by edge and distance from the line. Headline numbers are Baseball Savant's ABS leaderboard figures; the location split is scaled to sum to Savant's runs above average.

**Methodology** — The decision framework, the cost model, the zone model, the matchup math, data sources, and limitations.

## The Model

| Factor | Description |
|---|---|
| **ΔRE** | Run-expectancy difference between the corrected call and the call as made, both from the pre-pitch state, including terminal K/BB state changes. RE288 is the table behind Baseball Savant's 2026 ABS challenge leaderboard (Tango's), recovered exactly from the leaderboard's published call values. |
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
- **Extra innings**: the extra challenge is modeled as a floor of one from the 10th on, an assumption rather than a parsed rule. Outs remaining treats each extra inning like the 9th, as Savant does.
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

Single-file React application (`src/App.jsx`) with small data files beside it: the 2026 RE288 behind Savant's ABS leaderboard, the Savant-calibrated challenge-probability model, and a per-zone table of 2026 challenge outcomes. The Zones tab loads per-catcher and per-club JSON from `public/zones` on demand. No dependencies beyond React.

- React hooks for state
- [MLB Stats API](https://statsapi.mlb.com/api/v1) for live game data, play-by-play, and player stats
- [Baseball Savant](https://baseballsavant.mlb.com) for season xwOBA, through the serverless function
- Trackman V3 / Statcast pitch data by CSV, websocket, or coordinate paste
- Inline styles, responsive layout

## Data Attribution

Run expectancy: RE288 is the table Baseball Savant uses for its 2026 ABS challenge leaderboard, recovered from the leaderboard's published call values, following [Tango's RE288 framework](https://tangotiger.com/index.php/site/comments/re288-run-expectancy-by-the-24-base-out-states-x-12-plate-count-states-recu).

Challenge cost, the break-even and the runs-above-average scoring: [Tango, "Probably-Right Valuation for ABS Challenge Skill"](https://tangotiger.com/index.php/site/article/probably-right-valuation-for-abs-challenge-skill-is-jt-the-best-or-worst-in-the-league) (Aug 2026). The engine replaced the flat thresholds of [Tango's Feb 2025 cost/benefit table](https://tangotiger.com/index.php/site/article/cost-benefit-analysis-of-making-an-abs-challenge).

Reasonable-pitch and challenge-opportunity definitions: [Baseball Savant ABS metrics documentation](https://baseballsavant.mlb.com/abs-metrics-documentation). Zones headline numbers: the [Baseball Savant ABS challenge leaderboard](https://baseballsavant.mlb.com/leaderboard/abs-challenges), 2026 regular season. RE288 rule: [Tango, "Introducing RE288, by venue+season"](https://tangotiger.com/index.php/site/article/introducing-re288-by-venueseason).

Methodology follows Tango, Lichtman & Dolphin, [*The Book: Playing the Percentages in Baseball*](https://www.amazon.com/Book-Playing-Percentages-Baseball/dp/1597971294).

xwOBA from [Baseball Savant](https://baseballsavant.mlb.com). Live game data from the [MLB Stats API](https://statsapi.mlb.com); use of MLB data is subject to the [MLB copyright notice](http://gdx.mlb.com/components/copyright.txt).

## License

MIT
