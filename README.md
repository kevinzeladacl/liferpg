# 🎮 LifeRPG

> Gamifica tu vida convirtiendo hábitos y rutinas en una experiencia RPG

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=flat&logo=ionic&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

## ✨ Características

- **Sistema de XP y Niveles** - Gana experiencia al completar tareas y sube de nivel
- **Títulos Desbloqueables** - Novato → Aprendiz → Aventurero → Veterano → Maestro → Leyenda
- **Rachas (Streaks)** - Bonus de XP por mantener consistencia (hasta +50%)
- **Tareas Flexibles** - Diarias, semanales, mensuales u objetivos únicos
- **10 Categorías** - Salud, Productividad, Aprendizaje, Finanzas y más
- **Dashboard Gamificado** - Visualiza tu progreso con estilo RPG

## 📁 Estructura del Proyecto

```
liferpg/
├── backend/                 # API REST con FastAPI
│   ├── app/
│   │   ├── routers/         # Endpoints (auth, tasks, categories, stats)
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   ├── schemas.py       # Esquemas Pydantic
│   │   ├── auth.py          # JWT + bcrypt
│   │   ├── database.py      # Configuración SQLite
│   │   ├── seed.py          # Categorías iniciales
│   │   └── main.py          # App principal
│   └── requirements.txt
│
└── frontend/                # App móvil con Ionic/Angular
    └── src/app/
        ├── pages/           # Login, Dashboard, Tasks, Profile
        ├── services/        # API y Auth services
        └── models/          # Interfaces TypeScript
```

## 🚀 Instalación

### Requisitos Previos

- Python 3.9+
- Node.js 18+
- npm o yarn
- Ionic CLI (`npm install -g @ionic/cli`)

### Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor (puerto 8000 por defecto)
uvicorn app.main:app --reload

# O en un puerto personalizado
uvicorn app.main:app --port 8585 --reload
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo (puerto 8100 por defecto)
ionic serve

# O en un puerto personalizado
ionic serve --port 8105
```

> **Nota:** Si cambias los puertos, actualiza `apiUrl` en `frontend/src/environments/environment.ts` y los CORS en `backend/app/main.py`

## 📚 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Usuario actual |
| **Tasks** | | |
| GET | `/tasks/` | Listar tareas |
| GET | `/tasks/today` | Tareas de hoy |
| POST | `/tasks/` | Crear tarea |
| PUT | `/tasks/{id}` | Actualizar tarea |
| DELETE | `/tasks/{id}` | Eliminar tarea |
| POST | `/tasks/{id}/start` | Iniciar tarea |
| POST | `/tasks/{id}/complete` | Completar (gana XP) |
| **Categories** | | |
| GET | `/categories/` | Listar categorías |
| **Stats** | | |
| GET | `/stats/me` | Estadísticas usuario |
| GET | `/stats/dashboard` | Dashboard completo |
| GET | `/stats/xp-history` | Historial de XP |

📖 Documentación interactiva disponible en `/docs` (Swagger UI)

## 🎯 Categorías

| Categoría | XP Base | Icono |
|-----------|---------|-------|
| Salud | 15 | 💪 |
| Productividad | 20 | ⚡ |
| Aprendizaje | 25 | 📚 |
| Finanzas | 20 | 💰 |
| Social | 15 | 👥 |
| Hogar | 10 | 🏠 |
| Creatividad | 20 | 🎨 |
| Mindfulness | 15 | 🧘 |
| Aventura | 30 | 🗺️ |
| Hábitos | 10 | ✅ |

## 📈 Sistema de Niveles

| Nivel | Título | XP Requerido |
|-------|--------|--------------|
| 1-4 | Novato | 0 - 500 |
| 5-9 | Aprendiz | 500 - 2,000 |
| 10-14 | Aventurero | 2,000 - 6,000 |
| 15-19 | Veterano | 6,000 - 12,000 |
| 20-24 | Maestro | 12,000 - 22,000 |
| 25+ | Leyenda | 22,000+ |

### Bonus por Racha

- Cada día consecutivo: +5% XP
- Máximo bonus: +50% (10 días)

## 🛠️ Tecnologías

**Backend:**
- FastAPI - Framework web moderno y rápido
- SQLAlchemy - ORM para Python
- SQLite - Base de datos embebida
- JWT + bcrypt - Autenticación segura

**Frontend:**
- Ionic 8 - Framework de apps híbridas
- Angular 20 - Framework de componentes
- TypeScript - Tipado estático

## 📱 Screenshots

*Próximamente*

## 📄 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

---

<p align="center">
  <strong>¡Convierte tu vida en un juego!</strong> 🎮
</p>
