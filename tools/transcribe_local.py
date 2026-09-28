"""Transcribe extracted WAVs LOCALLY (free, offline after the first model download), with
word-level timestamps. Drop-in for tools/transcribe.py: same arguments, same output file and
the same fields the pipeline reads (`text`, `words[{text, start, end, confidence}]` in ms), so
format_transcript.py, analyze_cut.py, verify_cut.py and /make-tsx work unchanged.

Engine: faster-whisper (MIT). Optional `--align` refines every word's start/end with WhisperX
forced alignment (BSD-2, wav2vec2 phoneme alignment): tighter onsets, which is what makes a
kinetic slam land ON the word. Word timing quality: plain ~±100 ms, aligned typically <50 ms.

Usage:
  python tools/transcribe_local.py videos/video-1                      # all clips
  python tools/transcribe_local.py videos/video-1 --clips 0233 --align # one clip, aligned
  python tools/transcribe_local.py videos/video-1 --clips preview --force   # verify_cut pass
  python tools/transcribe_local.py videos/video-1 --model small --device cpu

Reads:  <project>/work/audio/*.wav  and  <project>/work/keyterms.txt (optional)
Writes: <project>/work/<outdir>/<id>.json

Models download once to the Hugging Face cache (~/.cache/huggingface). Pick by hardware:
  large-v3-turbo (default)  best accuracy/speed; wants a GPU (~6 GB VRAM) or patience on CPU
  medium / small            CPU-friendly; small runs ~real-time on a laptop
Install: pip install -r requirements-local.txt   (whisperx only needed for --align)

Verbatim matters here: the cut policy needs fillers and false starts IN the transcript. Whisper
tends to tidy them away, so we prime it with a disfluent prompt (a known-good trick) and bias it
toward this video's names with keyterms. Still expect it to catch fewer "um"s than AssemblyAI's
disfluency mode; analyze_cut.py's ghost-speech check is the backstop.
"""

import argparse
import difflib
import json
import sys
import time
from pathlib import Path

from transcribe import load_keyterms

# Disfluent priming prompt: Whisper imitates the style of its prompt, so a prompt that keeps
# "um"/"uh"/restarts makes it keep them too. Generic, not per-video (keyterms carry the specifics).
VERBATIM_PROMPT = (
    "Umm, so, uh, let me... let me think. Like, I was gonna, hmm, okay. "
    "So, uh, yeah, we're, we're gonna start here."
)


def resolve_project(arg: str) -> Path:
    """Project paths resolve against the CWD (run from the repo root), like every tool here."""
    p = Path(arg)
    if not p.is_absolute() and not p.exists():
        p = Path(__file__).resolve().parent.parent / arg
    return p.resolve()


def pick_device(requested: str) -> tuple[str, str]:
    """(device, compute_type). int8 on CPU keeps RAM and time sane; float16 on CUDA."""
    if requested == "cpu":
        return "cpu", "int8"
    try:
        import ctranslate2
        has_cuda = ctranslate2.get_cuda_device_count() > 0
    except Exception:
        has_cuda = False
    if requested == "cuda" and not has_cuda:
        sys.exit("--device cuda requested but no CUDA device is visible to ctranslate2")
    return ("cuda", "float16") if has_cuda else ("cpu", "int8")


def whisper_words(model, wav: Path, keyterms: list[str], language: str | None, beam: int):
    segments, info = model.transcribe(
        str(wav),
        language=language,
        beam_size=beam,
        word_timestamps=True,
        initial_prompt=VERBATIM_PROMPT,
        hotwords=", ".join(keyterms) if keyterms else None,
        condition_on_previous_text=True,
        vad_filter=True,  # skips long silences (stops hallucinated text); timestamps are restored
        vad_parameters={"min_silence_duration_ms": 700, "speech_pad_ms": 300},
    )
    segs = []
    for s in segments:  # generator: decoding happens here
        words = [{"text": w.word.strip(), "start": w.start, "end": w.end, "confidence": w.probability}
                 for w in (s.words or []) if w.word.strip()]
        segs.append({"start": s.start, "end": s.end, "text": s.text.strip(), "words": words})
    return segs, info


