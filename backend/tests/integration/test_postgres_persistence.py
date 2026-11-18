"""AC-036: create/update/delete through the REST endpoints persist to the
real PostgreSQL database configured by DATABASE_URL -- not a SQLite
stand-in -- and are visible on a later, independent request.

Every other test in this suite runs against the in-memory SQLite the
`client`/`db_session` fixtures substitute (see conftest.py), so that the
suite collects without a database server being up. This file instead builds
its own `TestClient` directly from `app.main.app`, with no `get_db`
override, so it talks to whatever `DATABASE_URL` the environment names --
the sandbox's real PostgreSQL, per ENVIRONMENT.md ("Tests use the real
PostgreSQL the sandbox runs ... no mocks, no SQLite stand-in").
"""

import secrets
import uuid

from fastapi.testclient import TestClient

from app.main import app


def _password() -> str:
    return secrets.token_hex(6) + "Aa1"


def _email() -> str:
    return f"qa-pg-{uuid.uuid4().hex}@example.com"


def test_ac036_create_update_delete_persist_to_postgresql_and_are_visible_later() -> None:
    email = _email()
    password = _password()

    with TestClient(app) as client:
        register = client.post("/auth/register", json={"email": email, "password": password})
        assert register.status_code == 201
        login = client.post("/auth/login", json={"email": email, "password": password})
        assert login.status_code == 200
        token = login.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        category = client.post(
            "/categories",
            json={"name": f"PG check {uuid.uuid4().hex[:8]}"},
            headers=headers,
        ).json()
        expense = client.post(
            "/expenses",
            json={
                "amount": 9.5,
                "date": "2026-01-01",
                "description": "pg persistence",
                "category_id": category["id"],
            },
            headers=headers,
        ).json()

    # A later, wholly independent client -- a fresh TestClient, no shared
    # in-process state -- still finds both rows: proof they were committed
    # to the real database rather than held only in the earlier process.
    with TestClient(app) as later_client:
        categories = later_client.get("/categories", headers=headers).json()
        expenses = later_client.get("/expenses", headers=headers).json()
        assert any(c["id"] == category["id"] for c in categories)
        assert any(e["id"] == expense["id"] for e in expenses["items"])

        updated = later_client.patch(
            f"/categories/{category['id']}", json={"name": "PG renamed"}, headers=headers
        )
        assert updated.status_code == 200

        deleted = later_client.delete(f"/expenses/{expense['id']}", headers=headers)
        assert deleted.status_code == 204

    with TestClient(app) as final_client:
        categories_after = final_client.get("/categories", headers=headers).json()
        expenses_after = final_client.get("/expenses", headers=headers).json()
        assert any(
            c["id"] == category["id"] and c["name"] == "PG renamed" for c in categories_after
        )
        assert all(e["id"] != expense["id"] for e in expenses_after["items"])
