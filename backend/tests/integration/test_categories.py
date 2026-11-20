"""Integration coverage for the /categories endpoints (US-010-1)."""

import secrets
import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Category, Expense


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


def test_ac019_ac008_list_returns_only_the_callers_categories_ordered_by_name(
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


def test_ac019_create_returns_201_with_the_created_category_and_appears_in_list(
    client: TestClient,
) -> None:
    _, token = _register_and_login(client)

    response = client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token))

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Groceries"
    assert body["expense_count"] == 0
    assert "id" in body

    listed = client.get("/categories", headers=_auth_headers(token)).json()
    assert any(item["id"] == body["id"] for item in listed)


def test_ac020_blank_name_returns_422_naming_the_field_and_creates_no_row(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)

    response = client.post("/categories", json={"name": "   "}, headers=_auth_headers(token))

    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(error.get("loc", [None])[-1] == "name" for error in errors)
    assert db_session.execute(select(Category)).first() is None


def test_ac020_duplicate_name_for_the_same_user_returns_409_and_creates_no_row(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)
    client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token))

    response = client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token))

    assert response.status_code == 409
    assert "detail" in response.json()
    rows = db_session.execute(select(Category).where(Category.name == "Groceries")).scalars().all()
    count = len(rows)
    assert count == 1


def test_ac020_same_name_for_a_different_user_succeeds(client: TestClient) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token_a))

    response = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token_b)
    )

    assert response.status_code == 201


def test_ac021_patch_updates_the_name_and_reflects_on_expenses(client: TestClient) -> None:
    _, token = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token)
    ).json()
    client.post(
        "/expenses",
        json={
            "amount": 10.0,
            "date": "2026-01-01",
            "description": "milk",
            "category_id": created["id"],
        },
        headers=_auth_headers(token),
    )

    response = client.patch(
        f"/categories/{created['id']}", json={"name": "Food"}, headers=_auth_headers(token)
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Food"
    assert body["expense_count"] == 1

    expenses = client.get("/expenses", headers=_auth_headers(token)).json()
    assert expenses["items"][0]["category_name"] == "Food"


def test_ac021_patch_another_users_id_returns_404_and_changes_nothing(
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


def test_ac021_patch_duplicate_name_returns_409(client: TestClient) -> None:
    _, token = _register_and_login(client)
    client.post("/categories", json={"name": "Groceries"}, headers=_auth_headers(token))
    created = client.post(
        "/categories", json={"name": "Transport"}, headers=_auth_headers(token)
    ).json()

    response = client.patch(
        f"/categories/{created['id']}", json={"name": "Groceries"}, headers=_auth_headers(token)
    )

    assert response.status_code == 409


def test_ac021_patch_blank_name_returns_422(client: TestClient) -> None:
    _, token = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token)
    ).json()

    response = client.patch(
        f"/categories/{created['id']}", json={"name": "   "}, headers=_auth_headers(token)
    )

    assert response.status_code == 422


def test_ac022_delete_with_no_expenses_returns_204_and_disappears_from_list(
    client: TestClient,
) -> None:
    _, token = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token)
    ).json()

    response = client.delete(f"/categories/{created['id']}", headers=_auth_headers(token))
    follow_up = client.get("/categories", headers=_auth_headers(token))

    assert response.status_code == 204
    assert follow_up.json() == []


def test_ac023_delete_with_expenses_returns_409_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token)
    ).json()
    expense = client.post(
        "/expenses",
        json={
            "amount": 10.0,
            "date": "2026-01-01",
            "description": "milk",
            "category_id": created["id"],
        },
        headers=_auth_headers(token),
    ).json()

    response = client.delete(f"/categories/{created['id']}", headers=_auth_headers(token))

    assert response.status_code == 409
    detail = response.json()["detail"]
    assert "expense" in detail.lower()
    assert "reassign" in detail.lower() or "delete" in detail.lower()

    stored_category = db_session.execute(
        select(Category).where(Category.id == uuid.UUID(created["id"]))
    ).scalar_one_or_none()
    assert stored_category is not None
    stored_expense = db_session.execute(
        select(Expense).where(Expense.id == uuid.UUID(expense["id"]))
    ).scalar_one_or_none()
    assert stored_expense is not None
    assert str(stored_expense.category_id) == created["id"]


def test_ac008_delete_another_users_id_returns_404(client: TestClient) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    created = client.post(
        "/categories", json={"name": "Groceries"}, headers=_auth_headers(token_a)
    ).json()

    response = client.delete(f"/categories/{created['id']}", headers=_auth_headers(token_b))

    assert response.status_code == 404
