## Referral Program Web App

Full‑stack referral program with React frontend, Node.js (Express) backend, and PostgreSQL. Includes JWT auth, referral engine, rewards logic, analytics, dashboard with charts, and a dummy CTA optimization endpoint.

### Tech Stack
- Backend: Node.js (Express), Sequelize ORM, PostgreSQL
- Frontend: React (Vite) + TailwindCSS, Recharts
- Containerization: Docker + Docker Compose

### Features
- User signup/login (JWT)
- Unique referral links: `/ref/:code` (logs click + redirects to signup)
- Referral relationships tracked on signup
- Rewards: every N referred signups grants credits
- Analytics: logs clicks, signups, conversions; CTR + K‑factor; time‑series chart
- Dashboard: referral link, stats, credits, chart, CTA recommendation, QR code

### Prerequisites
- Windows/macOS/Linux with Docker Desktop (or Docker Engine) installed
- Node.js 18+ if running without Docker

### Quickstart (Docker, recommended)
```bash
docker compose up --build -d
docker compose exec backend node scripts/seed.js
```
Services:
- Postgres: `localhost:5432` (db `referral_db`, user `postgres`, pass `postgres`)
- Backend API: `http://localhost:4000`
- Frontend: `http://localhost:5173`

Login (seed):
- Email: `alice@example.com`
- Password: `password123`

### Run locally (no Docker)
1) Create Postgres DB `referral_db` and set env for the backend:
```
PORT=4000
JWT_SECRET=devsecret
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=referral_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
FRONTEND_URL=http://localhost:5173
```
2) Backend
```bash
cd backend
npm install
npm run dev
# seed (new terminal)
node scripts/seed.js
```
3) Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
- Backend
  - `PORT` (default 4000)
  - `JWT_SECRET` (required)
  - `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (or `DATABASE_URL`)
  - `FRONTEND_URL` (for redirect from `/ref/:code`), e.g. `http://localhost:5173`
  - `REFERRAL_CONVERSION_THRESHOLD` (default 3), `CREDITS_PER_THRESHOLD` (default 10)
- Frontend
  - `VITE_API_BASE_URL` (default `http://localhost:4000`)

### How It Works
- Auth (JWT)
  - `POST /api/auth/signup`: create user, link to referrer via `referralCode` if provided; logs SIGNUP + CONVERSION; returns token
  - `POST /api/auth/login`: validates and returns token (stored in `localStorage`)
- Referral Flow
  - Every user has a `referralCode`
  - Public `GET /ref/:code` logs a CLICK and redirects to `FRONTEND_URL/signup?ref=:code`
  - Signup with `?ref=:code` links the new user to the referrer
- Rewards
  - When referred signups reach multiples of `REFERRAL_CONVERSION_THRESHOLD`, referrer earns `CREDITS_PER_THRESHOLD`
- Analytics
  - Events table `referral_events` logs CLICK, SIGNUP, CONVERSION with timestamps and optional `source`
  - `GET /api/analytics/summary`: CTR and a simplified K‑factor
  - `GET /api/analytics/timeseries`: daily counts for charting
  - `GET /api/analytics/best-cta`: dummy best CTA placement
- Dashboard (React)
  - Referral link (copy + QR), stats (clicks, signups, credits, CTR), time‑series chart, CTA suggestion

### API (quick reference)
- `POST /api/auth/signup` body: `{ email, password, name, referralCode? }`
- `POST /api/auth/login` body: `{ email, password }`
- `GET /api/referrals/me` (Bearer token)
- `GET /api/analytics/summary` (Bearer token)
- `GET /api/analytics/timeseries?days=14` (Bearer token)
- `GET /api/analytics/best-cta` (Bearer token)
- `GET /ref/:code` public click logger + redirect

### Deploy
Option A: Docker on a VM
1) Provision VM (Ubuntu), install Docker + Compose
2) Copy repo to server
3) Set `FRONTEND_URL` to your domain (e.g., `https://app.yourdomain.com`)
4) `docker compose up -d --build`
5) Put Nginx/Caddy in front (TLS) and reverse‑proxy `5173` and `4000`

Option B: Managed hosting
- Backend: Render/Railway/Fly.io with Docker; set Postgres add‑on and env vars
- Frontend: Vercel/Netlify; set `VITE_API_BASE_URL` to the backend URL
- Database: Managed Postgres (Neon, Supabase, RDS)

### GitHub
Initialize and push:
```bash
git init
git add .
git commit -m "feat: referral app (backend+frontend+compose)"
git branch -M main
git remote add origin <your_repo_url>
git push -u origin main
```

### Troubleshooting
- Docker compose warning about `version`: we use the Compose spec; you can ignore it or remove the `version` key (we removed it).
- Backend can start before Postgres is ready; retry `docker compose up -d backend` or run seed after a few seconds.
- If `docker` is not recognized on Windows, ensure Docker Desktop is installed and its `resources\bin` is on PATH.

### Notes
- Demo‑friendly defaults; tighten security (rate limit, password policies) before production.


