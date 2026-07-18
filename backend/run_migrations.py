"""Run pending Alembic migrations. Call this before starting the server."""
import subprocess, sys

def run_migrations():
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        capture_output=True, text=True, cwd="backend"
    )
    if result.returncode != 0:
        print(f"Migration failed: {result.stderr}")
        return False
    print(result.stdout)
    return True

if __name__ == "__main__":
    run_migrations()
