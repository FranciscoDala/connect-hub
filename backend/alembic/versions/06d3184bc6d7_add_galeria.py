"""add galeria

Revision ID: 06d3184bc6d7
Revises: 27ab723d1427
Create Date: 2026-11-04 11:44:17.289157

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '06d3184bc6d7'
down_revision: Union[str, Sequence[str], None] = '27ab723d1427'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Só adiciona a galeria, sem mexer nas outras tabelas
    op.add_column('posts', sa.Column('galeria', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

def downgrade() -> None:
    op.drop_column('posts', 'galeria')
