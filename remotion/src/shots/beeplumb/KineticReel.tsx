import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, COLORS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { Grain, Scanlines } from '../../lib/commentary';
import {
  Camera, FlightBed, Flash, GlitchBurst, GlitchText, Halftone, Letterbox, Scene, Scribble, Sfx, SlamLine,
  SlotNumber, Slam, Stamp, Tape, TickRing, Typed, music, pulse,
} from '../../lib/kinetic';

// =============================================================================
// KineticReel: the beeplumbgh look at full energy. A cold open for a sample essay,
// "The Attention Tax", cut to a 120 BPM track: one beat = 30 frames, one bar = 120.
// Every cut lands on a bar, every slam on a beat. The flying bed stands in for gameplay.
// =============================================================================
export const compositionConfig = { id: 'KineticReel', durationInSeconds: 46, fps: 60, width: 1920, height: 1080 };

const P = 2; // beat phase of the track, in frames
const B = (n: number) => P + Math.round(n * 30); // global frame of beat n
const OV = 5; // scenes overlap their neighbours by this many frames so whips cross
// scene cut points (global frames), all on bars
const CUT = [0, B(8), B(16), B(24), B(32), B(40), B(48), B(56), B(60), B(68), B(76), B(84), B(92)];
const END = 46 * 60;

// local helper: frame of beat n INSIDE a scene (the scene's cut sits at local frame OV)
const b = (n: number) => OV + Math.round(n * 30);

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', ...style }}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = COLORS.accent, style }) => (
  <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 8, textTransform: 'uppercase', color, ...style }}>{children}</div>
);

// ---- A: hook ---------------------------------------------------------------------------
const Hook: React.FC = () => (
  <Center>
    <SlamLine size={210} at={[b(0), b(1), b(2)]} words={['Nothing', 'is', { t: 'free.', c: COLORS.accent, serif: true, size: 250, hit: true }]} />
    <div style={{ marginTop: 40 }}>
      <SlamLine size={46} at={[b(4), b(4.5), b(5), b(5.5), b(6), b(6.5)]} words={[
        { t: 'not', serif: true }, { t: 'the app.', serif: true }, { t: 'not', serif: true }, { t: 'the feed.', serif: true },
        { t: 'not', serif: true }, { t: 'the scroll.', serif: true, c: COLORS.danger },
      ]} />
    </div>
  </Center>
);

// ---- B: the price ----------------------------------------------------------------------
const Price: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Center>
      <SlamLine size={120} at={[b(0), b(0.5), b(1)]} words={['You', 'pay', 'in']} />
      <div style={{ position: 'relative', marginTop: -20 }}>
        <Slam at={b(2)} from={4} rot={-8} style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 900, fontSize: 380, letterSpacing: -14, color: COLORS.accent, lineHeight: 1, textShadow: '0 20px 80px rgba(245,197,24,0.35)', transform: `scale(${1 + pulse(frame, [b(4)], 20) * 0.06})` }}>time.</Slam>
        <Scribble kind="underline" at={b(3)} w={820} h={70} color={COLORS.danger} stroke={14} style={{ left: 40, bottom: -30 }} />
      </div>
      <div style={{ marginTop: 50 }}>
        <SlamLine size={52} at={[b(5), b(5.25), b(5.5), b(5.75), b(6), b(6.5)]} words={[
          { t: 'the', serif: true }, { t: 'one', serif: true }, { t: 'thing', serif: true }, { t: 'you', serif: true }, { t: "can't", serif: true }, { t: 'earn back.', serif: true, c: COLORS.accent },
        ]} />
      </div>
    </Center>
  );
};

// ---- C: title ----------------------------------------------------------------------------
const Title: React.FC = () => (
  <Center>
    <Kicker style={{ marginBottom: 30 }}><Typed text="a beeplumbgh essay" at={b(0.5)} cps={30} /></Kicker>
    <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 200, letterSpacing: -8, lineHeight: 0.88, color: COLORS.ink, textTransform: 'uppercase', textShadow: '0 12px 60px rgba(0,0,0,0.7)' }}>
      <GlitchText text="The" at={b(0)} dur={10} /><br />
      <GlitchText text="Attention" at={b(0)} dur={16} style={{ color: COLORS.accent }} /><br />
      <GlitchText text="Tax" at={b(0)} dur={12} />
    </div>
    <Stamp text="EP. 01" at={b(3)} rot={-14} size={58} color={COLORS.accent2} style={{ right: 330, bottom: 190 }} />
  </Center>
);

