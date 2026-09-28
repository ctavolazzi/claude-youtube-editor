import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { BRAND, COLORS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { Grain, Scanlines } from '../../lib/commentary';
import {
  Camera, FlightBed, Flash, GlitchBurst, GlitchText, Letterbox, Scene, Scribble, Sfx, Slam, SlamLine,
  SlotNumber, Stamp, Typed, Word, music,
} from '../../lib/kinetic';
import { DURATION_S, FPS, VOICE, VOICE_END, duckedMusic, sf0, sf1, sw, wf } from './_data';

// =============================================================================
// Style A: KINETIC. The Comfort Trap, cut to the VOICE: every word slams on the frame it is
// spoken (word times from edited-transcript.json), scenes change on sentence boundaries,
// the flight bed surges on every cut, hero words punch the camera.
// =============================================================================
export const compositionConfig = { id: 'ComfortKinetic', durationInSeconds: DURATION_S, fps: FPS, width: 1920, height: 1080 };

const LEAD = 3; // slam starts a hair before the word so it is readable as it is heard
type Style = Partial<{ c: string; size: number; serif: boolean; hit: boolean }>;

/** words of sentence i as SlamLine input, local to a scene that starts at global frame `off` */
const say = (i: number, off: number, style: (w: string, j: number) => Style = () => ({})) => {
  const ws = sw(i);
  return {
    words: ws.map((w, j) => ({ t: w.t, ...style(w.t.toLowerCase().replace(/[^a-z']/g, ''), j) })) as Word[],
    at: ws.map((_, j) => wf(i, j) - off - LEAD),
  };
};

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 150px', ...style }}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = COLORS.accent }) => (
  <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 8, textTransform: 'uppercase', color, marginBottom: 24 }}>{children}</div>
);

// ---- scenes: each receives `off` = its global start frame --------------------------------
type SceneProps = { off: number };

const Opening: React.FC<SceneProps> = ({ off }) => {
  const a = say(0, off, (w) => (w === 'comfortable' ? { c: COLORS.accent, serif: true, size: 190, hit: true } : {}));
  return <Center><SlamLine size={120} maxWidth={1500} {...a} /></Center>;
};

const Luxuries: React.FC<SceneProps> = ({ off }) => {
  const hi = new Set(['twenty', 'minutes', 'one', 'tap', 'away', 'always', 'perfect']);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 170 }}>
      {[1, 2, 3].map((i) => {
        const a = say(i, off, (w) => (hi.has(w) ? { c: COLORS.accent } : {}));
        return (
          <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 30, marginTop: 30 }}>
            <SlamLine align="left" size={76} maxWidth={1400} {...a} />
            <Scribble kind="check" at={sf1(i) - off - 6} dur={8} w={60} h={50} color={COLORS.signal} stroke={10} style={{ position: 'relative' }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Tired: React.FC<SceneProps> = ({ off }) => {
  const ws = sw(4);
  const lead = { words: ws.slice(0, 6).map((w) => w.t) as Word[], at: ws.slice(0, 6).map((_, j) => wf(4, j) - off - LEAD) };
  return (
    <Center>
      <SlamLine size={84} {...lead} />
      <Slam at={wf(4, 6) - off - LEAD} from={4} rot={-8} style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 900, fontSize: 330, color: COLORS.danger, lineHeight: 1, letterSpacing: -12, textShadow: '0 20px 80px rgba(238,74,144,0.35)' }}>tired?</Slam>
    </Center>
  );
};

const Trap: React.FC<SceneProps> = ({ off }) => {
  const b = say(6, off, (w, j) => (j >= 1 ? { c: COLORS.danger, serif: true, size: 140, hit: j === 2 } : {}));
  return (
    <Center>
      <Kicker><Typed text="chapter 01" at={sf0(5) - off} cps={24} /></Kicker>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 210, letterSpacing: -8, lineHeight: 0.9, color: COLORS.ink, textTransform: 'uppercase' }}>
        <GlitchText text="The trap" at={wf(5, 2) - off - LEAD} dur={14} />
      </div>
      <div style={{ marginTop: 30 }}><SlamLine size={110} {...b} /></div>
    </Center>
  );
};

const Friction: React.FC<SceneProps> = ({ off }) => {
  const a = say(7, off, (w) => (w === 'friction' ? { c: COLORS.accent, hit: true } : w === 'workout' ? { c: COLORS.signal } : w === 'will' ? { c: COLORS.accent, serif: true, size: 200, hit: true } : {}));
  return <Center><SlamLine size={78} maxWidth={1500} {...a} /></Center>;
};

const LessIsWeaker: React.FC<SceneProps> = ({ off }) => (
  <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 170 }}>
    {[8, 9].map((i) => {
      const a = say(i, off, (w) => (w === 'weaker' || w === 'too' ? { c: COLORS.danger, serif: true, size: 110, hit: true } : w === 'less' ? { c: COLORS.accent } : {}));
      return <div key={i} style={{ marginTop: 50 }}><SlamLine align="left" size={96} maxWidth={1600} {...a} /></div>;
    })}
  </AbsoluteFill>
);

