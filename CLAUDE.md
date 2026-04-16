# Backlog.gg — Claude Code Guide

## Project

Game library / backlog manager. Semester project.

**Stack:**
- Backend: Django 6.0.3 + DRF + SQLite — `backend/` — port 8000
- Frontend: Next.js 16 + React 19 + Tailwind v4 + shadcn/ui — `frontend/` — port 3000
- Auth: Django session + CSRF tokens
- External API: RAWG (game data), Steam (search)

## Structure

```
Backlog.gg/
├── backend/
│   ├── config/          # Django settings, urls, wsgi
│   ├── users/           # User model, auth views, profile views
│   ├── games/           # Game + GameDetailsCache + UserGame models
│   ├── fixtures/        # users.json, games.json seed data
│   └── manage.py
└── frontend/
    ├── app/
    │   ├── (auth)/      # login, register pages
    │   ├── api/         # Next.js proxy routes → Django
    │   └── dashboard/   # main app pages
    ├── components/
    │   ├── dashboard/
    │   └── ui/          # shadcn components
    ├── hooks/
    ├── lib/             # config.ts (BACKEND_URL), utils.ts, toast.ts
    └── mock/            # local assets
```

## Data Models

- `User` — AbstractUser + email, avatar_url, bio, created_at
- `Game` — RAWG-sourced: id, slug, name, background_image, released, metacritic
- `GameDetailsCache` — full RAWG JSON, OneToOne with Game
- `UserGame` — user↔game: status (backlog/playing/completed/wishlist), rating, hours_played

## API Routes

**Django (port 8000):**
- `GET  /api/games/?q=` — search/list
- `GET  /api/games/<slug>/` — detail
- `POST /api/auth/login|register|logout/`
- `GET  /api/auth/me/` — current user
- `GET/POST /api/user/me|update|change-password|delete/`
- `GET  /api/auth/csrf/` — CSRF token

**Next.js proxy (`frontend/app/api/`):**
- Mirrors Django endpoints, forwards cookies + CSRF

## Dev Commands

```bash
# Backend
cd backend && python manage.py runserver        # port 8000
cd backend && python manage.py migrate
cd backend && python manage.py loaddata fixtures/users.json fixtures/games.json

# Frontend
cd frontend && npm run dev                      # port 3000
cd frontend && npm run lint
cd frontend && npm run build
```

## Key Conventions

- Frontend calls Django **only** through Next.js proxy routes (`/app/api/...`), never directly (except `lib/config.ts` for CSRF)
- CSRF token fetched from `/api/auth/csrf/` before mutating requests
- Toasts via `lib/toast.ts` (Sonner wrapper) — use for all user feedback
- shadcn components live in `components/ui/` — add new ones with `npx shadcn add <component>`
- Tailwind v4 — no `tailwind.config.js`, config is in CSS via `@theme`
- Django apps: `users` (auth + profiles) and `games` (game library)

## Important Notes

- SQLite DB at `backend/db.sqlite3` — not committed
- `.venv` at repo root — activate with `source .venv/Scripts/activate` (Windows)
- `SECRET_KEY` in settings is dev-only insecure key — fine for local
- `GameTile` component has custom 3D tilt + infinite mirror rings CSS effect — handle with care
