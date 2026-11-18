"""Pydantic request and response models: one pair per entity in the approved
data model."""

import re
from datetime import date as _date
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, field_serializer, field_validator

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


def _validate_category_name(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("name must not be empty")
    if len(value) > 100:
        raise ValueError("name must be at most 100 characters long")
    return value


class CategoryOut(BaseModel):
    id: str
    name: str
    color: str | None = None
    created_at: datetime


class CategoryCreate(BaseModel):
    """POST /categories body (AC-036)."""

    name: str
    color: str | None = None

    @field_validator("name")
    @classmethod
    def _check_name(cls, value: str) -> str:
        return _validate_category_name(value)


class CategoryUpdate(BaseModel):
    """PATCH /categories/{id} body: both fields optional."""

    name: str | None = None
    color: str | None = None

    @field_validator("name")
    @classmethod
    def _check_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return _validate_category_name(value)


def _validate_amount(value: Decimal) -> Decimal:
    if value <= 0:
        raise ValueError("amount must be greater than 0")
    return value


class ExpenseOut(BaseModel):
    id: str
    amount: Decimal
    date: _date
    description: str
    category_id: str | None = None
    category_name: str | None = None
    created_at: datetime

    @field_serializer("amount")
    def _serialize_amount(self, value: Decimal) -> float:
        """Serialised as a plain number; storage keeps the exact Decimal."""
        return float(value)


class ExpenseCreate(BaseModel):
    """POST /expenses body. AC-011: category_id is required and may not be null."""

    amount: Decimal
    date: _date
    description: str = ""
    category_id: str

    @field_validator("amount")
    @classmethod
    def _check_amount(cls, value: Decimal) -> Decimal:
        return _validate_amount(value)

    @field_validator("category_id")
    @classmethod
    def _check_category_id(cls, value: str | None) -> str:
        if not value:
            raise ValueError("category_id is required")
        return value


class ExpenseUpdate(BaseModel):
    """PATCH /expenses/{id} body: every field optional."""

    amount: Decimal | None = None
    date: _date | None = None
    description: str | None = None
    category_id: str | None = None

    @field_validator("amount")
    @classmethod
    def _check_amount(cls, value: Decimal | None) -> Decimal | None:
        if value is None:
            return value
        return _validate_amount(value)


class ExpenseListOut(BaseModel):
    items: list[ExpenseOut]
    total: int
