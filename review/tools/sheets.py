# Contact sheets for Mu: one PNG per page, rows = worlds, columns = devices.
# usage: python3 -I sheets.py <shots-dir> <out-dir>
import sys, os
from PIL import Image, ImageDraw, ImageFont
shots, out = sys.argv[1], sys.argv[2]
WORLDS = [("washi", "Washi & Ink"), ("night", "Night Workshop"), ("day", "Sunny Workshop"), ("dawn", "First Light"), ("autumn", "Autumn Grove")]
DEVICES = [("phone-375", "iPhone SE · 375×667 @3x"), ("phone-390", "iPhone · 390×844 @3x"), ("desktop", "Desktop · 1280×860")]
PAGES = [("rail", "/ (the door rail)"), ("gallery", "/gallery/ (The Fox's Gallery)"), ("form-index", "/form-index/ (top of page)"), ("form-index-cards", "/form-index/ (the forms)"), ("soulprint", "/soulprint/ (The Soulprint Registry)")]
H = 520            # every cell is scaled to this height
GAP, LABEL_W, HEAD = 18, 150, 70
def font(size):
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"]:
        if os.path.exists(f): return ImageFont.truetype(f, size)
    return ImageFont.load_default()
F, FS = font(22), font(16)
for key, title in PAGES:
    cells = {}
    for w, _ in WORLDS:
        for d, _ in DEVICES:
            p = os.path.join(shots, f"{key}--{w}--{d}.png")
            if not os.path.exists(p): continue
            im = Image.open(p).convert("RGB")
            im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
            cells[(w, d)] = im
    if not cells: continue
    colw = {d: max((cells[(w, d)].width for w, _ in WORLDS if (w, d) in cells), default=0) for d, _ in DEVICES}
    W = LABEL_W + sum(colw.values()) + GAP * (len(DEVICES) + 1)
    Ht = HEAD + 34 + len(WORLDS) * (H + GAP) + GAP
    sheet = Image.new("RGB", (W, Ht), (236, 231, 220))
    g = ImageDraw.Draw(sheet)
    g.text((GAP, 18), "miruandmu.github.io  " + title + "  ·  worlds × devices", fill=(31, 29, 26), font=F)
    x = LABEL_W + GAP
    for d, dl in DEVICES:
        g.text((x, HEAD), dl, fill=(90, 84, 74), font=FS); x += colw[d] + GAP
    y = HEAD + 34
    for w, wl in WORLDS:
        g.text((GAP, y + 8), wl, fill=(31, 29, 26), font=FS)
        x = LABEL_W + GAP
        for d, _ in DEVICES:
            if (w, d) in cells:
                im = cells[(w, d)]
                sheet.paste(im, (x, y)); g.rectangle([x - 1, y - 1, x + im.width, y + im.height], outline=(160, 150, 135))
            x += colw[d] + GAP
        y += H + GAP
    path = os.path.join(out, f"contact-sheet-{key}.png")
    sheet.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(path, optimize=True)
    print(path, sheet.size, os.path.getsize(path) // 1024, "KB")
