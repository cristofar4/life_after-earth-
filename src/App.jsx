import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from './lib/gsap.js';
import { ExperienceProvider, useExperience } from './Experience.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Chapters from './components/Chapters.jsx';
import ChapterOverlay from './components/ChapterOverlay.jsx';
import Comparison from './components/Comparison.jsx';
import About from './components/About.jsx';

function Site() {
  const { reducedMotion } = useExperience();
  const stripRefs = useRef([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const navigate = useCallback(
    (id) => {
      const target = id === 'top' ? document.getElementById('top') : document.getElementById(id);
      const y = id === 'top' ? 0 : target;
      gsap.to(window, {
        scrollTo: { y, autoKill: true },
        duration: reducedMotion ? 0 : 1.4,
        ease: 'power3.inOut',
        onComplete: () => target?.focus({ preventScroll: true }),
      });
    },
    [reducedMotion]
  );

  const getStrip = useCallback((i) => stripRefs.current[i], []);
  const onClosed = useCallback((i) => {
    setOpen(null);
    requestAnimationFrame(() => stripRefs.current[i]?.querySelector('button')?.focus({ preventScroll: true }));
  }, []);

  return (
    <>
      <a className="skip mono" href="#chapters" onClick={(e) => { e.preventDefault(); navigate('chapters'); }}>
        Skip to chapters
      </a>
      <Nav onNavigate={navigate} />
      <main inert={open !== null ? '' : undefined}>
        <Hero onEnter={() => navigate('chapters')} />
        <Chapters onOpen={setOpen} stripRefs={stripRefs} />
        <Comparison />
        <About onNavigate={navigate} />
      </main>
      {open !== null && (
        <ChapterOverlay startIndex={open} getStrip={getStrip} onClosed={onClosed} reducedMotion={reducedMotion} />
      )}
    </>
  );
}

export default function App() {
  return (
    <ExperienceProvider>
      <Site />
    </ExperienceProvider>
  );
}
