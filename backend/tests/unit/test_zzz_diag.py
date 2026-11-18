"""Unit coverage for the SQLAlchemy models added in prep for the data-model
tickets (categories, expenses). Confirms the schema the models declare is
internally consistent -- the foreign keys, the per-user category-name
uniqueness, and the numeric precision on amount -- not any route's behaviour.
"""

from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import Category, Expense, User


def _make_user(db_session, email: str = "diag@example.com") -> User:
    user = User(email=email, password_hash="not-a-real-hash")
    db_session.add(user)
    db_session.commit()
    return user


def test_category_is_scoped_to_its_user(db_session) -> None:
    user = _make_user(db_session)
    category = Category(user_id=user.id, name="Groceries")
    db_session.add(category)
    db_session.commit()

    assert category.id is not None
    assert category.user_id == user.id


def test_category_name_is_unique_per_user(db_session) -> None:
    user = _make_user(db_session)
    db_session.add(Category(user_id=user.id, name="Groceries"))
    db_session.commit()

    db_session.add(Category(user_id=user.id, name="Groceries"))
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_expense_links_user_and_category_with_exact_amount(db_session) -> None:
    user = _make_user(db_session)
    category = Category(user_id=user.id, name="Transport")
    db_session.add(category)
    db_session.commit()

    expense = Expense(
        user_id=user.id,
        category_id=category.id,
        amount="12.34",
        spent_on=date(2026, 1, 15),
        note="Bus fare",
    )
    db_session.add(expense)
    db_session.commit()

    assert expense.id is not None
    assert str(expense.amount) == "12.34"
    assert expense.category_id == category.id
