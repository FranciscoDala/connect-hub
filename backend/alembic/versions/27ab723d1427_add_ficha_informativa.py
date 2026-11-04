"""add ficha_informativa

Revision ID: 27ab723d1427
Revises: 56b97d22c4d0
Create Date: 2026-11-04 09:50:34.774468

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '27ab723d1427'
down_revision: Union[str, Sequence[str], None] = '56b97d22c4d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('ficha_informativa',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('post_id', sa.UUID(), nullable=False),
    sa.Column('campo', sa.String(length=100), nullable=False),
    sa.Column('valor', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ficha_informativa_post_id'), 'ficha_informativa', ['post_id'], unique=False)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_ficha_informativa_post_id'), table_name='ficha_informativa')
    op.drop_table('ficha_informativa')
