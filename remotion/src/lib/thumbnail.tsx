// Thumbnail kit: building blocks for YouTube thumbnails rendered as Remotion stills (no image
// model, no API key). Pair with scripts/render-thumbs.mjs, which renders every Thumb* composition
// in an entry file plus a ThumbFeed check sheet.
//
// The rules these parts encode (from the packaging skill + the Beeplumb #1 critique):
//  - ONE dominant hook. Hook text is huge, heavy, black-stroked and drop-shadowed.
//  - Numbers need context. A bare "77K" could be dollars; pair it with an icon (PersonIcon) instead of words.
//  - The character must separate from the background: outline it (Mascot `outline`) and don't
//    reuse its own colors in the background.
//  - No tiny marks. Anything that isn't readable at 320px wide is clutter; ThumbFeed shows you.
//  - Loud on purpose: bright, saturated, positive. Thumbnails do not follow the calm in-video brand.
//
// Fonts are passed in (no import of ../fonts), so a shot can use its own locally bundled faces.
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const THUMB_SIZE = { width: 1280, height: 720 } as const;

/** Radial color burst with sun rays, centered where the subject sits. */
export const Burst: React.FC<{ from: string; to: string; cx?: string; rays?: number }> = ({ from, to, cx = '72%', rays = 0.12 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx} 50%, ${from} 0%, ${to} 78%)` }}>
    <AbsoluteFill style={{ background: `repeating-conic-gradient(from 0deg at ${cx} 50%, rgba(255,255,255,${rays}) 0deg 8deg, transparent 8deg 20deg)` }} />
  </AbsoluteFill>
);

/** The hook: giant heavy text with a black stroke and hard drop shadow. */
export const Hook: React.FC<{
  children: React.ReactNode; font: string; size: number; color: string; x: number; y: number;
  rot?: number; weight?: number; style?: React.CSSProperties;
}> = ({ children, font, size, color, x, y, rot = 0, weight = 900, style }) => (
  <div style={{
    position: 'absolute', left: x, top: y, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 0.9,
    color, letterSpacing: -2, transform: `rotate(${rot}deg)`, WebkitTextStroke: `${Math.round(size / 16)}px #000`,
    paintOrder: 'stroke fill', textShadow: `0 ${Math.round(size / 14)}px 0 #000`, whiteSpace: 'nowrap', ...style,
  }}>{children}</div>
);

/** A thick strike-through bar (black edge, colored core) to cross something out. */
export const StrikeBar: React.FC<{ x: number; y: number; w: number; rot?: number; color?: string; thick?: number }> = ({
  x, y, w, rot = -8, color = '#ff2d2d', thick = 30,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: thick, borderRadius: thick / 2, background: color, border: `${Math.round(thick / 5)}px solid #000`, transform: `rotate(${rot}deg)`, boxShadow: '0 8px 0 rgba(0,0,0,0.5)' }} />
);

/** Person silhouette: says "followers / people" without a word. */
export const PersonIcon: React.FC<{ x: number; y: number; size: number; color?: string }> = ({ x, y, size, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}>
    <g stroke="#000" strokeWidth={7} fill={color}>
      <circle cx={50} cy={30} r={20} />
      <path d="M12 96 Q 14 58 50 56 Q 86 58 88 96 Z" />
    </g>
  </svg>
);

/** A chunky arrow (black outline, colored core). Points right by default; rotate as needed. */
export const Arrow: React.FC<{ x: number; y: number; w: number; rot?: number; color?: string }> = ({ x, y, w, rot = 0, color = '#ffd21f' }) => {
  const d = `M10 60 L${w - 60} 60 M${w - 100} 18 L${w - 35} 60 L${w - 100} 102`;
  return (
    <svg width={w} height={120} style={{ position: 'absolute', left: x, top: y, overflow: 'visible', transform: `rotate(${rot}deg)` }}>
      <path d={d} stroke="#000" strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** A TV-style censor bar holding a grawlix (#@$%!), for bleeped-word hooks. */
export const CensorBar: React.FC<{ x: number; y: number; w: number; h: number; font: string; rot?: number; color?: string }> = ({
  x, y, w, h, font, rot = 0, color = '#ff2f8f',
}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h, background: '#000', border: `${Math.round(h / 12)}px solid ${color}`,
    borderRadius: 14, transform: `rotate(${rot}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: font, fontWeight: 900, fontSize: h * 0.62, color, letterSpacing: 4, boxShadow: '0 12px 0 rgba(0,0,0,0.45)',
  }}>#@$%!</div>
);

/**
 * Feed check: every thumbnail as it appears on a phone (about 360px wide) and in the watch-next
 * sidebar (168px), on YouTube's dark background, with the fixed title under each. Render it and
 * read it before shipping: if the hook isn't legible at 168px, the thumbnail fails.
 */
export const ThumbFeed: React.FC<{ thumbs: { id: string; C: React.FC }[]; title: string; font: string }> = ({ thumbs, title, font }) => {
  const Scaled: React.FC<{ C: React.FC; w: number }> = ({ C, w }) => (
    <div style={{ width: w, height: (w * 9) / 16, flexShrink: 0, borderRadius: w > 200 ? 12 : 6, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: THUMB_SIZE.width, height: THUMB_SIZE.height, transform: `scale(${w / THUMB_SIZE.width})`, transformOrigin: 'top left', position: 'absolute' }}>
        <C />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: '#0f0f0f', padding: 40, fontFamily: font }}>
      <div style={{ display: 'flex', gap: 36 }}>
        {thumbs.map(({ id, C }) => (
          <div key={id} style={{ width: 360 }}>
            <Scaled C={C} w={360} />
            <div style={{ color: '#f1f1f1', fontSize: 20, fontWeight: 700, marginTop: 12, lineHeight: 1.3 }}>{title}</div>
            <div style={{ color: '#aaa', fontSize: 16, marginTop: 6 }}>variant {id}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 36, marginTop: 40 }}>
        {thumbs.map(({ id, C }) => (
          <div key={id} style={{ display: 'flex', gap: 12, width: 360 }}>
            <Scaled C={C} w={168} />
            <div style={{ color: '#f1f1f1', fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
