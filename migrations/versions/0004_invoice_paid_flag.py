"""Add paid flag to invoices

Revision ID: 0004_invoice_paid_flag
Revises: 0003_products_inventory
Create Date: 2025-08-09 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004_invoice_paid_flag'
down_revision = '0003_products_inventory'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('invoice', schema=None) as batch_op:
        batch_op.add_column(sa.Column('paid', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.create_index('ix_invoice_paid', ['paid'], unique=False)

    # Marcar facturas existentes como pagadas para mantener métricas históricas
    op.execute("UPDATE invoice SET paid = 1 WHERE type = 'factura'")

    # Quitar server_default para nuevas inserciones controladas por la aplicación
    with op.batch_alter_table('invoice', schema=None) as batch_op:
        batch_op.alter_column('paid', server_default=None)


def downgrade() -> None:
    with op.batch_alter_table('invoice', schema=None) as batch_op:
        batch_op.drop_index('ix_invoice_paid')
        batch_op.drop_column('paid')
