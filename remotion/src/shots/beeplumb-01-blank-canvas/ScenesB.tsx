// Act 2: the plan, the AI part (beats plan / ai).
import React from 'react';
import { useCurrentFrame, Img, OffthreadVideo, Sequence } from 'remotion';
import { C, F, E, iio, rnd, L, W, Scene, Kinetic, Stamp, Card, Cross, P } from './common';
import { Mascot } from './Mascot';
import { TILE_COLORS } from './ScenesA';

// ---------------------------------------------------------------- a small dark browser frame
export const Browser: React.FC<{ x: number; y: number; w: number; h: number; url: string; at: number; children: React.ReactNode }> = ({ x, y, w, h, url, at, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = iio(f, [at, at + 12], [0.85, 1], E.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#000', border: `3px solid ${C.line}`, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', transform: `scale(${s})`, opacity: iio(f, [at, at + 6], [0, 1]) }}>
      <div style={{ height: 56, background: '#1c1726', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <div style={{ marginLeft: 20, flex: 1, height: 34, borderRadius: 17, background: '#0e0b14', display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: F.mono, fontSize: 22, color: C.body }}>{url}</div>
      </div>
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------- plan-1: the game
const Game: React.FC = () => {
  const f = useCurrentFrame();
  const gameAt = W('plan-1', 'game');
  const t = f - gameAt;
  // the mascot hops across three platforms, on a loop
  const cycle = 90, p = ((t % cycle) + cycle) % cycle / cycle;
  const px = 180 + p * 900;
  const hop = Math.abs(Math.sin(p * Math.PI * 3)) * 180;
  const coins = [330, 530, 730, 930];
  return (
    <>
      <Kinetic at={L('plan-1')} text="SO HERE'S THE PLAN:" size={56} x={120} y={90} w={900} align="left" color={C.yellow} />
      <Kinetic at={gameAt} text="I'M BUILDING A GAME." size={96} x={120} y={160} w={1680} align="left" color={C.fg} />
      <Card x={380} y={290} w={1160} h={540} at={gameAt} color={C.dos} style={{ background: '#101a2e' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, background: C.dos, fontFamily: F.crt, fontSize: 38, color: C.black, padding: '4px 20px' }}>BEEPLUMB: THE GAME (working title)</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: 'repeating-linear-gradient(90deg, #3fbf5a 0 40px, #35a84e 40px 80px)' }} />
        {[[160, 330, 260], [520, 270, 220], [840, 330, 240]].map(([x, y, w], i) => (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: 30, background: '#c88a4a', borderTop: '8px solid #3fbf5a' }} />
        ))}
        {coins.map((cx, i) => (px < cx + 20 ? <div key={i} style={{ position: 'absolute', left: cx, top: 190 + Math.sin(f / 5 + i) * 8, width: 34, height: 34, borderRadius: 17, background: C.yellow, border: '5px solid #b8860b' }} /> : null))}
        <div style={{ position: 'absolute', left: 20, top: 60, fontFamily: F.crt, fontSize: 40, color: C.white }}>SCORE {String(Math.max(0, coins.filter((c) => px >= c + 20).length) * 100).padStart(5, '0')}</div>
        {f >= gameAt && <Mascot x={px} y={380 - hop} size={120} talk={false} at={gameAt} />}
      </Card>
      <Stamp at={W('plan-1', 'silly', 0)} text="SILLY. LITTLE." color={C.pink} x={1560} y={300} size={62} rot={10} />
    </>
  );
};

// ---------------------------------------------------------------- plan-2: the devlog
const Row: React.FC<{ at: number; y: number; icon: React.ReactNode; text: string; color: string }> = ({ at, y, icon, text, color }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <div style={{ position: 'absolute', left: 180, top: y, display: 'flex', alignItems: 'center', gap: 30, opacity: iio(f, [at, at + 5], [0, 1]), transform: `translateX(${iio(f, [at, at + 10], [-80, 0], E.out)}px)` }}>
      <div style={{ width: 100, height: 100, borderRadius: 22, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 74, color: C.fg }}>{text}</div>
    </div>
  );
};
const Flame: React.FC<{ x: number; y: number; s?: number; seed?: number }> = ({ x, y, s = 1, seed = 0 }) => {
  const f = useCurrentFrame();
  const k = 1 + Math.sin(f / 2.3 + seed) * 0.08;
  return (
    <svg width={120 * s} height={160 * s} viewBox="0 0 120 160" style={{ position: 'absolute', left: x, top: y, transform: `scaleY(${k})`, transformOrigin: 'bottom' }}>
      <path d="M60 4 C 90 50, 116 80, 106 118 C 98 146, 76 158, 60 158 C 44 158, 22 146, 14 118 C 4 80, 40 60, 60 4 Z" fill="#ff5a1f" />
      <path d="M60 50 C 78 80, 92 100, 84 124 C 78 142, 68 150, 60 150 C 52 150, 42 142, 36 124 C 28 100, 48 84, 60 50 Z" fill={C.yellow} />
    </svg>
  );
};
const check = <svg width={64} height={64}><path d="M10 34 L26 50 L56 14" stroke={C.black} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Devlog: React.FC = () => (
  <>
    <Kinetic at={L('plan-2')} text="DEVLOG" size={120} x={180} y={70} w={800} align="left" color={C.cyan} />
    <Row at={W('plan-2', 'learned')} y={290} icon={<div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.black }}>?</div>} text="WHAT I LEARNED" color={C.cyan} />
    <Row at={W('plan-2', 'well')} y={440} icon={check} text="WHAT WENT WELL" color={C.green} />
    <Row at={W('plan-2', 'absolutely')} y={590} icon={<div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 70, color: C.black }}>!</div>} text="WHAT ABSOLUTELY DID NOT" color={C.red} />
    <DevlogFire />
  </>
);
const DevlogFire: React.FC = () => {
  const f = useCurrentFrame();
  const at = W('plan-2', 'not');
  if (f < at) return null;
  return <>{[0, 1, 2].map((i) => <Flame key={i} x={1480 + i * 110} y={560 - (i % 2) * 30} s={0.9 + (i % 2) * 0.3} seed={i * 2} />)}</>;
};

