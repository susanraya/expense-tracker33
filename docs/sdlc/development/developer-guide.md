# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `cafd3ba` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Expense tracker is a generated full-stack prototype consisting of two independently runnable apps in one repo. The backend is a FastAPI 0.115 service (SQLAlchemy 2.0 models, Alembic migrations, Pydantic schemas) that implements registration/login/session auth, per-user categories and expenses, all backed by SQLite by default (Postgres via DATABASE_URL). The frontend is a Vite + React 19 SPA with approved, reviewed screens (Dashboard, Expenses, Categories, Reports, Settings) styled with Tailwind and routed with react-router. Per the project's own README, the frontend screens currently render seeded/sample data rather than calling the backend — `src/lib/api.ts` is the prepared seam (bearer-token fetch wrapper) for wiring real calls to the FastAPI endpoints later.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Python 3.12 (matches backend/Dockerfile base image)
- Node.js and npm (for the Vite/React frontend tooling in frontend/package.json)
- pip (Python package installer)
- Docker and Docker Compose (optional — only needed to run the Postgres service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository.
2. cd backend
3. pip install -r requirements.txt
4. (optional) set DATABASE_URL to point at Postgres instead of the local SQLite default — e.g. run `docker-compose up -d db` from the repo root first to start the postgres:16-alpine service defined in docker-compose.yml
5. uvicorn app.main:app --reload  (applies Alembic migrations and seeds bootstrap users on startup, per backend/app/main.py)
6. In a separate terminal: cd frontend
7. npm install
8. npm run dev
9. (optional) set VITE_API_BASE_URL in the frontend environment to point the API client in src/lib/api.ts at a non-default backend URL
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend: dev server | `uvicorn app.main:app --reload` | Starts the FastAPI app from backend/, running migrations and seeding bootstrap users on startup. |
| frontend: dev server | `npm run dev` | Starts the Vite dev server for the React SPA (default port 5173, matching the backend's default CORS allow-list). |
| frontend: build | `npm run build` | Bundles the production frontend with Vite (does not typecheck). |
| frontend: preview | `npm run preview` | Serves the built frontend bundle locally. |
| db: start Postgres | `docker-compose up -d db` | Starts the postgres:16-alpine service defined in docker-compose.yml for use via DATABASE_URL. |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend/app` | FastAPI application: main.py entrypoint/migrations runner, models.py (SQLAlchemy), schemas.py (Pydantic), auth.py/security.py, seed.py, and routers/ (auth, account, categories, expenses). |
| `backend/migrations` | Alembic migration environment and versioned schema scripts; the schema is created/changed only through these, never via create_all. |
| `backend/tests` | pytest suite split into unit/ and integration/ tests for auth, categories, expenses, health, and session behavior. |
| `backend/scripts` | Operational scripts, e.g. check_connections.py. |
| `frontend/src` | React SPA source: screens/ (one module per approved screen), lib/ (api client, auth context, ui/icon vocabulary, brand tokens), App.tsx (nav shell/routes), main.tsx (entry). |
| `frontend/e2e` | Playwright acceptance specs (auth flows, expenses/categories, no-payment) plus shared support helpers. |
| `.devcontainer` | VS Code devcontainer configuration for a consistent local dev environment. |
| `.quorq` | Quorq platform metadata (handoff.json, prepared.json) describing this generated project to the platform. |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one router per architecture component (auth, account, categories, expenses), one route per declared endpoint, registered in app/main.py.
- Every per-user query filters by the authenticated user's id in the query itself; a mismatched owner returns 404, never 403, so another user's resource is indistinguishable from a missing one.
- Primary keys are UUIDs generated application-side via SQLAlchemy's Uuid() column default, not database-generated.
- Database schema is created and evolved only via Alembic migrations in backend/migrations; Base.metadata.create_all is never used in a production code path.
- Passwords are never stored in plaintext — hashed via passlib/bcrypt (app/security.py).
- Login returns a generic 401 for unknown email, wrong password, or deactivated account alike, to avoid leaking account existence.
- Pydantic schemas follow an *Out / *Create / *Update naming split per entity in app/schemas.py, with field validators for email, password, category name, and amount.
- Frontend: one module per approved screen under src/screens/, sharing a common UI/icon vocabulary (src/lib/ui.tsx, src/lib/icons.tsx) and brand tokens (src/lib/brand.ts, src/index.css).
- Frontend component tests live beside the component they cover (e.g. Categories.test.tsx next to Categories.tsx); Playwright e2e specs live separately under frontend/e2e/.
- All frontend API calls are intended to go through the single apiFetch wrapper in src/lib/api.ts, which attaches the bearer session token (or shared secret) and centralizes 401 handling.
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend: unit/integration tests | `pytest` | Runs the backend/tests suite (unit/ and integration/) from the backend directory. |
| backend: lint | `ruff check .` | Lints the backend Python code per backend/ruff.toml. |
| backend: format check | `ruff format .` | Formats/checks formatting of backend Python code. |
| frontend: unit tests | `npm run test` | Runs Vitest component tests under frontend/src. |
| frontend: typecheck | `npm run typecheck` | Runs tsc --noEmit to catch type errors npm run build does not. |
| frontend: lint | `npm run lint` | Runs ESLint over the frontend app; this gate must stay green per frontend/README.md. |
| frontend: e2e install | `npm run test:e2e:install` | Installs the Chromium browser Playwright needs. |
| frontend: e2e tests | `npm run test:e2e` | Runs Playwright specs from frontend/e2e; without E2E_BASE_URL it boots the backend (from backend/.venv) and builds/serves the frontend locally. |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| `pytest` from backend/ fails with `ModuleNotFoundError: No module named 'app'`. | Run pytest from the backend/ directory itself — backend/pytest.ini sets `pythonpath = .` relative to that directory. |
| Backend fails to start with a 'table already exists' or migration error against a stale SQLite file. | app/main.py already handles the common stale-file and race cases by stamping instead of re-running migrations; if it still fails, delete the local app.db file and restart uvicorn to let migrations recreate it from scratch. |
| Frontend calls to the backend are blocked by CORS. | Set the backend's ALLOWED_ORIGINS environment variable to a comma-separated list including the frontend's origin; the default dev-mode allow-list only covers http://localhost:5173 and http://127.0.0.1:5173. |
| `npm run test:e2e` fails because it can't boot the backend. | Playwright's webServer config expects a Python virtualenv at backend/.venv; create it and run `pip install -r requirements.txt` inside backend/.venv before running the e2e suite, or set E2E_BASE_URL to point at an already-running deployment instead. |
| `npm run build` succeeds but the app has type errors. | `npm run build` does not typecheck; run `npm run typecheck` (tsc --noEmit) separately to catch issues before deploying. |
<!-- sdlc:auto:end troubleshooting -->
