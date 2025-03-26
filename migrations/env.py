import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from alembic import context
from myapp.config import DATABASE_URL  # Ensure this import works
from myapp.models import Base  # Ensure Base is properly imported

# Check if DATABASE_URL is properly set
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Check your config.py or .env file.")

# Convert async DB URL to sync for Alembic
SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")

# Use sync engine for Alembic migrations
connectable = create_engine(SYNC_DATABASE_URL, poolclass=NullPool)

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=SYNC_DATABASE_URL,
        target_metadata=Base.metadata,
        literal_binds=True,
        include_schemas=True,
        compare_type=True
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=Base.metadata,
            include_schemas=True,
            compare_type=True
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
