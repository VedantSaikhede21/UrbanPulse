# WhatsApp Ingestion Implementation Plan

## Overview
Add Twilio WhatsApp webhook ingestion to UrbanPulse, allowing citizens to report issues via WhatsApp with automatic location handling, media processing, and AI triage pipeline integration.

## Architecture

### Components to Build
1. **Alembic Migration** - Add `phone` column to citizens, make `email` nullable
2. **WhatsApp Router** (`backend/app/routers/whatsapp.py`) - Twilio webhook endpoint
3. **Twilio Service** (`backend/app/services/twilio_service.py`) - Signature validation, media download, outbound messages
4. **Geocoding Service** (`backend/app/services/geocoding.py`) - Nominatim integration with confidence scoring
5. **Citizen Service Extensions** - Phone-based lookup/create
6. **Pipeline Trigger** - Synchronous triage graph execution (without SSE)
7. **Configuration** - Environment variables for Twilio credentials

### Location Handling Flow (per spec)
1. **Native WhatsApp location pin** → Use immediately (GPS coordinates from Twilio)
2. **Text with place/landmark** → Geocode via Nominatim, use if confident
3. **Geocoding confidence check** → Flag ticket as `location_source: "geocoded"` (vs "gps")
4. **Geocoding fails** → One retry prompt asking for location pin or landmark
5. **No indefinite back-and-forth** → Single retry only for v1

## Database Changes

### Migration: Add phone to citizens, make email nullable
```sql
ALTER TABLE citizens ADD COLUMN phone VARCHAR(20) UNIQUE;
ALTER TABLE citizens ALTER COLUMN email DROP NOT NULL;
-- Add index for phone lookups
CREATE INDEX IF NOT EXISTS citizens_phone_idx ON citizens (phone);
```

### Ticket Model Extension
Add `location_source` column to tickets table:
```sql
ALTER TABLE tickets ADD COLUMN location_source VARCHAR(20) DEFAULT 'gps' CHECK (location_source IN ('gps', 'geocoded'));
```

## API Endpoints

### POST /api/whatsapp/webhook
- Twilio webhook endpoint (no auth, validated via Twilio signature)
- Receives: text, media (images), location (lat/lng)
- Returns: TwiML response with confirmation message

## Services

### TwilioService (`backend/app/services/twilio_service.py`)
- `validate_signature(request)` - Verify X-Twilio-Signature
- `download_media(media_url)` - Download from Twilio's temporary URLs, rehost to /uploads
- `send_whatsapp_message(to, body)` - Outbound reply via Twilio API
- `parse_webhook(request)` - Extract text, media URLs, location from Twilio payload

### GeocodingService (`backend/app/services/geocoding.py`)
- `geocode(text)` - Call Nominatim, return (lat, lng, confidence, display_name)
- `is_confident(confidence)` - Threshold check (e.g., confidence > 0.7)

### CitizenService Extensions
- `get_or_create_citizen_by_phone(db, phone, name)` - Lookup or create citizen by phone

### PipelineService
- `run_triage_sync(ticket, db)` - Execute triage graph synchronously (no SSE)

## Implementation Steps

### Phase 1: Database Migration
1. Generate Alembic migration for citizens.phone + email nullable
2. Generate Alembic migration for tickets.location_source
3. Run migrations

### Phase 2: Core Services
1. Create `twilio_service.py`
2. Create `geocoding.py`
3. Extend citizen lookup in services

### Phase 3: WhatsApp Router
1. Create `backend/app/routers/whatsapp.py`
2. Register in main.py
3. Add Twilio signature validation middleware

### Phase 4: Pipeline Integration
1. Add synchronous pipeline runner
2. Handle "Uncategorized" placeholder category
3. Set location_source on ticket

### Phase 5: Testing & Configuration
1. Add .env.example entries
2. Test with ngrok + Twilio console

## File Structure
```
backend/
├── alembic/versions/
│   ├── xxx_add_phone_to_citizens.py
│   └── xxx_add_location_source_to_tickets.py
├── app/
│   ├── routers/
│   │   └── whatsapp.py          # NEW
│   ├── services/
│   │   ├── twilio_service.py    # NEW
│   │   ├── geocoding.py         # NEW
│   │   └── pipeline_sync.py     # NEW (or extend pipeline.py)
│   └── main.py                  # Register whatsapp router
├── .env.example                 # Add Twilio vars
```

## Environment Variables
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
NOMINATIM_USER_AGENT=UrbanPulse/1.0
```

## Security
- **Twilio Signature Validation** - Required on webhook endpoint
- **Rate Limiting** - Consider adding (future enhancement)
- **Media URL Expiry** - Twilio URLs are temporary; must download immediately

## Error Handling
- Invalid signature → 403
- Media download failure → Log, continue without media
- Geocoding failure → Send retry prompt (once)
- Pipeline failure → Log, send error message to citizen
- DB errors → Rollback, send error message

## Testing Checklist
- [ ] Migration runs cleanly
- [ ] Webhook receives Twilio payload
- [ ] Signature validation works
- [ ] Location pin → ticket with location_source=gps
- [ ] Text geocoding → ticket with location_source=geocoded
- [ ] Low confidence geocoding → retry prompt sent
- [ ] Media downloaded and rehosted
- [ ] Pipeline runs synchronously
- [ ] Outbound WhatsApp reply sent with ticket reference
- [ ] Audit log entries created