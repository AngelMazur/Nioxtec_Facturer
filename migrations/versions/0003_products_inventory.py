"""products and stock movements, link invoice_item.product_id

Revision ID: 0003_products_inventory
Revises: 0002_phase3_schema
Create Date: 2025-09-02

"""
from alembic import op
import sqlalchemy as sa

revision = '0003_products_inventory'
down_revision = '0002_phase3_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'product',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('category', sa.String(length=64), nullable=False),
        sa.Column('model', sa.String(length=128), nullable=False),
        sa.Column('sku', sa.String(length=64), nullable=True, unique=True),
        sa.Column('stock_qty', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('price_net', sa.Float(), nullable=False, server_default='0'),
        sa.Column('tax_rate', sa.Float(), nullable=False, server_default='21'),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    # índices explícitos
    op.create_index('ix_product_category', 'product', ['category'])
    op.create_index('ix_product_model', 'product', ['model'])
    # stock movement
    op.create_table(
        'stock_movement',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('product.id'), nullable=False),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=16), nullable=False),
        sa.Column('invoice_id', sa.Integer(), sa.ForeignKey('invoice.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_stock_movement_product_id', 'stock_movement', ['product_id'])
    op.create_index('ix_stock_movement_invoice_id', 'stock_movement', ['invoice_id'])
    # link from invoice_item
    try:
        op.add_column('invoice_item', sa.Column('product_id', sa.Integer(), sa.ForeignKey('product.id'), nullable=True))
        op.create_index('ix_invoice_item_product_id', 'invoice_item', ['product_id'])
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_index('ix_stock_movement_invoice_id', table_name='stock_movement')
    except Exception:
        pass
    try:
        op.drop_index('ix_stock_movement_product_id', table_name='stock_movement')
    except Exception:
        pass
    try:
        op.drop_index('ix_invoice_item_product_id', table_name='invoice_item')
    except Exception:
        pass
    try:
        op.drop_column('invoice_item', 'product_id')
    except Exception:
        pass
    try:
        op.drop_index('ix_product_model', table_name='product')
    except Exception:
        pass
    try:
        op.drop_index('ix_product_category', table_name='product')
    except Exception:
        pass
    op.drop_table('stock_movement')
    op.drop_table('product')

