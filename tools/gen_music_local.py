#!/usr/bin/env python3
"""
gen_music_local.py: generate the music library LOCALLY with ACE-Step 1.5 (free, and the music
is yours). Same palette in, same catalog out as tools/gen_music.py (ElevenLabs), so
tools/mix_music.py and every skill use the result unchanged.

Why this exists: the template's music was generated on someone else's ElevenLabs account. ACE-Step
1.5's code and model weights are MIT-licensed (checked on the Hugging Face model cards, incl. the XL
models), so what you generate on your own machine is yours to publish and monetize. It is still an
AI model trained on music: listen before you publish, and don't prompt for a named artist's sound.

ACE-Step runs as its own local server (it has heavy, GPU-specific dependencies, so it stays out of
this repo's venv). One-time setup, in any folder OUTSIDE this repo:
    git clone https://github.com/ACE-Step/ACE-Step-1.5.git
    cd ACE-Step-1.5
    uv sync                      # Python 3.11/3.12; see its README for Windows / Mac notes
    uv run acestep-api           # serves http://127.0.0.1:8001, downloads weights on first run
Hardware: an NVIDIA GPU with 6 GB+ VRAM (or Apple Silicon) makes a 3-minute bed in seconds. CPU
works but is slow (minutes per track).

Usage (server running):
  python tools/gen_music_local.py                        # generate every palette bed not on disk yet
  python tools/gen_music_local.py --only night-drive     # one bed
  python tools/gen_music_local.py --only night-drive --length 420 --force   # full-length regen (seconds)
  python tools/gen_music_local.py --only night-drive --seed 1234 --variants 3   # audition 3 takes
  python tools/gen_music_local.py --dry-run
Env: ACESTEP_URL (default http://127.0.0.1:8001), ACESTEP_API_KEY if you set one on the server.

Palette beds may set "bpm" (it locks the cut grid, see brand.md section 6) and "duration_s"
(10-600 s; tools/mix_music.py loops a bed under longer videos).
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from gen_music import CATALOG, MUSIC_DIR, PALETTE, normalize_clip, probe_duration

URL = os.environ.get("ACESTEP_URL", "http://127.0.0.1:8001").rstrip("/")
KEY = os.environ.get("ACESTEP_API_KEY", "")
SOURCE = "acestep:1.5"
LICENSE = ("ACE-Step 1.5 (MIT code + MIT weights), generated locally by the channel owner; "
           "output owned by the channel. Listen before publishing (AI output can resemble existing music).")


def call(path, body=None, timeout=60):
    headers = {"Content-Type": "application/json"}
    if KEY:
        headers["Authorization"] = f"Bearer {KEY}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(URL + path, data=data, headers=headers, method="POST" if data else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
    return raw if path.startswith("/v1/audio") else json.loads(raw)


def server_up():
    try:
        call("/health", timeout=5)
        return True
    except Exception:
        return False


def submit(prompt, seconds, bpm, seed):
    body = {
        "prompt": prompt,
        "lyrics": "[Instrumental]",  # ACE-Step's documented instrumental convention
        "audio_duration": seconds,
        "audio_format": "mp3",
        "batch_size": 1,
        "inference_steps": 8,        # turbo defaults, per the ACE-Step inference guide
        "shift": 3.0,
        "thinking": False,
        "seed": seed if seed is not None else -1,
        "use_random_seed": seed is None,
    }
    if bpm:
        body["bpm"] = int(bpm)
    resp = call("/release_task", body)
    if resp.get("code") != 200 or not resp.get("data"):
        raise RuntimeError(f"release_task failed: {resp.get('error') or resp}")
    return resp["data"]["task_id"]


def wait(task_id, timeout_s):
    t0 = time.time()
    while time.time() - t0 < timeout_s:
        resp = call("/query_result", {"task_id_list": [task_id]})
        item = (resp.get("data") or [{}])[0]
        status = item.get("status")
        if status == 1:
            result = item.get("result")
            result = json.loads(result) if isinstance(result, str) else result
            return result[0]
        if status == 2:
            raise RuntimeError(f"generation failed: {item}")
        time.sleep(3)
        print(f"   ... {time.time() - t0:.0f}s", end="\r")
    raise RuntimeError(f"timed out after {timeout_s}s (a CPU-only server can be this slow; raise --timeout)")


def download(result, dest):
    f = result["file"]
    if f.startswith("http"):
        parsed = urllib.parse.urlparse(f)
        f = parsed.path + ("?" + parsed.query if parsed.query else "")
    audio = call(f, timeout=300)
    if len(audio) < 1000:
        raise RuntimeError(f"downloaded audio is only {len(audio)} bytes")
    with open(dest, "wb") as fh:
        fh.write(audio)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", help="comma-separated bed ids")
    ap.add_argument("--length", type=float, help="override duration in SECONDS (10-600)")
    ap.add_argument("--seed", type=int, help="fixed seed (reproducible take)")
    ap.add_argument("--variants", type=int, default=1, help="generate N takes as <id>-v1.mp3 ... to audition")
    ap.add_argument("--force", action="store_true", help="regenerate beds that already exist")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--timeout", type=int, default=1800, help="seconds to wait per track")
    a = ap.parse_args()

    with open(PALETTE, encoding="utf-8") as f:
        palette = json.load(f)
    d = palette.get("defaults", {})
    target_lufs, ceiling_db = d.get("target_lufs", -20.0), d.get("ceiling_dbfs", -1.5)
    only = set(a.only.split(",")) if a.only else None

    catalog = {"note": "", "clips": []}
    if os.path.exists(CATALOG):
        with open(CATALOG, encoding="utf-8") as f:
            catalog = json.load(f)
    by_id = {c["id"]: c for c in catalog.get("clips", [])}
    clips_dir = os.path.join(MUSIC_DIR, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    todo = []
    for s in palette["beds"]:
        if only and s["id"] not in only:
            continue
        secs = max(10.0, min(600.0, float(a.length or s.get("duration_s", 60))))
        for v in range(1, a.variants + 1):
            bid = s["id"] if a.variants == 1 else f"{s['id']}-v{v}"
            path = os.path.join(clips_dir, f"{bid}.mp3")
            if os.path.exists(path) and not a.force:
                print(f"skip {bid} (exists; --force to regenerate)")
                continue
            todo.append((s, bid, path, secs, None if a.seed is None else a.seed + v - 1))
    if only and not any(s["id"] in only for s in palette["beds"]):
        sys.exit(f"no palette bed matches --only {a.only}; ids: {', '.join(s['id'] for s in palette['beds'])}")

    print(f"ACE-Step server: {URL} | to generate: {len(todo)}")
    if a.dry_run or not todo:
        for s, bid, _, secs, seed in todo:
            print(f"  WOULD generate {bid}: {secs:.0f}s, bpm {s.get('bpm', 'auto')}, seed {seed if seed is not None else 'random'}")
        return
    if not server_up():
        sys.exit(f"no ACE-Step server at {URL}. Start it first (setup steps: python tools/gen_music_local.py --help)")

    for s, bid, path, secs, seed in todo:
        print(f"\n-> {bid}  ({secs:.0f}s, bpm {s.get('bpm', 'auto')})")
        t0 = time.time()
        try:
            result = wait(submit(s["prompt"], secs, s.get("bpm"), seed), a.timeout)
            download(result, path)
        except (RuntimeError, urllib.error.URLError) as e:
            sys.exit(f"   {bid}: {e}")
        lufs, peak = normalize_clip(path, target_lufs, ceiling_db)
        dur = probe_duration(path)
        metas = result.get("metas") or {}
        print(f"   done in {time.time() - t0:.0f}s: {dur}s, {lufs} LUFS, peak {peak} dBFS, bpm {metas.get('bpm')}")
        by_id[bid] = {
            "id": bid, "file": f"clips/{bid}.mp3", "category": s.get("category", ""), "tags": s.get("tags", []),
            "duration_s": dur, "requested_ms": int(secs * 1000), "bpm": metas.get("bpm") or s.get("bpm"),
            "key": metas.get("keyscale"), "seed": result.get("seed_value"), "peak_dbfs": peak,
            "loudness_lufs": lufs, "source": SOURCE, "model": result.get("dit_model"),
            "force_instrumental": True, "license": LICENSE, "prompt": s["prompt"],
            "used_in": by_id.get(bid, {}).get("used_in", []),
        }
        order = [x["id"] for x in palette["beds"]]
        catalog["clips"] = sorted(by_id.values(), key=lambda c: (order.index(c["id"].rsplit("-v", 1)[0])
                                                                 if c["id"].rsplit("-v", 1)[0] in order else 999, c["id"]))
        with open(CATALOG, "w", encoding="utf-8") as f:  # write after every bed: a crash keeps what's done
            json.dump(catalog, f, indent=2, ensure_ascii=False)
            f.write("\n")
    print(f"\ncatalog -> media/library/music/catalog.json ({len(catalog['clips'])} beds)")


if __name__ == "__main__":
    main()
