/**
 * Directional underline: grows from the side the pointer entered and
 * retracts toward the side it left. Works on any element via props spread.
 */
export function directional(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--ul-origin', e.clientX < r.left + r.width / 2 ? 'left' : 'right');
}

export const underlineHandlers = { onPointerEnter: directional, onPointerLeave: directional };
