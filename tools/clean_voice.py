#!/usr/bin/env python3
"""
clean_voice.py — voice cleanup for the AI Video Editor (outdoor / noisy footage).

Cleans the voice on a video's audio, gain-matches the result back to the source's RMS
("denoise only, levels preserved"), and remuxes with the video stream COPIED (fast,
non-destructive, keeps 4K60). Original file is never modified.

Methods (A/B proven on video-1, which was shot outdoors with running water):
  --method eleven   ElevenLabs Voice Isolator (default). Removes DYNAMIC broadband noise like
                    water near-completely. ~1000 credits/min (~$1 for a 5.5-min video).
  --method rnnoise  Local RNNoise (ffmpeg arnndn, model via --model, default sh). Free/offline,
                    but only PARTIALLY removes water (spectral/RNN tools can't separate it).
  --method deepfilter  Local DeepFilterNet3 (MIT/Apache, 48 kHz full-band). Free/offline and much
                    stronger than RNNoise on fans, room tone, keyboard and street hum; try it before
                    paying for ElevenLabs. `--atten 12` caps the reduction at 12 dB for a gentler,
                    less processed result (default: no cap). Uses the `deep-filter` binary
                    (tools/install_local_ai.py puts it in tools/bin/) or the `deepFilter` CLI from
                    `pip install deepfilternet`.

Usage:
  python tools/clean_voice.py videos/video-1/reference/master.mp4                  # eleven
  python tools/clean_voice.py videos/video-1/reference/master.mp4 --method rnnoise --model sh
  python tools/clean_voice.py videos/video-1/reference/master.mp4 --method deepfilter [--atten 12]
  python tools/clean_voice.py IN.mp4 -o OUT.mp4 [--no-preserve-loudness] [--keep]

Needs ffmpeg/ffprobe (+ curl and ELEVENLABS_API_KEY in .env for --method eleven).
RNNoise models live in tools/models/rnnoise/<model>.rnnn.
"""
import glob
import shutil
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ISO_URL = "https://api.elevenlabs.io/v1/audio-isolation"


def load_key():
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if line.startswith("ELEVENLABS_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("ELEVENLABS_API_KEY", "")


def run(cmd, **kw):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, **kw)
    if r.returncode != 0:
        sys.stderr.write("\nCOMMAND FAILED:\n  " + " ".join(cmd) + "\n" + r.stdout[-3000:] + "\n")
        raise SystemExit(1)
    return r.stdout


def probe_dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "default=nw=1:nk=1", path]).strip())


def astat(path, label):
    out = run(["ffmpeg", "-hide_banner", "-i", path, "-af", "astats=metadata=1", "-f", "null", os.devnull])
    m = re.search(rf"{label}:\s*(-?[\d.]+)", out)
    return float(m.group(1)) if m else None


def arg(args, name, default=None):
    return args[args.index(name) + 1] if name in args else default


def find_deepfilter():
    """(kind, path): the Rust `deep-filter` binary (fast, no Python deps) if present, else the
    `deepFilter` CLI from `pip install deepfilternet`. DEEP_FILTER env var overrides."""
    exe = ".exe" if os.name == "nt" else ""
    for cand in (os.environ.get("DEEP_FILTER"), os.path.join(ROOT, "tools", "bin", "deep-filter" + exe),
                 shutil.which("deep-filter")):
        if cand and os.path.exists(cand):
            return "rust", cand
    py = shutil.which("deepFilter")
    if py:
        return "python", py
    sys.exit("DeepFilterNet not found. Run `python tools/install_local_ai.py deepfilter` "
             "(downloads the deep-filter binary to tools/bin/) or `pip install deepfilternet`.")


