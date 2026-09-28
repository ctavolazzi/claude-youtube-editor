// Act 1: the waffling, what I know, the name (beats open / know / name).
import React from 'react';
import { useCurrentFrame, Img } from 'remotion';
import { C, F, E, iio, rnd, L, W, Scene, Kinetic, Stamp, Card, Cross, Strike, P } from './common';
import { Mascot } from './Mascot';

// ---------------------------------------------------------------- open-1: all weekend
const Weekend: React.FC = () => {
  const f = useCurrentFrame();
  const day = ['SAT', 'SUN'][Math.floor(f / 7) % 2];
  const spin = f * 4;
  return (
    <>
      <Kinetic at={W('open-1', 'weekend')} text="ALL WEEKEND." size={150} y={90} color={C.yellow} />
      <Card x={300} y={330} w={420} h={440} at={L('open-1') + 4} color={C.pink}>
        <div style={{ height: 110, background: C.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 56, color: C.white }}>CALENDAR</div>
        <div style={{ textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 170, color: C.fg, marginTop: 40 }}>{day}</div>
      </Card>
      <div style={{ position: 'absolute', left: 1060, top: 300, width: 520, height: 520 }}>
        <svg viewBox="0 0 520 520" width={520} height={520} style={{ transform: `rotate(${spin}deg)` }}>
          {[0, 120, 240].map((a) => (
            <g key={a} transform={`rotate(${a} 260 260)`}>
              <path d="M260 40 A 220 220 0 0 1 450 150" stroke={C.cyan} strokeWidth={26} fill="none" strokeLinecap="round" />
              <path d="M450 150 L 410 150 L 462 196 Z" fill={C.cyan} transform="rotate(12 450 150)" />
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 260, color: C.fg, transform: `rotate(${Math.sin(f / 6) * 8}deg)` }}>?</div>
      </div>
      <Kinetic at={W('open-1', 'around')} text="AROUND & AROUND" size={64} y={830} x={960} w={760} color={C.cyan} />
    </>
  );
};

// ---------------------------------------------------------------- open-2/3: the options, all crossed out
const OPT = { y: 190, w: 520, h: 540 };
const Options: React.FC = () => {
  const f = useCurrentFrame();
  const handles = ['@beeplumbgh', '@plumbee', '@bee.plum.official', '@not_a_plum', '@plumb_the_bee'];
  const hi = Math.floor(f / 6) % handles.length;
  const t1 = W('open-2', 'handle'), t2 = W('open-2', 'trend'), t3 = W('open-2', 'beat');
  const whyAt = W('open-3', "here's");
  const lift = iio(f, [whyAt - 4, whyAt + 8], [0, 1], E.inOut);
  const chart = iio(f, [t2, t2 + 40], [0, 1]);
  const pts = [0, 0.1, 0.2, 0.35, 0.6, 0.95, 0.9, 0.3, 0.1].map((v, i) => [30 + i * 55, 330 - v * 280]);
  const shown = Math.max(2, Math.floor(chart * pts.length));
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${lift * 200}px) scale(${1 - lift * 0.3})`, opacity: 1 - lift * 0.8 }}>
      <Card x={110} y={OPT.y} w={OPT.w} h={OPT.h} at={t1} color={C.yellow} rot={-3}>
        <div style={{ padding: 30, fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.yellow }}>THIS HANDLE?</div>
        {handles.map((h, i) => (
          <div key={h} style={{ margin: '6px 30px', padding: '10px 18px', borderRadius: 12, fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: i === hi ? C.black : C.body, background: i === hi ? C.yellow : 'transparent' }}>{h}</div>
        ))}
      </Card>
      <Card x={700} y={OPT.y} w={OPT.w} h={OPT.h} at={t2} color={C.cyan} rot={2}>
        <div style={{ padding: 30, fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.cyan }}>CHASE THE TREND?</div>
        <svg width={520} height={380} style={{ position: 'absolute', top: 130 }}>
          <polyline points={pts.slice(0, shown).map((p) => p.join(',')).join(' ')} fill="none" stroke={C.cyan} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </Card>
      <Card x={1290} y={OPT.y} w={OPT.w} h={OPT.h} at={t3} color={C.pink} rot={-2}>
        <div style={{ padding: 30, fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.pink }}>BEAT THAT GUY?</div>
        <svg width={520} height={400} style={{ position: 'absolute', top: 120 }}>
          <path d="M200 70 L 230 20 L 260 60 L 290 20 L 320 70 Z" fill={C.yellow} />
          <circle cx={260} cy={140} r={70} fill={C.dim} />
          <path d="M120 390 Q 130 230 260 222 Q 390 230 400 390 Z" fill={C.dim} />
          <text x={260} y={330} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={90} fill={C.fg}>VS</text>
        </svg>
      </Card>
      <Cross at={L('open-3') + 2} x={150} y={OPT.y + 40} w={440} h={460} />
      <Cross at={L('open-3') + 7} x={740} y={OPT.y + 40} w={440} h={460} />
      <Cross at={L('open-3') + 12} x={1330} y={OPT.y + 40} w={440} h={460} />
    </div>
  );
};
const OptionsWhy: React.FC = () => (
  <>
    <Kinetic at={W('open-3', 'none')} text="NONE OF THAT WORKS." size={120} y={70} color={C.fg} />
    <Kinetic at={W('open-3', "here's")} text="AND HERE'S WHY." size={140} y={420} color={C.yellow} />
  </>
);

// ---------------------------------------------------------------- open-4: youtube phrase alarm
const Alarm: React.FC = () => {
  const f = useCurrentFrame();
  const flash = Math.floor(f / 5) % 2 === 0;
  const beam = f * 9;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: flash ? 'rgba(255,40,40,0.20)' : 'rgba(255,40,40,0.05)' }} />
      <div style={{ position: 'absolute', left: 960 - 80, top: 110, width: 160, height: 110, borderRadius: '80px 80px 12px 12px', background: C.red, boxShadow: `0 0 ${flash ? 120 : 40}px ${C.red}` }} />
      <div style={{ position: 'absolute', left: 960 - 700, top: 165 - 700, width: 1400, height: 1400, background: `conic-gradient(from ${beam}deg, rgba(255,60,60,0.28) 0deg, transparent 30deg, transparent 180deg, rgba(255,60,60,0.28) 180deg, transparent 210deg)`, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', left: 260, right: 260, top: 330, padding: '26px 30px', background: C.yellow, border: `8px solid ${C.black}`, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 30, transform: `rotate(-2deg) scale(${iio(f, [L('open-4'), L('open-4') + 8], [0.5, 1], E.pop)})` }}>
        <svg width={120} height={110}><path d="M60 6 L116 104 L4 104 Z" fill={C.black} /><rect x={54} y={38} width={12} height={40} fill={C.yellow} /><rect x={54} y={84} width={12} height={12} fill={C.yellow} /></svg>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 86, color: C.black, lineHeight: 1 }}>YOUTUBE PHRASE DETECTED</div>
      </div>
      <Kinetic at={W('open-4', 'anyway')} text="I'M DOING IT ANYWAY." size={100} y={640} color={C.fg} rot={2} />
    </>
  );
};

// ---------------------------------------------------------------- open-5: I don't know yet
const Easel: React.FC<{ x: number; y: number; w: number; h: number; at: number; children?: React.ReactNode; glow?: string }> = ({ x, y, w, h, at, children, glow }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 12], [0.6, 1], E.pop);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h + 180, transform: `scale(${s})`, opacity: iio(f, [at, at + 5], [0, 1]) }}>
      <div style={{ position: 'absolute', left: w * 0.18, top: h - 40, width: 16, height: 230, background: '#8a5a2b', transform: 'rotate(12deg)', borderRadius: 6 }} />
      <div style={{ position: 'absolute', left: w * 0.78, top: h - 40, width: 16, height: 230, background: '#8a5a2b', transform: 'rotate(-12deg)', borderRadius: 6 }} />
      <div style={{ position: 'absolute', left: -20, top: h - 10, width: w + 40, height: 22, background: '#a06a33', borderRadius: 6 }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, background: '#fbfaf6', borderRadius: 6, border: '10px solid #d8c7a4', boxShadow: glow ? `0 0 90px ${glow}` : '0 20px 0 rgba(0,0,0,0.35)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
};

const DontKnow: React.FC = () => (
  <>
    <Kinetic at={L('open-5') + 2} text="NONE OF IT WORKS" size={70} x={120} y={170} w={900} align="left" color={C.dim} />
    <Kinetic at={W('open-5', "don't")} text="I DON'T KNOW WHAT I WANT TO DO YET." size={96} x={120} y={270} w={1000} align="left" color={C.fg} />
    <Kinetic at={W('open-5', 'haven\'t')} text="(I HAVEN'T DONE IT.)" size={64} x={120} y={600} w={1000} align="left" color={C.yellow} />
    <Easel x={1240} y={180} w={520} h={480} at={W('open-5', "haven't")} />
  </>
);

// ---------------------------------------------------------------- know-1/2: checklist
const Check: React.FC<{ at: number; text: string; y: number; color?: string }> = ({ at, text, y, color = C.green }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 8], [0, 1], E.pop);
  return (
    <div style={{ position: 'absolute', left: 300, top: y, display: 'flex', alignItems: 'center', gap: 34, opacity: iio(f, [at, at + 4], [0, 1]), transform: `translateX(${(1 - s) * -60}px)` }}>
      <div style={{ width: 90, height: 90, borderRadius: 18, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})` }}>
        <svg width={60} height={60}><path d="M8 32 L24 48 L54 12" stroke={C.black} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 84, color: C.fg }}>{text}</div>
    </div>
  );
};
const WhatIKnow: React.FC = () => (
  <>
    <Kinetic at={L('know-1')} text="HERE'S WHAT I DO KNOW:" size={90} y={80} color={C.yellow} />
    <Check at={W('know-2', 'explore')} text="EXPLORE" y={260} />
    <Check at={W('know-2', 'express')} text="EXPRESS MYSELF" y={400} color={C.cyan} />
    <Check at={W('know-2', 'show')} text="SHOW YOU WHAT I LEARN" y={540} color={C.pink} />
    <Kinetic at={W('know-2', 'example')} text="so you can learn from my example" size={46} y={720} color={C.body} weight={700} />
  </>
);

