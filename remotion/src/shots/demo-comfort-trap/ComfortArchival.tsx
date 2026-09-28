import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { FlightBed, Scribble, Sfx, Stamp, music } from '../../lib/kinetic';
import { DURATION_S, FPS, VOICE, VOICE_END, duckedMusic, fr, sf0, sf1, sw, wf } from './_data';

// =============================================================================
// Style B: ARCHIVAL DOCUMENTARY. The same voice, cut as a found-footage essay: the game bed is
// graded to flickering black-and-white film (gate weave, dust, scratches, heavy grain), and the
// ideas arrive as physical artifacts: a typed index card, a public-notice poster, a carved
// inscription, a telegram, silent-film intertitles, red grease pencil. Typing is synced per word.
// Slow dissolves, film burns at chapter breaks, one hard hit ("emergency").
// =============================================================================
export const compositionConfig = { id: 'ComfortArchival', durationInSeconds: DURATION_S, fps: FPS, width: 1920, height: 1080 };

const INK = '#1d1a16';
const PAPER = '#ece3cf';
const RED = '#b3261e';
const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const E = Easing.bezier(0.33, 1, 0.68, 1);

// ---- film look ---------------------------------------------------------------------------
const FilmBed: React.FC = () => {
  const frame = useCurrentFrame();
  const weaveX = (random(`wx${Math.floor(frame / 2)}`) - 0.5) * 3;
  const weaveY = (random(`wy${Math.floor(frame / 2)}`) - 0.5) * 4;
  const flicker = 0.78 + random(`fl${frame}`) * 0.08;
  return (
    <AbsoluteFill style={{ transform: `translate(${weaveX}px, ${weaveY}px) scale(1.03)`, filter: `grayscale(1) sepia(0.35) contrast(1.35) brightness(${flicker})` }}>
      <FlightBed dim={0.1} speed={0.18} />
    </AbsoluteFill>
  );
};

