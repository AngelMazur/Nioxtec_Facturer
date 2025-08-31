"""baseline

Revision ID: 0001_baseline
Revises: 
Create Date: 2025-08-31

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_baseline'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Baseline: no schema changes (existing DB structure).
    pass

def downgrade() -> None:
    pass
