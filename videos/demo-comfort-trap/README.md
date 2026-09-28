# demo-comfort-trap: one voice, three cuts

The first "cut three styles to one recording" test. The voice is a STAND-IN: `script/script.md`
read by an open-source AI voice (Kokoro, af_heart), because the owner's recording hadn't arrived yet.
Swap in a real recording and the same three shots re-time themselves from the new word timings.

| Cut | Shot | Feel |
|---|---|---|
| A. Kinetic | `remotion/src/shots/demo-comfort-trap/ComfortKinetic.tsx` | slams on every word, whips, camera punches, driving music |
| B. Archival | `.../ComfortArchival.tsx` | black-and-white film, typed paper, carved quote, telegram, intertitles |
| C. Captions | `.../ComfortCaptions.tsx` | full-colour bed, word-by-word captions, hero-word pops, jump zooms, waveform |

Timing spine: `work/edited-transcript.json` (word times, PocketSphinx forced alignment of the known
script) + `work/sentences.json`, compiled into `remotion/src/shots/demo-comfort-trap/_data.ts`.
Voice audio (git-ignored): `media/projects/demo-comfort-trap/voice.wav`.
Music in all three is the template's demo beds: fine for review, not for publishing.
