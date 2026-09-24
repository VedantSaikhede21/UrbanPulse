# UrbanPulse — PostgreSQL logical backup (pg_dump) for Windows.
#
# Windows twin of scripts/backup_db.sh. Runs pg_dump inside the
# postgis Docker image so the host does not need pg_dump installed
# (typical Windows dev machines don't have it).
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\backup_db.ps1 [-BackupDir <path>]
#
# Environment: reads DATABASE_URL from .env (or the env). The .env
# is parsed line-by-line; quoted values are handled.
#
# Exit codes mirror backup_db.sh.

[CmdletBinding()]
param(
  [string]$BackupDir,
  [int]$RetentionDays = 14,
  [string]$PgImage = "postgis/postgis:16-3.4"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

if (-not $BackupDir) { $BackupDir = Join-Path $repoRoot "backups" }

# Load DATABASE_URL from .env if not in environment.
if (-not $env:DATABASE_URL -and (Test-Path ".env")) {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*DATABASE_URL\s*=\s*(.+?)\s*$') {
      $val = $Matches[1]
      if (($val.StartsWith('"') -and $val.EndsWith('"')) -or
          ($val.StartsWith("'") -and $val.EndsWith("'"))) {
        $val = $val.Substring(1, $val.Length - 2)
      }
      $env:DATABASE_URL = $val
    }
  }
}

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL is required (set it in the environment or in .env)"
  exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "docker not found in PATH"
  exit 2
}

# Ensure image is present locally.
$imageCheck = docker image inspect $PgImage 2>$null
if ($LASTEXITCODE -ne 0) {
  docker pull $PgImage | Out-Null
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$ts = (Get-Date -AsUTC).ToString("yyyyMMdd-HHmmss")
$out = Join-Path $BackupDir "urbanpulse-$ts.dump"

Write-Host "[backup] writing $out"

# Use a temp container name to avoid collisions on parallel runs.
$containerName = "urbanpulse-pgdump-$ts"

# Bind-mount the backup dir into the container. Windows path -> MSYS
# path conversion is automatic for the docker CLI but we quote it.
$dockerArgs = @(
  "run", "--rm",
  "--network", "host",
  "-v", "${BackupDir}:/backup",
  "-e", "PGPASSWORD=",
  $PgImage,
  "pg_dump",
  "--format=custom",
  "--no-owner",
  "--no-acl",
  "--dbname=$env:DATABASE_URL",
  "--file=/backup/urbanpulse-$ts.dump"
)

& docker @dockerArgs
if ($LASTEXITCODE -ne 0) {
  Write-Error "pg_dump failed"
  exit 3
}

if (-not (Test-Path $out) -or (Get-Item $out).Length -eq 0) {
  Write-Error "backup file $out is empty or missing"
  exit 3
}

# Retention trim: .dump files older than RetentionDays.
$cutoff = (Get-Date).AddDays(-$RetentionDays)
$deleted = 0
Get-ChildItem -Path $BackupDir -Filter "urbanpulse-*.dump" -File |
  Where-Object { $_.LastWriteTime -lt $cutoff } |
  ForEach-Object {
    Remove-Item -Force $_.FullName
    $deleted++
  }

$size = "{0:N1} KB" -f ((Get-Item $out).Length / 1KB)
Write-Host "[backup] OK: $out ($size) — trimmed $deleted old file(s) beyond ${RetentionDays}d retention"
