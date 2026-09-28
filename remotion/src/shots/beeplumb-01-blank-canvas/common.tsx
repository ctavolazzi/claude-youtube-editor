// Shared layer for the "blank canvas" video: palette, local fonts, easing, and the timing
// helpers every scene uses to sync to the voiceover (vo-timing.json, from tools/gen_vo_local.py).
import React from 'react';
import { interpolate, Easing, staticFile, useCurrentFrame } from 'remotion';
import timing from './vo-timing.json';
import { RUBIK_VAR, COURIERPRIME_400, COURIERPRIME_700, VT323_400 } from './fonts.gen';

export const PROJECT = 'beeplumb-01-blank-canvas';
export const FPS = 30;
export const P = (name: string) => staticFile(`projects/${PROJECT}/${name}`);

// beeplumbgh.net palette, pushed a little brighter for video
export const C = {
  bg: '#0b0910', bg2: '#15101d', panel: '#1b1424', line: '#33264a',
  fg: '#f4f0fa', body: '#c9bedb', dim: '#8a7ba3',
  plum: '#9944cc', plumHi: '#c077f0', plumDeep: '#4a1566',
  yellow: '#f5c518', pink: '#e8297a', cyan: '#22bbcc', green: '#00cc44', dos: '#00ff41',
  red: '#ff3b3b', white: '#ffffff', black: '#000000',
} as const;

// ---- fonts: inlined as data URLs (fonts.gen.ts, from media/projects/<project>/fonts, all OFL)
// and declared with plain @font-face. No delayRender: the renderer already awaits
// document.fonts.ready before capturing each frame, and a module-level delayRender handle
// here was never released during renderMedia (the render died ~60s in).
export const F = { display: 'BPRubik', mono: 'BPCourier', crt: 'BPVT323' } as const;
const FONT_FACES: [string, string, string][] = [
  [F.display, '300 900', RUBIK_VAR],
  [F.mono, '400', COURIERPRIME_400], [F.mono, '700', COURIERPRIME_700],
  [F.crt, '400', VT323_400],
];
if (typeof document !== 'undefined' && !document.getElementById('bp-fonts')) {
  const style = document.createElement('style');
  style.id = 'bp-fonts';
  style.textContent = FONT_FACES.map(([family, weight, url]) =>
    `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;src:url(${url}) format('woff2');}`).join('\n');
  document.head.appendChild(style);
}

// ---- easing + interpolation
export const E = {
  out: Easing.bezier(0.22, 0.72, 0.28, 1),
  inOut: Easing.bezier(0.5, 0, 0.2, 1),
  pop: Easing.bezier(0.34, 1.56, 0.64, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.4),
};
export const iio = (f: number, inR: number[], outR: number[], easing?: (n: number) => number) =>
  interpolate(f, inR, outR, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

// ---- timing
type Word = { w: string; start: number; end: number; bleep?: boolean };
type Line = { id: string; beat: string; text: string; start: number; end: number; words: Word[] };
export const TIMING = timing as unknown as { duration: number; lines: Line[]; beats: Record<string, { start: number; end: number }> };
export const DURATION_FRAMES = Math.ceil(TIMING.duration * FPS);
const byId = new Map(TIMING.lines.map((l) => [l.id, l]));
export const fr = (sec: number) => Math.round(sec * FPS);

export const line = (id: string) => {
  const l = byId.get(id);
  if (!l) throw new Error(`no VO line "${id}" (regenerate vo-timing.json?)`);
  return l;
};
/** Frame a line starts / ends. */
export const L = (id: string) => fr(line(id).start);
export const Lend = (id: string) => fr(line(id).end);
/** Frame the line AFTER `id` starts (scene boundaries); the video end for the last line. */
export const Lnext = (id: string) => {
  const i = TIMING.lines.findIndex((l) => l.id === id);
  return i + 1 < TIMING.lines.length ? fr(TIMING.lines[i + 1].start) : DURATION_FRAMES;
};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
/** Frame a word starts: by index, or by text (nth occurrence) within a line. */
export const W = (id: string, which: number | string, nth = 0) => {
  const ws = line(id).words;
  if (typeof which === 'number') return fr(ws[Math.min(which, ws.length - 1)].start);
  let seen = 0;
  for (const w of ws) if (norm(w.w) === norm(which) && seen++ === nth) return fr(w.start);
  throw new Error(`word "${which}" not in line ${id}`);
};

// ---- scene wrapper: mounts only in [from, to), fades/scales in and out
export const Scene: React.FC<{ from: number; to: number; children: React.ReactNode; fadeIn?: number; fadeOut?: number; zoom?: boolean }> = ({
  from, to, children, fadeIn = 7, fadeOut = 6, zoom = true,
}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const o = Math.min(iio(f, [from, from + fadeIn], [0, 1]), iio(f, [to - fadeOut, to], [1, 0]));
  const s = zoom ? iio(f, [from, from + 12], [1.04, 1], E.out) : 1;
  return <div style={{ position: 'absolute', inset: 0, opacity: o, transform: `scale(${s})` }}>{children}</div>;
};

// ---- common text pieces
export const Kinetic: React.FC<{
  at: number; text: string; size?: number; color?: string; x?: number; y?: number; w?: number;
  align?: 'left' | 'center' | 'right'; weight?: number; font?: string; stroke?: boolean; rot?: number; style?: React.CSSProperties;
}> = ({ at, text, size = 120, color = C.fg, x = 0, y = 0, w = 1920, align = 'center', weight = 900, font = F.display, stroke, rot = 0, style }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 9], [0.6, 1], E.pop);
  const o = iio(f, [at, at + 4], [0, 1]);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, textAlign: align, fontFamily: font, fontWeight: weight,
      fontSize: size, lineHeight: 1.02, color, opacity: o, transform: `scale(${s}) rotate(${rot}deg)`,
      transformOrigin: align === 'left' ? 'left center' : align === 'right' ? 'right center' : 'center',
      WebkitTextStroke: stroke ? `3px ${C.black}` : undefined, textShadow: '0 8px 0 rgba(0,0,0,0.35)', letterSpacing: -1, ...style,
    }}>{text}</div>
  );
};

