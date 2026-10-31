# AFTER EARTH

A cinematic, responsive field guide to cities reclaimed by nature after people
disappear. Built with React, Vite and GSAP (ScrollTrigger + ScrollTo).
All future scenes are speculative imagery.

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
npm run preview  # serve the build
```

## Structure

| Path | What it does |
| --- | --- |
| `src/media.js` | Media manifest — single source of truth for every asset (and what's missing). |
| `src/content.js` | Chapters, eras and narratives. |
| `src/lib/gsap.js` | Plugin registration and the shared motion system (durations/eases). |
| `src/lib/ambientAudio.js` | Web Audio engine: plays a supplied loop, or synthesises wind/water/birds; exposes an analyser for the waveforms. |
| `src/components/Hero.jsx` | Opening (circle → city, panel slide, masked headline) and the pinned hero → world transition. |
| `src/components/HeroScene.jsx` | Video (when supplied) or still + mist fallback; pauses offscreen / when hidden / via the motion toggle. |
| `src/components/Chapters.jsx` | Unfolding panoramic strips with inner parallax and hover expansion. |
| `src/components/ChapterOverlay.jsx` | Strip image → fullscreen transition, era timeline, prev/next, focus trap, Escape, scroll restore. |
| `src/components/Comparison.jsx` | Circular reveal and draggable/keyboard comparison slider with honest era controls. |

## Motion system

* Small interactions 150–250 ms, content reveals 600–900 ms, scene transitions 900–1400 ms.
* Signature moments: opening circle expanding into the city; hero pinned and expanding
  to a fullscreen world on scroll (desktop ≥ 900 px only, reversible); chapter image
  opening seamlessly into its immersive view.
* Mobile: no pinning, shorter reveals, tap-first controls.
* `prefers-reduced-motion`: no intro, pinning, parallax, autoplay or large transitions;
  ambient motion starts paused (visitors can opt in with “Play motion”).

## Media

See [MEDIA.md](MEDIA.md). The hero video and recorded ambience have **not** been
supplied; the hero currently uses a temporary still-image fallback (slow drift +
two separate mist layers), which is not a fully animated environment.
