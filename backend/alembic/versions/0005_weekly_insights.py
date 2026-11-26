"""Persist deterministic weekly reflections and their source fingerprints."""

from alembic import op
import sqlalchemy as sa


revision = "0005_weekly_insights"
down_revision = "0004_feedback_preferences"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "weekly_insights",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("week_start", sa.Date(), nullable=False),
        sa.Column("week_end", sa.Date(), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("statistics", sa.JSON(), nullable=False),
        sa.Column("reflection_prompts", sa.JSON(), nullable=False),
        sa.Column("source_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("source_entry_ids", sa.JSON(), nullable=False),
        sa.Column("entry_count", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "week_start", name="uq_weekly_insights_user_week"),
    )


def downgrade() -> None:
    op.drop_table("weekly_insights")