// ---------------------------------------------------------------- plan-3: same planet
const Globe: React.FC = () => {
  const f = useCurrentFrame();
  const drift = (f * 1.6) % 700;
  const blobs = [[80, 120, 160, 110], [300, 260, 200, 140], [520, 90, 140, 180], [640, 300, 120, 90]];
  return (
    <>
      <div style={{ position: 'absolute', left: 660, top: 170, width: 600, height: 600, borderRadius: 300, overflow: 'hidden', background: `radial-gradient(circle at 35% 30%, #5fd4e6, #1a6d9a 60%, #0c2c4a)`, boxShadow: `0 0 120px ${C.cyan}55`, transform: `scale(${iio(f, [L('plan-3'), L('plan-3') + 12], [0.6, 1], E.pop)})` }}>
        {[0, 700].map((o) => blobs.map(([x, y, w, h], i) => (
          <div key={`${o}-${i}`} style={{ position: 'absolute', left: x + o - drift - 100, top: y, width: w, height: h, borderRadius: '45% 55% 50% 40%', background: '#3fbf5a' }} />
        )))}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 300, background: 'radial-gradient(circle at 70% 75%, transparent 50%, rgba(0,0,0,0.45))' }} />
      </div>
      <Kinetic at={W('plan-3', 'events')} text="CURRENT EVENTS" size={70} y={60} color={C.fg} />
      <Kinetic at={W('plan-3', 'air')} text="SAME AIR" size={84} x={100} y={420} w={520} color={C.cyan} />
      <Kinetic at={W('plan-3', 'water')} text="SAME WATER" size={84} x={1300} y={420} w={560} color={C.cyan} />
      <Kinetic at={W('plan-3', 'affects')} text="AFFECTS ALL OF US" size={80} y={800} color={C.yellow} />
    </>
  );
};

