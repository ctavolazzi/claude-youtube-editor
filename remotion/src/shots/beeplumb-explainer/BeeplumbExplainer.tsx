import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  Easing,
  delayRender,
  continueRender,
  cancelRender,
} from 'remotion';

// =============================================================================
// COMPOSITION CONFIG — Beeplumb explainer (faceless, no footage).
// Source of truth for every claim on screen: the beeplumb repo README (v0.0.1).
// =============================================================================
export const compositionConfig = {
  id: 'BeeplumbExplainer',
  durationInSeconds: 62,
  fps: 30,
  width: 1920,
  height: 1080,
};

// =============================================================================
// BRAND — beeplumbgh.net (dark terminal, Courier, CRT scanlines, plum/pink/yellow).
// Defined LOCALLY on purpose, like short-blocks-30: this piece wears the
// Beeplumb site brand, not the repo's long-form indigo brand.
// =============================================================================
const C = {
  bg: '#0a0a0a', bg3: '#161616', fg: '#e8e8e8', body: '#b8aace', dim: '#554466',
  dim2: '#1e1428', dimText: '#9284ab', plum: '#9944cc', plumText: '#b06ee0',
  pink: '#e8297a', pinkText: '#ee4a90', yellow: '#f5c518', cyan: '#22bbcc',
  green: '#00cc44', dos: '#00ff41',
} as const;

// Fonts are bundled in media/projects/beeplumb-explainer/fonts/ (OFL) so the render needs
// no network font fetch. delayRender holds every frame until all three faces are ready.
const CRT = 'BeeplumbVT323';
const MONO = 'BeeplumbCourierPrime';
const FONT_FILES: [string, string, string][] = [
  [CRT, '400', 'VT323-400.woff2'],
  [MONO, '400', 'CourierPrime-400.woff2'],
  [MONO, '700', 'CourierPrime-700.woff2'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('beeplumb fonts', { timeoutInMilliseconds: 120000 });
  Promise.all(FONT_FILES.map(([family, weight, file]) => {
    const face = new FontFace(family, `url(${staticFile(`projects/beeplumb-explainer/fonts/${file}`)})`, { weight });
    return face.load().then((f) => { (document.fonts as unknown as { add: (x: FontFace) => void }).add(f); });
  })).then(() => continueRender(handle), (err) => cancelRender(err));
}

const EASE_OUT = Easing.bezier(0.22, 0.72, 0.28, 1);
const EASE = Easing.bezier(0.5, 0, 0.2, 1);
const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);

const iio = (f: number, inR: number[], outR: number[], easing?: (n: number) => number) =>
  interpolate(f, inR, outR, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

const lib = (p: string) => staticFile(`library/${p}`);

// Scene timing (frames @30fps)
const S = {
  hook: [0, 150],
  leak: [150, 180],
  situ: [330, 210],
  ref: [540, 330],
  refinery: [870, 390],
  rating: [1260, 300],
  status: [1560, 180],
  end: [1740, 120],
} as const;

// =============================================================================
// SHARED PIECES
// =============================================================================
const SceneFade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = iio(f, [0, 8, dur - 8, dur], [0, 1, 1, 0]);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Heading: React.FC<{ text: string; color?: string; at?: number; size?: number; top?: number }> = ({
  text, color = C.yellow, at = 0, size = 96, top = 110,
}) => {
  const f = useCurrentFrame();
  const o = iio(f, [at, at + 12], [0, 1]);
  const y = iio(f, [at, at + 14], [18, 0], EASE_OUT);
  return (
    <div style={{
      position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily: CRT,
      fontSize: size, color, letterSpacing: 2, opacity: o, transform: `translateY(${y}px)`,
      textShadow: `0 0 24px ${color}66`,
    }}>{text}</div>
  );
};

const Caption: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame();
  const o = iio(f, [at, at + 12], [0, 1]);
  return (
    <div style={{
      position: 'absolute', bottom: 120, left: 160, right: 160, textAlign: 'center',
      fontFamily: MONO, fontSize: 40, color: C.body, opacity: o, lineHeight: 1.35,
    }}>{text}</div>
  );
};