export const Stamp: React.FC<{ at: number; text: string; color?: string; x: number; y: number; size?: number; rot?: number }> = ({
  at, text, color = C.red, x, y, size = 90, rot = -9,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 6], [2, 1], E.out);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
      opacity: iio(f, [at, at + 3], [0, 1]), border: `8px solid ${color}`, color, padding: '4px 28px', borderRadius: 10,
      fontFamily: F.display, fontWeight: 900, fontSize: size, letterSpacing: 2, whiteSpace: 'nowrap',
      background: 'rgba(11,9,16,0.75)', boxShadow: `0 0 40px ${color}55`,
    }}>{text}</div>
  );
};

export const Card: React.FC<{ x: number; y: number; w: number; h: number; at?: number; color?: string; children?: React.ReactNode; rot?: number; style?: React.CSSProperties }> = ({
  x, y, w, h, at = 0, color = C.plum, children, rot = 0, style,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 10], [0.7, 1], E.pop);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h, background: C.panel, borderRadius: 22,
      border: `4px solid ${color}`, boxShadow: `0 18px 0 rgba(0,0,0,0.35), 0 0 60px ${color}33`,
      transform: `scale(${s}) rotate(${rot}deg)`, opacity: iio(f, [at, at + 4], [0, 1]), overflow: 'hidden', ...style,
    }}>{children}</div>
  );
};

/** Big X drawn across a box. */
export const Cross: React.FC<{ at: number; x: number; y: number; w: number; h: number; color?: string }> = ({ at, x, y, w, h, color = C.red }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const a = iio(f, [at, at + 6], [0, 1], E.out);
  const b = iio(f, [at + 4, at + 10], [0, 1], E.out);
  const len = Math.hypot(w, h);
  return (
    <svg style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }} width={w} height={h}>
      <line x1={0} y1={0} x2={w} y2={h} stroke={color} strokeWidth={22} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - a)} />
      <line x1={w} y1={0} x2={0} y2={h} stroke={color} strokeWidth={22} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - b)} />
    </svg>
  );
};

/** Strike-through that draws across text. */
export const Strike: React.FC<{ at: number; x: number; y: number; w: number; color?: string }> = ({ at, x, y, w, color = C.red }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return <div style={{ position: 'absolute', left: x, top: y, height: 14, borderRadius: 7, background: color, width: w * iio(f, [at, at + 7], [0, 1], E.out) }} />;
};

// deterministic pseudo-random, for particles
export const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
