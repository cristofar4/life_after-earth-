import { useExperience } from '../Experience.jsx';
import Waveform from './Waveform.jsx';
import { underlineHandlers } from './Underline.jsx';

export default function Nav({ onNavigate }) {
  const { soundOn, toggleSound } = useExperience();
  const go = (id) => (e) => {
    e.preventDefault();
    onNavigate(id);
  };
  return (
    <header className="nav">
      <a className="nav__mark" href="#top" onClick={go('top')} data-intro="nav" aria-label="After Earth, back to top">
        <span>After</span>
        <span>Earth</span>
      </a>
      <nav className="nav__bar" aria-label="Primary">
        <a className="ul mono" href="#chapters" onClick={go('chapters')} data-intro="nav" {...underlineHandlers}>
          Explore
        </a>
        <a className="ul mono" href="#about" onClick={go('about')} data-intro="nav" {...underlineHandlers}>
          About
        </a>
        <button
          type="button"
          className="nav__sound mono"
          aria-pressed={soundOn}
          onClick={toggleSound}
          data-intro="nav"
          {...underlineHandlers}
        >
          <span className="ul">Sound {soundOn ? 'on' : 'off'}</span>
          <span className={`dot ${soundOn ? 'is-on' : ''}`} aria-hidden="true" />
          <Waveform bars={14} height={16} className="nav__wave" />
        </button>
      </nav>
    </header>
  );
}
