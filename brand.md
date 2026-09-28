# Brand: beeplumbgh

> Style contract for every long-form video this repo produces. Every step-2+ skill (TSX overlays,
> full-screen beats, diagrams, SFX) reads this file so all videos feel like one channel.
> `remotion/src/brand.ts` + `remotion/src/fonts.ts` are the same contract as code; change all three
> together (or run `/brand-setup`).
>
> **The channel:** commentary on modern life, the philosophy of living in it, and practical
> strategies for moving through it, voiced over a **constant game-footage background**. Think video
> essay, not tutorial. The site (beeplumbgh.net) is a black terminal in Courier with honey and plum;
> the videos are its cinematic cousin.

## 1. Identity & voice

- **Positioning:** a late-night video essay. Dark, literary, a little conspiratorial, never doom.
  The game is the room we are sitting in while we talk; the words are the point.
- **Voice:** direct, curious, specific. Earn every claim: a quote has an author, a number has a
  source, a clip is credited on screen. Name the trap, then give the move. **On-screen text never
  uses em dashes.**
- **Energy:** HOT. Kinetic type, a moving camera, cuts on the beat. The essay is thoughtful; the
  edit is not sleepy. (A calm first pass was rejected as boring: see §6.) Quiet moments are allowed
  as deliberate contrast, never as the default.

## 2. Logo / wordmark

- **Wordmark:** `bee` + *`plumb`* + `gh` (`BRAND.wordmark = ['bee','plumb','gh']`). Fraunces Black;
  the middle word in honey italic, `gh` in muted. "Plumb": to test a thing against true.
- **Sign-off:** "Measure it true." · **Handle:** @beeplumbgh · **Site:** beeplumbgh.net
- **Signature motif: the plumb line.** A thin honey thread drops from the top edge and a bob
  settles (`PlumbLine` in `remotion/src/lib/commentary.tsx`). It marks theses, chapter breaks and
  the end card. Use it on those beats only, so it keeps meaning something.

## 3. Color palette (exact hex)

Dark base. Role names are the house template's, so read them by role: `paper` is the base surface
(near-black), `ink` is primary text (bone).

| Role | Name | Hex | Use in video |
|---|---|---|---|
| **Primary accent** | honey (the bee) | `#F5C518` | key words, marker sweeps, the wordmark middle, plumb line |
| Secondary accent | plum (the plum) | `#B06EE0` | chapter numerals, quote marks, secondary emphasis |
| Positive / strategy | cyan-teal | `#3FD0C9` | "the move", the strategy side of a contrast, confirms |
| Positive alt | terminal green | `#00CC44` | companion to cyan, terminal nods |
| Attention | ember | `#FF8A3D` | "watch this", warnings, gradient midpoint |
| Negative / trap | hot pink | `#EE4A90` | the trap, the cost, CLIP tags |
| Ink (text) | bone | `#EDE8DC` | primary text |
| Muted text | ash | `#9E97AB` | citations, secondary labels |
| Surface (base) | night | `#0B0A0D` | full-screen base, scrim color over gameplay |
| Surface 2 (raised) | dusk | `#17141C` | quote plates, cards |
| Rule | line | `#2E2837` | 1px borders and dividers |

**Contrast (measured):** ink/paper 16.2:1 · muted/paper 7.0:1 · muted/cream 6.5:1 ·
accent/paper 12.1:1 · paper-on-accent (pills) 12.1:1 · plum/paper 5.8:1 · pink/paper 5.7:1.
Everything clears its gate; plum and pink are for large type and tags, not small body copy.

**Dark UI / terminal scale** (GitHub-ink, for terminal and code mockups):
`#0d1117` · `#161b22` · `#30363d` · `#8b949e` · `#c9d1d9`.

**Signature gradient:** honey → ember → plum (`#F5C518 → #FF8A3D → #B06EE0`). Chapter rules and the
end-card underline. Never as a full-screen fill: the gameplay is the background.

## 4. Typography (3-font system)

| Role | Font | Weights | Use |
|---|---|---|---|
| **Display** | **Fraunces** (+ italic) | 400 / 600 / 700 / 900 | theses, chapter titles, pull quotes (italic), the wordmark, big numbers |
| **Body / UI** | **Inter Tight** | 400 / 500 / 600 / 800 | subtitles, lower-third detail, definitions |
| **Mono** | **Courier Prime** | 400 / 700 | citations, tags, timestamps, URLs: the beeplumbgh.net terminal |

All load from `@remotion/google-fonts` (`remotion/src/fonts.ts`). Display tracks tight (−1 to −3px
at size); mono tags are UPPERCASE with wide tracking (3px). `FONT_SERIF` (Spectral) stays only for
the Claude Code wordmark clone in the example shots; it is not a brand font.

