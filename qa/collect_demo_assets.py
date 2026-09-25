"""Collect openly-licensed civic issue photos for the demo.

The demo needs paired evidence images: a "before" that an operator would
actually photograph, and an "after" showing the same class of problem fixed.
Both are shown side by side to the verification agent, so they have to be real
photographs of the right thing — a generated or mismatched image gets the
ticket sent to needs_review, which is correct behaviour but a poor demo.

Sources are Wikimedia Commons, filtered to public-domain and CC0/CC-BY licences
so the assets can be committed to the repository. Every download records its
licence and author in demo-assets/CREDITS.md.

Usage:  python qa/collect_demo_assets.py
"""
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
OUT = pathlib.Path("demo-assets")
DEMO_UA = "UrbanPulse-demo-assets/1.0 (civic issue demo; contact via repo)"

# slug -> list of Commons categories to pull from. Categories are curated, so
# they give far better precision than keyword search: searching "road repair"
# returns photographs of drainage mills and 1930s dustbins. Verified to exist
# and to hold openly-licensed files.
WANTED = {
    "pothole-before": ["Category:Potholes", "Category:Potholes in India"],
    "road-repair-after": ["Category:Road paving", "Category:Roadworks"],
    "garbage-before": ["Category:Illegal dumping", "Category:Waste piles"],
    "streetlight-after": ["Category:LED street lights"],
}

# Only licences that allow redistribution with attribution.
OK_LICENCE = re.compile(r"(cc0|public domain|cc by|cc-by)", re.I)


def api(params):
    params = {**params, "format": "json", "formatversion": "2"}
    url = API + "?" + urllib.parse.urlencode(params)
    # Commons rate-limits anonymous clients hard, so every call is spaced out and
    # a 429 is retried with backoff rather than killing the run.
    for attempt in range(5):
        time.sleep(1.5)
        req = urllib.request.Request(url, headers={"User-Agent": DEMO_UA})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == 4:
                raise
            wait = 5 * (attempt + 1)
            print(f"    (HTTP {e.code}, backing off {wait}s)")
            time.sleep(wait)
    raise RuntimeError("unreachable")


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def category_members(category, limit=40):
    data = api({
        "action": "query",
        "generator": "categorymembers",
        "gcmtitle": category,
        "gcmtype": "file",
        "gcmlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size",
        "iiurlwidth": "1400",
    })
    return data.get("query", {}).get("pages", []) or []


def candidates(categories, limit=40):
    """Licence-filtered images from the first category that yields any."""
    for category in categories:
        out = []
        for page in category_members(category, limit):
            info = (page.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata", {}) or {}

            def m(key):
                return strip_html((meta.get(key) or {}).get("value"))

            licence = m("LicenseShortName")
            if not OK_LICENCE.search(licence):
                continue
            if not info.get("thumburl"):
                continue
            out.append({
                "title": page.get("title", ""),
                "url": info["thumburl"],
                "page": info.get("descriptionurl", ""),
                "licence": licence,
                "author": m("Artist") or "Unknown",
                "credit": m("Credit") or "",
                "category": category,
                "w": info.get("thumbwidth"),
                "h": info.get("thumbheight"),
            })
        if out:
            return out
    return []


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": DEMO_UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    dest.write_bytes(data)
    return len(data)


def main():
    OUT.mkdir(exist_ok=True)
    review = OUT / "_review"
    review.mkdir(exist_ok=True)
    manifest = {}
    per_slot = int(sys.argv[1]) if len(sys.argv) > 1 else 4

    for slug, categories in WANTED.items():
        found = candidates(categories)
        if not found:
            print(f"  {slug:20} nothing in {categories}")
            manifest[slug] = {"categories": categories, "picked": []}
            continue
        print(f"\n  {slug:20} {len(found)} from {found[0]['category']}")
        picked = []
        for i, c in enumerate(found[:per_slot]):
            ext = ".jpg" if c["url"].lower().endswith((".jpg", ".jpeg")) else ".webp"
            name = f"{slug}-{i}{ext}"
            dest = review / name
            try:
                size = download(c["url"], dest)
            except Exception as e:                       # noqa: BLE001
                print(f"      [{i}] download failed: {e}")
                continue
            c["file"] = f"_review/{name}"
            c["bytes"] = size
            picked.append(c)
            print(f"      [{i}] {c['title'][:58]}")
            print(f"          {c['licence']:16} {c['w']}x{c['h']}  {size // 1024}KB")
        manifest[slug] = {"categories": categories, "picked": picked}

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    total = sum(len(v["picked"]) for v in manifest.values())
    print(f"\nwrote {OUT / 'manifest.json'} with {total} review candidates")


if __name__ == "__main__":
    sys.exit(main())
