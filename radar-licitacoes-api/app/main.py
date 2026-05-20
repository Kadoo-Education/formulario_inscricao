import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.scrapper_task import sync_pncp_data

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Configure and start the scheduler
    scheduler = AsyncIOScheduler()
    
    # Add the sync task to run every hour
    scheduler.add_job(
        sync_pncp_data,
        trigger=IntervalTrigger(hours=1),
        id="sync_pncp_data_job",
        replace_existing=True,
    )
    
    # Add a job to run immediately on startup
    scheduler.add_job(sync_pncp_data, id="initial_sync_job")
    
    scheduler.start()
    logger.info("Scheduler started.")
    
    yield
    
    # Shutdown: Shut down the scheduler
    scheduler.shutdown()
    logger.info("Scheduler shut down.")

app = FastAPI(
    title="Radar de Licitações API",
    description="Motor de Captura e API para editais de Dispensa de Licitação do PNCP",
    version="0.1.0",
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {"message": "Radar de Licitações API is running"}
