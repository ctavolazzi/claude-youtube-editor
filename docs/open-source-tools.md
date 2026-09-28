# Open-source tools for this pipeline

Research date: 2026-09-28. Scope: free or self-hostable tools that could replace paid APIs
(AssemblyAI, ElevenLabs, Gemini) or add capabilities to the Remotion + Python + ffmpeg pipeline,
for a small, silly, personal channel (game dev devlogs, AI tools and commentary) with a plum-bee
mascot. Target hardware for "CPU" notes: a 4-core Linux box with no GPU.

**Ground rule for licenses:** a monetized YouTube channel is commercial use. Anything marked
non-commercial (NC) below is off-limits for a monetized video, even if it is "free" to download.

How to read "Maturity": what could be confirmed from the project page or search results at
research time. Where recency could not be confirmed, it says so. Star counts and version numbers
are left out unless verified.

---

## Already adopted in this repo

- **Kokoro-82M** runs through `tools/gen_vo_local.py` (the `kokoro-onnx` runtime, no server). The
  model comes from npm via `tools/fetch_kokoro.py`, because Hugging Face is blocked on some
  networks. Use the fp32 weights: the fp16 build returns silence on some sentences on CPU.
- **A TSX/SVG mascot rig** lives in `remotion/src/shots/beeplumb-01-blank-canvas/Mascot.tsx`. Its
  mouth is driven by voiceover loudness per frame. Rhubarb visemes (pick #2) would be the upgrade.
- **Word-highlight captions** are in the same folder (`Captions.tsx`). They're built from the
  VO's word timings rather than `@remotion/captions`.

## Top picks for this pipeline (ranked)

1. **faster-whisper as a local backend for `tools/transcribe.py`.** Word-level timestamps on CPU
   (int8), MIT, and it removes the only paid step that runs on every single video; keep AssemblyAI
   as the fallback for takes where verbatim fillers matter.
2. **A TSX/SVG mascot rig plus Rhubarb Lip Sync.** Draw the plum-bee as SVG parts in a Remotion
   component and drive its mouth from Rhubarb's viseme JSON: zero cost, fully headless, deterministic
   per frame, and it lives in the same `remotion/src/lib/` kit as everything else.
3. **Kokoro-82M (via Kokoro-FastAPI) for the mascot's voice.** Apache-2.0, fast on CPU, and the
   FastAPI wrapper returns word timestamps, so mascot lines sync to captions and mouth shapes without
   a second pass.
4. **Chatterbox (or Pocket TTS on pure CPU) for cloning your own voice.** MIT-licensed zero-shot
   cloning from a few seconds of audio, so pickup lines and fixes can be generated instead of
   re-recorded, which matters when recording time is physically limited.
5. **`@remotion/captions` + `createTikTokStyleCaptions()`.** Animated word-highlight captions built
   from the word timestamps you already have (AssemblyAI or faster-whisper), rendered by the same
   Remotion pass.
6. **auto-editor as a first-pass silence cutter.** Public-domain code, actively released in 2026, and
   it can export a timeline instead of a video, so it can seed `cuts.json` rather than replace
   `/clean-cut`.
7. **Freesound (CC0 filter) + Kenney CC0 audio + YouTube Audio Library.** Free, monetization-safe SFX
   and music that cover most needs before any generation call; Freesound and Openverse have APIs
   the SFX tools can query.
8. **Stable Audio 3 Small SFX for local SFX generation.** Small enough to target laptops, commercial
   use allowed under the Stability Community License (free below $1M revenue), a direct stand-in for
   ElevenLabs sound effects in `gen_sfx.py`.
9. **ACE-Step 1.5 for local music beds.** MIT-licensed code and 2B weights, runs on CPU (slowly), so
   `gen_music.py` can build the music library overnight instead of paying per bed.
10. **rembg with BiRefNet + ffmpeg-normalize.** Free thumbnail cutouts (MIT) and one-command -14 LUFS
    loudness targeting for YouTube; both are small, CPU-friendly utilities.

Honorable mention: YouTube Studio's built-in **Test & Compare** already A/B tests up to 3 titles,
thumbnails, or title+thumbnail combos for free, so no third-party A/B tool is needed.

---

## 1. Local text-to-speech / voiceover

| Tool | License | What it does | CPU (4-core, no GPU)? | Clones voice? | Word timestamps? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|---|---|
| **Kokoro-82M** | Apache-2.0 (weights + code) | Tiny, high-quality TTS with a fixed set of preset voices across several languages | Yes, faster than real time on laptop CPUs | No (preset voices only) | Yes via Kokoro-FastAPI `/dev/captioned_speech` | Widely used; HF model updated Apr 2025, FastAPI wrapper active | Mascot voice and quick narration; run the CPU Docker image, call it from a `gen_vo.py`, write mp3 + word JSON | https://huggingface.co/hexgrad/Kokoro-82M , https://github.com/remsky/Kokoro-FastAPI |
| **Chatterbox** (Resemble AI) | MIT | Zero-shot cloning from ~5 s of audio, emotion "exaggeration" knob; Turbo, Nano (110M, CPU target) and Multilingual V3 variants | Yes; Nano is built for CPU, larger variants run on CPU slowly | Yes | Not built in (re-align with faster-whisper) | Active; HF model updated Jun 2026 | Clone your own voice for pickups/fixes; adds an imperceptible Perth watermark to all output | https://github.com/resemble-ai/chatterbox |
| **Pocket TTS** (Kyutai) | Code MIT; weights CC-BY-4.0 (gated on HF) | 100M-param TTS with voice cloning from a wav, CLI + Python API | Yes, designed for CPU (about 6x real time on an M4 laptop) | Yes (consent required by its usage terms) | Not upstream; a community fork adds them | Released Jan 2026, HF weights updated Sep 2026 | Best pure-CPU cloning option; credit Kyutai for CC-BY | https://github.com/kyutai-labs/pocket-tts , https://huggingface.co/kyutai/pocket-tts |
| **NeuTTS Air** (Neuphonic) | Apache-2.0 (per HF card) | ~0.75B on-device TTS with instant cloning, GGUF builds | Yes (runs real time on CPU per vendor) | Yes | No | HF weights updated Aug 2026 | Alternative CPU cloner; English only | https://huggingface.co/neuphonic/neutts-air |
| **Piper** | Engine GPL-3.0 (`piper1-gpl`); each voice has its own license | Very fast, robotic-to-decent TTS for Home Assistant | Yes, extremely light | No (train your own voice) | No | Active under Open Home Foundation (old rhasspy repo archived Oct 2025) | Scratch VO / placeholder reads; check each voice's MODEL_CARD | https://github.com/OHF-Voice/piper1-gpl |
| **Dia** (Nari Labs) | Apache-2.0 | 1.6B dialogue TTS, multi-speaker in one pass, nonverbals like (laughs) | No, GPU (~10 GB VRAM) | Via audio prompt | No | HF weights last updated Jun 2025 | Fun two-voice skits if you rent a GPU | https://github.com/nari-labs/dia |
| **Orpheus** (Canopy Labs) | Apache-2.0 per HF card (built on Llama 3.2 3B, check Llama terms too) | Emotive LLM-style TTS with tags | No, GPU in practice | Zero-shot claimed | No | Released Mar 2025; no confirmed 2026 activity | Only with a GPU | https://github.com/canopyai/Orpheus-TTS |
| **Sesame CSM-1B** | Apache-2.0 (gated on HF) | Conversational speech model, context-aware | GPU recommended | Via context audio | No | Released Mar 2025 | Low priority for this channel | https://huggingface.co/sesame/csm-1b |
| **StyleTTS 2** | Code MIT; pretrained weights carry disclosure/consent conditions | High-quality single-speaker TTS; Kokoro is built on it | Yes (slow-ish) | Yes | No | Research code, no confirmed 2026 activity | Superseded by Kokoro for this use | https://github.com/yl4579/StyleTTS2 |
| **F5-TTS** | Code MIT; **weights CC-BY-NC-4.0** | Strong zero-shot cloning | GPU recommended | Yes | No | Active | **Not for monetized videos** | https://github.com/SWivid/F5-TTS |
| **XTTS-v2** (Coqui) | **CPML, non-commercial**; library MPL-2.0 (idiap fork) | Multilingual cloning | Slow on CPU | Yes | No | Company closed Jan 2024; fork is maintenance only | **Not for monetized videos** | https://huggingface.co/coqui/XTTS-v2 , https://github.com/idiap/coqui-ai-TTS |

**Timestamps for cloned voices:** none of the cloning models emit word timings, but you already
know the script, so transcribing the generated clip with faster-whisper (`word_timestamps=True`)
gives reliable word times for captions and Rhubarb. **Mascot voice idea:** Kokoro preset voice,
then a small pitch shift plus a light buzz layer in ffmpeg, so the plum-bee sounds like a character
rather than a stock narrator.

---

## 2. Local speech-to-text with word timestamps

| Tool | License | What it does | CPU? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|
| **faster-whisper** | MIT | Whisper on CTranslate2; `word_timestamps=True`, Silero VAD, batched pipeline | Yes, int8 on CPU (large-v3-turbo is the practical size; roughly real time or better on 4 cores, estimate) | Active, the de facto self-hosted Whisper | New backend in `tools/transcribe.py` that writes the same word list shape the cut tools read; seed `initial_prompt` with "um, uh" and the keyterms file to keep fillers and proper nouns | https://github.com/SYSTRAN/faster-whisper |
| **WhisperX** | BSD-2-Clause (pyannote diarization weights are gated, need an HF token) | faster-whisper + wav2vec2 forced alignment for tighter word boundaries, optional diarization | Yes, slower than plain faster-whisper | Widely used; latest release date not confirmed | Use when cut points need sharper word edges than Whisper's own timings | https://github.com/m-bain/whisperX |
| **whisper.cpp** via `@remotion/install-whisper-cpp` | MIT (whisper.cpp); Remotion package under the Remotion license | C++ Whisper; Remotion's package installs it and `toCaptions()` turns output into `Caption[]` | Yes | Active (ggml-org) | Zero-Python caption path directly inside `remotion/` | https://github.com/ggml-org/whisper.cpp , https://www.remotion.dev/docs/install-whisper-cpp/ |
| **Parakeet TDT 0.6B v3** via **onnx-asr** | Weights CC-BY-4.0 (attribution); onnx-asr MIT | NVIDIA ASR with built-in word/segment timestamps from the TDT decoder; English + 24 European languages | Yes via ONNX (`pip install onnx-asr[cpu,hub]`), fast | Model updated Aug 2026; onnx-asr active | Fast second opinion or backup transcript; onnx-asr returns token timestamps you merge into words | https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3 , https://github.com/istupakov/onnx-asr |
| CrisperWhisper | Code MIT; **weights non-commercial** | Verbatim Whisper tuned to keep "um/uh", stutters, with better word timing | GPU preferred | Active | Ideal for filler detection but **not licensable for a monetized channel** without a deal | https://github.com/nyrahealth/CrisperWhisper |

**Caveat that matters for `/clean-cut`:** the current cut policy leans on AssemblyAI's verbatim
fillers. Stock Whisper tends to silently drop "um"/"uh", so a local transcript may show fewer fluff
candidates. Plan: faster-whisper as the default, compare one video's `cuts.json` against the
AssemblyAI version, and keep AssemblyAI for footage where filler removal is the main job.

---

## 3. Auto-editing talking-head footage

| Tool | License | What it does | CPU? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|
| **auto-editor** | Unlicense (public domain) for the repo | Cuts dead space by audio loudness (and motion), margins/padding, exports to Premiere, Resolve, FCP, Shotcut, Kdenlive, or timeline JSON | Yes | Very active: releases in Jul, Aug, Sep 2026 | Run with timeline export, convert its keep ranges into a draft `cuts.json`, then let `/clean-cut` apply content judgment and the editor UI | https://github.com/WyattBlue/auto-editor |
| **tightcut** | MIT | Removes silences and filler words using faster-whisper word timestamps + ffmpeg | Yes (faster-whisper backend) | Small project (a handful of commits) | Reference implementation for a local filler pass; its filler lists are Italian-leaning, adapt them | https://github.com/amireldor/tightcut |
| **video-cleaner** | See repo | Removes long silences and repeated takes using faster-whisper timestamps; outputs video, a JSON EDL and a report | Yes | Small project, activity not confirmed | Idea source for "repeated take" detection | https://github.com/ivar-anon/video-cleaner |
| **unsilence** | MIT | CLI/library that removes or speeds up silent parts | Yes | Recent activity not confirmed | Fallback only | https://github.com/lagmoellertim/unsilence |
| ffmpeg `silencedetect` | LGPL/GPL (ffmpeg) | Prints silence start/end times | Yes | Core ffmpeg | Already available; cheap sanity check for pause lengths in `verify_cut.py` | https://ffmpeg.org/ffmpeg-filters.html#silencedetect |

Recommendation: keep the transcript-driven `/clean-cut` as the brain (it understands bad takes)
and use auto-editor only to pre-mark silences, which saves review time on long raw recordings.

---

## 4. Captions and animated subtitles for Remotion

| Tool | License | What it does | CPU? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|
| **@remotion/captions** | Remotion license (free for individuals and teams up to 3) | `Caption` type, `createTikTokStyleCaptions()` (groups words into pages with per-word timing), `parseSrt()`, `serializeSrt()` | Yes | Maintained with Remotion | Convert `edited-transcript.json` words to `Caption[]`, page them, render a highlight component as an overlay in `timeline.json`; also emit an `.srt` for YouTube upload | https://www.remotion.dev/docs/captions/api |
| **@remotion/install-whisper-cpp** | Remotion license | Installs whisper.cpp + model, `transcribe()`, `toCaptions()` | Yes | Maintained | For clips with no transcript yet (e.g. mascot VO) | https://www.remotion.dev/docs/install-whisper-cpp/ |
| **@remotion/whisper-web** | Remotion license | In-browser Whisper transcription | Yes (slow) | Maintained | Only if you build a browser caption tool | https://www.remotion.dev/docs/captions/transcribing |
| **remotion-dev/template-tiktok** | package.json says UNLICENSED (treat as reference code) | Full example of word-by-word captions from whisper.cpp | Yes | Official template | Read it for the highlight component pattern, then write your own in `src/lib/` | https://github.com/remotion-dev/template-tiktok |
| **pycaps** | Engine MIT, app AGPL-3.0 | Python + CSS animated subtitles with Whisper word timing, burned into video | Yes | Active project | Outside-Remotion option for Shorts that skip the TSX pass | https://github.com/francozanardi/pycaps |

Note on Remotion itself: free for an individual or a team of up to 3, commercial use included
(https://www.remotion.dev/docs/license/faq).

---

## 5. Character animation and the plum-bee mascot

| Tool | License | What it does | Headless render? | CPU? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|---|
| **Hand-built SVG/TSX rig** (recommended) | Your own code and art | Mascot as layered SVG parts (plum body, bee stripes, wings, antennae, eyes, mouth set) animated with `spring()`/`interpolate()` | Yes, it is just a Remotion component | Yes | N/A | `remotion/src/lib/mascot/` with props for pose, expression, `mouthCues`; Claude can author and iterate it like any shot | https://www.remotion.dev/docs/ |
| **Rhubarb Lip Sync** | MIT | CLI: audio (+ optional script text) to mouth-shape cues (6 basic shapes + optional extras), JSON/TSV/XML output; phonetic mode for non-English | Yes (CLI) | Yes | Recent release 1.14.0 (year not confirmed) | Run on each mascot VO clip, save JSON next to the mp3 in `media/projects/<p>/`, the TSX mouth picks the shape for the current frame | https://github.com/DanielSWolf/rhubarb-lip-sync |
| **@remotion/lottie** + lottie-web | Package: Remotion license; lottie-web MIT | Plays Lottie JSON frame-accurately (seeks with `goToAndStop`) | Yes | Yes | Maintained | Good for pre-made reaction loops (wing flaps, sparkles) from LottieFiles | https://www.npmjs.com/package/@remotion/lottie |
| **Glaxnimate** (KDE) | GPL-3.0 (the app; your exported files are yours) | Free vector animation editor that saves Lottie, animated SVG, WebP and more | Desktop app for authoring | Yes | 0.6.0 released 2026-03-01 as a KDE app | Free way to author Lottie mascot loops without After Effects | https://apps.kde.org/glaxnimate/ |
| **@remotion/rive** + Rive runtimes | Runtimes MIT; Remotion package under Remotion license; **editor export reportedly needs the paid Cadet plan (~$9/seat/mo)** | State-machine vector animation, `<RemotionRiveCanvas>` syncs to Remotion time | Yes | Yes | Maintained | Best rigging UX, but costs money to export; could not load rive.app to confirm the free-plan limits | https://www.remotion.dev/docs/rive/ , https://www.spotsaas.com/product/rive/pricing |
| **Inochi2D** | BSD-2-Clause | Open Live2D alternative: Inochi Creator (rigging) + Inochi Session (live face-tracked puppet) | Not directly; record Session output | Yes | Still beta per its own docs | Only if you want a webcam-driven VTuber-style plum-bee; heavier workflow | https://docs.inochi2d.com/en/latest/inochi2d/faq.html |
| **Synfig Studio** | GPL-3.0 | 2D vector animation with bones, has a command-line renderer | Yes (CLI renderer) | Yes | Long-running project; 2026 activity not confirmed | Fallback bone-rigging tool if the SVG rig gets too complex | https://www.synfig.org/ |
| wawa-lipsync | MIT | Real-time browser viseme detection from Web Audio | Real-time, not frame-deterministic | Yes | Active | Poor fit for Remotion renders (use Rhubarb's precomputed cues instead) | https://github.com/wass08/wawa-lipsync |

Avoid: DragonBones (reported abandoned; downloads broken). Spine and Live2D Cubism are paid.

Suggested mascot build: (1) draw the plum-bee once as SVG (or have Gemini/FLUX draft it, then
trace), split into parts; (2) `Mascot.tsx` with `pose`, `expression`, `mouthCues` props and idle
motion (wing buzz, bob); (3) `tools/gen_mascot_vo.py`: Kokoro line, then Rhubarb JSON; (4) a
`MascotPop` shot type in `timeline.json` as an overlay with an SFX cue.

---

## 6. Free stock footage, music and SFX (monetization-safe)

| Source | License | API? | Monetization notes | Pipeline fit | Source URL |
|---|---|---|---|---|---|
| **Pexels** | Pexels License: free commercial use, no attribution required | Yes, free key; default 200 requests/hour, 20,000/month | Safe for monetized videos; do not resell clips as-is | `tools/fetch_stock.py` for b-roll into `media/projects/<p>/` | https://www.pexels.com/api/ , https://www.pexels.com/license/ |
| **Pixabay** | Pixabay Content License | Yes for **images and videos only** (about 100 requests/60 s, cache 24 h); music and SFX are website-only | Some Pixabay music is registered with Content ID; claims can be cleared with the license certificate but may block monetization until released | Video b-roll via API; download music by hand and log the certificate | https://pixabay.com/api/docs/ , https://pixabay.com/service/license-summary/ |
| **Freesound** | Per sound: CC0, CC-BY, or CC-BY-NC | Yes, APIv2; token auth for search + previews, OAuth2 for original files; filter `license:"Creative Commons 0"` | Use only CC0 or CC-BY (credit); **never CC-BY-NC** | Library-first SFX search inside `/suggest-sfx` before generating | https://freesound.org/docs/api/ |
| **Openverse** (WordPress) | Aggregated CC and public-domain images + audio, license per item | Yes, no auth needed for basic use; returns license + attribution text | Filter to commercial-use licenses | One API for CC images and audio (includes Wikimedia, Jamendo, Flickr) | https://openverse.org/about |
| **Wikimedia Commons** | Per file (PD, CC0, CC-BY, CC-BY-SA) | Yes, MediaWiki Action API + license filters in MediaSearch | Check each file; BY-SA share-alike applies to the asset | Historical photos, logos in commentary context | https://commons.wikimedia.org/wiki/Commons:API |
| **NASA Image and Video Library** | Generally not copyrighted in the US | Yes (images-api.nasa.gov) | Commercial use OK if it does not imply NASA endorsement; NASA logos/insignia are not free to use | Space b-roll for AI/tech commentary | https://www.nasa.gov/nasa-brand-center/images-and-media/ |
| **Internet Archive / Prelinger** | Per item; many public domain, some CC | Yes (archive.org advancedsearch/metadata APIs) | Not every Prelinger film is PD; read each item page | Retro footage gags | https://help.archive.org/help/prelinger-archive/ |
| **YouTube Audio Library** | YouTube's own terms; some tracks need attribution | No API | Monetizable on YouTube and not claimed by Content ID; license does not cover re-uploads to TikTok/IG | Default music source, zero risk | https://support.google.com/youtube/answer/3376882 |
| **Kenney** | CC0 | No (direct downloads) | Fully safe, no credit needed | UI blips, game sounds, sprites: perfect for game dev devlogs | https://opengameart.org/content/all-cc0-uploader-kenney |
| **OpenGameArt** | Per asset (CC0, CC-BY, GPL, etc.) | No official API | Filter to CC0/CC-BY | Game-y SFX and loops | https://opengameart.org/ |
| **Incompetech** (Kevin MacLeod) | CC-BY 4.0 | No | Must include the fixed credit line in the description | Comedic cues | https://app.cinevva.com/guides/free-sound-effects-music |

Log every downloaded asset (source URL, license, credit line) in the relevant library `catalog.json`
so `/packaging` can build the description credits automatically.

---

## 7. Local music and SFX generation

| Tool | License | What it does | CPU? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|
| **ACE-Step 1.5** | MIT (code and 2B weights); one secondary source says the XL (4B) weights use a different license, check the XL card | Text-to-music with optional lyrics, fast on GPU, LoRA training on a few songs | Runs on CPU but "significantly slower"; realistic for short instrumental beds in batch | 1.5 released Jan 2026, XL in Apr 2026 | Local backend for `gen_music.py`: generate beds overnight into `media/library/music/` | https://github.com/ace-step/ACE-Step-1.5 |
| **Stable Audio 3 (Small SFX, Medium)** | Stability AI Community License: commercial use free below $1M annual revenue, registration required; gated weights | Small SFX (~0.5B) targets laptops/phones for sound effects; Medium (~1.4 to 2.3B) for music up to ~6 min | Small SFX: plausible on CPU; Medium: GPU recommended | Released May 2026 | Local backend for `gen_sfx.py` (whooshes, pops, buzzes for the mascot) | https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models , https://huggingface.co/stabilityai/stable-audio-3-small-sfx |
| Stable Audio Open 1.0 / Open Small | Stability AI Community License (same terms) | Earlier text-to-audio, up to ~47 s; Small is Arm-CPU optimized | Small: yes | 2024 to 2025 releases | Superseded by Stable Audio 3 Small SFX | https://stability.ai/news-updates/stability-ai-and-arm-release-stable-audio-open-small-enabling-real-world-deployment-for-on-device-audio-control |
| **YuE** | Apache-2.0 | Lyrics-to-full-song with vocals | No, 16 GB+ VRAM minimum | Active (YuE2) | Only with a rented GPU, for a channel theme song | https://github.com/multimodal-art-projection/YuE |
| MusicGen (AudioCraft) | Code MIT; **weights CC-BY-NC-4.0** | Text-to-music | Small model runs on CPU | Weights unchanged since 2023 | **Not for monetized videos** | https://github.com/facebookresearch/audiocraft |
| AudioLDM 2 | **CC-BY-NC-SA-4.0** weights | Text-to-audio/SFX/music | Slow on CPU | Not updated since 2024 | **Not for monetized videos** | https://huggingface.co/cvssp/audioldm2 |
| TangoFlux / Tango 2 | **Non-commercial** (Stability community terms + WavCaps NC data; Tango 2 CC-BY-NC-SA) | Fast text-to-audio | GPU preferred | Research | **Not for monetized videos** | https://github.com/declare-lab/TangoFlux |
| Woosh (Sony AI) | Code MIT/Apache; **weights CC-BY-NC** | SFX foundation model incl. video-to-audio | GPU preferred | Released 2026 | **Not for monetized videos** | https://github.com/SonyResearch/Woosh |

---

## 8. Local image generation and background removal

| Tool | License | What it does | CPU? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|
| **rembg** | MIT (tool); **model weights have their own licenses** | CLI, library, HTTP server for background removal; models include u2net, isnet-anime, BiRefNet variants, bria-rmbg | Yes (onnxruntime) | Active | Cut out faces/mascot art for thumbnails; **pass `-m birefnet-general` (or isnet) explicitly**, because the default bria-rmbg model needs a paid license for commercial use | https://github.com/danielgatis/rembg |
| **BiRefNet** | MIT | High-quality segmentation / matting | Yes (slower than u2net) | HF model updated Feb 2026 | The model to use inside rembg | https://huggingface.co/ZhengPeng7/BiRefNet |
| **stable-diffusion.cpp** | MIT | C/C++ runner for SD, SDXL, FLUX, Qwen-Image, Z-Image, with quantized GGUF | Yes, the realistic way to run image models on CPU (still minutes per image) | Active | Local fallback for thumbnail backgrounds and mascot sketches when Gemini is unavailable | https://github.com/leejet/stable-diffusion.cpp |
| **FLUX.2 [klein] 4B** | Apache-2.0 (the 4B; check other sizes) | Text-to-image and image editing, small enough for local | Via stable-diffusion.cpp, slow | Released 2026 | Best license/size balance for local assets | https://huggingface.co/black-forest-labs/FLUX.2-klein-4B |
| **Z-Image-Turbo** | Apache-2.0 | ~6B fast few-step text-to-image | Via stable-diffusion.cpp, slow | HF updated Jan 2026 | Alternative local generator | https://huggingface.co/Tongyi-MAI/Z-Image-Turbo |
| FLUX.1 [schnell] | Apache-2.0 | 12B few-step text-to-image | Too heavy for 4-core CPU in practice | 2024 | GPU only | https://huggingface.co/black-forest-labs/FLUX.1-schnell |
| SDXL base 1.0 | CreativeML OpenRAIL++-M (commercial OK with use restrictions) | Classic, huge LoRA ecosystem (mascot LoRA possible) | Slow on CPU | 2023, stable | Train a plum-bee LoRA elsewhere, generate poses locally | https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0 |

Thumbnail note: thumbnails need your real face and bold text more than raw generation.
Compositing (rembg cutout + TSX text in a Remotion still) is CPU-cheap and reproducible; keep
generation for backgrounds and mascot poses.

---

## 9. Other video tooling worth knowing

| Tool | License | What it does | CPU? | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|---|
| **ffmpeg `loudnorm`** + **ffmpeg-normalize** | ffmpeg LGPL/GPL; ffmpeg-normalize MIT | EBU R128 two-pass loudness normalization; target about -14 LUFS for YouTube | Yes | Stable | Final-mix step after `mix_sfx.py`/`mix_music.py` | https://pypi.org/project/ffmpeg-normalize/ |
| **pyloudnorm** | MIT | ITU-R BS.1770 loudness meter in Python | Yes | Stable, low churn | Assert LUFS in `verify_cut.py` without shelling out | https://github.com/csteinmetz1/pyloudnorm |
| **DeepFilterNet** | MIT or Apache-2.0 | Full-band (48 kHz) neural noise suppression, `deep-filter` CLI, LADSPA plugin | Yes, real time on CPU | Upstream releases infrequent; could not confirm 2026 activity | Third `--method deepfilter` in `clean_voice.py` for noise RNNoise handles poorly; stronger local stand-in for ElevenLabs Voice Isolator | https://github.com/Rikorose/DeepFilterNet |
| RNNoise (ffmpeg `arnndn`) | BSD-3-Clause | Lightweight noise suppression | Yes | Already in the repo (`tools/models/rnnoise/`) | Keep as the fast default | https://github.com/xiph/rnnoise |
| **PySceneDetect** | BSD-3-Clause | Shot/scene cut detection, split video | Yes | Active, releases in 2026 | Find cuts in game footage/screen recordings for devlog b-roll selection | https://github.com/Breakthrough/PySceneDetect |
| **Motion Canvas** | MIT | Code-driven animation with generator functions and a live editor | Yes | Maintenance level not confirmed | Not needed alongside Remotion | https://motioncanvas.io/ |
| **Revideo** | MIT | Motion Canvas fork with headless rendering API | Yes | Repo now at midrender/revideo, issues active in 2026 | Only if you ever leave Remotion (e.g. team grows past the free license) | https://github.com/midrender/revideo |
| **MoviePy** | MIT | Python video editing (v2 API) | Yes | Maintained but maintainers report limited bandwidth | Quick Python scripts; ffmpeg + Remotion already cover it | https://github.com/Zulko/moviepy |
| **Real-ESRGAN** (+ ncnn-vulkan) | BSD-3-Clause (ncnn-vulkan port MIT) | Image/video upscaling | GPU strongly preferred; CPU is very slow | Mature, low recent activity | Upscale low-res screenshots or old game captures before compositing | https://github.com/xinntao/Real-ESRGAN |
| **Practical-RIFE** | MIT | Frame interpolation (e.g. 30 to 60 fps game clips) | GPU preferred | Maintained | Smooth low-fps game footage for 60 fps masters | https://github.com/hzwer/Practical-RIFE |

---

## 10. YouTube automation

| Tool | License / cost | What it does | Maturity | Pipeline fit | Source |
|---|---|---|---|---|---|
| **YouTube Data API v3** (already used by `tools/yt_upload.py`) | Free, quota-limited (10,000 units/day default) | Upload, `thumbnails.set`, `captions.insert` (upload the `.srt` from section 4), playlists | Stable | Add caption upload to `yt_upload.py`. Third-party sources report upload quota costs were cut in 2025 to 2026; could not load Google's quota page to confirm, so check the official calculator | https://developers.google.com/youtube/v3/determine_quota_cost |
| **YouTube Analytics API** (already used by `tools/yt_stats.py`) | Free, OAuth | Views, CTR, retention per video | Stable | Feed CTR back into `/packaging` | https://developers.google.com/youtube/analytics |
| **YouTube Studio Test & Compare** | Free, built in | A/B/C tests up to 3 thumbnails, 3 titles, or 3 title+thumbnail combos; winner by watch time share, not raw CTR; needs advanced features, desktop Studio only | Rolled out to all eligible creators by Dec 2025 | `/packaging` already produces 3 thumbnail bets; now it can also produce 3 title bets | https://support.google.com/youtube/answer/16391400 |
| **yt-dlp** | Unlicense | Download videos, thumbnails, metadata, auto-subs | Very active | Research reference videos, archive your own uploads, pull auto-captions | https://github.com/yt-dlp/yt-dlp |
| Third-party A/B rotators (e.g. Thumbly) | Paid SaaS | Rotate thumbnails on a schedule via the API | N/A | No mature open-source equivalent found; native Test & Compare makes them unnecessary | https://www.opus.pro/blog/best-youtube-thumbnail-ab-testing-tools |

No maintained open-source title/thumbnail A/B tool was found. A DIY rotator with
`thumbnails.set` is possible but conflicts with the native test, so use the native test.

---

## Licenses to watch

**Hard no for a monetized channel (non-commercial weights):**

- **F5-TTS** weights: CC-BY-NC-4.0 (https://github.com/SWivid/F5-TTS)
- **XTTS-v2** (Coqui): CPML, non-commercial, and no company left to sell a license (https://huggingface.co/coqui/XTTS-v2)
- **MusicGen / AudioCraft** weights: CC-BY-NC-4.0 (https://huggingface.co/facebook/musicgen-small)
- **AudioLDM 2**: CC-BY-NC-SA-4.0 (https://huggingface.co/cvssp/audioldm2)
- **TangoFlux / Tango 2**: non-commercial terms (https://github.com/declare-lab/TangoFlux)
- **Woosh** (Sony AI) weights: CC-BY-NC (https://github.com/SonyResearch/Woosh)
- **CrisperWhisper** weights: Nyra Health non-commercial license (https://github.com/nyrahealth/CrisperWhisper)
- **BRIA RMBG-2.0**, which is **rembg's default model**: paid agreement for commercial use. Always pass `-m birefnet-general` (https://github.com/danielgatis/rembg)
- **Freesound CC-BY-NC** sounds: filter them out in every API query (https://freesound.org/docs/api/)

**Allowed, but with conditions:**

- **Stability AI Community License** (Stable Audio 3, Stable Audio Open): free commercial use below $1M annual revenue, requires registration; gated downloads.
- **CC-BY-4.0 weights** (Parakeet, Pocket TTS): credit the model author somewhere (description or repo).
- **CC-BY music** (Incompetech, some YouTube Audio Library tracks): the credit line must be in the description.
- **Pocket TTS and StyleTTS 2**: usage terms forbid cloning a voice without consent; cloning your own voice is fine.
- **Chatterbox**: MIT, but all output carries an invisible Perth watermark (not a license problem, just know it is there).
- **Orpheus**: HF card says Apache-2.0, but it is a Llama 3.2 3B fine-tune; check Meta's Llama terms before relying on it.
- **ACE-Step 1.5 XL**: code and 2B weights are MIT; one source says XL weights differ, check the XL model card.
- **FLUX family**: only [schnell] and [klein] 4B are Apache-2.0 per HF; FLUX.1 [dev] uses a non-commercial model license, so avoid it.
- **SDXL**: OpenRAIL++-M allows commercial use but has use-based restrictions.
- **Piper**: engine is GPL-3.0 (fine to run as a tool); each voice has its own license in its MODEL_CARD.
- **Glaxnimate / Synfig**: GPL-3.0 apps; the animations you export are yours.
- **Remotion** (incl. `@remotion/*` packages and templates): free for individuals and teams up to 3 people; a company license is needed at 4+.
- **Rive**: runtimes are MIT, but exporting `.riv` files reportedly needs a paid editor plan.
- **Pixabay music**: some tracks are Content ID registered; keep the license certificate for disputes.
- **NASA media**: public domain in the US, but no logos/insignia and no implied endorsement.
- **YouTube Audio Library**: covers YouTube only, not re-uploads to other platforms or paid ads.
- **pyannote** (WhisperX diarization): free but gated behind accepting terms on Hugging Face.