## 5. Shape & depth

- **Radius:** 10px cards, 8px panels and windows, pills round. Editorial, not bubbly.
- **Depth:** deep shadow plus a faint bone rim (`SHADOW.card`), because soft grey shadows vanish on a
  dark base. Cards sit on a `cream` plate at ~90% opacity so the game still breathes through.
- **Finish on every frame:** animated film grain (~9%) + faint CRT scanlines (~7%) + vignette. This
  is what makes different games look like one channel. `Stage` applies it.
- **Framing of third-party media:** clips and screenshots are ALWAYS framed (window, tag, credit
  line), never full-bleed. Framing is part of the fair-use posture (it reads as quotation) and part
  of the look.

## 6. Motion language: kinetic, cut to the music

Remotion, 60fps. The reference is `KineticReel` (`remotion/src/shots/beeplumb/`), built from
`remotion/src/lib/kinetic.tsx` on top of the cards in `lib/commentary.tsx`.

- **Cut to the music.** Pick the track first and find its grid: at 120 BPM a beat is 30 frames and a
  bar is 120 (`beat(n)` / `bar(n)`). Scene changes land on bars, slams land on beats. With a voice,
  the voice wins: cut on its sentence boundaries, slam on its stressed words, and nudge to the
  nearest beat when it is within ~4 frames.
- **The bed never stops,** and it moves: forward motion, banking, a speed surge on every scene cut.
  Real gameplay gets the same treatment (push-in, desaturate ~35%, darken ~30 to 55%).
- **Type slams.** Words arrive big and blurred and snap to size with overshoot (`Slam`, `SlamLine`),
  one word or phrase per beat. Two voices of type: **INTER TIGHT 800 CAPS** for the shout, *Fraunces
  Black Italic* for the thought. The key word goes honey, oversized, with a hit.
- **The camera is alive.** Constant slow 3D drift, a punch-in (+7%) and a short shake on every hero
  hit (`Camera`). Flash frame on the 3 to 5 biggest hits.
- **Transitions have direction:** whip with directional motion blur (default), whip-up for
  lists/numbers, zoom-through into chapter cards, RGB glitch into titles and clips. Scenes overlap by
  5 frames so the whips cross. No plain crossfades.
- **Annotate like a person:** hand-drawn circles, underlines, arrows, crosses and checks that draw
  themselves on (`Scribble`); rubber stamps (`Stamp`) for SOURCE / CITED / dates; tape and halftone
  on source screenshots; typewriter mono for citations (`Typed`).
- **Finish:** letterbox bars, grain, faint scanlines, vignette on every frame.
- **Pacing:** a new visual idea every 2 to 4 seconds in the hook, every 4 to 8 in the body. If a card
  holds longer than 8 seconds, something on it must still be moving or arriving.
- **Never:** crossfades as the default, bouncy cartoon easing on body text, more than one glitch
  transition in a row, glitch over a line that needs to be read.

**The beat grammar** (all in `remotion/src/lib/commentary.tsx`):

| Beat | Component | When |
|---|---|---|
| Thesis | `ThesisCard` | the claim of the video, or of a chapter |
| Chapter break | `ChapterCard` | every act; 3 to 6 per video |
| Pull quote | `QuoteCard` | someone said it better; always author + work + year |
| Cited source | `SourceCard` | an article, paper, post or chart; screenshot + outlet + URL, highlight the line |
| Quoted clip | `ClipFrame` | a short excerpt you are responding to; credited on screen |
| Coined term | `TermCard` | naming the idea so viewers can carry it out of the video |
| Number | `StatCallout` | a figure with its source line; no source, no stat |
| Trap vs move | `VersusCard` | the strategy beat: what people do vs what to do |
| Name a person / thing | `LowerThird` | alpha overlay, bottom-left |
| What's on screen | `GameCredit` | top-right chip naming the game; on every bed |
| End | `CommentaryEnd` | wordmark, sign-off, next video |

## 7. Video delivery specs

- **Canvas:** 1920×1080 design space, **60 fps**, rendered at scale 2 (4K) by `render-all.mjs`.
  **The fps must match the master** (the gameplay + voiceover export). Game capture is almost always
  60fps; if you capture at 30, change it here and in each shot's `compositionConfig`.
- **The master** for this format is the **gameplay bed with the voiceover mixed in** (no talking
  head required). `/clean-cut` still cuts the VOICE; the gameplay is laid under the cut voice, not cut
  with it.
- **Safe margins:** text ≥ 5% from edges (title-safe ~7.5%). Lower-thirds bottom-left; the
  `GameCredit` chip top-right; keep the game's own HUD corners clear where possible.
