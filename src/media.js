/**
 * Media manifest. Real photographs and footage from Wikimedia Commons, prepared
 * by scripts/fetch-media.py (sources: scripts/media-sources.json). Every file's
 * author, licence and source page live in src/credits.json and are shown on the
 * page. A missing entry resolves to `null`, and components fall back honestly.
 */
import credits from './credits.json';

const base = import.meta.env.BASE_URL;
const m = (file) => `${base}media/${file}`;

/** Responsive photo record for <img src srcset>. */
export function photo(id, alt) {
  const c = credits[id];
  if (!c || !c.sizes) return null;
  const largest = c.sizes[c.sizes.length - 1];
  const mid = c.sizes.find((s) => s.width >= 1600) || largest;
  return {
    id,
    alt,
    src: m(mid.file),
    full: m(largest.file),
    srcSet: c.sizes.map((s) => `${m(s.file)} ${s.width}w`).join(', '),
    width: largest.width,
    height: largest.height,
    credit: credit(id),
  };
}

export function footage(id, alt) {
  const c = credits[id];
  if (!c || !c.file) return null;
  return { id, alt, src: m(c.file), poster: m(c.poster), credit: credit(id), place: c.place, coords: c.coords, mark: c.mark };
}

export function credit(id) {
  const c = credits[id];
  if (!c) return null;
  return { author: c.author, license: c.license, licenseUrl: c.licenseUrl, source: c.source, title: c.title };
}

export const allCredits = () => Object.entries(credits).map(([id, c]) => ({ id, ...credit(id) }));

/** Short real clips for the "Already happening" reel. */
export const REEL = [
  {
    clip: footage('reel-varosha', 'Drone footage gliding toward empty beachfront hotels in Varosha, Cyprus.'),
    place: 'Varosha, Cyprus',
    note: 'A resort district fenced off and left empty in 1974. Parts reopened to visitors in 2020.',
  },
  {
    clip: footage('reel-chernobyl', 'An abandoned Young Pioneer camp building among pines in the Red Forest near Chernobyl.'),
    place: 'Red Forest, Chernobyl Exclusion Zone',
    note: 'A children’s summer camp abandoned in 1986. Pines and grass now stand where the paths were.',
  },
].filter((r) => r.clip);

export const MEDIA = {
  hero: {
    photo: photo('hero-pripyat', 'Aerial photograph of Pripyat, Ukraine: apartment blocks half-hidden by autumn forest.'),
    // Full-frame hero footage of the same place (none exists for this view): null = still photograph.
    video: footage('hero-loop', 'Looping footage behind the hero.'),
    // Real fog footage keyed into a greyscale matte; layered over the photograph as moving mist.
    fog: footage('mist-fog', ''),
  },
  mist: {
    far: m('mist-far.webp'),
    near: m('mist-near.webp'),
  },
  audio: {
    // No recorded ambience yet: the site synthesises wind, water and birds live (Web Audio).
    ambient: null,
  },
  compare: {
    place: 'Jackson Glacier, Glacier National Park, Montana',
    note: 'Repeat photographs taken from the same viewpoint.',
    eras: [
      { key: '1914', label: '1914', side: 'left', image: photo('compare-jackson-1914', 'Jackson Glacier in 1914: a broad ice field fills the valley below Mount Jackson.') },
      { key: '2020', label: '2020', side: 'right', image: photo('compare-jackson-2020', 'The same viewpoint in 2020: the ice has retreated to small patches on bare rock.') },
      { key: '2120', label: '2120', side: 'right', image: null, missing: 'Not yet photographed' },
    ],
  },
};
