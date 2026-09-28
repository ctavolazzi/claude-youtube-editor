// Kinetic kit: the HOT layer of the beeplumbgh look. Builds on lib/commentary.tsx (the calm
// cards) with the stuff that makes an essay feel alive: a flying game-like placeholder bed,
// a moving camera with punch-ins and shake, words that SLAM in, whip / zoom-through / glitch
// scene transitions, hand-drawn annotations, rubber stamps, and beat-locked SFX.
//
// Timing is musical: at 60fps and 120 BPM one beat is 30 frames and one bar is 120.
// Cut on bars, slam on beats. `beat(n)` / `bar(n)` give frame numbers on the grid.
//
// Frame-based only; every interpolate range strictly increasing and clamped.
import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { COLORS } from '../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IN = Easing.bezier(0.7, 0, 0.84, 0);
const SNAP = Easing.bezier(0.2, 1.6, 0.4, 1); // overshoot, for slams
const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

export const BEAT = 30;
export const BAR = 120;
export const beat = (n: number, phase = 2) => phase + Math.round(n * BEAT);
export const bar = (n: number, phase = 2) => phase + n * BAR;

const lerp = (f: number, a: number, b: number, from: number, to: number, easing = OUT) =>
  interpolate(f, [a, Math.max(b, a + 1)], [from, to], { ...C, easing });

// decaying pulse after each hit frame: 1 at the hit, 0 after `len` frames
export const pulse = (frame: number, hits: number[], len = 18) =>
  hits.reduce((m, h) => (frame >= h && frame < h + len ? Math.max(m, 1 - (frame - h) / len) : m), 0);

// =============================================================================
// FLIGHT BED: a procedural "game" to stand in for real gameplay. Low flight over a neon grid
// between monoliths, banking, boosting on the beat. Swap for real footage via GameplayBed.
// =============================================================================
const W = 1920, H = 1080, F = 900, CAM_H = 2.2, Z_FAR = 70;
const TOWERS = new Array(46).fill(0).map((_, i) => {
  const side = random(`ts${i}`) > 0.5 ? 1 : -1;
  return {
    x: side * (3.2 + random(`tx${i}`) * 12),
    z0: random(`tz${i}`) * Z_FAR,
    h: 2 + random(`th${i}`) ** 1.6 * 16,
    w: 0.8 + random(`tw${i}`) * 2.2,
    rim: random(`tr${i}`) > 0.5 ? COLORS.accent : COLORS.accent2,
    lit: random(`tl${i}`) > 0.55,
  };
});
const STREAKS = new Array(40).fill(0).map((_, i) => ({
  x: (random(`sx${i}`) - 0.5) * 16, y: random(`sy${i}`) * 5 - 1, z0: random(`sz${i}`) * 24,
}));

