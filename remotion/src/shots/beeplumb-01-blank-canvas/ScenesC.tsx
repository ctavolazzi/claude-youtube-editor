// Act 3: the why, the silly part, the outro (beats why / silly / out).
import React from 'react';
import { useCurrentFrame, OffthreadVideo, Sequence } from 'remotion';
import { C, F, E, iio, rnd, L, W, Scene, Kinetic, Stamp, Card, Strike, P, DURATION_FRAMES } from './common';
import { Mascot } from './Mascot';
import { Easel, TILE_COLORS, Wordmark } from './ScenesA';

// Drop the "it's just storytelling" clip at media/projects/<project>/broll/storytelling.mp4 and set
// this to its filename; until then the scene shows a labeled placeholder where it goes.
const STORY_CLIP: string | null = null;

// ---------------------------------------------------------------- why-1: buy land
const Land: React.FC = () => {
  const f = useCurrentFrame();
  const landAt = W('why-1', 'land');
  const moneyAt = W('why-1', 'money');
  const bar = iio(f, [moneyAt, moneyAt + 40], [0, 0.03], E.out);
  return (
    <>
      <Kinetic at={L('why-1')} text="THE ACTUAL GOAL:" size={70} y={60} color={C.body} />
      <Kinetic at={landAt} text="BUY LAND." size={150} y={140} color={C.yellow} />
      <svg width={1920} height={560} style={{ position: 'absolute', top: 330, opacity: iio(f, [L('why-1'), L('why-1') + 10], [0, 1]) }}>
        <circle cx={1560} cy={120} r={80} fill={C.yellow} opacity={0.9} />
        <path d="M0 360 Q 400 230 800 330 Q 1200 420 1920 300 L 1920 560 L 0 560 Z" fill="#2f8f45" />
        <path d="M0 440 Q 500 360 1000 430 Q 1500 500 1920 420 L 1920 560 L 0 560 Z" fill="#3fbf5a" />
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={620 + i * 70} y={330 + Math.sin(i) * 6} width={14} height={90} fill="#c88a4a" />)}
        <rect x={610} y={350} width={600} height={12} fill="#c88a4a" /><rect x={610} y={385} width={600} height={12} fill="#c88a4a" />
        {f >= landAt && (<g transform={`translate(1300 250) rotate(${Math.sin(f / 10) * 3})`}>
          <rect x={0} y={60} width={14} height={120} fill="#8a5a2b" />
          <rect x={-90} y={0} width={200} height={80} rx={8} fill={C.fg} stroke={C.black} strokeWidth={5} />
          <text x={10} y={52} textAnchor="middle" fontFamily={F.display} fontWeight={900} fontSize={40} fill={C.red}>FOR SALE</text>
        </g>)}
      </svg>
      {f >= moneyAt && (
        <div style={{ position: 'absolute', left: 360, top: 820, width: 1200 }}>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 34, color: C.fg, marginBottom: 8, textShadow: '0 3px 0 #000' }}>land fund</div>
          <div style={{ height: 36, borderRadius: 18, background: C.bg2, border: `4px solid ${C.black}` }}>
            <div style={{ width: `${Math.max(3, bar * 100)}%`, height: '100%', borderRadius: 18, background: C.yellow }} />
          </div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- why-2: bigger ideas -> main channel -> close storylines