// ---- D: chapter 01 -----------------------------------------------------------------------
const Chapter: React.FC<{ n: string; title: string; sub?: string; big?: boolean }> = ({ n, title, sub, big = true }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [b(0.5), b(1.2)], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: -40, top: -120, fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: big ? 900 : 700, lineHeight: 1, color: 'transparent', WebkitTextStroke: `4px ${COLORS.accent2}`, letterSpacing: -40, opacity: 0.9, transform: `translateX(${-frame * 0.6}px)` }}>{n}</div>
      <div style={{ position: 'absolute', left: 0, top: 590, height: 14, width: `${wipe}%`, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.danger}, ${COLORS.accent2})` }} />
      <div style={{ position: 'absolute', left: 150, top: 630, right: 150 }}>
        <Kicker color={COLORS.accent2}><Typed text={`chapter ${n}`} at={b(0.3)} cps={24} /></Kicker>
        <div style={{ marginTop: 14 }}>
          <SlamLine align="left" size={96} maxWidth={1650} at={title.split(' ').map((_, i) => b(1 + i * 0.25))} words={title.split(' ').map((t) => ({ t, serif: true }))} />
        </div>
        {sub && <div style={{ marginTop: 20 }}><SlamLine align="left" size={44} at={sub.split(' ').map((_, i) => b(4 + i * 0.25))} words={sub.split(' ')} maxWidth={1650} /></div>}
      </div>
    </AbsoluteFill>
  );
};

// ---- E: quote ----------------------------------------------------------------------------
const Quote: React.FC = () => {
  const words = ['A', 'wealth', 'of', 'information', 'creates', 'a'];
  return (
    <Center>
      <div style={{ position: 'relative', maxWidth: 1700 }}>
        <Slam at={b(0)} from={3} style={{ position: 'absolute', left: -40, top: -230, fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 420, color: COLORS.accent2, lineHeight: 1 }}>“</Slam>
        <SlamLine size={80} maxWidth={1700} at={words.map((_, i) => b(1 + i * 0.5))} words={words.map((t) => ({ t, serif: true }))} />
        <div style={{ marginTop: 6 }}>
          <SlamLine size={150} at={[b(4), b(4.5)]} words={[{ t: 'poverty of', serif: true, c: COLORS.accent, hit: true }, { t: 'attention.', serif: true, c: COLORS.accent, hit: true }]} />
        </div>
        <div style={{ marginTop: 44, fontFamily: FONT_MONO, fontSize: 32, color: COLORS.muted, letterSpacing: 2 }}>
          <Typed text="HERBERT A. SIMON  ·  1971" at={b(5.5)} cps={34} style={{ color: COLORS.ink }} />
        </div>
        <Stamp text="Nobel '78" at={b(6.5)} rot={10} size={40} color={COLORS.signal} style={{ right: -60, bottom: -40 }} />
      </div>
    </Center>
  );
};

// ---- F: source collage -------------------------------------------------------------------
const Source: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [b(0), b(0) + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const push = interpolate(frame, [b(2), b(7)], [1, 1.07], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Center>
      <div style={{ position: 'relative', transform: `translateY(${(1 - drop) * -700}px) rotate(${-4 + drop * 1.5}deg) scale(${push})`, transformOrigin: '40% 45%' }}>
        <div style={{ position: 'relative', width: 1180, height: 610, background: '#f3eee2', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', padding: '60px 80px', fontFamily: 'Georgia, serif', color: '#1c1a17', overflow: 'hidden' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: '#8a8378', letterSpacing: 3 }}>COMPUTERS, COMMUNICATIONS, AND THE PUBLIC INTEREST · 1971</div>
          <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.12, marginTop: 18 }}>Designing Organizations for an Information-Rich World</div>
          <div style={{ fontSize: 24, marginTop: 10, color: '#5b554c', fontStyle: 'italic' }}>Herbert A. Simon</div>
          {[92, 84, 96, 70].map((w, i) => <div key={i} style={{ height: 12, borderRadius: 6, background: '#d6cfc0', marginTop: i ? 16 : 34, width: `${w}%` }} />)}
          <div style={{ fontSize: 30, lineHeight: 1.35, marginTop: 22, position: 'relative' }}>
            ...a wealth of information creates a poverty of attention and a need to allocate that attention efficiently...
          </div>
          {[88, 94, 62].map((w, i) => <div key={i} style={{ height: 12, borderRadius: 6, background: '#d6cfc0', marginTop: 16, width: `${w}%` }} />)}
          <Halftone opacity={0.1} />
        </div>
        <Tape style={{ left: -40, top: -18 }} rot={-24} />
        <Tape style={{ right: -50, top: 10 }} rot={18} />
        <Scribble kind="circle" at={b(2)} dur={18} w={1130} h={120} color={COLORS.danger} stroke={9} style={{ left: 30, top: 388 }} />
        <Stamp text="Cited" at={b(3.5)} size={70} rot={-16} style={{ right: 60, top: 120 }} />
        <div style={{ position: 'absolute', left: 430, top: 650 }}>
          <Scribble kind="arrow" at={b(5)} dur={12} w={200} h={120} color={COLORS.accent} stroke={7} style={{ left: -210, top: -150, transform: 'scaleX(-1) rotate(180deg)' }} />
          <Slam at={b(5.5)} from={2} style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 44, color: COLORS.accent, textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: '0 4px 20px #000' }}>the line that named it</Slam>
        </div>
      </div>
    </Center>
  );
};

// ---- G: clip -----------------------------------------------------------------------------
const Clip: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
  const roll = (frame * 7) % 1080;
  return (
    <Center>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: -64, display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ width: 20, height: 20, borderRadius: 10, background: COLORS.danger, opacity: Math.floor(frame / 20) % 2 ? 0.3 : 1 }} />
          <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COLORS.danger }}>CLIP</span>
          <span style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 34, color: COLORS.ink, textTransform: 'uppercase' }}>what the other side says</span>
        </div>
        <div style={{ width: 1180, height: 664, borderRadius: 26, overflow: 'hidden', position: 'relative', boxShadow: `0 0 0 10px #161219, 0 0 0 12px ${COLORS.line}, 0 40px 100px rgba(0,0,0,0.8)` }}>
          <div style={{ display: 'flex', width: '100%', height: '100%', filter: 'saturate(1.3) contrast(1.1)' }}>{bars.map((c) => <div key={c} style={{ flex: 1, background: c }} />)}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: roll - 120, height: 120, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)' }} />
          <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 4px)' }} />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65))' }} />
          <div style={{ position: 'absolute', left: 36, top: 28, fontFamily: FONT_MONO, fontSize: 30, color: '#fff', textShadow: '0 0 8px #000' }}>▶ PLAY&nbsp;&nbsp;SP&nbsp;&nbsp;0:01:{String(12 + Math.floor(frame / 60)).padStart(2, '0')}</div>
          <Center><div style={{ fontFamily: FONT_MONO, fontSize: 30, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '10px 20px' }}>your clip here · tools/grab_source.py clip</div></Center>
        </div>
        <div style={{ marginTop: 22, fontFamily: FONT_MONO, fontSize: 26, color: COLORS.muted, textAlign: 'left' }}>
          <Typed text='CHANNEL NAME · "VIDEO TITLE" · 01:12 TO 01:20 · EXCERPT FOR COMMENTARY' at={b(1)} cps={60} />
        </div>
      </div>
    </Center>
  );
};