const Seneca: React.FC<SceneProps> = ({ off }) => {
  const ws = sw(10);
  const cut = 7; // "Two thousand years ago, Seneca wrote that" | "we suffer more often in imagination than in reality."
  const intro = { words: ws.slice(0, cut).map((w) => ({ t: w.t, serif: true })) as Word[], at: ws.slice(0, cut).map((_, j) => wf(10, j) - off - LEAD) };
  const q = {
    words: ws.slice(cut).map((w) => {
      const k = w.t.toLowerCase().replace(/[^a-z]/g, '');
      return k === 'imagination' ? { t: w.t, serif: true, c: COLORS.accent, hit: true } : k === 'reality' ? { t: w.t, serif: true, c: COLORS.signal, hit: true } : { t: w.t, serif: true };
    }) as Word[],
    at: ws.slice(cut).map((_, j) => wf(10, cut + j) - off - LEAD),
  };
  return (
    <Center>
      <Slam at={sf0(10) - off} from={3} style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 300, color: COLORS.accent2, lineHeight: 0.6, height: 150 }}>“</Slam>
      <SlamLine size={54} {...intro} />
      <div style={{ marginTop: 18 }}><SlamLine size={104} maxWidth={1600} {...q} /></div>
      <div style={{ marginTop: 34, fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 3, color: COLORS.ink }}>
        <Typed text="SENECA · MORAL LETTERS, XIII" at={sf1(10) - off - 20} cps={40} />
      </div>
      <Stamp text="c. 65 AD" at={sf1(10) - off + 10} rot={9} size={40} color={COLORS.signal} style={{ right: 250, bottom: 220 }} />
    </Center>
  );
};

const Emergency: React.FC<SceneProps> = ({ off }) => {
  const a = say(11, off, (w) => (w === 'small' || w === 'discomforts' ? { c: COLORS.accent } : w === 'honest' ? { c: COLORS.signal, serif: true } : {}));
  const ws = sw(12);
  const n = ws.length;
  const b = { words: ws.slice(0, n - 1).map((w) => w.t) as Word[], at: ws.slice(0, n - 1).map((_, j) => wf(12, j) - off - LEAD) };
  return (
    <Center>
      <SlamLine size={60} maxWidth={1500} {...a} />
      <div style={{ marginTop: 40 }}><SlamLine size={70} maxWidth={1500} {...b} /></div>
      <Slam at={wf(12, n - 1) - off - LEAD} from={4} rot={6} style={{ marginTop: 10, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 210, letterSpacing: -6, textTransform: 'uppercase', color: COLORS.danger, lineHeight: 1 }}>
        <GlitchText text="emergency." at={wf(12, n - 1) - off} dur={16} />
      </Slam>
    </Center>
  );
};

const TheMove: React.FC<SceneProps> = ({ off }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: -30, top: -140, fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 900, lineHeight: 1, color: 'transparent', WebkitTextStroke: `4px ${COLORS.accent2}`, letterSpacing: -40, transform: `translateX(${-frame * 0.7}px)` }}>02</div>
      <div style={{ position: 'absolute', left: 150, top: 640 }}>
        <Kicker color={COLORS.accent2}><Typed text="chapter 02" at={4} cps={24} /></Kicker>
        <SlamLine align="left" size={130} {...say(13, off, (w, j) => (j >= 2 ? { serif: true, c: j === 3 ? COLORS.accent : COLORS.ink, hit: j === 3 } : { serif: true }))} />
      </div>
    </AbsoluteFill>
  );
};

