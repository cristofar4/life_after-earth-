import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, MQ, EASE } from '../lib/gsap.js';
import { useExperience } from '../Experience.jsx';
import HeroScene from './HeroScene.jsx';
import SoundPlayer from './SoundPlayer.jsx';
import Arrow from './Arrow.jsx';
import { underlineHandlers } from './Underline.jsx';
import { HERO } from '../content.js';

export default function Hero({ onEnter }) {
  const root = useRef(null);
  const { isDesktop, reducedMotion, motionPaused, toggleMotion } = useExperience();
  const pinned = isDesktop && !reducedMotion;

  // 1 — Cinematic opening (plays once, < 2 s).
  useLayoutEffect(() => {
    if (window.matchMedia(MQ.reduce).matches) return;
    const desktop = window.matchMedia(MQ.desktop).matches;
    const at = desktop ? '66% 46%' : '50% 50%';
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });
      tl.from(document.querySelectorAll('[data-intro="nav"]'), { autoAlpha: 0, y: -10, duration: 0.45, stagger: 0.05 }, 0)
        .fromTo('.scene-reveal', { clipPath: `circle(3.5% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 1.2, ease: 'expo.inOut' }, 0.12)
        .from('.scene-intro', { scale: 1.3, duration: 1.4, ease: 'power3.out' }, 0.12);
      if (desktop) tl.from('.panel__inner', { xPercent: -100, duration: 0.95, ease: EASE.inOut }, 0.22);
      else tl.from('.panel__inner', { autoAlpha: 0, y: 30, duration: 0.8 }, 0.5);
      tl.from('.hero .h1 .line > span', { yPercent: 115, duration: 0.8, stagger: 0.1 }, 0.72)
        .from('.lede, .enter', { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.08 }, 1.05)
        .from('[data-intro="detail"]', { autoAlpha: 0, duration: 0.55, stagger: 0.05 }, 1.22);
    }, root);
    return () => ctx.revert();
  }, []);

  // 2 — Hero → world transition (pinned on desktop, simple reveals elsewhere).
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root);
    mm.add({ desktop: MQ.desktop, reduce: MQ.reduce }, (c) => {
      const { desktop, reduce } = c.conditions;
      if (reduce) return;
      const chapters = document.getElementById('chapters');
      if (desktop) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=110%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to('.panel', { xPercent: -101, ease: 'power2.inOut', duration: 0.42 }, 0)
          .to('.details', { autoAlpha: 0, duration: 0.16 }, 0)
          .fromTo('.scene-expand', { scale: 1.08 }, { scale: 1, ease: 'none', duration: 0.6 }, 0)
          .fromTo('.world__shade', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.18)
          .fromTo('.world .line > span', { yPercent: 115 }, { yPercent: 0, duration: 0.32, stagger: 0.1, ease: 'power2.out' }, 0.36)
          .fromTo('.world__copy, .world__aside', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.06 }, 0.62)
          .to({}, { duration: 0.14 });
        // Hero drifts slower than the page once the pin releases.
        gsap.fromTo('.scene-parallax', { y: 0 }, {
          y: () => window.innerHeight * 0.15,
          ease: 'none',
          scrollTrigger: { trigger: chapters, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
        });
      } else {
        gsap.fromTo('.scene-parallax', { y: 0 }, {
          y: () => window.innerHeight * 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.scene-box', start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.timeline({ scrollTrigger: { trigger: '.world', start: 'top 80%' } })
          .from('.world .line > span', { yPercent: 115, duration: 0.8, stagger: 0.1, ease: EASE.out })
          .from('.world__copy, .world__aside', { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.08, ease: EASE.out }, 0.3);
      }
    });
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, []);

  return (
    <section id="top" className="hero" data-mode={pinned ? 'pinned' : 'static'} ref={root} aria-labelledby="hero-title" tabIndex={-1}>
      <div className="stage">
        <HeroScene />

        <div className="details">
          <p className="mono details__coords" data-intro="detail">
            {HERO.coords[0]}<br />{HERO.coords[1]}<br />
            <span className="details__place">{HERO.place}</span>
            <span className="rule" aria-hidden="true" />
          </p>
          <p className="mono details__tag" data-intro="detail">
            <span className="details__kind">{HERO.kind}</span>
            {HERO.credit && (
              <a className="details__credit ul" href={HERO.credit.source} target="_blank" rel="noopener noreferrer" {...underlineHandlers}>
                {HERO.credit.author} · {HERO.credit.license}
              </a>
            )}
          </p>
          <div className="year-mark" data-intro="detail">
            <svg className="year-mark__ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="47" />
              <g className="year-mark__orbit">
                <circle className="year-mark__dot" cx="50" cy="3" r="2.6" />
              </g>
            </svg>
            <span className="mono">{HERO.mark[0]}<br />{HERO.mark[1]}<br />{HERO.mark[2]}</span>
          </div>
          <div className="details__foot" data-intro="detail">
            <p className="mono">
              Cities fade.
              <br />
              Forests remember.
            </p>
            <button type="button" className="motion-toggle mono" aria-pressed={motionPaused} onClick={toggleMotion}>
              {motionPaused ? (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l10.5-6.5z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
              )}
              <span>{motionPaused ? 'Play motion' : 'Pause motion'}</span>
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel__inner">
            <div className="panel__top" aria-hidden="true" />
            <div className="panel__ivory">
              <p className="eyebrow mono">An interactive field guide</p>
              <h1 className="h1" id="hero-title">
                <span className="line"><span>What comes</span></span>
                <span className="line"><span>after us?</span></span>
              </h1>
              <p className="lede">
                A journey through a more-than-human world. Explore how life reclaims, how cities erode, and how Earth moves
                forward.
              </p>
              <button type="button" className="enter" onClick={onEnter} {...underlineHandlers}>
                <span className="enter__dot">
                  <Arrow dir="right" />
                </span>
                <span className="ul mono">Enter the experience</span>
              </button>
            </div>
            <SoundPlayer />
          </div>
        </div>
      </div>

      <div className="world">
        <div className="world__shade" aria-hidden="true" />
        <div className="world__inner">
          <h2 className="h2">
            <span className="line"><span>Time changes</span></span>
            <span className="line"><span>everything.</span></span>
          </h2>
          <div className="world__copy">
            <p>
              Without us, the planet doesn’t stand still. It transforms — rapidly, beautifully, unpredictably. Scroll to
              explore three moments in a longer story.
            </p>
            <span className="rule" aria-hidden="true" />
          </div>
          <p className="mono world__aside">
            Same places
            <br />
            Different worlds
          </p>
        </div>
      </div>
    </section>
  );
}
