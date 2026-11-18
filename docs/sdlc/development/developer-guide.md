# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `e1508ac` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Expense Tracker is a generated two-app project: a Vite + React 19 single-page frontend containing every approved screen (Dashboard, Expenses, Categories, Reports, Settings, Sign In), currently running entirely on seeded sample data, and a FastAPI 0.115 backend scaffold that only exposes a health check endpoint because no backend architecture had been approved yet. The backend uses SQLAlchemy with a SQLite file by default (so it runs with zero setup) but is designed to point at PostgreSQL 16 via a DATABASE_URL env var, matching the approved stack. The two apps communicate over HTTP with CORS and a bearer-token scheme, but the frontend does not yet call the backend for data.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for Vite 6 / React 19 / npm scripts in frontend/package.json)
- Python 3.12 (matches backend/Dockerfile base image)
- pip
- Docker and Docker Compose (optional, for running the PostgreSQL 16 database via docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository
2. cd frontend && npm install
3. cd backend && pip install -r requirements.txt
4. (Optional, for Postgres) from the repo root run: docker compose up -d to start the db service, then set DATABASE_URL to point at it before starting the backend
5. Review .env.example at the repo root for any environment variables to set before running the apps
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| frontend dev | `npm run dev` | Starts the Vite dev server for the React SPA (run from frontend/) |
| backend dev | `uvicorn app.main:app --reload` | Starts the FastAPI backend with auto-reload (run from backend/); creates SQLite tables on startup |
| frontend build | `npm run build` | Bundles the frontend with Vite (does not typecheck) |
| frontend preview | `npm run preview` | Serves the production build locally (run from frontend/) |
| db up | `docker compose up -d` | Starts the PostgreSQL 16 database container defined in docker-compose.yml |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `.devcontainer` | Dev container configuration for a consistent local environment |
| `.quorq` | Platform handoff metadata (handoff.json) for the Quorq AI SDLC platform |
| `backend` | FastAPI service: app code, tests, Dockerfile, dependency manifest |
| `backend/app` | Application package: main.py entrypoint, database.py (engine/session), models.py (SQLAlchemy models), schemas.py (Pydantic models), routers/ (per-component route modules) |
| `backend/tests` | pytest test suite, split into unit/ and integration/ (currently a health-check integration test) |
| `frontend` | Vite + React SPA: source, end-to-end tests, config files |
| `frontend/src` | App source: screens/, lib/ (api client, UI/icon vocabulary, brand tokens), App.tsx navigation shell, main.tsx entry |
| `frontend/e2e` | Playwright end-to-end specs and support fixtures (e.g. admin.ts) |
| `docker-compose.yml` | Defines the PostgreSQL 16 database service for local/deployed use |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one FastAPI router per architecture component that owns endpoints (backend/app/routers/)
- Backend: unimplemented routes return a typed StubResponse rather than raising, keeping the service startable and its OpenAPI spec complete
- Backend: Pydantic request/response schemas defined in schemas.py, one pair per data entity
- Backend: SQLAlchemy models all inherit from the shared Base in database.py; tables are created from models at app startup (no migrations yet)
- Backend: DB session is request-scoped via the get_db dependency, closed in a finally block
- Frontend: one module per approved screen under src/screens/
- Frontend: App.tsx holds the navigation shell and route table; screens are routed inside it except SignIn and the catch-all redirect
- Frontend: shared UI/icon vocabulary in src/lib/ui.tsx and src/lib/icons.tsx; brand tokens in src/lib/brand.ts and CSS variables in src/index.css
- Frontend: API access centralized in src/lib/api.ts (apiFetch, session token helpers) as the seam for wiring screens to the real backend
- Frontend component tests live beside the code they cover and are picked up by Vitest's src/**/*.{test,spec}.{ts,tsx} pattern; Playwright specs live under e2e/ and are excluded from Vitest
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| frontend unit tests | `npm test` | Runs Vitest component tests (run from frontend/) |
| frontend lint | `npm run lint` | Runs ESLint over the frontend app; this is the gate the platform enforces |
| frontend format check | `npm run format:check` | Checks formatting with Prettier without writing changes |
| frontend typecheck | `npm run typecheck` | Runs tsc --noEmit; not run by npm run build |
| frontend e2e | `npm run test:e2e` | Runs Playwright acceptance tests from e2e/; boots backend (via backend/.venv) and frontend locally unless E2E_BASE_URL is set |
| e2e browser install | `npm run test:e2e:install` | Installs the Chromium browser Playwright needs |
| backend tests | `pytest` | Runs the backend test suite (run from backend/); pytest.ini sets pythonpath=. and testpaths=tests |
| backend lint | `ruff check .` | Lints the backend code with Ruff (run from backend/) |
| backend format | `ruff format .` | Formats the backend code with Ruff (run from backend/) |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Frontend screens show sample data instead of real values | This is expected: per frontend/README.md the approved screens render seeded sample data and are not yet wired to the backend. Use src/lib/api.ts's apiFetch as the integration point. |
| Backend calls from the browser fail with a CORS error | Set the ALLOWED_ORIGINS env var (comma-separated origins) read in backend/app/main.py; without it only http://localhost:5173 and http://127.0.0.1:5173 are allowed. |
| Backend builds against SQLite but the approved stack is PostgreSQL | Set DATABASE_URL to a PostgreSQL connection string (e.g. matching the docker-compose.yml db service) before starting uvicorn; the default in backend/app/database.py is sqlite:///./app.db. |
| npm run build succeeds but tsc fails | Run npm run typecheck separately; per frontend/README.md, build does not typecheck and generated screens can pass the build while failing tsc. |
| Playwright e2e tests fail to start the backend | playwright.config.ts expects a Python virtualenv at backend/.venv with dependencies installed; create it and install backend/requirements.txt there before running npm run test:e2e. |
<!-- sdlc:auto:end troubleshooting -->