const Checklist: React.FC<SceneProps> = ({ off }) => {
  const frame = useCurrentFrame();
  const head = say(14, off, (w) => (w === 'friction' ? { c: COLORS.accent } : w === 'purpose' ? { c: COLORS.accent, serif: true, hit: true } : {}));
  return (
    <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: 170 }}>
      <SlamLine align="left" size={96} maxWidth={1600} {...head} />
      {[15, 16, 17].map((i) => {
        const a = say(i, off, (w) => (w === 'ten' || w === 'minutes' ? { c: COLORS.accent } : w === 'phone' ? { c: COLORS.danger } : {}));
        return (
          <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 26, marginTop: 34 }}>
            <Scribble kind="check" at={sf0(i) - off - 4} dur={8} w={54} h={46} color={COLORS.signal} stroke={9} style={{ position: 'relative' }} />
            <SlamLine align="left" size={i === 17 ? 52 : 68} maxWidth={1400} {...a} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', right: 150, top: 110, textAlign: 'center' }}>
        <SlotNumber value={10} at={wf(17, 4) - off - LEAD} size={200} color={COLORS.accent} />
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COLORS.ink, textAlign: 'center', opacity: frame > wf(17, 5) - off ? 1 : 0 }}>MINUTES</div>
      </div>
    </AbsoluteFill>
  );
};

const NotBecause: React.FC<SceneProps> = ({ off }) => {
  const ws = sw(18);
  const cut = 5; // "Not because suffering is good," | "but because a little resistance ..."
  const a = { words: ws.slice(0, cut).map((w) => ({ t: w.t, serif: true })) as Word[], at: ws.slice(0, cut).map((_, j) => wf(18, j) - off - LEAD) };
  const b = {
    words: ws.slice(cut).map((w, j) => {
      const k = w.t.toLowerCase().replace(/[^a-z]/g, '');
      if (k === 'little' || k === 'resistance') return { t: w.t, c: COLORS.accent };
      if (j >= ws.length - cut - 3) return { t: w.t, serif: true, c: COLORS.signal, size: 120, hit: k === 'thing' };
      return { t: w.t };
    }) as Word[],
    at: ws.slice(cut).map((_, j) => wf(18, cut + j) - off - LEAD),
  };
  return (
    <Center>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <SlamLine size={80} {...a} />
        <Scribble kind="underline" at={wf(18, 4) - off + 6} dur={8} w={620} h={40} color={COLORS.danger} stroke={12} style={{ left: 420, top: 30 }} />
      </div>
      <div style={{ marginTop: 40 }}><SlamLine size={70} maxWidth={1550} {...b} /></div>
    </Center>
  );
};

const Ending: React.FC<SceneProps> = ({ off }) => {
  const frame = useCurrentFrame();
  const endAt = Math.round((VOICE_END + 0.5) * FPS) - off;
  const a = say(19, off, (w) => (w === 'tool' ? { c: COLORS.accent, serif: true, size: 220, hit: true } : {}));
  const b = say(20, off, (w) => (w === 'room' ? { c: COLORS.accent, serif: true } : { serif: true }));
  const fade = Math.max(0, Math.min(1, (endAt - frame) / 12));
  return (
    <>
      <Center style={{ opacity: fade }}>
        <SlamLine size={120} {...a} />
        <div style={{ marginTop: 30 }}><SlamLine size={70} maxWidth={1500} {...b} /></div>
      </Center>
      <Center style={{ opacity: frame >= endAt ? 1 : 0 }}>
        <Slam at={endAt} from={3} style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 200, letterSpacing: -8, color: COLORS.ink, lineHeight: 1 }}>
          {BRAND.wordmark[0]}<span style={{ color: COLORS.accent, fontStyle: 'italic' }}>{BRAND.wordmark[1]}</span><span style={{ color: COLORS.muted }}>{BRAND.wordmark[2]}</span>
        </Slam>
        <div style={{ marginTop: 26 }}><SlamLine size={58} at={[endAt + 20, endAt + 28, endAt + 36]} words={[{ t: 'Measure', serif: true }, { t: 'it', serif: true }, { t: 'true.', serif: true, c: COLORS.accent }]} /></div>
      </Center>
    </>
  );
};