// ---------------------------------------------------------------- know-3: YOU.
const You: React.FC = () => {
  const f = useCurrentFrame();
  const fin = W('know-3', 'you', 2);
  const big = iio(f, [fin, fin + 10], [0, 1], E.pop);
  return (
    <>
      <Kinetic at={L('know-3')} text="YOU." size={220} y={60} color={C.fg} />
      <Kinetic at={W('know-3', 'not', 0)} text="NOT AN AUDIENCE" size={80} y={380} color={C.body} />
      <Strike at={W('know-3', 'audience') + 8} x={560} y={420} w={800} />
      <Kinetic at={W('know-3', 'not', 1)} text={'NOT "YOU GUYS"'} size={80} y={540} color={C.body} />
      <Strike at={W('know-3', 'guys') + 8} x={620} y={580} w={680} />
      {f >= fin && (
        <div style={{ position: 'absolute', inset: 0, background: C.yellow, opacity: 0.95 * big, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 420, color: C.black, transform: `scale(${0.6 + big * 0.4})` }}>YOU.</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- know-4: the feed
const TILE_COLORS = [C.pink, C.cyan, C.plum, C.yellow, C.green, '#ff8a3d'];
const Feed: React.FC = () => {
  const f = useCurrentFrame();
  const tAt = W('know-4', 'thumbnail');
  const secAt = W('know-4', 'seconds');
  const decideAt = W('know-4', 'deciding');
  const zoom = iio(f, [decideAt, decideAt + 50], [1, 0.32], E.inOut);
  const cols = 14, rows = 10, tw = 400, th = 250, gap = 28;
  const cx = 6, cy = 4; // "this video" tile in the middle of the wall
  const gridW = cols * (tw + gap), gridH = rows * (th + gap);
  const ox = 960 - (cx * (tw + gap) + tw / 2), oy = 470 - (cy * (th + gap) + th / 2);
  const count = Math.max(0, 3 - Math.floor((f - secAt) / 12));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: ox, top: oy, width: gridW, height: gridH, transform: `scale(${zoom})`, transformOrigin: `${cx * (tw + gap) + tw / 2}px ${cy * (th + gap) + th / 2}px` }}>
          {Array.from({ length: rows * cols }).map((_, i) => {
            const r = Math.floor(i / cols), c = i % cols;
            const me = r === cy && c === cx;
            const col = TILE_COLORS[Math.floor(rnd(i) * TILE_COLORS.length)];
            const hl = me && f >= tAt;
            return (
              <div key={i} style={{ position: 'absolute', left: c * (tw + gap), top: r * (th + gap), width: tw, height: th + 70 }}>
                <div style={{ width: tw, height: th, borderRadius: 18, background: me ? C.bg2 : `linear-gradient(135deg, ${col}, ${C.bg2})`, border: hl ? `8px solid ${C.yellow}` : '4px solid rgba(255,255,255,0.08)', boxShadow: hl ? `0 0 80px ${C.yellow}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {me ? <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.yellow }}>BEEPLUMB</div>
                    : <div style={{ width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.25)' }} />}
                </div>
                <div style={{ marginTop: 14, height: 18, width: tw * (0.5 + rnd(i, 2) * 0.45), borderRadius: 9, background: 'rgba(255,255,255,0.18)' }} />
                <div style={{ marginTop: 10, height: 14, width: tw * 0.4, borderRadius: 7, background: 'rgba(255,255,255,0.10)' }} />
              </div>
            );
          })}
        </div>
      </div>
      {f < W('know-4', 'everything') && <Kinetic at={W('know-4', 'algorithm')} text="THE ALGORITHM" size={70} x={60} y={60} w={900} align="left" color={C.cyan} stroke />}
      {f >= secAt && f < decideAt + 10 && (
        <div style={{ position: 'absolute', left: 1500, top: 80, width: 200, height: 200, borderRadius: 100, background: C.pink, border: `8px solid ${C.black}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 130, color: C.white }}>{count}</div>
      )}
      <Kinetic at={W('know-4', 'everything')} text="VS. EVERYTHING ELSE ON THE INTERNET" size={72} y={70} color={C.fg} stroke />
    </>
  );
};

// ---------------------------------------------------------------- know-5: lucky
const Lucky: React.FC = () => (
  <>
    <Kinetic at={L('know-5')} text="NOT IMPORTANT." size={120} y={200} color={C.dim} />
    <Strike at={W('know-5', 'important') + 6} x={500} y={260} w={920} />
    <Kinetic at={W('know-5', 'lucky')} text="LUCKY." size={240} y={400} color={C.yellow} rot={-3} />
    <Kinetic at={W('know-5', 'hi')} text="hi." size={80} y={740} color={C.body} weight={500} />
  </>
);

// ---------------------------------------------------------------- name-1: circling the drain -> BEEPLUMB
const Drain: React.FC = () => {
  const f = useCurrentFrame();
  const at = W('name-1', 'beeplumb');
  const k = iio(f, [at - 4, at + 6], [1, 0]);
  const spiral = Array.from({ length: 220 }).map((_, i) => {
    const a = i * 0.18, r = 8 + i * 2.1;
    return `${960 + Math.cos(a) * r},${470 + Math.sin(a) * r}`;
  }).join(' ');
  const words = ['DAYS', 'WEEKS', 'DAYS', 'WEEKS', '???'];
  return (
    <>
      <div style={{ opacity: k }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', transform: `rotate(${f * 5}deg)`, transformOrigin: '960px 470px' }}>
          <polyline points={spiral} fill="none" stroke={C.plum} strokeWidth={10} strokeLinecap="round" />
        </svg>
        {words.map((w, i) => {
          const a = f / 10 + (i / words.length) * Math.PI * 2;
          const r = iio(f, [L('name-1'), at], [420, 60]);
          return <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(a) * r - 150, top: 470 + Math.sin(a) * r - 40, width: 300, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, color: i % 2 ? C.cyan : C.yellow, transform: `scale(${iio(r, [60, 420], [0.3, 1])})` }}>{w}</div>;
        })}
      </div>
      <Wordmark at={at} y={330} size={210} />
    </>
  );
};

export const Wordmark: React.FC<{ at: number; y: number; size: number; x?: number }> = ({ at, y, size, x = 0 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 10], [2.2, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 1920, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: size, letterSpacing: -4, transform: `scale(${s})`, opacity: iio(f, [at, at + 4], [0, 1]), textShadow: `0 12px 0 ${C.black}, 0 0 80px ${C.plum}` }}>
      <span style={{ color: C.yellow }}>BEE</span><span style={{ color: C.plumHi }}>PLUMB</span>
    </div>
  );
};

