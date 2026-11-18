# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `34bd221` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Expense tracker is a Quorq-generated two-part app: a FastAPI 0.115 backend (Python, SQLAlchemy, Alembic migrations, SQLite by default or Postgres via DATABASE_URL) exposing auth, category and expense REST endpoints, and a Vite + React 19 single-page frontend. The backend currently implements real auth/account/category/expense routes behind bearer-token sessions, each query scoped to the authenticated user. The frontend's screens were approved against seeded sample data and are not yet wired to the backend's real endpoints — `src/lib/api.ts` is the prepared fetch wrapper/session-token store for that integration.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Python 3.12 (matches backend/Dockerfile base image)
- pip
- Node.js and npm (for the Vite 6 / React 19 frontend)
- Docker and docker-compose (optional, to run the PostgreSQL 16 service in docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository.
2. Backend: cd backend && pip install -r requirements.txt
3. (Optional, to use Postgres instead of the SQLite default) from the repo root run: docker-compose up -d, then export DATABASE_URL to point at it (see backend/app/database.py for the DATABASE_URL env var).
4. Start the backend: uvicorn app.main:app --reload (run from inside backend/). It applies Alembic migrations and seeds bootstrap users on startup.
5. Frontend: cd frontend && npm install
6. Start the frontend: npm run dev
7. Optionally set VITE_API_BASE_URL and VITE_API_SECRET_KEY (read in frontend/src/lib/api.ts) if the frontend needs to reach a non-default backend URL/shared secret.
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev | `cd backend && uvicorn app.main:app --reload` | Runs the FastAPI app with auto-reload; applies Alembic migrations and seeds bootstrap users on startup. |
| frontend dev | `cd frontend && npm run dev` | Starts the Vite dev server for the React SPA. |
| frontend build | `cd frontend && npm run build` | Bundles the app with Vite (does not typecheck). |
| frontend preview | `cd frontend && npm run preview` | Serves the production build locally. |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend/app` | FastAPI application: main.py entrypoint, database.py engine/session, models.py SQLAlchemy models, schemas.py Pydantic models, auth.py/security.py session and password logic, seed.py bootstrap users, routers/ for auth, account, categories, expenses |
| `backend/migrations` | Alembic migration environment and versioned schema scripts (migrations/versions) |
| `backend/tests` | Pytest unit and integration tests (tests/unit, tests/integration) |
| `backend/scripts` | Operational helper scripts (e.g. check_connections.py) |
| `frontend/src` | React app source: App.tsx shell/routes, main.tsx entry, screens/, lib/ |
| `frontend/src/screens` | One module per approved screen (Dashboard, Expenses, Categories, Reports, Settings, SignIn) plus their component tests |
| `frontend/src/lib` | Shared frontend modules: api.ts (API client/session token), auth.tsx (auth context/route guard), ui.tsx and icons.tsx (component vocabulary), brand.ts (design tokens), navigate.ts |
| `frontend/e2e` | Playwright acceptance specs and support helpers |
| `.devcontainer` | Dev container configuration for a consistent local environment |
| `.quorq` | Quorq platform metadata for this generated project (handoff/prepared state), not application code |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- One router per domain (auth, account, categories, expenses), one route per API-spec endpoint, mounted in app/main.py
- UUID primary keys on all models, serialized as strings in API responses
- Per-request ownership filtering baked into queries (user_id == current user); a resource owned by another user returns 404, never 403
- Schema changes only via Alembic migrations, never via Base.metadata.create_all in production code paths
- Passwords hashed with passlib/bcrypt; generic 401 on login for unknown email, wrong password, or deactivated account (no information leakage)
- Pydantic request/response schema pair per entity in schemas.py, with field_validators for input rules (email format, password strength, amount > 0)
- Frontend screens live one-per-file under src/screens with a colocated *.test.tsx; e2e specs live under e2e/ as *.spec.ts and are excluded from Vitest's include pattern
- Frontend API/session concerns centralized in src/lib/api.ts (apiFetch, ApiError, session token storage) rather than spread across screens
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend tests | `cd backend && pytest` | Runs backend unit and integration tests (pytest.ini sets pythonpath=. and testpaths=tests). |
| backend lint | `cd backend && ruff check .` | Lints the backend Python code. |
| backend format check | `cd backend && ruff format .` | Formats backend Python code with ruff. |
| frontend unit tests | `cd frontend && npm test` | Runs Vitest component tests colocated with screens/components. |
| frontend lint | `cd frontend && npm run lint` | Runs ESLint across the frontend app. |
| frontend typecheck | `cd frontend && npm run typecheck` | Runs tsc --noEmit; not run by npm run build. |
| frontend e2e | `cd frontend && npm run test:e2e:install && npm run test:e2e` | Installs the Chromium browser then runs Playwright specs from e2e/; builds/serves the app locally unless E2E_BASE_URL is set. |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Frontend calls to the backend fail with a CORS error in the browser console. | Set ALLOWED_ORIGINS on the backend to the frontend's origin (comma-separated); without it only http://localhost:5173 and http://127.0.0.1:5173 are allowed (app/main.py). |
| Backend fails to start migrations against a pre-existing local SQLite file (app.db) left from an earlier run. | main.py's _run_migrations already detects a stale/partial schema and stamps or rebuilds it automatically; if it still errors, delete the local app.db file and restart uvicorn so Alembic can create the schema cleanly. |
| Playwright e2e tests fail to launch a browser. | Run npm run test:e2e:install first to fetch Chromium before npm run test:e2e. |
| 401 responses on frontend API calls even though a user appears signed in. | Check that a real session token (not the shared VITE_API_SECRET_KEY) was stored via setSessionToken after /auth/login; apiFetch in src/lib/api.ts clears the stored token and triggers sign-out on any 401 from an authenticated call. |
| Wanted to run against Postgres instead of the SQLite default. | Start docker-compose up -d (postgres:16-alpine service) and set DATABASE_URL to point the backend at it before starting uvicorn; database.py otherwise defaults to sqlite:///./app.db. |
<!-- sdlc:auto:end troubleshooting -->
