# Smart City Civic Grievance Platform

AI-powered grievance prioritisation: citizens report civic issues, **Google Gemini** classifies the department and urgency, age-based scoring keeps old complaints from being forgotten, and delays are automatically escalated to admins.

**Stack:** React + Vite · Node/Express · MongoDB (Mongoose) · JWT · Gemini (`@google/genai`)

## How it works

1. **Classification** – Gemini reads the complaint text (and photo, if attached) and returns department, base priority, reason and confidence using a JSON schema. Whole-word rules then adjust it (safety words → High, sensitive locations, long-standing issues). If Gemini is down or unsure, a keyword fallback is used and the complaint is flagged **Needs review**.
2. **Scoring** – `score = base (High 100 / Medium 60 / Low 30) + aging (+10/day, capped at 30 days) + sensitive-location bonus (+20)`. Tunable in [server/config/scoring.js](server/config/scoring.js) or via env.
3. **Daily plan** – each department gets a recommended 2 High / 1 Medium / 2 Low plan.
4. **Escalation** – runs automatically (hourly cron + at startup) and on demand from the admin page. Pending > 48h with no response, High priority > 24h with no update, or In Progress with no update for 5 days.
5. **Roles & JWT** – citizen, official (department-scoped), admin. Tokens expire per `JWT_EXPIRES_IN` (default 1 day).

## Setup

From the project root:

```bash
cp server/.env.example server/.env   # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL
npm run install:all                  # installs root, server and client dependencies
npm run seed                         # optional demo users + complaints
npm run dev                          # backend :5000 + frontend :3000 together
```

Other root scripts: `npm test`, `npm run build`, `npm start` (production-style run).

### Environment (server/.env)

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Required, ≥ 16 chars (server refuses to start otherwise) |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `GEMINI_API_KEY` | Your Gemini key. Without it the keyword fallback is used |
| `GEMINI_MODEL` | Model name, e.g. `gemini-2.5-flash` |
| `CLIENT_URL` | Comma-separated allowed CORS origins |
| `ESCALATION_CRON` | Cron expression for the escalation job (default hourly) |

## Demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Citizen | citizen@test.com | password123 |
| Admin | admin@test.com | password123 |
| Official | official.roads@test.com (also `.electricity`, `.drainage`, `.sanitation`) | password123 |

Change these passwords outside local demos. Admins can create new officials from **Admin → Overview**.

## API summary

- `POST /api/auth/register|login`, `GET /api/auth/me`
- `POST /api/complaints` (citizen, AI-classified), `GET /api/complaints/my|department|daily-plan|stats|:id`, `PATCH /api/complaints/:id/status`
- `POST /api/upload` (image)
- Admin: `POST /api/admin/check-escalations`, `GET /api/admin/escalations|analytics|officials`, `POST /api/admin/officials`, `PATCH /api/admin/complaints/:id/note|follow-up`

## Tests

```bash
cd server && npm test     # scoring, rules and escalation logic
```

## Security notes

Helmet, restricted CORS, rate limits on auth and complaint creation, input validation (including ObjectId checks), generic error messages to clients, and `.env` / uploaded files are git-ignored.
