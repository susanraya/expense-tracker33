"""Unit coverage for the shared password-hashing helper added in prep for
the auth tickets (US-001, US-002). Not the registration/sign-in behaviour
itself -- just the primitive those tickets will call.
"""

from app.security import hash_password, verify_password


def test_hash_password_is_not_the_plaintext() -> None:
    password = "correct horse battery staple"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$2")


def test_verify_password_round_trips() -> None:
    password = "correct horse battery staple"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True
    assert verify_password("wrong password", hashed) is False
