#!/usr/bin/env python3
"""Build the SIH 2026 idea deck for Team zypher2026 (PS 26192 - HydroSentinel).
Official SIH template chrome + boxed Electrizz-style body. All Times New Roman.
v2: Zypher crest on content slides, boxed title-page details with repo/demo links,
7 app-screen showcases, data-source logo band, research-paper figure."""
import os
from PIL import Image
from deck_engine import (render_slide_png, build_pptx,
                         NAVY, NAVY2, GOLD, GOLD_D, CREAM, PAPER, INK, GRAY,
                         LINE, SOFT, BLUE_BAR, PURPLE, GRAY_HEX, GRAY_HEX_LN)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "assets", "proc")
SIH_BULB = os.path.join(A, "sih_bulb.png")       # aspect w/h ~ 0.789
CREST = os.path.join(A, "zypher_crest.png")      # aspect w/h ~ 0.803

TEAM_NAME = "ZYPHER 2026"
TEAM_ID = "126427"
WHITE = "FFFFFF"
HDR_TXT = "3B4A54"
HDR_BLUE = "1F3864"
CREAM_T = "DCE3F0"   # light text on navy


def _aspect(path):
    with Image.open(path) as im:
        return im.width / im.height


for _n in ("sih_bulb", "crest"):
    pass
_asp = {n: _aspect(os.path.join(A, f"app_s{n}.png")) for n in range(1, 8)}
LOGO = {k: os.path.join(A, f"logo_{k}.png") for k in
        ("nasa", "isro", "imd", "gsi", "cwc", "wmo")}


def chip(x, y, w, h, text, fill=NAVY, col=WHITE, size=12.5, line=None, lw=0.0, bold=True):
    el = {"kind": "rect", "x": x, "y": y, "w": w, "h": h, "fill": fill,
          "paras": [{"t": text, "s": size, "b": bold, "col": col, "al": "c"}],
          "anchor": "c", "pad": 0.04, "fit": "shrink"}
    if line:
        el["line"] = line
        el["lw"] = lw
    return el


def sih_lockup(x, y, h):
    """SIH bulb + stacked text, size h inches tall."""
    bulb_w = h * (340.0 / 431.0)
    fs = h * 16.5
    return [
        {"kind": "img", "path": SIH_BULB, "x": x, "y": y, "w": bulb_w, "h": h},
        {"kind": "text", "x": x + bulb_w + 0.07, "y": y + h * 0.03, "w": 13.30 - (x + bulb_w + 0.07),
         "h": h, "paras": [{"t": "SMART INDIA", "s": fs, "b": True, "col": HDR_TXT, "sa": 0, "ls": 1.02},
                            {"t": "HACKATHON", "s": fs, "b": True, "col": HDR_TXT, "sa": 0, "ls": 1.02},
                            {"t": "2026", "s": fs, "b": True, "col": HDR_TXT, "ls": 1.02}],
         "anchor": "t", "pad": 0.0},
    ]


def phone_png(n, x, y, h, border=NAVY):
    """An app-screen cutout (transparent bg) at given height."""
    w = h * _asp[n]
    return {"kind": "img", "path": os.path.join(A, f"app_s{n}.png"),
            "x": x, "y": y, "w": w, "h": h}


def chrome(title, page):
    """Standard content-slide furniture from the official SIH template (+ Zypher crest)."""
    ch, cw = 0.70, 0.70 * _aspect(CREST)
    els = [
        {"kind": "img", "path": CREST, "x": 0.22, "y": 0.17, "w": cw, "h": ch},
        {"kind": "oval", "x": 0.96, "y": 0.17, "w": 1.62, "h": 0.82, "fill": None,
         "line": PURPLE, "lw": 1.6,
         "paras": [{"t": TEAM_NAME, "s": 12.5, "b": True, "col": NAVY, "al": "c"}],
         "anchor": "c", "pad": 0.02, "fit": "shrink"},
        {"kind": "text", "x": 2.72, "y": 0.20, "w": 7.30, "h": 0.74,
         "paras": [{"t": title, "s": 23, "b": True, "col": "101010", "al": "c", "ls": 1.0}],
         "anchor": "c", "pad": 0.0, "fit": "shrink"},
    ]
    els += sih_lockup(10.62, 0.10, 0.88)
    # gold underline accent below title (subtle, brand)
    els.append({"kind": "rect", "x": 5.42, "y": 0.98, "w": 2.5, "h": 0.028, "fill": GOLD})
    # official blue footer
    els.append({"kind": "rect", "x": 0, "y": 7.15, "w": 13.334, "h": 0.35, "fill": BLUE_BAR})
    els.append({"kind": "text", "x": 3.5, "y": 7.15, "w": 6.333, "h": 0.35,
                "paras": [{"t": "@SIH Idea submission- Template", "s": 10.5, "col": WHITE, "al": "c"}],
                "anchor": "c", "pad": 0.0})
    els.append({"kind": "text", "x": 12.75, "y": 7.15, "w": 0.5, "h": 0.35,
                "paras": [{"t": str(page), "s": 10.5, "col": WHITE, "al": "r"}],
                "anchor": "c", "pad": 0.0})
    return els


