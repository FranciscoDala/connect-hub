"""add status_plataforma em_utilizacao

Revision ID: 2ac25859eba6
Revises: 5cacb7d6917f
Create Date: 2026-10-26 15:02:47.306006

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2ac25859eba6'
down_revision: Union[str, Sequence[str], None] = '5cacb7d6917f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    cols = [c['name'] for c in inspector.get_columns('posts')]

    if 'status_plataforma' not in cols:
        op.add_column('posts', sa.Column('status_plataforma', sa.String(length=30), server_default='em_desenvolvimento', nullable=False))

    if 'em_utilizacao' not in cols:
        op.add_column('posts', sa.Column('em_utilizacao', sa.Boolean(), server_default=sa.text('false'), nullable=False))

    # garante dados limpos caso já existia com NULL
    op.execute("UPDATE posts SET status_plataforma = 'em_desenvolvimento' WHERE status_plataforma IS NULL")
    op.execute("UPDATE posts SET em_utilizacao = false WHERE em_utilizacao IS NULL")

def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    cols = [c['name'] for c in inspector.get_columns('posts')]

    if 'em_utilizacao' in cols:
        op.drop_column('posts', 'em_utilizacao')
    if 'status_plataforma' in cols:
        op.drop_column('posts', 'status_plataforma')
