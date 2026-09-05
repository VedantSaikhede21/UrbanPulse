"""Resize / recompress citizen photos at the upload boundary.

Phase 5 'Image optimization for uploaded citizen photos'. The
median citizen photo taken on a 12 MP phone is ~5 MB at 4032x3024.
That's wasted storage, wasted Supabase egress, and a Gemini call
that may time out. Downscale to 1600px on the long edge, JPEG q85,
strip EXIF metadata. The result is ~300 KB and still readable
enough for pothole / graffiti / streetlight classification.

Design notes (Ponytail — smallest thing that works):

- One function: ``optimize_image``. Returns ``(bytes, content_type)``.
- Idempotent: if the image is already <= 1600px on the long edge
  AND the format is already JPEG with no alpha, return the
  original bytes unchanged. The cost of a no-op is one Pillow
  open + one size read; the cost of re-encoding an already-good
  image is unnecessary quality loss.
- Pillow is the only dep. Imported lazily inside the function so
  a runtime that doesn't have Pillow (or doesn't want it) still
  loads the module — the function falls through to the identity
  path and logs a warning.
- PNG with alpha is preserved as PNG. JPEG with no alpha is
  re-encoded as JPEG q85. HEIC/HEIF is converted to JPEG
  (Pillow>=10 supports it; we don't otherwise need it).
- Errors raise ``ValueError`` so the upload endpoint's
  existing 400-handler can surface them.
"""
from __future__ import annotations

import io
import structlog
from typing import Optional, Tuple

logger = structlog.get_logger(__name__)

# Long-edge target. 1600px is the standard citizen-photo resize
# dimension (Google Photos, WhatsApp, etc.) — enough resolution
# for a pothole or a broken streetlight to be visible to Gemini,
# small enough to keep a 5 MB photo under 500 KB after JPEG.
MAX_LONG_EDGE = 1600

# JPEG quality. 85 is the standard "visually lossless" setting;
# below 80 you start seeing banding on smooth surfaces (sky,
# road), above 88 you don't get much smaller files.
JPEG_QUALITY = 85


def optimize_image(content: bytes, content_type: str) -> Tuple[bytes, str]:
    """Downscale a citizen photo to MAX_LONG_EDGE and re-encode.

    Args:
        content: Raw image bytes (already magic-byte-validated
            by the caller — the upload endpoint checks
            ``validate_file_signature_bytes`` first).
        content_type: MIME type, e.g. ``image/jpeg``. Only
            ``image/*`` content is optimized; anything else
            passes through unchanged.

    Returns:
        ``(new_bytes, new_content_type)``. If the image is
        already small enough AND in an already-good format,
        the original bytes are returned unchanged and
        ``new_content_type`` equals ``content_type``.

    Raises:
        ValueError: the bytes are not a decodable image. The
            caller should reject the upload with a 400.
    """
    # Only optimize image/* — voice notes, PDFs, and video pass
    # through unchanged so the audio path's cost profile is
    # untouched.
    if not content_type.lower().startswith("image/"):
        return content, content_type

    try:
        from PIL import Image, ImageOps
    except ImportError:
        # Pillow missing — log once, return original bytes. The
        # upload still works; storage cost is just higher.
        logger.warning("image_opt_pillow_missing")
        return content, content_type

    try:
        img = Image.open(io.BytesIO(content))
        img.load()  # force decode so the size read is accurate
    except Exception as e:
        raise ValueError(f"could not decode image: {e}") from e

    # Preserve EXIF orientation (phone photos commonly have
    # orientation=6/8 set, where the pixels are stored sideways
    # and the EXIF tag rotates them at display time). Without
    # this, a portrait phone photo gets stored sideways.
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    has_alpha = img.mode in ("RGBA", "LA", "PA") or (
        img.mode == "P" and "transparency" in img.info
    )

    # Idempotency: small enough AND already a good format → no-op.
    w, h = img.size
    if max(w, h) <= MAX_LONG_EDGE:
        if (content_type == "image/jpeg" and img.mode == "RGB") or (
            content_type == "image/png" and has_alpha
        ):
            return content, content_type

    # Downscale. LANCZOS is the highest-quality Pillow resampler;
    # the cost is one extra-pass convolution we don't care
    # about on a single upload.
    if max(w, h) > MAX_LONG_EDGE:
        scale = MAX_LONG_EDGE / max(w, h)
        new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
        img = img.resize(new_size, Image.LANCZOS)

    # Re-encode. JPEG strips alpha (mode='RGB' drops it); PNG
    # preserves it. HEIC/HEIF/WEBP convert to JPEG — those
    # formats are phone-photo edge cases and the citizen UI
    # already accepts the JPEG-rendered version.
    buf = io.BytesIO()
    if has_alpha and content_type == "image/png":
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue(), "image/png"

    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return buf.getvalue(), "image/jpeg"
