// Vercel Serverless Function: /api/xwoba
// Fetches season xwOBA for all MLB batters and pitchers from Baseball Savant
// Returns JSON keyed by MLBAM player ID
// Cached for 12 hours via Cache-Control headers

const SAVANT_URL =
  "https://baseballsavant.mlb.com/leaderboard/expected_statistics?type={TYPE}&year={YEAR}&position=&team=&min=1&csv=true";

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours in ms

async function fetchSavantCSV(type, year) {
  const url = SAVANT_URL.replace("{TYPE}", type).replace("{YEAR}", year);
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; abs-challenge-engine/1.0)",
    },
  });
  if (!res.ok) throw new Error(`Savant ${type} fetch failed: ${res.status}`);
  return res.text();
}

function parseCSV(text) {
  // Simple CSV parser — handles quoted fields
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = [];
    let cur = "";
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        vals.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] || "";
    });
    return obj;
  });
}

function parsePlayers(rows, type) {
  const players = {};
  for (const row of rows) {
    const pid =
      row.player_id || row.mlbam_id || row.batter || row.pitcher || "";
    if (!pid) continue;

    let name = row.player_name || row["last_name, first_name"] || "";
    if (name.includes(",")) {
      const parts = name.split(",", 2);
      name = `${parts[1].trim()} ${parts[0].trim()}`;
    }

    const xwoba = parseFloat(row.est_woba || row.xwoba || "0") || 0;
    const pa = parseInt(row.pa || "0", 10) || 0;

    if (xwoba > 0 && pa > 0) {
      players[String(pid)] = { name, xwoba: Math.round(xwoba * 1000) / 1000, pa, type };
    }
  }
  return players;
}

export default async function handler(req, res) {
  // Return cached if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    res.setHeader("Cache-Control", "public, s-maxage=43200, stale-while-revalidate=86400");
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cache);
  }

  try {
    const year = new Date().getFullYear();

    const [batterText, pitcherText] = await Promise.all([
      fetchSavantCSV("batter", year),
      fetchSavantCSV("pitcher", year),
    ]);

    const batterRows = parseCSV(batterText);
    const pitcherRows = parseCSV(pitcherText);

    if (batterRows.length === 0 && pitcherRows.length === 0) {
      return res.status(502).json({ error: "No data from Savant" });
    }

    const players = {
      ...parsePlayers(batterRows, "batter"),
      ...parsePlayers(pitcherRows, "pitcher"),
    };

    // Compute league average from batters with 50+ PA
    const qualified = Object.values(players).filter(
      (p) => p.type === "batter" && p.pa >= 50
    );
    const lg_xwoba =
      qualified.length > 0
        ? Math.round(
            (qualified.reduce((s, p) => s + p.xwoba, 0) / qualified.length) *
              1000
          ) / 1000
        : 0.315;

    const result = {
      season: year,
      updated: new Date().toISOString(),
      lg_xwoba,
      players,
    };

    // Cache in memory
    cache = result;
    cacheTime = Date.now();

    res.setHeader("Cache-Control", "public, s-maxage=43200, stale-while-revalidate=86400");
    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(result);
  } catch (e) {
    console.error("xwOBA fetch error:", e);

    // Return stale cache if available
    if (cache) {
      res.setHeader("X-Cache", "STALE");
      return res.status(200).json(cache);
    }

    return res.status(502).json({ error: e.message });
  }
}
