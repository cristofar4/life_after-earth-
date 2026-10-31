import { useEffect, useRef, useState } from 'react';
import { MEDIA } from '../media.js';
import { useExperience } from '../Experience.jsx';

/**
 * The living city. Plays real looping footage when available; otherwise shows
 * the real photograph with a very slow drift and two separate translucent
 * mist layers (an atmospheric fallback, not footage). Text never lives here.
 */
export default function HeroScene() {
  const { motionPaused, reducedMotion } = useExperience();
  const boxRef = useRef(null);
  const videoRef = useRef(null);
  const fogRef = useRef(null);
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
  const { photo, video, fog } = MEDIA.hero;
  const hasVideo = Boolean(video) && !videoFailed;

  // Every moving layer obeys the same rule: play only when visible and allowed.
  useEffect(() => {
    [videoRef.current, fogRef.current].forEach((v) => {
      if (!v) return;
      if (running) v.play().catch(() => {});
      else v.pause();
    });
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
                  preload="auto"
                  poster={video.poster}
                  aria-label={video.alt || photo?.alt}
                  onError={() => setVideoFailed(true)}
                >
                  <source src={video.src} type="video/mp4" onError={() => setVideoFailed(true)} />
                </video>
              ) : (
                photo && (
                  <img
                    className="scene__media scene__media--still"
                    src={photo.src}
                    srcSet={photo.srcSet}
                    sizes="100vw"
                    alt={photo.alt}
                    fetchpriority="high"
                    decoding="async"
                  />
                )
              )}
              {/* Far mist only in the fallback; a supplied video carries its own. */}
              {!hasVideo && <div className="mist mist--far" style={{ '--mist': `url(${MEDIA.mist.far})` }} aria-hidden="true" />}
            </div>
          </div>
        </div>
        {/* Foreground mist sits outside the parallax stack for depth: real fog
            footage keyed into a matte and screen-blended over the photograph. */}
        {!hasVideo && fog ? (
          <video
            ref={fogRef}
            className="fog"
            src={fog.src}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : (
          <div className="mist mist--near" style={{ '--mist': `url(${MEDIA.mist.near})` }} aria-hidden="true" />
        )}
        <div className="scene__shade" aria-hidden="true" />
      </div>
    </div>
  );
}