const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  const specks = new Array(14).fill(0).map((_, i) => {
    const k = `${i}-${frame}`;
    if (random(`on${k}`) > 0.55) return null;
    return <div key={i} style={{ position: 'absolute', left: random(`x${k}`) * 1920, top: random(`y${k}`) * 1080, width: 2 + random(`s${k}`) * 6, height: 2 + random(`h${k}`) * 5, borderRadius: '50%', background: random(`c${k}`) > 0.5 ? '#fff' : '#000', opacity: 0.55 }} />;
  });
  const scratch = random(`sc${Math.floor(frame / 3)}`) > 0.6;
  const sx = random(`sx${Math.floor(frame / 6)}`) * 1920;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {specks}
      {scratch && <div style={{ position: 'absolute', left: sx, top: 0, width: 1.5, height: 1080, background: 'rgba(255,255,255,0.35)' }} />}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 10;
  return (
    <AbsoluteFill style={{ opacity: 0.2, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id={`ag${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#ag${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** film burn: a hot bloom that washes the frame at a chapter break */
const Burn: React.FC<{ at: number[] }> = ({ at }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {at.map((a) => {
        const p = interpolate(frame, [a - 10, a, a + 22], [0, 1, 0], CLAMP);
        if (p <= 0) return null;
        return <AbsoluteFill key={a} style={{ background: `radial-gradient(ellipse 70% 90% at ${30 + random(`bx${a}`) * 40}% 60%, rgba(255,240,200,${p}), rgba(255,140,40,${p * 0.85}) 35%, rgba(120,20,0,${p * 0.6}) 70%, transparent)`, mixBlendMode: 'screen' }} />;
      })}
    </>
  );
};

// ---- paper ---------------------------------------------------------------------------------
const Paper: React.FC<{ w: number; h: number; rot?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; tape?: boolean }> = ({ w, h, rot = 0, color = PAPER, children, style, tape = true }) => (
  <div style={{ position: 'relative', width: w, height: h, transform: `rotate(${rot}deg)`, ...style }}>
    <div style={{ position: 'absolute', inset: 0, background: color, boxShadow: '0 30px 70px rgba(0,0,0,0.6), inset 0 0 90px rgba(120,90,40,0.35)' }} />
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0, opacity: 0.35, mixBlendMode: 'multiply' }}>
      <filter id={`pp${w}${h}`}><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={4} seed={w % 97} /><feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0.6 0" /></filter>
      <rect width="100%" height="100%" filter={`url(#pp${w}${h})`} />
    </svg>
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>{children}</div>
    {tape && <>
      <div style={{ position: 'absolute', left: -30, top: -16, width: 150, height: 40, background: 'rgba(230,220,190,0.7)', transform: 'rotate(-18deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', right: -30, top: -12, width: 150, height: 40, background: 'rgba(230,220,190,0.7)', transform: 'rotate(15deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
    </>}
  </div>
);

/** Typed text synced to the voice: each word types out across its own spoken duration. */
const TypeSent: React.FC<{ i: number; off: number; upper?: boolean; suffix?: string; style?: React.CSSProperties; from?: number; to?: number }> = ({ i, off, upper, suffix = '', style, from = 0, to }) => {
  const frame = useCurrentFrame();
  const ws = sw(i).slice(from, to);
  let caretShown = false;
  return (
    <span style={style}>
      {ws.map((w, j) => {
        const a = fr(w.s) - off;
        const d = Math.max(3, fr(w.e) - fr(w.s));
        const txt = (upper ? w.t.toUpperCase() : w.t) + (j === ws.length - 1 ? suffix : '');
        const n = Math.max(0, Math.min(txt.length, Math.floor(((frame - a) / d) * txt.length)));
        const typing = frame >= a && n < txt.length;
        const caret = typing && !caretShown;
        if (caret) caretShown = true;
        return <span key={j}>{txt.slice(0, n)}{caret && <span style={{ opacity: 0.7 }}>▌</span>}{j < ws.length - 1 && n === txt.length ? ' ' : ''}</span>;
      })}
    </span>
  );
};

/** words that fade up one by one with the voice (for inscriptions and intertitles) */
const FadeSent: React.FC<{ i: number; off: number; from?: number; to?: number; wordStyle?: (w: string, j: number) => React.CSSProperties }> = ({ i, off, from = 0, to, wordStyle }) => {
  const frame = useCurrentFrame();
  const ws = sw(i).slice(from, to);
  return (
    <>
      {ws.map((w, j) => {
        const a = fr(w.s) - off - 4;
        const o = interpolate(frame, [a, a + 12], [0, 1], { ...CLAMP, easing: E });
        return <span key={j} style={{ opacity: o, filter: `blur(${(1 - o) * 6}px)`, ...wordStyle?.(w.t.toLowerCase().replace(/[^a-z']/g, ''), j) }}>{w.t}{j < ws.length - 1 ? ' ' : ''}</span>;
      })}
    </>
  );
};

/** slow Ken Burns push for a whole scene */
const Push: React.FC<{ children: React.ReactNode; from?: number; to?: number; ox?: string }> = ({ children, from = 1, to = 1.08, ox = '50% 50%' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [from, to], CLAMP);
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: ox }}>{children}</AbsoluteFill>;
};

/** dissolve in/out over the Sequence */
const Dissolve: React.FC<{ children: React.ReactNode; t?: number; inT?: number }> = ({ children, t = 16, inT }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const o = Math.min(interpolate(frame, [0, inT ?? t], [0, 1], CLAMP), interpolate(frame, [d - t, d], [1, 0], CLAMP));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', ...style }}>{children}</AbsoluteFill>
);
const typeFont: React.CSSProperties = { fontFamily: FONT_MONO, color: INK };

// ---- scenes --------------------------------------------------------------------------------
type SP = { off: number };

const FieldNotes: React.FC<SP> = ({ off }) => {
  const frame = useCurrentFrame();
  const slap = interpolate(frame, [sf0(4) - off - 6, sf0(4) - off + 4], [0, 1], { ...CLAMP, easing: Easing.bezier(0.2, 1.4, 0.4, 1) });
  return (
    <Push to={1.1} ox="40% 45%">
      <Center>
        <Paper w={1180} h={640} rot={-2.5} style={{ marginTop: -60 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 96, height: 3, background: 'rgba(179,38,30,0.6)' }} />
          {new Array(9).fill(0).map((_, k) => <div key={k} style={{ position: 'absolute', left: 0, right: 0, top: 150 + k * 54, height: 1.5, background: 'rgba(60,90,140,0.35)' }} />)}
          <div style={{ ...typeFont, position: 'absolute', left: 60, top: 36, fontSize: 30, letterSpacing: 4, fontWeight: 700 }}>FIELD NOTES · MODERN LIFE</div>
          <div style={{ ...typeFont, position: 'absolute', left: 60, top: 116, right: 60, fontSize: 40, lineHeight: '54px' }}>
            <TypeSent i={0} off={off} /><br />
            {[1, 2, 3].map((i) => <React.Fragment key={i}>› <TypeSent i={i} off={off} /><br /></React.Fragment>)}
          </div>
        </Paper>
      </Center>
      <div style={{ position: 'absolute', left: 560, top: 720, opacity: slap, transform: `rotate(${3 - 2 * slap}deg) scale(${1.4 - 0.4 * slap})` }}>
        <Paper w={1130} h={130} rot={0} tape={false} color="#f4ecd8">
          <div style={{ ...typeFont, padding: '36px 44px', fontSize: 46, fontWeight: 700, whiteSpace: 'nowrap' }}><TypeSent i={4} off={off} /></div>
          <Scribble kind="circle" at={wf(4, 6) - off + 4} dur={16} w={220} h={100} color={RED} stroke={7} style={{ left: 826, top: 14 }} />
        </Paper>
      </div>
    </Push>
  );
};

const Notice: React.FC<SP> = ({ off }) => {
  const frame = useCurrentFrame();
  const headOn = interpolate(frame, [sf0(6) - off - 4, sf0(6) - off + 10], [0, 1], { ...CLAMP, easing: E });
  return (
    <Push to={1.07}>
      <Center>
        <Paper w={1000} h={900} rot={1.5} color="#e8dcc0">
          <div style={{ position: 'absolute', inset: 26, border: `4px double ${INK}` }} />
          <div style={{ textAlign: 'center', paddingTop: 70 }}>
            <div style={{ ...typeFont, fontSize: 30, letterSpacing: 12, fontWeight: 700 }}><TypeSent i={5} off={off} upper /></div>
            <div style={{ width: 520, height: 3, background: INK, margin: '26px auto' }} />
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 132, lineHeight: 0.95, color: INK, letterSpacing: -2, opacity: headOn, transform: `scale(${1.15 - 0.15 * headOn})` }}>
              COMFORT<br />ISN'T <span style={{ color: RED }}>FREE.</span>
            </div>
            <div style={{ width: 520, height: 3, background: INK, margin: '30px auto' }} />
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 40, lineHeight: 1.3, color: INK, padding: '0 90px' }}><FadeSent i={7} off={off} /></div>
          </div>
          <Stamp text="notice" at={sf1(6) - off} rot={-14} size={48} color={RED} style={{ right: 70, top: 110 }} />
        </Paper>
      </Center>
    </Push>
  );
};

const Ledger: React.FC<SP> = ({ off }) => (
  <Push to={1.06}>
    <Center>
      <Paper w={1300} h={560} rot={-1.2}>
        {new Array(8).fill(0).map((_, k) => <div key={k} style={{ position: 'absolute', left: 0, right: 0, top: 70 + k * 62, height: 1.5, background: 'rgba(40,110,80,0.35)' }} />)}
        <div style={{ position: 'absolute', left: 640, top: 0, bottom: 0, width: 2, background: 'rgba(179,38,30,0.5)' }} />
        <div style={{ ...typeFont, position: 'absolute', left: 60, top: 26, fontSize: 26, letterSpacing: 6, fontWeight: 700 }}>INPUT</div>
        <div style={{ ...typeFont, position: 'absolute', left: 690, top: 26, fontSize: 26, letterSpacing: 6, fontWeight: 700 }}>RESULT</div>
        {[8, 9].map((i, r) => {
          const n = sw(i).length;
          return (
            <React.Fragment key={i}>
              <div style={{ ...typeFont, position: 'absolute', left: 60, top: 120 + r * 190, fontSize: 56, fontWeight: 700 }}><TypeSent i={i} off={off} upper to={2} /></div>
              <Scribble kind="arrow" at={wf(i, 2) - off} dur={10} w={150} h={50} color={RED} stroke={6} style={{ left: 470, top: 140 + r * 190 }} />
              <div style={{ ...typeFont, position: 'absolute', left: 690, top: 120 + r * 190, right: 50, fontSize: 44, lineHeight: 1.2 }}><TypeSent i={i} off={off} from={2} to={n} /></div>
              <Scribble kind="underline" at={fr(sw(i)[n - 1].e) - off} dur={10} w={r === 0 ? 190 : 240} h={30} color={RED} stroke={6} style={{ left: 690, top: 222 + r * 190 }} />
            </React.Fragment>
          );
        })}
      </Paper>
    </Center>
  </Push>
);

const Inscription: React.FC<SP> = ({ off }) => {
  const frame = useCurrentFrame();
  const cut = 7; // "Two thousand years ago, Seneca wrote that" | the quote
  const credit = interpolate(frame, [sf1(10) - off - 10, sf1(10) - off + 20], [0, 1], CLAMP);
  const carve: React.CSSProperties = { color: '#d9d2c3', textShadow: '0 2px 0 rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.25)' };
  return (
    <Push from={1.08} to={1}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(40,36,30,0.55), rgba(8,7,6,0.92))' }} />
      <Center style={{ padding: '0 200px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 40, ...carve, marginBottom: 40 }}><FadeSent i={10} off={off} to={cut} /></div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 76, letterSpacing: 10, lineHeight: 1.35, textTransform: 'uppercase', ...carve }}>
          <FadeSent i={10} off={off} from={cut} wordStyle={(w) => (w === 'imagination' || w === 'reality' ? { color: '#f0c36a' } : {})} />
        </div>
        <div style={{ width: 700 * credit, height: 2, background: '#8a7f6a', margin: '40px auto 24px' }} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 6, color: '#b9ae98', opacity: credit }}>LUCIUS ANNAEUS SENECA · EPISTULAE MORALES XIII · c. 65 AD</div>
      </Center>
    </Push>
  );
};

const Telegram: React.FC<SP> = ({ off }) => (
  <Push to={1.12} ox="50% 60%">
    <Center>
      <Paper w={1200} h={640} rot={2} color="#efe6c8">
        <div style={{ position: 'absolute', inset: 20, border: `2px solid ${INK}`, opacity: 0.6 }} />
        <div style={{ textAlign: 'center', paddingTop: 42, fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 64, letterSpacing: 18, color: INK }}>TELEGRAM</div>
        <div style={{ ...typeFont, textAlign: 'center', fontSize: 20, letterSpacing: 4, marginTop: 6 }}>RECEIVED · MODERN LIFE · RATE: IMMEDIATE</div>
        <div style={{ width: 1000, height: 2, background: INK, margin: '24px auto', opacity: 0.6 }} />
        <div style={{ ...typeFont, padding: '0 90px', fontSize: 38, lineHeight: 1.45, fontWeight: 700 }}>
          <TypeSent i={11} off={off} upper suffix=" STOP" />{' '}
          <TypeSent i={12} off={off} upper suffix=" STOP" />
        </div>
        <Stamp text="urgent" at={wf(12, 7) - off} rot={-12} size={96} color={RED} style={{ right: 90, bottom: 60 }} />
      </Paper>
    </Center>
  </Push>
);

const Intertitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <AbsoluteFill style={{ background: '#0b0a08' }} />
    <Center>
      <div style={{ position: 'relative', width: 1500, height: 820, border: '3px solid #cfc5ae', outline: '1px solid #cfc5ae', outlineOffset: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 120px' }}>
        {['0 0', '100% 0', '0 100%', '100% 100%'].map((p) => (
          <div key={p} style={{ position: 'absolute', left: p.startsWith('0') ? 18 : undefined, right: p.startsWith('100') ? 18 : undefined, top: p.endsWith(' 0') ? 18 : undefined, bottom: p.endsWith('100%') ? 18 : undefined, color: '#cfc5ae', fontSize: 34 }}>✦</div>
        ))}
        {children}
      </div>
    </Center>
  </>
);

const PartTwo: React.FC<SP> = ({ off }) => (
  <Intertitle>
    <div style={{ fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 14, color: '#cfc5ae', marginBottom: 30 }}>PART TWO</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 600, fontSize: 120, color: '#efe6d2', lineHeight: 1.1 }}><FadeSent i={13} off={off} /></div>
  </Intertitle>
);

const Remedies: React.FC<SP> = ({ off }) => (
  <Push to={1.07}>
    <Center>
      <Paper w={1150} h={760} rot={-1.8}>
        <div style={{ padding: '60px 80px' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 600, fontSize: 64, color: INK, lineHeight: 1.1 }}><FadeSent i={14} off={off} wordStyle={(w) => (w === 'purpose' ? { color: RED } : {})} /></div>
          <div style={{ height: 3, background: INK, opacity: 0.6, margin: '28px 0 34px' }} />
          {[15, 16, 17].map((i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 30, marginBottom: 34 }}>
              <div style={{ position: 'relative', width: 50, height: 50, flexShrink: 0, border: `3px solid ${INK}`, marginTop: 4 }}>
                <Scribble kind="check" at={sf1(i) - off - 4} dur={10} w={64} h={58} color={RED} stroke={8} style={{ left: -2, top: -14 }} />
              </div>
              <div style={{ ...typeFont, fontSize: i === 17 ? 38 : 46, lineHeight: 1.3, fontWeight: 700 }}><TypeSent i={i} off={off} /></div>
            </div>
          ))}
        </div>
      </Paper>
    </Center>
  </Push>
);

const NotBecause: React.FC<SP> = ({ off }) => (
  <Intertitle>
    <div style={{ position: 'relative', fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 64, color: '#cfc5ae', marginBottom: 40 }}>
      <FadeSent i={18} off={off} to={5} />
      <Scribble kind="underline" at={wf(18, 4) - off + 8} dur={10} w={520} h={30} color="#d0453a" stroke={9} style={{ left: 330, top: 38 }} />
    </div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 70, lineHeight: 1.25, color: '#efe6d2' }}>
      <FadeSent i={18} off={off} from={5} wordStyle={(w) => (w === 'little' || w === 'resistance' ? { color: '#f0c36a' } : {})} />
    </div>
  </Intertitle>
);

