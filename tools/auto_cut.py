#!/usr/bin/env python3
"""
auto_cut.py: a mechanical FIRST PASS of the cut, in seconds instead of an afternoon.

Runs auto-editor (Unlicense) on each clip's audio to find the silences, then writes a DRAFT
cuts.json in the exact schema /clean-cut uses: speech runs become keeps, long silences become
`dead_air` / `long_pause` cuts, and (when a transcript exists) clear fillers ("um", "uh") become
`filler` cuts. The judgment calls (retakes, false starts, doubled phrases, fluff) are still
/clean-cut's job; this just clears the mechanical work so that pass starts from a clean draft.

Short breaths are NOT cut: gaps under --min-pause stay inside the keep, because the renderer's
styles already compress pauses to the house pacing (~0.45s). Cutting them here would double-cut.

Usage (from the repo root):
  python tools/auto_cut.py videos/video-4                 # all clips -> work/analysis/cuts.auto.json
  python tools/auto_cut.py videos/video-4 --clips 0233    # one clip
  python tools/auto_cut.py videos/video-4 --threshold 3%  # quieter room: lower threshold
  python tools/auto_cut.py videos/video-4 --write         # also create cuts.json if there isn't one
  python tools/auto_cut.py videos/video-4 --nle resolve   # + a DaVinci Resolve timeline per raw clip
                                                          #   (premiere | final-cut-pro | shotcut | kdenlive)

Reads:  <project>/work/audio/<id>.wav (step 1 of /clean-cut), optional work/transcripts/<id>.json
Writes: <project>/work/analysis/cuts.auto.json (always), cuts.json (only with --write, never overwrites)
Needs:  auto-editor (pip install -r requirements-local.txt)
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILLERS = {"um", "uh", "erm", "hmm", "mm", "mhm", "uhm", "umm", "uhh"}
MEDIA_EXT = {".mp4", ".mov", ".mkv", ".m4v", ".avi", ".mts", ".wav", ".m4a", ".mp3", ".flac"}
# the house pacing from brand.md / clean-cut (same values video-1 shipped with)
HOUSE_STYLES = {
    "tight": {"internal_gap": 0.4, "min_tail": 0.14, "max_tail": 0.4, "head": 0.15, "margin": 5.0,
              "soft_gap": 1.2, "soft_max_tail": 0.95, "soft_margin": 3.0},
    "natural": {"internal_gap": 0.4, "min_tail": 0.26, "max_tail": 0.45, "head": 0.17, "margin": 5.0,
                "soft_gap": 1.2, "soft_max_tail": 0.95, "soft_margin": 3.0},
}


def find_auto_editor() -> str:
    exe = shutil.which("auto-editor")
    if not exe:  # installed in the venv that is running us, but venv not activated
        cand = Path(sys.executable).parent / ("auto-editor.exe" if os.name == "nt" else "auto-editor")
        exe = str(cand) if cand.exists() else None
    if not exe:
        sys.exit("auto-editor not found: pip install -r requirements-local.txt")
    return exe


def silences(ae: str, src: Path, threshold: str, margin: str) -> tuple[list[tuple[float, float]], float]:
    """(silent ranges in seconds, duration). auto-editor v1 export with a 1000/s timebase = ms."""
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "chunks.json"
        cmd = [ae, str(src), "--edit", f"audio:threshold={threshold}", "--margin", margin,
               "--export", "v1", "-tb", "1000", "-o", str(out), "--no-open"]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0 or not out.exists():
            sys.exit(f"auto-editor failed on {src.name}:\n{(r.stdout + r.stderr)[-1500:]}")
        chunks = json.loads(out.read_text())["chunks"]
    silent = [(a / 1000, b / 1000) for a, b, speed in chunks if speed != 1.0]
    return silent, chunks[-1][1] / 1000 if chunks else 0.0


def wav_duration(p: Path) -> float:
    with wave.open(str(p), "rb") as w:
        return w.getnframes() / w.getframerate()


def load_words(project: Path, clip: str) -> list[dict]:
    for sub in ("transcripts-u35", "transcripts"):
        p = project / "work" / sub / f"{clip}.json"
        if p.exists():
            return json.loads(p.read_text()).get("words") or []
    return []


def text_in(words: list[dict], s: float, e: float) -> str:
    """Words whose midpoint falls in [s, e]: a word straddling a silence edge still lands somewhere."""
    return " ".join(w["text"] for w in words if s <= (w["start"] + w["end"]) / 2000 <= e)


def raw_file_for(project: Path, clip: str, existing: dict) -> str:
    """The clip's raw media, relative to the project: from an existing cuts.json, else by id match."""
    for c in existing.get("clips", []):
        if c["id"] == clip and c.get("file"):
            return c["file"]
    hits = sorted(p for p in project.iterdir() if p.is_file() and p.suffix.lower() in MEDIA_EXT and clip in p.stem)
    return hits[0].name if hits else ""