// ---------------------------------------------------------------- plan-4: the store + whatever
const Store: React.FC = () => {
  const f = useCurrentFrame();
  const at = L('plan-4');
  const vidAt = W('plan-4', 'videos');
  const scroll = iio(f, [at + 6, vidAt], [0, 2500], E.inOut);
  const topics = ['GAMES', 'AI TOOLS', 'THE NEWS', 'PLUMS', 'BEES', '???', 'DEVLOGS', 'WHATEVER'];
  return (
    <>
      <Browser x={220} y={150} w={1480} h={700} url="beeplumbgh.net" at={at}>
        <Img src={P('shots/site-full.png')} style={{ width: 1480, transform: `translateY(${-scroll * (1480 / 1440)}px)` }} />
      </Browser>
      <Stamp at={W('plan-4', 'store')} text="SILLY LITTLE STORE" color={C.yellow} x={1500} y={110} size={54} rot={6} />
      {topics.map((t, i) => {
        const tAt = vidAt + i * 3;
        if (f < tAt) return null;
        const a = (i / topics.length) * Math.PI * 2;
        const r = iio(f, [tAt, tAt + 12], [0, 1], E.pop);
        return <div key={t} style={{ position: 'absolute', left: 960 + Math.cos(a) * 560 * r - 150, top: 470 + Math.sin(a) * 330 * r - 45, width: 300, padding: '14px 0', textAlign: 'center', borderRadius: 16, background: TILE_COLORS[i % TILE_COLORS.length], border: `5px solid ${C.black}`, fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.black, transform: `rotate(${(rnd(i) - 0.5) * 16}deg)` }}>{t}</div>;
      })}
    </>
  );
};

// ---------------------------------------------------------------- ai-1: AI.
const Glitch: React.FC<{ text: string; at: number; size: number; y: number }> = ({ text, at, size, y }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const j = (k: number) => (Math.floor((f + k) / 2) % 5 === 0 ? (rnd(f + k) - 0.5) * 30 : 0);
  const base: React.CSSProperties = { position: 'absolute', left: 0, top: y, width: 1920, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 1 };
  const s = iio(f, [at, at + 8], [1.6, 1], E.out);
  return (
    <div style={{ transform: `scale(${s})`, transformOrigin: `960px ${y + size / 2}px` }}>
      <div style={{ ...base, color: C.cyan, transform: `translate(${j(1) - 10}px, ${j(2)}px)`, mixBlendMode: 'screen' }}>{text}</div>
      <div style={{ ...base, color: C.pink, transform: `translate(${j(3) + 10}px, ${j(4)}px)`, mixBlendMode: 'screen' }}>{text}</div>
      <div style={{ ...base, color: C.fg }}>{text}</div>
    </div>
  );
};
const AiBig: React.FC = () => (
  <>
    <Kinetic at={L('ai-1')} text="AND YES." size={80} y={110} color={C.body} />
    <Glitch at={W('ai-1', 'ai')} text="AI." size={420} y={220} />
    <Kinetic at={W('ai-1', 'lot')} text="A LOT OF IT." size={90} y={720} color={C.yellow} />
  </>
);

