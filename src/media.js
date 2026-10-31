/**
 * Media manifest. Every visual/audio asset the site uses is declared here.
 * `null` means the asset has NOT been supplied — components render an honest
 * fallback instead of linking a broken file. See MEDIA.md for the full list.
 */
const base = import.meta.env.BASE_URL;
const m = (file) => `${base}media/${file}`;

export const MEDIA = {
  hero: {
    // Stand-in still cropped from the layout reference (see scripts/prepare-standins.py).
    poster: m('hero-tokyo-100y-standin.webp'),
    posterAlt:
      'Speculative view of Tokyo a century after people: vine-covered towers rising from forest and flooded streets.',
    // MISSING: 8–10 s seamless, muted landscape loop. Set to m('hero-tokyo-100y-loop.mp4') once supplied.
    video: null,
    videoWebm: null,
  },
  mist: {
    far: m('mist-far.webp'),
    near: m('mist-near.webp'),
  },
  audio: {
    // MISSING: recorded ambience loop. Until supplied, ambience is synthesised live (Web Audio).
    ambient: null,
  },
  chapters: {
    bangkok: {
      10: { src: m('chapter-01-bangkok-10y-standin.webp'), alt: 'Speculative view of a flooded Bangkok rail hall overgrown with vines, a rusting train beneath a broken glass roof.' },
      100: null,
      1000: null,
    },
    singapore: {
      10: null,
      100: { src: m('chapter-02-singapore-100y-standin.webp'), alt: 'Speculative view of Singapore overgrown by forest, a deer standing on a planted rooftop above the skyline.' },
      1000: null,
    },
    miami: {
      10: null,
      100: null,
      1000: { src: m('chapter-03-miami-1000y-standin.webp'), alt: 'Speculative view of Miami submerged in a turquoise sea, a broken causeway and tower tops breaking the surface.' },
    },
  },
  compare: {
    past: null,
    present: { src: m('compare-present-standin.webp'), alt: 'A present-day city street lined with towers.' },
    100: { src: m('compare-100y-standin.webp'), alt: 'Speculative view of towers swallowed by forest a century later.' },
    1000: null,
    // The two stand-ins are NOT a matched viewpoint pair; they are halves of the reference mock-up.
    matchedPair: false,
  },
};
