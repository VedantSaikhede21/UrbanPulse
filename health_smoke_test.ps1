#!/usr/bin/env pwsh
# Health smoke test for UrbanPulse AI (PowerShell)
# Run: .\health_smoke_test.ps1

param(
    [string]$BackendUrl = "http://localhost:8000",
    [string]$FrontendUrl = "http://localhost:3000"
)

Write-Host "🏥 UrbanPulse AI Health Smoke Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Backend:  $BackendUrl" -ForegroundColor Gray
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Gray
Write-Host ""

# Helper function for HTTP requests
function Test-Endpoint {
    param([string]$Url, [string]$Name, [string]$ExpectedPattern)
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10 -ErrorAction Stop
        $json = $response | ConvertTo-Json -Depth 5
        if ($json -match $ExpectedPattern) {
            Write-Host "   ✅ $Name" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ❌ $Name - unexpected response" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ $Name - $_" -ForegroundColor Red
        return $false
    }
}

$allPassed = $true

# Test backend health
Write-Host "1. Testing backend health endpoint..."
$allPassed = Test-Endpoint "$BackendUrl/api/health" "Backend health" '"status":"healthy"' -and $allPassed

# Test backend ready
Write-Host "2. Testing backend ready endpoint..."
$allPassed = Test-Endpoint "$BackendUrl/api/health/ready" "Backend ready" '"status":"ready"' -and $allPassed

# Test frontend
Write-Host "3. Testing frontend loads..."
try {
    $html = Invoke-WebRequest -Uri $FrontendUrl -TimeoutSec 10 -ErrorAction Stop
    if ($html.Content -match "UrbanPulse") {
        Write-Host "   ✅ Frontend loads" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend check failed" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "   ❌ Frontend check failed - $_" -ForegroundColor Red
    $allPassed = $false
}

# Test API endpoints
Write-Host "4. Testing API endpoints..."

$allPassed = Test-Endpoint "$BackendUrl/api/tickets/near?latitude=12.9715&longitude=77.5945&radius_meters=1000" "Nearby tickets" '\[' -and $allPassed
$allPassed = Test-Endpoint "$BackendUrl/api/analytics/wards" "Analytics wards" '\[' -and $allPassed

# Demo seed (dev mode only)
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/api/demo/seed" -Method Post -TimeoutSec 10 -ErrorAction Stop
    if ($response.status -eq "ok") {
        Write-Host "   ✅ Demo seed works (dev mode)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Demo seed not available (production mode)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✅ All smoke tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some tests failed!" -ForegroundColor Red
    exit 1
}