// ---------------------------------------------------------------- ai-2: the comments
const COMMENTS = [
  { t: 'ew. AI.', x: 120, y: 160, c: C.pink },
  { t: 'unsubscribed.', x: 1240, y: 130, c: C.red },
  { t: 'slop!!!', x: 220, y: 520, c: C.red },
  { t: 'real artists would never', x: 1080, y: 480, c: C.pink },
  { t: 'ratio', x: 700, y: 300, c: C.cyan },
];
const Comments: React.FC = () => {
  const f = useCurrentFrame();
  const at = L('ai-2');
  const settle = W('ai-2', 'here');
  const fade = iio(f, [settle, settle + 10], [1, 0.18]);
  return (
    <>
      {COMMENTS.map((cm, i) => {
        const a = at + i * 9;
        if (f < a) return null;
        const s = iio(f, [a, a + 8], [0.4, 1], E.pop);
        return (
          <div key={i} style={{ position: 'absolute', left: cm.x, top: cm.y, opacity: fade, transform: `scale(${s}) rotate(${(rnd(i) - 0.5) * 10}deg)` }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: '20px 30px', borderRadius: 26, background: C.panel, border: `4px solid ${cm.c}` }}>
              <div style={{ width: 60, height: 60, borderRadius: 30, background: cm.c }} />
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 48, color: C.fg }}>{cm.t}</div>
            </div>
          </div>
        );
      })}
      <Kinetic at={settle} text="IT'S HERE." size={140} y={250} color={C.fg} />
      <Kinetic at={W('ai-2', 'anywhere')} text="IT'S NOT GOING ANYWHERE." size={90} y={460} color={C.yellow} />
    </>
  );
};

