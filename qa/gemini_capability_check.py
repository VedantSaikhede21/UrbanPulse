"""Verify the candidate models can do what the agents actually need.

Text generation alone is not enough: the Vision agent sends a photo, and the
CX agent can send a voice note. A model that answers text but rejects images
would silently push the demo back onto the rule-based path for exactly the
case a judge cares about.
"""

import asyncio
import base64
import struct
import sys
import zlib

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.config import settings

if not settings.GEMINI_API_KEY:
    print("no GEMINI_API_KEY")
    raise SystemExit(0)

import google.genai as genai
from google.genai import types as gtypes

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _png(width: int, height: int, rgb: tuple[int, int, int]) -> bytes:
    """Build a valid solid-colour PNG without an image library."""
    raw = b"".join(b"\x00" + bytes(rgb) * width for _ in range(height))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw))
            + chunk(b"IEND", b""))


# A muddy-brown square stands in for a pothole photo well enough to prove the
# multimodal path accepts and returns content.
IMAGE = _png(32, 32, (120, 90, 60))

TEXT_PROMPT = "A citizen reports a burst water pipeline flooding a road. Reply with one word: the category."
IMAGE_PROMPT = "What is in this image? Reply with one word describing the civic issue."

CANDIDATES = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.6-flash"]


async def probe_text(model):
    try:
        r = await asyncio.to_thread(
            client.models.generate_content, model=model, contents=TEXT_PROMPT,
            config=gtypes.GenerateContentConfig(max_output_tokens=32))
        return f"OK -> {getattr(r, 'text', None)!r}"
    except Exception as e:
        return f"{type(e).__name__}: {str(e)[:110]}"


async def probe_image(model):
    part = gtypes.Part.from_bytes(data=IMAGE, mime_type="image/png")
    try:
        r = await asyncio.to_thread(
            client.models.generate_content, model=model,
            contents=[IMAGE_PROMPT, part],
            config=gtypes.GenerateContentConfig(max_output_tokens=32))
        txt = getattr(r, "text", None)
        return f"OK -> {txt!r}" if txt else "OK but empty response"
    except Exception as e:
        return f"{type(e).__name__}: {str(e)[:110]}"


async def main():
    for m in CANDIDATES:
        print(f"\n--- {m} ---")
        print(f"  text : {await probe_text(m)}")
        print(f"  image: {await probe_image(m)}")


asyncio.run(main())
