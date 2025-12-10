from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import Task, Category, User, TaskCompletion, TaskStatus, FrequencyType
from ..models import get_xp_for_next_level, get_title_for_level, LEVEL_THRESHOLDS
from ..schemas import (
    TaskCreate, TaskResponse, TaskUpdate,
    TaskCompletionCreate, TaskCompletionResponse
)
from ..auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    frequency: Optional[FrequencyType] = None,
    status: Optional[TaskStatus] = None,
    category_id: Optional[int] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)

    if active_only:
        query = query.filter(Task.is_active == True)

    if frequency:
        query = query.filter(Task.frequency == frequency)

    if status:
        query = query.filter(Task.status == status)

    if category_id:
        query = query.filter(Task.category_id == category_id)

    tasks = query.all()

    # Check and reset tasks based on frequency
    for task in tasks:
        if should_reset_task(task):
            task.status = TaskStatus.PENDING
            db.commit()

    return tasks


@router.get("/today", response_model=List[TaskResponse])
def get_today_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tasks that should be done today"""
    today = datetime.utcnow().date()

    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_active == True
    ).all()

    today_tasks = []
    for task in tasks:
        # Reset if needed
        if should_reset_task(task):
            task.status = TaskStatus.PENDING
            db.commit()

        # Include daily tasks
        if task.frequency == FrequencyType.DAILY:
            today_tasks.append(task)

        # Include weekly tasks (show all week)
        elif task.frequency == FrequencyType.WEEKLY:
            today_tasks.append(task)

        # Include monthly tasks (show all month)
        elif task.frequency == FrequencyType.MONTHLY:
            today_tasks.append(task)

        # Include one-time tasks that are not completed
        elif task.frequency == FrequencyType.ONCE and task.status != TaskStatus.COMPLETED:
            today_tasks.append(task)

    return today_tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify category exists
    category = db.query(Category).filter(Category.id == task.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Set XP reward based on category if not specified
    xp_reward = task.xp_reward if task.xp_reward else category.base_xp

    db_task = Task(
        user_id=current_user.id,
        category_id=task.category_id,
        title=task.title,
        description=task.description,
        frequency=task.frequency,
        xp_reward=xp_reward,
        difficulty=task.difficulty,
        due_date=task.due_date
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/start", response_model=TaskResponse)
def start_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a task as in progress"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.status = TaskStatus.IN_PROGRESS
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/complete", response_model=TaskCompletionResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete a task and earn XP"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.status == TaskStatus.COMPLETED and task.frequency != FrequencyType.ONCE:
        # Check if it should be reset
        if not should_reset_task(task):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task already completed for this period"
            )

    # Calculate XP with difficulty and streak bonus
    base_xp = int(task.xp_reward * task.difficulty)

    # Streak bonus (5% per streak day, max 50%)
    streak_bonus = min(task.current_streak * 5, 50)
    streak_xp = int(base_xp * streak_bonus / 100)

    total_xp = base_xp + streak_xp

    # Update task
    task.status = TaskStatus.COMPLETED
    task.last_completed = datetime.utcnow()
    task.current_streak += 1
    if task.current_streak > task.best_streak:
        task.best_streak = task.current_streak

    # Update user XP
    old_level = current_user.level
    current_user.current_xp += total_xp
    current_user.total_xp += total_xp

    # Check for level up
    level_up = False
    new_level = old_level

    xp_for_next = get_xp_for_next_level(current_user.level)
    while current_user.total_xp >= xp_for_next:
        current_user.level += 1
        current_user.title = get_title_for_level(current_user.level)
        level_up = True
        new_level = current_user.level
        xp_for_next = get_xp_for_next_level(current_user.level)

    # Create completion record
    completion = TaskCompletion(
        task_id=task.id,
        user_id=current_user.id,
        xp_earned=total_xp,
        streak_bonus=streak_xp
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)

    return TaskCompletionResponse(
        id=completion.id,
        task_id=completion.task_id,
        completed_at=completion.completed_at,
        xp_earned=completion.xp_earned,
        streak_bonus=completion.streak_bonus,
        new_level=new_level if level_up else None,
        level_up=level_up
    )


def should_reset_task(task: Task) -> bool:
    """Check if a task should be reset based on its frequency"""
    if task.status != TaskStatus.COMPLETED:
        return False

    if task.frequency == FrequencyType.ONCE:
        return False

    if not task.last_completed:
        return True

    now = datetime.utcnow()
    last = task.last_completed

    if task.frequency == FrequencyType.DAILY:
        return now.date() > last.date()

    elif task.frequency == FrequencyType.WEEKLY:
        # Reset on Monday
        last_week = last.isocalendar()[1]
        current_week = now.isocalendar()[1]
        return current_week > last_week or now.year > last.year

    elif task.frequency == FrequencyType.MONTHLY:
        return now.month > last.month or now.year > last.year

    return False
