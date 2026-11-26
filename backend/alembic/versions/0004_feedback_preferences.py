"""Add per-entry emotion feedback and per-user appearance preferences."""

from alembic import op
import sqlalchemy as sa


revision = "0004_feedback_preferences"
down_revision = "0003_emotion_predictions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "emotion_feedback",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("entry_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("reported_emotion", sa.String(length=48), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["entry_id"], ["journal_entries.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("entry_id", name="uq_emotion_feedback_entry_id"),
    )
    op.create_table(
        "user_preferences",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("theme_mode", sa.String(length=16), nullable=False, server_default="default"),
        sa.Column("selected_theme", sa.String(length=24), nullable=False, server_default="lavender"),
        sa.Column("timezone", sa.String(length=64), nullable=False, server_default="UTC"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_user_preferences_user_id"),
    )


def downgrade() -> None:
    op.drop_table("user_preferences")
    op.drop_table("emotion_feedback")
