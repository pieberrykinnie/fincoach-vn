from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class JarBase(BaseModel):
    name: str
    allocation_percent: float
    balance: float


class JarCreate(BaseModel):
    name: str
    allocation_percent: float


class Jar(JarBase):
    id: int

    class Config:
        orm_mode = True


class TransactionBase(BaseModel):
    date: datetime
    description: str
    amount: float
    jar_name: Optional[str] = None


class TransactionCreate(BaseModel):
    description: str
    amount: float


class Transaction(TransactionBase):
    id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    jars: List[Jar] = []

    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class JarUpdate(BaseModel):
    allocation_percent: float


class WisdomPoint(BaseModel):
    points: int

    class Config:
        orm_mode = True


# Alerts


class Alert(BaseModel):
    id: int
    jar_name: str
    message: str
    created_at: datetime
    resolved: int

    class Config:
        orm_mode = True


# Leaderboard


class LeaderboardUser(BaseModel):
    username: str
    points: int