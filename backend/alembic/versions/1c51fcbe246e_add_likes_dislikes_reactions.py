"""add likes dislikes reactions

Revision ID: 1c51fcbe246e
Revises: 2ac25859eba6
Create Date: 2026-10-26 15:45:28.731382

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1c51fcbe246e'
down_revision: Union[str, Sequence[str], None] = '2ac25859eba6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    cols = [c['name'] for c in inspector.get_columns('posts')]

    if 'likes_count' not in cols:
        op.add_column('posts', sa.Column('likes_count', sa.Integer(), server_default='0', nullable=False))
    if 'dislikes_count' not in cols:
        op.add_column('posts', sa.Column('dislikes_count', sa.Integer(), server_default='0', nullable=False))

    # cria tabela se não existir
    if 'post_reactions' not in inspector.get_table_names():
        op.create_table(
            'post_reactions',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=sa.text('gen_random_uuid()')),
            sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False, index=True),
            sa.Column('client_id', sa.String(length=100), nullable=False),
            sa.Column('type', sa.String(length=20), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        )
        op.create_unique_constraint('uq_post_client_reaction', 'post_reactions', ['post_id', 'client_id'])

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_post_client_reaction', 'post_reactions', type_='unique')
    op.drop_table('post_reactions')
    op.drop_column('posts', 'dislikes_count')
    op.drop_column('posts', 'likes_count')
