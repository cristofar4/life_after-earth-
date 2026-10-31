/** Arrow glyph that slides out and is replaced by a twin on hover (CSS-driven). */
export default function Arrow({ dir = 'right', className = '' }) {
  const path =
    dir === 'left'
      ? 'M19 12H5m6-6-6 6 6 6'
      : dir === 'down'
        ? 'M12 5v14m-6-6 6 6 6-6'
        : 'M5 12h14m-6-6 6 6-6 6';
  const svg = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
  return (
    <span className={`arrow arrow--${dir} ${className}`} aria-hidden="true">
      <span className="arrow__a">{svg}</span>
      <span className="arrow__b">{svg}</span>
    </span>
  );
}
