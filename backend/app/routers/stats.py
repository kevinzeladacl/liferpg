from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Task, TaskCompletion, TaskStatus
from ..models import get_xp_for_next_level
from ..schemas import UserStats, UserResponse, TaskCompletionResponse, DashboardStats, TaskResponse
from ..auth import get_current_user

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/me", response_model=UserStats)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get completed tasks count
    tasks_completed = db.query(TaskCompletion).filter(
        TaskCompletion.user_id == current_user.id
    ).count()

    # Get best streak from all tasks
    best_streak = db.query(func.max(Task.best_streak)).filter(
        Task.user_id == current_user.id
    ).scalar() or 0

    # Get current active streak (highest among active tasks)
    current_streak = db.query(func.max(Task.current_streak)).filter(
        Task.user_id == current_user.id,
        Task.is_active == True
    ).scalar() or 0

    # Calculate XP to next level
    xp_to_next = get_xp_for_next_level(current_user.level) - current_user.total_xp

    return UserStats(
        level=current_user.level,
        current_xp=current_user.current_xp,
        xp_to_next_level=max(0, xp_to_next),
        total_xp=current_user.total_xp,
        title=current_user.title,
        tasks_completed=tasks_completed,
        current_streak=current_streak,
        best_streak=best_streak
    )


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user stats
    stats = get_my_stats(db=db, current_user=current_user)

    # Get today's tasks
    today = datetime.utcnow().date()
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_active == True
    ).all()

    today_tasks = []
    for task in tasks:
        if task.frequency.value in ['daily', 'weekly', 'monthly']:
            today_tasks.append(task)
        elif task.frequency.value == 'once' and task.status != TaskStatus.COMPLETED:
            today_tasks.append(task)

    # Get recent completions (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_completions = db.query(TaskCompletion).filter(
        TaskCompletion.user_id == current_user.id,
        TaskCompletion.completed_at >= week_ago
    ).order_by(TaskCompletion.completed_at.desc()).limit(10).all()

    return DashboardStats(
        user=current_user,
        stats=stats,
        today_tasks=today_tasks,
        recent_completions=recent_completions
    )


@router.get("/history", response_model=List[TaskCompletionResponse])
def get_completion_history(
    days: int = 30,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    since = datetime.utcnow() - timedelta(days=days)

    completions = db.query(TaskCompletion).filter(
        TaskCompletion.user_id == current_user.id,
        TaskCompletion.completed_at >= since
    ).order_by(TaskCompletion.completed_at.desc()).limit(limit).all()

    return completions


@router.get("/xp-history")
def get_xp_history(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily XP earned over time"""
    since = datetime.utcnow() - timedelta(days=days)

    completions = db.query(TaskCompletion).filter(
        TaskCompletion.user_id == current_user.id,
        TaskCompletion.completed_at >= since
    ).all()

    # Group by day
    xp_by_day = {}
    for completion in completions:
        day = completion.completed_at.date().isoformat()
        if day not in xp_by_day:
            xp_by_day[day] = 0
        xp_by_day[day] += completion.xp_earned

    # Fill in missing days with 0
    result = []
    current = since.date()
    end = datetime.utcnow().date()

    while current <= end:
        day_str = current.isoformat()
        result.append({
            "date": day_str,
            "xp": xp_by_day.get(day_str, 0)
        })
        current += timedelta(days=1)

    return result
