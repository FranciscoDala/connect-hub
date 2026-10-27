"""add evento fields to posts

Revision ID: 4e36ec5a5780
Revises: 1c51fcbe246e
Create Date: 2026-10-27 14:43:08.686014
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '4e36ec5a5780'
down_revision: Union[str, Sequence[str], None] = '1c51fcbe246e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('posts', sa.Column('data_inicio', sa.DateTime(timezone=True), nullable=True))
    op.add_column('posts', sa.Column('data_fim', sa.DateTime(timezone=True), nullable=True))
    op.add_column('posts', sa.Column('local_evento', sa.String(length=255), nullable=True))
    op.add_column('posts', sa.Column('cidade', sa.String(length=100), nullable=True))
    op.add_column('posts', sa.Column('endereco', sa.Text(), nullable=True))
    op.add_column('posts', sa.Column('link_mapa', sa.Text(), nullable=True))
    op.add_column('posts', sa.Column('link_inscricao', sa.Text(), nullable=True))
    op.add_column('posts', sa.Column('modalidade', sa.String(length=20), nullable=True, server_default='presencial'))
    op.add_column('posts', sa.Column('capacidade', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('posts', sa.Column('inscritos_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('posts', sa.Column('organizador', sa.String(length=200), nullable=True))
    op.create_index(op.f('ix_posts_data_inicio'), 'posts', ['data_inicio'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_posts_data_inicio'), table_name='posts')
    op.drop_column('posts', 'organizador')
    op.drop_column('posts', 'inscritos_count')
    op.drop_column('posts', 'capacidade')
    op.drop_column('posts', 'modalidade')
    op.drop_column('posts', 'link_inscricao')
    op.drop_column('posts', 'link_mapa')
    op.drop_column('posts', 'endereco')
    op.drop_column('posts', 'cidade')
    op.drop_column('posts', 'local_evento')
    op.drop_column('posts', 'data_fim')
    op.drop_column('posts', 'data_inicio')
