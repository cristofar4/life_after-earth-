import { allCredits, MEDIA } from '../media.js';
import { underlineHandlers } from './Underline.jsx';

const ROLE = {
  'hero-pripyat': 'Hero photograph',
  'hero-loop': 'Hero footage',
  'ch01-tskaltubo': 'Chapter 01',
  'ch01-loop': 'Chapter 01 footage',
  'ch02-houtouwan': 'Chapter 02',
  'ch02-loop': 'Chapter 02 footage',
  'ch03-tikal': 'Chapter 03',
  'ch03-loop': 'Chapter 03 footage',
  'compare-jackson-1914': 'Comparison, 1914',
  'compare-jackson-2020': 'Comparison, 2020',
  'mist-fog': 'Hero mist layer (fog keyed from footage)',
  'reel-varosha': 'Footage 01',
  'reel-chernobyl': 'Footage 02',
};

export default function About({ onNavigate }) {
  const credits = allCredits();
  return (
    <section id="about" className="about" aria-labelledby="about-title" tabIndex={-1}>
      <div className="about__grid">
        <h2 id="about-title" className="about__title">
          A field guide to a future no one will see.
        </h2>
        <div className="about__copy">
          <p>
            After Earth imagines how cities might be reclaimed once people are gone — ten, a hundred, a thousand years
            on. The futures are speculative. The places are not: every photograph and every piece of footage here is real,
            taken where nature has already begun the work.
          </p>
          <p>
            Ambient sound is synthesised live in your browser{MEDIA.audio.ambient ? '' : ' (no field recording yet)'}.
          </p>
        </div>
        {credits.length > 0 && (
          <div className="about__credits">
            <h3 className="mono">Photography &amp; footage</h3>
            <ul>
              {credits.map((c) => (
                <li key={c.id}>
                  <span className="mono about__role">{ROLE[c.id] || c.id}</span>
                  <span className="about__credit">
                    <a href={c.source} target="_blank" rel="noopener noreferrer" className="ul" {...underlineHandlers}>
                      {c.title.replace(/\.(jpe?g|png|tiff?|webm|ogv)$/i, '')}
                    </a>
                    <span>
                      {' '}
                      by {c.author} ·{' '}
                      {c.licenseUrl ? (
                        <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="ul" {...underlineHandlers}>
                          {c.license}
                        </a>
                      ) : (
                        c.license
                      )}
                      {' '}· via Wikimedia Commons
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="about__mods">
              Changes: images were cropped, resized and re-encoded for the web
              {credits.some((c) => c.id.startsWith('reel-') || c.id === 'mist-fog')
                ? '; footage was trimmed, muted and looped, and the hero mist is fog from real footage keyed into a translucent layer.'
                : '.'}
            </p>
          </div>
        )}
      </div>
      <footer className="foot mono">
        <span>After Earth · 2026</span>
        <a
          href="#top"
          className="ul"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('top');
          }}
          {...underlineHandlers}
        >
          Back to the beginning
        </a>
      </footer>
    </section>
  );
}