// ---------------------------------------------------------------- name-2: the dictionary
const Dictionary: React.FC = () => {
  const f = useCurrentFrame();
  const swing = Math.sin(f / 14) * 14;
  return (
    <>
      <Card x={120} y={140} w={1120} h={640} at={L('name-2')} color={C.fg} style={{ background: '#f7f1e3' }}>
        <div style={{ padding: '50px 60px', fontFamily: F.mono, color: '#2b1f14' }}>
          {f >= W('name-2', 'bee') && (<div style={{ opacity: iio(f, [W('name-2', 'bee'), W('name-2', 'bee') + 6], [0, 1]) }}>
            <div style={{ fontSize: 88, fontWeight: 700 }}>bee <span style={{ fontSize: 40, fontStyle: 'italic', color: '#7a6040' }}>(noun)</span></div>
            <div style={{ fontSize: 40, marginTop: 10, lineHeight: 1.35 }}>a gathering where somebody comes out on top. <span style={{ color: '#7a6040' }}>spelling bee, quilting bee.</span></div>
          </div>)}
          {f >= W('name-2', 'plumb') && (<div style={{ marginTop: 50, opacity: iio(f, [W('name-2', 'plumb'), W('name-2', 'plumb') + 6], [0, 1]) }}>
            <div style={{ fontSize: 88, fontWeight: 700 }}>plumb <span style={{ fontSize: 40, fontStyle: 'italic', color: '#7a6040' }}>(verb)</span></div>
            <div style={{ fontSize: 40, marginTop: 10, lineHeight: 1.35 }}>to measure a thing against true.</div>
          </div>)}
        </div>
      </Card>
      <svg width={400} height={760} style={{ position: 'absolute', left: 1360, top: 60 }}>
        <rect x={60} y={0} width={280} height={24} rx={8} fill={C.dim} />
        <g transform={`rotate(${swing} 200 24)`}>
          <line x1={200} y1={24} x2={200} y2={560} stroke={C.fg} strokeWidth={5} />
          <path d="M160 560 L240 560 L200 680 Z" fill={C.yellow} stroke={C.black} strokeWidth={5} />
        </g>
      </svg>
    </>
  );
};

