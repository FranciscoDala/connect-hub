"""add link_url e campos produto

Revision ID: 5cacb7d6917f
Revises: b6a2aba51852
Create Date: 2026-10-26 14:00:10.936363
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '5cacb7d6917f'
down_revision: Union[str, Sequence[str], None] = 'b6a2aba51852'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # IF NOT EXISTS pra não quebrar de novo
    op.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_url TEXT")

def downgrade() -> None:
    op.execute("ALTER TABLE posts DROP COLUMN IF EXISTS link_url")
