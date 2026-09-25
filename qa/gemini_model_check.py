"""List the Gemini models this key can actually reach, then probe the flash
models for one that answers a real generation request.

gemini-2.5-flash now 404s for new users, and gemini-3.8-flash was returning
503 UNAVAILABLE ("high demand") at the time of writing. Rather than hardcoding
a model that may be throttled, enumerate and verify.
"""

import asyncio
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.config import settings

if not settings.GEMINI_API_KEY:
    print("no GEMINI_API_KEY")
    raise SystemExit(0)

import google.genai as genai
from google.genai import types as gtypes

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# 1. what does the key say it can use?
try:
    listed = []
    for m in client.models.list():
        name = getattr(m, "name", "") or ""
        short = name.split("/")[-1]
        if True:
            listed.append(short)
    print(f"flash/lite models visible to this key ({len(listed)}):")
    for n in sorted(listed):
        print(f"  {n}")
except Exception as exc:
    print(f"list failed: {type(exc).__name__}: {exc}")
    listed = []

CANDIDATES = ["gemini-3.8-flash-lite-latest", "gemini-flash-lite-latest",
              "gemini-3.5-flash-lite", "gemini-3.7-flash", "gemini-3.6-flash",
              "gemini-3.5-flash", "gemini-3.8-flash"]

prompt = "A citizen reports a burst water pipeline flooding a road. Reply with one word: the complaint category."


async def probe(model: str) -> tuple[str, str]:
    try:
        resp = await asyncio.to_thread(
            client.models.generate_content,
            model=model,
            contents=prompt,
            config=gtypes.GenerateContentConfig(max_output_tokens=20),
        )
        return model, f"OK -> {getattr(resp, 'text', None)!r}"
    except Exception as exc:
        return model, f"{type(exc).__name__}: {str(exc)[:160]}"


async def main() -> None:
    print("\n=== real generation probe (one call each) ===")
    for model in CANDIDATES:
        if listed and model not in listed:
            print(f"  {model:26} skipped (not visible to this key)")
            continue
        name, outcome = await probe(model)
        print(f"  {name:26} {outcome}")


asyncio.run(main())
