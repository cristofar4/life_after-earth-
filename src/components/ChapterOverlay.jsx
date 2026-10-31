import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, DUR, EASE } from '../lib/gsap.js';
import { CHAPTERS, ERAS } from '../content.js';
import Arrow from './Arrow.jsx';
import { underlineHandlers } from './Underline.jsx';

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Geometry of a strip's visible image, as seen on screen right now. */
function stripGeometry(strip) {
  const frame = strip.querySelector('.strip__frame');
  const img = strip.querySelector('.strip__img') || frame;
  const fr = frame.getBoundingClientRect();
  const ir = img.getBoundingClientRect();
  const pts = [...getComputedStyle(frame).clipPath.matchAll(/(-?[\d.]+)%\s+(-?[\d.]+)%/g)].map((m) => [
    fr.left + (parseFloat(m[1]) / 100) * fr.width - ir.left,
    fr.top + (parseFloat(m[2]) / 100) * fr.height - ir.top,
  ]);
  const quad = pts.length === 4 ? pts : [[fr.left - ir.left, fr.top - ir.top], [fr.right - ir.left, fr.top - ir.top], [fr.right - ir.left, fr.bottom - ir.top], [fr.left - ir.left, fr.bottom - ir.top]];
  return {
    rect: { left: ir.left, top: ir.top, width: ir.width, height: ir.height },
    clip: poly(quad),
    visible: fr.bottom > 0 && fr.top < window.innerHeight,
  };
}
const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`;
const fullClip = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return poly([[0, 0], [w, 0], [w, h], [0, h]]);
};
const fullRect = () => ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });


export default function ChapterOverlay({ startIndex, getStrip, onClosed, reducedMotion }) {
  const [current, setCurrent] = useState(startIndex);
  const [era, setEra] = useState(CHAPTERS[startIndex].era);
  const rootRef = useRef(null);
  const boxRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const closeRef = useRef(null);
  const busy = useRef(true);
  const firstEra = useRef(true);
  const scrollY = useRef(window.scrollY);

  const chapter = CHAPTERS[current];
  const [settled, setSettled] = useState(false);
  const eraInfo = ERAS.find((e) => e.key === era);
  const items = () => contentRef.current.querySelectorAll('[data-ov]');

  // Lock page scroll; restore the exact position afterwards.
  useLayoutEffect(() => {
    const y = scrollY.current;
    document.documentElement.classList.add('is-locked');
    return () => {
      document.documentElement.classList.remove('is-locked');
      window.scrollTo(0, y);
    };
  }, []);

  // ENTER THE IMAGE: animate the strip's exact image bounds to fullscreen.
  useLayoutEffect(() => {
    const strip = getStrip(startIndex);
    const g = stripGeometry(strip);
    strip.classList.add('is-source');
    rootRef.current.focus({ preventScroll: true });
    const done = () => {
      gsap.set(boxRef.current, { clearProps: 'left,top,width,height,clipPath' });
      busy.current = false;
      setSettled(true);
      closeRef.current?.focus({ preventScroll: true });
    };
    if (reducedMotion) {
      gsap.timeline({ onComplete: done })
        .fromTo([backdropRef.current, boxRef.current], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
        .fromTo(items(), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0);
      return;
    }
    gsap.set(boxRef.current, { ...g.rect, clipPath: g.clip });
    gsap
      .timeline({ onComplete: done })
      .fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(boxRef.current, { ...fullRect(), clipPath: fullClip(), duration: DUR.scene, ease: EASE.scene }, 0)
      .fromTo(items(), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: EASE.out }, DUR.scene - 0.1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Era change: year, narrative and image update together.
  useLayoutEffect(() => {
    if (firstEra.current) {
      firstEra.current = false;
      return;
    }
    if (reducedMotion) return;
    gsap.fromTo(
      contentRef.current.querySelectorAll('[data-era-sync]'),
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: EASE.out }
    );
  }, [era, reducedMotion]);

  const close = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setSettled(false);
    if (era !== CHAPTERS[current].era) firstEra.current = true;
    setEra(CHAPTERS[current].era); // return to the image the strip shows
    const strip = getStrip(current);
    const finish = () => {
      strip.classList.remove('is-source');
      onClosed(current);
    };
    const box = boxRef.current;
    if (reducedMotion) {
      gsap.to([rootRef.current], { autoAlpha: 0, duration: 0.2, onComplete: finish });
      return;
    }
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(items(), { autoAlpha: 0, y: -10, duration: 0.25, stagger: 0.02, ease: 'power2.in' });
    // Measure after the page is still at the restored position (scroll is locked).
    const g = stripGeometry(strip);
    if (g.visible) {
      tl.fromTo(box, { ...fullRect(), clipPath: fullClip() }, { ...g.rect, clipPath: g.clip, duration: DUR.scene * 0.9, ease: EASE.scene }, 0.18);
      tl.to(backdropRef.current, { autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, 0.18 + DUR.scene * 0.9 - 0.5);
    } else {
      tl.to([box, backdropRef.current], { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' }, 0.2);
    }
  }, [current, era, getStrip, onClosed, reducedMotion]);

  const go = useCallback(
    (dir) => {
      if (busy.current) return;
      busy.current = true;
      const next = (current + dir + CHAPTERS.length) % CHAPTERS.length;
      getStrip(current).classList.remove('is-source');
      getStrip(next).classList.add('is-source');
      const swap = () => {
        if (CHAPTERS[next].era !== era) firstEra.current = true; // our own reveal runs instead
        setCurrent(next);
        setEra(CHAPTERS[next].era);
      };
      if (reducedMotion) {
        swap();
        busy.current = false;
        return;
      }
      gsap
        .timeline()
        .to(items(), { autoAlpha: 0, x: -dir * 24, duration: 0.25, stagger: 0.015, ease: 'power2.in' })
        .add(swap)
        .fromTo(items(), { autoAlpha: 0, x: dir * 24 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.05, ease: EASE.out, immediateRender: false }, '+=0.25')
        .add(() => (busy.current = false));
    },
    [current, era, getStrip, reducedMotion]
  );

  // Keyboard: Escape closes, Tab is trapped, ←/→ change chapter.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        const f = [...rootRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === rootRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.target.closest('.timeline')) {
        e.preventDefault();
        go(e.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close, go]);

  const onTimelineKey = (e) => {
    const i = ERAS.findIndex((x) => x.key === era);
    let n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = Math.min(ERAS.length - 1, i + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = Math.max(0, i - 1);
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = ERAS.length - 1;
    if (n === null) return;
    e.preventDefault();
    setEra(ERAS[n].key);
    e.currentTarget.querySelectorAll('button')[n].focus();
  };

  const eraIndex = ERAS.findIndex((e) => e.key === era);
  const prev = CHAPTERS[(current - 1 + CHAPTERS.length) % CHAPTERS.length];
  const next = CHAPTERS[(current + 1) % CHAPTERS.length];

  return (
    <div className="overlay" ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="ov-title" tabIndex={-1}>
      <div className="overlay__backdrop" ref={backdropRef} />
      <div className="overlay__box" ref={boxRef} data-era={chapter.era}>
        {CHAPTERS.map((c) => {
          if (!c.image) return null;
          const active = c.id === chapter.id;
          return (
            <img
              key={c.id}
              className={`overlay__img ${active ? 'is-active' : ''}`}
              src={c.image.src}
              srcSet={c.image.srcSet}
              sizes="100vw"
              alt={active ? c.image.alt : ''}
              aria-hidden={!active}
              decoding="async"
              style={{ objectPosition: c.focus }}
            />
          );
        })}
        {chapter.video && !reducedMotion && settled && (
          <video
            key={chapter.id}
            className="overlay__video"
            src={chapter.video.src}
            poster={chapter.video.poster}
            muted
            loop
            playsInline
            autoPlay
            aria-hidden="true"
            onPlaying={(e) => e.currentTarget.classList.add('is-on')}
          />
        )}
        <div className="overlay__haze" aria-hidden="true" />
        <div className="overlay__shade" aria-hidden="true" />
      </div>

      <div className="overlay__content" ref={contentRef}>
        <div className="overlay__top">
          <p className="mono" data-ov>
            Chapter {chapter.number} / 0{CHAPTERS.length} <span className="sep">·</span> Imagined future, real place
          </p>
          <button type="button" className="close" ref={closeRef} onClick={close} data-ov>
            <span className="mono ul" {...underlineHandlers}>Close</span>
            <span className="close__x" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </span>
            <span className="sr-only">chapter (Escape)</span>
          </button>
        </div>

        <div className="overlay__body">
          <div className="overlay__story">
            <p className="mono overlay__loc" data-ov>
              <span className="rule" aria-hidden="true" />
              {chapter.location}
              <span className="overlay__coords">
                {chapter.coords[0]}, {chapter.coords[1]}
              </span>
            </p>
            <h2 id="ov-title" className="overlay__title" data-ov>
              {chapter.title}
            </h2>
            <p className="overlay__year" data-ov aria-live="polite">
              <span data-era-sync className="overlay__yearnum">{eraInfo.years.toLocaleString('en-US')}</span>
              <span data-era-sync className="mono">years later<br />imagined</span>
            </p>
            <p className="overlay__narrative" data-ov>
              <span data-era-sync>{chapter.narrative[era]}</span>
            </p>
            <p className="overlay__seen" data-ov>
              {chapter.seen}
              {chapter.image?.credit && (
                <span className="overlay__credit mono">
                  Photo{' '}
                  <a href={chapter.image.credit.source} target="_blank" rel="noopener noreferrer" className="ul" {...underlineHandlers}>
                    {chapter.image.credit.author}
                  </a>{' '}
                  · {chapter.image.credit.license}
                  {chapter.video?.credit && (
                    <>
                      {' '}· Footage{' '}
                      <a href={chapter.video.credit.source} target="_blank" rel="noopener noreferrer" className="ul" {...underlineHandlers}>
                        {chapter.video.credit.author}
                      </a>{' '}
                      · {chapter.video.credit.license}
                    </>
                  )}
                </span>
              )}
            </p>
          </div>

          <div className="overlay__controls">
            <div className="timeline" role="group" aria-label="Imagined time period" onKeyDown={onTimelineKey} data-ov>
              <span className="timeline__track" aria-hidden="true">
                <span className="timeline__fill" style={{ transform: `scaleX(${eraIndex / (ERAS.length - 1)})` }} />
              </span>
              {ERAS.map((e) => {
                return (
                  <button
                    key={e.key}
                    type="button"
                    className={`timeline__stop ${e.key === era ? 'is-active' : ''}`}
                    aria-pressed={e.key === era}
                    tabIndex={e.key === era ? 0 : -1}
                    onClick={() => setEra(e.key)}
                  >
                    <span className="timeline__dot" aria-hidden="true" />
                    <span className="mono">
                      <span className="timeline__long">{e.label}</span>
                      <span className="timeline__short">{e.short}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="overlay__nav" data-ov>
              <button type="button" className="step step--prev" onClick={() => go(-1)} {...underlineHandlers}>
                <span className="step__circle"><Arrow dir="left" /></span>
                <span className="mono">
                  <span className="step__k">Previous</span>
                  <span className="ul">{prev.title}</span>
                </span>
              </button>
              <button type="button" className="step step--next" onClick={() => go(1)} {...underlineHandlers}>
                <span className="mono">
                  <span className="step__k">Next</span>
                  <span className="ul">{next.title}</span>
                </span>
                <span className="step__circle"><Arrow dir="right" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
