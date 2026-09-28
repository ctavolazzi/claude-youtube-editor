# Packaging: Beeplumb #1, "the blank canvas"

**Mode: cold start.** There's no channel CTR data yet, so everything here is an uncalibrated
default. Start logging each video's Studio CTR from this one on. Once you have about 10 long-form
videos, run `.claude/skills/packaging/references/channel-calibration.md` and let your numbers
override these rules.

## Gates

- **Topic ceiling: NARROW.** This is a personal channel-launch video. It rides no search wave, so
  views are capped by demand however good the packaging is. It's still worth making: it's the
  anchor that every future video can link back to ("why this channel exists").
- **Promise:** a broke creator starting a YouTube channel from zero, using AI to do it.

## Title (fixed across all three thumbnails)

**Starting a YouTube Channel From Zero With AI (While Broke)**

- *Implied expectation:* why and how someone with no money and no audience starts a channel,
  using AI. The video pays it off: the waffling, the fresh start, $100/mo, and "this voice is AI".
- It keeps "Beeplumb" out of the title (the self-brand rule: an unknown name rides no discovery
  wave). The name goes on the thumbnails and in the video instead.
- Checklist: concrete ("From Zero"), authenticity rider ("While Broke"), known noun ("AI"), no
  negative framing. The rule it bends is magnet words: there's no Free, Unlimited or 100%. That's
  honest for a story video, which doesn't promise a free tool.

## Thumbnail bets (A/B/C for Test & Compare)

| | Hook | Lever | Combines with the title as | Honesty check |
|---|---|---|---|---|
| **A** | `77K → 0`, mascot shocked, red/orange burst | Number lead | "From Zero": *what* got left behind | The video says it: 77,000 followers under another name, left for a fresh start (0:56 chapter) |
| **B** | `$100 /MONTH`, mascot happy, yellow burst | Price lead | "While Broke": the whole budget | The video says it: $100/mo for Claude vs $1,000 for an artist (2:06 chapter) |
| **C** | `DAY 1`, a blank canvas with one brush stroke, violet/cyan | Object / own-metaphor lead | "From Zero": the first stroke | The video's spine: blank canvas, "the first brush stroke" outro |

The mascot stands in for a face. There's no face kit in `media/library/faces/`, and a big,
expressive character is the same lever as a big expressive face. If you add a face kit later, a
face-plus-mascot version of the winner is the obvious next test.

**Prediction, not a verdict:** A is my guess for the highest CTR (a specific big number, a
shocked face, a red frame). The test decides.

## Rendering

The thumbnails are Remotion stills (`remotion/src/shots/beeplumb-01-blank-canvas/Thumbnails.tsx`)
using the exact mascot from the video. No API key, fully offline, and re-renderable:

```bash
cd remotion
for t in A B C; do
  npx remotion still src/blank-canvas-thumbs-entry.tsx Thumb$t ../videos/beeplumb-01-blank-canvas/packaging/thumbs/$t.jpg \
    --frame=20 --image-format=jpeg --jpeg-quality=92 --public-dir=../media
done
```

The output is 1280x720 JPG at about 115 KB each (YouTube's limit is 2 MB). The JPGs are
git-ignored like all rendered thumbnails. The TSX is the source.

## Verify (all three passed)

Text spelled right and legible at phone size (320px wide) · one dominant hook · bright, saturated,
positive · no stray lettering beyond the small BEEPLUMB corner mark · on-theme and family-friendly ·
16:9, ≥1280px, <2 MB.