// ---- I: stat -----------------------------------------------------------------------------
const Stat: React.FC = () => (
  <Center>
    <TickRing n={168} at={b(0)} dur={120} r={400} />
    <SlotNumber value={168} at={b(0.5)} size={330} />
    <div style={{ marginTop: -10 }}><SlamLine size={80} at={[b(2), b(2.5), b(3)]} words={['hours', 'a', { t: 'week.', c: COLORS.accent }]} /></div>
    <div style={{ marginTop: 14 }}><SlamLine size={46} at={[b(4.5), b(4.75), b(5), b(5.25), b(5.5), b(5.75), b(6)]} words={['same', 'for', 'everyone', 'who', 'ever', 'lived.', ''].filter(Boolean).map((t) => ({ t, serif: true }))} /></div>
  </Center>
);

// ---- J: trap vs move ---------------------------------------------------------------------
const Versus: React.FC = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [b(0), b(0) + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const trap = ['Feed first thing', 'Default decides', 'Rest = scroll'];
  const move = ['Decide the day first', 'Pick the default', 'Rest = nothing'];
  const row = (t: string, i: number, at: number, color: string, mark: 'cross' | 'check', markAt: number) => (
    <div key={t} style={{ position: 'relative', marginTop: 34, display: 'flex', alignItems: 'center', gap: 22 }}>
      <Slam at={at} from={2} style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color }}>{`0${i + 1}`}</Slam>
      <div style={{ position: 'relative' }}>
        <Slam at={at} from={2} style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 60, textTransform: 'uppercase', letterSpacing: -2, color: COLORS.ink, whiteSpace: 'nowrap' }}>{t}</Slam>
        {mark === 'cross' && <Scribble kind="underline" at={markAt} dur={8} w={560} h={30} color={COLORS.danger} stroke={10} style={{ left: -10, top: 26 }} />}
      </div>
      {mark === 'check' && <Scribble kind="check" at={markAt} dur={8} w={54} h={46} color={COLORS.signal} stroke={9} style={{ position: 'relative' }} />}
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: `${COLORS.danger}22`, clipPath: `polygon(0 0, ${56 * split}% 0, ${44 * split}% 100%, 0 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `${COLORS.signal}18`, clipPath: `polygon(${100 - 44 * split}% 0, 100% 0, 100% 100%, ${100 - 56 * split}% 100%)` }} />
      <div style={{ position: 'absolute', left: '50%', top: -100, width: 8, height: 1300, background: COLORS.accent, transform: `rotate(12deg) scaleY(${split})`, boxShadow: `0 0 30px ${COLORS.accent}` }} />
      <div style={{ position: 'absolute', left: 140, top: 250 }}>
        <Stamp text="The trap" at={b(0.5)} size={46} rot={-6} color={COLORS.danger} style={{ position: 'relative', display: 'inline-block' }} />
        {trap.map((t, i) => row(t, i, b(1 + i * 0.5), COLORS.danger, 'cross', b(2.75 + i * 0.25)))}
      </div>
      <div style={{ position: 'absolute', left: 1050, top: 430 }}>
        <Stamp text="The move" at={b(4)} size={46} rot={5} color={COLORS.signal} style={{ position: 'relative', display: 'inline-block' }} />
        {move.map((t, i) => row(t, i, b(4.5 + i * 0.5), COLORS.signal, 'check', b(6 + i * 0.25)))}
      </div>
    </AbsoluteFill>
  );
};

// ---- K: term -----------------------------------------------------------------------------
const Term: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: 'center', padding: '0 190px' }}>
    <Kicker color={COLORS.accent2}><Typed text="new word" at={b(0)} cps={30} /></Kicker>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 200, letterSpacing: -6, lineHeight: 1, color: COLORS.ink, marginTop: 10 }}>
      <GlitchText text="attention tax" at={b(0.5)} dur={18} />
    </div>
    <div style={{ fontFamily: FONT_MONO, fontSize: 34, color: COLORS.muted, marginTop: 10 }}>/əˈten.ʃən tæks/ &nbsp;<i style={{ color: COLORS.accent2 }}>noun</i></div>
    <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 56, lineHeight: 1.3, color: COLORS.ink, marginTop: 40, maxWidth: 1400 }}>
      <Typed text="The cost, paid in focus, for every service that charges you nothing." at={b(2)} cps={36} />
    </div>
  </AbsoluteFill>
);

// ---- L: end ------------------------------------------------------------------------------
const End: React.FC = () => {
  const frame = useCurrentFrame();
  const press = pulse(frame, [b(4)], 10);
  return (
    <Center>
      <Slam at={b(0)} from={3} style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 210, letterSpacing: -8, color: COLORS.ink, lineHeight: 1 }}>
        {BRAND.wordmark[0]}<span style={{ color: COLORS.accent, fontStyle: 'italic' }}>{BRAND.wordmark[1]}</span><span style={{ color: COLORS.muted }}>{BRAND.wordmark[2]}</span>
      </Slam>
      <div style={{ marginTop: 26 }}><SlamLine size={60} at={[b(1.5), b(2), b(2.5)]} words={[{ t: 'Measure', serif: true }, { t: 'it', serif: true }, { t: 'true.', serif: true, c: COLORS.accent }]} /></div>
      <Slam at={b(3.5)} from={2} style={{ marginTop: 56, padding: '22px 56px', borderRadius: 999, background: COLORS.danger, color: '#fff', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, letterSpacing: 2, textTransform: 'uppercase', transform: `scale(${1 - press * 0.08})`, boxShadow: `0 0 ${40 + press * 60}px ${COLORS.danger}88` }}>
        ▶ subscribe · {BRAND.handle}
      </Slam>
    </Center>
  );
};

// ---- the cut -----------------------------------------------------------------------------
type S = { C: React.FC; enter: 'cut' | 'whip' | 'whip-up' | 'zoom' | 'glitch'; exit: 'cut' | 'whip' | 'whip-up' | 'zoom' | 'glitch' };
const ChapterOne: React.FC = () => <Chapter n="01" title="The feed is not a window." sub="it's a room someone else decorated." />;
const ChapterTwo: React.FC = () => <Chapter n="02" title="Paying it on purpose." big={false} />;
const SCENES: S[] = [
  { C: Hook, enter: 'cut', exit: 'whip' },
  { C: Price, enter: 'whip', exit: 'glitch' },
  { C: Title, enter: 'glitch', exit: 'zoom' },
  { C: ChapterOne, enter: 'zoom', exit: 'whip' },
  { C: Quote, enter: 'whip', exit: 'whip-up' },
  { C: Source, enter: 'cut', exit: 'glitch' },
  { C: Clip, enter: 'glitch', exit: 'zoom' },
  { C: ChapterTwo, enter: 'zoom', exit: 'whip-up' },
  { C: Stat, enter: 'whip-up', exit: 'whip' },
  { C: Versus, enter: 'whip', exit: 'glitch' },
  { C: Term, enter: 'glitch', exit: 'zoom' },
  { C: End, enter: 'zoom', exit: 'cut' },
];

// SFX: one gesture per event, locked to the same frames as the visuals
const cues: [number, string, number][] = [
  [B(2), 'impact-deep-soft', -3],
  [CUT[1] - 6, 'whoosh-soft', -6], [CUT[1] + B(2) - P, 'impact-deep-soft', -2], [CUT[1] + B(3) - P, 'pencil-scribble', -12],
  [CUT[2] - 80, 'riser-soft', -8], [CUT[2], 'glitch-zap', -8], [CUT[2], 'impact-deep-soft', -2], [CUT[2] + B(3) - P, 'stamp-hit', -6],
  [CUT[3] - 6, 'whoosh-wind', -6], [CUT[3] + B(1) - P, 'impact-soft', -8],
  [CUT[4] - 6, 'whoosh-soft', -6], [CUT[4] + B(4) - P, 'impact-deep-soft', -4], [CUT[4] + B(6.5) - P, 'stamp-hit', -8],
  [CUT[5], 'camera-shutter', -6], [CUT[5] + B(2) - P, 'pencil-scribble', -10], [CUT[5] + B(3.5) - P, 'stamp-hit', -5],
  [CUT[6], 'glitch-zap', -8], [CUT[6] + 4, 'whoosh-reverse', -10],
  [CUT[7] - 6, 'whoosh-wind', -6],
  [CUT[8] - 6, 'whoosh-soft', -6], [CUT[8] + B(0.5) - P, 'clock-tick-soft', -8], [CUT[8] + B(2) - P, 'impact-soft', -6],
  [CUT[9] - 6, 'whoosh-soft', -6], [CUT[9] + B(0.5) - P, 'stamp-hit', -8], [CUT[9] + B(2.75) - P, 'trap-snap', -8], [CUT[9] + B(4) - P, 'stamp-hit', -8], [CUT[9] + B(6) - P, 'chime-reward', -10],
  [CUT[10], 'glitch-zap', -8], [CUT[10] + B(2) - P, 'keys-typing-soft', -12],
  [CUT[11] - 6, 'whoosh-wind', -6], [CUT[11] + B(0) - P, 'impact-deep-soft', -2], [CUT[11] + B(4) - P, 'ui-click-soft', -4],
];

const KineticReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const hits = [B(2), CUT[1] + 60, CUT[2], CUT[4] + 120, CUT[5] + 105, CUT[11]];
  const vol = (f: number) => interpolate(f, [0, 12, durationInFrames - 100, durationInFrames - 4], [0, 0.9, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <FlightBed boosts={CUT.slice(1)} dim={0.3} />
      <Camera punches={hits.map((at) => ({ at, amt: 0.07 }))} shakes={hits}>
        {SCENES.map((s, i) => {
          const from = Math.max(0, CUT[i] - OV);
          const to = Math.min(END, (CUT[i + 1] ?? END) + OV);
          return (
            <Sequence key={i} from={from} durationInFrames={to - from}>
              <Scene enter={s.enter} exit={s.exit}><s.C /></Scene>
            </Sequence>
          );
        })}
      </Camera>
      <GlitchBurst at={[CUT[2] - 2, CUT[6] - 2, CUT[10] - 2, CUT[1] + 60]} />
      <Flash at={[B(2), CUT[2], CUT[5], CUT[11]]} />
      <Letterbox amt={70} />
      <Grain opacity={0.1} />
      <Scanlines opacity={0.06} />
      <Audio src={music('tech-pulse')} volume={vol} />
      {cues.map(([at, name, g], i) => <Sfx key={i} at={at} name={name} gainDb={g} />)}
    </AbsoluteFill>
  );
};
export default KineticReel;
