"""Align a repeat-photography pair so the comparison divider shows the same ground.

Repeat photographs are taken from the same spot, but never framed identically.
This estimates a similarity transform (rotation, uniform scale, translation —
no stretching) from SIFT features on stable terrain, warps the newer photo onto
the older one, crops both to the area they share, and rewrites their WebP sizes.

Run after scripts/fetch-media.py has cached both originals:
    python3 scripts/align-pair.py compare-jackson-1914 compare-jackson-2020
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / ".media-cache"
OUT = ROOT / "public" / "media"
CREDITS = ROOT / "src" / "credits.json"
SOURCES = json.loads((ROOT / "scripts" / "media-sources.json").read_text())


def raw(id_):
    files = [p for p in RAW.glob(f"{id_}.*")]
    if not files:
        sys.exit(f"no cached original for {id_}; run scripts/fetch-media.py first")
    img = cv2.imread(str(files[0]), cv2.IMREAD_COLOR)
    if img is None:
        sys.exit(f"cannot decode {files[0]}")
    return img


def features(img, top=0.6):
    """SIFT on contrast-equalised greyscale, limited to the upper part of the frame:
    the rock face is stable across a century, the ice and foreground are not."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(gray)
    mask = np.zeros(gray.shape, np.uint8)
    mask[: int(gray.shape[0] * top)] = 255
    sift = cv2.SIFT_create(nfeatures=12000, contrastThreshold=0.02)
    return sift.detectAndCompute(gray, mask)


def write(id_, img):
    entry = next(e for e in SOURCES if e["id"] == id_)
    h, w = img.shape[:2]
    outs = []
    for target in entry.get("widths", [800, 1200]):
        tw = min(target, w)
        th = round(h * tw / w)
        res = cv2.resize(img, (tw, th), interpolation=cv2.INTER_AREA) if tw < w else img
        name = f"{id_}-{tw}.webp"
        cv2.imwrite(str(OUT / name), res, [cv2.IMWRITE_WEBP_QUALITY, entry.get("quality", 80)])
        outs.append({"file": name, "width": tw, "height": th})
        if tw == w:
            break
    return outs


def main(ref_id, mov_id):
    ref = raw(ref_id)
    mov = raw(mov_id)
    # work on the same scale for matching
    scale = 960 / max(ref.shape[:2])
    ref_s = cv2.resize(ref, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    mscale = 960 / max(mov.shape[:2])
    mov_s = cv2.resize(mov, None, fx=mscale, fy=mscale, interpolation=cv2.INTER_AREA)

    k1, d1 = features(ref_s)
    k2, d2 = features(mov_s)
    matches = cv2.BFMatcher(cv2.NORM_L2).knnMatch(d2, d1, k=2)
    good = [m for m, n in (p for p in matches if len(p) == 2) if m.distance < 0.8 * n.distance]
    if len(good) < 12:
        sys.exit(f"only {len(good)} good matches; cannot align safely")
    src = np.float32([k2[m.queryIdx].pt for m in good]) / mscale
    dst = np.float32([k1[m.trainIdx].pt for m in good]) / scale
    M, inliers = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=8.0, maxIters=50000, confidence=0.999)
    n_in = int(inliers.sum()) if inliers is not None else 0
    if M is None or n_in < 25:
        sys.exit(f"alignment failed ({n_in} inliers)")
    s = float(np.hypot(M[0, 0], M[1, 0]))
    rot = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    print(f"matches {len(good)}, inliers {n_in}, scale {s:.3f}, rotation {rot:.2f}°, shift ({M[0, 2]:.0f}, {M[1, 2]:.0f})")

    h, w = ref.shape[:2]
    warped = cv2.warpAffine(mov, M, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    valid = cv2.warpAffine(np.full(mov.shape[:2], 255, np.uint8), M, (w, h), flags=cv2.INTER_NEAREST)

    # largest square that both photos fully cover (integral image of the gaps),
    # placed as close as possible to the centre of the shared area
    bad = (valid < 255).astype(np.int64)
    ii = np.pad(bad.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    ys, xs = np.nonzero(valid == 255)
    cx, cy = xs.mean(), ys.mean()

    def fits(side):
        win = ii[side:, side:] - ii[:-side, side:] - ii[side:, :-side] + ii[:-side, :-side]
        ok = np.argwhere(win == 0)
        if not len(ok):
            return None
        d = (ok[:, 1] + side / 2 - cx) ** 2 + (ok[:, 0] + side / 2 - cy) ** 2
        y, x = ok[np.argmin(d)]
        return int(x), int(y)

    lo, hi, best = 64, min(w, h), None
    while lo <= hi:
        mid = (lo + hi) // 2
        pos = fits(mid)
        if pos:
            best, lo = (mid, pos), mid + 1
        else:
            hi = mid - 1
    side, (x0, y0) = best
    ref_c = ref[y0:y0 + side, x0:x0 + side]
    mov_c = warped[y0:y0 + side, x0:x0 + side]
    print(f"common square {side}px of {min(w, h)}px")

    credits = json.loads(CREDITS.read_text())
    for id_, img in ((ref_id, ref_c), (mov_id, mov_c)):
        credits[id_]["sizes"] = write(id_, img)
        credits[id_]["aspect"] = 1.0
        credits[id_]["aligned"] = True
    CREDITS.write_text(json.dumps(credits, indent=2, ensure_ascii=False) + "\n")
    print("rewrote", ref_id, "and", mov_id)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
