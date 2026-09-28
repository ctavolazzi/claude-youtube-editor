// The Beeplumb mascot: a plum that is also a bee. Pure SVG, so it renders headlessly and
// every part (wings, eyes, mouth, arms) is animatable. The mouth is driven by vo-mouth.json
// (per-frame loudness of the voiceover), which gives cheap, convincing lip-sync.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import mouthTrack from './vo-mouth.json';
import { C, iio, E } from './common';

const MOUTH = mouthTrack as number[];
export type Mood = 'happy' | 'shock' | 'smug' | 'sad';

export const Mascot: React.FC<{
  x: number; y: number; size?: number; // center position, px width
  at?: number; out?: number;            // pop in / pop out frames
  talk?: boolean;                       // lip-sync to the voiceover
  mood?: Mood;
  look?: [number, number];              // pupil offset, -1..1
  wave?: boolean;                       // right arm waves
  spin?: number;                        // frame to start a loop-de-loop
  flip?: boolean;
}> = ({ x, y, size = 360, at = 0, out, talk = true, mood = 'happy', look = [0, 0], wave, spin, flip }) => {
  const f = useCurrentFrame();
  if (f < at || (out !== undefined && f >= out + 8)) return null;

  const popIn = iio(f, [at, at + 12], [0, 1], E.pop);
  const popOut = out !== undefined ? iio(f, [out, out + 8], [1, 0], E.in) : 1;
  const bob = Math.sin(f / 9) * 10;
  const flap = 0.55 + 0.45 * Math.abs(Math.sin(f * 0.9));
  const blink = f % 105 < 4 ? 0.12 : 1;
  const m = talk ? MOUTH[Math.min(f, MOUTH.length - 1)] ?? 0 : 0;
  const spinDeg = spin !== undefined ? iio(f, [spin, spin + 24], [0, 360], E.inOut) : 0;
  const antWob = Math.sin(f / 7) * 6;
  const waveDeg = wave ? -30 + Math.sin(f / 3.2) * 28 : 18;

  const eyeScaleY = (mood === 'shock' ? 1.18 : mood === 'smug' ? 0.55 : 1) * blink;
  const px = look[0] * 9, py = look[1] * 9;

  return (
    <div style={{
      position: 'absolute', left: x - size / 2, top: y - size / 2 + bob, width: size, height: size,
      transform: `scale(${popIn * popOut}) rotate(${spinDeg}deg) scaleX(${flip ? -1 : 1})`,
    }}>
      <svg viewBox="0 0 400 400" width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="bp-body" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#c77ff2" />
            <stop offset="45%" stopColor="#8a34b8" />
            <stop offset="100%" stopColor="#3e0f58" />
          </radialGradient>
          <clipPath id="bp-clip">
            <path d="M200 92 C 292 86, 338 160, 330 236 C 322 318, 262 360, 200 360 C 138 360, 78 318, 70 236 C 62 160, 108 86, 200 92 Z" />
          </clipPath>
        </defs>

        {/* wings */}
        <g opacity={0.85}>
          <ellipse cx={112} cy={130} rx={62} ry={92 * flap} transform={`rotate(-32 112 ${130})`} fill="rgba(205,235,255,0.55)" stroke="#fff" strokeWidth={4} />
          <ellipse cx={288} cy={130} rx={62} ry={92 * flap} transform={`rotate(32 288 ${130})`} fill="rgba(205,235,255,0.55)" stroke="#fff" strokeWidth={4} />
        </g>

        {/* arms (left static, right waves) */}
        <g>
          <rect x={46} y={228} width={46} height={22} rx={11} fill="#6d2594" transform={`rotate(24 88 239)`} />
          <g transform={`rotate(${waveDeg} 312 239)`}>
            <rect x={308} y={228} width={50} height={22} rx={11} fill="#6d2594" />
            <circle cx={360} cy={239} r={14} fill="#7b2ba6" />
          </g>
        </g>

        {/* stinger */}
        <path d="M188 352 L200 388 L212 352 Z" fill="#241030" />

        {/* body + bee stripes */}
        <path d="M200 92 C 292 86, 338 160, 330 236 C 322 318, 262 360, 200 360 C 138 360, 78 318, 70 236 C 62 160, 108 86, 200 92 Z" fill="url(#bp-body)" />
        <g clipPath="url(#bp-clip)">
          <path d="M40 262 Q 200 300 360 262 L 360 292 Q 200 332 40 292 Z" fill={C.yellow} opacity={0.95} />
          <path d="M40 318 Q 200 356 360 318 L 360 342 Q 200 382 40 342 Z" fill={C.yellow} opacity={0.95} />
          {/* plum suture line */}
          <path d="M214 98 Q 236 190 214 356" stroke="rgba(40,8,60,0.35)" strokeWidth={6} fill="none" />
        </g>
        {/* sheen */}
        <ellipse cx={138} cy={150} rx={34} ry={22} fill="rgba(255,255,255,0.38)" transform="rotate(-30 138 150)" />

        {/* stem + leaf */}
        <path d="M200 96 Q 196 66 214 44" stroke="#5a3a1c" strokeWidth={10} strokeLinecap="round" fill="none" />
        <path d="M212 56 Q 262 30 290 62 Q 250 84 212 56 Z" fill="#3fbf5a" stroke="#1f7a33" strokeWidth={3} />

        {/* antennae */}
        <g transform={`rotate(${antWob} 176 100)`}>
          <path d="M176 100 Q 150 60 128 44" stroke="#241030" strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={126} cy={42} r={12} fill={C.yellow} stroke="#241030" strokeWidth={4} />
        </g>
        <g transform={`rotate(${-antWob} 232 102)`}>
          <path d="M232 102 Q 262 70 276 34" stroke="#241030" strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={278} cy={32} r={12} fill={C.yellow} stroke="#241030" strokeWidth={4} />
        </g>

        {/* brows */}
        {mood === 'shock' && (<>
          <path d="M122 140 Q 150 118 176 134" stroke="#241030" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M224 134 Q 250 118 278 140" stroke="#241030" strokeWidth={7} fill="none" strokeLinecap="round" />
        </>)}
        {mood === 'sad' && (<>
          <path d="M126 148 Q 150 142 174 130" stroke="#241030" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M226 130 Q 250 142 274 148" stroke="#241030" strokeWidth={7} fill="none" strokeLinecap="round" />
        </>)}

        {/* eyes */}
        {[150, 250].map((ex) => (
          <g key={ex} transform={`translate(${ex} 186) scale(1 ${eyeScaleY}) translate(${-ex} -186)`}>
            <ellipse cx={ex} cy={186} rx={30} ry={36} fill="#fff" stroke="#241030" strokeWidth={5} />
            <circle cx={ex + px} cy={190 + py} r={15} fill="#1a0826" />
            <circle cx={ex + px + 6} cy={183 + py} r={5} fill="#fff" />
          </g>
        ))}
        {mood === 'smug' && (<>
          <rect x={116} y={148} width={68} height={24} fill="#8a34b8" />
          <rect x={216} y={148} width={68} height={24} fill="#8a34b8" />
        </>)}

        {/* cheeks */}
        <ellipse cx={110} cy={232} rx={20} ry={12} fill="#ff6fae" opacity={0.55} />
        <ellipse cx={290} cy={232} rx={20} ry={12} fill="#ff6fae" opacity={0.55} />

        {/* mouth */}
        {m > 0.06 || mood === 'shock' ? (
          <g>
            <ellipse cx={200} cy={246} rx={22 + m * 10} ry={mood === 'shock' ? Math.max(20, 6 + m * 30) : 6 + m * 30} fill="#2a0a33" />
            <ellipse cx={200} cy={258 + m * 10} rx={13 + m * 5} ry={4 + m * 8} fill="#ff5c8a" />
          </g>
        ) : mood === 'sad' ? (
          <path d="M172 256 Q 200 236 228 256" stroke="#2a0a33" strokeWidth={7} fill="none" strokeLinecap="round" />
        ) : (
          <path d={mood === 'smug' ? 'M176 244 Q 206 262 230 238' : 'M170 240 Q 200 270 230 240'} stroke="#2a0a33" strokeWidth={7} fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
};
