# beeplumb-01-blank-canvas

Beeplumb's first video: why the channel exists. About 4:10, faceless, hosted by the plum-bee
mascot, and made with **no paid APIs and no footage**. Everything below runs locally on CPU.

## The pipeline (script to MP4)

```
script/vo.json ──> tools/gen_vo_local.py ──> vo.wav + vo-timing.json + vo-mouth.json
                                                        │
remotion/src/shots/beeplumb-01-blank-canvas/*.tsx <─────┘  scenes keyed to line + word ids
                                                        │
                        remotion render ────────────────┴──> out/BlankCanvas.mp4
```

1. **Script** in `script/vo.json`: one entry per spoken line, grouped into beats. `{bleep:word}`
   swaps a word for a censor bleep, and `pause_before` stretches a gap. `script/script.md` is the
   same script, generated so it's easy to read.
2. **Voice** with `tools/gen_vo_local.py`, using Kokoro-82M (Apache-2.0) on CPU, about 2.5 minutes
   for this video. It writes the voiceover, per-word timings for captions and cues, and a
   per-frame mouth track for the mascot's lip-sync.
3. **Visuals** in `remotion/src/shots/beeplumb-01-blank-canvas/`. Every scene starts on a VO line
   and reveals on specific words (`W('ai-4', 'bonfire')`), so a new voice or an edited line
   re-syncs the whole video on its own.
4. **Render** from the standalone entry (only this composition, fonts bundled locally).

## Commands (repo root, venv active)

```bash
python tools/fetch_kokoro.py                                    # once: the voice model, via npm
python tools/gen_vo_local.py videos/beeplumb-01-blank-canvas/script/vo.json --audition   # hear voices
python tools/gen_vo_local.py videos/beeplumb-01-blank-canvas/script/vo.json              # the VO
cd remotion
npx remotion studio src/blank-canvas-entry.tsx --public-dir=../media                     # preview
npx remotion render src/blank-canvas-entry.tsx BlankCanvas out/BlankCanvas.mp4 --public-dir=../media
# master for upload: loudness to YouTube's -14 LUFS, video stream copied untouched
ffmpeg -i out/BlankCanvas.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k out/BlankCanvas-final.mp4
```

The raw render lands around -22 LUFS, which is quiet next to other videos, so don't skip the last
step. (Two-pass loudnorm is a little more precise; the one-pass line above is fine for this.)

After regenerating the VO, update `durationInSeconds` in `BlankCanvas.tsx` to the new
`vo-timing.json` duration. The standalone entry reads the duration from the JSON directly, so
this only matters for the shared registry.

**Change the voice:** listen to `media/projects/beeplumb-01-blank-canvas/vo/voice-audition.wav`,
set `"voice"` in `vo.json` (for example `af_heart`, `am_fenrir` or `bm_george`), then re-run the
VO step.

## What's in the video

| Beat | What's on screen |
|---|---|
| The waffling | Calendar flipping SAT/SUN, handle / trend / "beat that guy" cards crossed out, a YOUTUBE PHRASE DETECTED siren |
| What I know | Checklist, "YOU. not an audience", a feed that zooms out to the whole internet, "LUCKY." |
| The name | A drain spiral into the BEEPLUMB wordmark, dictionary definitions with a plumb bob, **the mascot reveal**, the 77,000-follower old account (name blurred), blank canvas vs painted canvas |
| The plan | The mascot hopping through a placeholder platformer, a devlog, a globe, real beeplumbgh.net screenshots |
| The AI part | Glitch "AI.", hater comments, $3.14 balance plus a bleep, $1,000 on fire, before/after using the Beeplumb explainer as B-roll, the meta reveal (this voice = AI, these graphics = code) |
| The why | Buy land, close old storylines, a loan form stamped NOPE, a game-by-game roadmap |
| The silly part | Stories to agenda, the pile-on (goes grayscale), SERIOUS (the music cuts out), then confetti and the mascot |
| Outro | The first brush stroke, the wordmark, "next up: the game" |

## To do before publishing

- **The "it's just storytelling" clip.** `silly-1` shows a labeled placeholder. Put the clip at
  `media/projects/beeplumb-01-blank-canvas/broll/storytelling.mp4` and set `STORY_CLIP` in
  `ScenesC.tsx`. Keep it short and credit the creator, since it's their footage.
- **Pick the voice.** `am_michael` is the default. The audition file has 8 options.
- **The game window is a mockup.** Swap in real footage once the game exists.
- **Your own talking head, optionally.** The scenes leave room for a face-cam; the mascot hosts
  for now.
- Two words are bleeped on purpose (ad-friendlier, and funnier). Remove `{bleep:...}` to un-bleep.

## Media (git-ignored where heavy)

- `media/projects/beeplumb-01-blank-canvas/vo/`: generated audio (git-ignored, rebuilt by step 2)
- `media/projects/beeplumb-01-blank-canvas/shots/`: beeplumbgh.net screenshots (captured locally with Playwright)
- `media/projects/beeplumb-01-blank-canvas/broll/`: B-roll (git-ignored)
- `media/projects/beeplumb-01-blank-canvas/fonts/`: Rubik (variable), Courier Prime, VT323 (all OFL). They're inlined into
  `fonts.gen.ts` with `python tools/embed_fonts.py <fonts-dir> <out.ts>`, so renders never fetch them.