# ------------------------------------------------------------------- slide 1
def slide1():
    els = []
    # SIH lockup top-right (as in official template)
    els += sih_lockup(10.95, 0.06, 0.86)
    # Main heading
    els.append({"kind": "text", "x": 0.5, "y": 0.30, "w": 10.5, "h": 0.62,
                "paras": [{"t": "SMART INDIA HACKATHON 2026", "s": 33, "b": True,
                           "col": HDR_BLUE, "al": "c", "ls": 1.0}],
                "anchor": "c", "pad": 0.0})
    els.append({"kind": "text", "x": 4.0, "y": 1.02, "w": 5.33, "h": 0.44,
                "paras": [{"t": "TITLE PAGE", "s": 22, "b": True, "col": "101010", "al": "c"}],
                "anchor": "c", "pad": 0.0})
    # Project wordmark
    els.append({"kind": "text", "x": 3.0, "y": 1.55, "w": 7.33, "h": 0.46,
                "paras": [{"runs": [("Hydro", {"s": 27, "b": True, "col": NAVY}),
                                    ("Sentinel", {"s": 27, "b": True, "col": GOLD_D})], "al": "c"}],
                "anchor": "c", "pad": 0.0})
    els.append({"kind": "rect", "x": 5.42, "y": 2.06, "w": 2.5, "h": 0.028, "fill": GOLD})
    els.append({"kind": "text", "x": 1.6, "y": 2.14, "w": 10.13, "h": 0.32,
                "paras": [{"t": "Hyper-Local Flash Flood & Landslide Early Warning for the Indian Himalayas",
                           "s": 13, "i": True, "col": GRAY, "al": "c"}], "anchor": "c", "pad": 0.0})

    # ---- details box (white card + gold spine, sits left of the hexagons
    #      and never touches them or the SIH lockup)
    els.append({"kind": "rect", "x": 0.58, "y": 2.56, "w": 7.10, "h": 4.06, "fill": PAPER,
                "line": NAVY, "lw": 1.5})
    els.append({"kind": "rect", "x": 0.58, "y": 2.56, "w": 0.085, "h": 4.06, "fill": GOLD})
    # Left bullet details (official pointers, filled)
    def kv(k, v):
        return {"runs": [(k + " ", {"b": True}), (v, {})], "bullet": True,
                "s": 13.5, "col": INK, "sa": 8, "ls": 1.04}
    els.append({"kind": "text", "x": 0.90, "y": 2.72, "w": 6.62, "h": 2.78,
                "paras": [kv("Problem Statement ID –", "26192"),
                          kv("Problem Statement Title –",
                             "Flash Flood Prediction System for Hilly Regions using Multi-Source Data"),
                          kv("Theme –", "Disaster Management"),
                          kv("PS Category –", "Software"),
                          kv("Team ID –", TEAM_ID),
                          kv("Team Name (Registered on portal) –", "zypher2026")],
                "anchor": "t", "pad": 0.0})
    # divider
    els.append({"kind": "rect", "x": 0.90, "y": 5.56, "w": 6.45, "h": 0.016, "fill": LINE})
    # repository + demo links
    els.append({"kind": "rect", "x": 0.90, "y": 5.72, "w": 3.10, "h": 0.72, "fill": CREAM,
                "line": NAVY, "lw": 1.0,
                "paras": [{"t": "GitHub Repository", "s": 10, "b": True, "col": NAVY, "al": "c",
                           "sa": 2, "ls": 1.0},
                          {"t": "github.com/nandhish3004/Oramet", "s": 8.8, "col": HDR_BLUE,
                           "al": "c", "ls": 1.0}],
                "anchor": "c", "pad": 0.04, "fit": "shrink"})
    els.append({"kind": "rect", "x": 4.16, "y": 5.72, "w": 3.19, "h": 0.72, "fill": CREAM,
                "line": NAVY, "lw": 1.0,
                "paras": [{"t": "Demo Video (YouTube)", "s": 10, "b": True, "col": NAVY, "al": "c",
                           "sa": 2, "ls": 1.0},
                          {"t": "youtube.com – link embedded in final PDF",
                           "s": 8.8, "col": GRAY, "al": "c", "ls": 1.0}],
                "anchor": "c", "pad": 0.04, "fit": "shrink"})

    # ---- hexagon cluster (kept exactly in the template's place, right side)
    els.append({"kind": "hex", "x": 8.55, "y": 2.55, "w": 4.05, "h": 3.75, "fill": GRAY_HEX,
                "line": GRAY_HEX_LN, "lw": 1})
    els.append({"kind": "hex", "x": 11.75, "y": 1.75, "w": 1.45, "h": 1.35, "fill": GRAY_HEX,
                "line": GRAY_HEX_LN, "lw": 1})
    els.append({"kind": "hex", "x": 7.75, "y": 5.05, "w": 1.50, "h": 1.40, "fill": GRAY_HEX,
                "line": GRAY_HEX_LN, "lw": 1})
    # SIH bulb centred on main hexagon
    bw = 2.30
    bh = bw / (340.0 / 431.0)
    els.append({"kind": "img", "path": SIH_BULB, "x": 10.575 - bw / 2, "y": 4.425 - bh / 2,
                "w": bw, "h": bh})
    # Bottom brand band
    els.append({"kind": "rect", "x": 0, "y": 6.72, "w": 13.334, "h": 0.78, "fill": NAVY})
    els.append({"kind": "rect", "x": 0, "y": 6.72, "w": 13.334, "h": 0.030, "fill": GOLD})
    els.append({"kind": "img", "path": CREST, "x": 0.50, "y": 6.80, "w": 0.51, "h": 0.635})
    els.append({"kind": "text", "x": 1.16, "y": 6.72, "w": 5.6, "h": 0.78,
                "paras": [{"runs": [("Team zypher2026", {"s": 14, "b": True, "col": WHITE}),
                                    ("   •   Team ID " + TEAM_ID, {"s": 12.5, "col": CREAM_T})], "al": "l"}],
                "anchor": "c", "pad": 0.0})
    els.append({"kind": "text", "x": 6.7, "y": 6.72, "w": 6.3, "h": 0.78,
                "paras": [{"t": "Ministry of Home Affairs  |  NDRF – DM Division  •  PS 26192  •  SIH 2026",
                           "s": 11, "col": CREAM_T, "al": "r"}], "anchor": "c", "pad": 0.0})
    return els


