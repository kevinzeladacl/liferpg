from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from .models import FrequencyType, TaskStatus


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    level: int
    current_xp: int
    total_xp: int
    avatar_url: Optional[str]
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    level: int
    current_xp: int
    xp_to_next_level: int
    total_xp: int
    title: str
    tasks_completed: int
    current_streak: int
    best_streak: int


# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: str
    icon: str
    color: str
    base_xp: int


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: int
    frequency: FrequencyType = FrequencyType.DAILY
    xp_reward: Optional[int] = None
    difficulty: float = 1.0
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    frequency: Optional[FrequencyType] = None
    xp_reward: Optional[int] = None
    difficulty: Optional[float] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class TaskResponse(TaskBase):
    id: int
    user_id: int
    status: TaskStatus
    current_streak: int
    best_streak: int
    created_at: datetime
    last_completed: Optional[datetime]
    is_active: bool
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


# Task completion schemas
class TaskCompletionCreate(BaseModel):
    task_id: int


class TaskCompletionResponse(BaseModel):
    id: int
    task_id: int
    completed_at: datetime
    xp_earned: int
    streak_bonus: int
    new_level: Optional[int] = None
    level_up: bool = False

    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Dashboard schemas
class DashboardStats(BaseModel):
    user: UserResponse
    stats: UserStats
    today_tasks: List[TaskResponse]
    recent_completions: List[TaskCompletionResponse]
