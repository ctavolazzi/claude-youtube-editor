// Word-by-word captions synced to vo-timing.json. Words are grouped into short pages (a page
// never spans two VO lines); the word being spoken pops in yellow, and bleeped words show
// as a pink censor bar.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, F, FPS, TIMING, iio } from './common';

type Page = { words: { w: string; s: number; e: number; bleep?: boolean }[]; s: number; e: number };

const MAX_WORDS = 6;
const MAX_CHARS = 30;

const PAGES: Page[] = (() => {
  const pages: Page[] = [];
  for (const ln of TIMING.lines) {
    let cur: Page | null = null;
    let chars = 0;
    for (const w of ln.words) {
      if (!/[A-Za-z0-9]/.test(w.w) && !w.bleep) continue;
      const word = { w: w.w, s: Math.round(w.start * FPS), e: Math.round(w.end * FPS), bleep: w.bleep };
      if (!cur || cur.words.length >= MAX_WORDS || chars + w.w.length > MAX_CHARS) {
        cur = { words: [], s: word.s, e: word.e };
        pages.push(cur);
        chars = 0;
      }
      cur.words.push(word);
      cur.e = word.e;
      chars += w.w.length + 1;
      // end a page on sentence punctuation so pages read as phrases
      if (/[.?!]$/.test(w.w)) cur = null;
    }
  }
  // hold each page until the next one starts (max 0.6s past its last word)
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    p.e = Math.min(next ? next.s : p.e + 18, p.e + 18);
  });
  return pages;
})();

export const Captions: React.FC<{ hideFrom?: [number, number][]; y?: number }> = ({ hideFrom = [], y = 930 }) => {
  const f = useCurrentFrame();
  if (hideFrom.some(([a, b]) => f >= a && f < b)) return null;
  const page = PAGES.find((p) => f >= p.s && f < p.e);
  if (!page) return null;
  const enter = iio(f, [page.s, page.s + 4], [0.85, 1]);
  return (
    <div style={{
      position: 'absolute', left: 80, right: 80, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
      gap: '0 34px', transform: `scale(${enter})`,
    }}>
      {page.words.map((w, i) => {
        const active = f >= w.s && f < (page.words[i + 1]?.s ?? page.e);
        const spoken = f >= w.s;
        const pop = active ? iio(f, [w.s, w.s + 4], [1.12, 1.04]) : 1;
        if (w.bleep) {
          return (
            <span key={i} style={{
              display: 'inline-block', background: C.pink, color: C.pink, borderRadius: 10, padding: '0 10px',
              fontFamily: F.display, fontWeight: 900, fontSize: 64, lineHeight: 1.15, transform: `scale(${pop})`,
              opacity: spoken ? 1 : 0.35, boxShadow: '0 6px 0 rgba(0,0,0,0.5)',
            }}>{'#'.repeat(Math.max(4, w.w.length))}</span>
          );
        }
        return (
          <span key={i} style={{
            display: 'inline-block', fontFamily: F.display, fontWeight: 900, fontSize: 64, lineHeight: 1.15,
            color: active ? C.yellow : C.white, opacity: spoken ? 1 : 0.45, transform: `scale(${pop})`,
            WebkitTextStroke: `10px ${C.black}`, paintOrder: 'stroke fill', textShadow: '0 6px 0 rgba(0,0,0,0.55)',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};