const Final: React.FC<SP> = ({ off }) => {
  const frame = useCurrentFrame();
  const endAt = fr(VOICE_END + 0.6) - off;
  const a = interpolate(frame, [endAt - 14, endAt], [1, 0], CLAMP);
  const b = interpolate(frame, [endAt, endAt + 24], [0, 1], { ...CLAMP, easing: E });
  return (
    <Intertitle>
      <div style={{ opacity: a }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 130, color: '#efe6d2' }}><FadeSent i={19} off={off} wordStyle={(w) => (w === 'tool' ? { color: '#f0c36a' } : {})} /></div>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 56, color: '#cfc5ae', marginTop: 30 }}><FadeSent i={20} off={off} /></div>
      </div>
      <div style={{ position: 'absolute', opacity: b, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 150, color: '#efe6d2', letterSpacing: -4 }}>
          {BRAND.wordmark[0]}<span style={{ fontStyle: 'italic', color: '#f0c36a' }}>{BRAND.wordmark[1]}</span><span style={{ color: '#8a7f6a' }}>{BRAND.wordmark[2]}</span>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 10, color: '#cfc5ae', marginTop: 20 }}>MEASURE IT TRUE · FIN</div>
      </div>
    </Intertitle>
  );
};

// ---- the cut -------------------------------------------------------------------------------
// [first sentence, scene]; scenes overlap by DX frames so every change is a dissolve
const SCENES: [number, React.FC<SP>][] = [
  [0, FieldNotes], [5, Notice], [8, Ledger], [10, Inscription], [11, Telegram],
  [13, PartTwo], [14, Remedies], [18, NotBecause], [19, Final],
];
const DX = 14;
const PRE = 12;
const END = DURATION_S * FPS;
const starts = SCENES.map(([i], k) => (k === 0 ? 0 : sf0(i) - PRE));

