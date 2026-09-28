#!/usr/bin/env python3
"""
fetch_kokoro.py: install the free, local Kokoro-82M voice model for tools/gen_vo_local.py.

Kokoro-82M is an Apache-2.0 text-to-speech model that runs on CPU faster than real time.
Its usual home is Hugging Face, which some networks block. This tool gets the same model
from the npm registry instead, which almost every machine can reach:

  - kokoro-fp32{a,b,c}-shards : the fp32 ONNX weights, split into 19 parts across three
                         packages (concatenated here). Not the fp16 build: on CPU it
                         overflows to NaN on some sentences and returns silence.
  - kokoro-js          : ships the voice style vectors (one 510x256 float32 .bin per voice)

It writes tools/models/kokoro/ (git-ignored):
  kokoro-fp32.onnx     the model (about 325 MB)
  voices-en.npz        every English voice (af_*, am_*, bf_*, bm_*), in the npz layout
                       kokoro-onnx expects

Usage (from the repo root, with the venv active; needs `npm` on PATH):
  python tools/fetch_kokoro.py
  python tools/fetch_kokoro.py --force        # rebuild even if present

Then: python tools/gen_vo_local.py videos/<project>/script/vo.json
"""
import argparse
import glob
import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "models" / "kokoro"
WEIGHTS = ["kokoro-fp32a-shards@1.0.0", "kokoro-fp32b-shards@1.0.0", "kokoro-fp32c-shards@1.0.0"]
VOICES = "kokoro-js@1.2.1"
N_SHARDS = 19


def npm_pack(spec: str, dest: Path) -> Path:
    npm = shutil.which("npm")
    if not npm:
        sys.exit("npm not found on PATH (it ships with Node, which Remotion needs anyway)")
    out = subprocess.run([npm, "pack", spec, "--silent"], cwd=dest, check=True,
                         capture_output=True, text=True).stdout.strip().splitlines()[-1]
    tgz = dest / out
    with tarfile.open(tgz) as t:
        t.extractall(dest / tgz.stem, filter="data")
    return dest / tgz.stem / "package"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    model, voices = OUT / "kokoro-fp32.onnx", OUT / "voices-en.npz"
    if model.exists() and voices.exists() and not args.force:
        print(f"already installed: {OUT}")
        return
    OUT.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        parts = []
        for spec in WEIGHTS:
            print(f"fetching {spec} ...")
            parts += list(npm_pack(spec, tmp).glob("kokoro-fp32.part*.bin"))
        parts.sort(key=lambda p: int(p.stem.split("part")[-1]))
        if [int(p.stem.split("part")[-1]) for p in parts] != list(range(N_SHARDS)):
            sys.exit(f"expected weight shards 0..{N_SHARDS - 1}, found {len(parts)}")
        with open(model, "wb") as f:
            for p in parts:
                f.write(p.read_bytes())

        print(f"fetching {VOICES} ...")
        v = npm_pack(VOICES, tmp)
        vecs = {}
        for f in sorted(glob.glob(str(v / "voices" / "*.bin"))):
            name = os.path.basename(f)[:-4]
            if name[:2] in ("af", "am", "bf", "bm"):
                vecs[name] = np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256)
        np.savez(voices, **vecs)

    # sanity: the model loads and exposes the inputs kokoro-onnx drives
    import onnxruntime as ort
    names = [i.name for i in ort.InferenceSession(str(model)).get_inputs()]
    assert {"style", "speed"} <= set(names), names
    print(f"ok: {model.name} ({model.stat().st_size // 1_000_000} MB), {len(vecs)} voices -> {OUT}")


if __name__ == "__main__":
    main()
