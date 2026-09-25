"""Promote reviewed candidates into the committed demo-assets set.

qa/collect_demo_assets.py pulls openly-licensed candidates into
demo-assets/_review so a human can look at them. This promotes the chosen
ones to stable, descriptively-named files, writes the attribution file the
licences require, and drops the review folder.

The pairing matters more than the individual photos: the verification agent
compares the citizen's "before" photo against the officer's closure photo, so a
before and after have to show the same class of problem actually resolved. A
mismatched pair is correctly sent to needs_review, which is honest but reads
as a failure in a demo.

Usage:  python qa/finalize_demo_assets.py
"""
import json
import pathlib
import shutil

ROOT = pathlib.Path("demo-assets")
REVIEW = ROOT / "_review"
MANIFEST = ROOT / "manifest.json"

# demo file stem -> (manifest slot, index of the reviewed candidate)
PICKS = {
    "pothole-before": ("pothole-before", 1),
    "road-repair-after": ("road-repair-after", 0),
    "garbage-dumping": ("garbage-before", 0),
    "streetlight-led": ("streetlight-after", 0),
}

DESCRIPTIONS = {
    "pothole-before": "Severe pothole with crumbled asphalt on a city road. Used as the citizen's 'before' evidence for a Roads & Potholes report.",
    "road-repair-after": "Fresh asphalt being laid by a paving machine. Used as the officer's closure evidence, i.e. the same class of defect resolved.",
    "garbage-dumping": "Dumped waste on open ground. Used as 'before' evidence for a Garbage & Sanitation report.",
    "streetlight-led": "LED street light in service at night. Used as closure evidence for a Streetlight & Electrical report.",
}

# Commons thumbnail URLs do not reliably match the bytes served: several
# image/webp paths return JPEG. The upload endpoint validates magic bytes
# against the extension, so a mismatched name is rejected as type spoofing.
# The extension therefore comes from the content, never from the URL.
MAGIC = (
    (b"RIFF", ".webp"),
    (b"\x89PNG", ".png"),
    (b"\xff\xd8\xff", ".jpg"),
)


def sniff_ext(path: pathlib.Path) -> str:
    head = path.read_bytes()[:16]
    for sig, ext in MAGIC:
        if head.startswith(sig):
            if ext == ".webp" and b"WEBP" not in head[:16]:
                continue
            return ext
    raise SystemExit(f"unrecognised image format: {path}")

HEADER = """# Demo asset credits

Photographs used by the UrbanPulse demo. Every file here was downloaded from
Wikimedia Commons by `qa/collect_demo_assets.py`, which only accepts
public-domain, CC0 or CC-BY licensed files so the assets can live in this
repository. Attribution is recorded here as those licences require.

Regenerate or extend the set with:

```
python qa/collect_demo_assets.py      # fetch candidates into _review/
python qa/finalize_demo_assets.py     # promote the picks, rewrite this file
```

## Why the pairs matter

The verification agent compares the citizen's uploaded photo against the
closure photo the officer submits. A before/after pair only reaches `verified`
when both show the same class of civic defect and the second one shows it
resolved. Submitting an unrelated photo is correctly rejected to
`needs_review` — the agent reads the images rather than trusting the form.

"""


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    lines = [HEADER]
    for stem, (slot, idx) in PICKS.items():
        cands = manifest.get(slot, {}).get("picked", [])
        if idx >= len(cands):
            print(f"  SKIP {stem}: candidate {idx} missing from slot {slot}")
            continue
        c = cands[idx]
        src = ROOT / c["file"]
        if not src.exists():
            print(f"  SKIP {stem}: {src} not on disk (re-run the collector)")
            continue
        ext = sniff_ext(src)
        name = f"{stem}{ext}"
        dest = ROOT / name
        shutil.copy2(src, dest)
        # Drop any earlier mislabelled copy of the same stem.
        for old in ROOT.glob(f"{stem}.*"):
            if old.name != name:
                old.unlink()
        kb = dest.stat().st_size // 1024
        print(f"  {name:26} {kb:5} KB  <- {c['title']}")
        lines.append(f"## `{name}`\n")
        lines.append(f"{DESCRIPTIONS.get(stem, '')}\n")
        lines.append(f"- Source: [{c['title']}]({c['page']})")
        lines.append(f"- Author: {c['author']}")
        lines.append(f"- Licence: {c['licence']}")
        if c.get("credit"):
            lines.append(f"- Credit: {c['credit']}")
        lines.append(f"- Retrieved from category: `{c['category']}`\n")

    # Author names carry non-ASCII characters, and the default codec on Windows
    # is cp1252, which cannot encode them.
    (ROOT / "CREDITS.md").write_text("\n".join(lines), encoding="utf-8")
    if REVIEW.exists():
        shutil.rmtree(REVIEW)
    print(f"\nwrote {ROOT / 'CREDITS.md'}")


if __name__ == "__main__":
    main()
