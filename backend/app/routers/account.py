"""POST /account/deactivate."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, revoke_all_sessions
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/account", tags=["account"])


@router.post("/deactivate", status_code=status.HTTP_204_NO_CONTENT)
def deactivate(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    """AC-010/NFR-004: marks the account inactive and revokes every session
    it has; a later sign-in attempt then fails with the generic 401."""
    user.is_active = False
    db.commit()
    revoke_all_sessions(db, user.id)
