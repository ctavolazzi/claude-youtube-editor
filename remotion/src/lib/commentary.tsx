// Commentary kit: the beeplumbgh video-essay look. NOT a shot (no compositionConfig, lives
// outside src/shots so gen-registry never scans it).
//
// The format: a voiceover essay (commentary, philosophy of modern life, strategies) over a
// CONSTANT game-footage background. Everything here is built to sit on moving gameplay:
// every card brings its own scrim so text stays readable over any game, and every shot
// can render two ways:
//
//   standalone / cutaway   <Stage bed={...}>  draws the gameplay bed itself (real clip via
//                          staticFile, or a procedural placeholder so shots render with no media)
//   overlay (alpha)        <Stage bed="none"> + compositionConfig.transparent: true, and bake.py
//                          composites it over the master (gameplay + VO) as an 'overlay' span
//
// Frame-based only; every interpolate range is strictly increasing and clamped.
import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, interpolate, random, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { BRAND, COLORS, EASINGS, GRADIENT, RADIUS, SHADOW } from '../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../fonts';

export const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// shorthand: eased 0..1 (or from..to) between two frames
const useT = () => {
  const frame = useCurrentFrame();
  return (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, Math.max(b, a + 1)], [from, to], { ...CLAMP, easing });
};

// fade + rise, the default entrance
export const rise = (frame: number, start: number, dist = 28, dur = 18) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
  transform: `translateY(${interpolate(frame, [start, start + dur], [dist, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
});

// =============================================================================
// THE BED: game footage, always moving, always graded down so it never fights the words
// =============================================================================

export type BedProps = {
  /** staticFile() path to gameplay, e.g. staticFile('library/gameplay/elden-ring-ride.mp4'). Omit for the placeholder. */
  src?: string;
  /** frames into the source to start from */
  startFrom?: number;
  /** 0..1 how far the footage is pulled down under text (0.55 is the house default) */
  dim?: number;
  /** px of blur; 0 for a clean bed, 6-12 behind dense cards */
  blur?: number;
  /** slow push-in over the shot, as a scale delta (0.06 = 100% -> 106%) */
  push?: number;
  /** 0..1 desaturation, so game colors never out-shout the brand accents */
  desat?: number;
};

export const GameplayBed: React.FC<BedProps> = ({ src, startFrom = 0, dim = 0.55, blur = 0, push = 0.05, desat = 0.35 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, Math.max(1, durationInFrames)], [1.02, 1.02 + push], CLAMP);
  const filter = `saturate(${1 - desat}) contrast(1.05) blur(${blur}px)`;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, filter }}>
        {src
          ? <OffthreadVideo src={src} startFrom={startFrom} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <PlaceholderGame />}
      </AbsoluteFill>
      <Scrim dim={dim} />
    </AbsoluteFill>
  );
};

/** Dim + plum-cast grade + vignette. Use alone (bed="none") to darken the master under an overlay. */
export const Scrim: React.FC<{ dim?: number }> = ({ dim = 0.55 }) => (
  <>
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, opacity: dim }} />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.accent2}14, transparent 40%, ${COLORS.accent}0c)`, mixBlendMode: 'screen' }} />
    <Vignette />
  </>
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 45%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none' }} />
);

/** Animated film grain. Cheap SVG turbulence, reseeded every 2 frames. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Faint CRT scanlines, a nod to the beeplumbgh.net terminal. Keep it faint. */
export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => (
  <AbsoluteFill style={{
    opacity, pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 4px)',
  }} />
);

/**
 * Stage: the frame every commentary shot is built in. `bed`:
 *   'placeholder' (default)  procedural stand-in, so the shot renders with zero media
 *   BedProps                 real gameplay
 *   'none'                   transparent overlay; set `scrim` to dim the master underneath
 */
