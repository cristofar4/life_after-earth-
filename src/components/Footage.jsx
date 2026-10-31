import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, MQ, EASE } from '../lib/gsap.js';
import { REEL } from '../media.js';
import { useExperience } from '../Experience.jsx';
import { underlineHandlers } from './Underline.jsx';

/** "Already happening": short, real, looping clips of places people have left. */
export default function Footage() {
  const root = useRef(null);
  const frame = useRef(null);
  const videos = useRef([]);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const { motionPaused, toggleMotion } = useExperience();
  const running = inView && !motionPaused;

  // Play only the visible clip, only while the section is on screen.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (running && i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [running, active]);

  useEffect(() => {
    if (!frame.current) return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(frame.current);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);
    mm.add({ reduce: MQ.reduce }, (c) => {
      if (c.conditions.reduce) return;
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%' } })
        .from('.footage .line > span', { yPercent: 115, duration: 0.8, stagger: 0.1, ease: EASE.out })
        .fromTo('.footage__frame', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: EASE.scene }, 0.1)
        .from('.footage__frame video', { scale: 1.12, duration: 1.4, ease: EASE.out }, 0.1)
        .from('.footage__side > *', { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.07, ease: EASE.out }, 0.5);
    });
    return () => mm.revert();
  }, []);

  if (!REEL.length) return null;
  const item = REEL[active];

  return (
    <section className="footage" ref={root} aria-labelledby="footage-title">
      <div className="footage__head">
        <p className="mono footage__eyebrow">Real footage</p>
        <h2 className="h2 footage__title" id="footage-title">
          <span className="line"><span>It has</span></span>
          <span className="line"><span>already begun.</span></span>
        </h2>
      </div>

      <div className="footage__body">
        <div className="footage__frame" ref={frame}>
          {REEL.map((r, i) => (
            <video
              key={r.clip.id}
              ref={(el) => (videos.current[i] = el)}
              className={`footage__video ${i === active ? 'is-active' : ''}`}
              src={r.clip.src}
              poster={r.clip.poster}
              muted
              loop
              playsInline
              preload={i === 0 ? 'auto' : 'metadata'}
              aria-label={r.clip.alt}
              aria-hidden={i !== active}
            />
          ))}
          <button type="button" className="footage__pause mono" aria-pressed={motionPaused} onClick={toggleMotion}>
            {motionPaused ? (
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l10.5-6.5z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
            )}
            <span>{motionPaused ? 'Play motion' : 'Pause motion'}</span>
          </button>
        </div>

        <div className="footage__side">
          <div className="footage__tabs" role="group" aria-label="Choose a place">
            {REEL.map((r, i) => (
              <button
                key={r.clip.id}
                type="button"
                className={`footage__tab ${i === active ? 'is-active' : ''}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <span className="footage__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="mono">{r.place}</span>
              </button>
            ))}
          </div>
          <p className="footage__note" aria-live="polite">
            {item.note}
          </p>
          {item.clip.credit && (
            <p className="mono footage__credit">
              Footage{' '}
              <a href={item.clip.credit.source} target="_blank" rel="noopener noreferrer" className="ul" {...underlineHandlers}>
                {item.clip.credit.author}
              </a>{' '}
              · {item.clip.credit.license} · trimmed &amp; looped
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