def draft_clip(project: Path, clip: str, wav: Path, silent: list, dur: float, words: list,
               min_pause: float, dead_air: float, fillers: bool, raw: str) -> dict:
    # 1) keep everything except silences >= min_pause (edges are always cut: nothing to breathe into)
    cuts = []
    for s, e in silent:
        edge = s <= 0.01 or e >= dur - 0.01
        if e - s < min_pause and not edge:
            continue
        cat = "dead_air" if (e - s >= dead_air or edge) else "long_pause"
        cuts.append({"s": round(s, 3), "e": round(e, 3), "cat": cat, "text": "",
                     "note": f"auto: {e - s:.2f}s silence"})
    keeps, t = [], 0.0
    for c in cuts:
        if c["s"] - t > 0.05:
            keeps.append({"s": round(t, 3), "e": c["s"]})
        t = c["e"]
    if dur - t > 0.05:
        keeps.append({"s": round(t, 3), "e": round(dur, 3)})

    # 2) split out clear fillers the transcript found inside a keep
    if fillers and words:
        split = []
        for k in keeps:
            cur = k["s"]
            for w in words:
                ws, we = w["start"] / 1000, w["end"] / 1000
                if w["text"].strip(".,?!…").lower() in FILLERS and cur + 0.05 < ws and we < k["e"] - 0.05:
                    split.append({"s": round(cur, 3), "e": round(ws, 3)})
                    cuts.append({"s": round(ws, 3), "e": round(we, 3), "cat": "filler", "text": w["text"],
                                 "note": "auto: filler word"})
                    cur = we
            split.append({"s": round(cur, 3), "e": k["e"]})
        keeps = [k for k in split if k["e"] - k["s"] > 0.05]

    for i, k in enumerate(keeps):
        k["text"] = text_in(words, k["s"], k["e"]) if words else ""
        if i + 1 < len(keeps):
            k["gap"] = {"d": round(keeps[i + 1]["s"] - k["e"], 2), "t": "silence"}
    cuts.sort(key=lambda c: c["s"])
    return {"id": clip, "file": raw, "duration": round(dur, 3), "keeps": keeps, "cuts": cuts,
            "fluff_suggestions": []}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--clips", nargs="*")
    ap.add_argument("--threshold", default="4%", help="audio loudness threshold (auto-editor), default 4%%")
    ap.add_argument("--margin", default="0.2s", help="padding kept around speech, default 0.2s")
    ap.add_argument("--min-pause", type=float, default=0.6, help="silences shorter than this stay in (s)")
    ap.add_argument("--dead-air", type=float, default=2.0, help="silences at least this long are dead_air (s)")
    ap.add_argument("--no-fillers", action="store_true", help="don't cut filler words from the transcript")
    ap.add_argument("--write", action="store_true", help="also write cuts.json if it doesn't exist yet")
    ap.add_argument("--nle", choices=["resolve", "premiere", "final-cut-pro", "shotcut", "kdenlive"],
                    help="also export an editor timeline of each raw clip, silences removed")
    a = ap.parse_args()

    project = Path(a.project).resolve()
    if not project.exists():
        project = (ROOT / a.project).resolve()
    audio_dir = project / "work" / "audio"
    analysis = project / "work" / "analysis"
    analysis.mkdir(parents=True, exist_ok=True)
    cuts_path = analysis / "cuts.json"
    existing = json.loads(cuts_path.read_text()) if cuts_path.exists() else {}
    ae = find_auto_editor()

    wavs = [w for w in sorted(audio_dir.glob("*.wav")) if not a.clips or w.stem in a.clips]
    wavs = [w for w in wavs if w.stem != "preview"]  # verify_cut's render transcript, not a clip
    if not wavs:
        sys.exit(f"no clip audio in {audio_dir} (extract it first: /clean-cut step 1)")

    clips = []
    for wav in wavs:
        silent, _ = silences(ae, wav, a.threshold, a.margin)
        dur = wav_duration(wav)
        words = load_words(project, wav.stem)
        raw = raw_file_for(project, wav.stem, existing)
        c = draft_clip(project, wav.stem, wav, silent, dur, words, a.min_pause, a.dead_air, not a.no_fillers, raw)
        clips.append(c)
        kept = sum(k["e"] - k["s"] for k in c["keeps"])
        by = {}
        for x in c["cuts"]:
            by[x["cat"]] = by.get(x["cat"], 0) + 1
        print(f"{wav.stem}: {dur:.1f}s -> {kept:.1f}s kept ({100 * kept / max(dur, 1e-6):.0f}%), "
              f"{len(c['keeps'])} keeps, cuts {by or '{}'}" + ("" if words else "  [no transcript: text + fillers skipped]")
              + ("" if raw else "  [raw file not found: set clips[].file]"))

        if a.nle:
            if not raw:
                print(f"  skip --nle for {wav.stem}: no raw file")
                continue
            ext = {"resolve": "fcpxml", "final-cut-pro": "fcpxml", "premiere": "xml",
                   "shotcut": "mlt", "kdenlive": "kdenlive"}[a.nle]
            out = analysis / f"{wav.stem}-{a.nle}.{ext}"
            r = subprocess.run([ae, str(project / raw), "--edit", f"audio:threshold={a.threshold}",
                                "--margin", a.margin, "--export", a.nle, "-o", str(out), "--no-open"],
                               capture_output=True, text=True)
            print(f"  {a.nle} timeline -> {out.relative_to(project)}" if r.returncode == 0 and out.exists()
                  else f"  {a.nle} export failed: {(r.stdout + r.stderr)[-400:]}")

    doc = {
        "project": project.name,
        "clip_order": [c["id"] for c in clips],
        "clips": clips,
        "styles": existing.get("styles", HOUSE_STYLES),
        "flags": [],
        "note": ("DRAFT from tools/auto_cut.py (auto-editor silences + transcript fillers). "
                 "Retakes, false starts, doubled phrases and fluff are NOT decided yet: /clean-cut does that."),
    }
    auto_path = analysis / "cuts.auto.json"
    auto_path.write_text(json.dumps(doc, indent=1, ensure_ascii=False))
    print(f"draft -> {auto_path.relative_to(project)}")
    if a.write:
        if cuts_path.exists():
            print("cuts.json already exists: left untouched (merge from cuts.auto.json by hand or in /clean-cut)")
        else:
            cuts_path.write_text(json.dumps(doc, indent=1, ensure_ascii=False))
            print(f"cuts.json -> {cuts_path.relative_to(project)}")


if __name__ == "__main__":
    main()