def align_words(segs: list[dict], wav: Path, language: str, device: str) -> list[dict]:
    """Replace each word's timing with WhisperX forced alignment. Words the aligner can't place
    (numbers, symbols) keep their Whisper timing, clamped between their aligned neighbours."""
    try:
        import whisperx
    except ImportError:
        sys.exit("--align needs WhisperX: pip install whisperx")
    audio = whisperx.load_audio(str(wav))
    model_a, meta = whisperx.load_align_model(language_code=language, device=device)
    result = whisperx.align([{"start": s["start"], "end": s["end"], "text": s["text"]} for s in segs],
                            model_a, meta, audio, device, return_char_alignments=False)
    src = [w for s in segs for w in s["words"]]
    al = result.get("word_segments") or []
    # WhisperX regroups segments into sentences, so pair the flat word lists by TEXT, not by
    # segment. difflib keeps the pairing right even if the two tokenizations differ somewhere.
    norm = lambda t: t.strip().lower().strip(".,?!;:\"'()…-")
    pairs = {}
    sm = difflib.SequenceMatcher(a=[norm(w["text"]) for w in src], b=[norm(a.get("word", "")) for a in al], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            pairs[blk.a + k] = al[blk.b + k]
    out, moved = [], 0
    for i, w in enumerate(src):
        a = pairs.get(i)
        if a and a.get("start") is not None and a.get("end") is not None:
            out.append({**w, "start": a["start"], "end": a["end"], "confidence": a.get("score", w["confidence"])})
            moved += 1
        else:
            out.append(dict(w))
    print(f"  aligned {moved}/{len(src)} words with WhisperX (the rest keep Whisper's timing)")
    # keep time monotonic where an unaligned word sits between aligned ones
    for i in range(1, len(out)):
        if out[i]["start"] < out[i - 1]["end"]:
            out[i]["start"] = out[i - 1]["end"]
        if out[i]["end"] < out[i]["start"]:
            out[i]["end"] = out[i]["start"]
    return out


def to_payload(words: list[dict], info, engine: str) -> dict:
    ms = [{"text": w["text"], "start": int(round(w["start"] * 1000)), "end": int(round(w["end"] * 1000)),
           "confidence": round(float(w["confidence"]), 3), "speaker": None} for w in words]
    return {
        "status": "completed",
        "text": " ".join(w["text"] for w in ms),
        "words": ms,
        "language_code": info.language,
        "audio_duration": round(info.duration, 3),
        "speech_model_used": engine,
        "source": "local",
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--clips", nargs="*", help="clip ids, default all")
    ap.add_argument("--outdir", default="transcripts")
    ap.add_argument("--force", action="store_true", help="re-transcribe even if output exists")
    ap.add_argument("--model", default="large-v3-turbo", help="faster-whisper model name or local path")
    ap.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    ap.add_argument("--language", default=None, help="e.g. en; default: auto-detect")
    ap.add_argument("--beam", type=int, default=5)
    ap.add_argument("--align", action="store_true", help="refine word timing with WhisperX forced alignment")
    args = ap.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("faster-whisper not installed: pip install -r requirements-local.txt")

    project = resolve_project(args.project)
    audio_dir = project / "work" / "audio"
    out_dir = project / "work" / args.outdir
    out_dir.mkdir(parents=True, exist_ok=True)

    keyterms = load_keyterms(project)
    print(f"keyterms: {len(keyterms)} loaded from work/keyterms.txt"
          if keyterms else "keyterms: none (no work/keyterms.txt), add this video's terms for better accuracy")

    todo = []
    for wav in sorted(audio_dir.glob("*.wav")):
        if args.clips and wav.stem not in args.clips:
            continue
        if not args.force and (out_dir / f"{wav.stem}.json").exists():
            print(f"{wav.stem}: transcript exists, skipping")
            continue
        todo.append(wav)
    if not todo:
        print("nothing to do")
        return

    device, compute = pick_device(args.device)
    print(f"loading {args.model} on {device} ({compute}) ...")
    model = WhisperModel(args.model, device=device, compute_type=compute)

    for wav in todo:
        t0 = time.time()
        segs, info = whisper_words(model, wav, keyterms, args.language, args.beam)
        engine = f"faster-whisper:{args.model}"
        words = [w for s in segs for w in s["words"]]
        if args.align and segs:
            words = align_words(segs, wav, info.language, device)
            engine += "+whisperx-align"
        payload = to_payload(words, info, engine)
        (out_dir / f"{wav.stem}.json").write_text(json.dumps(payload, indent=1))
        took = time.time() - t0
        print(f"{wav.stem}: {len(payload['words'])} words, {info.duration:.1f}s audio in {took:.1f}s "
              f"({info.duration / max(took, 1e-6):.1f}x realtime), lang={info.language}, {engine}")

    print("done")


if __name__ == "__main__":
    main()
