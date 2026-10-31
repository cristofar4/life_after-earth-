import { useEffect, useRef } from 'react';
import { useExperience } from '../Experience.jsx';

// Deterministic resting silhouette so the idle waveform still reads as sound.
const rest = (i, n) => {
  const x = i / (n - 1);
  return 0.18 + 0.5 * Math.abs(Math.sin(x * 9.3) * Math.cos(x * 3.1)) * (1 - Math.abs(x - 0.5));
};

/**
 * Bars drawn on canvas. Animates only while audio is actually playing,
 * reading levels from the AnalyserNode; otherwise draws once and idles.
 */
export default function Waveform({ bars = 40, className = '', color = 'currentColor', height = 22 }) {
  const ref = useRef(null);
  const { audio, soundOn } = useExperience();

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas.getContext('2d');
    let raf = 0;
    const smooth = new Array(bars).fill(0);

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (levels) => {
      const r = canvas.getBoundingClientRect();
      g.clearRect(0, 0, r.width, r.height);
      g.fillStyle = color === 'currentColor' ? getComputedStyle(canvas).color : color;
      const step = r.width / bars;
      const w = Math.max(1, step * 0.42);
      for (let i = 0; i < bars; i++) {
        const target = levels ? 0.12 + levels[i] * 0.95 : rest(i, bars) * 0.55;
        smooth[i] += (target - smooth[i]) * (levels ? 0.35 : 1);
        const h = Math.max(1.5, Math.min(1, smooth[i]) * r.height);
        g.fillRect(i * step + (step - w) / 2, (r.height - h) / 2, w, h);
      }
    };
    const loop = () => {
      draw(audio.levels(bars));
      raf = requestAnimationFrame(loop);
    };

    size();
    if (soundOn) loop();
    else draw(null);
    const ro = new ResizeObserver(() => {
      size();
      if (!soundOn) draw(null);
    });
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [soundOn, audio, bars, color]);

  return <canvas ref={ref} className={`waveform ${className}`} style={{ height }} aria-hidden="true" />;
}
