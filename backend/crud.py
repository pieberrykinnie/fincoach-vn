from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas
from datetime import datetime

# User operations

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Initialize wisdom points
    db_points = models.WisdomPoint(points=10, owner=db_user)  # Welcome bonus
    db.add(db_points)
    # Initialize default jars according to 6-jar system
    default_allocation = {
        "Necessity": 0.55,
        "Long-Term Savings": 0.1,
        "Financial Freedom": 0.1,
        "Education": 0.1,
        "Play": 0.1,
        "Give": 0.05,
    }
    for name, percent in default_allocation.items():
        db_jar = models.Jar(name=name, allocation_percent=percent * 100, balance=0, owner=db_user)
        db.add(db_jar)
    db.commit()
    db.refresh(db_user)
    return db_user

# Jar operations

def get_jars(db: Session, user_id: int) -> List[models.Jar]:
    return db.query(models.Jar).filter(models.Jar.owner_id == user_id).all()


def update_jar_allocation(db: Session, user_id: int, name: str, allocation_percent: float):
    jar = (
        db.query(models.Jar)
        .filter(models.Jar.owner_id == user_id, models.Jar.name == name)
        .first()
    )
    if jar:
        jar.allocation_percent = allocation_percent
        db.commit()
        db.refresh(jar)
    return jar

# Transaction operations

def create_transaction(db: Session, user_id: int, tx: schemas.TransactionCreate, jar_name: str):
    db_tx = models.Transaction(
        owner_id=user_id,
        description=tx.description,
        amount=tx.amount,
        jar_name=jar_name,
        date=datetime.utcnow(),
    )
    # update corresponding jar balance
    jar = (
        db.query(models.Jar)
        .filter(models.Jar.owner_id == user_id, models.Jar.name == jar_name)
        .first()
    )
    if jar:
        jar.balance += tx.amount
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)

    # Check alert threshold: if balance exceeds allocation_percent (treated as limit)
    if jar and jar.balance >= jar.allocation_percent:
        message = f"{jar.name} jar exceeded its limit!"
        create_alert(db, user_id, jar.name, message)

    return db_tx


def get_transactions(db: Session, user_id: int) -> List[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.owner_id == user_id).all()


# Gamification operations

def add_points(db: Session, user_id: int, points: int):
    record = db.query(models.WisdomPoint).filter(models.WisdomPoint.owner_id == user_id).first()
    if record:
        record.points += points
        db.commit()
        db.refresh(record)
    return record


def get_points(db: Session, user_id: int) -> int:
    record = db.query(models.WisdomPoint).filter(models.WisdomPoint.owner_id == user_id).first()
    return record.points if record else 0

# Alert operations


def create_alert(db: Session, user_id: int, jar_name: str, message: str):
    alert = models.Alert(owner_id=user_id, jar_name=jar_name, message=message)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_alerts(db: Session, user_id: int):
    return (
        db.query(models.Alert)
        .filter(models.Alert.owner_id == user_id, models.Alert.resolved == 0)
        .order_by(models.Alert.created_at.desc())
        .all()
    )


# Leaderboard


def get_leaderboard(db: Session, limit: int = 10):
    return (
        db.query(models.User.username, models.WisdomPoint.points)
        .join(models.WisdomPoint, models.WisdomPoint.owner_id == models.User.id)
        .order_by(models.WisdomPoint.points.desc())
        .limit(limit)
        .all()
    )