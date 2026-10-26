"""add produto fields

Revision ID: b6a2aba51852
Revises: 4a91a7bf08fe
Create Date: 2026-10-26 12:26:35.856668

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b6a2aba51852'
down_revision: Union[str, Sequence[str], None] = '4a91a7bf08fe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('preco', sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column('posts', sa.Column('preco_promocional', sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column('posts', sa.Column('estoque', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('posts', sa.Column('sku', sa.String(length=50), nullable=True))
    op.add_column('posts', sa.Column('unidade', sa.String(length=10), nullable=False, server_default='un'))
    op.add_column('posts', sa.Column('em_promocao', sa.Boolean(), nullable=False, server_default='false'))
    op.create_index(op.f('ix_posts_sku'), 'posts', ['sku'], unique=False)

    # remove o server_default depois se quiser deixar só no model, opcional
    op.alter_column('posts', 'estoque', server_default=None)
    op.alter_column('posts', 'unidade', server_default=None)
    op.alter_column('posts', 'em_promocao', server_default=None)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_posts_sku'), table_name='posts')
    op.drop_column('posts', 'em_promocao')
    op.drop_column('posts', 'unidade')
    op.drop_column('posts', 'sku')
    op.drop_column('posts', 'estoque')
    op.drop_column('posts', 'preco_promocional')
    op.drop_column('posts', 'preco')