export const Stage: React.FC<{
  bed?: 'placeholder' | 'none' | BedProps;
  scrim?: number;
  finish?: boolean;
  children: React.ReactNode;
}> = ({ bed = 'placeholder', scrim, finish = true, children }) => (
  <AbsoluteFill style={{ fontFamily: FONT_BODY, color: COLORS.ink }}>
    {bed === 'placeholder' && <GameplayBed />}
    {bed !== 'placeholder' && bed !== 'none' && <GameplayBed {...bed} />}
    {bed === 'none' && scrim !== undefined && <Scrim dim={scrim} />}
    {children}
    {finish && <><Grain /><Scanlines /></>}
  </AbsoluteFill>
);

// ---- procedural placeholder: a slow night ride over parallax ridgelines ------
// Stands in for real gameplay in Studio and demo renders. Deterministic (remotion `random`).
const ridge = (seed: string, w: number, h: number, base: number, amp: number, step: number) => {
  let d = `M 0 ${h}`;
  for (let x = 0; x <= w + step; x += step) {
    const y = base - amp * (0.5 + 0.5 * Math.sin(x / (step * 2.3) + random(`${seed}-p`) * 6)) - amp * 0.6 * random(`${seed}-${x}`);
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d + ` L ${w + step} ${h} Z`;
};
const RIDGES = [
  { seed: 'r1', base: 640, amp: 150, step: 90, speed: 0.25, color: '#241a33' },
  { seed: 'r2', base: 760, amp: 120, step: 70, speed: 0.6, color: '#1a1426' },
  { seed: 'r3', base: 900, amp: 110, step: 55, speed: 1.3, color: '#110d18' },
];
const RIDGE_W = 3840;
const RIDGE_PATHS = RIDGES.map((r) => ridge(r.seed, RIDGE_W, 1080, r.base, r.amp, r.step));

export const PlaceholderGame: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #120c1c 0%, #2a1838 48%, #4a2a3a 62%, #0b0a0d 100%)', overflow: 'hidden' }}>
      {/* sun on the horizon */}
      <div style={{ position: 'absolute', left: 1180, top: 330, width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${COLORS.accent}cc, ${COLORS.warn}66 45%, transparent 70%)`, filter: 'blur(2px)' }} />
      {/* stars */}
      {new Array(70).fill(0).map((_, i) => {
        const x = random(`sx${i}`) * 1920;
        const y = random(`sy${i}`) * 420;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (20 + random(`st${i}`) * 40) + i));
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 2, height: 2, borderRadius: 1, background: COLORS.ink, opacity: tw * 0.6 }} />;
      })}
      {RIDGES.map((r, i) => {
        const off = (frame * r.speed * 2) % (RIDGE_W / 2);
        return (
          <svg key={r.seed} width={RIDGE_W} height={1080} style={{ position: 'absolute', left: -off, top: 0 }}>
            <path d={RIDGE_PATHS[i]} fill={r.color} />
          </svg>
        );
      })}
      {/* a HUD corner so it reads as "game" */}
      <div style={{ position: 'absolute', right: 150, bottom: 100, fontFamily: FONT_MONO, fontSize: 18, color: COLORS.muted, opacity: 0.5, textAlign: 'right', letterSpacing: 2 }}>
        GAMEPLAY BED · PLACEHOLDER<br />media/library/gameplay/
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// MOTIFS
// =============================================================================

/** The plumb line: a thread drops from the top edge and a bob settles at `y`. The channel's signature mark. */
export const PlumbLine: React.FC<{ x: number; y: number; start?: number; color?: string; bob?: number }> = ({ x, y, start = 0, color = COLORS.accent, bob = 18 }) => {
  const t = useT();
  const drop = t(start, start + 22, 0, 1, EASINGS.easeOut);
  const sway = Math.sin((useCurrentFrame() - start) / 16) * 1.6 * (1 - t(start + 10, start + 70));
  const len = y * drop;
  return (
    <div style={{ position: 'absolute', left: x, top: 0, transform: `rotate(${sway}deg)`, transformOrigin: 'top center' }}>
      <div style={{ width: 2, height: len, background: `linear-gradient(180deg, transparent, ${color})` }} />
      <div style={{
        position: 'absolute', left: 1 - bob / 2, top: len - 2, width: bob, height: bob * 1.35,
        background: color, clipPath: 'polygon(50% 100%, 0 30%, 20% 0, 80% 0, 100% 30%)', opacity: drop,
      }} />
    </div>
  );
};

/** Honey marker sweep behind a phrase (inline). */
export const Marker: React.FC<{ start: number; color?: string; dur?: number; children: React.ReactNode; textColor?: string }> = ({ start, color = COLORS.accent, dur = 10, children, textColor }) => {
  const t = useT();
  const w = t(start, start + dur, 0, 100, EASINGS.easeInOut);
  const on = w > 50;
  return (
    <span style={{ position: 'relative', display: 'inline-block', padding: '0 0.12em' }}>
      <span style={{ position: 'absolute', left: 0, top: '12%', bottom: '6%', width: `${w}%`, background: color, zIndex: 0, transform: 'skewX(-6deg)' }} />
      <span style={{ position: 'relative', zIndex: 1, color: on ? (textColor ?? COLORS.paper) : 'inherit' }}>{children}</span>
    </span>
  );
};

/** A small mono tag, e.g. "SOURCE", "CLIP", "02 / 05". */
export const Tag: React.FC<{ children: React.ReactNode; color?: string; solid?: boolean; style?: React.CSSProperties }> = ({ children, color = COLORS.accent, solid, style }) => (
  <span style={{
    fontFamily: FONT_MONO, fontWeight: 700, fontSize: 18, letterSpacing: 3, textTransform: 'uppercase',
    padding: '6px 12px', borderRadius: 3, border: `1.5px solid ${color}`,
    color: solid ? COLORS.paper : color, background: solid ? color : 'transparent', ...style,
  }}>{children}</span>
);

// =============================================================================
// CARDS: full-screen or centered beats over the bed
// =============================================================================

/**
 * ThesisCard: one big sentence, word by word. `mark` is a substring that gets the honey sweep.
 * `wordAt` optionally pins each word's reveal to a frame (sync to edited-transcript word times).
 */
export const ThesisCard: React.FC<{
  text: string;
  mark?: string;
  kicker?: string;
  start?: number;
  stagger?: number;
  wordAt?: number[];
  size?: number;
  plumb?: boolean;
}> = ({ text, mark, kicker, start = 6, stagger = 4, wordAt, size = 96, plumb = true }) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const markWords = mark ? mark.split(' ') : [];
  let markIdx = -1;
  if (mark) {
    for (let i = 0; i + markWords.length <= words.length; i++) {
      if (words.slice(i, i + markWords.length).join(' ').replace(/[.,!?;:]/g, '') === mark.replace(/[.,!?;:]/g, '')) { markIdx = i; break; }
    }
  }
  const at = (i: number) => wordAt?.[i] ?? start + 8 + i * stagger;
  const lastAt = at(words.length - 1);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i === markIdx) {
      const phrase = words.slice(i, i + markWords.length).join(' ');
      nodes.push(
        <span key={i} style={{ ...rise(frame, at(i), 30, 16), display: 'inline-block', marginRight: '0.24em' }}>
          <Marker start={lastAt + 10}>{phrase}</Marker>
        </span>,
      );
      i += markWords.length - 1;
      continue;
    }
    nodes.push(<span key={i} style={{ ...rise(frame, at(i), 30, 16), display: 'inline-block', marginRight: '0.24em' }}>{words[i]}</span>);
  }
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 190px' }}>
      {plumb && <PlumbLine x={128} y={430} start={start} />}
      {kicker && <div style={{ ...rise(frame, start, 16), marginBottom: 30 }}><Tag>{kicker}</Tag></div>}
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5, color: COLORS.ink, maxWidth: 1500, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>
        {nodes}
      </div>
    </AbsoluteFill>
  );
};

/** ChapterCard: "02" in outlined plum, the chapter title in the essay serif. Every act break. */
export const ChapterCard: React.FC<{ n: number; total?: number; title: string; sub?: string; start?: number }> = ({ n, total, title, sub, start = 0 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const rule = t(start + 14, start + 40);
  const num = String(n).padStart(2, '0');
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 200px' }}>
      <PlumbLine x={1620} y={610} start={start + 6} color={COLORS.accent2} />
      <div style={{ ...rise(frame, start, 40, 22), display: 'flex', alignItems: 'baseline', gap: 26 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `3px ${COLORS.accent2}`, letterSpacing: -8 }}>{num}</span>
        {total && <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: COLORS.muted }}>/ {String(total).padStart(2, '0')}</span>}
      </div>
      <div style={{ width: 760 * rule, height: 3, background: GRADIENT, margin: '26px 0 34px' }} />
      <div style={{ ...rise(frame, start + 16, 26, 18), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.02, letterSpacing: -2, color: COLORS.ink, maxWidth: 1350 }}>{title}</div>
      {sub && <div style={{ ...rise(frame, start + 26, 18, 16), fontFamily: FONT_BODY, fontSize: 36, color: COLORS.muted, marginTop: 22, maxWidth: 1200 }}>{sub}</div>}
    </AbsoluteFill>
  );
};

/** QuoteCard: a pull quote with its attribution. The big quote mark is plum; the attribution is mono. */
export const QuoteCard: React.FC<{ quote: string; author: string; source?: string; year?: string | number; start?: number; mark?: string }> = ({ quote, author, source, year, start = 0, mark }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const words = quote.split(' ');
  const per = Math.max(1.2, Math.min(3, 70 / words.length));
  const done = start + 14 + words.length * per;
  const markStart = mark ? quote.indexOf(mark) : -1;
  const body = markStart >= 0
    ? <>{quote.slice(0, markStart)}<Marker start={done + 6}>{mark}</Marker>{quote.slice(markStart + mark!.length)}</>
    : quote;
  const reveal = t(start + 10, done, 0, 100, EASINGS.easeInOut);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ ...rise(frame, start, 30, 20), position: 'relative', maxWidth: 1400, padding: '80px 110px 70px', background: `${COLORS.cream}e6`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, borderLeft: `6px solid ${COLORS.accent2}` }}>
        <div style={{ position: 'absolute', left: 50, top: -40, fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 260, lineHeight: 1, color: COLORS.accent2 }}>“</div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 60, lineHeight: 1.25, color: COLORS.ink,
          WebkitMaskImage: `linear-gradient(180deg, #000 ${reveal}%, transparent ${Math.min(100, reveal + 12)}%)`,
          maskImage: `linear-gradient(180deg, #000 ${reveal}%, transparent ${Math.min(100, reveal + 12)}%)`,
        }}>{body}</div>
        <div style={{ ...rise(frame, done, 14, 14), display: 'flex', alignItems: 'flex-start', gap: 18, marginTop: 40, fontFamily: FONT_MONO, fontSize: 26, color: COLORS.muted }}>
          <span style={{ width: 48, height: 2, background: COLORS.accent, marginTop: 16, flexShrink: 0 }} />
          <div>
            <div style={{ color: COLORS.ink, fontWeight: 700 }}>{author}</div>
            {(source || year) && <div style={{ marginTop: 6 }}>{source && <i>{source}</i>}{source && year ? ' · ' : ''}{year}</div>}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * SourceCard: a screenshot of a real source (article, post, paper, chart), cited on screen.
 * `img` is a staticFile() path (grab it with tools/grab_source.py page ...). `highlight` is a box
 * in 0..1 image coordinates that gets a honey outline + the camera pushes toward it.
 * With no `img`, renders a neutral placeholder page so the beat can be timed before the grab.
 */
export const SourceCard: React.FC<{
  img?: string;
  outlet: string;
  title: string;
  date?: string;
  url?: string;
  highlight?: { x: number; y: number; w: number; h: number };
  start?: number;
  width?: number;
  aspect?: number;
}> = ({ img, outlet, title, date, url, highlight, start = 0, width = 1120, aspect = 16 / 9 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const h = width / aspect;
  const tilt = t(start, start + 26, -7, -2);
  const ent = t(start, start + 22);
  const hl = highlight ? t(start + 30, start + 46) : 0;
  const zoom = highlight ? t(start + 40, start + 120, 1, 1.15, EASINGS.easeInOut) : t(start, start + 180, 1, 1.06, EASINGS.easeInOut);
  const cx = highlight ? (highlight.x + highlight.w / 2) * 100 : 50;
  const cy = highlight ? (highlight.y + highlight.h / 2) * 100 : 30;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity: ent, transform: `perspective(2200px) rotateY(${tilt}deg) translateY(${(1 - ent) * 60}px)`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ ...rise(frame, start + 8, 12, 14), display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
          <Tag solid>Source</Tag>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink }}>{outlet}{date ? ` · ${date}` : ''}</span>
        </div>
        <div style={{ width, height: h, borderRadius: RADIUS.window, overflow: 'hidden', boxShadow: SHADOW.card, background: '#f4f1ea', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${cx}% ${cy}%` }}>
            {img
              ? <Img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              : <PlaceholderPage title={title} />}
            {highlight && (
              <div style={{
                position: 'absolute', left: `${highlight.x * 100}%`, top: `${highlight.y * 100}%`, width: `${highlight.w * 100}%`, height: `${highlight.h * 100}%`,
                border: `4px solid ${COLORS.accent}`, borderRadius: 4, opacity: hl, boxShadow: `0 0 0 9999px rgba(11,10,13,${0.35 * hl})`,
              }} />
            )}
          </div>
        </div>
        <div style={{ ...rise(frame, start + 16, 12, 14), marginTop: 18, maxWidth: width, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 36, color: COLORS.ink }}>{title}</div>
        {url && <div style={{ ...rise(frame, start + 20, 12, 14), marginTop: 6, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>{url}</div>}
      </div>
    </AbsoluteFill>
  );
};

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '56px 70px', fontFamily: 'Georgia, serif', color: '#1b1b1b' }}>
    <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: '#8a8378', letterSpacing: 3 }}>SCREENSHOT PENDING · tools/grab_source.py</div>
    <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.15, marginTop: 20 }}>{title}</div>
    {new Array(9).fill(0).map((_, i) => (
      <div key={i} style={{ height: 14, borderRadius: 7, background: '#d9d3c7', marginTop: i === 0 ? 34 : 18, width: `${92 - (i % 3) * 11}%` }} />
    ))}
  </div>
);

/**
 * ClipFrame: an excerpt from someone else's video, shown AS a quoted clip (fair use: you comment
 * on it). Framed, never full-bleed, always credited on screen. `src` from tools/grab_source.py clip.
 * Keep excerpts short (the ledger warns past 15s) and talk over or right after them.
 */
export const ClipFrame: React.FC<{
  src?: string;
  startFrom?: number;
  volume?: number;
  credit: string;
  title?: string;
  start?: number;
  width?: number;
}> = ({ src, startFrom = 0, volume = 0.9, credit, title, start = 0, width = 1280 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const ent = t(start, start + 18);
  const rec = Math.floor(frame / 20) % 2 === 0;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity: ent, transform: `scale(${0.94 + 0.06 * ent})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: COLORS.danger, opacity: rec ? 1 : 0.35 }} />
          <Tag color={COLORS.danger}>Clip</Tag>
          {title && <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, color: COLORS.ink }}>{title}</span>}
        </div>
        <div style={{ width, height: width * 9 / 16, borderRadius: RADIUS.window, overflow: 'hidden', boxShadow: SHADOW.card, background: '#000', outline: `2px solid ${COLORS.line}` }}>
          {src
            ? <OffthreadVideo src={src} startFrom={startFrom} volume={volume} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <PlaceholderClip />}
        </div>
        <div style={{ marginTop: 14, fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>{credit}</div>
      </div>
    </AbsoluteFill>
  );
};