// ---------------------------------------------------------------- name-3: the mascot reveal
const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const plumAt = W('name-3', 'plum'), beeAt = W('name-3', 'bee'), hiAt = W('name-3', 'hi');
  return (
    <>
      {f >= hiAt && Array.from({ length: 60 }).map((_, i) => {
        const t = f - hiAt;
        const x = 960 + (rnd(i) - 0.5) * 1700 * iio(t, [0, 30], [0.1, 1], E.out);
        const y = 480 + (rnd(i, 3) - 0.8) * 900 * iio(t, [0, 30], [0.1, 1], E.out) + t * t * 0.08;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 22, height: 12, background: TILE_COLORS[i % TILE_COLORS.length], transform: `rotate(${t * 12 + i * 40}deg)` }} />;
      })}
      <Mascot x={960} y={470} size={560} at={plumAt} wave={f >= hiAt} look={[0, 0.3]} />
      <Kinetic at={plumAt} text="A PLUM." size={96} x={120} y={200} w={560} align="left" color={C.plumHi} rot={-4} />
      <Kinetic at={beeAt} text="+ A BEE." size={96} x={1260} y={200} w={560} align="right" color={C.yellow} rot={4} />
      <Kinetic at={hiAt} text="SAY HI." size={110} y={740} color={C.fg} />
    </>
  );
};

