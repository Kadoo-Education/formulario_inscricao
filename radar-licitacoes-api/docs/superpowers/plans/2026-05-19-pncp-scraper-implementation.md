# Radar de Licitações - Plano de Implementação: Motor de Captura e Base

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o setup inicial da API e o motor de captura de licitações do PNCP com suporte a Upsert e agendamento.

**Architecture:** Clean Architecture com separação em `core` (config), `models` (db), `services` (lógica) e `api`. O motor usa um cliente HTTP assíncrono e um serviço de negócio para persistência.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy 2.0, PostgreSQL, HTTPX, Alembic, APScheduler, Pytest.

---

### Task 1: Setup do Ambiente e Docker

**Files:**
- Create: `docker-compose.yml`
- Create: `.env`
- Create: `requirements.txt`

- [ ] **Step 1: Criar o arquivo docker-compose.yml**
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    container_name: radar_postgres
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: adminpassword
      POSTGRES_DB: radar_licitacoes
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] **Step 2: Criar o arquivo .env inicial**
```text
DATABASE_URL=postgresql://admin:adminpassword@localhost:5432/radar_licitacoes
PNCP_API_BASE_URL=https://pncp.gov.br/api/consulta
```

- [ ] **Step 3: Criar requirements.txt**
```text
fastapi
uvicorn[standard]
sqlalchemy>=2.0
psycopg2-binary
httpx
python-dotenv
pydantic
pydantic-settings
apscheduler
alembic
pytest
pytest-asyncio
```

- [ ] **Step 4: Subir o banco de dados**
Run: `docker-compose up -d`

- [ ] **Step 5: Commit inicial**
```bash
git add docker-compose.yml .env requirements.txt
git commit -m "chore: setup initial environment and docker"
```

---

### Task 2: Modelos de Banco de Dados e Migração

**Files:**
- Create: `app/core/database.py`
- Create: `app/models/licitacao.py`
- Modify: `alembic.ini`, `app/models/__init__.py`

- [ ] **Step 1: Implementar app/core/database.py**
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
```

- [ ] **Step 2: Criar o modelo Licitacao em app/models/licitacao.py**
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

- [ ] **Step 3: Inicializar Alembic e criar migração**
Run: `alembic init alembic` e configurar `env.py` para apontar para `Base.metadata`.
Run: `alembic revision --autogenerate -m "create licitacoes table"`
Run: `alembic upgrade head`

---

### Task 3: PNCP Client (Integração HTTP)

**Files:**
- Create: `app/services/pncp_client.py`
- Create: `tests/test_pncp_client.py`

- [ ] **Step 1: Escrever teste de integração para o cliente**
```python
import pytest
from app.services.pncp_client import PNCPClient

@pytest.mark.asyncio
async def test_fetch_contratacoes_success():
    client = PNCPClient()
    # Testando com uma data fixa do passado para garantir retorno
    data = await client.fetch_contratacoes("20240101", "20240102", 1)
    assert "data" in data
    assert len(data["data"]) >= 0
```

- [ ] **Step 2: Implementar PNCPClient**
```python
import httpx
import os

class PNCPClient:
    def __init__(self):
        self.base_url = os.getenv("PNCP_API_BASE_URL", "https://pncp.gov.br/api/consulta")

    async def fetch_contratacoes(self, data_inicial: str, data_final: str, pagina: int = 1):
        url = f"{self.base_url}/v1/contratacoes/publicacao"
        params = {
            "dataInicial": data_inicial,
            "dataFinal": data_final,
            "codigoModalidadeContratacao": 8, # Dispensa
            "pagina": pagina
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30.0)
            response.raise_for_status()
            return response.json()
```

- [ ] **Step 3: Validar teste**
Run: `pytest tests/test_pncp_client.py`

---

### Task 4: LicitacaoService (Lógica de Upsert)

**Files:**
- Create: `app/services/licitacao_service.py`
- Create: `tests/test_licitacao_service.py`

- [ ] **Step 1: Implementar lógica de persistência com Upsert**
```python
from sqlalchemy.future import select
from app.models.licitacao import Licitacao
from app.core.database import AsyncSessionLocal

class LicitacaoService:
    @staticmethod
    async def upsert_licitacoes(db_session, licitacoes_data):
        for data in licitacoes_data:
            query = select(Licitacao).where(Licitacao.id_pncp == data['id_pncp'])
            result = await db_session.execute(query)
            licitacao = result.scalar_one_or_none()

            if licitacao:
                # Update
                for key, value in data.items():
                    setattr(licitacao, key, value)
            else:
                # Insert
                licitacao = Licitacao(**data)
                db_session.add(licitacao)
        
        await db_session.commit()
```

---

### Task 5: Motor de Captura e Agendamento

**Files:**
- Create: `app/services/scrapper_task.py`
- Modify: `app/main.py`

- [ ] **Step 1: Criar a tarefa orquestradora do scrapper**
Implementar função que chama `PNCPClient`, trata os dados e chama `LicitacaoService.upsert_licitacoes`.

- [ ] **Step 2: Configurar APScheduler no app/main.py**
Adicionar o agendador para rodar a tarefa de hora em hora.
