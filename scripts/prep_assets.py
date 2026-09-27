#!/usr/bin/env python3
"""Prepare images for the SIH 2026 deck: transparency keying + aspect crops."""
import os
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "image-search")
OUT = os.path.join(ROOT, "assets", "proc")
os.makedirs(OUT, exist_ok=True)


def flood_key_white(img: Image.Image, thresh: int = 235) -> Image.Image:
    """Make edge-connected near-white pixels transparent."""
    im = img.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque()

    def try_seed(x, y):
        r, g, b, a = px[x, y]
        if r >= thresh and g >= thresh and b >= thresh:
            q.append((x, y))
            seen[y * w + x] = 1

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, a = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                r2, g2, b2, a2 = px[nx, ny]
                if r2 >= thresh and g2 >= thresh and b2 >= thresh:
                    seen[ny * w + nx] = 1
                    q.append((nx, ny))
    return im


def autocrop_alpha(im: Image.Image, pad: int = 2) -> Image.Image:
    bbox = im.getchannel("A").getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad); t = max(0, t - pad)
    r = min(im.width, r + pad); b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def sih_bulb():
    src = Image.open(os.path.join(IMG, "smart-india-hackathon-sih-2025-official--1.png"))
    crop = src.crop((10, 0, 350, 452))  # bulb + "SIH" text, excludes 2025 pill & maroon strip
    keyed = flood_key_white(crop, 232)
    keyed = autocrop_alpha(keyed)
    keyed.save(os.path.join(OUT, "sih_bulb.png"))
    print("sih_bulb", keyed.size)


def zypher_crest():
    src = Image.open(os.path.join(ROOT, "assets", "zypher_logo.png"))
    keyed = flood_key_white(src, 240)
    keyed = autocrop_alpha(keyed)
    keyed.save(os.path.join(OUT, "zypher_crest.png"))
    print("zypher_crest", keyed.size)


def center_crop_to(src_path, dst_name, aspect, quality=88):
    im = Image.open(src_path).convert("RGB")
    w, h = im.size
    cur = w / h
    if cur > aspect:  # too wide -> crop width
        nw = int(h * aspect)
        x0 = (w - nw) // 2
        im = im.crop((x0, 0, x0 + nw, h))
    else:             # too tall -> crop height
        nh = int(w / aspect)
        y0 = (h - nh) // 2
        im = im.crop((0, y0, w, y0 + nh))
    im.save(os.path.join(OUT, dst_name), quality=quality)
    print(dst_name, im.size)


def main():
    sih_bulb()
    zypher_crest()
    # photo crops to target aspect ratios of their placeholders
    center_crop_to(os.path.join(IMG, "uttarakhand-flash-flood-kedarnath-disast-3.jpg"), "flood_dharali.jpg", 2.86/2.10)
    center_crop_to(os.path.join(IMG, "automatic-weather-station-rainfall-senso-1.jpg"), "rwis_station.jpg", 2.60/1.62)
    center_crop_to(os.path.join(IMG, "nasa-smap-satellite-artist-render-orbit--1.jpg"), "smap.jpg", 1.95/1.42)
    # ndrf source has black pillar bars baked in -> inset crop horizontally first
    ndrf_src = Image.open(os.path.join(IMG, "ndrf-rescue-team-flood-operation-india-l-1.jpg")).convert("RGB")
    w0, h0 = ndrf_src.size
    inset = int(w0 * 0.16)
    ndrf_tmp = os.path.join(OUT, "_ndrf_tmp.jpg")
    ndrf_src.crop((inset, 0, w0 - inset, h0)).save(ndrf_tmp, quality=92)
    center_crop_to(ndrf_tmp, "ndrf_rescue.jpg", 4.02/1.62)
    center_crop_to(os.path.join(IMG, "himalayan-mountain-village-valley-uttara-1.jpg"), "village.jpg", 4.02/1.62)
    center_crop_to(os.path.join(IMG, "landslide-debris-blocked-mountain-road-m-2.jpg"), "landslide.jpg", 4.02/1.62)


if __name__ == "__main__":
    main()
