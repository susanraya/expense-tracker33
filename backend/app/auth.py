"""Shared session handling: token issuance, lookup and the `get_current_user`
dependency every protected router (this ticket's and later ones) depends on.

Sessions are opaque server-side tokens (AC-004): the raw token is returned to
the client once, in the login response body, and never stored. Only its
SHA-256 hash lives in `sessions.token_hash`, so a leaked database row cannot
be replayed as a bearer token.
"""

import hashlib
import os
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserSession

# AC-007/NFR-004: a session idle longer than this is treated as expired.
SESSION_IDLE_TIMEOUT_MINUTES = int(os.getenv("SESSION_IDLE_TIMEOUT_MINUTES", "30"))

_bearer_scheme = HTTPBearer(auto_error=False)


def _session_expired() -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")


def hash_token(token: str) -> str:
    """The value stored in `sessions.token_hash`; never the raw token itself."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _normalize(value: datetime) -> datetime:
    """`DateTime(timezone=True)` round-trips as naive UTC on SQLite; treat a
    naive value as UTC so comparisons against an aware `now` never raise."""
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def is_expired(now: datetime, expires_at: datetime) -> bool:
    """Whether a session whose idle deadline is `expires_at` is expired at `now`."""
    return now > _normalize(expires_at)


def issue_session(db: Session, user: User) -> tuple[str, UserSession]:
    """A new opaque token for `user`, and the session row it is stored as."""
    token = secrets.token_urlsafe(32)
    now = datetime.now(UTC)
    session = UserSession(
        user_id=user.id,
        token_hash=hash_token(token),
        created_at=now,
        last_active_at=now,
        expires_at=now + timedelta(minutes=SESSION_IDLE_TIMEOUT_MINUTES),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return token, session


def revoke_session(db: Session, session: UserSession) -> None:
    """AC-006: logout ends this one session immediately."""
    session.revoked_at = datetime.now(UTC)
    db.commit()


def revoke_all_sessions(db: Session, user_id: object) -> None:
    """AC-010/NFR-004: deactivation ends every session the user has."""
    now = datetime.now(UTC)
    sessions = (
        db.execute(
            select(UserSession).where(
                UserSession.user_id == user_id, UserSession.revoked_at.is_(None)
            )
        )
        .scalars()
        .all()
    )
    for session in sessions:
        session.revoked_at = now
    db.commit()


def get_current_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> UserSession:
    """AC-007: resolves the bearer token, rejecting missing/unknown/revoked/idle
    sessions with 401, and refreshes `last_active_at` on every valid request."""
    if credentials is None or not credentials.credentials:
        raise _session_expired()
    session = db.execute(
        select(UserSession).where(UserSession.token_hash == hash_token(credentials.credentials))
    ).scalar_one_or_none()
    if session is None or session.revoked_at is not None:
        raise _session_expired()
    now = datetime.now(UTC)
    if is_expired(now, session.expires_at):
        raise _session_expired()
    user = session.user
    if user is None or not user.is_active:
        raise _session_expired()
    session.last_active_at = now
    session.expires_at = now + timedelta(minutes=SESSION_IDLE_TIMEOUT_MINUTES)
    db.commit()
    db.refresh(session)
    return session


def get_current_user(session: UserSession = Depends(get_current_session)) -> User:
    """The shared dependency other routers (categories, expenses, ...) use."""
    return session.user
