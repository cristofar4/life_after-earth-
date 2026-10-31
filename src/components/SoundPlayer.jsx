import { useEffect, useState } from 'react';
import { useExperience } from '../Experience.jsx';
import Waveform from './Waveform.jsx';
import { MEDIA } from '../media.js';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function SoundPlayer() {
  const { soundOn, toggleSound, soundError } = useExperience();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!soundOn) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [soundOn]);

  return (
    <div className="player" data-intro="detail">
      <div className="player__row">
        <button
          type="button"
          className={`player__toggle ${soundOn ? 'is-on' : ''}`}
          aria-pressed={soundOn}
          onClick={toggleSound}
          aria-label={soundOn ? 'Pause ambient sound' : 'Play ambient sound'}
        >
          {soundOn ? (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l10.5-6.5z" /></svg>
          )}
        </button>
        <Waveform bars={28} height={26} className="player__wave" />
        <p className="mono player__label">
          Sounds of
          <br />
          a quieter planet
        </p>
        <span className="mono player__time" aria-label={`Listening time ${fmt(elapsed)}`}>
          {fmt(elapsed)}
        </span>
      </div>
      <div className="player__row player__row--foot">
        <span className="player__num" aria-hidden="true">01</span>
        <span className="rule" aria-hidden="true" />
        <span className="mono player__note">
          {MEDIA.audio.ambient ? 'Field recording' : 'Live ambience'}
          <br />
          {soundError ? soundError : 'wind · water · birds'}
        </span>
      </div>
    </div>
  );
}
