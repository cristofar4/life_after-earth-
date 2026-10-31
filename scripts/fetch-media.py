"""Download and prepare the real photographs and video used by AFTER EARTH.

Sources are listed in scripts/media-sources.json (Wikimedia Commons file titles).
For each entry this script:
  * reads the file's licence, author and location from the Commons API,
  * downloads the original,
  * photos  -> responsive WebP files  public/media/<id>-<width>.webp
  * videos  -> a muted, seamlessly looping H.264 MP4 (crossfaded end → start)
               plus a WebP poster frame,
  * writes src/credits.json so the site can show attribution.

Wikimedia is accessed politely, following its rate-limit guidance: one request
at a time with an identifying User-Agent, a pause between downloads, any HTTP
429 answered by waiting for Retry-After, and photos fetched as thumbnails in
Wikimedia's standard sizes (1920 / 3840 px) rather than full originals.

Usage:  python3 scripts/fetch-media.py [--download-only] [id ...]
"""
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import cv2

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "scripts" / "media-sources.json"
OUT = ROOT / "public" / "media"
RAW = ROOT / ".media-cache"
CREDITS = ROOT / "src" / "credits.json"
UA = "AfterEarthSite/1.0 (christopherpraise159@gmail.com) python-urllib"
API = "https://commons.wikimedia.org/w/api.php"


def request(url, binary=False):
    for _ in range(10):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = int(e.headers.get("Retry-After", "40")) + 2
                print(f"  rate limited, waiting {wait}s", flush=True)
                time.sleep(wait)
                continue
            raise
    raise RuntimeError(f"gave up on {url}")


def strip(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


def info(title):
    params = dict(action="query", titles=title, prop="imageinfo",
                  iiprop="url|size|mime|extmetadata", format="json")
    d = request(f"{API}?{urllib.parse.urlencode(params)}")
    page = next(iter(d["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise RuntimeError(f"not found on Commons: {title}")
    ii = page["imageinfo"][0]
    m = ii.get("extmetadata", {})
    val = lambda k: strip(m.get(k, {}).get("value", ""))
    lat, lon = val("GPSLatitude"), val("GPSLongitude")
    return {
        "url": ii["url"].split("?")[0],
        "page": ii["descriptionurl"],
        "width": ii["width"],
        "height": ii["height"],
        "mime": ii["mime"],
        "author": val("Artist") or "Unknown",
        "license": val("LicenseShortName"),
        "licenseUrl": val("LicenseUrl"),
        "gps": [float(lat), float(lon)] if lat and lon else None,
    }


def download(url, dest):
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"  downloading {url}", flush=True)
    dest.write_bytes(request(url, binary=True))
    time.sleep(12)
    return dest


def crop_to(img, aspect, focus):
    if not aspect:
        return img
    h, w = img.shape[:2]
    fx, fy = focus
    if w / h > aspect:  # too wide
        nw = int(h * aspect)
        x0 = int((w - nw) * fx)
        return img[:, x0:x0 + nw]
    nh = int(w / aspect)
    y0 = int((h - nh) * fy)
    return img[y0:y0 + nh]


def photo(entry, src):
    img = cv2.imread(str(src), cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError(f"could not decode {src}")
    img = crop_to(img, entry.get("aspect"), entry.get("focus", [0.5, 0.5]))
    h, w = img.shape[:2]
    outs = []
    for target in entry.get("widths", [960, 1600, 2400]):
        tw = min(target, w)
        th = round(h * tw / w)
        res = cv2.resize(img, (tw, th), interpolation=cv2.INTER_AREA) if tw < w else img
        name = f"{entry['id']}-{tw}.webp"
        cv2.imwrite(str(OUT / name), res, [cv2.IMWRITE_WEBP_QUALITY, entry.get("quality", 80)])
        outs.append({"file": name, "width": tw, "height": th})
        if tw == w:
            break
    print(f"  wrote {', '.join(o['file'] for o in outs)}", flush=True)
    return {"sizes": outs, "aspect": round(w / h, 4)}


def video(entry, src):
    start = entry.get("start", 0)
    dur = entry.get("duration", 9)
    fade = entry.get("fade", 1.2)
    width = entry.get("width", 1920)
    name = f"{entry['id']}.mp4"
    matte = entry.get("matte")
    if matte:
        # Keep only the bright drifting fog: crop the fog bank, threshold its
        # brightness into a soft greyscale matte (black = transparent when the
        # page screen-blends it over the photograph).
        m = {"y": 0.37, "h": 0.27, "lo": 150, "gain": 3, "blur": 1.5, **(matte if isinstance(matte, dict) else {})}
        vf = (f"crop=iw:ih*{m['h']}:0:ih*{m['y']},format=gray,"
              f"lutyuv=y='clip((val-{m['lo']})*{m['gain']}\\,0\\,255)',gblur=sigma={m['blur']},"
              f"scale={width}:-2:flags=lanczos,fps={entry.get('fps', 30)},format=yuv420p")
    else:
        pre = []
        if entry.get("stabilize"):
            # Two-pass stabilisation (vid.stab) for hand-held footage.
            trf = RAW / f"{entry['id']}.trf"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(dur + fade + 0.5),
                            "-i", str(src), "-vf", f"vidstabdetect=shakiness=6:accuracy=15:result={trf}",
                            "-f", "null", "-"], check=True)
            pre.append(f"vidstabtransform=input={trf}:smoothing=45:optzoom=1:interpol=bicubic")
        if entry.get("crop"):
            # Keep a top-anchored, centred fraction of the frame (removes burnt-in captions).
            k = entry["crop"]
            pre.append(f"crop=iw*{k}:ih*{k}:(iw-ow)/2:0")
        vf = ",".join(pre + [f"scale={width}:-2:flags=lanczos", "crop=iw:min(ih\\,iw*9/16)",
                             f"fps={entry.get('fps', 30)}", "format=yuv420p"])
    if entry.get("pingpong"):
        # Forward, then the same frames in reverse: a moving camera that eases
        # back on itself — no seam and no ghosting at the loop point.
        graph = (f"[0:v]{vf},trim=0:{dur},setpts=PTS-STARTPTS,split[a][b];"
                 f"[b]reverse[r];"
                 f"[a][r]xfade=transition=fade:duration={fade}:offset={dur - fade},format=yuv420p[v]")
    else:
        graph = (f"[0:v]{vf},split[a][b];"
                 f"[a]trim={fade}:{dur + fade},setpts=PTS-STARTPTS[main];"
                 f"[b]trim=0:{fade},setpts=PTS-STARTPTS[head];"
                 f"[main][head]xfade=transition=fade:duration={fade}:offset={dur - fade},format=yuv420p[v]")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(dur + fade + 0.5),
           "-i", str(src), "-filter_complex", graph, "-map", "[v]", "-an",
           "-c:v", "libx264", "-preset", "slow", "-crf", str(entry.get("crf", 23)),
           "-profile:v", "high", "-movflags", "+faststart", str(OUT / name)]
    subprocess.run(cmd, check=True)
    poster = f"{entry['id']}-poster.webp"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT / name), "-frames:v", "1",
                    "-c:v", "libwebp", "-quality", "82", str(OUT / poster)], check=True)
    size = (OUT / name).stat().st_size / 1e6
    print(f"  wrote {name} ({size:.1f} MB) + {poster}", flush=True)
    return {"file": name, "poster": poster, "duration": dur}


