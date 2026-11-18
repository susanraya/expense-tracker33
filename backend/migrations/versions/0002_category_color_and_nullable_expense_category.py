"""Add categories.color; make expenses.category_id nullable with ON DELETE SET NULL.

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-18
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("categories", sa.Column("color", sa.String(length=20), nullable=True))

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.drop_constraint("expenses_category_id_fkey", "expenses", type_="foreignkey")
        op.alter_column("expenses", "category_id", nullable=True)
        op.create_foreign_key(
            "expenses_category_id_fkey",
            "expenses",
            "categories",
            ["category_id"],
            ["id"],
            ondelete="SET NULL",
        )
    else:
        with op.batch_alter_table("expenses") as batch_op:
            batch_op.alter_column("category_id", nullable=True)


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.drop_constraint("expenses_category_id_fkey", "expenses", type_="foreignkey")
        op.alter_column("expenses", "category_id", nullable=False)
        op.create_foreign_key(
            "expenses_category_id_fkey",
            "expenses",
            "categories",
            ["category_id"],
            ["id"],
            ondelete="RESTRICT",
        )
    else:
        with op.batch_alter_table("expenses") as batch_op:
            batch_op.alter_column("category_id", nullable=False)

    op.drop_column("categories", "color")
