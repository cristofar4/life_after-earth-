import { MEDIA } from '../media.js';
import { underlineHandlers } from './Underline.jsx';

export default function About({ onNavigate }) {
  const rows = [
    ['Hero scene', MEDIA.hero.video ? 'Looping video' : 'Still image with drifting mist · video not yet supplied'],
    ['Ambient sound', MEDIA.audio.ambient ? 'Recorded loop' : 'Synthesised live in your browser'],
    ['Chapter eras', 'One imagined view per chapter · other eras are text only'],
    ['Comparison', MEDIA.compare.matchedPair ? 'Matched viewpoints' : 'Stand-in pair · viewpoints not matched'],
  ];
  return (
    <section id="about" className="about" aria-labelledby="about-title" tabIndex={-1}>
      <div className="about__grid">
        <h2 id="about-title" className="about__title">
          A field guide to a future no one will see.
        </h2>
        <div className="about__copy">
          <p>
            After Earth is an artistic exploration of how cities might be reclaimed once people are gone. Every future scene
            here is speculative imagery — informed by how real abandoned places weather, flood and regrow, but imagined
            rather than observed.
          </p>
          <p>
            Locations and coordinates are real; the views of them are not.
          </p>
        </div>
        <dl className="about__media mono">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <footer className="foot mono">
        <span>After Earth · 2026</span>
        <a href="#top" className="ul" onClick={(e) => { e.preventDefault(); onNavigate('top'); }} {...underlineHandlers}>
          Back to the beginning
        </a>
      </footer>
    </section>
  );
}
