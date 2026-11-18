# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `ea65453` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
This repository is a Quorq-generated 'expense tracker' scaffold containing two independent apps. The frontend is a Vite + React 19 single-page app whose screens were generated from an approved design and currently render seeded sample data rather than calling a real API. The backend is a FastAPI 0.115 service generated before any architecture was approved, so it only exposes a health check endpoint and the plumbing (database session, models base, schema stubs, router package) for future endpoints to be added. The backend defaults to a local SQLite file so it runs with no external database, though the approved stack names PostgreSQL 16 on AWS.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for Vite 6 / React 19 / npm scripts)
- Python 3.12
- pip
- Docker and Docker Compose (optional, for the Postgres container in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository.
2. Backend: cd backend && pip install -r requirements.txt
3. Start the backend: uvicorn app.main:app --reload (creates a local SQLite app.db on first run via the startup lifespan hook)
4. Frontend: cd frontend && npm install
5. Start the frontend: npm run dev (Vite dev server, defaults to http://localhost:5173, which the backend's CORS config already allows)
6. Optional: to use Postgres instead of SQLite, run 'docker compose up -d db' from the repo root, then set the DATABASE_URL environment variable for the backend before starting uvicorn
7. Optional: set ALLOWED_ORIGINS (comma-separated) on the backend if the frontend runs on a different origin than the dev defaults
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev | `uvicorn app.main:app --reload` | Run the FastAPI backend locally with auto-reload (run from backend/) |
| frontend dev | `npm run dev` | Run the Vite dev server for the React SPA (run from frontend/) |
| frontend build | `npm run build` | Bundle the frontend for production (does not typecheck) |
| frontend preview | `npm run preview` | Serve the production build locally |
| frontend typecheck | `npm run typecheck` | Run tsc --noEmit over the frontend |
| docker compose db | `docker compose up -d db` | Start a local PostgreSQL 16 container defined in docker-compose.yml |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend` | FastAPI service: entrypoint, DB session, models, schemas, routers, Dockerfile, requirements |
| `backend/app` | Application code: main.py (app + /health), database.py (engine/session), models.py (SQLAlchemy Base), schemas.py (Pydantic stub response), routers/ (one router per architecture component, currently empty) |
| `backend/tests` | Pytest suite: tests/unit and tests/integration (currently a health-check integration test) |
| `frontend` | Vite + React SPA: approved screens, build config, lint/format/test tooling, Playwright e2e specs |
| `frontend/src` | App source: main.tsx entrypoint, index.css, lib/ (api.ts API client, ui.tsx/icons.tsx component vocabulary, navigate.ts) |
| `frontend/e2e` | Playwright acceptance tests and support helpers (e.g. admin.ts), run against a locally booted app or a deployed URL |
| `.devcontainer` | VS Code devcontainer configuration for a consistent local dev environment |
| `.quorq` | Quorq platform metadata for this generated project (handoff.json) |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend routers are generated one per approved architecture component, with one route per declared endpoint; routers/ is currently empty because no architecture was approved yet.
- Unimplemented backend routes are meant to return the typed StubResponse (schemas.py) rather than raise, keeping the service startable and its OpenAPI spec complete.
- SQLAlchemy models inherit from the shared Base in app/database.py; app/main.py imports models before calling Base.metadata.create_all at startup (no migration tool yet).
- DATABASE_URL defaults to a local sqlite:///./app.db so the backend runs without any external database server; set DATABASE_URL to point at Postgres when one exists.
- Backend CORS origins come from the ALLOWED_ORIGINS env var (comma-separated), falling back to the Vite dev server origins in development.
- Frontend screens are generated from an approved design and currently render seeded sample data; frontend/src/lib/api.ts is the intended seam for wiring a screen to the real backend (apiFetch helper, bearer auth via a session token or the shared API_SECRET_KEY).
- Frontend component tests live beside the components they test and run under Vitest with jsdom; Playwright specs live under e2e/ and are excluded from the Vitest run.
- Code style is enforced by ESLint/Prettier on the frontend and ruff on the backend.
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend tests | `pytest` | Run backend unit and integration tests (run from backend/; pytest.ini sets pythonpath=. so app imports resolve) |
| backend lint | `ruff check .` | Lint the backend with ruff |
| backend format | `ruff format .` | Format the backend with ruff |
| frontend unit tests | `npm run test` | Run Vitest component tests |
| frontend lint | `npm run lint` | Run ESLint over the frontend (also used as a gate during development) |
| frontend e2e install | `npm run test:e2e:install` | Install the Chromium browser Playwright needs |
| frontend e2e tests | `npm run test:e2e` | Run Playwright acceptance tests; boots the backend and a production frontend build locally unless E2E_BASE_URL is set |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Running `pytest` fails to import `app` | Run pytest from the backend/ directory; pytest.ini sets pythonpath=. for that location. |
| Frontend dev server calls to the backend are blocked by the browser (CORS) | Set the backend's ALLOWED_ORIGINS env var to include the frontend's origin, or rely on the default localhost:5173/127.0.0.1:5173 allowance for plain `npm run dev`. |
| Screens show sample data instead of live data | This is expected: the generated screens are approved against seeded sample data and have not yet been wired to the backend via frontend/src/lib/api.ts. |
| `npm run test:e2e` fails because no browser is installed | Run `npm run test:e2e:install` once before running the e2e suite. |
| Backend schema changes aren't reflected after editing models.py | There are no migrations yet; delete the local app.db (SQLite) so Base.metadata.create_all recreates tables on next startup. |
<!-- sdlc:auto:end troubleshooting -->