// ---------------------------------------------------------------- name-4: persona? instagram?
const OldAccount: React.FC = () => {
  const f = useCurrentFrame();
  const igAt = W('name-4', 'instagram');
  const nAt = W('name-4', 'seventy');
  const n = Math.round(iio(f, [nAt, nAt + 30], [0, 77000], E.out));
  return (
    <>
      <Card x={140} y={200} w={600} h={520} at={L('name-4')} color={C.cyan} rot={-3}>
        <svg width={600} height={380} viewBox="0 0 600 380">
          <path d="M120 120 Q 300 60 480 120 Q 470 260 300 300 Q 130 260 120 120 Z" fill={C.fg} />
          <ellipse cx={230} cy={170} rx={50} ry={30} fill={C.bg} />
          <ellipse cx={370} cy={170} rx={50} ry={30} fill={C.bg} />
        </svg>
        <div style={{ textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 62, color: C.cyan }}>A PERSONA?</div>
      </Card>
      <Card x={960} y={180} w={820} h={560} at={igAt} color={C.pink} rot={2}>
        <div style={{ padding: 40, display: 'flex', gap: 34, alignItems: 'center' }}>
          <div style={{ width: 170, height: 170, borderRadius: 85, background: `conic-gradient(${C.yellow}, ${C.pink}, ${C.plum}, ${C.yellow})`, padding: 8 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#555', filter: 'blur(6px)' }} />
          </div>
          <div>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.fg, filter: 'blur(9px)' }}>@old_name_here</div>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 30, color: C.dim, marginTop: 8 }}>old account · different name</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.fg, marginTop: 20 }}>{f >= nAt ? n.toLocaleString('en-US') : ''}</div>
        <div style={{ textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.pink }}>{f >= nAt ? 'followers' : ''}</div>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- name-5: fresh start
