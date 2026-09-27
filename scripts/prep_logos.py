#!/usr/bin/env python3
"""Prep data-source logos and the research-paper figure for the deck.
White/black/red backgrounds are keyed out (flood from edges with tolerance),
then alpha-trimmed. Outputs land in assets/proc/."""
import os
import numpy as np
from PIL import Image
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'image-search')
OUT = os.path.join(ROOT, 'assets', 'proc')
os.makedirs(OUT, exist_ok=True)


def flood_key(im, tol=28, bg='auto'):
    """Key out a uniform background by flood-filling from the four corners."""
    im = im.convert('RGBA')
    a = np.array(im).astype(np.int16)
    h, w = a.shape[:2]
    rgb = a[:, :, :3]
    corners = [rgb[1, 1], rgb[1, w - 2], rgb[h - 2, 1], rgb[h - 2, w - 2]]
    seed = np.median(np.stack(corners), axis=0)
    dist = np.linalg.norm(rgb - seed, axis=2)
    near = dist < tol
    # BFS from edges over 'near' pixels only (protects same-colour interior bits)
    mask = np.zeros((h, w), dtype=bool)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x] and not mask[y, x]:
                mask[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x] and not mask[y, x]:
                mask[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not mask[ny, nx]:
                mask[ny, nx] = True; dq.append((ny, nx))
    a[:, :, 3] = np.where(mask, 0, a[:, :, 3])
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def trim(im, pad=4):
    a = np.array(im)
    alpha = a[:, :, 3]
    ys, xs = np.where(alpha > 8)
    if len(xs) == 0:
        return im
    x0, x1 = xs.min(), xs.max()
    y0, y1 = ys.min(), ys.max()
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(im.width - 1, x1 + pad); y1 = min(im.height - 1, y1 + pad)
    return im.crop((x0, y0, x1 + 1, y1 + 1))


def save(im, name):
    p = os.path.join(OUT, name)
    im.save(p)
    print(name, im.size)


# NASA meatball (jpg, white bg) -> key white
nasa = flood_key(Image.open(os.path.join(SRC, 'nasa-logo-official-insignia-transparent--2.jpg')), tol=26)
save(trim(nasa), 'logo_nasa.png')

# ISRO (already transparent) -> just trim
isro = Image.open(os.path.join(SRC, 'isro-logo-official-transparent-png-1.png')).convert('RGBA')
save(trim(isro), 'logo_isro.png')

# IMD official emblem (webp, black bg) -> flood black from corners
imd_big = Image.open(os.path.join(SRC, 'imd-india-meteorological-department-logo-1.webp'))
imd = flood_key(imd_big, tol=34)
save(trim(imd), 'logo_imd.png')

# GSI emblem: crop the circle from the brick-red ClearIAS card, then red-key
gsi_full = Image.open(os.path.join(SRC, 'geological-survey-of-india-gsi-official--1.png'))
w, h = gsi_full.size
cx, cy, r = w // 2, h // 2 - 14, int(min(w, h) * 0.315)
tsi = gsi_full.crop((cx - r, cy - r, cx + r, cy + r))
gsi = flood_key(tsi, tol=26)
# stray red outside the circle but inside crop corners also floods; keep as is
save(trim(gsi), 'logo_gsi.png')

# CWC round emblem (white bg)
cwc = flood_key(Image.open(os.path.join(SRC, 'central-water-commission-cwc-india-logo-2.png')), tol=24)
save(trim(cwc), 'logo_cwc.png')

# WMO emblem (white bg)
wmo = flood_key(Image.open(os.path.join(SRC, 'wmo-world-meteorological-organization-lo-2.png')), tol=24)
save(trim(wmo), 'logo_wmo.png')

# Research-paper figure: keep as-is (real ScienceDirect figure), mild sharpen
fig = Image.open(os.path.join(SRC, 'research-paper-figure-landslide-early-wa-2.jpg')).convert('RGB')
fig.save(os.path.join(OUT, 'paper_fig.png'))
print('paper_fig.png', fig.size)
print('DONE')
