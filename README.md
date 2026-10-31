# AFTER EARTH

A cinematic, responsive field guide to cities reclaimed by nature after people
disappear. Built with React, Vite and GSAP (ScrollTrigger + ScrollTo).
The futures are imagined; the photographs and footage are real places today,
credited on the page.

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
npm run preview  # serve the build
```

## Structure

| Path | What it does |
| --- | --- |
| `src/media.js` | Media manifest built from `src/credits.json` (responsive `srcset`, credits, what's missing). |
| `src/content.js` | Chapters, eras and narratives. |
| `src/lib/gsap.js` | Plugin registration and the shared motion system (durations/eases). |
| `src/lib/ambientAudio.js` | Web Audio engine: plays a supplied loop, or synthesises wind/water/birds; exposes an analyser for the waveforms. |
| `src/components/Hero.jsx` | Opening (circle → city, panel slide, masked headline) and the pinned hero → world transition. |
| `src/components/HeroScene.jsx` | Video (when supplied) or still + mist fallback; pauses offscreen / when hidden / via the motion toggle. |
| `src/components/Chapters.jsx` | Unfolding panoramic strips with inner parallax and hover expansion. |
| `src/components/ChapterOverlay.jsx` | Strip image → fullscreen transition, era timeline, prev/next, focus trap, Escape, scroll restore. |
| `src/components/Comparison.jsx` | Circular reveal and draggable/keyboard comparison slider with honest era controls. |
| `src/components/Footage.jsx` | “It has already begun”: a real-footage reel that plays only on screen and obeys the motion control. |
| `scripts/fetch-media.py`, `scripts/align-pair.py` | Fetch, credit and optimise the real media; align the repeat-photography pair. |

## Motion system

* Small interactions 150–250 ms, content reveals 600–900 ms, scene transitions 900–1400 ms.
* Signature moments: opening circle expanding into the city; hero pinned and expanding
  to a fullscreen world on scroll (desktop ≥ 900 px only, reversible); chapter image
  opening seamlessly into its immersive view.
* Mobile: no pinning, shorter reveals, tap-first controls.
* `prefers-reduced-motion`: no intro, pinning, parallax, autoplay or large transitions;
  ambient motion starts paused (visitors can opt in with “Play motion”).

## Media

Real photographs and footage from Wikimedia Commons, fetched and optimised by
`scripts/fetch-media.py` (see [MEDIA.md](MEDIA.md) for sources, licences and how to
change them). Credits render from `src/credits.json`.