const Storylines: React.FC = () => {
  const f = useCurrentFrame();
  const ideasAt = W('why-2', 'ideas');
  const mainAt = W('why-2', 'main');
  const closeAt = W('why-2', 'close');
  const threads = ['STORYLINE A', 'STORYLINE B', 'STORYLINE C'];
  return (
    <>
      <Card x={120} y={200} w={480} h={420} at={ideasAt} color={C.green}>
        <svg width={480} height={260}>
          <path d="M140 220 L240 60 L340 220 Z" fill={C.yellow} stroke={C.black} strokeWidth={6} />
          <rect x={220} y={160} width={40} height={60} fill={C.black} />
          <circle cx={380} cy={80} r={30} fill={C.cyan} opacity={0.7 + Math.sin(f / 5) * 0.3} />
        </svg>
        <div style={{ textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.green }}>BIGGER IDEAS</div>
      </Card>
      {f >= mainAt && (
        <svg width={300} height={100} style={{ position: 'absolute', left: 620, top: 360 }}>
          <path d="M10 50 L260 50 M200 10 L270 50 L200 90" stroke={C.fg} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={400} strokeDashoffset={400 * iio(f, [mainAt, mainAt + 10], [1, 0])} />
        </svg>
      )}
      <Card x={940} y={160} w={860} h={560} at={mainAt} color={C.pink}>
        <div style={{ padding: 30, fontFamily: F.display, fontWeight: 900, fontSize: 56, color: C.pink }}>MY MAIN CHANNEL</div>
        {threads.map((t, i) => {
          const done = f >= closeAt + i * 8;
          return (
            <div key={t} style={{ margin: '14px 30px', padding: '18px 24px', borderRadius: 14, background: C.bg2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 40, color: C.fg }}>
              <span>{t}</span>
              <span style={{ padding: '6px 16px', borderRadius: 10, fontSize: 30, fontWeight: 900, background: done ? C.green : C.yellow, color: C.black }}>{done ? 'CLOSED' : 'OPEN FOR YEARS'}</span>
            </div>
          );
        })}
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- why-3: a loan? blah blah blah
const Loan: React.FC = () => {
  const f = useCurrentFrame();
  const blahAt = W('why-3', 'blah', 0);
  const scroll = f >= blahAt ? (f - blahAt) * 6 : 0;
  return (
    <>
      <Card x={560} y={110} w={800} h={740} at={W('why-3', 'loan')} color={C.fg} style={{ background: '#f4f1ea' }} rot={-1}>
        <div style={{ padding: '36px 50px', fontFamily: F.display, fontWeight: 900, fontSize: 70, color: '#222' }}>LOAN APPLICATION</div>
        <div style={{ height: 520, overflow: 'hidden', margin: '0 50px' }}>
          <div style={{ transform: `translateY(${-scroll}px)`, fontFamily: F.mono, fontSize: 30, lineHeight: 1.6, color: '#555' }}>
            {Array.from({ length: 40 }).map((_, i) => <div key={i}>{f >= blahAt ? 'blah blah blah blah blah blah' : '________________________'}</div>)}
          </div>
        </div>
      </Card>
      <Kinetic at={W('why-3', 'sure')} text="SURE." size={100} x={120} y={200} w={420} color={C.body} />
      <Stamp at={W('why-3', 'want')} text="NOPE." color={C.red} x={960} y={520} size={170} rot={-12} />
    </>
  );
};

// ---------------------------------------------------------------- why-4: game after game, tracking AI
const Roadmap: React.FC = () => {
  const f = useCurrentFrame();
  const g1 = W('why-4', 'game'), g2 = W('why-4', 'another'), trackAt = W('why-4', 'track');
  const devAt = W('why-4', 'dev'), edAt = W('why-4', 'editing');
  const games = [{ at: g1, t: 'GAME 1' }, { at: g2, t: 'GAME 2' }, { at: g2 + 12, t: 'GAME 3' }, { at: g2 + 20, t: '...' }];
  const Bar: React.FC<{ at: number; label: string; y: number; color: string }> = ({ at, label, y, color }) => (
    f >= at ? (
      <div style={{ position: 'absolute', left: 240, top: y, width: 1440 }}>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 44, color }}>{label}</div>
        <div style={{ display: 'flex', height: 54, marginTop: 8, borderRadius: 14, overflow: 'hidden', border: `4px solid ${C.black}` }}>
          <div style={{ width: `${iio(f, [at, at + 60], [8, 62], E.out)}%`, background: C.green, fontFamily: F.display, fontWeight: 900, fontSize: 30, color: C.black, padding: '8px 16px' }}>CAN</div>
          <div style={{ flex: 1, background: C.red, fontFamily: F.display, fontWeight: 900, fontSize: 30, color: C.black, padding: '8px 16px', textAlign: 'right' }}>CAN'T</div>
        </div>
      </div>
    ) : null
  );
  return (
    <>
      {games.map((g, i) => (
        <Card key={i} x={240 + i * 380} y={90} w={320} h={200} at={g.at} color={TILE_COLORS[i]} rot={(i % 2 ? 2 : -2)}>
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.crt, fontSize: 90, color: C.fg }}>{g.t}</div>
        </Card>
      ))}
      <Kinetic at={trackAt} text="WHAT AI CAN AND CAN'T DO" size={70} y={360} color={C.fg} />
      <Bar at={devAt} label="GAME DEV" y={480} color={C.cyan} />
      <Bar at={edAt} label="VIDEO EDITING" y={640} color={C.yellow} />
    </>
  );
};

// ---------------------------------------------------------------- silly-1: it's just storytelling
const Storytelling: React.FC = () => {
  const f = useCurrentFrame();
  const at = L('silly-1');
  return (
    <>
      <Card x={200} y={120} w={900} h={506} at={at} color={C.fg} style={{ background: '#000' }}>
        {STORY_CLIP ? (
          <Sequence from={at} layout="none"><OffthreadVideo src={P(`broll/${STORY_CLIP}`)} style={{ width: 900, height: 506 }} /></Sequence>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, background: 'repeating-linear-gradient(45deg, #111 0 30px, #181818 30px 60px)' }}>
            <svg width={140} height={140}><circle cx={70} cy={70} r={66} fill={C.red} /><path d="M56 42 L100 70 L56 98 Z" fill={C.white} /></svg>
            <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: C.dim }}>[ the "it's just storytelling" clip goes here ]</div>
          </div>
        )}
      </Card>
      <Kinetic at={W('silly-1', 'storytelling')} text={'"IT\'S JUST STORYTELLING."'} size={78} x={1140} y={220} w={720} align="left" color={C.yellow} />
      <Kinetic at={W('silly-1', 'all')} text="THAT'S ALL THIS IS." size={72} x={1140} y={470} w={720} align="left" color={C.fg} />
    </>
  );
};

