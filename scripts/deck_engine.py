#!/usr/bin/env python3
"""
Shared layout engine for the SIH 2026 deck.
One layout spec -> (a) native .pptx via python-pptx, (b) PNG previews via PIL
so we can visually QA geometry. Preview uses DejaVuSerif which is WIDER than
Times New Roman, so text that fits in preview is guaranteed to fit in PowerPoint.
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

# ------------------------------------------------------------------ constants
EMU_IN = 914400
DPI = 120  # preview resolution
PAGE_W, PAGE_H = 13.333, 7.5

NAVY = "12264C"
NAVY2 = "1B3A6B"
GOLD = "E8A917"
GOLD_D = "B9860B"
CREAM = "F8F4EA"
PAPER = "FFFFFF"
INK = "1A1D24"
GRAY = "4E5560"
LINE = "B7BFCE"
SOFT = "EEF1F6"
BLUE_BAR = "0070C0"
PURPLE = "7030A0"
RED = "A52A2A"
GREEN = "2F7D32"
GRAY_HEX = "EDEDED"
GRAY_HEX_LN = "C9CDD6"
FONT = "Times New Roman"

FONTS_DIR = "/usr/share/fonts/truetype/dejavu"
_font_cache = {}


def _pil_font(size_pt, bold=False, italic=False):
    key = (round(size_pt, 2), bold, italic)
    if key not in _font_cache:
        name = "DejaVuSerif"
        if bold and italic:
            name += "-BoldItalic"
        elif bold:
            name += "-Bold"
        elif italic:
            name += "-Italic"
        path = os.path.join(FONTS_DIR, name + ".ttf")
        if not os.path.exists(path):
            path = os.path.join(FONTS_DIR, "DejaVuSerif-Bold.ttf" if bold else "DejaVuSerif.ttf")
        _font_cache[key] = ImageFont.truetype(path, int(round(size_pt * DPI / 72.0)))
    return _font_cache[key]


def _hx(c):
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def _text_w(text, font):
    return font.getlength(text)


# ------------------------------------------------------------------ text wrap
def wrap_line(text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for wd in words:
        trial = (cur + " " + wd).strip()
        if not cur or _text_w(trial, font) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines or [""]


def para_runs(p):
    """Normalize paragraph into list of (text, style_dict) runs."""
    if "runs" in p:
        out = []
        for t, st in p["runs"]:
            out.append((t, {
                "s": st.get("s", p.get("s", 11)),
                "b": st.get("b", p.get("b", False)),
                "i": st.get("i", p.get("i", False)),
                "col": st.get("col", p.get("col", INK)),
            }))
        return out
    return [(p.get("t", ""), {
        "s": p.get("s", 11), "b": p.get("b", False),
        "i": p.get("i", False), "col": p.get("col", INK)})]


def layout_paragraph(p, width_in, scale=1.0):
    """Return dict with wrapped lines + heights for a paragraph at given scale."""
    runs = para_runs(p)
    bullet = p.get("bullet", False)
    indent = p.get("hang", 0.19) if bullet else 0.0
    avail = (width_in - indent) * DPI
    # build "words with style" stream
    words = []  # (word_text, style, trailing_space)
    for t, st in runs:
        for k, wd in enumerate(t.split(" ")):
            if wd == "" and k != len(t.split(" ")) - 1:
                continue
            words.append((wd, st))
    lines, cur, cur_w = [], [], 0.0
    space_w = lambda st: _text_w(" ", _pil_font(st["s"] * scale, st["b"], st["i"]))
    for wd, st in words:
        f = _pil_font(st["s"] * scale, st["b"], st["i"])
        w = _text_w(wd, f)
        add = w if not cur else w + space_w(st)
        if cur and cur_w + add > avail:
            lines.append(cur)
            cur, cur_w = [(wd, st, w)], w
        else:
            cur.append((wd, st, w))
            cur_w += (space_w(st) if len(cur) > 1 else 0) + w
    if cur:
        lines.append(cur)
    if not lines:
        lines = [[]]
    ls = p.get("ls", 1.06)
    max_s = max([st["s"] for _, st in runs] + [p.get("s", 11)]) * scale
    line_h = max_s * ls / 72.0
    return {
        "lines": lines,
        "line_h": line_h,
        "n": len(lines),
        "sb": p.get("sb", 0) / 72.0 * scale,
        "sa": p.get("sa", 0) / 72.0 * scale,
        "indent": indent,
        "bullet": bullet,
        "align": p.get("al", "l"),
        "line_px_h": line_h * DPI,
        "height": len(lines) * line_h,
    }


def text_block_height(el, scale=1.0):
    pad = el.get("pad", 0.05)
    w = el["w"] - 2 * pad
    total = 0.0
    lays = []
    for p in el["paras"]:
        lay = layout_paragraph(p, w, scale)
        total += lay["sb"] + lay["height"] + lay["sa"]
        lays.append(lay)
    return total + 2 * pad, lays


def fit_scale(el):
    if el.get("fit") != "shrink":
        return 1.0
    for s in [1.0, 0.97, 0.94, 0.91, 0.88, 0.85, 0.82, 0.79, 0.76, 0.73, 0.70, 0.67, 0.64]:
        h, _ = text_block_height(el, s)
        if h <= el["h"]:
            return s
    return 0.64


# ------------------------------------------------------------------ PIL render
def render_slide_png(elements, path):
    W, H = int(PAGE_W * DPI), int(PAGE_H * DPI)
    img = Image.new("RGB", (W, H), _hx(PAPER))
    d = ImageDraw.Draw(img, "RGBA")

    def box(x, y, w, h):
        return [int(x * DPI), int(y * DPI), int((x + w) * DPI), int((y + h) * DPI)]

    for el in elements:
        k = el["kind"]
        if k in ("rect", "round", "oval", "hex", "chevron", "rarrow", "darrow"):
            fill = _hx(el["fill"]) if el.get("fill") else None
            lc = _hx(el["line"]) if el.get("line") else None
            lw = max(1, int(el.get("lw", 1.0) * DPI / 96))
            x, y, w, h = el["x"], el["y"], el["w"], el["h"]
            if k == "rect":
                d.rectangle(box(x, y, w, h), fill=fill, outline=lc, width=lw)
            elif k == "round":
                rad = int(el.get("rad", 0.08) * DPI)
                d.rounded_rectangle(box(x, y, w, h), radius=rad, fill=fill, outline=lc, width=lw)
            elif k == "oval":
                d.ellipse(box(x, y, w, h), fill=fill, outline=lc, width=lw)
            elif k == "hex":
                pts = [(x + 0.25 * w, y), (x + 0.75 * w, y), (x + w, y + 0.5 * h),
                       (x + 0.75 * w, y + h), (x + 0.25 * w, y + h), (x, y + 0.5 * h)]
                pts = [(px_ * DPI, py_ * DPI) for px_, py_ in pts]
                d.polygon(pts, fill=fill, outline=lc, width=lw)
            elif k == "chevron":
                a = min(0.28 * w, 0.18)
                pts = [(x, y), (x + w - a, y), (x + w, y + 0.5 * h), (x + w - a, y + h),
                       (x, y + h), (x + a, y + 0.5 * h)]
                pts = [(px_ * DPI, py_ * DPI) for px_, py_ in pts]
                d.polygon(pts, fill=fill, outline=lc, width=lw)
            elif k in ("rarrow", "darrow"):
                if k == "rarrow":
                    shaft = 0.55 * h
                    y0 = y + (h - shaft) / 2
                    head = 0.45 * w
                    pts = [(x, y0), (x + w - head, y0), (x + w - head, y), (x + w, y + h / 2),
                           (x + w - head, y + h), (x + w - head, y0 + shaft), (x, y0 + shaft)]
                else:
                    shaft = 0.55 * w
                    x0 = x + (w - shaft) / 2
                    head = 0.45 * h
                    pts = [(x0, y), (x0 + shaft, y), (x0 + shaft, y + h - head), (x + w, y + h - head),
                           (x + w / 2, y + h), (x, y + h - head), (x0, y + h - head)]
                pts = [(px_ * DPI, py_ * DPI) for px_, py_ in pts]
                d.polygon(pts, fill=fill, outline=lc, width=lw)
            if el.get("paras"):
                _draw_text_pil(d, el)
        elif k == "text":
            _draw_text_pil(d, el)
        elif k == "img":
            im = Image.open(el["path"])
            tw, th = int(el["w"] * DPI), int(el["h"] * DPI)
            im = im.resize((tw, th), Image.LANCZOS)
            px0, py0 = int(el["x"] * DPI), int(el["y"] * DPI)
            if im.mode == "RGBA":
                img.paste(im, (px0, py0), im)
            else:
                img.paste(im, (px0, py0))
            if el.get("border"):
                d.rectangle([px0, py0, px0 + tw, py0 + th],
                            outline=_hx(el["border"]), width=max(1, int(el.get("lw", 1.25) * DPI / 96)))
        elif k == "line":
            lc = _hx(el.get("col", INK))
            lw = max(1, int(el.get("lw", 1.0) * DPI / 96))
            if el.get("dash"):
                _dashed_line(d, el["x1"] * DPI, el["y1"] * DPI, el["x2"] * DPI, el["y2"] * DPI, lc, lw)
            else:
                d.line([el["x1"] * DPI, el["y1"] * DPI, el["x2"] * DPI, el["y2"] * DPI], fill=lc, width=lw)
    img.save(path)


def _dashed_line(d, x1, y1, x2, y2, col, lw, dash=10, gap=7):
    dist = math.hypot(x2 - x1, y2 - y1)
    if dist == 0:
        return
    n = int(dist // (dash + gap)) + 1
    for i in range(n):
        t0 = i * (dash + gap) / dist
        t1 = min((i * (dash + gap) + dash) / dist, 1.0)
        if t0 > 1:
            break
        d.line([x1 + (x2 - x1) * t0, y1 + (y2 - y1) * t0,
                x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1], fill=col, width=lw)


def _draw_text_pil(d, el):
    scale = fit_scale(el)
    total_h, lays = text_block_height(el, scale)
    pad = el.get("pad", 0.05)
    anchor = el.get("anchor", "t")
    if anchor == "c":
        ty = el["y"] + (el["h"] - total_h) / 2 + pad
    elif anchor == "b":
        ty = el["y"] + el["h"] - total_h + pad
    else:
        ty = el["y"] + pad
    x0 = el["x"] + pad
    w_avail = el["w"] - 2 * pad

    for lay in lays:
        ty += lay["sb"]
        for li, line in enumerate(lay["lines"]):
            line_w_pt = sum(wd[2] for wd in line)
            sp_w = 0.0
            if line:
                st0 = line[0][1]
                sp_w = _text_w(" ", _pil_font(st0["s"] * scale, st0["b"], st0["i"]))
            line_w_pt += sp_w * max(0, len(line) - 1)
            align = lay["align"]
            lx = x0 + lay["indent"]
            if li == 0 and line and lay["bullet"]:
                bf = _pil_font(line[0][1]["s"] * scale, True, False)
                d.text((x0 * DPI, ty * DPI), "•", font=bf, fill=_hx(line[0][1]["col"]))
            gaps = max(0, len(line) - 1)
            extra = 0.0
            if align == "c":
                lx = x0 + lay["indent"] + max(0.0, (w_avail - lay["indent"] - line_w_pt / DPI) / 2)
            elif align == "r":
                lx = x0 + w_avail - line_w_pt / DPI
            elif align == "j" and gaps > 0 and line is not lay["lines"][-1]:
                extra = max(0.0, (w_avail - lay["indent"] - line_w_pt / DPI) / gaps)
            cx = lx
            for wd, st, wpt in line:
                f = _pil_font(st["s"] * scale, st["b"], st["i"])
                d.text((cx * DPI, ty * DPI), wd, font=f, fill=_hx(st["col"]))
                cx += wpt / DPI + sp_w / DPI + extra
            ty += lay["line_h"]
        ty += lay["sa"]


# ------------------------------------------------------------------ pptx emit
def build_pptx(slides, out_path):
    from pptx import Presentation
    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
    from pptx.enum.shapes import MSO_SHAPE
    from pptx.oxml.ns import qn
    import copy

    prs = Presentation()
    prs.slide_width = Emu(int(PAGE_W * EMU_IN))
    prs.slide_height = Emu(int(PAGE_H * EMU_IN))
    blank = prs.slide_layouts[6]

    def rgb(c):
        return RGBColor.from_string(c)

    def style_fill_ln(sp, el):
        if el.get("fill"):
            sp.fill.solid()
            sp.fill.fore_color.rgb = rgb(el["fill"])
        else:
            sp.fill.background()
        if el.get("line"):
            sp.line.color.rgb = rgb(el["line"])
            sp.line.width = Pt(el.get("lw", 1.0))
        else:
            sp.line.fill.background()
        sp.shadow.inherit = False

    def set_text(sp, el):
        from pptx.oxml.ns import qn as _qn
        tf = sp.text_frame
        tf.word_wrap = True
        tf.auto_size = MSO_AUTO_SIZE.NONE
        pad = el.get("pad", 0.05)
        tf.margin_left = Inches(pad)
        tf.margin_right = Inches(pad)
        tf.margin_top = Inches(el.get("padt", 0.03))
        tf.margin_bottom = Inches(el.get("padb", 0.03))
        anc = el.get("anchor", "t")
        tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "c": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}[anc]
        scale = fit_scale(el)
        first = True
        for p in el["paras"]:
            para = tf.paragraphs[0] if first else tf.add_paragraph()
            first = False
            al = p.get("al", "l")
            para.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER,
                              "r": PP_ALIGN.RIGHT, "j": PP_ALIGN.JUSTIFY}[al]
            para.space_before = Pt(p.get("sb", 0) * scale)
            para.space_after = Pt(p.get("sa", 0) * scale)
            try:
                para.line_spacing = p.get("ls", 1.06)
            except Exception:
                pass
            for t, st in para_runs(p):
                r = para.add_run()
                r.text = t
                f = r.font
                f.name = FONT
                f.size = Pt(st["s"] * scale)
                f.bold = st["b"]
                f.italic = st["i"]
                f.color.rgb = rgb(st["col"])
                _set_east(r, FONT)
            if p.get("bullet"):
                _bullet(para, p.get("hang", 0.19), p.get("bcol", None))

    def _set_east(run, fontname):
        rPr = run._r.get_or_add_rPr()
        for tag in ("a:latin", "a:ea", "a:cs"):
            e = rPr.find(qn(tag))
            if e is None:
                e = rPr.makeelement(qn(tag), {})
                rPr.append(e)
            e.set("typeface", fontname)

    def _bullet(para, hang, col):
        pPr = para._pPr if para._pPr is not None else para.get_or_add_pPr()
        marl = str(int(hang * EMU_IN))
        pPr.set("marL", marl)
        pPr.set("indent", "-" + marl)
        for tag in ("a:buNone", "a:buChar", "a:buAutoNum", "a:buFont", "a:buClr"):
            for e in pPr.findall(qn(tag)):
                pPr.remove(e)
        buFont = pPr.makeelement(qn("a:buFont"), {"typeface": FONT})
        buChar = pPr.makeelement(qn("a:buChar"), {"char": "•"})
        pPr.append(buFont)
        pPr.append(buChar)

    shp_map = {
        "rect": MSO_SHAPE.RECTANGLE,
        "round": MSO_SHAPE.ROUNDED_RECTANGLE,
        "oval": MSO_SHAPE.OVAL,
        "hex": MSO_SHAPE.HEXAGON,
        "chevron": MSO_SHAPE.CHEVRON,
        "rarrow": MSO_SHAPE.RIGHT_ARROW,
        "darrow": MSO_SHAPE.DOWN_ARROW,
    }

    for elements in slides:
        slide = prs.slides.add_slide(blank)
        for el in elements:
            k = el["kind"]
            if k in shp_map:
                sp = slide.shapes.add_shape(shp_map[k], Inches(el["x"]), Inches(el["y"]),
                                            Inches(el["w"]), Inches(el["h"]))
                if k == "round" and el.get("rad"):
                    try:
                        sp.adjustments[0] = max(0.0, min(0.5, el["rad"] / min(el["w"], el["h"])))
                    except Exception:
                        pass
                style_fill_ln(sp, el)
                if el.get("paras"):
                    set_text(sp, el)
            elif k == "text":
                tb = slide.shapes.add_textbox(Inches(el["x"]), Inches(el["y"]),
                                              Inches(el["w"]), Inches(el["h"]))
                set_text(tb, el)
            elif k == "img":
                pic = slide.shapes.add_picture(el["path"], Inches(el["x"]), Inches(el["y"]),
                                               Inches(el["w"]), Inches(el["h"]))
                if el.get("border"):
                    pic.line.color.rgb = rgb(el["border"])
                    pic.line.width = Pt(el.get("lw", 1.25))
                pic.shadow.inherit = False
            elif k == "line":
                conn = slide.shapes.add_connector(1, Inches(el["x1"]), Inches(el["y1"]),
                                                  Inches(el["x2"]), Inches(el["y2"]))
                conn.line.color.rgb = rgb(el.get("col", INK))
                conn.line.width = Pt(el.get("lw", 1.0))
                if el.get("dash"):
                    conn.line._get_or_add_ln().append(
                        conn.line._get_or_add_ln().makeelement(qn("a:prstDash"), {"val": "dash"}))
    prs.save(out_path)
    return out_path