// ---- the cut -----------------------------------------------------------------------------
type T = 'cut' | 'whip' | 'whip-up' | 'zoom' | 'glitch';
// [first sentence, component, enter, exit]. A scene runs until the next scene's first sentence.
const SCENES: [number, React.FC<SceneProps>, T, T][] = [
  [0, Opening, 'cut', 'whip'],
  [1, Luxuries, 'whip', 'whip-up'],
  [4, Tired, 'whip-up', 'glitch'],
  [5, Trap, 'glitch', 'whip'],
  [7, Friction, 'whip', 'whip-up'],
  [8, LessIsWeaker, 'whip-up', 'zoom'],
  [10, Seneca, 'zoom', 'whip'],
  [11, Emergency, 'whip', 'zoom'],
  [13, TheMove, 'zoom', 'whip'],
  [14, Checklist, 'whip', 'whip'],
  [18, NotBecause, 'whip', 'glitch'],
  [19, Ending, 'glitch', 'cut'],
];
const OV = 5;
const PRE = 8; // a scene lands this many frames before its first word
const END = DURATION_S * FPS;
const starts = SCENES.map(([i], k) => (k === 0 ? 0 : sf0(i) - PRE));

// hero hits (global frames): punch + shake + (some) flash
const HITS = [wf(0, 6), wf(4, 6), wf(5, 2), wf(7, 16), wf(10, 12), wf(10, 15), wf(12, 7), wf(13, 3), wf(18, 18), wf(19, 3)];

const cues: [number, string, number][] = [
  ...starts.slice(1).map((s, k): [number, string, number] => [s - 4, SCENES[k + 1][2] === 'glitch' ? 'glitch-zap' : SCENES[k + 1][2] === 'zoom' ? 'whoosh-wind' : 'whoosh-soft', -9]),
  ...HITS.map((h): [number, string, number] => [h - 2, 'impact-deep-soft', -7]),
  [sf1(1) - 6, 'ui-click-soft', -10], [sf1(2) - 6, 'ui-click-soft', -10], [sf1(3) - 6, 'ui-click-soft', -10],
  [sf1(10) + 10, 'stamp-hit', -8],
  [sf0(15) - 4, 'ui-click-soft', -10], [sf0(16) - 4, 'ui-click-soft', -10], [sf0(17) - 4, 'ui-click-soft', -10],
  [wf(17, 4), 'clock-tick-soft', -12],
  [Math.round((VOICE_END + 0.5) * FPS), 'impact-deep-soft', -5],
];

const ComfortKinetic: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
    <FlightBed boosts={starts.slice(1)} dim={0.34} />
    <Camera punches={HITS.map((at) => ({ at, amt: 0.06 }))} shakes={HITS} shakeAmt={10}>
      {SCENES.map(([, C, enter, exit], k) => {
        const from = Math.max(0, starts[k] - OV);
        const to = Math.min(END, (starts[k + 1] ?? END) + OV);
        return (
          <Sequence key={k} from={from} durationInFrames={to - from}>
            <Scene enter={enter} exit={exit}><C off={from} /></Scene>
          </Sequence>
        );
      })}
    </Camera>
    <GlitchBurst at={[starts[3], starts[11], wf(12, 7)]} />
    <Flash at={[wf(4, 6), wf(12, 7), Math.round((VOICE_END + 0.5) * FPS)]} />
    <Letterbox amt={60} />
    <Grain opacity={0.1} />
    <Scanlines opacity={0.05} />
    <Audio src={staticFile(VOICE)} />
    <Audio src={music('tech-pulse')} volume={(f) => duckedMusic(f, 0.12, 0.34)} />
    {cues.map(([at, name, g], i) => <Sfx key={i} at={Math.max(0, at)} name={name} gainDb={g} />)}
  </AbsoluteFill>
);
export default ComfortKinetic;
