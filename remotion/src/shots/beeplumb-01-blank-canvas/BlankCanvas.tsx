// Beeplumb #1, "the blank canvas": why this channel exists. A fully produced video with no
// footage: local AI voiceover (tools/gen_vo_local.py), word-synced kinetic type, captions,
// the plum-bee mascot, real site screenshots, a music bed and library SFX.
//
// Rebuild the voice after editing videos/beeplumb-01-blank-canvas/script/vo.json:
//   python tools/gen_vo_local.py videos/beeplumb-01-blank-canvas/script/vo.json
// Every scene is keyed to line and word ids, so the visuals re-sync on their own.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, F, E, iio, rnd, P, L, W, Lend, TIMING, fr, DURATION_FRAMES } from './common';
import { ActOne } from './ScenesA';
import { ActTwo } from './ScenesB';
import { ActThree } from './ScenesC';
import { Captions } from './Captions';

export const compositionConfig = {
  id: 'BlankCanvas',
  // must match vo-timing.json "duration" (the standalone entry reads it from there)
  durationInSeconds: 250.329,
  fps: 30,
  width: 1920,
  height: 1080,
};

// ---------------------------------------------------------------- background
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const blobs = [
    { c: C.plum, x: 300, y: 250, r: 700, sp: 0.004 },
    { c: C.pink, x: 1600, y: 800, r: 600, sp: 0.005 },
    { c: C.cyan, x: 1500, y: 150, r: 500, sp: 0.003 },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x + Math.sin(f * b.sp * 6 + i) * 160 - b.r / 2, top: b.y + Math.cos(f * b.sp * 5 + i) * 120 - b.r / 2,
          width: b.r, height: b.r, borderRadius: '50%', background: `radial-gradient(circle, ${b.c}40, transparent 65%)`,
        }} />
      ))}
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)', backgroundSize: '48px 48px', backgroundPosition: `${(f * 0.4) % 48}px ${(f * 0.25) % 48}px` }} />
    </AbsoluteFill>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 3px, rgba(0,0,0,0.10) 3px 4px)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)' }} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- chapter tag (top left)
const CHAPTERS: [string, string, string][] = [
  ['open', '01', 'THE WAFFLING'], ['know', '02', 'WHAT I KNOW'], ['name', '03', 'THE NAME'], ['plan', '04', 'THE PLAN'],
  ['ai', '05', 'THE AI PART'], ['why', '06', 'THE WHY'], ['silly', '07', 'THE SILLY PART'],
];
const Chapter: React.FC = () => {
  const f = useCurrentFrame();
  const cur = [...CHAPTERS].reverse().find(([b]) => TIMING.beats[b] && f >= fr(TIMING.beats[b].start) - 10);
  if (!cur || f >= L('out-1')) return null;
  const at = fr(TIMING.beats[cur[0]].start) - 10;
  const slide = iio(f, [at, at + 12], [-420, 0], E.out);
  return (
    <div style={{ position: 'absolute', left: 36, top: 30, display: 'flex', alignItems: 'center', transform: `translateX(${slide}px)` }}>
      <div style={{ padding: '6px 14px', background: C.yellow, color: C.black, fontFamily: F.display, fontWeight: 900, fontSize: 26, borderRadius: '10px 0 0 10px' }}>{cur[1]}</div>
      <div style={{ padding: '6px 16px', background: 'rgba(0,0,0,0.6)', color: C.fg, fontFamily: F.display, fontWeight: 700, fontSize: 26, borderRadius: '0 10px 10px 0', border: `2px solid ${C.yellow}` }}>{cur[2]}</div>
    </div>
  );
};

// ---------------------------------------------------------------- progress bar (bottom)
const Progress: React.FC = () => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: 0, bottom: 0, height: 8, width: `${(f / DURATION_FRAMES) * 100}%`, background: `linear-gradient(90deg, ${C.plum}, ${C.pink}, ${C.yellow})` }} />;
};

