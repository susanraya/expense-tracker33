"""GET/POST /categories, PATCH/DELETE /categories/{id} (US-020-1).

Every query is filtered by the authenticated user's id in the query itself
(AC-008, NFR-001): another user's category is indistinguishable from a
missing one, so a mismatch is a 404, never a 403.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Category, User
from app.schemas import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])

_DUPLICATE_DETAIL = "A category with that name already exists"
_NOT_FOUND_DETAIL = "Category not found"


def _category_out(category: Category) -> CategoryOut:
    return CategoryOut(
        id=str(category.id),
        name=category.name,
        color=category.color,
        created_at=category.created_at,
    )


def _get_owned_category(db: Session, user: User, category_id: str) -> Category:
    try:
        parsed_id = uuid.UUID(category_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND_DETAIL
        ) from None
    category = db.execute(
        select(Category).where(Category.id == parsed_id, Category.user_id == user.id)
    ).scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND_DETAIL)
    return category


@router.get("", response_model=list[CategoryOut])
def list_categories(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[CategoryOut]:
    """AC-036/AC-008/NFR-001: only this user's categories, ordered by name."""
    categories = (
        db.execute(select(Category).where(Category.user_id == user.id).order_by(Category.name))
        .scalars()
        .all()
    )
    return [_category_out(category) for category in categories]


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> CategoryOut:
    """AC-036: owned by the caller; a duplicate name for this user is a 409,
    but the same name for a different user succeeds."""
    category = Category(user_id=user.id, name=payload.name, color=payload.color)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=_DUPLICATE_DETAIL
        ) from None
    db.refresh(category)
    return _category_out(category)


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CategoryOut:
    """AC-008/NFR-001: updates only a category owned by the caller; another
    user's id returns 404 and changes nothing."""
    category = _get_owned_category(db, user, category_id)
    if payload.name is not None:
        category.name = payload.name
    if "color" in payload.model_fields_set:
        category.color = payload.color
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=_DUPLICATE_DETAIL
        ) from None
    db.refresh(category)
    return _category_out(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> None:
    """AC-008: deletes only the caller's category; another user's id is 404."""
    category = _get_owned_category(db, user, category_id)
    db.delete(category)
    db.commit()
