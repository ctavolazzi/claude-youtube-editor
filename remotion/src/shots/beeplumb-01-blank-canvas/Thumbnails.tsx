// YouTube thumbnails for Beeplumb #1: A is the FINAL (the default thumbnail at upload); B and C
// are its Test & Compare variants under the same fixed title (see packaging/packaging.md).
// Built on remotion/src/lib/thumbnail.tsx; render with scripts/render-thumbs.mjs.
//
// v2, after the critique: context icon on the number, a huge "0", no tiny corner mark, an
// outlined mascot that can't blend into the background, an excited (open) expression instead of
// the flat smile, and C swapped from "DAY 1" to the bleep, which is the video's funniest beat.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { F } from './common';
import { Mascot } from './Mascot';
import { Burst, Hook, StrikeBar, PersonIcon, Arrow, CensorBar } from '../../lib/thumbnail';

export const TITLE = 'Starting a YouTube Channel From Zero With AI (While Broke)';
const M = { still: true, talk: false, outline: 7 } as const;

// A (FINAL): number lead. 77K followers, crossed out, -> a giant 0.
export const ThumbA: React.FC = () => (
  <AbsoluteFill>
    <Burst from="#ff8a2a" to="#c10f2c" cx="74%" />
    <PersonIcon x={36} y={70} size={150} />
    <Hook font={F.display} size={200} color="#fff" x={200} y={70}>77K</Hook>
    <StrikeBar x={188} y={150} w={440} rot={-9} />
    <Arrow x={70} y={330} w={300} rot={28} />
    <Hook font={F.display} size={380} color="#ffd21f" x={360} y={290}>0</Hook>
    <Mascot x={960} y={390} size={600} mood="shock" look={[-0.7, -0.1]} {...M} />
  </AbsoluteFill>
);

// B: price lead. $100 a month is the whole budget; the mascot holds the bill up.
const Bill: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <svg width={300} height={150} viewBox="0 0 300 150" style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.4))' }}>
    <rect x={4} y={4} width={292} height={142} rx={12} fill="#9be07a" stroke="#000" strokeWidth={8} />
    <rect x={22} y={22} width={256} height={106} rx={8} fill="none" stroke="#2f7a2a" strokeWidth={5} />
    <circle cx={150} cy={75} r={38} fill="#6fc255" stroke="#2f7a2a" strokeWidth={5} />
    <path d="M150 50 L150 100 M138 62 Q 150 54 162 62 Q 162 74 150 75 Q 138 76 138 88 Q 150 96 162 88" stroke="#1d4f1a" strokeWidth={7} fill="none" strokeLinecap="round" />
  </svg>
);
export const ThumbB: React.FC = () => (
  <AbsoluteFill>
    <Burst from="#46f08a" to="#067a3a" cx="72%" />
    <Hook font={F.display} size={260} color="#ffd21f" x={40} y={150} rot={-4}>$100</Hook>
    <Hook font={F.display} size={110} color="#fff" x={120} y={430} rot={-4}>/MONTH</Hook>
    <Mascot x={960} y={420} size={560} mood="excited" look={[-0.5, -0.4]} armUp {...M} />
    <Bill x={930} y={90} rot={14} />
  </AbsoluteFill>
);

// C: the bleep. "I'M BROKE" + a censor bar, the funniest beat in the video (2:06 chapter).
export const ThumbC: React.FC = () => (
  <AbsoluteFill>
    <Burst from="#ff5fc1" to="#6a1bd1" cx="76%" />
    <Hook font={F.display} size={168} color="#fff" x={40} y={100} rot={-3}>I'M BROKE</Hook>
    <CensorBar x={70} y={330} w={560} h={170} font={F.display} rot={-3} color="#ffd21f" />
    <Mascot x={1050} y={430} size={500} mood="smug" look={[-0.8, 0]} {...M} />
  </AbsoluteFill>
);

export const THUMBS = [
  { id: 'A', C: ThumbA },
  { id: 'B', C: ThumbB },
  { id: 'C', C: ThumbC },
];
