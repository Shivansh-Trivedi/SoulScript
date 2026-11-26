"""Persist emotion predictions and model provenance."""

from alembic import op
import sqlalchemy as sa

revision = "0003_emotion_predictions"
down_revision = "0002_journal_entries"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "emotion_predictions",
        sa.Column("id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("entry_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("model_name", sa.String(length=180), nullable=False),
        sa.Column("model_version", sa.String(length=120), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("content_version", sa.Integer(), nullable=False),
        sa.Column("top_label", sa.String(length=48), nullable=False),
        sa.Column("scores", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["entry_id"], ["journal_entries.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_emotion_predictions_entry_id", "emotion_predictions", ["entry_id"], unique=False)
    op.create_index("ix_predictions_entry_created_at", "emotion_predictions", ["entry_id", "created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_predictions_entry_created_at", table_name="emotion_predictions")
    op.drop_index("ix_emotion_predictions_entry_id", table_name="emotion_predictions")
    op.drop_table("emotion_predictions")
