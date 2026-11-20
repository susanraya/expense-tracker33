"""Integration coverage for the /expenses endpoints (US-020-2)."""

import secrets
import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Expense


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


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _make_category(client: TestClient, token: str, name: str = "Groceries") -> str:
    response = client.post("/categories", json={"name": name}, headers=_auth_headers(token))
    return response.json()["id"]


def _make_expense(
    client: TestClient,
    token: str,
    amount: float = 10.0,
    on: str = "2026-01-15",
    description: str = "Lunch",
    category_id: str | None = None,
) -> dict:
    payload = {"amount": amount, "date": on, "description": description}
    if category_id is not None:
        payload["category_id"] = category_id
    response = client.post("/expenses", json=payload, headers=_auth_headers(token))
    return response.json()


# --- AC-037/NFR-005: 401 without a valid token, no data returned or changed ---


def test_ac037_list_without_a_token_returns_401_and_no_data(client: TestClient) -> None:
    response = client.get("/expenses")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_ac037_create_without_a_token_returns_401_and_creates_no_row(
    client: TestClient, db_session: Session
) -> None:
    response = client.post(
        "/expenses", json={"amount": 10.0, "date": "2026-01-01", "description": "x"}
    )
    assert response.status_code == 401
    assert db_session.execute(select(Expense)).first() is None


def test_ac037_patch_without_a_token_returns_401(client: TestClient) -> None:
    response = client.patch(f"/expenses/{uuid.uuid4()}", json={"amount": 5.0})
    assert response.status_code == 401


def test_ac037_delete_without_a_token_returns_401(client: TestClient) -> None:
    response = client.delete(f"/expenses/{uuid.uuid4()}")
    assert response.status_code == 401


# --- GET /expenses: scoping, filters, ordering, pagination ---


def test_ac036_ac008_list_returns_only_the_callers_expenses_newest_first(
    client: TestClient,
) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)

    _make_expense(client, token_a, on="2026-01-01", description="Old")
    _make_expense(client, token_a, on="2026-01-10", description="New")
    _make_expense(client, token_b, on="2026-01-20", description="Other users")

    response = client.get("/expenses", headers=_auth_headers(token_a))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    descriptions = [item["description"] for item in body["items"]]
    assert descriptions == ["New", "Old"]


def test_ac036_list_filters_by_start_and_end(client: TestClient) -> None:
    _, token = _register_and_login(client)
    _make_expense(client, token, on="2026-01-05", description="Jan")
    _make_expense(client, token, on="2026-02-05", description="Feb")
    _make_expense(client, token, on="2026-03-05", description="Mar")

    response = client.get("/expenses?start=2026-02-01&end=2026-02-28", headers=_auth_headers(token))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["description"] == "Feb"


def test_ac036_list_filters_by_category_id(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)
    _make_expense(client, token, description="Categorized", category_id=category_id)
    _make_expense(client, token, description="Uncategorized")

    response = client.get(f"/expenses?category_id={category_id}", headers=_auth_headers(token))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["description"] == "Categorized"
    assert body["items"][0]["category_id"] == category_id
    assert body["items"][0]["category_name"] == "Groceries"


def test_ac036_list_respects_limit_and_offset(client: TestClient) -> None:
    _, token = _register_and_login(client)
    for day in range(1, 6):
        _make_expense(client, token, on=f"2026-01-0{day}", description=f"d{day}")

    response = client.get("/expenses?limit=2&offset=1", headers=_auth_headers(token))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 5
    assert len(body["items"]) == 2
    # Newest first; offset=1 skips the single newest item.
    assert body["items"][0]["description"] == "d4"


def test_list_with_start_after_end_returns_422_with_a_clear_message(client: TestClient) -> None:
    _, token = _register_and_login(client)

    response = client.get("/expenses?start=2026-02-01&end=2026-01-01", headers=_auth_headers(token))

    assert response.status_code == 422
    assert "detail" in response.json()
    assert isinstance(response.json()["detail"], str)


# --- POST /expenses ---