- **Two ways to put a beat on screen:** `cutaway` (the shot draws its own bed via `Stage`, full
  frame) or `overlay` (`Stage bed="none"` + `transparent: true`, composited over the master by
  `tools/bake.py`). Prefer overlays for lower-thirds and chips, cutaways for cards.
- **Captions:** burned-in word captions are optional for this format (commentary benefits from them
  on mobile); if used, Inter Tight 800, bone on a night pill, bottom-center, one line.

## 8. Asset & source locations

- Master (example): `videos/video-1/reference/<cut>.mp4` · edited transcript:
  `videos/video-1/work/edited-transcript.json` (word times in the master timeline).
- Reusable brand assets: `media/library/` (typed folders — `logos/ sfx/ music/ faces/` each with an
  index/catalog). Per-video generated assets: `media/projects/<video>/`, referenced from shots as
  `staticFile('projects/<video>/x')`.
- Brand tokens as code: `remotion/src/brand.ts` (keep it in sync with this file).

## 9. Locked decisions & still-open

- **Format = voiceover essay over constant gameplay.** ✓
- **Palette = honey + plum on night**, matching beeplumbgh.net. ✓
- **Type = Fraunces / Inter Tight / Courier Prime.** ✓
- **Motion = kinetic, cut to the music;** slams, whips, camera punches, hand-drawn marks. ✓
- **Third-party media = framed, credited, logged** in `videos/<project>/work/sources.json`
  via `tools/grab_source.py`. See `docs/COMMENTARY.md` for the fair-use rules. ✓
- **Open:** a music bed. Lo-fi / ambient under the voice is the likely call; decide at the final mix.
- **Open:** confirm capture fps (60 assumed) against the first real master.

## 10. Sound design: SFX

The game audio is **muted** under the essay (or ducked to a bed at ~−28 dB if its ambience helps).
A **music bed runs the whole video** and sets the cut grid (§6). SFX are the punctuation: present
and punchy on the hits, still always under the voice.

**Choose every cue by its FUNCTION** (3+1 foundational sounds do the heavy lifting):

| Function | Sound | Its job | Our sub-types |
|---|---|---|---|
| **Motion** | whoosh | carry one idea into the next | `whoosh-soft` (card in), `whoosh-wind` (chapter break) |
| **Tension** | riser | "something is coming" | `riser-soft` (only before a thesis or chapter reveal) |
| **Emphasis** | impact | "this moment matters" | `impact-deep-soft` (thesis landing, chapter numeral), `impact-soft` |
| **Snap** | click / type | small, precise, alive | `ui-click-soft` (marker sweep, tag), typewriter tick for mono citations |

Plus the brand extras: a low **tape-stop / VHS rewind** before a quoted clip (the "we're quoting
someone" signal), and a soft **film-projector click** on source cards.

- **Taste:** punchy on hits, quiet everywhere else. Nothing louder than the voice. Every whip gets a
  whoosh, every slam of a hero word gets an impact, every stamp gets a stamp hit, every glitch gets a
  zap. Decorative motion gets nothing.
- **Layer for the hero moments** (riser → glitch → impact into the title; whoosh → impact on the
  biggest reveal). About one layered moment per chapter.
- **Density:** one cue per beat, on the beat's signature moment. A card cascade gets one sound, not
  one per card.
- **Never:** ambient texture under speech, glitch/static under narration, meme booms (this channel
  doesn't do them), trailer slams, a whoosh on every card.
- **Clip audio:** a `ClipFrame` plays its own audio; the voice stops for it. Duck any bed fully
  during a clip.
- **Levels.** Library clips are normalized to **~−20 LUFS**, −1.5 dBFS peak. Voice ~−17 LUFS. Gains:
  **payoffs ~−6 · transitions ~−8 · bed/texture ~−11.** Light sidechain duck (~4 dB) under the voice.
- **Signature motif:** the plumb-line drop gets the same soft low `impact-deep-soft` every time it
  appears, so it becomes the channel's sound.
- **Source.** ElevenLabs Sound Effects API is primary; curated royalty-free is the fallback. Every
  clip's `source` + `license` is in the catalog.
- **Music.** Chosen FIRST, because it sets the cut grid; mixed at the final-mix step
  (`tools/gen_music.py` + `tools/mix_music.py`). Driving, mid-tempo (100 to 130 BPM), no vocals. The
  existing `media/library/music/` tracks were generated on the template author's ElevenLabs account;
  generate your own with `tools/gen_music.py` before publishing.
- **Library is the durable asset:** `media/library/sfx/` (`catalog.json` + `clips/`). Reuse first.
