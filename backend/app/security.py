"""Password hashing, shared by every ticket and startup job that touches one.

The approved architecture names passlib for exactly this (US-001 register,
US-002 sign-in). This module only turns a password a caller already decided
to accept into a hash safe to store, and checks one back -- it does not decide
what makes a password valid or issue any session; that belongs to the
registration and sign-in tickets.
"""

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """A bcrypt hash of `password`, safe to store in `users.password_hash`."""
    return _pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Whether `password` is the one `password_hash` was made from."""
    return _pwd_context.verify(password, password_hash)
