import pytest
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.database import Base
from app.core.config import settings

# Test database URL - using a different database for tests if possible, 
# but following GEMINI.md advice to use docker-configured one.
# For simplicity, we'll use the one from settings but ideally we'd use a separate one.
TEST_DATABASE_URL = settings.DATABASE_URL

@pytest.fixture(scope="session")
def event_loop():
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest.fixture
async def db_session(test_engine):
    async_session = async_sessionmaker(
        bind=test_engine,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()