export const FlightBed: React.FC<{ boosts?: number[]; speed?: number; dim?: number }> = ({ boosts = [], speed = 0.32, dim = 0.25 }) => {
  const frame = useCurrentFrame();
  // distance travelled: steady cruise + a surge after every boost
  const travel = frame * speed + boosts.reduce((s, b) => s + 9 * lerp(frame, b, b + 45, 0, 1), 0);
  const boost = pulse(frame, boosts, 40);
  const bank = Math.sin(frame / 95) * 4 + Math.sin(frame / 37) * 1.2;
  const yaw = Math.sin(frame / 140) * 60;
  const y0 = 470 + Math.sin(frame / 70) * 14;
  const vx = W / 2 + yaw;
  const P = (x: number, y: number, z: number) => [vx + (F * x) / z, y0 + (F * (CAM_H - y)) / z] as const;
  const fog = (z: number) => Math.max(0, 1 - z / Z_FAR);

  const floorLines: React.ReactNode[] = [];
  for (let i = 0; i < 24; i++) {
    const z = ((i * 3 - travel) % 72 + 72) % 72 + 0.6;
    const [, y] = P(0, 0, z);
    floorLines.push(<line key={`h${i}`} x1={-400} x2={W + 400} y1={y} y2={y} stroke={COLORS.accent2} strokeWidth={Math.max(0.6, 3 / z * 2)} opacity={fog(z) * 0.8} />);
  }
  for (let k = -14; k <= 14; k++) {
    const [x1, y1] = P(k * 3, 0, 0.6);
    const [x2, y2] = P(k * 3, 0, Z_FAR);
    floorLines.push(<line key={`v${k}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.accent2} strokeWidth={1.4} opacity={0.45} />);
  }

  const towers = TOWERS.map((t, i) => ({ ...t, i, z: ((t.z0 - travel) % Z_FAR + Z_FAR) % Z_FAR + 0.8 }))
    .sort((a, b) => b.z - a.z)
    .map((t) => {
      const [l, bot] = P(t.x - t.w / 2, 0, t.z);
      const [r, top] = P(t.x + t.w / 2, t.h, t.z);
      const inner = t.x > 0 ? l : r;
      const o = Math.min(1, fog(t.z) * 1.6);
      return (
        <g key={t.i} opacity={o}>
          <rect x={l} y={top} width={Math.max(1, r - l)} height={Math.max(1, bot - top)} fill="#0c0911" />
          <rect x={inner - 1.5} y={top} width={3} height={Math.max(1, bot - top)} fill={t.rim} opacity={0.85} />
          <rect x={l} y={top} width={Math.max(1, r - l)} height={3} fill={t.rim} opacity={0.6} />
          {t.lit && new Array(5).fill(0).map((_, j) => (
            <rect key={j} x={l + (r - l) * 0.3} y={top + (bot - top) * (0.15 + j * 0.15)} width={(r - l) * 0.4} height={Math.max(1, (bot - top) * 0.03)} fill={COLORS.accent} opacity={0.35 + 0.4 * random(`w${t.i}${j}`)} />
          ))}
        </g>
      );
    });

  const streaks = STREAKS.map((s, i) => {
    const z = ((s.z0 - travel * 2.2) % 24 + 24) % 24 + 0.5;
    const [x1, y1] = P(s.x, s.y, z);
    const [x2, y2] = P(s.x, s.y, z + 1.2 + boost * 4);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.ink} strokeWidth={2} opacity={(0.15 + boost * 0.6) * (1 - z / 24)} />;
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: COLORS.paper }}>
      <AbsoluteFill style={{ transform: `rotate(${bank}deg) scale(${1.12 + boost * 0.05})` }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="fb-sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#07050b" />
              <stop offset="0.55" stopColor="#2a1440" />
              <stop offset="0.8" stopColor="#6a2350" />
            </linearGradient>
            <linearGradient id="fb-sun" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={COLORS.accent} />
              <stop offset="1" stopColor={COLORS.danger} />
            </linearGradient>
            <mask id="fb-sun-cut">
              <rect x={0} y={0} width={W} height={H} fill="#fff" />
              {new Array(9).fill(0).map((_, i) => (
                <rect key={i} x={0} y={y0 - 150 + i * 22 + ((frame * 0.4) % 22)} width={W} height={3 + i * 1.6} fill="#000" />
              ))}
            </mask>
            <linearGradient id="fb-floor" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1a0d24" />
              <stop offset="1" stopColor="#050407" />
            </linearGradient>
          </defs>
          <rect x={-400} y={-400} width={W + 800} height={y0 + 400} fill="url(#fb-sky)" />
          {new Array(60).fill(0).map((_, i) => (
            <circle key={i} cx={random(`st${i}`) * W} cy={random(`sty${i}`) * (y0 - 60)} r={random(`sr${i}`) * 1.6 + 0.4} fill={COLORS.ink} opacity={0.3 + 0.5 * Math.abs(Math.sin(frame / 30 + i))} />
          ))}
          <circle cx={vx} cy={y0 - 40} r={250} fill="url(#fb-sun)" mask="url(#fb-sun-cut)" opacity={0.95} />
          <circle cx={vx} cy={y0 - 40} r={420} fill={COLORS.danger} opacity={0.12} />
          <rect x={-400} y={y0} width={W + 800} height={H} fill="url(#fb-floor)" />
          {floorLines}
          <rect x={-400} y={y0 - 2} width={W + 800} height={4} fill={COLORS.accent} opacity={0.7} />
          {towers}
          {streaks}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: COLORS.paper, opacity: dim }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />
    </AbsoluteFill>
  );
};

// =============================================================================
// CAMERA: drift + punch-ins + shake over whatever is inside
// =============================================================================
export const Camera: React.FC<{
  punches?: { at: number; amt?: number; len?: number }[];
  shakes?: number[];
  shakeAmt?: number;
  drift?: number;
  children: React.ReactNode;
}> = ({ punches = [], shakes = [], shakeAmt = 14, drift = 1, children }) => {
  const frame = useCurrentFrame();
  // each punch snaps in over 4 frames and fully releases over `len`: no residue, so hits never
  // accumulate into a creeping zoom
  const punch = punches.reduce((s, p) => {
    const len = p.len ?? 30;
    return s + (p.amt ?? 0.08) * lerp(frame, p.at, p.at + 4, 0, 1, OUT) * lerp(frame, p.at + 4, p.at + len, 1, 0, EASE_IO);
  }, 0);
  const sh = pulse(frame, shakes, 16) * shakeAmt;
  const sx = (random(`cx${frame}`) - 0.5) * 2 * sh;
  const sy = (random(`cy${frame}`) - 0.5) * 2 * sh;
  const rx = Math.sin(frame / 80) * 2.5 * drift;
  const ry = Math.sin(frame / 110 + 1) * 3.5 * drift;
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${1 + punch})`, transformStyle: 'preserve-3d' }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============================================================================
// SCENE: a beat with an enter and exit transition, sized to its Sequence
// =============================================================================
type Trans = 'cut' | 'whip' | 'whip-up' | 'zoom' | 'glitch';
export const Scene: React.FC<{ enter?: Trans; exit?: Trans; t?: number; children: React.ReactNode }> = ({ enter = 'whip', exit = 'whip', t = 9, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const id = `mb${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  let x = 0, y = 0, s = 1, o = 1, blur = 0, rgb = 0;
  // enter
  const e = lerp(frame, 0, t, 1, 0, OUT); // 1 -> 0
  if (enter === 'whip') { x += e * 1500; blur += e * 90; }
  if (enter === 'whip-up') { y += e * 1000; blur += e * 60; }
  if (enter === 'zoom') { s *= 1 + e * 2.5; o *= 1 - e; }
  if (enter === 'glitch') { rgb += e * 30; o *= 1 - e * 0.7; }
  // exit
  const q = lerp(frame, d - t, d, 0, 1, IN); // 0 -> 1
  if (exit === 'whip') { x -= q * 1500; blur += q * 90; }
  if (exit === 'whip-up') { y -= q * 1000; blur += q * 60; }
  if (exit === 'zoom') { s *= 1 + q * 5; o *= 1 - q; }
  if (exit === 'glitch') { rgb += q * 30; o *= 1 - q; }
  const horizontal = enter.startsWith('whip') && enter !== 'whip-up' ? true : exit === 'whip';
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={horizontal ? `${blur} 0` : `0 ${blur}`} />
        </filter>
      </svg>
      <AbsoluteFill style={{
        transform: `translate(${x}px, ${y}px) scale(${s})`, opacity: o,
        filter: blur > 0.5 ? `url(#${id})` : undefined,
      }}>
        {rgb > 0.5
          ? <RGBSplit amt={rgb}>{children}</RGBSplit>
          : children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Chromatic split: three copies, red / cyan offset. Use briefly. */
export const RGBSplit: React.FC<{ amt: number; children: React.ReactNode }> = ({ amt, children }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ transform: `translateX(${-amt}px)`, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(-50deg)', opacity: 0.8 }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ transform: `translateX(${amt}px)`, mixBlendMode: 'screen', filter: 'sepia(1) saturate(8) hue-rotate(140deg)', opacity: 0.8 }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ mixBlendMode: 'normal', opacity: 0.85 }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// =============================================================================
// TYPE
// =============================================================================

/** A word (or anything) that slams in: huge + blurred -> exact size, with a little overshoot. */
export const Slam: React.FC<{ at: number; from?: number; children: React.ReactNode; style?: React.CSSProperties; rot?: number }> = ({ at, from = 2.4, children, style, rot = 0 }) => {
  const frame = useCurrentFrame();
  const k = lerp(frame, at, at + 7, 0, 1, SNAP);
  const vis = frame >= at;
  const blur = lerp(frame, at, at + 6, 14, 0, OUT);
  return (
    <span style={{
      display: 'inline-block', opacity: vis ? Math.min(1, k * 3) : 0,
      transform: `scale(${from + (1 - from) * k}) rotate(${rot * (1 - k)}deg)`, filter: `blur(${blur}px)`, ...style,
    }}>{children}</span>
  );
};

export type Word = string | { t: string; c?: string; size?: number; serif?: boolean; hit?: boolean };

/**
 * SlamLine: kinetic sentence. Words slam in at `at[i]`; each can override color/size/font.
 * Mix Inter Tight 800 CAPS (the shout) with Fraunces italic (the thought).
 */
export const SlamLine: React.FC<{ words: Word[]; at: number[]; size?: number; align?: 'left' | 'center'; lineHeight?: number; maxWidth?: number }> = ({ words, at, size = 120, align = 'center', lineHeight = 1, maxWidth = 1600 }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', alignItems: 'baseline', gap: `0 ${size * 0.26}px`, maxWidth, lineHeight }}>
    {words.map((w, i) => {
      const o = typeof w === 'string' ? { t: w } : w;
      const serif = !!o.serif;
      return (
        <Slam key={i} at={at[i] ?? at[at.length - 1]} from={o.hit ? 3.2 : 2.2} rot={o.hit ? -6 : 0} style={{
          fontFamily: serif ? FONT_DISPLAY : FONT_BODY,
          fontStyle: serif ? 'italic' : 'normal',
          fontWeight: serif ? 900 : 800,
          textTransform: serif ? 'none' : 'uppercase',
          letterSpacing: serif ? -2 : -3,
          fontSize: o.size ?? size,
          color: o.c ?? COLORS.ink,
          textShadow: '0 8px 40px rgba(0,0,0,0.7)',
        }}>{o.t}</Slam>
      );
    })}
  </div>
);

/** Text with a jittery RGB/slice glitch for `dur` frames after `at`, then clean. */
export const GlitchText: React.FC<{ text: string; at?: number; dur?: number; style?: React.CSSProperties }> = ({ text, at = 0, dur = 14, style }) => {
  const frame = useCurrentFrame();
  const on = frame >= at && frame < at + dur;
  const j = (k: string) => (on ? (random(`${k}${frame}`) - 0.5) * 30 : 0);
  const cut = on ? 20 + random(`gc${frame}`) * 60 : 0;
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ visibility: frame >= at ? 'visible' : 'hidden' }}>{text}</span>
      {on && <>
        <span style={{ position: 'absolute', left: j('a'), top: 0, color: COLORS.danger, mixBlendMode: 'screen', clipPath: `inset(0 0 ${100 - cut}% 0)` }}>{text}</span>
        <span style={{ position: 'absolute', left: j('b'), top: 0, color: COLORS.signal, mixBlendMode: 'screen', clipPath: `inset(${cut}% 0 0 0)` }}>{text}</span>
      </>}
    </span>
  );
};

/** Typewriter reveal, with a block cursor. */
export const Typed: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties }> = ({ text, at, cps = 40, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - at) / fps) * cps));
  const done = n >= text.length;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {frame >= at && (!done || Math.floor(frame / 15) % 2 === 0) && <span style={{ background: COLORS.accent, color: COLORS.accent, marginLeft: 2 }}>_</span>}
    </span>
  );
};

