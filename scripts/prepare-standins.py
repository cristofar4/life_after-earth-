"""Build temporary stand-in images from the layout reference (docs/reference-layout.webp).

The reference is a design mock-up, so its scenes contain baked-in interface text.
This script crops each scene, inpaints the overlaid text/markers, upscales and
writes web-ready WebP files to public/media/. Replace these outputs with
full-resolution renders listed in MEDIA.md.

Usage: python3 scripts/prepare-standins.py
"""
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "reference-layout.webp"
OUT = ROOT / "public" / "media"
OUT.mkdir(parents=True, exist_ok=True)

img = cv2.imread(str(SRC))
if img is None:
    sys.exit(f"Cannot read {SRC}")


def text_mask(region, boxes, thresh=150, dilate=5):
    """Mask bright pixels (overlaid text) inside the given boxes."""
    gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
    mask = np.zeros(gray.shape, np.uint8)
    for x0, y0, x1, y1 in boxes:
        sub = gray[y0:y1, x0:x1]
        mask[y0:y1, x0:x1] = (sub > thresh).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate, dilate))
    return cv2.dilate(mask, k, iterations=2)


def box_mask(shape, boxes):
    mask = np.zeros(shape[:2], np.uint8)
    for x0, y0, x1, y1 in boxes:
        mask[y0:y1, x0:x1] = 255
    return mask


def finish(region, scale, name, quality=82):
    h, w = region.shape[:2]
    up = cv2.resize(region, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(up, (0, 0), 1.2)
    sharp = cv2.addWeighted(up, 1.35, blur, -0.35, 0)
    cv2.imwrite(str(OUT / name), sharp, [cv2.IMWRITE_WEBP_QUALITY, quality])
    print("wrote", name, sharp.shape[1], "x", sharp.shape[0])


# ---- Hero: Tokyo, 100 years later (crop of the right-hand scene) ----------
hero = img[44:556, 362:1024].copy()  # skip the nav bar strip at the top
m = text_mask(hero, [(20, 0, 110, 50), (520, 440, 640, 490)], thresh=165)
ring = np.zeros(hero.shape[:2], np.uint8)
cv2.circle(ring, (582, 116), 49, 255, 5)          # "100 years later" ring
cv2.circle(ring, (622, 88), 6, 255, -1)            # lime dot
m = cv2.bitwise_or(m, ring)
m = cv2.bitwise_or(m, text_mask(hero, [(545, 80, 620, 150)], thresh=150))
m = cv2.bitwise_or(m, box_mask(hero.shape, [(26, 38, 44, 44), (595, 480, 640, 486)]))
hero = cv2.inpaint(hero, m, 7, cv2.INPAINT_TELEA)
finish(hero, 2.4, "hero-tokyo-100y-standin.webp")

# ---- Chapter strips (each full scene, text removed) -----------------------
strips = [
    ("chapter-01-bangkok-10y-standin.webp", (40, 750, 940, 900),
     [(0, 0, 235, 125)], [(745, 95, 935, 130)]),
    ("chapter-02-singapore-100y-standin.webp", (50, 930, 1010, 1055),
     [(0, 0, 290, 125)], [(760, 85, 960, 125)]),
    ("chapter-03-miami-1000y-standin.webp", (45, 1105, 955, 1232),
     [(0, 0, 280, 127)], [(765, 70, 945, 110)]),
]
for name, (x0, y0, x1, y1), left_boxes, right_boxes in strips:
    reg = img[y0:y1, x0:x1].copy()
    m = text_mask(reg, left_boxes + right_boxes, thresh=150, dilate=5)
    reg = cv2.inpaint(reg, m, 9, cv2.INPAINT_TELEA)
    finish(reg, 2.0, name)

# ---- Comparison halves (NOT a matched pair; temporary) --------------------
# The lime divider handle sits on the seam, so both crops stop short of it.
present = img[1300:1460, 628:710].copy()
finish(present, 5.0, "compare-present-standin.webp")
future = img[1300:1460, 750:830].copy()
finish(future, 5.0, "compare-100y-standin.webp")


# ---- Mist textures (procedural, transparent) -------------------------------
def mist(w, h, seed, blur, density, name):
    rng = np.random.default_rng(seed)
    acc = np.zeros((h, w), np.float32)
    for (gh, gw), weight in (((3, 7), 0.6), ((5, 14), 0.28), ((9, 26), 0.12)):
        small = rng.random((gh, gw)).astype(np.float32)
        acc += cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC) * weight
    acc = cv2.GaussianBlur(acc, (0, 0), blur)
    acc = (acc - acc.min()) / (acc.max() - acc.min())
    alpha = np.clip((acc - (1 - density)) / density, 0, 1) ** 1.6
    # make it tile horizontally so a translateX loop has no seam
    t = 1 - np.abs(np.linspace(-1, 1, w, dtype=np.float32))
    alpha = alpha * t[None, :] + np.roll(alpha, w // 2, axis=1) * (1 - t[None, :])
    # soft vertical falloff
    v = np.clip(np.sin(np.linspace(0, np.pi, h, dtype=np.float32)), 0, 1) ** 0.8
    alpha *= v[:, None]
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = (236, 240, 232)
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    cv2.imwrite(str(OUT / name), rgba, [cv2.IMWRITE_WEBP_QUALITY, 70])
    print("wrote", name)


mist(1600, 500, 7, 22, 0.55, "mist-far.webp")
mist(1600, 420, 21, 30, 0.45, "mist-near.webp")
