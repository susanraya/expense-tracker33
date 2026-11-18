"""AC-038: the app is free to use -- no billing or subscription flow exists anywhere
in the API, and registering an account never requires (or accepts as meaningful) any
payment detail.

This is a guarantee about *absence*: the approved api_spec names no billing/payment/
subscription endpoint, so this test pins that contract at two levels -- the served
OpenAPI document never grows such a path, and the handful of URLs a payment feature
would plausibly live at are not routed to anything.
"""

import secrets
import uuid

from fastapi.testclient import TestClient

# Terms a billing/subscription feature would almost certainly introduce into a path,
# an operationId or a tag if one existed.
_PAYMENT_TERMS = ("pay", "bill", "subscri", "stripe", "checkout", "invoice", "card")

# Concrete URLs a payment feature would plausibly expose. None of them is in the
# approved api_spec, so every one of them must be unrouted.
_CANDIDATE_PAYMENT_PATHS = [
    "/billing",
    "/billing/portal",
    "/payments",
    "/payment-methods",
    "/subscription",
    "/subscriptions",
    "/checkout",
    "/checkout/session",
    "/stripe/webhook",
    "/invoices",
]


def _password() -> str:
    return secrets.token_hex(6) + "Aa1"


def _email() -> str:
    return f"user-{uuid.uuid4().hex}@example.com"


def test_ac038_openapi_document_names_no_billing_or_payment_path(client: TestClient) -> None:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()

    paths = spec.get("paths", {})
    assert paths, "the served API must expose at least one path"

    offending: list[str] = []
    for path, operations in paths.items():
        haystacks = [path]
        if isinstance(operations, dict):
            for operation in operations.values():
                if not isinstance(operation, dict):
                    continue
                haystacks.append(str(operation.get("operationId", "")))
                haystacks.extend(str(tag) for tag in operation.get("tags", []))
        blob = " ".join(haystacks).lower()
        if any(term in blob for term in _PAYMENT_TERMS):
            offending.append(path)

    assert offending == [], f"found billing/payment-looking path(s): {offending}"


def test_ac038_no_candidate_billing_or_payment_route_is_served(client: TestClient) -> None:
    for path in _CANDIDATE_PAYMENT_PATHS:
        get_response = client.get(path)
        post_response = client.post(path, json={})
        assert get_response.status_code in (404, 405), (
            f"GET {path} unexpectedly routed ({get_response.status_code})"
        )
        assert post_response.status_code in (404, 405), (
            f"POST {path} unexpectedly routed ({post_response.status_code})"
        )


def test_ac038_register_succeeds_with_only_email_and_password_no_payment_field_required(
    client: TestClient,
) -> None:
    """Registering never needs a card, a plan or any other payment detail: the two
    fields the approved api_spec names are sufficient on their own."""
    email = _email()
    password = _password()

    response = client.post("/auth/register", json={"email": email, "password": password})

    assert response.status_code == 201
    body = response.json()
    assert set(body.keys()).isdisjoint({"card", "card_number", "plan", "billing", "subscription"})


def test_ac038_register_ignores_a_stray_payment_field_rather_than_demanding_one(
    client: TestClient,
) -> None:
    """Sending an extra payment-shaped field (as a confused or hostile client might)
    changes nothing: the account is created from email and password alone, and
    nothing about billing comes back."""
    email = _email()
    password = _password()

    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "card_number": "4242 4242 4242 4242",
            "plan": "pro",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == email
    assert "card_number" not in body
    assert "plan" not in body