// =============================================================================
// ANNOTATION: hand-drawn marks, stamps, flashes
// =============================================================================

/** A hand-drawn mark that draws itself on. Position it absolutely around what it marks. */
export const Scribble: React.FC<{ kind: 'circle' | 'underline' | 'arrow' | 'cross' | 'check'; at: number; dur?: number; w: number; h: number; color?: string; stroke?: number; style?: React.CSSProperties }> = ({ kind, at, dur = 14, w, h, color = COLORS.danger, stroke = 8, style }) => {
  const frame = useCurrentFrame();
  const p = lerp(frame, at, at + dur, 0, 1, Easing.bezier(0.45, 0, 0.2, 1));
  const d = {
    circle: `M ${w * 0.12} ${h * 0.3} C ${w * 0.3} ${-h * 0.05}, ${w * 0.95} ${-h * 0.02}, ${w * 0.97} ${h * 0.45} C ${w} ${h * 0.95}, ${w * 0.15} ${h * 1.05}, ${w * 0.03} ${h * 0.6} C ${-w * 0.02} ${h * 0.3}, ${w * 0.2} ${h * 0.08}, ${w * 0.42} ${h * 0.04}`,
    underline: `M 0 ${h * 0.6} C ${w * 0.3} ${h * 0.2}, ${w * 0.6} ${h * 0.9}, ${w} ${h * 0.35}`,
    arrow: `M 0 ${h} C ${w * 0.3} ${h * 0.4}, ${w * 0.6} ${h * 0.2}, ${w} 0 M ${w * 0.78} ${h * 0.02} L ${w} 0 L ${w * 0.93} ${h * 0.22}`,
    cross: `M 0 0 L ${w} ${h} M ${w} 0 L 0 ${h}`,
    check: `M 0 ${h * 0.55} L ${w * 0.38} ${h} L ${w} 0`,
  }[kind];
  return (
    <svg width={w} height={h} style={{ position: 'absolute', overflow: 'visible', ...style }}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

/** Rubber stamp: slams down rotated, with ink texture. */
export const Stamp: React.FC<{ text: string; at: number; color?: string; rot?: number; size?: number; style?: React.CSSProperties }> = ({ text, at, color = COLORS.danger, rot = -12, size = 64, style }) => {
  const frame = useCurrentFrame();
  const k = lerp(frame, at, at + 6, 0, 1, SNAP);
  return (
    <div style={{
      position: 'absolute', opacity: frame >= at ? 1 : 0, transform: `rotate(${rot}deg) scale(${2.6 - 1.6 * k})`,
      border: `${size * 0.09}px solid ${color}`, color, borderRadius: 8, padding: `${size * 0.08}px ${size * 0.3}px`,
      fontFamily: FONT_MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.08, textTransform: 'uppercase',
      maskImage: 'repeating-radial-gradient(circle at 30% 40%, #000 0 3px, rgba(0,0,0,0.75) 3px 5px)',
      WebkitMaskImage: 'repeating-radial-gradient(circle at 30% 40%, #000 0 3px, rgba(0,0,0,0.75) 3px 5px)',
      ...style,
    }}>{text}</div>
  );
};

/** Flash frames at each hit (honey or white). */
export const Flash: React.FC<{ at: number[]; color?: string; len?: number; max?: number }> = ({ at, color = '#fff', len = 8, max = 0.55 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: color, opacity: pulse(frame, at, len) * max, mixBlendMode: 'screen', pointerEvents: 'none' }} />;
};

/** Full-frame glitch burst: displaced color bars + noise blocks for a few frames. */
export const GlitchBurst: React.FC<{ at: number[]; len?: number }> = ({ at, len = 8 }) => {
  const frame = useCurrentFrame();
  const p = pulse(frame, at, len);
  if (p <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {new Array(9).fill(0).map((_, i) => {
        const y = random(`gy${i}${frame}`) * 1080;
        const h = 6 + random(`gh${i}${frame}`) * 60;
        const cols = [COLORS.accent, COLORS.danger, COLORS.signal, COLORS.ink];
        return <div key={i} style={{ position: 'absolute', left: (random(`gx${i}${frame}`) - 0.5) * 400, top: y, width: 1920 * (0.4 + random(`gw${i}${frame}`)), height: h, background: cols[i % 4], opacity: 0.55 * p, mixBlendMode: 'screen' }} />;
      })}
    </AbsoluteFill>
  );
};

/** Letterbox bars that close in: instant cinema. */
export const Letterbox: React.FC<{ amt?: number; at?: number }> = ({ amt = 90, at = 0 }) => {
  const frame = useCurrentFrame();
  const h = lerp(frame, at, at + 16, 0, amt, OUT);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: h, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: '#000' }} />
    </>
  );
};

