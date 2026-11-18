"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented.
"""

import re
from datetime import datetime

from pydantic import BaseModel, field_validator

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email(value: str) -> str:
    value = value.strip()
    if not _EMAIL_RE.match(value):
        raise ValueError("enter a valid email address")
    return value.lower()


def _validate_password(value: str) -> str:
    if len(value) < 10:
        raise ValueError("password must be at least 10 characters long")
    if not re.search(r"[A-Za-z]", value):
        raise ValueError("password must contain at least one letter")
    if not re.search(r"\d", value):
        raise ValueError("password must contain at least one digit")
    return value


class RegisterRequest(BaseModel):
    """POST /auth/register body: AC-001/AC-003 validate email and password rules."""

    email: str
    password: str

    @field_validator("email")
    @classmethod
    def _check_email(cls, value: str) -> str:
        return _validate_email(value)

    @field_validator("password")
    @classmethod
    def _check_password(cls, value: str) -> str:
        return _validate_password(value)


class LoginRequest(BaseModel):
    """POST /auth/login body. No format validation: a malformed email is simply
    an unknown account, so it must fail with the same generic 401 as any other."""

    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime


class LoginUser(BaseModel):
    id: str
    email: str
    role: str


class LoginResponse(BaseModel):
    token: str
    expires_at: datetime
    user: LoginUser


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."