// ---------------------------------------------------------------- silly-2: stories -> agenda
const Agenda: React.FC = () => {
  const f = useCurrentFrame();
  const agAt = W('silly-2', 'agenda');
  const k = iio(f, [agAt - 6, agAt + 6], [0, 1], E.inOut);
  return (
    <>
      <div style={{ position: 'absolute', left: 760, top: 200, width: 400, height: 460 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - k, transform: `rotateY(${k * 90}deg)` }}>
          <svg width={400} height={460}><rect x={20} y={40} width={170} height={380} rx={10} fill={C.cyan} /><rect x={210} y={40} width={170} height={380} rx={10} fill={C.cyan} /><rect x={190} y={40} width={20} height={380} fill="#127a88" />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={50} y={100 + i * 50} width={110} height={10} rx={5} fill="#0b4c55" />)}</svg>
        </div>
        <div style={{ position: 'absolute', inset: 0, opacity: k, transform: `rotateY(${(1 - k) * -90}deg)` }}>
          <svg width={400} height={460}><rect x={50} y={40} width={300} height={400} rx={16} fill="#d8c7a4" /><rect x={140} y={20} width={120} height={50} rx={10} fill={C.dim} /><rect x={80} y={100} width={240} height={310} fill="#fbfaf6" />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={100} y={130 + i * 52} width={200} height={12} rx={6} fill={C.red} />)}</svg>
        </div>
      </div>
      <Kinetic at={L('silly-2') + 2} text="STORIES" size={110} x={100} y={330} w={620} color={C.cyan} />
      <Strike at={agAt} x={160} y={380} w={500} />
      <Kinetic at={agAt} text="AN AGENDA" size={110} x={1200} y={330} w={660} color={C.red} />
    </>
  );
};

