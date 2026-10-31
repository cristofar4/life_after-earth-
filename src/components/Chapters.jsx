import { useLayoutEffect, useRef } from 'react';
import { gsap, MQ, EASE } from '../lib/gsap.js';
import { CHAPTERS, ERAS } from '../content.js';
import Arrow from './Arrow.jsx';

const eraLabel = (key) => ERAS.find((e) => e.key === key).label;

export default function Chapters({ onOpen, stripRefs }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);
    mm.add({ reduce: MQ.reduce, desktop: MQ.desktop }, (c) => {
      if (c.conditions.reduce) return;
      // Strips unfold from their horizon line, staggered, while the image settles inside.
      gsap
        .timeline({ scrollTrigger: { trigger: '.strips', start: 'top 80%' } })
        .from('.strip', { y: 48, duration: 0.9, ease: EASE.out, stagger: 0.13 }, 0)
        .from('.strip__mask', { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.9, ease: EASE.inOut, stagger: 0.13 }, 0)
        .from('.strip__media', { scale: 1.2, duration: 1.3, ease: EASE.out, stagger: 0.13 }, 0)
        .from('.strip__num, .strip__copy, .strip__meta', { autoAlpha: 0, x: -16, duration: 0.6, ease: EASE.out, stagger: 0.05 }, 0.5);
      gsap.from('.chapters__head > *', {
        autoAlpha: 0,
        y: 14,
        duration: 0.7,
        stagger: 0.08,
        ease: EASE.out,
        scrollTrigger: { trigger: '.chapters__head', start: 'top 85%' },
      });
      // Independent depth: each image drifts inside its strip.
      gsap.utils.toArray('.strip').forEach((strip, i) => {
        gsap.fromTo(
          strip.querySelector('.strip__parallax'),
          { yPercent: -7 - i * 2 },
          {
            yPercent: 7 + i * 2,
            ease: 'none',
            scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="chapters" className="chapters" ref={root} aria-labelledby="chapters-title" tabIndex={-1}>
      <div className="chapters__head">
        <h2 id="chapters-title" className="mono">Three moments in a longer story</h2>
        <p className="mono chapters__hint">
          Imagined eras · real places<span className="hide-touch"> · hover to look closer</span>
        </p>
      </div>
      <ol className="strips">
        {CHAPTERS.map((c, i) => {
          const img = c.image;
          return (
            <li
              key={c.id}
              className="strip"
              style={{ '--offset': c.offset, '--clip': c.clip }}
              ref={(el) => (stripRefs.current[i] = el)}
            >
              <button
                type="button"
                className="strip__btn"
                onClick={() => onOpen(i)}
                aria-haspopup="dialog"
                aria-label={`Chapter ${c.number}: ${c.title}, ${eraLabel(c.era)}. Photographed today in ${c.location}. Explore chapter`}
              >
                <span className="strip__frame">
                  <span className="strip__mask">
                    <span className="strip__parallax">
                      <span className="strip__media">
                        {img && (
                          <img
                            className="strip__img"
                            src={img.src}
                            srcSet={img.srcSet}
                            sizes="(max-width: 899px) 100vw, 95vw"
                            alt=""
                            loading="lazy"
                            decoding="async"
                            style={{ objectPosition: c.focus }}
                          />
                        )}
                      </span>
                    </span>
                    <span className="strip__shade" />
                  </span>
                </span>

                <span className="strip__text" aria-hidden="true">
                  <span className="strip__num">{c.number}</span>
                  <span className="strip__copy">
                    <span className="mono strip__era">{eraLabel(c.era)}</span>
                    <span className="strip__title">{c.title}</span>
                    <span className="mono strip__tag">
                      {c.tagline[0]}
                      <br />
                      {c.tagline[1]}
                    </span>
                  </span>
                </span>

                <span className="strip__meta mono" aria-hidden="true">
                  <span className="strip__loc">
                    <span className="rule" />
                    <span className="strip__today">Today</span> {c.location}
                  </span>
                  <span className="strip__coords">
                    {c.coords[0]}
                    <br />
                    {c.coords[1]}
                  </span>
                  <span className="strip__cta">
                    <span className="ul">Explore chapter</span>
                    <Arrow dir="right" />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
