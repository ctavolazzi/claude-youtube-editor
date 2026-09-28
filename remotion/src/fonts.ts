// Brand 3-font system, loaded from Google Fonts (bundled by Remotion at render time).
// Nothing to install. `/brand-setup` rewrites this file alongside brand.ts and brand.md;
// keep all three in sync if you edit by hand.
//
//   DISPLAY  Fraunces      a soft, literary serif: the voice of an essay, not a SaaS page
//   BODY     Inter Tight   dense, neutral grotesk for labels, lower thirds, UI
//   MONO     Courier Prime the beeplumbgh.net terminal (Courier throughout): citations, timestamps
import { loadFont as loadDisplay } from '@remotion/google-fonts/Fraunces';
import { loadFont as loadBody } from '@remotion/google-fonts/InterTight';
import { loadFont as loadMono } from '@remotion/google-fonts/CourierPrime';
import { loadFont as loadSerif } from '@remotion/google-fonts/Spectral';

export const FONT_DISPLAY = loadDisplay('normal', { weights: ['400', '600', '700', '900'], subsets: ['latin'] }).fontFamily;
// italic cut of the display face, for pull quotes (same family name, italic style)
loadDisplay('italic', { weights: ['400', '600'], subsets: ['latin'] });
export const FONT_BODY = loadBody('normal', { weights: ['400', '500', '600', '800'], subsets: ['latin'] }).fontFamily;
export const FONT_MONO = loadMono('normal', { weights: ['400', '700'], subsets: ['latin'] }).fontFamily;
// serif for the Claude Code wordmark clone in the example shots; not a brand font
export const FONT_SERIF = loadSerif('normal', { weights: ['500', '600'], subsets: ['latin'] }).fontFamily;