// ---------------------------------------------------------------- silly-3: the pile-on
const PileOn: React.FC = () => {
  const f = useCurrentFrame();
  const openAt = W('silly-3', 'open'), notAt = W('silly-3', 'not'), brigAt = W('silly-3', 'brigaded'), funAt = W('silly-3', 'fun');
  const shake = f >= brigAt && f < funAt ? Math.sin(f * 2.1) * 8 : 0;
  const n = f >= brigAt ? Math.min(40, Math.floor((f - brigAt) / 1.6)) : 0;
  const gray = iio(f, [funAt, funAt + 14], [0, 1]);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shake}px, ${-shake / 2}px)`, filter: `grayscale(${gray})` }}>
      <Kinetic at={openAt} text="OPEN MINDED ABOUT AI?" size={90} y={120} color={C.fg} />
      <Kinetic at={notAt} text="PEOPLE WERE NOT." size={110} y={250} color={C.red} />
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 80 + rnd(i) * 1560, top: 380 + rnd(i, 2) * 380, padding: '12px 22px', borderRadius: 18, background: C.red, border: `4px solid ${C.black}`, fontFamily: F.display, fontWeight: 900, fontSize: 30, color: C.white, transform: `rotate(${(rnd(i, 3) - 0.5) * 20}deg)` }}>
          {['@you', 'NEW REPLY', '+99', 'MENTIONED YOU', 'QUOTED YOU'][i % 5]}
        </div>
      ))}
      {f >= funAt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, height: 300, background: 'rgba(11,9,16,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.fg }}>IT STOPPED BEING FUN.</div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- silly-4: serious (music drops out)
const Serious: React.FC = () => {
  const f = useCurrentFrame();
  const bleepAt = W('silly-4', 'fucking');
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1a1a1a' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 150 + i * 290, top: 520, width: 200, height: 380, opacity: iio(f, [L('silly-4') + i * 4, L('silly-4') + i * 4 + 8], [0, 1]) }}>
          <div style={{ width: 90, height: 90, borderRadius: 45, background: '#666', margin: '0 auto' }} />
          <div style={{ width: 200, height: 270, borderRadius: '40px 40px 0 0', background: '#333', marginTop: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 90, top: 0, width: 20, height: 120, background: '#777' }} />
          </div>
        </div>
      ))}
      <Kinetic at={L('silly-4')} text="SERIOUS." size={150} y={90} color="#bbbbbb" font="serif" weight={700} />
      <Kinetic at={W('silly-4', 'serious', 1)} text="SERIOUS STUFF. SERIOUS PEOPLE." size={60} y={300} color="#999999" font="serif" weight={700} />
      {f >= bleepAt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', gap: 30, alignItems: 'center', transform: `scale(${iio(f, [bleepAt, bleepAt + 6], [1.4, 1], E.out)})` }}>
          <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.fg }}>IT</span>
          <span style={{ width: 360, height: 110, borderRadius: 14, background: C.pink }} />
          <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.fg }}>SUCKS.</span>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- silly-5/6: silly again
const Silly: React.FC = () => {
  const f = useCurrentFrame();
  const sillyAt = W('silly-5', 'silly');
  const againAt = L('silly-6');
  const t = f - sillyAt;
  const slide = iio(f, [againAt - 4, againAt + 14], [0, 1], E.inOut);
  return (
    <>
      {f >= sillyAt && Array.from({ length: 90 }).map((_, i) => {
        const x = 960 + (rnd(i) - 0.5) * 2100 * iio(t, [0, 25], [0.05, 1], E.out);
        const y = 460 + (rnd(i, 3) - 0.75) * 1000 * iio(t, [0, 25], [0.05, 1], E.out) + t * t * 0.05;
        return <div key={i} style={{ position: 'absolute', left: x, top: y % 1200, width: 26, height: 14, background: TILE_COLORS[i % TILE_COLORS.length], transform: `rotate(${t * 14 + i * 33}deg)` }} />;
      })}
      {f < againAt && <>
        <Kinetic at={L('silly-5')} text="I DON'T LIKE BEING SERIOUS." size={70} y={90} color={C.body} />
        <Kinetic at={sillyAt} text="I LIKE BEING SILLY." size={140} y={200} color={C.yellow} rot={-3} stroke />
      </>}
      <Mascot x={960 + slide * 520} y={620 - slide * 140} size={420 + slide * 60} at={sillyAt} spin={sillyAt + 6} wave look={[-0.4 * slide, 0]} />
      <Kinetic at={againAt} text="THIS CHANNEL" size={90} x={120} y={220} w={1000} align="left" color={C.body} />
      <Kinetic at={W('silly-6', 'me')} text="= ME," size={140} x={120} y={340} w={1000} align="left" color={C.fg} />
      <Kinetic at={W('silly-6', 'silly')} text="BEING SILLY AGAIN." size={110} x={120} y={510} w={1100} align="left" color={C.yellow} />
    </>
  );
};

// ---------------------------------------------------------------- out: the first brush stroke
const FirstStroke: React.FC = () => {
  const f = useCurrentFrame();
  const strokeAt = W('out-1', 'stroke');
  const d = iio(f, [strokeAt - 6, strokeAt + 18], [1, 0], E.inOut);
  return (
    <>
      <Easel x={560} y={80} w={800} h={560} at={L('out-1')}>
        <svg width={780} height={540} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M80 330 C 220 200, 360 400, 500 270 S 700 220, 720 250" stroke={C.yellow} strokeWidth={70} fill="none" strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * d} />
        </svg>
      </Easel>
      <Kinetic at={W('out-1', 'first')} text="THE FIRST BRUSH STROKE." size={64} y={770} color={C.fg} />
    </>
  );
};
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Wordmark at={L('out-2')} y={120} size={190} />
      <Kinetic at={W('out-2', 'game')} text="NEXT UP: THE GAME" size={80} y={380} color={C.fg} />
      <Mascot x={960} y={660} size={330} at={L('out-2') + 4} wave />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 870, textAlign: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 40, color: C.yellow, opacity: iio(f, [L('out-2') + 20, L('out-2') + 32], [0, 1]) }}>
        beeplumbgh.net  ·  youtube.com/@beeplumbgh
      </div>
    </>
  );
};

export const ActThree: React.FC = () => (
  <>
    <Scene from={L('why-1')} to={L('why-2')}><Land /></Scene>
    <Scene from={L('why-2')} to={L('why-3')}><Storylines /></Scene>
    <Scene from={L('why-3')} to={L('why-4')}><Loan /></Scene>
    <Scene from={L('why-4')} to={L('silly-1')}><Roadmap /></Scene>
    <Scene from={L('silly-1')} to={L('silly-2')}><Storytelling /></Scene>
    <Scene from={L('silly-2')} to={L('silly-3')}><Agenda /></Scene>
    <Scene from={L('silly-3')} to={L('silly-4')}><PileOn /></Scene>
    <Scene from={L('silly-4')} to={L('silly-5')} zoom={false}><Serious /></Scene>
    <Scene from={L('silly-5')} to={L('out-1')}><Silly /></Scene>
    <Scene from={L('out-1')} to={L('out-2')}><FirstStroke /></Scene>
    <Scene from={L('out-2')} to={DURATION_FRAMES + 10} fadeOut={1}><Outro /></Scene>
  </>
);
