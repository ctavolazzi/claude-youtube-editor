#!/usr/bin/env python3
"""
grab_source.py: pull third-party material into a commentary video, and LOG it.

Every clip and screenshot that goes on screen in a beeplumbgh video is somebody else's work
used under fair use (commentary / criticism). That defense rests on what you took, how much,
and what you did with it, so this tool never grabs anything without writing it down in the
project's source ledger: videos/<project>/work/sources.json. The ledger is committed; the
media it points at is not (it is re-grabbable, and it is not ours to redistribute).

Subcommands (run from the repo root):

  clip   URL  --project videos/X --start 1:12 --end 1:20 --why "what I say about it"
         Downloads ONLY that section (yt-dlp --download-sections) to
         media/projects/X/clips/<slug>.mp4 -> staticFile('projects/X/clips/<slug>.mp4')
         for <ClipFrame src=...>. Warns past 15s, refuses past 30s without --force.

  page   URL  --project videos/X [--name slug] [--full] [--width 1600 --height 900]
         Screenshots a web page (Playwright Chromium) to media/projects/X/sources/<slug>.png
         for <SourceCard img=...>. Needs: pip install playwright

  image  PATH_OR_URL --project videos/X --credit "Who made it" [--name slug]
         Registers an image you already have (or downloads it) into the same folder + ledger.

  credits --project videos/X
         Prints the description-ready "Sources" block from the ledger. Paste it into the
         YouTube description; /packaging reads the same ledger.

  list   --project videos/X

Requirements: yt-dlp (pip install yt-dlp) + ffmpeg on PATH for `clip`.
"""
import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WARN_S = 15.0
MAX_S = 30.0


def proj_name(project):
    """'videos/video-4' -> 'video-4'. Project paths resolve against the CWD (repo root)."""
    return os.path.basename(os.path.normpath(project))


def ledger_path(project):
    return os.path.join(os.path.abspath(project), "work", "sources.json")


def load_ledger(project):
    p = ledger_path(project)
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    return {"project": proj_name(project), "sources": []}


def save_ledger(project, data):
    p = ledger_path(project)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def media_dir(project, kind):
    d = os.path.join(ROOT, "media", "projects", proj_name(project), kind)
    os.makedirs(d, exist_ok=True)
    return d


def slugify(s, fallback="source"):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s or "").strip("-").lower()
    return s[:60] or fallback


def to_seconds(t):
    """'1:12' / '01:02:03' / '72.5' -> seconds."""
    parts = [float(p) for p in str(t).split(":")]
    s = 0.0
    for p in parts:
        s = s * 60 + p
    return s


def fmt_ts(sec):
    sec = int(round(sec))
    h, m, s = sec // 3600, (sec % 3600) // 60, sec % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def record(project, entry):
    data = load_ledger(project)
    data["sources"] = [e for e in data["sources"] if e.get("file") != entry["file"]]
    entry["added"] = dt.date.today().isoformat()
    data["sources"].append(entry)
    save_ledger(project, data)
    print(f"  ledger -> {os.path.relpath(ledger_path(project))} ({len(data['sources'])} sources)")


def probe_meta(url):
    """Title + channel for the credit line, without downloading."""
    try:
        out = subprocess.run(["yt-dlp", "--skip-download", "--dump-single-json", "--no-warnings", url],
                             capture_output=True, text=True, timeout=120)
        m = json.loads(out.stdout)
        return {"title": m.get("title"), "channel": m.get("channel") or m.get("uploader"),
                "published": m.get("upload_date")}
    except Exception:
        return {}


def cmd_clip(a):
    if not shutil.which("yt-dlp"):
        sys.exit("yt-dlp not found: pip install yt-dlp (and ffmpeg on PATH)")
    start, end = to_seconds(a.start), to_seconds(a.end)
    dur = end - start
    if dur <= 0:
        sys.exit("--end must be after --start")
    if dur > MAX_S and not a.force:
        sys.exit(f"{dur:.1f}s is long for a quoted clip. Take less, or pass --force and say why in --why.")
    if dur > WARN_S:
        print(f"  WARNING: {dur:.1f}s excerpt. Fair use favors taking only what the point needs.")
    if not a.why:
        sys.exit("--why is required: one line on what you are saying ABOUT this clip.")
    meta = probe_meta(a.url)
    slug = a.name or slugify(f"{meta.get('channel', '')}-{meta.get('title', '')}-{int(start)}")
    out = os.path.join(media_dir(a.project, "clips"), slug + ".mp4")
    cmd = ["yt-dlp", "--no-warnings", "--no-playlist",
           "-f", "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]/b",
           "--merge-output-format", "mp4",
           "--download-sections", f"*{start}-{end}", "--force-keyframes-at-cuts",
           "-o", out, a.url]
    print("  " + " ".join(cmd))
    subprocess.run(cmd, check=True)
    rel = os.path.relpath(out, os.path.join(ROOT, "media")).replace(os.sep, "/")
    record(a.project, {
        "kind": "clip", "url": a.url, "title": meta.get("title"), "channel": meta.get("channel"),
        "published": meta.get("published"), "start": fmt_ts(start), "end": fmt_ts(end),
        "duration_s": round(dur, 2), "why": a.why, "file": rel,
    })
    print(f"  -> staticFile('{rel}')")


