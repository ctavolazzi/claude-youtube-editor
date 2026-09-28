# beeplumb-explainer: faceless Beeplumb explainer

**Runtime:** 62s · 1920x1080 @ 30fps · no footage, no voiceover (on-screen text carries it)
**Brand:** the beeplumbgh.net look (dark terminal, VT323 + Courier Prime, CRT scanlines, plum /
pink / yellow / cyan / DOS green), defined locally in the shot, not the repo's long-form brand.
**Source of truth:** every claim on screen comes from the beeplumb repo README (v0.0.1).

| # | Frames | Beat | On screen |
|---|---|---|---|
| 1 | 0-150 | Hook | `> can an AI run a whole campaign?` typed out |
| 2 | 150-330 | Answer keys leak | MMLU / HumanEval / GSM8K scores climb, stamped IN THE TRAINING SET |
| 3 | 330-540 | Rules vs situations | Rules are contaminated and that's fine; turn 40 board state is not |
| 4 | 540-870 | Referee is code | `cupel.exe` rejects move 40 ft on speed 30; same state, same ruling, any machine |
| 5 | 870-1260 | The refinery | lode, furnace, assay, yield, field, with their equipment names |
| 6 | 1260-1560 | Rating | Glicko-2 board re-sorts on rating minus 2 deviations (illustrative numbers) |
| 7 | 1560-1740 | Status | 138 tests, 309 atoms, 39 built; rules engine and match runner not started |
| 8 | 1740-1860 | End card | BEEPLUMB, beeplumbgh.net, @beeplumbgh, Johnny Autoseed LLC |

**Sound:** `tech-pulse` music bed + library SFX (typing, glitch-zap, stamp-hit, whooshes, chess
capture, riser, deep impact). All from `media/library/`, nothing generated.

## Render

```
cd remotion
npx remotion render src/beeplumb-entry.tsx BeeplumbExplainer out/BeeplumbExplainer.mp4 --public-dir=../media
```

`src/beeplumb-entry.tsx` registers only this composition, and the fonts ship in
`media/projects/beeplumb-explainer/fonts/`, so the render makes no network font requests.

## Before publishing

- The status numbers (138 tests, 309 atoms, 39 built) are from the README at v0.0.1. Re-check them
  against `python3 -m pytest` and the registry if the repo has moved on.
- The rating rows are illustrative, and the caption says so. Swap in real match data once the
  match runner exists.