def test_ac036_create_returns_201_with_the_created_expense(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    response = client.post(
        "/expenses",
        json={
            "amount": 19.99,
            "date": "2026-01-15",
            "description": "Groceries run",
            "category_id": category_id,
        },
        headers=_auth_headers(token),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["amount"] == 19.99
    assert body["date"] == "2026-01-15"
    assert body["description"] == "Groceries run"
    assert body["category_id"] == category_id
    assert body["category_name"] == "Groceries"
    assert "id" in body and "created_at" in body


def test_ac036_create_with_unknown_category_id_returns_404_and_creates_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)

    response = client.post(
        "/expenses",
        json={
            "amount": 10.0,
            "date": "2026-01-01",
            "description": "x",
            "category_id": str(uuid.uuid4()),
        },
        headers=_auth_headers(token),
    )

    assert response.status_code == 404
    assert db_session.execute(select(Expense)).first() is None


def test_ac036_create_with_another_users_category_id_returns_404_and_creates_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    other_category_id = _make_category(client, token_b)

    response = client.post(
        "/expenses",
        json={
            "amount": 10.0,
            "date": "2026-01-01",
            "description": "x",
            "category_id": other_category_id,
        },
        headers=_auth_headers(token_a),
    )

    assert response.status_code == 404
    assert db_session.execute(select(Expense)).first() is None


def test_create_with_non_positive_amount_returns_422(client: TestClient) -> None:
    _, token = _register_and_login(client)

    response = client.post(
        "/expenses",
        json={"amount": 0, "date": "2026-01-01", "description": "x"},
        headers=_auth_headers(token),
    )

    assert response.status_code == 422


def test_amounts_are_stored_at_fixed_precision_without_float_drift(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)

    created = _make_expense(client, token, amount=19.99, description="Precision check")

    stored = db_session.execute(
        select(Expense).where(Expense.id == uuid.UUID(created["id"]))
    ).scalar_one()
    assert str(stored.amount) == "19.99"
    assert created["amount"] == 19.99


# --- PATCH /expenses/{id} ---


def test_ac008_patch_updates_only_the_callers_own_expense(client: TestClient) -> None:
    _, token = _register_and_login(client)
    created = _make_expense(client, token, amount=10.0, description="Before")

    response = client.patch(
        f"/expenses/{created['id']}",
        json={"amount": 25.5, "description": "After"},
        headers=_auth_headers(token),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["amount"] == 25.5
    assert body["description"] == "After"


def test_ac008_patch_another_users_id_returns_404_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    created = _make_expense(client, token_a, amount=10.0, description="Mine")

    response = client.patch(
        f"/expenses/{created['id']}",
        json={"amount": 999.0, "description": "Hijacked"},
        headers=_auth_headers(token_b),
    )

    assert response.status_code == 404
    stored = db_session.execute(
        select(Expense).where(Expense.id == uuid.UUID(created["id"]))
    ).scalar_one()
    assert stored.note == "Mine"
    assert str(stored.amount) == "10.00"


def test_patch_with_unknown_category_id_returns_404_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)
    created = _make_expense(client, token, amount=10.0, description="Mine")

    response = client.patch(
        f"/expenses/{created['id']}",
        json={"category_id": str(uuid.uuid4()), "description": "Should not apply"},
        headers=_auth_headers(token),
    )

    assert response.status_code == 404
    stored = db_session.execute(
        select(Expense).where(Expense.id == uuid.UUID(created["id"]))
    ).scalar_one()
    assert stored.note == "Mine"


# --- DELETE /expenses/{id} ---


def test_ac008_delete_deletes_only_the_callers_own_expense(client: TestClient) -> None:
    _, token = _register_and_login(client)
    created = _make_expense(client, token)

    response = client.delete(f"/expenses/{created['id']}", headers=_auth_headers(token))
    follow_up = client.get("/expenses", headers=_auth_headers(token))

    assert response.status_code == 204
    assert follow_up.json()["total"] == 0


def test_ac008_delete_another_users_id_returns_404(client: TestClient, db_session: Session) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    created = _make_expense(client, token_a)

    response = client.delete(f"/expenses/{created['id']}", headers=_auth_headers(token_b))

    assert response.status_code == 404
    stored = db_session.execute(
        select(Expense).where(Expense.id == uuid.UUID(created["id"]))
    ).scalar_one_or_none()
    assert stored is not None