// XP-style window module, like the site's
const Window: React.FC<{ title: string; x: number; y: number; w: number; h: number; accent?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  title, x, y, w, h, accent = C.plum, children, style,
}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h, background: C.bg3,
    border: `2px solid ${C.dim}`, borderRadius: 6, overflow: 'hidden',
    boxShadow: `0 0 40px ${accent}22`, ...style,
  }}>
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', background: `linear-gradient(to right, ${C.dim2}, ${accent} 60%, ${C.dim2})`,
      fontFamily: MONO, fontWeight: 700, fontSize: 22, color: '#fff',
    }}>
      <span>{title}</span>
      <span style={{ letterSpacing: 8 }}>_ □ ×</span>
    </div>
    <div style={{ position: 'relative', padding: 28 }}>{children}</div>
  </div>
);

const Typed: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties; cursor?: boolean }> = ({
  text, at, cps = 0.6, style, cursor,
}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((f - at) * cps)));
  const done = n >= text.length;
  const blink = Math.floor(f / 15) % 2 === 0;
  if (f < at) return null;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {cursor && (!done || blink) ? <span style={{ display: 'inline-block', width: '0.5em', height: '0.8em', marginLeft: '0.1em', background: 'currentColor', verticalAlign: '-0.05em' }} /> : null}
    </span>
  );
};

const Stamp: React.FC<{ text: string; at: number; color: string; x: number; y: number; size?: number; rot?: number }> = ({
  text, at, color, x, y, size = 72, rot = -8,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 6], [1.8, 1], EASE_OUT);
  const o = iio(f, [at, at + 4], [0, 1]);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
      opacity: o, border: `6px solid ${color}`, color, padding: '6px 26px', fontFamily: CRT,
      fontSize: size, letterSpacing: 4, whiteSpace: 'nowrap', background: `${C.bg}cc`,
      textShadow: `0 0 18px ${color}88`, boxShadow: `0 0 30px ${color}44`,
    }}>{text}</div>
  );
};

// Global chrome: marquee ticker, footer URL, scanlines, vignette
const TICKER = '  //  BEEPLUMB v0.0.1  //  the referee is code, not a model  //  138 tests passing  //  309 atoms, 39 built  //  beeplumbgh.net  //  published by Johnny Autoseed LLC';
// Courier Prime is monospaced at 0.6em, so one copy is exactly this wide: the loop has no seam.
const TICKER_W = TICKER.length * 24 * 0.6;
const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const x = -((f * 3) % TICKER_W);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 46, background: '#000',
        borderBottom: `2px solid ${C.dim}`, overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <div style={{ position: 'absolute', left: x, top: 8, fontFamily: MONO, fontSize: 24, color: C.yellow, whiteSpace: 'pre' }}>
          {TICKER + TICKER + TICKER}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 28, left: 40, fontFamily: MONO, fontSize: 24, color: C.dimText }}>
        beeplumbgh<span style={{ color: C.pinkText }}>.net</span>
      </div>
      <div style={{ position: 'absolute', bottom: 28, right: 40, fontFamily: MONO, fontSize: 24, color: C.dimText }}>
        v0.0.1
      </div>
      <AbsoluteFill style={{
        background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0) 4px)',
      }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};

