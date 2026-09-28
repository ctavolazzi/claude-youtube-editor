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

## Thumbnail bets (v2, after the critique)

**A is the final:** set it as the default thumbnail at upload, then add B and C in Test & Compare.

| | Hook | Lever | Combines with the title as | Honesty check |
|---|---|---|---|---|
| **A (final)** | person icon + `77K` struck out → giant `0`, mascot shocked, red/orange | Number lead | "From Zero": what got left behind | Said at 0:56: 77,000 followers on a different account, left for a fresh start. The icon makes it read as followers, not dollars. |
| **B** | `$100 /MONTH`, excited mascot holding up a bill, green | Price lead | "While Broke": the whole budget | Said at 2:06 ($100/mo for Claude vs $1,000 for an artist). It's a short beat, so B is the weakest-kept promise of the three. |
| **C** | `I'M BROKE` + a censor bar (`#@$%!`), smug mascot, pink/violet | Curiosity (bleep) lead | "While Broke", literally | The video's funniest beat (2:06 chapter). It also signals "not a kids' channel". |

What changed from v1 and why:
- **The number got context.** A bare "77K" could be dollars, so a person icon now does that job without adding words.
- **The drama is the size.** The 0 is now bigger than the 77K, and the 77K is crossed out.
- **The mascot is outlined, with opaque wings,** so it can't blend into any background. On v1's B, its stripes melted into the yellow.
- **B now shows excitement,** an open grin, instead of the flat smile the skill ranks lowest. B also got an object: the bill.
- **C switched from `DAY 1` to the bleep.** "Day 1" is generic and has no stakes, and its canvas read as a whiteboard at phone size.
- **The BEEPLUMB corner mark is gone.** It was unreadable at phone size, so it was clutter.

**The known limit:** there's no human face yet. A cartoon mascot can read as kids' content. C pushes
against that, but the real fix is a face kit (`media/library/faces/`) and a face-plus-mascot
version of A.

**Prediction, not a verdict:** A > C > B. The test decides.

## Rendering

The thumbnails are Remotion stills: `remotion/src/shots/beeplumb-01-blank-canvas/Thumbnails.tsx`,
built on the shared kit `remotion/src/lib/thumbnail.tsx`. No API key, fully offline:

```bash
cd remotion
node scripts/render-thumbs.mjs src/blank-canvas-thumbs-entry.tsx ../videos/beeplumb-01-blank-canvas/packaging/thumbs
```

It writes `A.jpg`, `B.jpg`, `C.jpg`, `final.jpg` (a copy of A) and `feed-check.jpg` (all three at
phone and sidebar size on YouTube's dark feed, with the title). **Read feed-check before
shipping.** In v2 it caught a cropped preview, gray "ghost" wings and a word running into the
mascot. The JPGs are git-ignored; the TSX is the source.

## Verify (all three passed)

Text spelled right and legible at phone size (320px wide) · one dominant hook · bright, saturated,
positive · no stray lettering beyond the small BEEPLUMB corner mark · on-theme and family-friendly ·
16:9, ≥1280px, <2 MB.
