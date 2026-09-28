// YouTube thumbnails for Beeplumb #1: three A/B/C bets under one fixed title (see
// videos/beeplumb-01-blank-canvas/packaging/packaging.md). Rendered as Remotion stills, so they
// need no API key and reuse the exact mascot from the video.
//
// Deliberately LOUD (bright, saturated, one giant hook). Thumbnails play by CTR rules, not by the
// calmer in-video look. Render: see the packaging README.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F } from './common';
import { Mascot } from './Mascot';

export const THUMB = { width: 1280, height: 720, frame: 20 } as const;

const Hook: React.FC<{ children: React.ReactNode; size: number; color: string; x: number; y: number; rot?: number; style?: React.CSSProperties }> = ({
  children, size, color, x, y, rot = 0, style,
}) => (
  <div style={{
    position: 'absolute', left: x, top: y, fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 0.9,
    color, letterSpacing: -2, transform: `rotate(${rot}deg)`, WebkitTextStroke: `${Math.round(size / 18)}px ${C.black}`,
    paintOrder: 'stroke fill', textShadow: `0 ${Math.round(size / 14)}px 0 ${C.black}`, whiteSpace: 'nowrap', ...style,
  }}>{children}</div>
);

const Burst: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 70% 50%, ${from} 0%, ${to} 75%)` }}>
    <AbsoluteFill style={{ background: 'repeating-conic-gradient(from 0deg at 72% 50%, rgba(255,255,255,0.10) 0deg 8deg, transparent 8deg 20deg)' }} />
  </AbsoluteFill>
);

const Corner: React.FC = () => (
  <div style={{ position: 'absolute', left: 28, bottom: 22, fontFamily: F.display, fontWeight: 900, fontSize: 30, letterSpacing: -0.5, textShadow: '0 3px 0 #000' }}>
    <span style={{ color: C.yellow }}>BEE</span><span style={{ color: '#e9c6ff' }}>PLUMB</span>
  </div>
);

// A: number lead. 77K followers -> 0.
export const ThumbA: React.FC = () => (
  <AbsoluteFill>
    <Burst from="#ff7a2f" to="#c4122f" />
    <Hook size={250} color={C.white} x={50} y={120}>77K</Hook>
    <svg width={210} height={120} style={{ position: 'absolute', left: 95, top: 370 }}>
      <path d="M10 60 L150 60 M110 18 L175 60 L110 102" stroke={C.black} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 60 L150 60 M110 18 L175 60 L110 102" stroke={C.yellow} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <Hook size={290} color={C.yellow} x={320} y={300}>0</Hook>
    <Mascot x={930} y={380} size={620} mood="shock" talk={false} look={[-0.6, -0.2]} />
    <Corner />
  </AbsoluteFill>
);

// B: price lead. $100/mo, the whole budget.
export const ThumbB: React.FC = () => (
  <AbsoluteFill>
    <Burst from="#fff27a" to="#f5a300" />
    <Hook size={250} color="#16c24a" x={36} y={180} rot={-4}>$100</Hook>
    <Hook size={96} color={C.white} x={120} y={450} rot={-4}>/MONTH</Hook>
    <Mascot x={1030} y={400} size={540} wave talk={false} look={[-0.5, 0]} />
    <Corner />
  </AbsoluteFill>
);

// C: object lead. A blank canvas with one brush stroke, "DAY 1".
export const ThumbC: React.FC = () => (
  <AbsoluteFill>
    <Burst from="#5fe3f2" to="#8a2be2" />
    <div style={{ position: 'absolute', left: 90, top: 70, width: 560, height: 420, background: '#fffdf6', border: '14px solid #d8b57a', borderRadius: 8, boxShadow: '0 22px 0 rgba(0,0,0,0.45)', transform: 'rotate(-3deg)' }}>
      <svg width={532} height={392}>
        <path d="M60 250 C 170 140, 270 320, 360 200 S 470 160, 480 190" stroke={C.yellow} strokeWidth={60} fill="none" strokeLinecap="round" />
      </svg>
    </div>
    <div style={{ position: 'absolute', left: 170, top: 480, width: 22, height: 220, background: '#8a5a2b', transform: 'rotate(10deg)' }} />
    <div style={{ position: 'absolute', left: 540, top: 480, width: 22, height: 220, background: '#8a5a2b', transform: 'rotate(-10deg)' }} />
    <Hook size={210} color={C.white} x={640} y={40} rot={4}>DAY 1</Hook>
    <Mascot x={1000} y={470} size={470} talk={false} look={[-0.7, -0.3]} wave />
    <Corner />
  </AbsoluteFill>
);
