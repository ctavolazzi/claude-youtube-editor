# The beeplumbgh format: commentary over gameplay

Voiceover essays (commentary, philosophy of modern life, strategies for moving through it) over a
**constant game-footage background**. This doc is the production reference; `brand.md` is the look;
`/commentary-essay` is the skill that runs it end to end.

## The stack of a frame

```
 ┌──────────────────────────────────────────────┐
 │ finish: grain + scanlines + vignette          │  Stage (every shot)
 │ beat: ThesisCard / QuoteCard / SourceCard ... │  lib/commentary.tsx
 │ scrim: night @ ~55% + plum/honey cast         │  GameplayBed / Scrim
 │ bed: one continuous gameplay take, desat 35%  │  media/library/gameplay/
 └──────────────────────────────────────────────┘
 audio: voice (spine) · clip audio when quoting · SFX · music bed (final mix)
```

## Gameplay beds

- Reusable takes live in `media/library/gameplay/` (git-ignored video, committed `catalog.json`).
  Log each take: game, what's happening, mood, length, whether the HUD is on.
- **Record beds long and calm**: traversal, driving, flying, walking a city, idle fishing. 10 to 30
  minutes per take. Combat and menus fight the words; save them for moments where the essay is
  literally about the thing on screen.
- **Match mood to the chapter**, not the sentence: a chapter about isolation rides alone through
  empty land; a chapter about noise walks a crowded city. Change the bed at chapter breaks only.
- Turn the HUD off in the game's settings when you can. Capture 1080p60 or 1440p60.
- Publisher policies: most publishers explicitly allow monetized gameplay videos with commentary
  (Nintendo, Sony first-party, Xbox Game Studios, most indies publish a video policy). Check the
  game's policy before you build a video on it, and note it in the catalog entry.

## Third-party media: fair use, done carefully

Fair use (US, 17 U.S.C. §107) weighs four things: the **purpose** (commentary and criticism are
favored, especially when transformative), the **nature** of the work, the **amount** taken, and
the **market effect**. It is a defense, decided case by case, not a permission slip. This is not
legal advice; it is the house discipline that keeps us on the defensible side:

1. **Comment on it, don't just show it.** Every clip and screenshot must be something the narration
   is ABOUT: responding, critiquing, analysing, or evidencing a claim. `grab_source.py` makes you
   write the `--why` before it downloads anything.
2. **Take the least that makes the point.** Clips: a few seconds, usually under 15s (the tool warns),
   never over 30s without a reason in the ledger. Never the "heart" of a work (the punchline, the
   reveal, the song's hook).
3. **Frame it as a quotation.** `ClipFrame` and `SourceCard` are always windowed, tagged
   (CLIP / SOURCE) and credited on screen. Never full-bleed, never looped as decoration.
4. **Credit it twice:** on screen, and in the description (`grab_source.py credits`).
5. **Music is the exception you avoid.** Copyrighted music triggers Content ID almost instantly
   regardless of fair use. Mute clip music, or pick another clip.
6. **Never reupload whole things,** never use a clip as the gameplay bed, never use someone's
   thumbnail or face as your thumbnail.
7. **Content ID claims happen anyway.** A claim is not a ruling. Dispute with the `why` from the
   ledger when the use is genuinely commentary; if the dispute is about a long or uncommented
   excerpt, cut it instead.

Screenshots of articles, posts and papers follow the same rules (show the line you're discussing,
highlight it, cite outlet + date + URL).

## Workflow

1. **Script** in `videos/<p>/script/script.md`: thesis first, then 3 to 6 chapters, each with its
   trap and its move. Mark every beat inline: `[THESIS]`, `[CH 2: title]`, `[QUOTE: author]`,
   `[SOURCE: url]`, `[CLIP: url 1:12-1:20]`, `[TERM]`, `[STAT: source]`, `[VS]`.
2. **Record the voice** (a decent mic, a quiet room) and **record the beds**.
3. **Cut the voice**: `/clean-cut` on the voice recording (free local path: `transcribe_local.py --align`
   → `auto_cut.py` first pass → your judgment on retakes), then `/clean-audio` (`--method deepfilter` first).
4. **Gather sources**: `python tools/grab_source.py clip|page|image ... --project videos/<p>` for every
   `[CLIP]` and `[SOURCE]` tag. The ledger fills itself.
5. **Build the master**: lay the gameplay bed under the cut voice (one take per chapter).
6. **Build the beats**: `/make-tsx` with the commentary kit; each tag becomes a shot in
   `remotion/src/shots/<p>/`, word-synced to `edited-transcript.json`.
7. **Music + SFX**: pick the bed FIRST (it sets the cut grid), generated locally with
   `tools/gen_music_local.py`; then `/suggest-sfx`. **Packaging** (`/packaging`, description gets the credits block),
   **upload** (`tools/yt_upload.py`).

## Try it with no footage

```bash
cd remotion && npm run studio        # open the beeplumb/ group: Essay* shots
npx remotion render src/index.ts EssayReel out/EssayReel.mp4
```

Every commentary shot renders over a procedural placeholder bed until you give it real gameplay:
`<Stage bed={{ src: staticFile('library/gameplay/<take>.mp4'), startFrom: 60 * 90 }}>`.
