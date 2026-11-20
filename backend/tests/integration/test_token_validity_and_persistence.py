"""AC-009/AC-037/NFR-005: every /categories and /expenses endpoint rejects a
missing, garbage, logged-out or idle-expired bearer token with 401 and
touches no row. Also AC-036: data created through POST survives a later
request in the same session (true persistence, not request-local state).
"""

import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Category, Expense, UserSession


def _password() -> str:
    return secrets.token_hex(6) + "Aa1"


def _email() -> str:
    return f"user-{uuid.uuid4().hex}@example.com"


def _register_and_login(client: TestClient) -> str:
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    return login.json()["token"]


def _row_counts(db_session: Session) -> tuple[int, int]:
    categories = db_session.execute(select(func.count()).select_from(Category)).scalar_one()
    expenses = db_session.execute(select(func.count()).select_from(Expense)).scalar_one()
    return categories, expenses


# Every endpoint this ticket adds, as (method, path-builder) pairs. Paths that
# need an id use a random uuid: a bad token must be rejected before the id is
# even looked up, so the id's validity does not matter here.
def _endpoints() -> list[tuple[str, str]]:
    some_id = str(uuid.uuid4())
    return [
        ("GET", "/categories"),
        ("POST", "/categories"),
        ("PATCH", f"/categories/{some_id}"),
        ("DELETE", f"/categories/{some_id}"),
        ("GET", "/expenses"),
        ("POST", "/expenses"),
        ("PATCH", f"/expenses/{some_id}"),
        ("DELETE", f"/expenses/{some_id}"),
    ]


def _call(client: TestClient, method: str, path: str, headers: dict[str, str]):
    if method == "GET":
        return client.get(path, headers=headers)
    if method == "DELETE":
        return client.delete(path, headers=headers)
    body = (
        {"name": "x"}
        if "categories" in path
        else {
            "amount": 10.0,
            "date": "2026-01-01",
            "note": "x",
            "category_id": str(uuid.uuid4()),
        }
    )
    if method == "POST":
        return client.post(path, json=body, headers=headers)
    return client.patch(path, json=body, headers=headers)


def test_ac037_no_token_returns_401_and_changes_no_row_on_every_endpoint(
    client: TestClient, db_session: Session
) -> None:
    before = _row_counts(db_session)
    for method, path in _endpoints():
        response = _call(client, method, path, headers={})
        assert response.status_code == 401, f"{method} {path} -> {response.status_code}"
    assert _row_counts(db_session) == before


def test_ac037_garbage_token_returns_401_and_changes_no_row_on_every_endpoint(
    client: TestClient, db_session: Session
) -> None:
    headers = {"Authorization": "Bearer not-a-real-token-at-all"}
    before = _row_counts(db_session)
    for method, path in _endpoints():
        response = _call(client, method, path, headers=headers)
        assert response.status_code == 401, f"{method} {path} -> {response.status_code}"
    assert _row_counts(db_session) == before


def test_ac037_logged_out_token_returns_401_and_changes_no_row_on_every_endpoint(
    client: TestClient, db_session: Session
) -> None:
    token = _register_and_login(client)
    client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
    headers = {"Authorization": f"Bearer {token}"}
    before = _row_counts(db_session)
    for method, path in _endpoints():
        response = _call(client, method, path, headers=headers)
        assert response.status_code == 401, f"{method} {path} -> {response.status_code}"
    assert _row_counts(db_session) == before


def test_ac037_idle_expired_token_returns_401_and_changes_no_row_on_every_endpoint(
    client: TestClient, db_session: Session
) -> None:
    token = _register_and_login(client)
    session = db_session.execute(select(UserSession)).scalar_one()
    session.last_active_at = datetime.now(UTC) - timedelta(hours=2)
    session.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db_session.commit()

    headers = {"Authorization": f"Bearer {token}"}
    before = _row_counts(db_session)
    for method, path in _endpoints():
        response = _call(client, method, path, headers=headers)
        assert response.status_code == 401, f"{method} {path} -> {response.status_code}"
    assert _row_counts(db_session) == before


def test_ac036_category_and_expense_created_through_post_survive_a_later_request(
    client: TestClient,
) -> None:
    """A later, independent request on the same session finds the rows that
    an earlier POST created -- they were committed to the database, not held
    only in the request's own memory."""
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    created_category = client.post(
        "/categories", json={"name": "Persistence check"}, headers=headers
    ).json()
    created_expense = client.post(
        "/expenses",
        json={
            "amount": 12.34,
            "date": "2026-01-01",
            "note": "Persisted",
            "category_id": created_category["id"],
        },
        headers=headers,
    ).json()

    # A separate GET call, with no reference to the objects the POST handlers
    # built, must still find them: proof they were committed to the database
    # rather than held only in the earlier request's own memory.
    list_categories = client.get("/categories", headers=headers).json()
    list_expenses = client.get("/expenses", headers=headers).json()

    assert any(c["id"] == created_category["id"] for c in list_categories)
    assert any(e["id"] == created_expense["id"] for e in list_expenses["items"])
