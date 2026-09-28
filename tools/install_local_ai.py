#!/usr/bin/env python3
"""
install_local_ai.py: set up (and check) the free, local replacements for the paid APIs.

  python tools/install_local_ai.py check          # what's installed, what's missing, what it replaces
  python tools/install_local_ai.py deepfilter     # DeepFilterNet binary -> tools/bin/ (voice denoise)
  python tools/install_local_ai.py whisper [MODEL]  # pre-download a faster-whisper model (default large-v3-turbo)
  python tools/install_local_ai.py all            # deepfilter + whisper

Python packages come from requirements-local.txt (pip install -r requirements-local.txt).
Music (ACE-Step) runs as its own local server; `check` tells you whether it's up, and
tools/gen_music_local.py prints the setup steps.

| Paid step (API key)          | Free local replacement                         | Tool                         |
|------------------------------|------------------------------------------------|------------------------------|
| AssemblyAI transcription     | faster-whisper (+ WhisperX alignment)          | tools/transcribe_local.py    |
| ElevenLabs voice isolator    | DeepFilterNet3                                 | tools/clean_voice.py --method deepfilter |
| ElevenLabs music             | ACE-Step 1.5 (local server)                    | tools/gen_music_local.py     |
| (new) silence first pass     | auto-editor                                    | tools/auto_cut.py            |
"""
import os
import platform
import shutil
import stat
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN = os.path.join(ROOT, "tools", "bin")
DF_VERSION = "0.5.6"  # pinned: verified asset names + CLI flags
DF_URL = "https://github.com/Rikorose/DeepFilterNet/releases/download/v{v}/deep-filter-{v}-{target}"
ACESTEP_URL = os.environ.get("ACESTEP_URL", "http://127.0.0.1:8001")


def df_target():
    """Release asset suffix for this machine."""
    sysname, arch = platform.system(), platform.machine().lower()
    x64 = arch in ("x86_64", "amd64")
    arm64 = arch in ("arm64", "aarch64")
    if sysname == "Windows" and x64:
        return "x86_64-pc-windows-msvc.exe"
    if sysname == "Darwin":
        return "aarch64-apple-darwin" if arm64 else "x86_64-apple-darwin"
    if sysname == "Linux":
        if x64:
            return "x86_64-unknown-linux-musl"
        if arm64:
            return "aarch64-unknown-linux-gnu"
        if arch.startswith("armv7"):
            return "armv7-unknown-linux-gnueabihf"
    sys.exit(f"no prebuilt DeepFilterNet for {sysname}/{arch}; use `pip install deepfilternet` instead")


def df_path():
    return os.path.join(BIN, "deep-filter" + (".exe" if os.name == "nt" else ""))


def install_deepfilter():
    dest = df_path()
    if os.path.exists(dest):
        print(f"deep-filter already installed: {os.path.relpath(dest, ROOT)}")
        return
    os.makedirs(BIN, exist_ok=True)
    url = DF_URL.format(v=DF_VERSION, target=df_target())
    print(f"downloading {url}")
    tmp = dest + ".part"
    urllib.request.urlretrieve(url, tmp)
    if os.path.getsize(tmp) < 1_000_000:
        os.remove(tmp)
        sys.exit("download looks wrong (under 1 MB); check the URL above in a browser")
    os.replace(tmp, dest)
    os.chmod(dest, os.stat(dest).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    out = subprocess.run([dest, "--help"], capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(f"installed, but `deep-filter --help` failed:\n{out.stderr[-500:]}")
    print(f"deep-filter {DF_VERSION} -> {os.path.relpath(dest, ROOT)} (model built in, no Python deps)")


def install_whisper(model):
    try:
        from faster_whisper import download_model
    except ImportError:
        sys.exit("faster-whisper not installed: pip install -r requirements-local.txt")
    print(f"downloading faster-whisper model '{model}' (one time, cached by Hugging Face) ...")
    path = download_model(model)
    print(f"ready: {path}")


def check():
    def has_mod(m):
        try:
            __import__(m)
            return True
        except Exception:
            return False

    def acestep_up():
        try:
            with urllib.request.urlopen(ACESTEP_URL + "/health", timeout=3) as r:
                return r.status == 200
        except Exception:
            return False

    exe = ".exe" if os.name == "nt" else ""
    df = os.path.exists(df_path()) or shutil.which("deep-filter") or shutil.which("deepFilter")
    rows = [
        ("ffmpeg + ffprobe", bool(shutil.which("ffmpeg") and shutil.which("ffprobe")), "every tool", "install ffmpeg and put it on PATH"),
        ("faster-whisper", has_mod("faster_whisper"), "transcribe_local.py", "pip install -r requirements-local.txt"),
        ("whisperx (optional)", has_mod("whisperx"), "transcribe_local.py --align", "pip install whisperx"),
        ("auto-editor", bool(shutil.which("auto-editor") or os.path.exists(os.path.join(os.path.dirname(sys.executable), "auto-editor" + exe))),
         "auto_cut.py", "pip install -r requirements-local.txt"),
        ("DeepFilterNet", bool(df), "clean_voice.py --method deepfilter", "python tools/install_local_ai.py deepfilter"),
        ("ACE-Step server", acestep_up(), "gen_music_local.py", f"start it (see gen_music_local.py --help); expected at {ACESTEP_URL}"),
    ]
    w = max(len(r[0]) for r in rows)
    for name, ok, used_by, fix in rows:
        print(f"  {'OK ' if ok else '-- '} {name.ljust(w)}  used by {used_by}" + ("" if ok else f"\n       fix: {fix}"))


def main():
    args = sys.argv[1:]
    cmd = args[0] if args else "check"
    if cmd == "check":
        check()
    elif cmd == "deepfilter":
        install_deepfilter()
    elif cmd == "whisper":
        install_whisper(args[1] if len(args) > 1 else "large-v3-turbo")
    elif cmd == "all":
        install_deepfilter()
        install_whisper(args[1] if len(args) > 1 else "large-v3-turbo")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
