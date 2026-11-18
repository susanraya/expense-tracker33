"""Unit coverage for the session idle-expiry maths (AC-007, NFR-004)."""

from datetime import UTC, datetime, timedelta

from app.auth import SESSION_IDLE_TIMEOUT_MINUTES, is_expired


def test_ac007_default_idle_timeout_is_30_minutes() -> None:
    # Unset in the test environment (per the packet), so the documented default applies.
    assert SESSION_IDLE_TIMEOUT_MINUTES == 30


def test_ac007_session_within_idle_window_is_not_expired() -> None:
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=5)

    assert is_expired(now, expires_at) is False


def test_ac007_session_past_idle_window_is_expired() -> None:
    now = datetime.now(UTC)
    expires_at = now - timedelta(seconds=1)

    assert is_expired(now, expires_at) is True


def test_ac007_naive_expires_at_is_treated_as_utc() -> None:
    now = datetime.now(UTC)
    naive_future = (now + timedelta(minutes=1)).replace(tzinfo=None)
    naive_past = (now - timedelta(minutes=1)).replace(tzinfo=None)

    assert is_expired(now, naive_future) is False
    assert is_expired(now, naive_past) is True
