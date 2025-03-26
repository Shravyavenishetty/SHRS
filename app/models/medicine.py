from sqlalchemy import Column, Integer, String, Text, Float
from app.db.base import Base

class Medicine(Base):
    """Medicine model representing details of available medicines."""
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    manufacturer = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    expiry_date = Column(String, nullable=False)
