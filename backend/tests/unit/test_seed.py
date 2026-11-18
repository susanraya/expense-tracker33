"""Unit coverage for bootstrap/smoke-test seeding (US-001-1).

Seeding reads only BOOTSTRAP_ADMIN_EMAIL/PASSWORD and SMOKE_TEST_EMAIL/PASSWORD,
creates each idempotently, assigns the admin the highest role and the smoke
user the lowest, and seeds nothing when either pair is unset.
"""

from sqlalchemy import select

from app.models import User
from app.seed import seed_bootstrap_users


def test_seeding_twice_creates_one_user_per_pair(db_session, monkeypatch) -> None:
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAIL", "admin@example.com")
    monkeypatch.setenv("BOOTSTRAP_ADMIN_PASSWORD", "AdminPass123")
    monkeypatch.setenv("SMOKE_TEST_EMAIL", "smoke@example.com")
    monkeypatch.setenv("SMOKE_TEST_PASSWORD", "SmokePass123")

    seed_bootstrap_users(db_session)
    seed_bootstrap_users(db_session)

    admins = (
        db_session.execute(select(User).where(User.email == "admin@example.com")).scalars().all()
    )
    smokes = (
        db_session.execute(select(User).where(User.email == "smoke@example.com")).scalars().all()
    )

    assert len(admins) == 1
    assert len(smokes) == 1
    assert admins[0].role == "admin"
    assert smokes[0].role == "user"


def test_seeding_nothing_when_env_vars_are_unset(db_session, monkeypatch) -> None:
    monkeypatch.delenv("BOOTSTRAP_ADMIN_EMAIL", raising=False)
    monkeypatch.delenv("BOOTSTRAP_ADMIN_PASSWORD", raising=False)
    monkeypatch.delenv("SMOKE_TEST_EMAIL", raising=False)
    monkeypatch.delenv("SMOKE_TEST_PASSWORD", raising=False)

    seed_bootstrap_users(db_session)

    assert db_session.execute(select(User)).first() is None
