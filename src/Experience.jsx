import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AmbientAudio } from './lib/ambientAudio.js';
import { MEDIA } from './media.js';
import { MQ } from './lib/gsap.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';

const Ctx = createContext(null);

export function ExperienceProvider({ children }) {
  const reducedMotion = useMediaQuery(MQ.reduce);
  const isDesktop = useMediaQuery(MQ.desktop);
  const audioRef = useRef(null);
  if (!audioRef.current) audioRef.current = new AmbientAudio(MEDIA.audio.ambient);
  const [soundOn, setSoundOn] = useState(false);
  const [soundError, setSoundError] = useState(null);
  // Motion starts paused when the visitor prefers reduced motion.
  const [motionPaused, setMotionPaused] = useState(reducedMotion);
  useEffect(() => setMotionPaused(reducedMotion), [reducedMotion]);

  useEffect(() => audioRef.current.onChange(setSoundOn), []);
  useEffect(() => () => audioRef.current.stop(), []);

  const toggleSound = useCallback(async () => {
    const a = audioRef.current;
    try {
      if (a.playing) a.stop();
      else await a.start();
      setSoundError(null);
    } catch (e) {
      setSoundError('Audio could not start in this browser.');
    }
  }, []);

  const value = useMemo(
    () => ({
      audio: audioRef.current,
      soundOn,
      soundError,
      toggleSound,
      motionPaused,
      toggleMotion: () => setMotionPaused((p) => !p),
      reducedMotion,
      isDesktop,
    }),
    [soundOn, soundError, toggleSound, motionPaused, reducedMotion, isDesktop]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useExperience = () => useContext(Ctx);