def main():
    args = sys.argv[1:]
    keep = "--keep" in args
    preserve = "--no-preserve-loudness" not in args
    method = arg(args, "--method", "eleven")
    model = arg(args, "--model", "sh")
    atten = arg(args, "--atten")
    out = arg(args, "-o")
    skip = {out, method, model, atten, arg(args, "--method"), arg(args, "--model")}
    pos = [a for a in args if not a.startswith("-") and a not in skip]
    if not pos or method not in ("eleven", "rnnoise", "deepfilter"):
        sys.exit("usage: clean_voice.py IN.mp4 [-o OUT.mp4] [--method eleven|rnnoise|deepfilter] [--model sh] "
                 "[--atten DB] [--no-preserve-loudness] [--keep]")
    src = pos[0] if os.path.isabs(pos[0]) else os.path.join(ROOT, pos[0])
    if not out:
        base, ext = os.path.splitext(src)
        suffix = {"eleven": "-clean", "rnnoise": f"-clean-{model}", "deepfilter": "-clean-df"}[method]
        out = base + suffix + ext
    out = out if os.path.isabs(out) else os.path.join(ROOT, out)

    work = os.path.join(os.path.dirname(out), "_clean_tmp")
    os.makedirs(work, exist_ok=True)
    audio_in = os.path.join(work, "audio_in.wav")

    print(f"src: {os.path.relpath(src, ROOT)}   method: {method}" + (f" ({model})" if method == "rnnoise" else ""))
    if method == "deepfilter":
        find_deepfilter()  # fail fast, before the extract
    dur = probe_dur(src)
    if method == "eleven":
        print(f"duration: {dur:.1f}s  (~{dur/60*1000:.0f} ElevenLabs credits @ 1000/min)")

    # 1) extract mono audio (the master is dual-mono; mono halves size, loses nothing)
    print("extracting audio -> mono wav ...")
    # DeepFilterNet is a 48 kHz model; feed it native 48k so it never resamples internally
    sr = "48000" if method == "deepfilter" else "44100"
    run(["ffmpeg", "-y", "-hide_banner", "-i", src, "-vn", "-ac", "1", "-ar", sr,
         "-c:a", "pcm_s16le", audio_in])

    # 2) produce the cleaned voice track (branch on method)
    if method == "eleven":
        key = load_key()
        if not key:
            sys.exit("ELEVENLABS_API_KEY not set in .env")
        iso = os.path.join(work, "isolated.mp3")
        print("isolating voice via ElevenLabs (this can take a few minutes) ...")
        http = run(["curl", "-sS", "--max-time", "1200", "-w", "%{http_code}",
                    "-X", "POST", ISO_URL, "-H", f"xi-api-key: {key}",
                    "-F", f"audio=@{audio_in}", "-o", iso]).strip()[-3:]
        size = os.path.getsize(iso) if os.path.exists(iso) else 0
        if http != "200" or size < 1000:
            body = open(iso, "rb").read()[:500].decode("utf-8", "ignore") if size else ""
            sys.exit(f"isolation failed (http {http}, {size} bytes): {body}")
        print(f"  isolated -> {size/1e6:.1f} MB, http {http}")
    elif method == "deepfilter":  # local DeepFilterNet3, full-band 48 kHz
        kind, exe = find_deepfilter()
        df_out = os.path.join(work, "df")
        os.makedirs(df_out, exist_ok=True)
        cmd = [exe, audio_in, "-o", df_out]
        if atten:
            cmd[1:1] = ["--atten-lim-db" if kind == "rust" else "--atten-lim", str(atten)]
        print(f"denoising locally via DeepFilterNet ({kind}{', atten ' + atten + ' dB' if atten else ''}) ...")
        run(cmd)
        # rust keeps the input name; the python CLI appends _DeepFilterNet3. Take what it wrote.
        made = sorted(glob.glob(os.path.join(df_out, "*.wav")), key=os.path.getmtime)
        if not made:
            sys.exit("DeepFilterNet produced no output")
        iso = made[-1]
    else:  # rnnoise (local): high-pass sub-90Hz rumble + RNNoise suppression
        mpath = os.path.join(ROOT, "tools", "models", "rnnoise", f"{model}.rnnn")
        if not os.path.exists(mpath):
            sys.exit(f"RNNoise model not found: {mpath}")
        iso = os.path.join(work, "isolated.wav")
        # arnndn's model path goes INSIDE the filtergraph, where `:` (option separator) and
        # `\` (escape) mangle a Windows absolute path. Run ffmpeg from ROOT and pass a
        # relative, forward-slash, colon-free path instead.
        mrel = f"tools/models/rnnoise/{model}.rnnn"
        print(f"denoising locally via RNNoise ({model}) ...")
        run(["ffmpeg", "-y", "-hide_banner", "-i", audio_in,
             "-af", f"highpass=f=90,arnndn=m={mrel}", "-ar", "44100", iso], cwd=ROOT)

    # 3) preserve loudness: match cleaned track back to the source's RMS (speech-dominated,
    #    ungated) — NOT integrated LUFS, which is gated + inflated by the removed noise and
    #    would over-boost the voice into clipping. Cap so the peak never exceeds the ceiling.
    gain, CEIL = 0.0, -1.0
    if preserve:
        src_rms, iso_rms, iso_peak = astat(src, "RMS level dB"), astat(iso, "RMS level dB"), astat(iso, "Peak level dB")
        if None not in (src_rms, iso_rms, iso_peak):
            gain = src_rms - iso_rms
            if iso_peak + gain > CEIL:      # flat-gain cap (no compression) to avoid clipping
                gain = CEIL - iso_peak
        print(f"level: src RMS {src_rms} dB, cleaned RMS {iso_rms} dB / peak {iso_peak} dB -> gain {gain:+.2f} dB")

    # 4) remux: video COPIED, cleaned audio (gain-matched, padded to video length)
    print("remux (video copy) ...")
    run(["ffmpeg", "-y", "-hide_banner", "-i", src, "-i", iso,
         "-filter_complex", f"[1:a]volume={gain:.2f}dB,apad[a]",
         "-map", "0:v:0", "-map", "[a]", "-shortest",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])

    od = probe_dur(out)
    print(f"\ndone -> {os.path.relpath(out, ROOT)}  ({od:.1f}s, video copied, voice cleaned)")
    if abs(od - dur) > 0.15:
        print(f"  WARNING: duration drift {od-dur:+.2f}s vs source")
    if not keep:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
