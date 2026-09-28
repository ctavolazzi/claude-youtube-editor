#!/usr/bin/env python3
"""
gen_vo_local.py: free, local AI voiceover with word timings (Kokoro-82M on CPU).

The no-API-key twin of tools/gen_vo.mjs (ElevenLabs). Reads a vo.json script, speaks it,
and writes everything a Remotion shot needs to sync to the voice:

  media/projects/<project>/vo/vo.wav          the voiceover (24 kHz mono, loudness-normalized)
  media/projects/<project>/vo/lines/<id>.wav  each line on its own, for quick auditions
  remotion/src/shots/<project>/vo-timing.json lines + words with start/end seconds
  remotion/src/shots/<project>/vo-mouth.json  per-frame mouth openness 0..1 (mascot lip-sync)

vo.json:
  { "project": "my-video", "voice": "am_michael", "speed": 1.0, "gap": 0.32, "beat_gap": 0.75,
    "lines": [ { "id": "open-1", "beat": "open", "text": "..." }, ... ] }

Markup inside `text`:
  {bleep:word}   the word is NOT spoken; a censor bleep of the word's length plays instead,
                 and the caption shows it masked.

Word timing: every sentence is synthesized on its own, so sentence edges are exact. Inside a
sentence, time is shared out by each word's phoneme count (from the same espeak phonemizer
the model reads), which lands within about a syllable. Good for captions and cues. When the
repo's transcribe step is available, run it on vo.wav for exact word times instead.

Usage (repo root, venv active; run tools/fetch_kokoro.py once first):
  python tools/gen_vo_local.py videos/<project>/script/vo.json
  python tools/gen_vo_local.py videos/<project>/script/vo.json --voice af_heart
  python tools/gen_vo_local.py videos/<project>/script/vo.json --audition   # short sample per voice
"""
import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ENGINE = Path(__file__).resolve().parent
MODEL_DIR = ENGINE / "models" / "kokoro"
REPO = ENGINE.parent
FPS = 30
SR = 24000
LEAD_IN = 0.6
TAIL = 1.2
SENTENCE_GAP = 0.22
BLEEP_HZ = 1000
AUDITION_VOICES = ["am_michael", "am_fenrir", "am_eric", "am_liam", "af_heart", "af_bella", "bm_george", "bm_fable"]

BLEEP_RE = re.compile(r"\{bleep:([^}]+)\}")


def load_kokoro():
    try:
        from kokoro_onnx import Kokoro
    except ImportError:
        sys.exit("kokoro-onnx missing: pip install -r requirements.txt (in the venv)")
    model, voices = MODEL_DIR / "kokoro-fp32.onnx", MODEL_DIR / "voices-en.npz"
    if not model.exists() or not voices.exists():
        sys.exit("Kokoro model not installed. Run: python tools/fetch_kokoro.py")
    return Kokoro(str(model), str(voices))


def sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.?!])\s+", text.strip())
    return [p for p in parts if p]


def segments(sentence: str) -> list[tuple[str, str]]:
    """Split a sentence into ('say', text) and ('bleep', word) pieces."""
    out, pos = [], 0
    for m in BLEEP_RE.finditer(sentence):
        if sentence[pos:m.start()].strip():
            out.append(("say", sentence[pos:m.start()].strip()))
        out.append(("bleep", m.group(1)))
        pos = m.end()
    if sentence[pos:].strip():
        out.append(("say", sentence[pos:].strip()))
    # punctuation left over after a bleep ("a broke {bleep:x}.") is not a word to speak
    return [(k, t) for k, t in out if k == "bleep" or re.search(r"[A-Za-z0-9]", t)]


def word_weights(k, words: list[str], lang="en-us") -> list[float]:
    ws = []
    for w in words:
        ph = k.tokenizer.phonemize(w, lang) if re.search(r"[A-Za-z0-9]", w) else ""
        weight = max(1.0, len(ph))
        if w.endswith((",", ";", ":")):
            weight += 3.0  # the model breathes after a comma
        ws.append(weight)
    return ws


def trim_silence(a: np.ndarray, thresh=0.01) -> np.ndarray:
    idx = np.where(np.abs(a) > thresh)[0]
    if len(idx) == 0:
        return a
    pad = int(0.02 * SR)
    return a[max(0, idx[0] - pad): min(len(a), idx[-1] + pad)]


