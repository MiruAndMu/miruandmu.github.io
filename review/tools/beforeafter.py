# Form Index before/after, same viewports: old page (night-only) vs the new one in washi and night.
import sys, os
from PIL import Image, ImageDraw, ImageFont
S, out = sys.argv[1], sys.argv[2]
def font(n):
    p = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    return ImageFont.truetype(p, n) if os.path.exists(p) else ImageFont.load_default()
F = font(22)
H = 640
cols = [("BEFORE · phone", f"{S}/before-phone-fold.png"), ("AFTER · phone · washi", f"{S}/final/form-index--washi--phone-375.png"),
        ("AFTER · phone · night", f"{S}/final/form-index-cards--night--phone-375.png"),
        ("BEFORE · desktop", f"{S}/before-desktop-fold.png"), ("AFTER · desktop · dawn", f"{S}/final/form-index--dawn--desktop.png"),
        ("AFTER · desktop · autumn", f"{S}/final/form-index-cards--autumn--desktop.png")]
ims = []
for label, p in cols:
    im = Image.open(p).convert("RGB"); im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS); ims.append((label, im))
row1, row2 = ims[:3], ims[3:]
W = max(sum(i.width for _, i in r) + 20 * (len(r) + 1) for r in (row1, row2))
sheet = Image.new("RGB", (W, 2 * (H + 60) + 20), (236, 231, 220)); g = ImageDraw.Draw(sheet)
y = 10
for r in (row1, row2):
    x = 20
    for label, im in r:
        g.text((x, y), label, fill=(31, 29, 26), font=F); sheet.paste(im, (x, y + 36)); x += im.width + 20
    y += H + 60
sheet.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(out, optimize=True)
print(out, sheet.size, os.path.getsize(out) // 1024, "KB")
