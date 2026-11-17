#!/usr/bin/env python3
"""
Render public/og.png, the 1200x630 link-preview card (Open Graph / Twitter).

The card shows the break-even confidence for a 0.10-run call in the top of each
inning, nobody out, two challenges in hand, with the same formula and cell
colours as the app's Thresholds tab (src/App.jsx: breakEven, barT, threshBg):

  outs left  = (9 - inning) * 6 + 6
  cost       = 0.001 R per out left (two challenges in hand)
  break-even = cost / (call value + cost)

Usage:
  python scripts/make-og.py        # needs: pip install playwright && playwright install chromium
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "public" / "og.png"
CALL_VALUE = 0.10      # runs
COST_PER_OUT = 0.001   # two challenges in hand
PIVOT = 25             # ramp pivot, percent
ORD = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"]


def break_even(inning):
    cost = COST_PER_OUT * ((9 - inning) * 6 + 6)
    return round(100 * cost / (CALL_VALUE + cost))


def ramp_t(v):
    return min((PIVOT - v) / PIVOT, 1) if v < PIVOT else min((v - PIVOT) / 50, 1)


def cell_bg(v):
    t = ramp_t(v)
    r, g, b = (214, 48, 49) if v >= PIVOT else (33, 102, 172)
    return "rgb(%d,%d,%d)" % tuple(round(255 - (255 - c) * t) for c in (r, g, b))


def cell(inning):
    v = break_even(inning)
    dark = ramp_t(v) > 0.7  # app flips at 0.55; white on the 8th-inning blue is too faint at card size
    return (
        f'<div class="cell" style="background:{cell_bg(v)};color:{"#fff" if dark else "#111827"}">'
        f'<div class="inn" style="color:{"rgba(255,255,255,.9)" if dark else "#374151"}">{ORD[inning - 1]}</div>'
        f'<div class="pct">{v}<span>%</span></div></div>'
    )


HTML = f"""<!doctype html><meta charset="utf-8"><style>
*{{box-sizing:border-box;margin:0}}
body{{width:1200px;height:630px;background:#fff;color:#111827;padding:54px 56px 0;
  font-family:-apple-system,'SF Pro Display','Helvetica Neue',Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased}}
.brand{{font-size:34px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#6b7280}}
h1{{font-size:98px;line-height:1.03;font-weight:800;letter-spacing:-3px;margin-top:14px}}
.cap{{font-size:35px;font-weight:600;color:#374151;margin-top:30px}}
.strip{{display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:18px}}
.cell{{height:164px;border-radius:10px;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:4px;box-shadow:inset 0 0 0 1px rgba(17,24,39,.08)}}
.inn{{font-size:31px;font-weight:600}}
.pct{{font-size:58px;font-weight:800;letter-spacing:-2px;font-variant-numeric:tabular-nums}}
.pct span{{font-size:36px;letter-spacing:0;margin-left:1px}}
</style>
<div class="brand">ABS Challenge Engine</div>
<h1>How sure do you need<br>to be to challenge?</h1>
<div class="cap">A 0.10-run call, by inning. The bar drops all game.</div>
<div class="strip">{''.join(cell(i) for i in range(1, 10))}</div>
"""

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        page.set_content(HTML)
        page.screenshot(path=str(OUT), clip={"x": 0, "y": 0, "width": 1200, "height": 630})
        browser.close()
    print("wrote", OUT, [break_even(i) for i in range(1, 10)])