// =============================================================================
// 1 · HOOK — the one question
// =============================================================================
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const sub = iio(f, [92, 106], [0, 1]);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontFamily: CRT, fontSize: 118, color: C.dos, textShadow: `0 0 28px ${C.dos}88`, width: 1640 }}>
        <Typed text="> can an AI run a whole campaign?" at={10} cps={0.55} cursor />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 42, color: C.body, marginTop: 40, opacity: sub, width: 1640 }}>
        Start to finish. Every ruling. Every session. The record kept straight.
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 2 · ANSWER KEYS LEAK
// =============================================================================
const BENCHES = [
  { name: 'MMLU', from: 44, to: 91 },
  { name: 'HumanEval', from: 31, to: 96 },
  { name: 'GSM8K', from: 38, to: 95 },
];
const Leak: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Heading text="ANSWER KEYS LEAK." />
      {BENCHES.map((b, i) => {
        const at = 14 + i * 8;
        const o = iio(f, [at, at + 10], [0, 1]);
        const y = iio(f, [at, at + 14], [40, 0], EASE_OUT);
        const t = iio(f, [40, 115], [0, 1], EASE);
        const score = Math.round(b.from + (b.to - b.from) * t);
        const x = 260 + i * 490;
        return (
          <div key={b.name} style={{ position: 'absolute', left: x, top: 290, opacity: o * iio(f, [116, 126], [1, 0.4]), transform: `translateY(${y}px)` }}>
            <Window title={b.name.toLowerCase() + '.txt'} x={0} y={0} w={420} h={380} accent={C.cyan}>
              <div style={{ fontFamily: CRT, fontSize: 72, color: C.fg }}>{b.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 26, color: C.dimText, marginTop: 6 }}>score</div>
              <div style={{ height: 34, background: C.dim2, border: `2px solid ${C.dim}`, marginTop: 10 }}>
                <div style={{ width: `${score}%`, height: '100%', background: `linear-gradient(to right, ${C.plum}, ${C.pink})` }} />
              </div>
              <div style={{ fontFamily: CRT, fontSize: 80, color: C.yellow, marginTop: 8 }}>{score}%</div>
            </Window>
          </div>
        );
      })}
      <Stamp text="IN THE TRAINING SET" at={118} color={C.pink} x={960} y={480} size={96} />
      <Caption text="The test ends up in the training data. Scores climb. The number stops tracking the skill." at={122} />
    </AbsoluteFill>
  );
};

// =============================================================================
// 3 · RULES CONTAMINATED, SITUATIONS NOT
// =============================================================================
const GRID = 8;
const TOKENS = [
  { c: C.pink, path: [[1, 6], [2, 5], [3, 5], [4, 4], [4, 3]] },
  { c: C.cyan, path: [[6, 1], [5, 2], [5, 3], [4, 3], [3, 3]] },
  { c: C.yellow, path: [[1, 1], [2, 2], [2, 3], [2, 4], [3, 4]] },
  { c: C.dos, path: [[6, 6], [6, 5], [5, 5], [5, 4], [5, 3]] },
];
const Situations: React.FC = () => {
  const f = useCurrentFrame();
  const leftO = iio(f, [10, 22], [0, 1]);
  const okO = iio(f, [40, 52], [0, 1]);
  const rightO = iio(f, [60, 74], [0, 1]);
  const turn = Math.round(iio(f, [70, 170], [1, 40], EASE));
  const cell = 52;
  // pseudo-random state hash that scrambles every 3 frames, settles once turn 40 lands
  const seed = Math.floor(Math.min(f, 170) / 3);
  const hex = ((seed * 2654435761) >>> 0).toString(16).padStart(8, '0') + ((seed * 40503 + 977) >>> 0).toString(16).padStart(8, '0');
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 150, top: 200, width: 700, opacity: leftO }}>
        <div style={{ fontFamily: CRT, fontSize: 84, color: C.dimText }}>THE RULES</div>
        <div style={{ fontFamily: MONO, fontSize: 38, color: C.body, marginTop: 20, lineHeight: 1.4 }}>
          All over the open web. Almost certainly in the training data.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 38, color: C.cyan, marginTop: 30, opacity: okO }}>
          ✓ That's fine. Knowing the rules is the prerequisite, not the test.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1010, top: 200, opacity: rightO }}>
        <div style={{ fontFamily: CRT, fontSize: 84, color: C.yellow }}>THE SITUATION</div>
        <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
          <div style={{ position: 'relative', width: GRID * cell, height: GRID * cell, border: `2px solid ${C.dim}` }}>
            {Array.from({ length: GRID * GRID }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', left: (i % GRID) * cell, top: Math.floor(i / GRID) * cell, width: cell, height: cell,
                background: (i + Math.floor(i / GRID)) % 2 ? C.dim2 : C.bg3,
              }} />
            ))}
            {TOKENS.map((t, k) => {
              const p = iio(f, [70, 170], [0, t.path.length - 1], EASE);
              const a = Math.floor(p), b = Math.min(t.path.length - 1, a + 1), r = p - a;
              const cx = (t.path[a][0] + (t.path[b][0] - t.path[a][0]) * r + 0.5) * cell;
              const cy = (t.path[a][1] + (t.path[b][1] - t.path[a][1]) * r + 0.5) * cell;
              return <div key={k} style={{
                position: 'absolute', left: cx - 16, top: cy - 16, width: 32, height: 32, borderRadius: 16,
                background: t.c, boxShadow: `0 0 16px ${t.c}`,
              }} />;
            })}
          </div>
          <div style={{ fontFamily: MONO, color: C.body, fontSize: 28, lineHeight: 1.6 }}>
            <div>turn</div>
            <div style={{ fontFamily: CRT, fontSize: 110, color: C.fg, lineHeight: 1 }}>{turn}</div>
            <div style={{ marginTop: 20 }}>state</div>
            <div style={{ fontFamily: CRT, fontSize: 40, color: C.plumText }}>{hex.slice(0, 8)}</div>
            <div style={{ fontFamily: CRT, fontSize: 40, color: C.plumText }}>{hex.slice(8)}</div>
          </div>
        </div>
      </div>
      <Caption text="Turn 40, against this opponent, played this way. Generated at runtime. A poor target for memorization." at={150} />
    </AbsoluteFill>
  );
};

