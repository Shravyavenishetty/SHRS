from alembic import op
import sqlalchemy as sa

# Revision identifiers, used by Alembic.
revision = '<revision_id>'
down_revision = '<previous_revision>'
branch_labels = None
depends_on = None

def upgrade():
    # Add the date_registered column to the patients table
    op.add_column('patients', sa.Column('date_registered', sa.DateTime(), nullable=True))

def downgrade():
    # Remove the date_registered column from the patients table
    op.drop_column('patients', 'date_registered')
