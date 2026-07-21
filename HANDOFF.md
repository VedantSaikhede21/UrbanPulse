# UrbanPulse — Session Handoff

## Project Status
Hackathon presentation is **today (July 2026, 4:30–6:30 PM)**. All prep materials ready.

## What's Already Done

### Presentation
- **PPTX generated**: `presentation/UrbanPulse_AI_Presentation_v1.pptx` (15 slides, 2.4MB)
- **Slide previews**: `presentation/review/` (15 PNG screenshots + contact-sheet.html)
- **Polished screenshots**: `presentation/polished/` (12 framed screenshots for slides 7–11)

### Preparation Materials
- **`presentation/HACKATHON_PREP.md`** — Complete preparation kit:
  - Slide-by-slide speaking script (0:00–5:00 timing)
  - Live demo script with exact clicks
  - 50+ judge questions with polished answers
  - One-sentence-per-agent cheat sheet
  - Last-minute checklist

### MCP Servers Configured (`~/.config/opencode/opencode.jsonc`)
```jsonc
{
  "mcp": {
    "slidev": { "type": "remote", "url": "https://mcp.slidev-mcp.org/mcp", "enabled": true },
    "powerpoint_python": { "type": "local", "command": "python3", "args": ["..."], "enabled": true },
    "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@latest"], "enabled": true }
  }
}
```

### App Running (servers up, verified working)
- **Frontend**: Vite dev server on `http://localhost:3000`
- **Backend**: FastAPI on `http://localhost:8000`
- **Routes available**: `/` (landing), `/auth/citizen-login`, `/auth/staff-login`, `/public-map`, `/trace`, `/about`, `/settings`, `/support`

## What's Left To Do In The New Session

### 1. Run the Live Demo (using chrome-devtools MCP)
The chrome-devtools MCP is configured. In the new session, run the demo flow:

**Demo flow** (5 steps):
1. Open `http://localhost:3000/` → Click "Report an Issue"
2. Log in as Citizen (use demo OTP or role selector)
3. Submit a water leak report (photo + description + GPS pin)
4. **Show the SSE agent trace** as agents process it in real-time
5. Switch to Officer queue → show pre-sorted, priority-ranked tickets
6. Switch to Admin dashboard → show Urban Health Score

### 2. Practice the 5-Minute Pitch
Use `presentation/HACKATHON_PREP.md` for the full script.

### 3. Mock Interview
Fire the 50+ judge questions from the prep doc and practice answers.

## Demo Screenshots Already Captured
```
/tmp/opencode/demo/
├── 01_landing.png
├── 02_citizen_login.png
├── 03_public_map.png
├── 04_live_trace.png
├── 05_about.png
└── 06_staff_login.png
```

## Quick Reference

| File | Purpose |
|------|---------|
| `presentation/HACKATHON_PREP.md` | Speaking script, demo script, 50+ Q&A |
| `presentation/UrbanPulse_AI_Presentation_v1.pptx` | Final PPTX (15 slides) |
| `presentation/generate_pptx.mjs` | PPTX generation script |
| `presentation/review/` | Slide previews (15 PNGs) |
| `presentation/polished/` | Framed screenshots for slides |
| `~/.config/opencode/opencode.jsonc` | MCP server config (chrome-devtools included) |

## 8 Agents — One Sentence Each
01. **CX**: Normalizes any-language input → structured report
02. **Vision**: Gemini damage assessment from photos
03. **Trust & Fraud**: Blocks spam before it reaches queue
04. **Dedup**: PostGIS 50m + semantic embedding merge
05. **Priority**: Severity 1–3 score with explainable reasons
06. **Routing**: Category → department → nearest officer
07. **Escalation**: SLA timer + breach alerts
08. **Verification**: Auto-QA of closure photos via Gemini
09. **Analytics**: Urban Health Score (composite 0–100 per ward)
