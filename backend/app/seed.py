"""Bootstrap and smoke-test user seeding, run once at application startup.

The deployment platform always sets `BOOTSTRAP_ADMIN_EMAIL` and
`BOOTSTRAP_ADMIN_PASSWORD` on the deployed API, and sets `SMOKE_TEST_EMAIL`
and `SMOKE_TEST_PASSWORD` for end-to-end runs. The app has exactly two roles
("admin", the highest, and "user", the lowest): the bootstrap account is
seeded as "admin", the smoke-test account as "user".

Seeding is idempotent (skipped when a user with that email already exists)
and reads only these four names; neither pair is set for a local run or the
test suite, so neither seeds anything there.
"""

import os

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User
from app.security import hash_password


def _seed_one(session: Session, email: str | None, password: str | None, role: str) -> None:
    if not email or not password:
        return
    email = email.strip().lower()
    already_exists = session.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if already_exists is not None:
        return
    session.add(User(email=email, password_hash=hash_password(password), is_active=True, role=role))
    session.commit()


def seed_bootstrap_users(session: Session) -> None:
    """Create the admin and smoke-test users the platform's env vars name, if set."""
    _seed_one(
        session, os.getenv("BOOTSTRAP_ADMIN_EMAIL"), os.getenv("BOOTSTRAP_ADMIN_PASSWORD"), "admin"
    )
    _seed_one(session, os.getenv("SMOKE_TEST_EMAIL"), os.getenv("SMOKE_TEST_PASSWORD"), "user")