const Fresh: React.FC = () => {
  const f = useCurrentFrame();
  const at = L('name-5');
  const wipe = iio(f, [at, at + 12], [0, 1], E.inOut);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1920 * wipe, background: '#fbfaf6' }} />
      <Kinetic at={at + 8} text="FRESH START." size={200} y={330} color={C.bg} style={{ textShadow: 'none' }} />
    </>
  );
};

// ---------------------------------------------------------------- name-6: blank canvas vs painted canvas
const Painter: React.FC = () => {
  const f = useCurrentFrame();
  const blankAt = W('name-6', 'blank');
  const coveredAt = W('name-6', 'covered');
  const betterAt = W('name-6', 'better');
  const splats = Array.from({ length: 34 }).map((_, i) => ({
    x: rnd(i) * 480, y: rnd(i, 2) * 440, r: 30 + rnd(i, 3) * 90, c: TILE_COLORS[i % TILE_COLORS.length], at: coveredAt + i,
  }));
  return (
    <>
      <Easel x={220} y={150} w={560} h={500} at={blankAt} glow={f >= betterAt ? C.yellow : undefined}>
        {f >= betterAt && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 90, color: C.plum, opacity: iio(f, [betterAt, betterAt + 8], [0, 1]) }}>BETTER.</div>}
      </Easel>
      <Easel x={1140} y={150} w={560} h={500} at={coveredAt}>
        {splats.map((s, i) => f >= s.at && (
          <div key={i} style={{ position: 'absolute', left: s.x - s.r / 2, top: s.y - s.r / 2, width: s.r, height: s.r * (0.6 + rnd(i, 4) * 0.8), borderRadius: '50% 40% 60% 45%', background: s.c, transform: `scale(${iio(f, [s.at, s.at + 5], [0, 1], E.pop)}) rotate(${i * 37}deg)` }} />
        ))}
      </Easel>
      <Kinetic at={blankAt} text="BLANK CANVAS" size={60} x={220} y={70} w={560} color={C.fg} />
      <Kinetic at={coveredAt} text="ALREADY PAINTED" size={60} x={1020} y={70} w={800} color={C.fg} />
    </>
  );
};

// ---------------------------------------------------------------- name-7: nothing wrong with them
const NothingWrong: React.FC = () => {
  const f = useCurrentFrame();
  const otherAt = W('name-7', 'other');
  return (
    <>
      <Mascot x={420} y={470} size={500} at={L('name-7')} mood={f >= otherAt ? 'smug' : 'happy'} look={[0.6, -0.2]} />
      <Kinetic at={L('name-7') + 4} text="NOTHING WRONG WITH THEM." size={78} x={760} y={250} w={1080} align="left" color={C.fg} />
      <Kinetic at={otherAt} text="EXCEPT:" size={70} x={760} y={420} w={1080} align="left" color={C.pink} />
      <Kinetic at={W('name-7', 'following')} text="THEY FOLLOWED ME." size={110} x={760} y={510} w={1080} align="left" color={C.yellow} rot={-2} />
    </>
  );
};

export const ActOne: React.FC = () => (
  <>
    <Scene from={L('open-1')} to={L('open-2')}><Weekend /></Scene>
    <Scene from={L('open-2')} to={L('open-4')}><Options /><OptionsWhy /></Scene>
    <Scene from={L('open-4')} to={L('open-5')}><Alarm /></Scene>
    <Scene from={L('open-5')} to={L('know-1')}><DontKnow /></Scene>
    <Scene from={L('know-1')} to={L('know-3')}><WhatIKnow /></Scene>
    <Scene from={L('know-3')} to={L('know-4')}><You /></Scene>
    <Scene from={L('know-4')} to={L('know-5')} zoom={false}><Feed /></Scene>
    <Scene from={L('know-5')} to={L('name-1')}><Lucky /></Scene>
    <Scene from={L('name-1')} to={L('name-2')}><Drain /></Scene>
    <Scene from={L('name-2')} to={L('name-3')}><Dictionary /></Scene>
    <Scene from={L('name-3')} to={L('name-4')}><Reveal /></Scene>
    <Scene from={L('name-4')} to={L('name-5')}><OldAccount /></Scene>
    <Scene from={L('name-5')} to={L('name-6')} zoom={false}><Fresh /></Scene>
    <Scene from={L('name-6')} to={L('name-7')}><Painter /></Scene>
    <Scene from={L('name-7')} to={L('plan-1')}><NothingWrong /></Scene>
  </>
);

export { Easel, TILE_COLORS, Img };
