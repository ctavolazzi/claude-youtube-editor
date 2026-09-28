import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BRAND, COLORS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { Grain } from '../../lib/commentary';
import { FlightBed, Sfx, music } from '../../lib/kinetic';
import { DURATION_S, ENV, FPS, SENTS, VOICE, VOICE_END, WORDS, duckedMusic, fr, sf0 } from './_data';

// =============================================================================
// Style C: CAPTIONS. The retention cut: full-colour gameplay, big word-by-word captions
// (2-3 words a page, the spoken word lit), hero words popped full-size on their own, a
// jump-zoom on every sentence like a talking-head jump cut, live waveform + progress bar.
// No cards, no transitions: the words ARE the edit.
// =============================================================================
export const compositionConfig = { id: 'ComfortCaptions', durationInSeconds: DURATION_S, fps: FPS, width: 1920, height: 1080 };

const norm = (t: string) => t.toLowerCase().replace(/[^a-z']/g, '');
const HOT = new Set(['comfortable', 'tired', 'trap', 'free', 'will', 'weaker', 'imagination', 'reality', 'emergency', 'move', 'purpose', 'phone', 'resistance', 'tool']);
const COLOR: Record<string, string> = {
  tired: COLORS.danger, trap: COLORS.danger, weaker: COLORS.danger, emergency: COLORS.danger, phone: COLORS.danger, free: COLORS.danger,
  move: COLORS.signal, purpose: COLORS.signal, reality: COLORS.signal, resistance: COLORS.signal, tool: COLORS.signal,
};

// ---- pages: 1-3 words, broken on punctuation, pauses, length; hero words alone ----------
type Page = { w: number[]; s: number; e: number };
const PAGES: Page[] = (() => {
  const out: Page[] = [];
  let cur: number[] = [];
  const flush = () => { if (cur.length) out.push({ w: cur, s: WORDS[cur[0]].s, e: WORDS[cur[cur.length - 1]].e }); cur = []; };
  WORDS.forEach((w, i) => {
    const hot = HOT.has(norm(w.t));
    if (hot) { flush(); cur = [i]; flush(); return; }
    const chars = cur.reduce((n, k) => n + WORDS[k].t.length, 0);
    const gap = i > 0 ? w.s - WORDS[i - 1].e : 0;
    if (cur.length >= 3 || chars + w.t.length > 16 || gap > 0.35) flush();
    cur.push(i);
    if (/[.,?!]$/.test(w.t)) flush();
  });
  flush();
  return out;
})();

const CHAPTERS: [number, string][] = [[0, 'the setup'], [5, 'part 1 · the trap'], [10, 'seneca'], [13, 'part 2 · the move'], [19, 'the point']];

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // current page = last page that has started (and hasn't gone stale in a long pause)
  let idx = -1;
  for (let k = 0; k < PAGES.length; k++) if (PAGES[k].s - 0.05 <= t) idx = k;
  if (idx < 0) return null;
  const pg = PAGES[idx];
  const next = PAGES[idx + 1];
  const holdUntil = next ? Math.min(next.s, pg.e + 0.6) : pg.e + 0.6;
  if (t > holdUntil) return null;
  const solo = pg.w.length === 1 && HOT.has(norm(WORDS[pg.w[0]].t));
  const size = solo ? 190 : 118;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: solo ? 0 : 200 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 34px', maxWidth: 1650, transform: solo ? `rotate(-3deg)` : undefined }}>
        {pg.w.map((k) => {
          const w = WORDS[k];
          const a = fr(w.s) - 2;
          const pop = interpolate(frame, [a, a + 5], [0.55, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const on = frame >= a;
          const speaking = t >= w.s - 0.03 && t <= w.e + 0.05;
          const key = norm(w.t);
          const color = COLOR[key] ?? (speaking || solo ? COLORS.accent : '#ffffff');
          return (
            <span key={k} style={{
              fontFamily: solo ? FONT_DISPLAY : FONT_BODY, fontStyle: solo ? 'italic' : 'normal', fontWeight: solo ? 900 : 800,
              fontSize: size, lineHeight: 1.05, letterSpacing: solo ? -4 : -2, textTransform: solo ? 'none' : 'uppercase',
              color, opacity: on ? 1 : 0, display: 'inline-block',
              transform: `scale(${(on ? pop : 0.55) * (speaking && !solo ? 1.08 : 1)})`,
              WebkitTextStroke: `${solo ? 12 : 10}px #000`, paintOrder: 'stroke fill',
              textShadow: '0 10px 0 rgba(0,0,0,0.55), 0 18px 40px rgba(0,0,0,0.6)',
            }}>{w.t.replace(/[,]$/, '')}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.floor((frame / FPS) * 30);
  const N = 36;
  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 70, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 7, height: 90 }}>
      {new Array(N).fill(0).map((_, k) => {
        const d = Math.abs(k - (N - 1) / 2);
        const v = ENV[Math.max(0, Math.min(ENV.length - 1, i - Math.round(d)))] ?? 0;
        const h = 6 + v * 80 * (1 - d / N * 0.9);
        return <div key={k} style={{ width: 9, height: h, borderRadius: 5, background: d < 4 ? COLORS.accent : 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />;
      })}
    </div>
  );
};

const Chrome: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const prog = Math.min(1, t / VOICE_END);
  let label = CHAPTERS[0][1];
  for (const [si, l] of CHAPTERS) if (t >= SENTS[si].s - 0.2) label = l;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 10, width: `${prog * 100}%`, background: COLORS.accent, boxShadow: `0 0 20px ${COLORS.accent}` }} />
      <div style={{ position: 'absolute', left: 60, top: 50, display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 30, color: '#000', background: COLORS.accent, padding: '8px 18px', borderRadius: 8, textTransform: 'uppercase' }}>The comfort trap</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 8, letterSpacing: 3, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ position: 'absolute', right: 60, top: 54, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.85)', letterSpacing: 2, textShadow: '0 2px 8px #000' }}>{BRAND.handle}</div>
    </>
  );
};

/** jump-zoom: every sentence cuts to a new framing, like a jump cut on a talking head */
const ZOOMS = [1.0, 1.16, 1.06, 1.22, 1.1];
const zoomAt = (t: number) => {
  let k = 0;
  SENTS.forEach((s, i) => { if (t >= s.s - 0.05) k = i; });
  return { s: ZOOMS[k % ZOOMS.length], x: ((k * 37) % 5 - 2) * 30, y: ((k * 53) % 3 - 1) * 20 };
};

const End: React.FC = () => {
  const frame = useCurrentFrame();
  const a = fr(VOICE_END + 0.5);
  const o = interpolate(frame, [a, a + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s = interpolate(frame, [a, a + 8], [1.4, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: o, background: `rgba(11,10,13,${0.75 * o})` }}>
      <div style={{ transform: `scale(${s})`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 170, letterSpacing: -6, color: COLORS.ink }}>
          {BRAND.wordmark[0]}<span style={{ color: COLORS.accent, fontStyle: 'italic' }}>{BRAND.wordmark[1]}</span><span style={{ color: COLORS.muted }}>{BRAND.wordmark[2]}</span>
        </div>
        <div style={{ marginTop: 30, display: 'inline-block', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: '#fff', background: COLORS.danger, padding: '18px 44px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 2 }}>▶ subscribe</div>
      </div>
    </AbsoluteFill>
  );
};

const HOT_FRAMES = PAGES.filter((p) => p.w.length === 1 && HOT.has(norm(WORDS[p.w[0]].t))).map((p) => fr(p.s));

const ComfortCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const z = zoomAt(frame / FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ transform: `translate(${z.x}px, ${z.y}px) scale(${z.s})` }}>
        <FlightBed dim={0.12} speed={0.4} boosts={SENTS.map((s) => fr(s.s))} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), transparent 25%, transparent 55%, rgba(0,0,0,0.55))' }} />
      <Captions />
      <Waveform />
      <Chrome />
      <End />
      <Grain opacity={0.06} />
      <Audio src={staticFile(VOICE)} />
      <Audio src={music('lofi-warm')} volume={(f) => duckedMusic(f, 0.14, 0.38)} />
      {HOT_FRAMES.map((h, i) => <Sfx key={i} at={h - 2} name="pop-reveal" gainDb={-12} />)}
      {[5, 13].map((si) => <Sfx key={si} at={sf0(si) - 8} name="whoosh-soft" gainDb={-10} />)}
      <Sfx at={fr(VOICE_END + 0.5)} name="impact-soft" gainDb={-8} />
    </AbsoluteFill>
  );
};
export default ComfortCaptions;
