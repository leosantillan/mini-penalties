from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

# Country Models
class Country(BaseModel):
    country_id: str
    name: str
    flag: str
    color: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CountryCreate(BaseModel):
    country_id: str
    name: str
    flag: str
    color: str

class CountryUpdate(BaseModel):
    name: Optional[str] = None
    flag: Optional[str] = None
    color: Optional[str] = None

# Team Models
class Team(BaseModel):
    team_id: str
    name: str
    country_id: str
    country_name: Optional[str] = None
    flag: Optional[str] = None
    shirt_design_url: Optional[str] = None
    color: str
    goals: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TeamCreate(BaseModel):
    team_id: str
    name: str
    country_id: str
    color: str
    shirt_design_url: Optional[str] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    country_id: Optional[str] = None
    color: Optional[str] = None
    shirt_design_url: Optional[str] = None

# Goal Models
class Goal(BaseModel):
    goal_id: str
    team_id: str
    team_name: Optional[str] = None
    score: int
    user_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class GoalCreate(BaseModel):
    team_id: str
    score: int
    user_id: Optional[str] = None

# User Models
class User(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    role: UserRole = UserRole.USER
    country_id: Optional[str] = None
    team_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserInDB(User):
    password_hash: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.USER
    country_id: Optional[str] = None
    team_id: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None
    country_id: Optional[str] = None
    team_id: Optional[str] = None

# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Game Session Models
class GameSession(BaseModel):
    session_id: str
    team_id: str
    team_name: Optional[str] = None
    user_id: Optional[str] = None
    score: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class GameSessionCreate(BaseModel):
    team_id: str
    score: int
    user_id: Optional[str] = None

# Stats Models
class TeamStats(BaseModel):
    team_id: str
    team_name: str
    country_name: str
    total_goals: int
    total_games: int
    average_score: float
    best_score: int

class DailyStats(BaseModel):
    date: str
    total_goals: int
    total_games: int
    unique_teams: int

class MonthlyStats(BaseModel):
    month: str
    total_goals: int
    total_games: int
    unique_teams: int

class LeaderboardEntry(BaseModel):
    rank: int
    team_id: str
    team_name: str
    country_name: str
    flag: str
    goals: int
    color: str