const PlaceholderClip: React.FC = () => {
  const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      {bars.map((b) => <div key={b} style={{ flex: 1, background: b, opacity: 0.55 }} />)}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 26, color: '#fff', textShadow: '0 2px 8px #000' }}>CLIP PENDING · tools/grab_source.py clip</div>
    </div>
  );
};

/** TermCard: a dictionary entry. Coin or define a word the essay leans on. */
export const TermCard: React.FC<{ term: string; pos?: string; phonetic?: string; definition: string; note?: string; start?: number }> = ({ term, pos = 'noun', phonetic, definition, note, start = 0 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const rule = t(start + 10, start + 34);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 220px' }}>
      <div style={{ ...rise(frame, start, 30, 20), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: -3, color: COLORS.ink, lineHeight: 1 }}>{term}</div>
      <div style={{ ...rise(frame, start + 8, 14, 14), marginTop: 16, fontFamily: FONT_MONO, fontSize: 30, color: COLORS.muted }}>
        {phonetic && <span style={{ marginRight: 22 }}>{phonetic}</span>}
        <i style={{ color: COLORS.accent2 }}>{pos}</i>
      </div>
      <div style={{ width: 1100 * rule, height: 2, background: COLORS.line, margin: '34px 0' }} />
      <div style={{ ...rise(frame, start + 20, 18, 16), display: 'flex', gap: 22, fontFamily: FONT_BODY, fontSize: 46, lineHeight: 1.35, color: COLORS.ink, maxWidth: 1350 }}>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: COLORS.accent }}>1.</span><span>{definition}</span>
      </div>
      {note && <div style={{ ...rise(frame, start + 34, 14, 14), marginTop: 26, fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: 32, color: COLORS.muted, maxWidth: 1300 }}>{note}</div>}
    </AbsoluteFill>
  );
};

