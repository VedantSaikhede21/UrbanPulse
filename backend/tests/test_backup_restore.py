"""Pytest entry point for the backup-and-restore round-trip test.

The actual work happens in scripts/backup-restore-test.sh, which
brings up a throwaway Postgres container, backs it up, wipes it,
restores it, and asserts row counts. This shim invokes that script
and treats its exit code as the test result.

Why a shim and not a real pytest test:
  - The test needs Docker + a port + ~30 seconds of wall time. We
    do not want it running in the default pytest invocation that
    every PR / every editor "Run Tests" will trigger.
  - The shell script is the actual contract; duplicating the logic
    in Python would mean a second source of truth to keep in sync.

Marked with `@pytest.mark.integration` so it does not run by
default. Opt in with:
    RUN_DB_TESTS=1 pytest tests/test_backup_restore.py -v
"""

import os
import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
TEST_SCRIPT = REPO_ROOT / "scripts" / "backup-restore-test.sh"


pytestmark = pytest.mark.integration


def _docker_available() -> bool:
    return shutil.which("docker") is not None


def test_backup_restore_round_trip():
    if not _docker_available():
        pytest.skip("docker not available; integration test cannot run")
    if not TEST_SCRIPT.exists():
        pytest.fail(f"backup-restore test script missing: {TEST_SCRIPT}")
    if os.environ.get("RUN_DB_TESTS") != "1":
        pytest.skip("set RUN_DB_TESTS=1 to run the integration round-trip test")

    result = subprocess.run(
        ["bash", str(TEST_SCRIPT)],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        # Generous: bring up + seed + backup + restore + assert is
        # usually well under 90s on a warm Docker cache.
        timeout=300,
    )
    if result.returncode != 0:
        pytest.fail(
            "backup-restore round-trip failed.\n"
            f"--- stdout ---\n{result.stdout}\n"
            f"--- stderr ---\n{result.stderr}\n"
        )
