#!/usr/bin/env python3
"""
Fetch season xwOBA for all MLB batters and pitchers from Baseball Savant.
Outputs public/xwoba.json keyed by MLBAM player ID.

Usage:
  python scripts/update-xwoba.py           # defaults to current year
  python scripts/update-xwoba.py 2025      # specific season

Output format:
{
  "season": 2025,
  "updated": "2025-07-15T14:30:00Z",
  "lg_xwoba": 0.315,
  "players": {
    "592450": { "name": "Aaron Judge", "xwoba": 0.410, "pa": 387, "type": "batter" },
    "477132": { "name": "Gerrit Cole", "xwoba": 0.278, "pa": 412, "type": "pitcher" },
    ...
  }
}
"""

import csv
import io
import json
import sys
import urllib.request
from datetime import datetime, timezone

SAVANT_URL = (
    "https://baseballsavant.mlb.com/leaderboard/expected_statistics"
    "?type={type}&year={year}&position=&team=&min=1&csv=true"
)

def fetch_savant_csv(player_type: str, year: int) -> list[dict]:
    """Fetch expected statistics CSV from Baseball Savant."""
    url = SAVANT_URL.format(type=player_type, year=year)
    print(f"  Fetching {player_type}s... {url}")

    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; abs-challenge-engine/1.0)"
    })

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8-sig")  # handle BOM
    except Exception as e:
        print(f"  ⚠ Failed to fetch {player_type}s: {e}")
        return []

    reader = csv.DictReader(io.StringIO(raw))
    rows = list(reader)
    print(f"  Got {len(rows)} {player_type}s")
    return rows


def parse_players(rows: list[dict], player_type: str) -> dict:
    """Parse CSV rows into player dict keyed by MLBAM ID."""
    players = {}
    for row in rows:
        # Savant CSV columns vary slightly but typically include:
        # player_id, player_name (or last_name, first_name), pa, xwoba, etc.
        pid = row.get("player_id") or row.get("mlbam_id") or row.get("batter") or row.get("pitcher")
        if not pid:
            continue

        name = row.get("player_name") or row.get("last_name, first_name") or ""
        # Savant sometimes formats as "Last, First" — flip it
        if "," in name:
            parts = name.split(",", 1)
            name = f"{parts[1].strip()} {parts[0].strip()}"

        try:
            xwoba = float(row.get("est_woba", 0) or row.get("xwoba", 0) or 0)
        except (ValueError, TypeError):
            xwoba = 0

        try:
            pa = int(row.get("pa", 0) or 0)
        except (ValueError, TypeError):
            pa = 0

        if xwoba > 0 and pa > 0:
            players[str(pid)] = {
                "name": name,
                "xwoba": round(xwoba, 3),
                "pa": pa,
                "type": player_type,
            }

    return players


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 else datetime.now().year
    print(f"Updating xwOBA data for {year} season...\n")

    # Fetch batters and pitchers
    batter_rows = fetch_savant_csv("batter", year)
    pitcher_rows = fetch_savant_csv("pitcher", year)

    if not batter_rows and not pitcher_rows:
        print("\n✗ No data returned. Savant may be down or the season hasn't started.")
        sys.exit(1)

    # Parse
    players = {}
    players.update(parse_players(batter_rows, "batter"))
    players.update(parse_players(pitcher_rows, "pitcher"))

    # Compute league average xwOBA from batters with 50+ PA
    qualified = [p["xwoba"] for p in players.values() if p["type"] == "batter" and p["pa"] >= 50]
    lg_xwoba = round(sum(qualified) / len(qualified), 3) if qualified else 0.315

    output = {
        "season": year,
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "lg_xwoba": lg_xwoba,
        "players": players,
    }

    # Write to public/ so Vite serves it as a static asset
    out_path = "public/xwoba.json"
    with open(out_path, "w") as f:
        json.dump(output, f, separators=(",", ":"))

    size_kb = len(json.dumps(output, separators=(",", ":"))) / 1024
    n_bat = sum(1 for p in players.values() if p["type"] == "batter")
    n_pit = sum(1 for p in players.values() if p["type"] == "pitcher")

    print(f"\n✓ Wrote {out_path}")
    print(f"  {n_bat} batters, {n_pit} pitchers ({len(players)} total)")
    print(f"  League avg xwOBA: {lg_xwoba}")
    print(f"  File size: {size_kb:.1f} KB")
    print(f"  Updated: {output['updated']}")


if __name__ == "__main__":
    main()