// ---------------------------------------------------------------- ai-3: broke
const Broke: React.FC = () => {
  const f = useCurrentFrame();
  const richAt = W('ai-3', 'rich');
  const brokeAt = W('ai-3', 'broke');
  const payAt = W('ai-3', 'paycheck', 0);
  const cardAt = W('ai-3', 'credit');
  const bal = f < brokeAt ? 12.47 : iio(f, [brokeAt, brokeAt + 20], [12.47, 3.14]);
  return (
    <>
      <Card x={140} y={150} w={620} h={440} at={L('ai-3')} color={C.green}>
        <div style={{ padding: 36, fontFamily: F.display, fontWeight: 700, fontSize: 36, color: C.dim }}>checking balance</div>
        <div style={{ padding: '0 36px', fontFamily: F.display, fontWeight: 900, fontSize: 150, color: f >= brokeAt ? C.red : C.fg }}>${bal.toFixed(2)}</div>
        {f >= richAt && <div style={{ padding: '10px 36px', fontFamily: F.display, fontWeight: 900, fontSize: 56, color: C.pink }}>NOT RICH.</div>}
      </Card>
      {f >= brokeAt && (
        <div style={{ position: 'absolute', left: 880, top: 170, display: 'flex', gap: 24, alignItems: 'center', transform: `scale(${iio(f, [brokeAt, brokeAt + 8], [0.4, 1], E.pop)}) rotate(-3deg)` }}>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 130, color: C.fg }}>BROKE</div>
          <div style={{ width: 380, height: 120, borderRadius: 16, background: C.pink, border: `6px solid ${C.black}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.black }}>BLEEP</div>
        </div>
      )}
      <Kinetic at={payAt} text="PAYCHECK TO PAYCHECK" size={70} x={880} y={380} w={960} align="left" color={C.cyan} />
      {f >= cardAt && (
        <div style={{ position: 'absolute', left: 1040, top: 500, transform: `scale(${iio(f, [cardAt, cardAt + 10], [0.5, 1], E.pop)}) rotate(4deg)` }}>
          <div style={{ width: 460, height: 280, borderRadius: 28, background: `linear-gradient(135deg, ${C.plum}, ${C.pink})`, border: `5px solid ${C.black}`, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 36, top: 70, width: 80, height: 60, borderRadius: 10, background: C.yellow }} />
            <div style={{ position: 'absolute', left: 36, bottom: 40, fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: C.white }}>0000 0000 0000</div>
          </div>
          <Cross at={cardAt + 6} x={0} y={0} w={460} h={280} />
        </div>
      )}
      <Mascot x={420} y={790} size={300} at={brokeAt} mood="sad" talk={false} look={[0.4, -0.6]} />
    </>
  );
};

// ---------------------------------------------------------------- ai-4: a thousand dollars / bonfire
const Bonfire: React.FC = () => {
  const f = useCurrentFrame();
  const thouAt = W('ai-4', 'thousand');
  const halfAt = W('ai-4', 'half');
  const neverAt = W('ai-4', 'never');
  const fireAt = W('ai-4', 'bonfire');
  const burn = f >= fireAt;
  return (
    <>
      <Kinetic at={thouAt} text="$1,000" size={200} x={100} y={120} w={760} color={C.green} />
      <Kinetic at={thouAt + 6} text="for an artist" size={50} x={100} y={340} w={760} color={C.body} weight={700} />
      <Kinetic at={halfAt} text="= ½ OF ONE VIDEO" size={96} x={900} y={170} w={940} align="left" color={C.fg} />
      <Kinetic at={neverAt} text="(that might never get seen)" size={52} x={900} y={300} w={940} align="left" color={C.dim} weight={700} />
      {burn && Array.from({ length: 7 }).map((_, i) => <Flame key={i} x={640 + i * 90 - (i % 2) * 20} y={560 - (i % 3) * 40} s={1.1 + (i % 3) * 0.35} seed={i} />)}
      {burn && Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 700 + i * 110, top: 680 - ((f - fireAt) * (1.5 + rnd(i))) % 300, width: 110, height: 56, borderRadius: 6, background: '#6dbb72', border: '4px solid #2c6b30', opacity: 0.85, transform: `rotate(${(rnd(i, 2) - 0.5) * 50 + f * 2}deg)` }} />
      ))}
      <Kinetic at={W('ai-4', 'business')} text="NOT A BUSINESS DEAL." size={70} x={100} y={470} w={760} align="left" color={C.pink} />
      <Kinetic at={fireAt} text="A BONFIRE." size={130} x={880} y={420} w={1000} align="left" color={C.yellow} stroke />
    </>
  );
};

// ---------------------------------------------------------------- ai-5: $100/mo, before/after
const Hundred: React.FC = () => {
  const f = useCurrentFrame();
  const vidAt = W('ai-5', 'videos', 0);
  return (
    <>
      <Card x={640} y={110} w={640} h={220} at={L('ai-5')} color={C.yellow}>
        <div style={{ textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.fg, marginTop: 14 }}>$100<span style={{ fontSize: 50, color: C.dim }}>/mo</span></div>
        <div style={{ textAlign: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 36, color: C.yellow }}>Claude subscription</div>
      </Card>
      {f >= vidAt && (
        <>
          <Card x={150} y={400} w={740} h={420} at={vidAt} color={C.dim} rot={-2} style={{ background: '#ffffff' }}>
            <div style={{ padding: 40, fontFamily: 'Arial, sans-serif', fontSize: 60, color: '#222' }}>My Video</div>
            <div style={{ padding: '0 40px', fontFamily: 'Arial, sans-serif', fontSize: 32, color: '#666' }}>• point one<br />• point two</div>
            <div style={{ position: 'absolute', right: 20, bottom: 14, fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.red }}>BEFORE</div>
          </Card>
          <Card x={1030} y={400} w={740} h={420} at={vidAt + 8} color={C.yellow} rot={2}>
            <Sequence from={vidAt + 8} layout="none">
              <OffthreadVideo src={P('broll/explainer.mp4')} startFrom={540} muted style={{ width: 740, height: 416 }} />
            </Sequence>
            <div style={{ position: 'absolute', right: 20, bottom: 14, fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.yellow, textShadow: '0 4px 0 #000' }}>AFTER</div>
          </Card>
        </>
      )}
      <Kinetic at={W('ai-5', 'do')} text="THAT, I CAN DO." size={80} y={860 - 20} color={C.yellow} stroke />
    </>
  );
};

// ---------------------------------------------------------------- ai-6: who these tools are for
const Tile: React.FC<{ at: number; x: number; title: string; color: string; children: React.ReactNode }> = ({ at, x, title, color, children }) => (
  <Card x={x} y={190} w={500} h={480} at={at} color={color}>
    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    <div style={{ textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 50, color, padding: '0 20px', lineHeight: 1.05 }}>{title}</div>
  </Card>
);
const WhoFor: React.FC = () => {
  const f = useCurrentFrame();
  const clock = f * 12;
  return (
    <>
      <Tile at={W('ai-6', 'work')} x={140} title="WORKS ALL THE TIME" color={C.cyan}>
        <svg width={220} height={220}><circle cx={110} cy={110} r={96} fill="none" stroke={C.cyan} strokeWidth={14} /><line x1={110} y1={110} x2={110} y2={40} stroke={C.fg} strokeWidth={12} strokeLinecap="round" transform={`rotate(${clock} 110 110)`} /><line x1={110} y1={110} x2={160} y2={110} stroke={C.fg} strokeWidth={12} strokeLinecap="round" transform={`rotate(${clock / 12} 110 110)`} /></svg>
      </Tile>
      <Tile at={W('ai-6', 'spinal')} x={710} title="SPINAL CONDITION" color={C.pink}>
        <svg width={140} height={280}>{Array.from({ length: 8 }).map((_, i) => <rect key={i} x={30 + Math.sin(i / 1.4) * 14} y={i * 34} width={80} height={26} rx={10} fill={C.fg} opacity={0.9} />)}</svg>
      </Tile>
      <Tile at={W('ai-6', 'exactly')} x={1280} title="EXACTLY WHO THESE TOOLS ARE FOR" color={C.yellow}>
        <svg width={240} height={200}><path d="M20 100 L180 100 M130 40 L200 100 L130 160" stroke={C.yellow} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Tile>
    </>
  );
};

// ---------------------------------------------------------------- ai-7: you're allowed
const Allowed: React.FC = () => (
  <>
    <Mascot x={1440} y={480} size={520} at={L('ai-7')} look={[-0.5, 0]} />
    <Kinetic at={W('ai-7', "don't")} text="DON'T LIKE IT?" size={90} x={120} y={170} w={1100} align="left" color={C.body} />
    <Kinetic at={W('ai-7', 'fine')} text="THAT'S FINE." size={110} x={120} y={300} w={1100} align="left" color={C.fg} />
    <Kinetic at={W('ai-7', 'allowed')} text="YOU'RE ALLOWED." size={130} x={120} y={450} w={1200} align="left" color={C.yellow} />
    <Kinetic at={W('ai-7', 'genuinely')} text="genuinely." size={60} x={120} y={620} w={1100} align="left" color={C.cyan} weight={700} />
  </>
);

// ---------------------------------------------------------------- ai-8: case in point (the meta reveal)
const CODE = `export const Mascot = ({ x, y, size, talk }) => {
  const f = useCurrentFrame();
  const flap = 0.55 + 0.45 * Math.abs(Math.sin(f * 0.9));
  const blink = f % 105 < 4 ? 0.12 : 1;
  const m = talk ? MOUTH[f] : 0;   // lip-sync
  return (
    <svg viewBox="0 0 400 400">
      <ellipse rx={62} ry={92 * flap} />  {/* wings */}
      <path d="M200 92 C 292 86 ..." />    {/* plum */}
      <path fill={C.yellow} />              {/* bee */}
    </svg>
  );
};`;
const CaseInPoint: React.FC = () => {
  const f = useCurrentFrame();
  const vAt = W('ai-8', 'voice'), gAt = W('ai-8', 'graphics'), pAt = W('ai-8', 'plum'), lookAt = W('ai-8', 'look');
  const bars = Array.from({ length: 40 }).map((_, i) => 12 + Math.abs(Math.sin(f / 3 + i * 0.7)) * 90 * (0.4 + rnd(i) * 0.6));
  const codeScroll = iio(f, [gAt, gAt + 120], [0, -140]);
  const spinning = f >= lookAt;
  return (
    <>
      <Kinetic at={L('ai-8')} text="CASE IN POINT:" size={70} y={50} color={C.body} />
      <div style={{ position: 'absolute', inset: 0, opacity: iio(f, [lookAt, lookAt + 8], [1, 0.2]) }}>
      <Card x={80} y={170} w={560} h={560} at={vAt} color={C.cyan}>
        <div style={{ padding: 30, fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.cyan }}>THIS VOICE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 220, padding: '0 30px' }}>{bars.map((b, i) => <div key={i} style={{ width: 7, height: b, borderRadius: 4, background: C.cyan }} />)}</div>
        <div style={{ padding: '0 30px', fontFamily: F.display, fontWeight: 900, fontSize: 90, color: C.fg }}>= AI</div>
        <div style={{ padding: '6px 30px', fontFamily: F.mono, fontSize: 26, color: C.body }}>Kokoro, free, runs on my computer</div>
      </Card>
      <Card x={680} y={170} w={560} h={560} at={gAt} color={C.yellow}>
        <div style={{ padding: 30, fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.yellow }}>THESE GRAPHICS</div>
        <div style={{ height: 290, overflow: 'hidden', margin: '0 20px', background: '#0e0b14', borderRadius: 12 }}>
          <pre style={{ margin: 0, padding: 16, fontFamily: F.mono, fontSize: 17, lineHeight: 1.4, color: C.body, transform: `translateY(${codeScroll}px)` }}>{CODE}{'\n\n'}{CODE}</pre>
        </div>
        <div style={{ padding: '14px 30px', fontFamily: F.display, fontWeight: 900, fontSize: 90, color: C.fg }}>= CODE</div>
      </Card>
      <Card x={1280} y={170} w={560} h={560} at={pAt} color={C.plumHi}>
        <div style={{ padding: 30, fontFamily: F.display, fontWeight: 900, fontSize: 50, color: C.plumHi }}>THE PLUM</div>
        <div style={{ position: 'absolute', left: 150, top: 110, width: 260, height: 260, border: `3px dashed ${C.cyan}` }} />
        <div style={{ position: 'absolute', left: 150, top: 88, fontFamily: F.mono, fontSize: 18, color: C.cyan }}>&lt;svg viewBox="0 0 400 400"&gt;</div>
        {!spinning && <Mascot x={280} y={240} size={250} at={pAt} talk={false} />}
        <div style={{ position: 'absolute', left: 30, top: 420, fontFamily: F.display, fontWeight: 900, fontSize: 70, color: C.fg }}>= ALSO CODE</div>
      </Card>
      </div>
      {spinning && <Mascot x={960} y={470} size={520} at={lookAt} spin={lookAt + 4} mood="happy" />}
      <Kinetic at={lookAt + 2} text="LOOK AT IT GO." size={110} y={760} color={C.yellow} stroke />
    </>
  );
};

export const ActTwo: React.FC = () => (
  <>
    <Scene from={L('plan-1')} to={L('plan-2')}><Game /></Scene>
    <Scene from={L('plan-2')} to={L('plan-3')}><Devlog /></Scene>
    <Scene from={L('plan-3')} to={L('plan-4')}><Globe /></Scene>
    <Scene from={L('plan-4')} to={L('ai-1')}><Store /></Scene>
    <Scene from={L('ai-1')} to={L('ai-2')}><AiBig /></Scene>
    <Scene from={L('ai-2')} to={L('ai-3')}><Comments /></Scene>
    <Scene from={L('ai-3')} to={L('ai-4')}><Broke /></Scene>
    <Scene from={L('ai-4')} to={L('ai-5')}><Bonfire /></Scene>
    <Scene from={L('ai-5')} to={L('ai-6')}><Hundred /></Scene>
    <Scene from={L('ai-6')} to={L('ai-7')}><WhoFor /></Scene>
    <Scene from={L('ai-7')} to={L('ai-8')}><Allowed /></Scene>
    <Scene from={L('ai-8')} to={L('why-1')}><CaseInPoint /></Scene>
  </>
);

export { Flame };
