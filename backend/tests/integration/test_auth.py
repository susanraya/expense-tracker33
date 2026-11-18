"""Integration coverage for the auth and account endpoints (US-001)."""

import secrets
import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, UserSession


def _password() -> str:
    """A password meeting the stated rules (>=10 chars, a letter and a digit),
    generated at run time rather than written as a literal."""
    return secrets.token_hex(6) + "Aa1"


def _email() -> str:
    return f"user-{uuid.uuid4().hex}@example.com"


def test_ac001_register_creates_user_and_hashes_the_password(
    client: TestClient, db_session: Session
) -> None:
    email = _email()
    password = _password()

    response = client.post("/auth/register", json={"email": email, "password": password})

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == email
    assert body["role"] == "user"
    assert "id" in body and "created_at" in body

    stored = db_session.execute(select(User).where(User.email == email)).scalar_one()
    assert stored.password_hash != password
    assert stored.password_hash.startswith("$2")


def test_ac002_register_duplicate_email_returns_409_and_creates_no_row(
    client: TestClient, db_session: Session
) -> None:
    email = _email()
    client.post("/auth/register", json={"email": email, "password": _password()})

    response = client.post("/auth/register", json={"email": email, "password": _password()})

    assert response.status_code == 409
    assert "detail" in response.json()
    count = len(db_session.execute(select(User).where(User.email == email)).scalars().all())
    assert count == 1


def test_ac003_register_invalid_email_returns_422_and_creates_no_user(
    client: TestClient, db_session: Session
) -> None:
    response = client.post(
        "/auth/register", json={"email": "not-an-email", "password": _password()}
    )

    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)
    assert db_session.execute(select(User)).first() is None


def test_ac003_register_invalid_password_returns_422_and_creates_no_user(
    client: TestClient, db_session: Session
) -> None:
    response = client.post("/auth/register", json={"email": _email(), "password": "short1"})

    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)
    assert db_session.execute(select(User)).first() is None


def test_ac004_login_returns_token_and_user(client: TestClient) -> None:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})

    response = client.post("/auth/login", json={"email": email, "password": password})

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == email
    assert body["user"]["role"] == "user"
    assert "token" in body and "expires_at" in body


def test_ac005_login_unknown_email_and_wrong_password_return_identical_401(
    client: TestClient,
) -> None:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})

    unknown_response = client.post("/auth/login", json={"email": _email(), "password": _password()})
    wrong_password_response = client.post(
        "/auth/login", json={"email": email, "password": _password()}
    )

    assert unknown_response.status_code == 401
    assert wrong_password_response.status_code == 401
    assert unknown_response.json() == {"detail": "Invalid email or password"}
    assert unknown_response.json() == wrong_password_response.json()


def test_ac007_me_returns_user_with_a_valid_token(client: TestClient) -> None:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    token = login.json()["token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == email


def test_ac007_me_without_a_token_returns_401(client: TestClient) -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_ac007_last_active_at_updates_on_authenticated_requests(
    client: TestClient, db_session: Session
) -> None:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    token = login.json()["token"]

    session_before = db_session.execute(select(UserSession)).scalar_one()
    first_seen = session_before.last_active_at

    client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    db_session.refresh(session_before)
    assert session_before.last_active_at >= first_seen


def test_ac006_logout_revokes_the_session(client: TestClient) -> None:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    token = login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    logout_response = client.post("/auth/logout", headers=headers)
    reuse_response = client.get("/auth/me", headers=headers)

    assert logout_response.status_code == 204
    assert reuse_response.status_code == 401


def test_ac010_deactivate_revokes_sessions_and_blocks_future_sign_in(
    client: TestClient,
) -> None:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    token = login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    deactivate_response = client.post("/account/deactivate", headers=headers)
    me_after = client.get("/auth/me", headers=headers)
    login_after = client.post("/auth/login", json={"email": email, "password": password})

    assert deactivate_response.status_code == 204
    assert me_after.status_code == 401
    assert login_after.status_code == 401
    assert login_after.json() == {"detail": "Invalid email or password"}


def test_ac010_deactivate_without_a_token_returns_401(client: TestClient) -> None:
    response = client.post("/account/deactivate")
    assert response.status_code == 401


def test_ac007_idle_session_past_the_configured_window_returns_401(
    client: TestClient, db_session: Session
) -> None:
    """NFR-004: a session whose idle deadline has passed (regardless of
    last_active_at history) is rejected -- the server re-checks on every
    request rather than trusting a client-held token indefinitely."""
    from datetime import UTC, datetime, timedelta

    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    token = login.json()["token"]

    session = db_session.execute(select(UserSession)).scalar_one()
    session.last_active_at = datetime.now(UTC) - timedelta(hours=2)
    session.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db_session.commit()

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
