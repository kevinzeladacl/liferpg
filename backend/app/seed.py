"""Seed data for initial categories"""

from sqlalchemy.orm import Session
from .models import Category


DEFAULT_CATEGORIES = [
    {
        "name": "Salud",
        "description": "Ejercicio, alimentación, descanso y bienestar físico",
        "icon": "fitness",
        "color": "#4CAF50",
        "base_xp": 15
    },
    {
        "name": "Productividad",
        "description": "Trabajo, estudios y tareas profesionales",
        "icon": "briefcase",
        "color": "#2196F3",
        "base_xp": 20
    },
    {
        "name": "Aprendizaje",
        "description": "Lectura, cursos y desarrollo de habilidades",
        "icon": "school",
        "color": "#9C27B0",
        "base_xp": 25
    },
    {
        "name": "Finanzas",
        "description": "Ahorro, inversiones y gestión del dinero",
        "icon": "cash",
        "color": "#FF9800",
        "base_xp": 20
    },
    {
        "name": "Social",
        "description": "Relaciones, familia y conexiones sociales",
        "icon": "people",
        "color": "#E91E63",
        "base_xp": 15
    },
    {
        "name": "Hogar",
        "description": "Limpieza, organización y mantenimiento del hogar",
        "icon": "home",
        "color": "#795548",
        "base_xp": 10
    },
    {
        "name": "Creatividad",
        "description": "Arte, música, escritura y proyectos creativos",
        "icon": "color-palette",
        "color": "#00BCD4",
        "base_xp": 20
    },
    {
        "name": "Mindfulness",
        "description": "Meditación, reflexión y bienestar mental",
        "icon": "leaf",
        "color": "#8BC34A",
        "base_xp": 15
    },
    {
        "name": "Aventura",
        "description": "Viajes, exploración y nuevas experiencias",
        "icon": "compass",
        "color": "#FF5722",
        "base_xp": 30
    },
    {
        "name": "Hábitos",
        "description": "Rutinas diarias y hábitos generales",
        "icon": "repeat",
        "color": "#607D8B",
        "base_xp": 10
    }
]


def seed_categories(db: Session):
    """Seed default categories if they don't exist"""
    existing = db.query(Category).count()
    if existing > 0:
        return False

    for cat_data in DEFAULT_CATEGORIES:
        category = Category(**cat_data)
        db.add(category)

    db.commit()
    return True
