"""File signature (magic-byte) validation tests.

`validate_file_signature` is the trust-boundary gate for any
uploaded media. A regression that lets a `.jpg` extension hide a
PHP payload or an executable would put the Gemini pipeline and
the storage bucket at risk. The signatures are taken from
`twilio_service.FILE_SIGNATURES` and cover the formats the
citizen app and the Twilio rehost path actually accept.
"""
from __future__ import annotations

import pytest

from app.services.twilio_service import validate_file_signature


class TestValidateFileSignature:
    def test_jpeg_magic_bytes(self):
        # Real JPEG starts with FF D8 FF (SOI + APP0 marker).
        assert validate_file_signature(b"\xFF\xD8\xFF\xE0\x00\x10JFIF", ".jpg") is True
        assert validate_file_signature(b"\xFF\xD8\xFF\xE1", ".jpeg") is True

    def test_png_magic_bytes(self):
        # PNG header: 89 50 4E 47 0D 0A 1A 0A.
        png = b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A" + b"\x00" * 16
        assert validate_file_signature(png, ".png") is True

    def test_webp_requires_ri_and_webp(self):
        # WebP: starts with RIFF and contains WEBP at offset 8.
        assert validate_file_signature(b"RIFF\x00\x00\x00\x00WEBP", ".webp") is True
        # RIFF but no WEBP marker (e.g. WAV) must NOT validate as WebP.
        assert validate_file_signature(b"RIFF\x00\x00\x00\x00WAVE", ".webp") is False

    def test_wav_requires_wave_marker(self):
        # WAV is also RIFF-based; the test ensures the function
        # does not collapse all RIFF files into one bucket.
        assert validate_file_signature(b"RIFF\x00\x00\x00\x00WAVE", ".wav") is True
        assert validate_file_signature(b"RIFF\x00\x00\x00\x00WEBP", ".wav") is False

    def test_mp4_family(self):
        # The MP4 family has multiple 'ftyp' box positions.
        for header in (
            b"\x00\x00\x00\x18ftypmp4",
            b"\x00\x00\x00\x1Cftypmp4",
            b"\x00\x00\x00\x20ftypmp4",
        ):
            assert validate_file_signature(header + b"\x00" * 8, ".mp4") is True

    def test_mov_uses_quicktime_ftyp(self):
        # .mov files are QuickTime containers; the ftyp box has
        # 'qt' as the major brand, not 'mp4'.
        assert validate_file_signature(
            b"\x00\x00\x00\x14ftypqt" + b"\x00" * 8, ".mov"
        ) is True

    def test_webm_ebml_header(self):
        # WebM is Matroska-derived; the EBML header starts with
        # 1A 45 DF A3.
        assert validate_file_signature(b"\x1A\x45\xDF\xA3" + b"\x00" * 8, ".webm") is True

    def test_mp3_id3_or_frame_sync(self):
        # MP3 files start with 'ID3' (ID3v2 tag) or with the
        # frame-sync bits 11111111 11111011 (0xFFFB) / 0xFFF3 / 0xFFF2.
        assert validate_file_signature(b"ID3\x04\x00\x00\x00\x00\x00\x00", ".mp3") is True
        assert validate_file_signature(b"\xFF\xFB\x90\x00\x00\x00\x00\x00", ".mp3") is True
        assert validate_file_signature(b"\xFF\xF3\x90\x00\x00\x00\x00\x00", ".mp3") is True

    def test_ogg_uses_ogg_s_marker(self):
        assert validate_file_signature(b"OggS\x00\x02\x00\x00\x00\x00", ".ogg") is True
        # "OGGS" without the S is a rejected upload.
        assert validate_file_signature(b"OGGS\x00\x02\x00\x00\x00\x00", ".ogg") is False

    def test_pdf_magic_bytes(self):
        assert validate_file_signature(b"%PDF-1.4\n%\xE2\xE3\xCF\xD3", ".pdf") is True

    def test_unknown_extension_passes(self):
        # An extension we do not have a signature for should
        # NOT block the upload — the function returns True so
        # the caller does not 415 a legitimate file we just
        # don't have a magic-byte list for. A regression that
        # flips this to False would silently break uploads
        # of new formats.
        assert validate_file_signature(b"random data", ".xyz") is True

    def test_mismatch_extension(self):
        # A .jpg extension with PNG bytes must NOT pass — the
        # function checks the magic against the declared type,
        # not the bytes against themselves.
        png = b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A" + b"\x00" * 16
        assert validate_file_signature(png, ".jpg") is False

    def test_empty_input(self):
        # An empty file with a known signature is rejected.
        # The signature is "at least these bytes" — zero bytes
        # never matches.
        assert validate_file_signature(b"", ".jpg") is False
