// Video brand tokens (see /brand.md). Import these in every shot
// so all videos stay consistent; change a value here and every shot updates.
//
// Brand: beeplumbgh. Commentary and philosophy of modern life, voiced over game
// footage. Dark, editorial, honey + plum. `/brand-setup` owns this file together
// with /brand.md and fonts.ts; change all three in one pass.
import { Easing } from 'remotion';

// Channel identity. Any shot that puts your name on screen reads it from here,
// so one edit re-brands every video you have ever made in this repo.
export const BRAND = {
  // The wordmark, split in three so the MIDDLE part renders in the accent color.
  // bee + PLUMB + gh: the handle is @beeplumbgh; "plumb" (to measure true) carries the accent.
  wordmark: ['bee', 'plumb', 'gh'] as readonly string[],
  signoff: 'Measure it true.',
  // one-line channel positioning, for end cards / about beats
  tagline: 'Commentary on the modern world, and how to move through it.',
  handle: '@beeplumbgh',
} as const;

// Dark base, on purpose: every beat sits over game footage, and the channel site
// (beeplumbgh.net) is a black terminal. Role names are unchanged from the house
// template, so read them by ROLE: `paper` is the base surface (near-black here) and
// `ink` is primary text (warm bone here). Existing shots stay legible because they
// always paired ink-on-paper.
export const COLORS = {
  // roles
  accent: '#F5C518', // honey, the "bee": key words, marker sweeps, the wordmark middle
  accent2: '#B06EE0', // plum, the "plum": chapter numbers, secondary emphasis, gradients
  signal: '#3FD0C9', // cyan-teal: "this works", confirms, the strategy side of a contrast
  signalAlt: '#00CC44', // terminal green: companion to signal
  warn: '#FF8A3D', // ember: "watch this", attention pops (distinct from honey)
  danger: '#EE4A90', // hot pink: the trap, the cost, the negative side of a contrast
  ink: '#EDE8DC', // bone: primary text on the dark base
  muted: '#9E97AB', // secondary text, captions, citations
  paper: '#0B0A0D', // base surface: near-black with a plum cast
  cream: '#17141C', // raised surface: cards, panels, quote plates
  line: '#2E2837', // 1px borders / rules on dark
  // dark UI / terminal scale (GitHub-ink), for terminal and code mockups
  d900: '#0d1117',
  d800: '#161b22',
  d600: '#30363d',
  d400: '#8b949e',
  d300: '#c9d1d9',
} as const;

// signature gradient: honey -> plum (bee -> plum)
export const GRADIENT = `linear-gradient(120deg, ${COLORS.accent}, ${COLORS.warn} 40%, ${COLORS.accent2})`;

// Editorial, not bubbly: tighter corners than the house default.
export const RADIUS = { card: 10, panel: 8, window: 8, pill: 999 } as const;

// Depth on a dark base comes from deep shadow + a faint rim, not soft grey.
export const SHADOW = {
  soft: '0 12px 40px rgba(0,0,0,0.55)',
  card: '0 24px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(237,232,220,0.06)',
} as const;

// Measured, editorial easings. Use these, never Easing.out(...) wrappers.
export const EASINGS = {
  easeOut: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish: fast arrival, long settle
  easeIn: Easing.bezier(0.7, 0, 0.84, 0),
  easeInOut: Easing.bezier(0.65, 0, 0.35, 1),
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1), // used sparingly: stamps, the hook
} as const;
