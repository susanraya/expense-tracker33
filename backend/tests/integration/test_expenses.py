"""Integration coverage for the /expenses endpoints (US-006-1)."""

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
    category_id: str,
    amount: float = 10.0,
    on: str = "2026-01-15",
    note: str | None = "Lunch",
) -> dict:
    payload = {"amount": amount, "date": on, "category_id": category_id}
    if note is not None:
        payload["note"] = note
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
        "/expenses",
        json={"amount": 10.0, "date": "2026-01-01", "category_id": str(uuid.uuid4())},
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
    category_a = _make_category(client, token_a)
    category_b = _make_category(client, token_b)

    _make_expense(client, token_a, category_a, on="2026-01-01", note="Old")
    _make_expense(client, token_a, category_a, on="2026-01-10", note="New")
    _make_expense(client, token_b, category_b, on="2026-01-20", note="Other users")

    response = client.get("/expenses", headers=_auth_headers(token_a))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    notes = [item["note"] for item in body["items"]]
    assert notes == ["New", "Old"]


def test_ac036_list_filters_by_start_and_end(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)
    _make_expense(client, token, category_id, on="2026-01-05", note="Jan")
    _make_expense(client, token, category_id, on="2026-02-05", note="Feb")
    _make_expense(client, token, category_id, on="2026-03-05", note="Mar")

    response = client.get("/expenses?start=2026-02-01&end=2026-02-28", headers=_auth_headers(token))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["note"] == "Feb"


def test_ac036_list_filters_by_category_id(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)
    other_category_id = _make_category(client, token, name="Other")
    _make_expense(client, token, category_id, note="Categorized")
    _make_expense(client, token, other_category_id, note="Other category")

    response = client.get(f"/expenses?category_id={category_id}", headers=_auth_headers(token))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["note"] == "Categorized"
    assert body["items"][0]["category_id"] == category_id
    assert body["items"][0]["category_name"] == "Groceries"


def test_ac036_list_respects_limit_and_offset(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)
    for day in range(1, 6):
        _make_expense(client, token, category_id, on=f"2026-01-0{day}", note=f"d{day}")

    response = client.get("/expenses?limit=2&offset=1", headers=_auth_headers(token))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 5
    assert len(body["items"]) == 2
    # Newest first; offset=1 skips the single newest item.
    assert body["items"][0]["note"] == "d4"


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
            "note": "Groceries run",
            "category_id": category_id,
        },
        headers=_auth_headers(token),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["amount"] == "19.99"
    assert body["date"] == "2026-01-15"
    assert body["note"] == "Groceries run"
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
            "note": "x",
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
            "note": "x",
            "category_id": other_category_id,
        },
        headers=_auth_headers(token_a),
    )

    assert response.status_code == 404
    assert db_session.execute(select(Expense)).first() is None


def test_ac012_create_missing_amount_returns_422_naming_the_field_and_creates_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    response = client.post(
        "/expenses",
        json={"date": "2026-01-01", "category_id": category_id},
        headers=_auth_headers(token),
    )

    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(error.get("loc", [None])[-1] == "amount" for error in errors)
    assert db_session.execute(select(Expense)).first() is None


def test_ac012_create_missing_date_returns_422_naming_the_field_and_creates_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    response = client.post(
        "/expenses",
        json={"amount": 10.0, "category_id": category_id},
        headers=_auth_headers(token),
    )

    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(error.get("loc", [None])[-1] == "date" for error in errors)
    assert db_session.execute(select(Expense)).first() is None


def test_ac012_create_missing_category_id_returns_422_naming_the_field_and_creates_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)

    response = client.post(
        "/expenses",
        json={"amount": 10.0, "date": "2026-01-01"},
        headers=_auth_headers(token),
    )

    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(error.get("loc", [None])[-1] == "category_id" for error in errors)
    assert db_session.execute(select(Expense)).first() is None


def test_ac012_create_with_non_numeric_amount_returns_422(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    response = client.post(
        "/expenses",
        json={"amount": "not-a-number", "date": "2026-01-01", "category_id": category_id},
        headers=_auth_headers(token),
    )

    assert response.status_code == 422


def test_create_with_non_positive_amount_returns_422(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    response = client.post(
        "/expenses",
        json={"amount": 0, "date": "2026-01-01", "category_id": category_id},
        headers=_auth_headers(token),
    )

    assert response.status_code == 422


def test_create_with_negative_amount_returns_422(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    response = client.post(
        "/expenses",
        json={"amount": -5, "date": "2026-01-01", "category_id": category_id},
        headers=_auth_headers(token),
    )

    assert response.status_code == 422


def test_amounts_are_stored_at_fixed_precision_without_float_drift(
    client: TestClient, db_session: Session
) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    created = _make_expense(client, token, category_id, amount=19.99, note="Precision check")

    stored = db_session.execute(
        select(Expense).where(Expense.id == uuid.UUID(created["id"]))
    ).scalar_one()
    assert str(stored.amount) == "19.99"
    assert created["amount"] == "19.99"


def test_ac013_response_exposes_no_recurring_receipt_or_currency_fields(
    client: TestClient,
) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)

    created = _make_expense(client, token, category_id)

    forbidden = {
        "recurring",
        "recurrence",
        "schedule",
        "receipt",
        "receipt_url",
        "attachment",
        "currency",
    }
    assert forbidden.isdisjoint(created.keys())


# --- PATCH /expenses/{id} ---


def test_ac008_patch_updates_only_the_callers_own_expense(client: TestClient) -> None:
    _, token = _register_and_login(client)
    category_id = _make_category(client, token)
    created = _make_expense(client, token, category_id, amount=10.0, note="Before")

    response = client.patch(
        f"/expenses/{created['id']}",
        json={"amount": 25.5, "note": "After"},
        headers=_auth_headers(token),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["amount"] == "25.50"
    assert body["note"] == "After"


def test_ac008_patch_another_users_id_returns_404_and_changes_nothing(
    client: TestClient, db_session: Session
) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    category_id = _make_category(client, token_a)
    created = _make_expense(client, token_a, category_id, amount=10.0, note="Mine")

    response = client.patch(
        f"/expenses/{created['id']}",
        json={"amount": 999.0, "note": "Hijacked"},
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
    category_id = _make_category(client, token)
    created = _make_expense(client, token, category_id, amount=10.0, note="Mine")

    response = client.patch(
        f"/expenses/{created['id']}",
        json={"category_id": str(uuid.uuid4()), "note": "Should not apply"},
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
    category_id = _make_category(client, token)
    created = _make_expense(client, token, category_id)

    response = client.delete(f"/expenses/{created['id']}", headers=_auth_headers(token))
    follow_up = client.get("/expenses", headers=_auth_headers(token))

    assert response.status_code == 204
    assert follow_up.json()["total"] == 0


def test_ac008_delete_another_users_id_returns_404(client: TestClient, db_session: Session) -> None:
    _, token_a = _register_and_login(client)
    _, token_b = _register_and_login(client)
    category_id = _make_category(client, token_a)
    created = _make_expense(client, token_a, category_id)

    response = client.delete(f"/expenses/{created['id']}", headers=_auth_headers(token_b))

    assert response.status_code == 404
    stored = db_session.execute(
        select(Expense).where(Expense.id == uuid.UUID(created["id"]))
    ).scalar_one_or_none()
    assert stored is not None
