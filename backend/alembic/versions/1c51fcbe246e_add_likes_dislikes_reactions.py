"""add likes dislikes reactions

Revision ID: 1c51fcbe246e
Revises: 2ac25859eba6
Create Date: 2026-10-26 15:45:28.731382

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '1c51fcbe246e'
down_revision: Union[str, Sequence[str], None] = '2ac25859eba6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)

    post_cols = [c['name'] for c in insp.get_columns('posts')]
    if 'likes_count' not in post_cols:
        op.add_column('posts', sa.Column('likes_count', sa.Integer(), server_default='0', nullable=False))
    if 'dislikes_count' not in post_cols:
        op.add_column('posts', sa.Column('dislikes_count', sa.Integer(), server_default='0', nullable=False))

    try:
        comment_cols = [c['name'] for c in insp.get_columns('comments')]
        if 'updated_at' not in comment_cols:
            op.add_column('comments', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    except Exception:
        pass

    if 'post_reactions' not in insp.get_table_names():
        op.create_table(
            'post_reactions',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
            sa.Column('post_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False),
            sa.Column('client_id', sa.String(length=100), nullable=False),
            sa.Column('type', sa.String(length=20), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        )
        op.create_index('ix_post_reactions_post_id', 'post_reactions', ['post_id'])
        op.create_unique_constraint('uq_post_client_reaction', 'post_reactions', ['post_id', 'client_id'])

def downgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)
    # safe drops - IF EXISTS
    try:
        if 'post_reactions' in insp.get_table_names():
            op.drop_constraint('uq_post_client_reaction', 'post_reactions', type_='unique')
            op.drop_index('ix_post_reactions_post_id', table_name='post_reactions')
            op.drop_table('post_reactions')
    except Exception:
        pass

    try:
        cols = [c['name'] for c in insp.get_columns('comments')]
        if 'updated_at' in cols:
            op.drop_column('comments', 'updated_at')
    except Exception:
        pass

    try:
        cols = [c['name'] for c in insp.get_columns('posts')]
        if 'dislikes_count' in cols:
            op.drop_column('posts', 'dislikes_count')
        if 'likes_count' in cols:
            op.drop_column('posts', 'likes_count')
    except Exception:
        pass
