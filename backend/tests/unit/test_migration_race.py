"""Covers the startup migration race fixed this sprint: when a concurrently
started process wins the race and creates the schema first, our own
`command.upgrade` fails with "already exists" even though the database now
matches head -- `_run_migrations` must stamp instead of crashing the app
that lost the race.
"""

from unittest.mock import patch

import pytest
from sqlalchemy.exc import OperationalError

from app import main as app_main


def test_ac_migration_race_already_exists_falls_back_to_stamp() -> None:
    """A "table already exists" OperationalError from `command.upgrade` is
    swallowed, and `command.stamp(config, "head")` is called instead of the
    exception propagating and crashing application startup."""
    error = OperationalError(
        "CREATE TABLE users (...)",
        {},
        Exception("table users already exists"),
    )

    with (
        patch.object(app_main, "inspect") as mock_inspect,
        patch.object(app_main.command, "upgrade", side_effect=error) as mock_upgrade,
        patch.object(app_main.command, "stamp") as mock_stamp,
    ):
        mock_inspect.return_value.get_table_names.return_value = []

        app_main._run_migrations()

        mock_upgrade.assert_called_once()
        mock_stamp.assert_called_once()
        assert mock_stamp.call_args[0][1] == "head"


def test_ac_migration_race_other_operational_error_still_raises() -> None:
    """An OperationalError unrelated to a table race (anything that does not
    say "already exists") is not silently swallowed."""
    error = OperationalError(
        "SELECT 1",
        {},
        Exception("connection refused"),
    )

    with (
        patch.object(app_main, "inspect") as mock_inspect,
        patch.object(app_main.command, "upgrade", side_effect=error),
        patch.object(app_main.command, "stamp") as mock_stamp,
        pytest.raises(OperationalError),
    ):
        mock_inspect.return_value.get_table_names.return_value = []
        app_main._run_migrations()

    mock_stamp.assert_not_called()
