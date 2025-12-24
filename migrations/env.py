from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.engine import create_engine
from alembic import context
import os
from dotenv import load_dotenv
from app.db.init_db import Base

from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.user import User
from app.models.medicine import Medicine
from app.models.role import Role



# Load alembic.ini configuration    
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
 
# Get database URL from alembic.ini
DATABASE_URL = config.get_main_option("sqlalchemy.url")
 
# Convert async to sync for Alembic migrations
sync_url = DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
sync_engine = create_engine(sync_url, poolclass=pool.NullPool)
 
# Target metadata (only your models)
target_metadata = Base.metadata
 
def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=sync_url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
 
    with context.begin_transaction():
        context.run_migrations()
 
def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = sync_engine  # Use sync engine for migrations
 
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            include_schemas=True,
            include_object=include_existing_tables,  # Ensure existing tables are not dropped
        )
 
        with context.begin_transaction():
            context.run_migrations()
 
def include_existing_tables(object, name, type_, reflected, compare_to):
    """Ensure existing tables (not in Base.metadata) are not dropped or modified."""
    if type_ == "table":
        return name in target_metadata.tables  # Only migrate tables in your models
    return True
 
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()