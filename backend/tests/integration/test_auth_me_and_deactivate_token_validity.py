"""AC-009/AC-037/NFR-005: /auth/me and /account/deactivate reject a missing,
garbage, logged-out or idle-expired bearer token with 401 and change nothing.

test_token_validity_and_persistence.py already proves this for every
categories/expenses endpoint; this file closes the gap for the two
remaining protected endpoints the acceptance criteria name explicitly.
"""

import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, UserSession


def _password() -> str:
    return secrets.token_hex(6) + "Aa1"


def _email() -> str:
    return f"user-{uuid.uuid4().hex}@example.com"


def _register_and_login(client: TestClient) -> tuple[str, str]:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    return email, login.json()["token"]


def test_ac037_me_with_garbage_token_returns_401(client: TestClient) -> None:
    response = client.get(
        "/auth/me", headers={"Authorization": f"Bearer garbage-{uuid.uuid4().hex}"}
    )
    assert response.status_code == 401
    assert "email" not in response.json()


def test_ac037_me_with_logged_out_token_returns_401(client: TestClient) -> None:
    _, token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/auth/logout", headers=headers)

    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401


def test_ac037_me_with_idle_expired_token_returns_401(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)
    session = db_session.execute(select(UserSession)).scalar_one()
    session.last_active_at = datetime.now(UTC) - timedelta(hours=2)
    session.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db_session.commit()

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_ac037_deactivate_with_garbage_token_returns_401_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    email, _ = _register_and_login(client)

    response = client.post(
        "/account/deactivate",
        headers={"Authorization": f"Bearer garbage-{uuid.uuid4().hex}"},
    )

    assert response.status_code == 401
    user = db_session.execute(select(User).where(User.email == email)).scalar_one()
    assert user.is_active is True


def test_ac037_deactivate_with_logged_out_token_returns_401_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    email, token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/auth/logout", headers=headers)

    response = client.post("/account/deactivate", headers=headers)

    assert response.status_code == 401
    user = db_session.execute(select(User).where(User.email == email)).scalar_one()
    assert user.is_active is True


def test_ac037_deactivate_with_idle_expired_token_returns_401_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    email, token = _register_and_login(client)
    session = db_session.execute(select(UserSession)).scalar_one()
    session.last_active_at = datetime.now(UTC) - timedelta(hours=2)
    session.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db_session.commit()

    response = client.post("/account/deactivate", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    user = db_session.execute(select(User).where(User.email == email)).scalar_one()
    assert user.is_active is True