def main():
    entries = json.loads(SOURCES.read_text())
    args = sys.argv[1:]
    download_only = "--download-only" in args
    only = {a for a in args if not a.startswith("--")}
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() else {}
    OUT.mkdir(parents=True, exist_ok=True)
    for e in entries:
        if only and e["id"] not in only:
            continue
        print(f"{e['id']}: {e['title']}", flush=True)
        meta = info(e["title"])
        time.sleep(3)
        url = meta["url"]
        head, name = url.rsplit("/", 1)
        if e.get("type") == "video":
            # Commons' own transcode at a standard height, not the master file.
            url = f"{head.replace('/commons/', '/commons/transcoded/', 1)}/{name}/{name}.{e.get('transcode', '1080p.vp9.webm')}"
        else:
            cap = e.get("thumbWidth", 1920)
            if meta["width"] > cap:
                url = f"{head.replace('/commons/', '/commons/thumb/', 1)}/{name}/{cap}px-{name}"
        ext = Path(urllib.parse.urlparse(url).path).suffix.lower()
        src = download(url, RAW / f"{e['id']}{ext}")
        if download_only:
            continue
        out = video(e, src) if e.get("type") == "video" else photo(e, src)
        credits[e["id"]] = {
            "title": e["title"].removeprefix("File:"),
            "author": meta["author"],
            "license": meta["license"],
            "licenseUrl": meta["licenseUrl"],
            "source": meta["page"],
            "gps": meta["gps"],
            **{k: e[k] for k in ("place", "coords", "mark") if k in e},
            **out,
        }
        CREDITS.write_text(json.dumps(credits, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
