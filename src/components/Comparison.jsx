import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, MQ, EASE } from '../lib/gsap.js';
import { MEDIA } from '../media.js';

const ERA_ROWS = [
  { key: 'past', label: 'Past', side: 'left' },
  { key: 'present', label: 'Present', side: 'left' },
  { key: '100', label: '100 years', side: 'right' },
  { key: '1000', label: '1,000 years', side: 'right' },
];

export default function Comparison() {
  const root = useRef(null);
  const circle = useRef(null);
  const handle = useRef(null);
  const pos = useRef(50);
  const demo = useRef(null);
  const touched = useRef(false);
  const [left, setLeft] = useState('present');
  const [right, setRight] = useState('100');
  const leftImg = MEDIA.compare[left];
  const rightImg = MEDIA.compare[right];
  const label = (k) => ERA_ROWS.find((r) => r.key === k).label;

  const setPos = (p) => {
    const v = Math.max(0, Math.min(100, p));
    pos.current = v;
    circle.current.style.setProperty('--pos', `${v}%`);
    const r = Math.round(v);
    handle.current.setAttribute('aria-valuenow', r);
    handle.current.setAttribute('aria-valuetext', `${r}% ${label(left)}, ${100 - r}% ${label(right)}`);
  };
  const stopDemo = () => {
    touched.current = true;
    demo.current?.kill();
  };

  // Pointer: the boundary is written directly on every move — no easing lag.
  useEffect(() => {
    const el = circle.current;
    let dragging = false;
    const fromEvent = (e) => {
      const r = el.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    };
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      stopDemo();
      dragging = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
      fromEvent(e);
    };
    const move = (e) => dragging && fromEvent(e);
    const up = () => {
      dragging = false;
      el.classList.remove('is-dragging');
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }); // rebinds with current labels

  useLayoutEffect(() => {
    setPos(50);
    const mm = gsap.matchMedia(root);
    mm.add({ reduce: MQ.reduce }, (c) => {
      if (c.conditions.reduce) return;
      // Heading wipes in from the left, line by line (no fade-up).
      gsap.from('.shift__title .line > span', {
        clipPath: 'inset(0% 100% 0% 0%)',
        x: -30,
        duration: 0.9,
        stagger: 0.12,
        ease: EASE.out,
        scrollTrigger: { trigger: '.shift__title', start: 'top 80%' },
      });
      // Circular world reveal, then one short demonstration of the handle.
      const tl = gsap.timeline({ scrollTrigger: { trigger: circle.current, start: 'top 75%' } });
      tl.fromTo('.compare__clip', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.2, ease: EASE.scene })
        .from('.compare__layer img', { scale: 1.25, duration: 1.4, ease: EASE.out }, 0)
        .from('.compare__handle, .compare__line, .compare__tag', { autoAlpha: 0, duration: 0.4, stagger: 0.05 }, 0.9)
        .from('.shift__eras li, .shift__hint', { autoAlpha: 0, x: 16, duration: 0.6, stagger: 0.06, ease: EASE.out }, 0.5)
        .add(() => {
          if (touched.current) return;
          const o = { p: 50 };
          demo.current = gsap
            .timeline({ onUpdate: () => setPos(o.p) })
            .to(o, { p: 32, duration: 0.7, ease: 'power2.inOut' })
            .to(o, { p: 64, duration: 0.9, ease: 'power2.inOut' })
            .to(o, { p: 50, duration: 0.6, ease: 'power2.out' });
        }, 1.3);
    });
    return () => {
      demo.current?.kill();
      mm.revert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 2;
    const map = {
      ArrowLeft: pos.current - step,
      ArrowDown: pos.current - step,
      ArrowRight: pos.current + step,
      ArrowUp: pos.current + step,
      PageDown: pos.current - 10,
      PageUp: pos.current + 10,
      Home: 0,
      End: 100,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    stopDemo();
    setPos(map[e.key]);
  };

  return (
    <section className="shift" ref={root} aria-labelledby="shift-title">
      <h2 className="shift__title" id="shift-title">
        <span className="line"><span>Witness</span></span>
        <span className="line"><span>the shift</span></span>
      </h2>

      <div className="compare">
        <div className="compare__circle" ref={circle} style={{ '--pos': '50%' }}>
          <div className="compare__clip">
            <div className="compare__layer compare__layer--left">
              {leftImg && <img src={leftImg.src} alt={leftImg.alt} loading="lazy" decoding="async" />}
            </div>
            <div className="compare__layer compare__layer--right">
              {rightImg && <img src={rightImg.src} alt={rightImg.alt} loading="lazy" decoding="async" />}
            </div>
            <span className="compare__line" aria-hidden="true" />
            <span className="compare__tag compare__tag--l mono" aria-hidden="true">{label(left)}</span>
            <span className="compare__tag compare__tag--r mono" aria-hidden="true">{label(right)}</span>
          </div>
          <span
            className="compare__handle"
            ref={handle}
            role="slider"
            tabIndex={0}
            aria-label={`Compare ${label(left)} with ${label(right)} imagined`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-orientation="horizontal"
            onKeyDown={onKey}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <div className="shift__side">
        <ul className="shift__eras" aria-label="Eras">
          {ERA_ROWS.map((r) => {
            const available = Boolean(MEDIA.compare[r.key]);
            const active = r.key === left || r.key === right;
            return (
              <li key={r.key}>
                <button
                  type="button"
                  className={`era ${active ? 'is-active' : ''}`}
                  disabled={!available}
                  aria-pressed={available ? active : undefined}
                  onClick={() => (r.side === 'left' ? setLeft(r.key) : setRight(r.key))}
                >
                  <span className="era__dot" aria-hidden="true" />
                  <span className="mono">{r.label}</span>
                  {!available && <span className="mono era__na">image not supplied</span>}
                  {available && <span className="sr-only">, shown on the {r.side}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mono shift__hint">
          <span className="rule" aria-hidden="true" />
          Drag to see
          <br />
          time in motion
        </p>
        {!MEDIA.compare.matchedPair && (
          <p className="mono shift__note">Stand-in images · viewpoints not yet matched</p>
        )}
      </div>
    </section>
  );
}