# ------------------------------------------------------------------- slide 2
def slide2():
    els = chrome("PROPOSED SOLUTION", 2)
    # ---------------- left column: the problem
    els.append(chip(0.42, 1.18, 6.42, 0.34, "THE PROBLEM — WHY MINUTES DECIDE LIVES"))
    els.append({"kind": "rect", "x": 0.42, "y": 1.52, "w": 6.42, "h": 2.06, "fill": PAPER,
                "line": NAVY, "lw": 1.25,
                "paras": [
                    {"t": "Cloudbursts over steep Himalayan catchments turn into destructive flash "
                          "floods with barely minutes of warning — Kedarnath 2013, Chamoli 2021, Dharali 2025.",
                     "s": 11, "bullet": True, "al": "j", "sa": 6, "col": INK},
                    {"t": "Today's forecasts stop at district / river-basin scale; nobody tells a ward "
                          "when the water will actually reach it.", "s": 11, "bullet": True, "al": "j",
                     "sa": 6, "col": INK},
                    {"t": "Intense rain on saturated slopes steeper than 30° also triggers companion "
                          "landslides — which single-hazard systems ignore.", "s": 11, "bullet": True,
                     "al": "j", "sa": 6, "col": INK},
                    {"t": "Valley networks fail precisely during disasters, so internet-only alerts "
                          "never arrive.", "s": 11, "bullet": True, "al": "j", "sa": 0, "col": INK}],
                "anchor": "t", "pad": 0.09, "fit": "shrink"})
    els.append({"kind": "img", "path": os.path.join(A, "flood_dharali.jpg"),
                "x": 0.42, "y": 3.72, "w": 2.86, "h": 2.10, "border": NAVY, "lw": 1.25})
    els.append({"kind": "rect", "x": 0.42, "y": 5.84, "w": 2.86, "h": 0.34, "fill": SOFT, "line": LINE, "lw": 0.75,
                "paras": [{"t": "Dharali (Uttarkashi), Aug 2025 — flash-flood rescue  |  Source: PTI / Down To Earth",
                           "s": 8.5, "i": True, "col": GRAY, "al": "c"}], "anchor": "c", "pad": 0.03,
                "fit": "shrink"})
    # mini comparison
    els.append(chip(3.40, 3.72, 3.44, 0.30, "EXISTING SYSTEMS  vs  HYDROSENTINEL", fill=GOLD, col=NAVY, size=10.5))
    heads = [("EXISTING EWS", NAVY2), ("ZYPHER WAY", NAVY)]
    for i, (t, c) in enumerate(heads):
        els.append({"kind": "rect", "x": 3.40 + i * 1.72, "y": 4.06, "w": 1.72, "h": 0.40, "fill": c,
                    "paras": [{"t": t, "s": 9.5, "b": True, "col": WHITE, "al": "c"}], "anchor": "c", "pad": 0.02})
    rows = [("Basin-wide forecasts, hours late", "Ward-level minutes-to-crest countdown"),
            ("Internet-only alerts; die in storms", "Offline SMS-112 + 3.5 kHz beacon"),
            ("Flood-only hazard view", "Flood + landslide fused score")]
    for r, (l, rr) in enumerate(rows):
        y = 4.46 + r * 0.57
        fill = CREAM if r % 2 == 0 else PAPER
        els.append({"kind": "rect", "x": 3.40, "y": y, "w": 1.72, "h": 0.57, "fill": fill, "line": LINE, "lw": 0.75,
                    "paras": [{"t": l, "s": 9, "col": GRAY, "al": "c"}], "anchor": "c", "pad": 0.04, "fit": "shrink"})
        els.append({"kind": "rect", "x": 5.12, "y": y, "w": 1.72, "h": 0.57, "fill": fill, "line": NAVY, "lw": 1.0,
                    "paras": [{"t": rr, "s": 9, "b": True, "col": NAVY, "al": "c"}], "anchor": "c", "pad": 0.04,
                    "fit": "shrink"})
    # ---------------- right column: the solution
    els.append(chip(7.00, 1.18, 5.90, 0.34, "OUR SOLUTION — HYDROSENTINEL"))
    els.append({"kind": "rect", "x": 7.00, "y": 1.52, "w": 5.90, "h": 1.44, "fill": PAPER,
                "line": NAVY, "lw": 1.25,
                "paras": [{"t": "An offline-first mobile disaster-intelligence app that fuses live IMD rainfall, "
                               "NASA SMAP / ISRO soil moisture, GSI slope models and CWC river gauges into a "
                               "hyper-local minutes-to-flood countdown for every ward — then routes citizens to "
                               "high ground and escalates SOS over SMS-112 even when networks are down.",
                           "s": 11, "al": "j", "col": INK}], "anchor": "t", "pad": 0.09, "fit": "shrink"})
    els.append(chip(7.00, 3.02, 5.90, 0.30, "APP FEATURES — WHAT NO EXISTING SYSTEM OFFERS",
                    fill=GOLD, col=NAVY, size=11))
    novelty = [
        ("Hyper-local countdown", "minutes-to-crest computed per ward from lag-time runoff math."),
        ("Dual-hazard fusion score", "rainfall runoff × slope Factor-of-Safety → one 0–100 ward risk."),
        ("Zero-network survivability", "offline cache, native SMS-112 SOS with live GPS pin."),
        ("3-shake accelerometer SOS", "CAP-v1.2 beacon to 112 + family — hands-free, in any weather."),
        ("3.5 kHz rescue siren", "pulsed acoustic beacon tuned to guide NDRF parties & K-9 units."),
        ("Zero-text dialect UI", "Garhwali / Kumaoni / Himachali icons + TTS voice alerts."),
        ("3D escape routing", "contour-aware walk paths to surveyed ridge shelters — 18 min max."),
    ]
    for i, (t, d) in enumerate(novelty):
        y = 3.40 + i * 0.52
        els.append({"kind": "oval", "x": 7.00, "y": y + 0.055, "w": 0.32, "h": 0.32, "fill": GOLD,
                    "line": NAVY, "lw": 1.0,
                    "paras": [{"t": str(i + 1), "s": 12, "b": True, "col": NAVY, "al": "c"}],
                    "anchor": "c", "pad": 0.0})
        els.append({"kind": "rect", "x": 7.42, "y": y, "w": 5.48, "h": 0.46, "fill": CREAM,
                    "line": NAVY, "lw": 1.0,
                    "paras": [{"runs": [(t + " — ", {"s": 10, "b": True, "col": NAVY}),
                                        (d, {"s": 9.2, "col": INK})], "al": "l", "ls": 1.0}],
                    "anchor": "c", "pad": 0.07, "fit": "shrink"})
    return els


