from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # NOTE: Store hashed passwords in production!

    jars = relationship("Jar", back_populates="owner", cascade="all, delete-orphan")
    transactions = relationship(
        "Transaction", back_populates="owner", cascade="all, delete-orphan"
    )
    points = relationship(
        "WisdomPoint", back_populates="owner", uselist=False, cascade="all, delete-orphan"
    )


class Jar(Base):
    __tablename__ = "jars"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    allocation_percent = Column(Float, default=0.0)  # user-configured percentage
    balance = Column(Float, default=0.0)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="jars")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    description = Column(String, index=True)
    amount = Column(Float, nullable=False)
    jar_name = Column(String, nullable=True)  # classified jar name

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="transactions")


class WisdomPoint(Base):
    __tablename__ = "wisdom_points"

    id = Column(Integer, primary_key=True, index=True)
    points = Column(Integer, default=0)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="points")