# Decisions Log

> Smaller decisions that don't warrant a full ADR.

---

## 2026-07-17

| Decision | Rationale |
|----------|-----------|
| Not using Google Maps | API billing complexity, free alternatives (Leaflet + OSM) sufficient for hackathon |
| Backend `.env` at `backend/.env` | pydantic-settings `model_config` reads relative to CWD; README instructs `cd backend && uvicorn ...` |
| Frontend `.env` at `frontend/.env` | Vite auto-loads `.env` from project root; proxy config reads from there |
| `DEV_ALLOW_ANONYMOUS=true` in dev | Lets feature pages work without auth during parallel development |
| SUPABASE_URL = project base URL | Supabase JS client expects base URL, not `/rest/v1/` endpoint |
| ChatGPT as architect/planner | One prompt per feature: ChatGPT designs → OpenCode implements. Never "tell X to tell Y." |
| MapPicker before FileUpload | MapPicker is highest technical risk (Leaflet + GPS + permissions + responsive). Discover issues early. |
