#!/usr/bin/env bash
# Health smoke test for UrbanPulse AI
# Run: ./health_smoke_test.sh

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "🏥 UrbanPulse AI Health Smoke Test"
echo "=================================="
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test backend health
echo "1. Testing backend health endpoint..."
if curl -sf "$BACKEND_URL/api/health" | grep -q '"status":"healthy"'; then
    echo "   ✅ Backend healthy"
else
    echo "   ❌ Backend health check failed"
    exit 1
fi

# Test backend ready endpoint
echo "2. Testing backend ready endpoint..."
if curl -sf "$BACKEND_URL/api/health/ready" | grep -q '"status":"ready"'; then
    echo "   ✅ Backend ready"
else
    echo "   ❌ Backend ready check failed"
    exit 1
fi

# Test frontend loads
echo "3. Testing frontend loads..."
if curl -sf "$FRONTEND_URL" | grep -q "UrbanPulse"; then
    echo "   ✅ Frontend loads"
else
    echo "   ❌ Frontend check failed"
    exit 1
fi

# Test API endpoints respond
echo "4. Testing API endpoints..."

# Test nearby tickets endpoint (public)
if curl -sf "$BACKEND_URL/api/tickets/near?latitude=12.9715&longitude=77.5945&radius_meters=1000" | grep -q '\['; then
    echo "   ✅ /api/tickets/near responds"
else
    echo "   ❌ /api/tickets/near failed"
    exit 1
fi

# Test analytics endpoint
if curl -sf "$BACKEND_URL/api/analytics/wards" | grep -q '\['; then
    echo "   ✅ /api/analytics/wards responds"
else
    echo "   ❌ /api/analytics/wards failed"
    exit 1
fi

# Test demo seed endpoint (dev only)
if curl -sf -X POST "$BACKEND_URL/api/demo/seed" -H "Content-Type: application/json" | grep -q "status"; then
    echo "   ✅ /api/demo/seed works (dev mode)"
else
    echo "   ⚠️  /api/demo/seed not available (production mode)"
fi

echo ""
echo "=================================="
echo "✅ All smoke tests passed!"
echo "=================================="