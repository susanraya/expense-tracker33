"""POST /auth/register, /auth/login, /auth/logout and GET /auth/me."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import get_current_session, issue_session, revoke_session
from app.database import get_db
from app.models import User, UserSession
from app.schemas import LoginRequest, LoginResponse, LoginUser, RegisterRequest, UserOut
from app.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

_GENERIC_LOGIN_DETAIL = "Invalid email or password"


def _user_out(user: User) -> UserOut:
    return UserOut(id=str(user.id), email=user.email, role=user.role, created_at=user.created_at)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserOut:
    """AC-001/AC-002: creates the user or 409s on a duplicate email; the
    password is stored only as a passlib hash (NFR-003)."""
    existing = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists",
        )
    user = User(email=payload.email, password_hash=hash_password(payload.password), role="user")
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists",
        ) from None
    db.refresh(user)
    return _user_out(user)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """AC-004/AC-005/NFR-002: identical generic 401 for an unknown email, a
    wrong password, or a deactivated account -- nothing reveals which."""
    user = db.execute(
        select(User).where(User.email == payload.email.strip().lower())
    ).scalar_one_or_none()
    if (
        user is None
        or not user.is_active
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_GENERIC_LOGIN_DETAIL)
    token, session = issue_session(db, user)
    return LoginResponse(
        token=token,
        expires_at=session.expires_at,
        user=LoginUser(id=str(user.id), email=user.email, role=user.role),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    session: UserSession = Depends(get_current_session), db: Session = Depends(get_db)
) -> None:
    """AC-006: revokes this session; the same token is rejected afterwards."""
    revoke_session(db, session)


@router.get("/me", response_model=UserOut)
def me(session: UserSession = Depends(get_current_session)) -> UserOut:
    return _user_out(session.user)
