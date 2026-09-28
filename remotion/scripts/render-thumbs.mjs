// Render a video's thumbnails: every Thumb<ID> composition in an entry -> <out>/<ID>.jpg, plus
// ThumbFeed -> <out>/feed-check.jpg (all variants at phone + sidebar size; read it before shipping).
// The first variant is also written as <out>/final.jpg, the one to set as the default at upload.
//
//   node scripts/render-thumbs.mjs <entry.tsx> <out-dir>
//   node scripts/render-thumbs.mjs src/blank-canvas-thumbs-entry.tsx ../videos/beeplumb-01-blank-canvas/packaging/thumbs
//
// Fails if any JPG is over YouTube's 2 MB limit. Set BROWSER_EXECUTABLE to use a local Chromium.
import { bundle } from '@remotion/bundler';
import { getCompositions, renderStill } from '@remotion/renderer';
import { mkdirSync, statSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [entry, outArg] = process.argv.slice(2);
if (!entry || !outArg) {
  console.error('usage: node scripts/render-thumbs.mjs <entry.tsx> <out-dir>');
  process.exit(1);
}
const outDir = path.resolve(process.cwd(), outArg);
mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.BROWSER_EXECUTABLE || undefined;

const serveUrl = await bundle({ entryPoint: path.resolve(root, entry), publicDir: path.join(root, '..', 'media') });
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter((c) => c.id.startsWith('Thumb'));
const variants = comps.filter((c) => c.id !== 'ThumbFeed');
if (!variants.length) throw new Error(`no Thumb<ID> compositions in ${entry}`);

const MAX = 2 * 1024 * 1024;
for (const c of comps) {
  const name = c.id === 'ThumbFeed' ? 'feed-check' : c.id.slice('Thumb'.length);
  const out = path.join(outDir, `${name}.jpg`);
  await renderStill({ serveUrl, composition: c, output: out, frame: 0, imageFormat: 'jpeg', jpegQuality: 92, overwrite: true, browserExecutable });
  const size = statSync(out).size;
  console.log(`${name}.jpg  ${c.width}x${c.height}  ${(size / 1024).toFixed(0)} KB`);
  if (c.id !== 'ThumbFeed' && size > MAX) throw new Error(`${name}.jpg is over YouTube's 2 MB limit`);
}
copyFileSync(path.join(outDir, `${variants[0].id.slice('Thumb'.length)}.jpg`), path.join(outDir, 'final.jpg'));
console.log(`final.jpg = ${variants[0].id} (set it as the default thumbnail at upload; the rest go in Test & Compare)`);
