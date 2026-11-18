"""Integration coverage for the /categories endpoints (US-020-1)."""

import secrets
import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Category


def _password() -> str:
    return secrets.token_hex(6) + "Aa1"


def _email() -> str:
    return f"user-{uuid.uuid4().hex}@example.com"


def _register_and_login(client: TestClient) -> tuple[str, str]:
    """Registers a fresh user and returns (email, bearer token)."""
    email = _email()
    password = _password()
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    return email, login.json()["token"]


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_ac037_list_without_a_token_returns_401_and_no_data(client: TestClient) -> None:
    response = client.get("/categories")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_ac037_create_without_a_token_returns_401_and_creates_no_row(
    client: TestClient, db_session: Session
) -> None:
    response = client.post("/categories", json={"name": "Groceries"})
    assert response.status_code == 401
    assert db_session.execute(select(Category)).first() is None


def test_ac037_patch_without_a_token_returns_401(client: TestClient) -> None:
    response = client.patch(f"/categories/{uuid.uuid4()}", json={"name": "New"})
    assert response.status_code == 401


def test_ac037_delete_without_a_token_returns_401(client: TestClient) -> None:
    response = client.delete(f"/categories/{uuid.uuid4()}")
    assert response.status_code == 401


def test_ac036_ac008_list_returns_only_the_callers_categories_ordered_by_name(
    client: TestClient,
) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)

    client.post("/categories", json={"name": "Zebra"}, headers=_auth_headers(token_a))
    client.post("/categories", json={"name": "Apple"}, headers=_auth_headers(token_a))
    client.post("/categories", json={"name": "Only Bob's"}, headers=_auth_headers(token_b))

    response = client.get("/categories", headers=_auth_headers(token_a))

    assert response.status_code == 200
    names = [item["name"] for item in response.json()]
    assert names == ["Apple", "Zebra"]


def test_ac036_create_returns_201_with_the_created_category(client: TestClient) -> None:
    _, token = _register_and_login(client)

    response = client.post(
        "/categories", json={"name": "Groceries", "color": "#ff0000"}, headers=_auth_headers(token)
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Groceries"
    assert body["color"] == "#ff0000"
    assert "id" in body and "created_at" in body


def test_ac036_duplicate_name_for_the_same_user_returns_409(client: TestClient) -> None:
    _, token = _register_and_login(client)
    client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token))

    response = client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token))

    assert response.status_code == 409
    assert "detail" in response.json()


def test_ac036_same_name_for_a_different_user_succeeds(client: TestClient) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token_a))

    response = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token_b)
    )

    assert response.status_code == 201


def test_create_invalid_payload_returns_422(client: TestClient) -> None:
    _, token = _register_and_login(client)

    response = client.post("/categories", json={"name": "   "}, headers=_auth_headers(token))

    assert response.status_code == 422


def test_ac008_patch_updates_only_the_callers_own_category(client: TestClient) -> None:
    _, token = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token)
    ).json()

    response = client.patch(
        f"/categories/{created['id']}",
        json={"name": "Food", "color": "#00ff00"},
        headers=_auth_headers(token),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Food"
    assert body["color"] == "#00ff00"


def test_ac008_patch_another_users_id_returns_404_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token_a)
    ).json()

    response = client.patch(
        f"/categories/{created['id']}", json={"name": "Hijacked"}, headers=_auth_headers(token_b)
    )

    assert response.status_code == 404
    stored = db_session.execute(
        select(Category).where(Category.id == uuid.UUID(created["id"]))
    ).scalar_one()
    assert stored.name == "Groceries"


def test_patch_duplicate_name_returns_409(client: TestClient) -> None:
    _, token = _register_and_login(client)
    client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token))
    created = client.post(
        "/categories", json={"name": "Transport"}, headers=_auth_headers(token)
    ).json()

    response = client.patch(
        f"/categories/{created['id']}", json={"name": "Groceries"}, headers=_auth_headers(token)
    )

    assert response.status_code == 409


def test_ac008_delete_deletes_only_the_callers_own_category(client: TestClient) -> None:
    _, token = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token)
    ).json()

    response = client.delete(f"/categories/{created['id']}", headers=_auth_headers(token))
    follow_up = client.get("/categories", headers=_auth_headers(token))

    assert response.status_code == 204
    assert follow_up.json() == []


def test_ac008_delete_another_users_id_returns_404(client: TestClient) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token_a)
    ).json()

    response = client.delete(f"/categories/{created['id']}", headers=_auth_headers(token_b))

    assert response.status_code == 404
