"""Unit coverage for the register request's field-level validation (AC-003)."""

import pytest
from pydantic import ValidationError

from app.schemas import RegisterRequest


def test_ac003_rejects_invalid_email() -> None:
    with pytest.raises(ValidationError) as exc_info:
        RegisterRequest(email="not-an-email", password="Valid1234word")

    errors = exc_info.value.errors()
    assert any(error["loc"] == ("email",) for error in errors)


def test_ac003_rejects_password_too_short() -> None:
    with pytest.raises(ValidationError) as exc_info:
        RegisterRequest(email="person@example.com", password="Ab1")

    errors = exc_info.value.errors()
    assert any(error["loc"] == ("password",) for error in errors)


def test_ac003_rejects_password_without_a_digit() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(email="person@example.com", password="noDigitsHere")


def test_ac003_rejects_password_without_a_letter() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(email="person@example.com", password="1234567890")


def test_ac001_accepts_a_valid_email_and_password() -> None:
    request = RegisterRequest(email="Person@Example.com", password="Valid1234word")

    assert request.email == "person@example.com"  # normalized for case-insensitive lookup
    assert request.password == "Valid1234word"
