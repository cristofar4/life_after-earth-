# AFTER EARTH — media asset list

All future scenes are **speculative imagery**. Files live in `public/media/` and are
declared in `src/media.js`. A `null` entry there means the asset has not been
supplied; the site then shows an honest fallback instead of a broken link.

## Supplied now (temporary stand-ins)

These were cropped from the layout reference (`docs/reference-layout.webp`) by
`scripts/prepare-standins.py`, which also inpaints the mock-up's baked-in text and
upscales the crops. They are low resolution and will look soft on large screens.
Replace each with a full-resolution render using the same filename pattern (drop
the `-standin` suffix and update `src/media.js`).

| File | Used for | Notes |
| --- | --- | --- |
| `hero-tokyo-100y-standin.webp` | Hero poster / still fallback | ~1588×1228. Final: ≥ 2560×1440 still matching the hero video's first frame. |
| `chapter-01-bangkok-10y-standin.webp` | Chapter 01 strip + overlay (10 years) | Inpainted where the mock-up had text (left third). |
| `chapter-02-singapore-100y-standin.webp` | Chapter 02 strip + overlay (100 years) | Same. |
| `chapter-03-miami-1000y-standin.webp` | Chapter 03 strip + overlay (1,000 years) | Same. |
| `compare-present-standin.webp` | Comparison, left side | Tiny crop; **not** a matched viewpoint with the right side. |
| `compare-100y-standin.webp` | Comparison, right side | Tiny crop; **not** matched. |
| `mist-far.webp`, `mist-near.webp` | Procedural mist layers | Generated, tileable, transparent. These can stay. |

## Missing — needed for the full experience

| Wanted file | Spec | Where it plugs in |
| --- | --- | --- |
| `hero-tokyo-100y-loop.mp4` (+ optional `.webm`) | 8–10 s, locked camera, 1920×1080 or larger, H.264, no audio, seamless loop. Gentle foliage, slow mist between towers, ripples on flooded streets, a few distant birds. Stable architecture; no text or logos. | `MEDIA.hero.video` / `videoWebm` |
| `hero-tokyo-100y.webp` | Full-res poster = first frame of the loop. | `MEDIA.hero.poster` |
| `ambient-quiet-planet.mp3` (or `.ogg`) | 60–120 s seamless loop: wind in foliage, distant water, sparse birds. ~-20 LUFS. | `MEDIA.audio.ambient` (until then ambience is synthesised live via Web Audio) |
| `chapter-01-bangkok-100y.webp`, `chapter-01-bangkok-1000y.webp` | Same camera as the 10-year Bangkok view, ≥ 2400 px wide. | `MEDIA.chapters.bangkok[100 / 1000]` |
| `chapter-02-singapore-10y.webp`, `chapter-02-singapore-1000y.webp` | Same camera as the 100-year Singapore view. | `MEDIA.chapters.singapore[10 / 1000]` |
| `chapter-03-miami-10y.webp`, `chapter-03-miami-100y.webp` | Same camera as the 1,000-year Miami view. | `MEDIA.chapters.miami[10 / 100]` |
| `compare-<place>-past.webp`, `-present.webp`, `-100y.webp`, `-1000y.webp` | Square, ≥ 1200×1200, **identical viewpoint** across all eras. Set `matchedPair: true` once supplied. | `MEDIA.compare.*` |

Era controls in the chapter timeline and the comparison automatically enable
images as soon as their entry in `src/media.js` is filled in. Until then they read
“text only” / “image not supplied” — no era is faked by stretching or distorting
another photograph.
