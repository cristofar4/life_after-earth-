import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/** Shared motion system — every animation picks from these. */
export const DUR = {
  micro: 0.2, // small interactions 150–250ms
  reveal: 0.8, // content reveals 600–900ms
  scene: 1.2, // major scene transitions 900–1400ms
};
export const EASE = {
  out: 'power3.out',
  inOut: 'power3.inOut',
  scene: 'expo.inOut',
};

export const MQ = {
  desktop: '(min-width: 900px)',
  mobile: '(max-width: 899.98px)',
  reduce: '(prefers-reduced-motion: reduce)',
  hover: '(hover: hover) and (pointer: fine)',
};

export { gsap, ScrollTrigger };