def bleep(dur: float) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    tone = 0.32 * np.sin(2 * np.pi * BLEEP_HZ * t)
    fade = min(len(t) // 2, int(0.008 * SR))
    env = np.ones_like(tone)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.linspace(1, 0, fade)
    return (tone * env).astype(np.float32)


def speak(k, text, voice, speed):
    audio, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
    assert sr == SR, sr
    if len(audio) == 0 or np.isnan(audio).any() or np.max(np.abs(audio)) < 1e-3:
        sys.exit(f"the model returned silence for {text!r}. If you are on an fp16 model, "
                 "re-run tools/fetch_kokoro.py --force to get the fp32 one.")
    return trim_silence(audio.astype(np.float32))


def synth_line(k, text, voice, speed):
    """Return (audio, words) for one line; word times are relative to the line start."""
    chunks, words, t = [], [], 0.0
    for si, sent in enumerate(sentences(text)):
        if si:
            chunks.append(np.zeros(int(SENTENCE_GAP * SR), np.float32))
            t += SENTENCE_GAP
        for kind, body in segments(sent):
            if kind == "bleep":
                dur = float(np.clip(len(speak(k, body, voice, speed)) / SR, 0.3, 0.7))
                chunks.append(bleep(dur))
                words.append({"w": body, "start": round(t, 3), "end": round(t + dur, 3), "bleep": True})
                t += dur + 0.04
                chunks.append(np.zeros(int(0.04 * SR), np.float32))
                continue
            a = speak(k, body, voice, speed)
            toks = body.split()
            ws = word_weights(k, toks)
            dur, total, acc = len(a) / SR, sum(ws), 0.0
            for w, wt in zip(toks, ws):
                s = t + dur * acc / total
                acc += wt
                words.append({"w": w, "start": round(s, 3), "end": round(t + dur * acc / total, 3)})
            chunks.append(a)
            t += dur
    return np.concatenate(chunks), words


def mouth_track(audio: np.ndarray, total_frames: int) -> list[float]:
    hop = SR // FPS
    vals = []
    for f in range(total_frames):
        seg = audio[f * hop:(f + 1) * hop]
        vals.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0)
    v = np.array(vals)
    ref = np.percentile(v[v > 1e-4], 95) if np.any(v > 1e-4) else 1.0
    v = np.clip(v / ref, 0, 1)
    # light smoothing so the mouth doesn't flicker frame to frame
    v = np.convolve(v, [0.25, 0.5, 0.25], mode="same")
    return [round(float(x), 3) for x in v]


def normalize(audio: np.ndarray) -> np.ndarray:
    try:
        import pyloudnorm as pyln
        meter = pyln.Meter(SR)
        audio = pyln.normalize.loudness(audio, meter.integrated_loudness(audio), -16.0)
    except ImportError:
        rms = np.sqrt(np.mean(audio ** 2)) or 1.0
        audio = audio * (10 ** (-18 / 20) / rms)
    peak = np.max(np.abs(audio)) or 1.0
    if peak > 0.89:  # about -1 dBFS
        audio = audio * (0.89 / peak)
    return audio.astype(np.float32)


def audition(k, cfg, out_dir: Path):
    text = cfg["lines"][0]["text"]
    parts = []
    for v in AUDITION_VOICES:
        label = speak(k, f"Voice {v.split('_')[1]}.", v, 1.0)
        line, _ = synth_line(k, text, v, cfg.get("speed", 1.0))
        parts += [label, np.zeros(int(0.3 * SR), np.float32), line, np.zeros(int(0.9 * SR), np.float32)]
    out = out_dir / "voice-audition.wav"
    sf.write(out, normalize(np.concatenate(parts)), SR)
    print(f"audition: {out}  ({', '.join(AUDITION_VOICES)})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("vo_json")
    ap.add_argument("--voice")
    ap.add_argument("--speed", type=float)
    ap.add_argument("--audition", action="store_true", help="render one sample line in several voices")
    args = ap.parse_args()

    cfg = json.loads(Path(args.vo_json).read_text(encoding="utf-8"))
    project = cfg["project"]
    voice = args.voice or cfg.get("voice", "am_michael")
    speed = args.speed or cfg.get("speed", 1.0)
    media = REPO / "media" / "projects" / project / "vo"
    (media / "lines").mkdir(parents=True, exist_ok=True)
    shot_dir = REPO / "remotion" / "src" / "shots" / project
    shot_dir.mkdir(parents=True, exist_ok=True)

    k = load_kokoro()
    if args.audition:
        audition(k, cfg, media)
        return

    chunks = [np.zeros(int(LEAD_IN * SR), np.float32)]
    t, lines, prev_beat = LEAD_IN, [], None
    for i, ln in enumerate(cfg["lines"]):
        if i:
            gap = cfg.get("beat_gap", 0.75) if ln["beat"] != prev_beat else cfg.get("gap", 0.32)
            gap = ln.get("pause_before", gap)
            chunks.append(np.zeros(int(gap * SR), np.float32))
            t += gap
        audio, words = synth_line(k, ln["text"], voice, speed)
        sf.write(media / "lines" / f"{ln['id']}.wav", audio, SR)
        dur = len(audio) / SR
        lines.append({
            "id": ln["id"], "beat": ln["beat"], "text": BLEEP_RE.sub(lambda m: m.group(1), ln["text"]),
            "start": round(t, 3), "end": round(t + dur, 3),
            "words": [{**w, "start": round(w["start"] + t, 3), "end": round(w["end"] + t, 3)} for w in words],
        })
        chunks.append(audio)
        t += dur
        prev_beat = ln["beat"]
        print(f"  {ln['id']:<10} {t - dur:7.2f}s  +{dur:5.2f}s  {ln['text'][:60]}")
    chunks.append(np.zeros(int(TAIL * SR), np.float32))
    full = normalize(np.concatenate(chunks))
    total = len(full) / SR
    sf.write(media / "vo.wav", full, SR)

    beats = {}
    for ln in lines:
        b = beats.setdefault(ln["beat"], {"start": ln["start"], "end": ln["end"]})
        b["end"] = ln["end"]
    timing = {"project": project, "voice": voice, "speed": speed, "fps": FPS,
              "duration": round(total, 3), "beats": beats, "lines": lines}
    (shot_dir / "vo-timing.json").write_text(json.dumps(timing, indent=1), encoding="utf-8")
    frames = int(np.ceil(total * FPS))
    (shot_dir / "vo-mouth.json").write_text(json.dumps(mouth_track(full, frames)), encoding="utf-8")
    print(f"voiceover: {media / 'vo.wav'}  {total:.1f}s, voice {voice}")
    print(f"timing:    {shot_dir / 'vo-timing.json'}")


if __name__ == "__main__":
    main()
