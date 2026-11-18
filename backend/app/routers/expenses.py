"""GET/POST /expenses, PATCH/DELETE /expenses/{id} (US-020-2).

Every query is filtered by the authenticated user's id in the query itself
(AC-008, NFR-001): another user's expense or category is indistinguishable
from a missing one, so a mismatch is a 404, never a 403.
"""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Category, Expense, User
from app.schemas import ExpenseCreate, ExpenseListOut, ExpenseOut, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["expenses"])

_NOT_FOUND_DETAIL = "Expense not found"
_CATEGORY_NOT_FOUND_DETAIL = "Category not found"


def _expense_out(expense: Expense) -> ExpenseOut:
    category = expense.category
    return ExpenseOut(
        id=str(expense.id),
        amount=expense.amount,
        date=expense.spent_on,
        description=expense.note or "",
        category_id=str(expense.category_id) if expense.category_id else None,
        category_name=category.name if category is not None else None,
        created_at=expense.created_at,
    )


def _get_owned_expense(db: Session, user: User, expense_id: str) -> Expense:
    try:
        parsed_id = uuid.UUID(expense_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND_DETAIL
        ) from None
    expense = db.execute(
        select(Expense).where(Expense.id == parsed_id, Expense.user_id == user.id)
    ).scalar_one_or_none()
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND_DETAIL)
    return expense


def _get_owned_category(db: Session, user: User, category_id: str) -> Category:
    try:
        parsed_id = uuid.UUID(category_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=_CATEGORY_NOT_FOUND_DETAIL
        ) from None
    category = db.execute(
        select(Category).where(Category.id == parsed_id, Category.user_id == user.id)
    ).scalar_one_or_none()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=_CATEGORY_NOT_FOUND_DETAIL
        )
    return category


@router.get("", response_model=ExpenseListOut)
def list_expenses(
    start: date | None = None,
    end: date | None = None,
    category_id: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseListOut:
    """AC-036/AC-008: only this user's expenses, newest first, optionally
    filtered by date range and category; start after end is a clear 422."""
    if start is not None and end is not None and start > end:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start date must not be after end date",
        )

    filters = [Expense.user_id == user.id]
    if start is not None:
        filters.append(Expense.spent_on >= start)
    if end is not None:
        filters.append(Expense.spent_on <= end)
    if category_id is not None:
        try:
            parsed_category_id = uuid.UUID(category_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="category_id must be a valid id",
            ) from None
        filters.append(Expense.category_id == parsed_category_id)

    total = db.execute(select(func.count()).select_from(Expense).where(*filters)).scalar_one()
    expenses = (
        db.execute(
            select(Expense)
            .where(*filters)
            .order_by(Expense.spent_on.desc(), Expense.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        .scalars()
        .all()
    )
    return ExpenseListOut(items=[_expense_out(expense) for expense in expenses], total=total)


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ExpenseOut:
    """AC-011/AC-036/NFR-001: category_id is required; an unknown or
    other-user category_id is a 404 and creates nothing."""
    category = _get_owned_category(db, user, payload.category_id)

    expense = Expense(
        user_id=user.id,
        category_id=category.id,
        amount=payload.amount,
        spent_on=payload.date,
        note=payload.description,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return _expense_out(expense)


@router.patch("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: str,
    payload: ExpenseUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseOut:
    """AC-008/NFR-001: updates only the caller's expense; another user's id
    is a 404 and changes nothing. An unknown or unowned category_id is a
    404 raised before any field is mutated, so a bad request changes nothing."""
    expense = _get_owned_expense(db, user, expense_id)
    fields_set = payload.model_fields_set

    if "category_id" in fields_set and payload.category_id is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=[{"loc": ["body", "category_id"], "msg": "category_id may not be null"}],
        )

    new_category_id = expense.category_id
    if "category_id" in fields_set:
        category = _get_owned_category(db, user, payload.category_id)
        new_category_id = category.id

    if "amount" in fields_set and payload.amount is not None:
        expense.amount = payload.amount
    if "date" in fields_set and payload.date is not None:
        expense.spent_on = payload.date
    if "description" in fields_set and payload.description is not None:
        expense.note = payload.description
    expense.category_id = new_category_id

    db.commit()
    db.refresh(expense)
    return _expense_out(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    """AC-008: deletes only the caller's expense; another user's id is 404."""
    expense = _get_owned_expense(db, user, expense_id)
    db.delete(expense)
    db.commit()
