"""Add images field to Product model

Revision ID: 0005_add_product_images
Revises: 0004_invoice_paid_flag
Create Date: 2025-01-XX

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0005_add_product_images'
down_revision = '0004_invoice_paid_flag'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar columna images al modelo Product
    op.add_column('product', sa.Column('images', sa.JSON(), nullable=True))


def downgrade():
    # Eliminar columna images del modelo Product
    op.drop_column('product', 'images')
