"""Generate the two tileable, transparent mist textures layered over the hero.

Usage: python3 scripts/make-mist.py
"""
from pathlib import Path

import cv2
import numpy as np

OUT = Path(__file__).resolve().parents[1] / "public" / "media"
OUT.mkdir(parents=True, exist_ok=True)


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
