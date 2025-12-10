from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base


class FrequencyType(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    ONCE = "once"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # RPG Stats
    level = Column(Integer, default=1)
    current_xp = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)

    # Avatar info
    avatar_url = Column(String, nullable=True)
    title = Column(String, default="Novato")

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="user")
    task_completions = relationship("TaskCompletion", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    icon = Column(String)  # Icon name for UI
    color = Column(String)  # Hex color
    base_xp = Column(Integer, default=10)  # Base XP for this category

    # Relationships
    tasks = relationship("Task", back_populates="category")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))

    title = Column(String, index=True)
    description = Column(String, nullable=True)

    # Task type and frequency
    frequency = Column(Enum(FrequencyType), default=FrequencyType.DAILY)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)

    # XP reward (can be customized per task)
    xp_reward = Column(Integer, default=10)

    # Difficulty multiplier (1.0 = normal, 1.5 = hard, 2.0 = very hard)
    difficulty = Column(Float, default=1.0)

    # Streak tracking
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)

    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)  # For one-time objectives
    last_completed = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
    completions = relationship("TaskCompletion", back_populates="task")


class TaskCompletion(Base):
    __tablename__ = "task_completions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    completed_at = Column(DateTime, default=datetime.utcnow)
    xp_earned = Column(Integer)
    streak_bonus = Column(Integer, default=0)

    # Relationships
    task = relationship("Task", back_populates="completions")
    user = relationship("User", back_populates="task_completions")


# XP level thresholds
LEVEL_THRESHOLDS = {
    1: 0,
    2: 100,
    3: 250,
    4: 450,
    5: 700,
    6: 1000,
    7: 1400,
    8: 1900,
    9: 2500,
    10: 3200,
    11: 4000,
    12: 5000,
    13: 6200,
    14: 7600,
    15: 9200,
    16: 11000,
    17: 13000,
    18: 15500,
    19: 18500,
    20: 22000,
}

TITLES = {
    1: "Novato",
    5: "Aprendiz",
    10: "Aventurero",
    15: "Veterano",
    20: "Maestro",
    25: "Leyenda",
}


def get_xp_for_next_level(level: int) -> int:
    """Get XP needed for next level"""
    if level >= 20:
        return LEVEL_THRESHOLDS[20] + (level - 20) * 5000
    return LEVEL_THRESHOLDS.get(level + 1, LEVEL_THRESHOLDS[20])


def get_title_for_level(level: int) -> str:
    """Get title based on level"""
    title = "Novato"
    for lvl, t in sorted(TITLES.items()):
        if level >= lvl:
            title = t
    return title