// =============================================================================
// 4 · THE REFEREE IS CODE
// =============================================================================
const Referee: React.FC = () => {
  const f = useCurrentFrame();
  const line = (at: number) => ({ opacity: iio(f, [at, at + 6], [0, 1]) });
  const runsO = iio(f, [190, 204], [0, 1]);
  return (
    <AbsoluteFill>
      <Heading text="THE REFEREE IS CODE, NOT A MODEL." size={84} />
      <Window title="cupel.exe  ·  rules engine" x={260} y={250} w={1400} h={420} accent={C.plum}>
        <div style={{ fontFamily: MONO, fontSize: 36, color: C.fg, lineHeight: 1.65, whiteSpace: 'pre' }}>
          <div><Typed text="> action   move 40 ft" at={16} cps={0.9} style={{ color: C.dos }} /></div>
          <div style={line(44)}><span style={{ color: C.dimText }}>  actor    </span>speed 30 ft</div>
          <div style={line(62)}><span style={{ color: C.dimText }}>  check    </span>40 &gt; 30</div>
          <div style={line(84)}><span style={{ color: C.dimText }}>  ruling   </span><span style={{ color: C.pinkText, fontWeight: 700 }}>REJECTED</span> <span style={{ color: C.dimText }}>+ rule citation</span></div>
        </div>
        <Stamp text="REJECTED" at={96} color={C.pink} x={1110} y={170} size={110} rot={-10} />
      </Window>
      <div style={{ position: 'absolute', top: 720, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 36, opacity: runsO }}>
        {['same state', 'same ruling', 'any machine'].map((t, i) => (
          <div key={t} style={{
            fontFamily: MONO, fontSize: 34, color: C.cyan, border: `2px solid ${C.cyan}`, padding: '12px 28px',
            opacity: iio(f, [190 + i * 14, 202 + i * 14], [0, 1]),
          }}>✓ {t}</div>
        ))}
      </div>
      <Caption text="No model-as-judge. No bias toward long answers or a confident tone." at={250} />
    </AbsoluteFill>
  );
};

