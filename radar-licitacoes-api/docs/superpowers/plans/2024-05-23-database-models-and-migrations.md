# Modelos de Banco de Dados e Migração Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up SQLAlchemy 2.0 async database layer and the main model for procurement tracking, including Alembic migrations.

**Architecture:** Clean Architecture with async SQLAlchemy 2.0. Separated core configuration and models.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic, asyncpg, PostgreSQL.

---

### Task 1: Setup Dependencies and Directory Structure

**Files:**
- Create: `app/__init__.py`
- Create: `app/core/__init__.py`
- Create: `app/models/__init__.py`
- Create: `app/schemas/__init__.py`
- Create: `app/api/__init__.py`
- Create: `app/api/routes/__init__.py`
- Create: `app/services/__init__.py`
- Modify: `requirements.txt`

- [ ] **Step 1: Create directories and __init__.py files**

Run: `mkdir -p app/core app/models app/schemas app/api/routes app/services`
Run: `touch app/__init__.py app/core/__init__.py app/models/__init__.py app/schemas/__init__.py app/api/__init__.py app/api/routes/__init__.py app/services/__init__.py`

- [ ] **Step 2: Add asyncpg to requirements.txt**

Modify `requirements.txt` to include `asyncpg`.

- [ ] **Step 3: Install dependencies**

Run: `pip install -r requirements.txt`

- [ ] **Step 4: Commit**

```bash
git add requirements.txt app/
git commit -m "chore: setup directory structure and dependencies"
```

### Task 2: Implement app/core/database.py

**Files:**
- Create: `app/core/database.py`

- [ ] **Step 1: Implement database configuration**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL").replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

- [ ] **Step 2: Commit**

```bash
git add app/core/database.py
git commit -m "feat: add database configuration"
```

### Task 3: Create Licitacao model

**Files:**
- Create: `app/models/licitacao.py`
- Modify: `app/models/__init__.py`

- [ ] **Step 1: Implement Licitacao model**

```python
from sqlalchemy import Column, String, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Licitacao(Base):
    __tablename__ = "licitacoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_pncp = Column(String, unique=True, index=True, nullable=False)
    orgao_nome = Column(String, nullable=False)
    objeto = Column(Text)
    valor_estimado = Column(Numeric(precision=15, scale=2))
    data_publicacao = Column(DateTime)
    data_fim_propostas = Column(DateTime)
    link_origem = Column(String)
    status = Column(String)
```

- [ ] **Step 2: Export model in app/models/__init__.py**

```python
from .licitacao import Licitacao
```

- [ ] **Step 3: Commit**

```bash
git add app/models/licitacao.py app/models/__init__.py
git commit -m "feat: add Licitacao model"
```

### Task 4: Initialize Alembic and create migration

**Files:**
- Create: `alembic/`
- Modify: `alembic/env.py`
- Modify: `alembic.ini`

- [ ] **Step 1: Initialize Alembic**

Run: `alembic init alembic`

- [ ] **Step 2: Configure alembic.ini**

Set `sqlalchemy.url` to the database URL (can use placeholders if env is used in env.py).

- [ ] **Step 3: Configure alembic/env.py for Async and Metadata**

Modify `alembic/env.py` to import `Base` and `DATABASE_URL` and use async engine.

- [ ] **Step 4: Create initial migration**

Run: `alembic revision --autogenerate -m "create licitacoes table"`

- [ ] **Step 5: Run migration**

Run: `alembic upgrade head`

- [ ] **Step 6: Verify table creation**

Run: `psql -d radar_licitacoes -c "\dt"` (adjust connection string if needed) or check logs.

- [ ] **Step 7: Commit**

```bash
git add alembic/ alembic.ini
git commit -m "feat: setup alembic migrations and create licitacoes table"
```