# ------------------------------------------------------------------- slide 3
def slide3():
    els = chrome("TECHNICAL APPROACH", 3)
    cols = [0.42, 3.56, 6.70, 9.84]
    cw = 2.98
    stages = ["1 · SENSE — LIVE FEEDS", "2 · FUSE — RISK ENGINE",
              "3 · DECIDE — ALERT LOGIC", "4 · ACT — CITIZEN RESPONSE"]
    for i, s in enumerate(stages):
        els.append(chip(cols[i], 1.22, cw, 0.40, s, size=11.5))
        if i < 3:
            els.append({"kind": "rarrow", "x": cols[i] + cw - 0.02, "y": 1.31, "w": 0.34, "h": 0.22,
                        "fill": GOLD})
    cards = [
        ["IMD Doppler radar + 1-min AWS rainfall", "NASA SMAP / GPM + ISRO Bhuvan-MOSDAC",
         "GSI Bhukosh 30 m DEM — slopes > 30°", "CWC FloodWatch hydro-post river levels"],
        ["Lag-time runoff model → minutes to crest", "Infinite-slope Factor of Safety (Fs)",
         "4-factor weighted score (40·25·20·15)", "30-yr IMD LPA baselines for departure"],
        ["Advisory ≥ 30 · High ≥ 55 · Critical ≥ 75", "Offline SQLite cache & retry queue",
         "Geo-fenced ward-level targeting", "Priority-sorted alert cards"],
        ["Ward alerts + NDRF action guidance", "Garhwali / Kumaoni dialect TTS alerts",
         "3-shake CAP-v1.2 SOS → SMS-112", "3.5 kHz K-9 beacon + 3D escape routing"],
    ]
    for c in range(4):
        els.append({"kind": "rect", "x": cols[c], "y": 1.66, "w": cw, "h": 2.52, "fill": CREAM,
                    "line": NAVY, "lw": 1.0})
        for r, t in enumerate(cards[c]):
            els.append({"kind": "rect", "x": cols[c] + 0.09, "y": 1.74 + r * 0.605, "w": cw - 0.18,
                        "h": 0.56, "fill": PAPER, "line": LINE, "lw": 0.75,
                        "paras": [{"t": t, "s": 9.2, "b": True, "col": NAVY, "al": "c", "ls": 1.0}],
                        "anchor": "c", "pad": 0.04, "fit": "shrink"})
    # ---- app showcase strip (bottom-left): 3 framed miniatures of the working app
    els.append({"kind": "rect", "x": 0.42, "y": 4.34, "w": 2.98, "h": 2.72, "fill": PAPER,
                "line": NAVY, "lw": 1.25})
    els.append({"kind": "text", "x": 0.50, "y": 4.42, "w": 2.82, "h": 0.50,
                "paras": [{"t": "INSIDE THE APP — LIVE SCREENS", "s": 9.5, "b": True, "col": NAVY,
                           "al": "c", "sa": 1, "ls": 1.0},
                          {"t": "ward dashboard · 3D escape route · 3-shake SOS",
                           "s": 8, "i": True, "col": GRAY, "al": "c", "ls": 1.0}],
                "anchor": "t", "pad": 0.0, "fit": "shrink"})
    for n, x in ((4, 0.56), (6, 1.40), (7, 2.24)):
        els.append(phone_png(n, x, 4.98, 2.00))
    els.append(chip(3.52, 4.34, 4.10, 0.32, "TECHNOLOGY STACK (OPEN-SOURCE)", fill=NAVY2, size=11))
    els.append({"kind": "rect", "x": 3.52, "y": 4.66, "w": 4.10, "h": 2.40, "fill": CREAM,
                "line": NAVY, "lw": 1.0})
    stack = ["React Native 0.74 + TypeScript", "Node.js micro-services", "SQLite offline-first DB",
             "Zustand state store", "Leaflet + OpenStreetMap", "NetInfo instant failover",
             "GPS + accelerometer", "Gradle release APK"]
    for i, t in enumerate(stack):
        x = 3.61 + (i % 2) * 2.00
        y = 4.74 + (i // 2) * 0.575
        els.append({"kind": "rect", "x": x, "y": y, "w": 1.91, "h": 0.52, "fill": PAPER,
                    "line": LINE, "lw": 0.75,
                    "paras": [{"t": t, "s": 8.6, "b": True, "col": NAVY, "al": "c", "ls": 1.0}],
                    "anchor": "c", "pad": 0.02, "fit": "shrink"})
    els.append(chip(7.78, 4.34, 5.04, 0.32, "MODELS EXECUTING ON-DEVICE", size=11))
    els.append({"kind": "rect", "x": 7.78, "y": 4.66, "w": 5.04, "h": 2.40, "fill": NAVY,
                "line": GOLD, "lw": 1.0,
                "paras": [
                    {"runs": [("Lead time (min) = 180 − Δsoil − Δslope − Δrain", {"s": 10.6, "b": True, "col": GOLD}),
                              ("  (clamped 18–240)", {"s": 8.8, "col": CREAM_T})], "sa": 7, "ls": 1.04},
                    {"runs": [("Slope Fs = 1.65 − (saturation % × 0.008)", {"s": 10.6, "b": True, "col": GOLD}),
                              ("  → Fs < 1.0 = failure", {"s": 8.8, "col": CREAM_T})], "sa": 7, "ls": 1.04},
                    {"runs": [("Score = 0.40·Rain + 0.25·Soil + 0.20·Slope + 0.15·Road",
                               {"s": 10.6, "b": True, "col": GOLD})], "sa": 8, "ls": 1.04},
                    {"t": "Fail-safe by design: a dead feed freezes at its last cached value — the "
                          "system never goes blind.", "s": 9, "i": True, "col": CREAM_T, "al": "l"}],
                "anchor": "c", "pad": 0.12, "fit": "shrink"})
    return els


# ------------------------------------------------------------------- slide 4
def slide4():
    els = chrome("FEASIBILITY AND VIABILITY", 4)
    els.append(chip(0.42, 1.18, 6.10, 0.34, "FEASIBILITY — BUILT AND WORKING TODAY"))
    els.append({"kind": "rect", "x": 0.42, "y": 1.52, "w": 6.10, "h": 2.34, "fill": PAPER,
                "line": NAVY, "lw": 1.25})
    els.append({"kind": "text", "x": 0.52, "y": 1.60, "w": 2.90, "h": 2.18,
                "paras": [
                    {"t": "Release APK compiled and running on stock Android — zero special hardware.",
                     "s": 9.8, "bullet": True, "al": "l", "sa": 6, "col": INK},
                    {"t": "Live feeds operational: IMD portal, CWC FloodWatch, NASA SMAP.",
                     "s": 9.8, "bullet": True, "al": "l", "sa": 6, "col": INK},
                    {"t": "Every feed is public — zero data cost.",
                     "s": 9.8, "bullet": True, "al": "l", "sa": 6, "col": INK},
                    {"t": "11 core modules functional — dashboard, risk engine, routing, dual SOS.",
                     "s": 9.8, "bullet": True, "al": "l", "sa": 0, "col": INK}],
                "anchor": "t", "pad": 0.02, "fit": "shrink"})
    # two working telemetry screens, right of the text
    els.append(phone_png(3, 3.52, 1.64, 2.06))
    els.append(phone_png(5, 4.60, 1.64, 2.06))
    # NASA data badge
    nasa_h = 0.30
    nasa_w = nasa_h * _aspect(LOGO["nasa"])
    els.append({"kind": "img", "path": LOGO["nasa"], "x": 5.86, "y": 1.70, "w": nasa_w, "h": nasa_h})
    els.append({"kind": "text", "x": 5.70, "y": 2.06, "w": 0.74, "h": 1.60,
                "paras": [{"t": "NASA SMAP", "s": 7.6, "b": True, "col": NAVY, "al": "c", "ls": 1.0,
                           "sa": 1},
                          {"t": "28% live root-zone soil moisture",
                           "s": 6.8, "i": True, "col": GRAY, "al": "c", "ls": 1.02}],
                "anchor": "t", "pad": 0.0, "fit": "shrink"})
    els.append(chip(6.68, 1.18, 6.24, 0.34, "VIABILITY — SCALES ACROSS THE HIMALAYAN ARC", fill=NAVY2))
    els.append({"kind": "rect", "x": 6.68, "y": 1.52, "w": 6.24, "h": 2.34, "fill": PAPER,
                "line": NAVY, "lw": 1.25,
                "paras": [
                    {"t": "Smartphone-only rollout — districts need no towers, gauges or capital hardware.",
                     "s": 10.5, "bullet": True, "al": "j", "sa": 7, "col": INK},
                    {"t": "ERSS-112 native: distress SMS rides emergency rails already operated by MHA.",
                     "s": 10.5, "bullet": True, "al": "j", "sa": 7, "col": INK},
                    {"t": "One codebase replicates along the 2,500 km Himalayan arc — J&K to Arunachal Pradesh.",
                     "s": 10.5, "bullet": True, "al": "j", "sa": 7, "col": INK},
                    {"t": "Phase 2 roadmap (honestly scoped): NDRF control-room console, responder triage "
                          "app, LoRa mesh for dead zones.", "s": 10.5, "bullet": True, "al": "j", "sa": 0,
                     "col": INK}],
                "anchor": "t", "pad": 0.09, "fit": "shrink"})
    els.append(chip(0.42, 4.00, 12.50, 0.32, "CHALLENGES  →  ENGINEERED ANSWERS", fill=GOLD, col=NAVY, size=11.5))
    els.append({"kind": "rect", "x": 0.42, "y": 4.36, "w": 4.30, "h": 0.40, "fill": NAVY,
                "paras": [{"t": "FIELD CHALLENGE", "s": 11, "b": True, "col": WHITE, "al": "c"}],
                "anchor": "c", "pad": 0.0})
    els.append({"kind": "rect", "x": 4.72, "y": 4.36, "w": 8.20, "h": 0.40, "fill": NAVY,
                "paras": [{"t": "HOW HYDROSENTINEL ANSWERS IT", "s": 11, "b": True, "col": WHITE, "al": "c"}],
                "anchor": "c", "pad": 0.0})
    rows = [
        ("Mountain networks die mid-storm",
         "Offline-first SQLite + native SMS-112 failover; telemetry queues and syncs on reconnect."),
        ("Sensor blackspots in remote valleys",
         "Satellite soil-moisture grid plus citizen crowd-reports continuously recalibrate the model."),
        ("False-alarm fatigue erodes trust",
         "Sirens only after the weighted 4-factor score crosses 30-yr LPA-adjusted thresholds."),
        ("Hands are wet, cold, shaking",
         "Shake-to-SOS accelerometer trigger and 3.5 kHz beacon — no touchscreen needed."),
    ]
    for r, (c1, c2) in enumerate(rows):
        y = 4.76 + r * 0.535
        fill = CREAM if r % 2 == 0 else PAPER
        els.append({"kind": "rect", "x": 0.42, "y": y, "w": 4.30, "h": 0.50, "fill": fill, "line": LINE, "lw": 0.75,
                    "paras": [{"t": c1, "s": 10, "b": True, "col": NAVY, "al": "l"}], "anchor": "c", "pad": 0.08,
                    "fit": "shrink"})
        els.append({"kind": "rect", "x": 4.72, "y": y, "w": 8.20, "h": 0.50, "fill": PAPER, "line": LINE, "lw": 0.75,
                    "paras": [{"t": c2, "s": 10, "col": INK, "al": "l"}], "anchor": "c", "pad": 0.08,
                    "fit": "shrink"})
    return els


# ------------------------------------------------------------------- slide 5
def slide5():
    els = chrome("IMPACT AND BENEFITS", 5)
    stats = [("30–90 min", "of actionable evacuation lead time"),
             ("Ward-level", "hyper-local alerts — not district averages"),
             ("Zero-connectivity", "offline survivability built in by design")]
    for i, (big, small) in enumerate(stats):
        x = 0.87 + i * 3.95
        els.append({"kind": "rect", "x": x, "y": 1.20, "w": 3.66, "h": 0.66, "fill": PAPER,
                    "line": GOLD, "lw": 1.5,
                    "paras": [{"t": big, "s": 14, "b": True, "col": NAVY, "al": "c", "sa": 0, "ls": 1.0},
                              {"t": small, "s": 9.3, "col": GRAY, "al": "c", "ls": 1.0}],
                    "anchor": "c", "pad": 0.02, "fit": "shrink"})
    cards = [
        ("S", "SOCIAL — Minutes Become Lives",
         "Guided high-ground routes reach elders, children and pilgrims in plain language; an SMS-first "
         "design includes basic-phone users that app-only alerts leave behind."),
        ("₹", "ECONOMIC — Cheaper Than One Rescue",
         "Prevented washouts protect roads, homes and the yatra tourism economy; a district deploys for "
         "virtually nothing beyond phones citizens already own."),
        ("E", "ENVIRONMENTAL — Gentler on Fragile Slopes",
         "Crowd-reported washouts build a living record of catchment health, and planned evacuation means "
         "less panic damage and emergency blasting on unstable terrain."),
        ("G", "GOVERNANCE — NDRF-Ready by Design",
         "Every SOS lands on ERSS-112 rails with a ±5 m GPS pin, letting responders triage by severity "
         "before a single boot moves. Officer console roadmapped."),
    ]
    pos = [(0.42, 2.00), (6.68, 2.00), (0.42, 3.52), (6.68, 3.52)]
    for (x, y), (g, t, d) in zip(pos, cards):
        els.append({"kind": "rect", "x": x, "y": y, "w": 6.24, "h": 1.42, "fill": PAPER, "line": NAVY, "lw": 1.25})
        els.append({"kind": "oval", "x": x + 0.16, "y": y + 0.40, "w": 0.62, "h": 0.62, "fill": NAVY,
                    "paras": [{"t": g, "s": 21, "b": True, "col": GOLD, "al": "c"}], "anchor": "c", "pad": 0.0})
        els.append({"kind": "text", "x": x + 0.94, "y": y + 0.11, "w": 5.16, "h": 0.30,
                    "paras": [{"t": t, "s": 12, "b": True, "col": NAVY, "al": "l"}], "anchor": "c", "pad": 0.0,
                    "fit": "shrink"})
        els.append({"kind": "text", "x": x + 0.94, "y": y + 0.42, "w": 5.16, "h": 0.94,
                    "paras": [{"t": d, "s": 10, "col": INK, "al": "j", "ls": 1.05}], "anchor": "c", "pad": 0.0,
                    "fit": "shrink"})
    photos = [("ndrf_rescue.jpg", "NDRF evacuation — earlier alerts launch boats sooner"),
              ("village.jpg", "Joshimath belt — dense homes on fragile slopes"),
              ("landslide.jpg", "Shimla corridor, 2023 — monsoon landslides cut roads in minutes")]
    for i, (img, cap) in enumerate(photos):
        x = 0.42 + i * 4.23
        els.append({"kind": "img", "path": os.path.join(A, img), "x": x, "y": 5.12, "w": 4.02, "h": 1.62,
                    "border": NAVY, "lw": 1.25})
        els.append({"kind": "rect", "x": x, "y": 6.74, "w": 4.02, "h": 0.32, "fill": SOFT, "line": LINE, "lw": 0.75,
                    "paras": [{"t": cap, "s": 8.2, "i": True, "col": GRAY, "al": "c"}], "anchor": "c",
                    "pad": 0.02, "fit": "shrink"})
    return els


# ------------------------------------------------------------------- slide 6
def slide6():
    els = chrome("RESEARCH AND REFERENCES", 6)
    els.append(chip(0.42, 1.18, 6.42, 0.34, "OFFICIAL FRAMEWORKS · DATA · STANDARDS"))
    left = [
        ("India Meteorological Department", " — real-time rainfall, station norms & % departures (mausam.imd.gov.in)"),
        ("NDMA National Guidelines", " — management of floods & landslides in hilly terrains (ndma.gov.in)"),
        ("Geological Survey of India", " — National Landslide Susceptibility Mapping & Bhukosh 30 m DEM (gsi.gov.in)"),
        ("Central Water Commission", " — flood forecasting & HFL gauge network (ffs.india-water.gov.in)"),
        ("ERSS-112, Ministry of Home Affairs", " — national emergency response & distress SMS rails (112.gov.in)"),
        ("ITU-T Recommendation X.1303", " — Common Alerting Protocol for multi-hazard warnings (itu.int)"),
    ]
    right = [
        ("NASA SMAP Mission", " — L-band root-zone soil-moisture retrievals (smap.jpl.nasa.gov)"),
        ("World Meteorological Organization", " — Early-Warnings-for-All & open public weather data (wmo.int)"),
        ("Scientific Reports (Nature Portfolio)", " — hydrological lag-time & runoff modelling in steep catchments"),
        ("Water Resources Management (Springer)", " — rainfall-induced shallow-landslide thresholds via Factor of Safety"),
        ("IEEE disaster-communications literature", " — delay-tolerant SMS warning architectures for zero-connectivity valleys"),
    ]
    def ref_paras(items, start):
        out = []
        for i, (b, n) in enumerate(items):
            out.append({"runs": [(f"{start + i}.  ", {"s": 10, "b": True, "col": GOLD_D}),
                                 (b, {"s": 10, "b": True, "col": NAVY}), (n, {"s": 9.8, "col": INK})],
                        "al": "j", "sa": 6, "ls": 1.03})
        out[-1]["sa"] = 0
        return out
    els.append({"kind": "rect", "x": 0.42, "y": 1.52, "w": 6.42, "h": 2.36, "fill": PAPER,
                "line": NAVY, "lw": 1.25, "paras": ref_paras(left, 1), "anchor": "t", "pad": 0.10,
                "fit": "shrink"})
    els.append(chip(7.00, 1.18, 5.90, 0.34, "SCIENTIFIC & ENGINEERING BASIS", fill=NAVY2))
    els.append({"kind": "rect", "x": 7.00, "y": 1.52, "w": 5.90, "h": 2.36, "fill": PAPER,
                "line": NAVY, "lw": 1.25, "paras": ref_paras(right, 7), "anchor": "t", "pad": 0.10,
                "fit": "shrink"})

    # ---------------- live data-source logo band
    els.append(chip(0.42, 3.98, 9.43, 0.30, "LIVE DATA SOURCES — OPEN FEEDS THE APP CONSUMES",
                    fill=GOLD, col=NAVY, size=10.5))
    els.append({"kind": "rect", "x": 0.42, "y": 4.28, "w": 9.43, "h": 1.04, "fill": PAPER,
                "line": NAVY, "lw": 1.0})
    sources = [("nasa", "NASA SMAP·GPM"), ("isro", "ISRO Bhuvan"), ("imd", "IMD Mausam"),
               ("gsi", "GSI Bhukosh"), ("cwc", "CWC FloodWatch"), ("wmo", "WMO PublicWX")]
    cell_w = 9.43 / 6.0
    for i, (key, cap) in enumerate(sources):
        cx = 0.42 + cell_w * (i + 0.5)
        lh = 0.60
        lw_ = lh * _aspect(LOGO[key])
        lw_ = min(lw_, cell_w - 0.42)
        els.append({"kind": "img", "path": LOGO[key], "x": cx - lw_ / 2, "y": 4.38,
                    "w": lw_, "h": lh})
        els.append({"kind": "text", "x": cx - cell_w / 2 + 0.04, "y": 5.02, "w": cell_w - 0.08,
                    "h": 0.24, "paras": [{"t": cap, "s": 7.6, "b": True, "col": NAVY, "al": "c"}],
                    "anchor": "c", "pad": 0.0, "fit": "shrink"})
    # research-paper figure (real, ScienceDirect)
    fig_path = os.path.join(A, "paper_fig.png")
    fig_w = 1.34 * _aspect(fig_path)
    els.append({"kind": "img", "path": fig_path, "x": 9.97, "y": 3.98, "w": fig_w, "h": 1.34,
                "border": NAVY, "lw": 1.0})

    # ---------------- integrity strip
    els.append({"kind": "rect", "x": 0.42, "y": 5.44, "w": 12.50, "h": 0.60, "fill": CREAM,
                "line": NAVY, "lw": 1.0})
    els.append({"kind": "text", "x": 0.54, "y": 5.44, "w": 9.16, "h": 0.60,
                "paras": [{"runs": [("Integrity note: ", {"s": 9.5, "b": True, "i": True, "col": NAVY}),
                                    ("every input is a public, government-grade source — no proprietary data, "
                                     "so evaluators can verify each feed.", {"s": 9.5, "i": True, "col": GRAY})],
                           "al": "l", "sa": 1, "ls": 1.05},
                          {"runs": [("Code: ", {"s": 9.5, "b": True, "col": NAVY}),
                                    ("github.com/nandhish3004/Oramet", {"s": 9.5, "col": HDR_BLUE}),
                                    ("     Demo: ", {"s": 9.5, "b": True, "col": NAVY}),
                                    ("YouTube (link on title page)", {"s": 9.5, "col": GRAY})], "al": "l",
                           "ls": 1.05}],
                "anchor": "c", "pad": 0.02, "fit": "shrink"})
    els.append({"kind": "text", "x": 9.90, "y": 5.44, "w": 2.90, "h": 0.60,
                "paras": [{"t": "Evidence: Himalayan study figure — monthly rainfall vs. % landslides",
                           "s": 7.2, "i": True, "col": GRAY, "al": "c", "ls": 1.03},
                          {"t": "Source: ScienceDirect (2024), Himalayan EWS research",
                           "s": 7.2, "i": True, "col": GRAY, "al": "c", "ls": 1.03}],
                "anchor": "c", "pad": 0.01, "fit": "shrink"})

    # closing band
    els.append({"kind": "rect", "x": 0, "y": 6.10, "w": 13.334, "h": 0.86, "fill": NAVY})
    els.append({"kind": "rect", "x": 0, "y": 6.10, "w": 13.334, "h": 0.030, "fill": GOLD})
    els.append({"kind": "img", "path": CREST, "x": 0.55, "y": 6.18, "w": 0.56, "h": 0.70})
    els.append({"kind": "text", "x": 1.30, "y": 6.10, "w": 6.2, "h": 0.86,
                "paras": [{"t": "HydroSentinel", "s": 17, "b": True, "col": WHITE, "sa": 1, "ls": 1.0},
                          {"t": "Predict.  Evacuate.  Survive.", "s": 10.5, "i": True, "col": GOLD, "ls": 1.0}],
                "anchor": "c", "pad": 0.0})
    els.append({"kind": "text", "x": 7.6, "y": 6.10, "w": 5.2, "h": 0.86,
                "paras": [{"t": "Team zypher2026  •  Team ID 126427", "s": 12.5, "b": True, "col": WHITE,
                           "al": "r", "sa": 1, "ls": 1.0},
                          {"t": "Smart India Hackathon 2026 — Disaster Management", "s": 9.5, "col": CREAM_T,
                           "al": "r", "ls": 1.0}], "anchor": "c", "pad": 0.0})
    return els


def main():
    slides = [slide1(), slide2(), slide3(), slide4(), slide5(), slide6()]
    out_dir = os.path.join(ROOT, "Zypher2026_SIH2026_Deck")
    os.makedirs(out_dir, exist_ok=True)
    for i, els in enumerate(slides, 1):
        render_slide_png(els, os.path.join(out_dir, f"slide{i}.png"))
        print("rendered slide", i)
    pptx_path = os.path.join(out_dir, "Zypher2026_HydroSentinel_SIH2026_Idea_Presentation.pptx")
    build_pptx(slides, pptx_path)
    print("saved", pptx_path)


if __name__ == "__main__":
    main()