// =============================================================================
// 5 · THE REFINERY
// =============================================================================
const STAGES = [
  { id: 'lode', does: 'source the scenarios', gear: 'adit · stope', c: C.dimText },
  { id: 'furnace', does: 'run the trial', gear: 'bloomery · tuyere', c: C.pink },
  { id: 'assay', does: 'decide what is real', gear: 'scorifier · cupel', c: C.yellow },
  { id: 'yield', does: 'weigh and issue', gear: 'prill · regulus', c: C.cyan },
  { id: 'field', does: 'contest formats', gear: 'holmgang · skald', c: C.dos },
];
const STAGE_AT = (i: number) => 40 + i * 50;
export const REFINERY_WHOOSH = STAGES.map((_, i) => STAGE_AT(i));
const Refinery: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = 220, dx = 370, y = 520;
  const ore = iio(f, [STAGE_AT(0), STAGE_AT(4)], [0, 4], EASE);
  const calloutO = iio(f, [300, 316], [0, 1]);
  const subO = iio(f, [14, 26], [0, 1]);
  return (
    <AbsoluteFill>
      <Heading text="AN ORE REFINERY FOR MODELS" color={C.plumText} size={90} />
      <div style={{ position: 'absolute', top: 222, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 30, color: C.body, opacity: subO, padding: '0 120px' }}>
        Raw candidates in. Heat applied. The worthless burns off. What remains is weighed and stamped.
      </div>
      <div style={{ position: 'absolute', left: x0, top: y - 3, width: dx * 4 * iio(f, [STAGE_AT(0), STAGE_AT(4)], [0, 1], EASE), height: 6, background: `linear-gradient(to right, ${C.plum}, ${C.pink}, ${C.yellow})` }} />
      <div style={{ position: 'absolute', left: x0, top: y - 3, width: dx * 4, height: 6, background: C.dim2, zIndex: -1 }} />
      {STAGES.map((s, i) => {
        const at = STAGE_AT(i);
        const lit = iio(f, [at - 4, at + 6], [0, 1]);
        const pop = iio(f, [at - 4, at + 10], [0.7, 1], OVERSHOOT);
        const cx = x0 + i * dx;
        return (
          <div key={s.id} style={{ position: 'absolute', left: cx, top: y, transform: `translate(-50%,-50%) scale(${pop})`, textAlign: 'center', opacity: 0.25 + 0.75 * lit }}>
            <div style={{
              width: 130, height: 130, borderRadius: 65, margin: '0 auto', border: `4px solid ${s.c}`,
              background: C.bg3, boxShadow: `0 0 ${40 * lit}px ${s.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: CRT, fontSize: 40, color: s.c,
            }}>{i + 1}</div>
            <div style={{ position: 'absolute', top: 150, left: '50%', transform: 'translateX(-50%)', width: 330 }}>
              <div style={{ fontFamily: CRT, fontSize: 64, color: C.fg }}>{s.id}</div>
              <div style={{ fontFamily: MONO, fontSize: 26, color: C.body }}>{s.does}</div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: s.c, marginTop: 8, fontStyle: 'italic' }}>{s.gear}</div>
            </div>
          </div>
        );
      })}
      {f >= STAGE_AT(0) - 4 && (
        <div style={{
          position: 'absolute', left: x0 + ore * dx - 18, top: y - 18 - 110, width: 36, height: 36, borderRadius: 18,
          background: `radial-gradient(circle, #fff, ${C.yellow} 45%, ${C.pink})`, boxShadow: `0 0 30px ${C.yellow}`,
          opacity: iio(f, [STAGE_AT(4) + 10, STAGE_AT(4) + 20], [1, 0]),
        }} />
      )}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: calloutO,
        fontFamily: MONO, fontSize: 36, color: C.fg,
      }}>
        The referee is the <span style={{ color: C.yellow, fontWeight: 700 }}>cupel</span>: the bone-ash dish that leaves only precious metal behind.
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 6 · RATING — sort on the conservative number
// =============================================================================
const MODELS = [
  { name: 'model-a', record: 'won 2 of 2', rating: 1662, rd: 253 },
  { name: 'model-b', record: 'won 200', rating: 1610, rd: 45 },
];
const Rating: React.FC = () => {
  const f = useCurrentFrame();
  const formulaO = iio(f, [100, 114], [0, 1]);
  const swap = iio(f, [150, 180], [0, 1], EASE);
  const consO = iio(f, [120, 134], [0, 1]);
  const rowH = 150, top = 380;
  return (
    <AbsoluteFill>
      <Heading text="WINNING TWICE IS NOT WINNING 200 TIMES" color={C.cyan} size={78} />
      <div style={{ position: 'absolute', left: 260, top: 290, width: 1400, display: 'flex', fontFamily: MONO, fontSize: 26, color: C.dimText }}>
        <div style={{ width: 120 }}>#</div><div style={{ width: 420 }}>model</div><div style={{ width: 300 }}>glicko-2</div>
        <div style={{ width: 240 }}>± RD</div><div style={{ opacity: consO, color: C.yellow }}>board sorts on</div>
      </div>
      {MODELS.map((m, i) => {
        // model-a starts on top (raw rating), model-b climbs over it once the conservative number is shown
        const pos = i === 0 ? swap : 1 - swap;
        const cons = m.rating - 2 * m.rd;
        const rank = Math.round(pos) + 1;
        return (
          <div key={m.name} style={{
            position: 'absolute', left: 260, top: top + pos * rowH, width: 1400, height: rowH - 20,
            display: 'flex', alignItems: 'center', background: C.bg3, border: `2px solid ${i === 1 ? C.cyan : C.dim}`,
            fontFamily: MONO, fontSize: 38, color: C.fg, opacity: iio(f, [10 + i * 10, 22 + i * 10], [0, 1]),
          }}>
            <div style={{ width: 120, paddingLeft: 30, fontFamily: CRT, fontSize: 70, color: rank === 1 ? C.yellow : C.dimText }}>{rank}</div>
            <div style={{ width: 420 }}>
              <div>{m.name}</div>
              <div style={{ fontSize: 26, color: C.dimText }}>{m.record}</div>
            </div>
            <div style={{ width: 300, fontFamily: CRT, fontSize: 66 }}>{m.rating}</div>
            <div style={{ width: 240, fontFamily: CRT, fontSize: 66, color: C.pinkText }}>{m.rd}</div>
            <div style={{ fontFamily: CRT, fontSize: 80, color: C.yellow, opacity: consO }}>{cons}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', top: 720, left: 0, right: 0, textAlign: 'center', fontFamily: CRT, fontSize: 64, color: C.fg, opacity: formulaO }}>
        conservative = rating - 2 x deviation
      </div>
      <Caption text="Illustrative numbers. The board ranks what a model has proven, not what it got lucky on." at={200} />
    </AbsoluteFill>
  );
};

// =============================================================================
// 7 · HONEST STATUS
// =============================================================================
const Status: React.FC = () => {
  const f = useCurrentFrame();
  const t = iio(f, [20, 80], [0, 1], EASE);
  const stat = (label: string, val: number, color: string, i: number) => (
    <div key={label} style={{ textAlign: 'center', opacity: iio(f, [10 + i * 8, 22 + i * 8], [0, 1]) }}>
      <div style={{ fontFamily: CRT, fontSize: 150, color, lineHeight: 1, textShadow: `0 0 24px ${color}66` }}>{Math.round(val * t)}</div>
      <div style={{ fontFamily: MONO, fontSize: 32, color: C.body }}>{label}</div>
    </div>
  );
  const notO = iio(f, [96, 110], [0, 1]);
  return (
    <AbsoluteFill>
      <Heading text="WHERE IT STANDS · v0.0.1" color={C.dos} size={84} />
      <div style={{ position: 'absolute', top: 280, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 180 }}>
        {stat('tests passing', 138, C.dos, 0)}
        {stat('atoms mapped', 309, C.plumText, 1)}
        {stat('built', 39, C.yellow, 2)}
      </div>
      <div style={{ position: 'absolute', top: 580, left: 360, width: 1200, height: 40, border: `2px solid ${C.dim}`, background: C.dim2 }}>
        <div style={{ width: `${(39 / 309) * 100 * t}%`, height: '100%', background: `linear-gradient(to right, ${C.plum}, ${C.yellow})` }} />
      </div>
      <div style={{ position: 'absolute', top: 680, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: C.pinkText, opacity: notO, lineHeight: 1.6 }}>
        Rules engine: not started. Match runner: not started.<br />
        <span style={{ color: C.body }}>Rating, scoring and the element registry: built and tested.</span>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 8 · END CARD
// =============================================================================
const End: React.FC = () => {
  const f = useCurrentFrame();
  const s = iio(f, [0, 16], [0.85, 1], OVERSHOOT);
  const o2 = iio(f, [18, 30], [0, 1]);
  const o3 = iio(f, [30, 42], [0, 1]);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontFamily: CRT, fontSize: 240, color: C.fg, transform: `scale(${s})`, textShadow: `0 0 40px ${C.plum}, 0 0 90px ${C.plum}88`, lineHeight: 1 }}>
        BEE<span style={{ color: C.plumText }}>PLUMB</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 40, color: C.body, marginTop: 20, opacity: o2 }}>
        the gathering where things are measured true
      </div>
      <div style={{ fontFamily: MONO, fontSize: 36, color: C.yellow, marginTop: 60, opacity: o3 }}>
        beeplumbgh.net  ·  youtube.com/@beeplumbgh
      </div>
      <div style={{ fontFamily: MONO, fontSize: 26, color: C.dimText, marginTop: 20, opacity: o3 }}>
        published by Johnny Autoseed LLC
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// SOUND — tech-pulse bed + library SFX (all from media/library)
// =============================================================================
const SFX: { at: number; id: string; vol: number }[] = [
  { at: 10, id: 'keys-typing-soft', vol: 0.5 },
  { at: 150 + 14, id: 'pop-reveal', vol: 0.35 },
  { at: 150 + 118, id: 'glitch-zap', vol: 0.8 },
  { at: 330 + 60, id: 'whoosh-soft', vol: 0.4 },
  { at: 330 + 70, id: 'chess-piece-thock', vol: 0.5 },
  { at: 540 + 16, id: 'keys-typing-soft', vol: 0.45 },
  { at: 540 + 96, id: 'stamp-hit', vol: 1 },
  { at: 540 + 190, id: 'ui-click-soft', vol: 0.4 },
  ...REFINERY_WHOOSH.map((a) => ({ at: 870 + a - 4, id: 'whoosh-soft', vol: 0.3 })),
  { at: 870 + 300, id: 'chime-reward', vol: 0.4 },
  { at: 1260 + 150, id: 'chess-piece-capture', vol: 0.6 },
  { at: 1560 + 20, id: 'riser-soft', vol: 0.4 },
  { at: 1740, id: 'impact-deep-soft', vol: 0.7 },
];

const TOTAL = 62 * 30;

export const BeeplumbExplainer: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Audio
      src={lib('music/clips/tech-pulse.mp3')}
      volume={(f) => iio(f, [0, 30, TOTAL - 60, TOTAL], [0, 0.45, 0.45, 0])}
    />
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={90} layout="none">
        <Audio src={lib(`sfx/clips/${s.id}.mp3`)} volume={s.vol} />
      </Sequence>
    ))}
    {([
      [S.hook, Hook], [S.leak, Leak], [S.situ, Situations], [S.ref, Referee],
      [S.refinery, Refinery], [S.rating, Rating], [S.status, Status], [S.end, End],
    ] as const).map(([[from, dur], Comp], i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <SceneFade dur={i === 7 ? dur + 8 : dur}><Comp /></SceneFade>
      </Sequence>
    ))}
    <Chrome />
  </AbsoluteFill>
);

export default BeeplumbExplainer;
