"""phase3 schema: add columns and constraints

Revision ID: 0002_phase3_schema
Revises: 0001_baseline
Create Date: 2025-09-01

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_phase3_schema'
down_revision = '0001_baseline'
branch_labels = None
depends_on = None


def _has_column(inspector, table: str, column: str) -> bool:
    try:
        cols = [c['name'] for c in inspector.get_columns(table)]
        return column in cols
    except Exception:
        return False


def _has_table(inspector, table: str) -> bool:
    try:
        return table in inspector.get_table_names()
    except Exception:
        return False


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # 1) client.created_at
    if _has_table(inspector, 'client') and not _has_column(inspector, 'client', 'created_at'):
        op.add_column('client', sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')))
        # keep nullable True to avoid backfilling issues; application sets default on create

    # 2) invoice.payment_method
    if _has_table(inspector, 'invoice') and not _has_column(inspector, 'invoice', 'payment_method'):
        op.add_column('invoice', sa.Column('payment_method', sa.String(length=32), nullable=True))

    # 3) company_config.city / province
    if _has_table(inspector, 'company_config'):
        if not _has_column(inspector, 'company_config', 'city'):
            op.add_column('company_config', sa.Column('city', sa.String(length=128), nullable=True))
        if not _has_column(inspector, 'company_config', 'province'):
            op.add_column('company_config', sa.Column('province', sa.String(length=128), nullable=True))

    # 4) document_sequence: ensure year/month columns and unique(doc_type, year, month)
    if _has_table(inspector, 'document_sequence'):
        add_year = not _has_column(inspector, 'document_sequence', 'year')
        add_month = not _has_column(inspector, 'document_sequence', 'month')
        if add_year:
            op.add_column('document_sequence', sa.Column('year', sa.Integer(), nullable=False, server_default='0'))
        if add_month:
            op.add_column('document_sequence', sa.Column('month', sa.Integer(), nullable=False, server_default='0'))
        # Unique constraint (or unique index in SQLite)
        try:
            op.create_unique_constraint('uq_docseq_type_year_month', 'document_sequence', ['doc_type', 'year', 'month'])
        except Exception:
            # If constraint exists or SQLite fallback, ignore
            pass


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Safe downgrades: drop columns only if exist
    if _has_table(inspector, 'document_sequence'):
        # Drop unique constraint best-effort
        try:
            op.drop_constraint('uq_docseq_type_year_month', 'document_sequence', type_='unique')
        except Exception:
            pass
        # Do not drop year/month columns to avoid data loss in downgrade

    if _has_table(inspector, 'company_config'):
        if _has_column(inspector, 'company_config', 'province'):
            try:
                op.drop_column('company_config', 'province')
            except Exception:
                pass
        if _has_column(inspector, 'company_config', 'city'):
            try:
                op.drop_column('company_config', 'city')
            except Exception:
                pass

    if _has_table(inspector, 'invoice') and _has_column(inspector, 'invoice', 'payment_method'):
        try:
            op.drop_column('invoice', 'payment_method')
        except Exception:
            pass

    if _has_table(inspector, 'client') and _has_column(inspector, 'client', 'created_at'):
        try:
            op.drop_column('client', 'created_at')
        except Exception:
            pass