def cmd_page(a):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("playwright not installed: pip install playwright")
    slug = a.name or slugify(re.sub(r"^https?://(www\.)?", "", a.url))
    out = os.path.join(media_dir(a.project, "sources"), slug + ".png")
    with sync_playwright() as p:
        exe = os.environ.get("CHROMIUM_PATH")
        browser = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
        page = browser.new_page(viewport={"width": a.width, "height": a.height}, device_scale_factor=2)
        page.goto(a.url, wait_until="networkidle", timeout=60000)
        title = page.title()
        page.screenshot(path=out, full_page=a.full)
        browser.close()
    rel = os.path.relpath(out, os.path.join(ROOT, "media")).replace(os.sep, "/")
    record(a.project, {"kind": "page", "url": a.url, "title": title, "why": a.why, "file": rel,
                       "captured": dt.datetime.now().isoformat(timespec="minutes")})
    print(f"  -> staticFile('{rel}')")


def cmd_image(a):
    src = a.src
    ext = os.path.splitext(src.split("?")[0])[1] or ".png"
    slug = a.name or slugify(os.path.splitext(os.path.basename(src.split("?")[0]))[0], "image")
    out = os.path.join(media_dir(a.project, "sources"), slug + ext)
    if re.match(r"^https?://", src):
        urllib.request.urlretrieve(src, out)
    else:
        shutil.copyfile(src, out)
    rel = os.path.relpath(out, os.path.join(ROOT, "media")).replace(os.sep, "/")
    record(a.project, {"kind": "image", "url": src if src.startswith("http") else None,
                       "credit": a.credit, "why": a.why, "file": rel})
    print(f"  -> staticFile('{rel}')")


def cmd_credits(a):
    data = load_ledger(a.project)
    if not data["sources"]:
        print("(no sources logged)")
        return
    print("Sources")
    for e in data["sources"]:
        if e["kind"] == "clip":
            who = e.get("channel") or "unknown channel"
            print(f"- {who}, \"{e.get('title') or e['url']}\" ({e['start']} to {e['end']}): {e['url']}")
        elif e["kind"] == "page":
            print(f"- {e.get('title') or e['url']}: {e['url']}")
        else:
            print(f"- {e.get('credit') or 'image'}{': ' + e['url'] if e.get('url') else ''}")
    print("\nClips and screenshots are used for commentary and criticism under fair use.")


def cmd_list(a):
    data = load_ledger(a.project)
    for e in data["sources"]:
        span = f" {e['start']}-{e['end']} ({e['duration_s']}s)" if e["kind"] == "clip" else ""
        print(f"  [{e['kind']:5}] {e['file']}{span}\n          why: {e.get('why') or '-'}")
    total = sum(e.get("duration_s", 0) for e in data["sources"] if e["kind"] == "clip")
    print(f"  {len(data['sources'])} sources, {total:.1f}s of third-party video")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("clip")
    c.add_argument("url")
    c.add_argument("--project", required=True)
    c.add_argument("--start", required=True)
    c.add_argument("--end", required=True)
    c.add_argument("--why", required=True)
    c.add_argument("--name")
    c.add_argument("--force", action="store_true")
    c.set_defaults(fn=cmd_clip)

    p = sub.add_parser("page")
    p.add_argument("url")
    p.add_argument("--project", required=True)
    p.add_argument("--name")
    p.add_argument("--why")
    p.add_argument("--full", action="store_true")
    p.add_argument("--width", type=int, default=1600)
    p.add_argument("--height", type=int, default=900)
    p.set_defaults(fn=cmd_page)

    i = sub.add_parser("image")
    i.add_argument("src")
    i.add_argument("--project", required=True)
    i.add_argument("--credit", required=True)
    i.add_argument("--name")
    i.add_argument("--why")
    i.set_defaults(fn=cmd_image)

    for name, fn in (("credits", cmd_credits), ("list", cmd_list)):
        s = sub.add_parser(name)
        s.add_argument("--project", required=True)
        s.set_defaults(fn=fn)

    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