/** StatCallout: a number that counts up, with its source line under it. Numbers without a source don't ship. */
export const StatCallout: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number; label: string; source: string; start?: number; color?: string }> = ({ value, prefix = '', suffix = '', decimals = 0, label, source, start = 0, color = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const v = t(start + 6, start + 46, 0, value, EASINGS.easeOut);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ ...rise(frame, start, 30, 18), fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 260, lineHeight: 1, letterSpacing: -6, color, fontVariantNumeric: 'tabular-nums', textShadow: '0 10px 60px rgba(0,0,0,0.6)' }}>
        {prefix}{v.toFixed(decimals)}{suffix}
      </div>
      <div style={{ ...rise(frame, start + 20, 16, 16), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 54, color: COLORS.ink, marginTop: 18, maxWidth: 1300 }}>{label}</div>
      <div style={{ ...rise(frame, start + 30, 12, 14), fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted, marginTop: 24 }}>SOURCE · {source}</div>
    </AbsoluteFill>
  );
};

/** VersusCard: the trap vs the strategy. The spine of any "how to navigate X" beat. */
export const VersusCard: React.FC<{
  left: { label: string; items: string[] };
  right: { label: string; items: string[] };
  start?: number;
  stagger?: number;
}> = ({ left, right, start = 0, stagger = 10 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const split = t(start, start + 24);
  const col = (side: { label: string; items: string[] }, color: string, s: number) => (
    <div style={{ flex: 1, padding: '0 70px', alignSelf: 'flex-start' }}>
      <div style={{ ...rise(frame, s, 16, 14) }}><Tag color={color}>{side.label}</Tag></div>
      {side.items.map((it, i) => (
        <div key={i} style={{ ...rise(frame, s + 12 + i * stagger, 20, 16), display: 'flex', gap: 20, alignItems: 'baseline', marginTop: 34, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 50, lineHeight: 1.15, color: COLORS.ink }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, color }}>{String(i + 1).padStart(2, '0')}</span>{it}
        </div>
      ))}
    </div>
  );
  const rightStart = start + 16 + left.items.length * stagger;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 110px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
        {col(left, COLORS.danger, start + 4)}
        <div style={{ width: 2, alignSelf: 'center', height: 560 * split, background: `linear-gradient(180deg, transparent, ${COLORS.line}, transparent)` }} />
        {col(right, COLORS.signal, rightStart)}
      </div>
    </AbsoluteFill>
  );
};