const ComfortArchival: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <FilmBed />
    <AbsoluteFill style={{ background: 'rgba(20,14,6,0.25)' }} />
    {SCENES.map(([, C], k) => {
      const from = Math.max(0, starts[k] - DX);
      const to = Math.min(END, (starts[k + 1] ?? END) + DX);
      return (
        <Sequence key={k} from={from} durationInFrames={to - from}>
          <Dissolve t={DX * 2} inT={k === 0 ? 1 : DX * 2}><C off={from} /></Dissolve>
        </Sequence>
      );
    })}
    <Burn at={[starts[1], starts[5], starts[8]]} />
    <Dust />
    <Grain />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 72% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none' }} />
    <Audio src={staticFile(VOICE)} />
    <Audio src={music('cinematic-min')} volume={(f) => duckedMusic(f, 0.2, 0.5)} />
    <Sfx at={2} name="keys-typing-soft" gainDb={-18} />
    <Sfx at={starts[1] - 6} name="whoosh-wind" gainDb={-12} />
    <Sfx at={sf1(6)} name="stamp-hit" gainDb={-10} />
    <Sfx at={wf(12, 7)} name="stamp-hit" gainDb={-6} />
    <Sfx at={starts[5] - 6} name="whoosh-wind" gainDb={-12} />
    <Sfx at={sf1(15) - 4} name="pencil-scribble" gainDb={-16} />
    <Sfx at={starts[8] - 6} name="whoosh-wind" gainDb={-12} />
    <Sfx at={fr(VOICE_END + 0.6)} name="impact-deep-soft" gainDb={-8} />
  </AbsoluteFill>
);
export default ComfortArchival;
