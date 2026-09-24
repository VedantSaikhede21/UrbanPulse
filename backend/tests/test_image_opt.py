"""Tests for the Phase 5 image optimization helper.

Coverage:
  1. A 4000x3000 JPEG comes out <= 1600 on the long edge.
  2. A 1024x768 JPEG (already small) is returned byte-equal
     (idempotent — no needless re-encoding).
  3. A PNG with alpha comes out as PNG (not flattened to JPEG).
  4. A non-image content type (e.g. application/pdf) is passed
     through unchanged.
  5. Corrupt bytes raise a clean ValueError, not a Pillow crash.
"""
import io

import pytest
from PIL import Image

from app.services import image_opt


def _jpeg(width: int, height: int, color=(220, 200, 100)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (width, height), color).save(buf, format="JPEG", quality=90)
    return buf.getvalue()


def _png_rgba(width: int, height: int) -> bytes:
    buf = io.BytesIO()
    Image.new("RGBA", (width, height), (200, 50, 80, 128)).save(buf, format="PNG")
    return buf.getvalue()


def test_large_jpeg_downscaled():
    raw = _jpeg(4000, 3000)
    out, out_type = image_opt.optimize_image(raw, "image/jpeg")

    assert out_type == "image/jpeg"
    img = Image.open(io.BytesIO(out))
    assert max(img.size) <= image_opt.MAX_LONG_EDGE
    # Real size win — 4k JPEG should compress to <500 KB at q85.
    assert len(out) < 500_000


def test_small_jpeg_is_idempotent():
    raw = _jpeg(1024, 768)
    out, out_type = image_opt.optimize_image(raw, "image/jpeg")

    # Idempotent: bytes are returned unchanged, content type is
    # unchanged. This is the property callers care about for
    # already-good images.
    assert out is raw or out == raw
    assert out_type == "image/jpeg"


def test_png_with_alpha_preserved_as_png():
    raw = _png_rgba(2000, 1200)
    out, out_type = image_opt.optimize_image(raw, "image/png")

    assert out_type == "image/png"
    img = Image.open(io.BytesIO(out))
    assert img.mode == "RGBA"
    assert max(img.size) <= image_opt.MAX_LONG_EDGE


def test_non_image_passes_through():
    payload = b"%PDF-1.4 not really a pdf"
    out, out_type = image_opt.optimize_image(payload, "application/pdf")
    assert out is payload
    assert out_type == "application/pdf"


def test_corrupt_bytes_raise_value_error():
    # Valid magic header but garbage body — Pillow raises
    # UnidentifiedImageError or a similar exception inside
    # img.load(). The helper converts to ValueError so the
    # upload endpoint's 400-handler catches it cleanly.
    with pytest.raises(ValueError, match="could not decode image"):
        image_opt.optimize_image(b"\xff\xd8\xff" + b"\x00" * 8, "image/jpeg")