/** Slot-machine number: each digit rolls into place. */
export const SlotNumber: React.FC<{ value: number; at: number; size?: number; color?: string; stagger?: number }> = ({ value, at, size = 300, color = COLORS.accent, stagger = 6 }) => {
  const frame = useCurrentFrame();
  const digits = String(value).split('');
  return (
    <div style={{ display: 'flex', fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: size, lineHeight: 1, color, letterSpacing: -size * 0.04, textShadow: '0 12px 60px rgba(0,0,0,0.6)' }}>
      {digits.map((d, i) => {
        const target = Number(d);
        const s = at + i * stagger;
        const spins = 2 + i;
        const pos = lerp(frame, s, s + 26, 0, spins * 10 + target, OUT);
        const shown = Math.floor(pos) % 10;
        const frac = pos - Math.floor(pos);
        return (
          <span key={i} style={{ display: 'inline-block', height: size, overflow: 'hidden', opacity: frame >= s ? 1 : 0 }}>
            <span style={{ display: 'block', transform: `translateY(${-frac * size}px)` }}>
              <span style={{ display: 'block', height: size }}>{shown}</span>
              <span style={{ display: 'block', height: size }}>{(shown + 1) % 10}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** A ring of N ticks that fill over time (e.g. 168 hours). */
export const TickRing: React.FC<{ n: number; at: number; dur: number; r?: number; fillTo?: number; color?: string }> = ({ n, at, dur, r = 380, fillTo = 1, color = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const filled = lerp(frame, at, at + dur, 0, n * fillTo, Easing.bezier(0.4, 0, 0.2, 1));
  const appear = lerp(frame, at - 10, at + 10, 0, 1);
  return (
    <svg width={r * 2 + 40} height={r * 2 + 40} style={{ position: 'absolute', opacity: appear, transform: `rotate(${frame * 0.15}deg)` }}>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const long = i % 24 === 0;
        const r1 = r - (long ? 34 : 18);
        const on = i < filled;
        return <line key={i} x1={r + 20 + Math.cos(a) * r1} y1={r + 20 + Math.sin(a) * r1} x2={r + 20 + Math.cos(a) * r} y2={r + 20 + Math.sin(a) * r} stroke={on ? color : COLORS.line} strokeWidth={long ? 5 : 3} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** Masking tape strip, for collage cards. */
export const Tape: React.FC<{ style?: React.CSSProperties; rot?: number }> = ({ style, rot = -8 }) => (
  <div style={{ position: 'absolute', width: 190, height: 46, background: 'rgba(245,197,24,0.55)', transform: `rotate(${rot}deg)`, boxShadow: '0 2px 6px rgba(0,0,0,0.25)', backdropFilter: 'blur(1px)', ...style }} />
);

/** Halftone dot overlay for printed/collage texture. */
export const Halftone: React.FC<{ opacity?: number; size?: number }> = ({ opacity = 0.18, size = 7 }) => (
  <AbsoluteFill style={{ opacity, backgroundImage: `radial-gradient(#000 ${size * 0.28}px, transparent ${size * 0.3}px)`, backgroundSize: `${size}px ${size}px`, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
);

// =============================================================================
// SOUND
// =============================================================================
export const sfx = (name: string) => staticFile(`library/sfx/clips/${name}.mp3`);
export const music = (name: string) => staticFile(`library/music/clips/${name}.mp3`);

/** One SFX hit at a frame. gainDb relative to the library's ~-20 LUFS normalization. */
export const Sfx: React.FC<{ at: number; name: string; gainDb?: number }> = ({ at, name, gainDb = -6 }) => (
  <Sequence from={at} durationInFrames={180} layout="none">
    <Audio src={sfx(name)} volume={Math.pow(10, gainDb / 20)} />
  </Sequence>
);
