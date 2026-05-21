# Warm-Up Manager — Backend

FastAPI backend for managing climbing warm-up exercises.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# fill in .env with your Google OAuth credentials and allowed emails
```

## Running

```bash
uvicorn app.main:app --reload
```

## Google OAuth setup

1. Create a project at https://console.cloud.google.com
2. Enable the Google OAuth API
3. Create OAuth 2.0 credentials (Web application)
4. Add `http://localhost:8000/auth/callback` to Authorized redirect URIs
5. Copy client ID and secret into `.env`

## Auth flow

- `GET /auth/login` — redirects to Google
- `GET /auth/callback` — exchanges code, sets `access_token` HTTP-only cookie
- All API routes require the cookie; return 401 if missing, 403 if email not on allowlist

## Admin panel

Visit `http://localhost:8000/admin` to manage exercises, body parts, and equipment.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | /exercises | List all exercises (optional `?body_part_id=` / `?equipment_id=`) |
| GET | /exercises/random | Random warm-up (`?count=6`, `?equipment_id=`) — one per body part |
| POST | /sessions | Save a session `{"exercise_ids": [...]}` |
| GET | /sessions | List sessions (summary) |
| GET | /sessions/{id} | Get session with full exercise data |
| GET | /auth/me | Current user email |
| GET | /health | Health check (no auth) |
