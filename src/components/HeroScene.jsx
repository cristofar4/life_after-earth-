import { useEffect, useRef, useState } from 'react';
import { MEDIA } from '../media.js';
import { useExperience } from '../Experience.jsx';

/**
 * The living city. Uses the hero video when one is supplied; otherwise a
 * temporary fallback: the still image with a very slow drift and two
 * separate translucent mist layers. Text never lives in here.
 */
export default function HeroScene() {
  const { motionPaused, reducedMotion } = useExperience();
  const boxRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.02 });
    io.observe(boxRef.current);
    const vis = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', vis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  const running = !motionPaused && inView && pageVisible;
  const hasVideo = Boolean(MEDIA.hero.video) && !videoFailed;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (running) v.play().catch(() => {});
    else v.pause();
  }, [running, hasVideo]);

  return (
    <div className={`scene-box ${running ? '' : 'is-paused'}`} ref={boxRef}>
      <div className="scene-reveal">
        <div className="scene-intro">
          <div className="scene-expand">
            <div className="scene-parallax">
              {hasVideo ? (
                <video
                  ref={videoRef}
                  className="scene__media"
                  muted
                  loop
                  playsInline
                  autoPlay={!reducedMotion}
                  preload="metadata"
                  poster={MEDIA.hero.poster}
                  aria-label={MEDIA.hero.posterAlt}
                  onError={() => setVideoFailed(true)}
                >
                  {MEDIA.hero.videoWebm && <source src={MEDIA.hero.videoWebm} type="video/webm" />}
                  <source src={MEDIA.hero.video} type="video/mp4" onError={() => setVideoFailed(true)} />
                </video>
              ) : (
                <img
                  className="scene__media scene__media--still"
                  src={MEDIA.hero.poster}
                  alt={MEDIA.hero.posterAlt}
                  fetchpriority="high"
                  decoding="async"
                />
              )}
              {/* Far mist only in the fallback; a supplied video carries its own. */}
              {!hasVideo && <div className="mist mist--far" style={{ '--mist': `url(${MEDIA.mist.far})` }} aria-hidden="true" />}
            </div>
          </div>
        </div>
        {/* Foreground mist sits outside the parallax stack for depth. */}
        <div className="mist mist--near" style={{ '--mist': `url(${MEDIA.mist.near})` }} aria-hidden="true" />
        <div className="scene__shade" aria-hidden="true" />
      </div>
    </div>
  );
}
