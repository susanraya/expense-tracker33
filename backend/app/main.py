"""Application entrypoint.

Generated from the approved architecture: one router per component that owns
endpoints, one route per endpoint the API spec declares. Every generated route
is a stub that returns a typed placeholder, so the service starts, serves its
OpenAPI document and passes its tests before a single handler is implemented.
"""

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import MetaData, inspect
from sqlalchemy.exc import OperationalError, ProgrammingError

from app import models  # noqa: F401 -- imported so the tables register for Alembic
from app.database import SessionLocal, engine
from app.routers import account, auth, categories, expenses
from app.seed import seed_bootstrap_users

_BACKEND_DIR = Path(__file__).resolve().parent.parent


def _run_migrations() -> None:
    """Applies every Alembic migration up to `head`. The schema is created and
    changed only this way -- never by `Base.metadata.create_all` -- so a
    deployment's tables always match the versioned history in `migrations/`.

    A pre-existing database file (a stale dev/e2e SQLite file left over from
    before migrations existed, or from a run that created tables without
    stamping) can already hold every table migration 0001 would create, but
    with no `alembic_version` row. Re-running `upgrade` against that database
    tries to create tables that are already there and dies. When that is the
    situation -- the target tables exist but Alembic has no version stamped --
    we stamp the database at `head` instead of re-running the migrations,
    since the schema already matches it.

    A second case is a live race rather than a stale file: another process
    (a concurrently started worker against the same database, as happens in
    an e2e run) can create the schema *between* our inspection below and our
    own `command.upgrade` call. Our own CREATE TABLE then fails with
    "already exists" even though the schema now matches head -- we stamp
    instead of letting that crash the process that lost the race.
    """
    config = Config(str(_BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(_BACKEND_DIR / "migrations"))

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    expected_tables = {"users", "sessions", "categories", "expenses"}
    if expected_tables.issubset(existing_tables) and "alembic_version" not in existing_tables:
        command.stamp(config, "head")
        return

    if existing_tables & expected_tables and "alembic_version" not in existing_tables:
        # A partial schema left by an earlier interrupted run (some but not all
        # expected tables, no version stamped) collides with migration 0001's
        # own CREATE TABLE statements. Drop whatever is there so the migrations
        # can build every table cleanly instead of failing on one that already
        # exists.
        reflected = MetaData()
        reflected.reflect(bind=engine)
        reflected.drop_all(bind=engine)

    try:
        command.upgrade(config, "head")
    except (OperationalError, ProgrammingError) as exc:
        if "already exists" not in str(exc).lower():
            raise
        command.stamp(config, "head")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """This runs on startup and not at import, so importing the application never opens a
    connection. A test can therefore point `get_db` at a database of its own, and a
    deployment whose `DATABASE_URL` names a server that is not up fails where you can
    read the error, not while pytest collects the files.
    """
    _run_migrations()
    with SessionLocal() as session:
        seed_bootstrap_users(session)
    yield


app = FastAPI(
    title="expense tracker",
    description="simple expense tracker",
    version="0.1.0",
    lifespan=lifespan,
)

# The SPA runs on a different origin than the API, so the browser refuses its calls
# unless that origin is allowed here. In development that is the Vite dev server; when
# deployed, the platform injects the frontend's real URL as ALLOWED_ORIGINS (comma
# separated). Point ALLOWED_ORIGINS at the real thing and nothing else has to change.
_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or _dev_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(account.router)
app.include_router(categories.router)
app.include_router(expenses.router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness probe, and the only route here that is not a stub."""
    return {"status": "ok"}