/** LowerThird: name a person, a game, a work. Bottom-left, inside title-safe. Works as an alpha overlay. */
export const LowerThird: React.FC<{ title: string; sub?: string; start?: number; hold?: number }> = ({ title, sub, start = 0, hold = 150 }) => {
  const t = useT();
  const inn = t(start, start + 16);
  const out = t(start + hold, start + hold + 12, 1, 0, EASINGS.easeIn);
  const bar = t(start, start + 14);
  return (
    <div style={{ position: 'absolute', left: 144, bottom: 130, opacity: out, display: 'flex', alignItems: 'stretch', gap: 22 }}>
      <div style={{ width: 5, background: COLORS.accent, transform: `scaleY(${bar})`, transformOrigin: 'bottom' }} />
      <div style={{ opacity: inn, transform: `translateX(${(1 - inn) * -24}px)` }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: COLORS.ink, textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>{title}</div>
        {sub && <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted, marginTop: 4, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>{sub}</div>}
      </div>
    </div>
  );
};

/** GameCredit: the persistent "what you're watching" chip, top-right. Name the game on every bed. */
export const GameCredit: React.FC<{ game: string; start?: number }> = ({ game, start = 0 }) => {
  const t = useT();
  const o = t(start, start + 20);
  return (
    <div style={{ position: 'absolute', right: 110, top: 80, opacity: o * 0.85, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.ink, letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.accent }} />
      ON SCREEN · {game.toUpperCase()}
    </div>
  );
};

/** Wordmark, read from BRAND so a rename re-brands every video. */
export const Wordmark: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 120, style }) => (
  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.03, color: COLORS.ink, lineHeight: 1, ...style }}>
    {BRAND.wordmark[0]}<span style={{ color: COLORS.accent, fontStyle: 'italic' }}>{BRAND.wordmark[1]}</span><span style={{ color: COLORS.muted }}>{BRAND.wordmark[2]}</span>
  </div>
);

/** CommentaryEnd: wordmark + sign-off + handle, over the bed. */
export const CommentaryEnd: React.FC<{ start?: number; next?: string }> = ({ start = 0, next }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const rule = t(start + 16, start + 44);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <PlumbLine x={958} y={250} start={start} />
      <div style={{ ...rise(frame, start + 14, 30, 22), marginTop: 120 }}><Wordmark size={150} /></div>
      <div style={{ width: 520 * rule, height: 3, background: GRADIENT, margin: '30px auto' }} />
      <div style={{ ...rise(frame, start + 26, 16, 16), fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 50, color: COLORS.ink }}>{BRAND.signoff}</div>
      <div style={{ ...rise(frame, start + 34, 12, 14), fontFamily: FONT_MONO, fontSize: 26, color: COLORS.muted, marginTop: 20 }}>{BRAND.handle} · beeplumbgh.net</div>
      {next && <div style={{ ...rise(frame, start + 50, 12, 14), position: 'absolute', bottom: 120, fontFamily: FONT_BODY, fontSize: 28, color: COLORS.muted }}>next · <span style={{ color: COLORS.ink }}>{next}</span></div>}
    </AbsoluteFill>
  );
};