// ---------------------------------------------------------------- sound
const lib = (p: string) => staticFile(`library/${p}`);
const SFX: { at: number; id: string; vol: number }[] = [
  { at: W('open-1', 'weekend'), id: 'whoosh-soft', vol: 0.4 },
  { at: W('open-2', 'handle'), id: 'pop-reveal', vol: 0.35 },
  { at: W('open-2', 'trend'), id: 'pop-reveal', vol: 0.35 },
  { at: W('open-2', 'beat'), id: 'pop-reveal', vol: 0.35 },
  { at: L('open-3') + 2, id: 'stamp-hit', vol: 0.8 },
  { at: L('open-3') + 7, id: 'stamp-hit', vol: 0.6 },
  { at: L('open-3') + 12, id: 'stamp-hit', vol: 0.6 },
  { at: L('open-4'), id: 'sting-scare-comic', vol: 0.45 },
  { at: W('know-2', 'explore'), id: 'ui-click-soft', vol: 0.5 },
  { at: W('know-2', 'express'), id: 'ui-click-soft', vol: 0.5 },
  { at: W('know-2', 'show'), id: 'chime-reward', vol: 0.4 },
  { at: W('know-3', 'you', 2), id: 'impact-soft', vol: 0.7 },
  { at: W('know-4', 'thumbnail'), id: 'pop-reveal', vol: 0.35 },
  { at: W('know-4', 'deciding'), id: 'whoosh-wind', vol: 0.4 },
  { at: W('know-5', 'lucky'), id: 'sparkle-soft', vol: 0.5 },
  { at: L('name-1'), id: 'whoosh-reverse', vol: 0.35 },
  { at: W('name-1', 'beeplumb'), id: 'impact-deep-soft', vol: 0.7 },
  { at: W('name-2', 'bee'), id: 'page-flip', vol: 0.5 },
  { at: W('name-3', 'plum'), id: 'pop-reveal', vol: 0.6 },
  { at: W('name-3', 'hi'), id: 'chime-magic', vol: 0.5 },
  { at: W('name-4', 'seventy'), id: 'riser-soft', vol: 0.35 },
  { at: L('name-5'), id: 'whoosh-soft', vol: 0.5 },
  { at: W('name-6', 'covered'), id: 'pencil-scribble', vol: 0.4 },
  { at: W('name-6', 'better'), id: 'sparkle-soft', vol: 0.5 },
  { at: W('plan-1', 'game'), id: 'launch-thump', vol: 0.4 },
  { at: W('plan-1', 'silly', 0), id: 'stamp-hit', vol: 0.5 },
  { at: W('plan-2', 'absolutely'), id: 'glitch-zap', vol: 0.5 },
  { at: W('plan-4', 'videos'), id: 'pop-reveal', vol: 0.4 },
  { at: W('ai-1', 'ai'), id: 'glitch-zap', vol: 0.8 },
  { at: L('ai-2'), id: 'ui-send', vol: 0.4 },
  { at: W('ai-2', 'here'), id: 'impact-soft', vol: 0.6 },
  { at: W('ai-3', 'credit'), id: 'trap-snap', vol: 0.5 },
  { at: W('ai-4', 'bonfire'), id: 'launch-thump', vol: 0.5 },
  { at: W('ai-5', 'videos', 0), id: 'whoosh-soft', vol: 0.4 },
  { at: W('ai-6', 'exactly'), id: 'chime-reward', vol: 0.4 },
  { at: W('ai-8', 'voice'), id: 'pop-reveal', vol: 0.35 },
  { at: W('ai-8', 'graphics'), id: 'keys-typing-soft', vol: 0.35 },
  { at: W('ai-8', 'plum'), id: 'pop-reveal', vol: 0.35 },
  { at: W('ai-8', 'look'), id: 'whoosh-wind', vol: 0.5 },
  { at: W('why-1', 'land'), id: 'chime-magic', vol: 0.4 },
  { at: W('why-2', 'close'), id: 'chime-reward', vol: 0.4 },
  { at: W('why-3', 'want'), id: 'stamp-hit', vol: 0.9 },
  { at: W('why-4', 'game'), id: 'pop-reveal', vol: 0.35 },
  { at: W('why-4', 'another'), id: 'pop-reveal', vol: 0.35 },
  { at: W('silly-2', 'agenda'), id: 'page-flip', vol: 0.5 },
  { at: W('silly-3', 'brigaded'), id: 'scan-hum', vol: 0.5 },
  { at: W('silly-3', 'fun'), id: 'impact-deep-soft', vol: 0.5 },
  { at: W('silly-5', 'silly'), id: 'sparkle-soft', vol: 0.7 },
  { at: W('silly-5', 'silly'), id: 'chime-magic', vol: 0.5 },
  { at: W('out-1', 'stroke'), id: 'pencil-scribble', vol: 0.5 },
  { at: L('out-2'), id: 'impact-deep-soft', vol: 0.6 },
];

const MUSIC_VOL = 0.11;
const seriousFrom = L('silly-4'), seriousTo = W('silly-5', 'silly');
const musicVolume = (f: number) => {
  const fadeIn = iio(f, [0, 40], [0, 1]);
  const fadeOut = iio(f, [DURATION_FRAMES - 90, DURATION_FRAMES], [1, 0]);
  const serious = f >= seriousFrom && f < seriousTo ? iio(f, [seriousFrom, seriousFrom + 8], [1, 0]) : 1;
  const boost = f >= seriousTo ? 1.35 : 1;
  return MUSIC_VOL * fadeIn * fadeOut * serious * boost;
};

export const BlankCanvas: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: F.display }}>
    <Background />
    <ActOne />
    <ActTwo />
    <ActThree />
    <Chapter />
    <Captions hideFrom={[[W('know-3', 'you', 2), Lend('know-3') + 6]]} />
    <Progress />
    <Overlay />
    <Audio src={P('vo/vo.wav')} />
    <Audio src={lib('music/clips/docu-pluck.mp3')} loop volume={musicVolume} />
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={100} layout="none">
        <Audio src={lib(`sfx/clips/${s.id}.mp3`)} volume={s.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export default BlankCanvas;
