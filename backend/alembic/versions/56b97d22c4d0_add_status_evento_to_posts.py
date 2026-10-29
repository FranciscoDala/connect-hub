"""add status_evento to posts

Revision ID: 56b97d22c4d0
Revises: 4e36ec5a5780
Create Date: 2026-10-29 15:57:09.917906

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '56b97d22c4d0'
down_revision: Union[str, Sequence[str], None] = '4e36ec5a5780'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('status_evento', sa.String(length=30), nullable=True, server_default='ativo'))
    # garante que os antigos fiquem como ativo
    op.execute("UPDATE posts SET status_evento = 'ativo' WHERE status_evento IS NULL")

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('posts', 'status_evento')
