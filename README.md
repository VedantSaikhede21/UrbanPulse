# UrbanPulse AI

UrbanPulse AI is a pilot-ready, deployment-informed civic infrastructure reporting and triage platform. It integrates a 9-agent LangGraph orchestration backend with a modern dark-editorial frontend for citizens, officers, and municipal administrators.

## Project Structure
- `/frontend`: React + Vite + TypeScript + Tailwind CSS v3 client.
- `/backend`: FastAPI + Python + LangGraph agentic middleware.

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Setup Frontend
1. Navigate to `/frontend`
2. Run `npm install`
3. Start the dev server: `npm run dev`

### Setup Backend
1. Navigate to `/backend`
2. Create a virtual environment: `python -m venv venv` and activate it
3. Install dependencies: `pip install -r requirements.txt`
4. Create `.env` from `.env.example`
5. Start development server: `uvicorn app.main:app --reload`
