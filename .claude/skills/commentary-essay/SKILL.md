---
name: commentary-essay
description: Produce a beeplumbgh commentary video end to end: a voiceover essay (commentary, philosophy of modern life, strategies for navigating it) over a constant game-footage background, with motion-graphic beats, cited sources, framed fair-use clips and quote cards. Use when the user wants to make, plan, script-mark, source, or assemble one of these videos, "do the essay format", "put this over gameplay", "pull a clip from X and respond to it", "screenshot this article for the video", pick a gameplay bed, or turn a script into beats. Orchestrates the existing steps (clean-cut, clean-audio, make-tsx, suggest-sfx, packaging) with the commentary kit in remotion/src/lib/commentary.tsx and tools/grab_source.py. Not for talking-head tutorials (that is the default make-tsx flow) and not for thumbnails alone (that is /thumbnail).
---

# Commentary essay

Read first: `brand.md` (§6 is the kinetic motion language and the beat grammar), `docs/COMMENTARY.md`
(format + fair-use rules), `remotion/src/lib/kinetic.tsx` (slams, camera, transitions, annotations,
SFX) and `remotion/src/lib/commentary.tsx` (bed + cards). **`KineticReel` in
`remotion/src/shots/beeplumb/` is the reference for energy and pacing; match it, don't regress to
calm fades.** The `Essay*` shots are the component catalog.

**Approved default (owner feedback 2026-09-28): the KINETIC style.** Of three cuts of one recording (kinetic, archival, captions), the owner picked kinetic. `remotion/src/shots/demo-comfort-trap/ComfortKinetic.tsx` is the template for a voice-driven video: copy it, regenerate `_data.ts` from the new transcript, re-map the scenes to the new sentences. Archival and captions stay available only on request.

## 1. Script → beat sheet

From `videos/<p>/script/script.md`, produce `videos/<p>/work/beats.json`: one entry per tagged beat
(`thesis`, `chapter`, `quote`, `source`, `clip`, `term`, `stat`, `versus`, `lower-third`) with
the exact narration line it lands on. If the script has no tags, propose them and get a yes.

Density: a card every **8 to 20 seconds** of narration on average. Long stretches of bare gameplay
under a strong voice are good; wall-to-wall cards are not. Every chapter opens with a `ChapterCard`.

## 2. Verify every claim before it becomes a card (hard gate)

- **Quotes:** confirm wording AND attribution against a primary or reputable source (WebSearch /
  WebFetch). Misattributed quotes are the #1 credibility killer for this genre. If it can't be
  verified, say so and cut it or mark it "attributed to".
- **Stats:** a `StatCallout` needs a source you actually opened. No source, no stat.
- **Sources:** capture the real page (`grab_source.py page`), never a mock of a real outlet.

## 3. Gather media

```bash
python tools/grab_source.py clip  <url> --project videos/<p> --start 1:12 --end 1:20 --why "..."
python tools/grab_source.py page  <url> --project videos/<p> --name <slug> --why "..."
python tools/grab_source.py image <src> --project videos/<p> --credit "..." --why "..."
python tools/grab_source.py list  --project videos/<p>
```

Enforce `docs/COMMENTARY.md` rules: short excerpts, a real `--why`, no copyrighted music, no clip as
a bed. Pick beds from `media/library/gameplay/catalog.json` by chapter mood; if none fits, ask the
user to record one (say what: game, action, mood, length).

## 4. Build the beats

Follow `/make-tsx` for orchestration (timeline.json, word sync, render, verify, bake) and
`/vidtsx-2d-generator` for crash-free TSX, using the commentary kit:

- Cards → `cutaway` spans, built in `<Stage bed={{ src: staticFile('library/gameplay/...'), startFrom }}>`
  with `startFrom` matching where the master's bed is at that moment, so the background never
  jumps when the card cuts in. (Or render cards as `transparent: true` with `<Stage bed="none" scrim={0.55}>`
  as `overlay` spans; this is simpler and guarantees continuity. Prefer it.)
- `LowerThird`, `GameCredit` → `overlay` spans (`transparent: true`, `bed="none"`, `finish={false}`).
- Sync `ThesisCard` words with `wordAt` from `edited-transcript.json` word times.
- `ClipFrame` audio plays; the voice must be silent across it in the cut.

QA: render stills and READ them. Check text never sits on a busy HUD corner, every clip and source
is credited on screen, and there are no em dashes in on-screen text.

## 5. Finish

`/suggest-sfx` (brand §10: sparse; tape-stop before clips), final mix, `/packaging` (paste
`grab_source.py credits` into the description), `tools/yt_upload.py`.
