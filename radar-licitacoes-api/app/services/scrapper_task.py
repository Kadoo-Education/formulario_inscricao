import logging
from datetime import datetime, timedelta
from app.services.pncp_client import PNCPClient
from app.services.licitacao_service import LicitacaoService
from app.core.database import AsyncSessionLocal
from app.schemas.pncp import PNCPResponse
from sqlalchemy.future import select
from app.models.licitacao import Licitacao

logger = logging.getLogger(__name__)

async def sync_pncp_data():
    """
    Orchestrates the sync process between PNCP API and local database.
    """
    logger.info("Starting PNCP sync task...")
    
    async with AsyncSessionLocal() as db_session:
        try:
            # Decide period
            query = select(Licitacao).limit(1)
            result = await db_session.execute(query)
            has_data = result.scalar() is not None
            
            now = datetime.now()
            if not has_data:
                # If bank is empty, search last 30 days
                start_date = (now - timedelta(days=30)).strftime("%Y%m%d")
                logger.info("Database empty. Searching last 30 days.")
            else:
                # If not, search today
                start_date = now.strftime("%Y%m%d")
                logger.info("Database has data. Searching today.")
                
            end_date = now.strftime("%Y%m%d")
            
            pncp_client = PNCPClient()
            service = LicitacaoService()
            
            page = 1
            total_synced = 0
            
            while True:
                try:
                    logger.info(f"Fetching page {page} from PNCP for period {start_date}-{end_date}")
                    raw_data = await pncp_client.fetch_contratacoes(start_date, end_date, page)
                    
                    # Use Pydantic to validate and map
                    response = PNCPResponse(**raw_data)
                    
                    if not response.data:
                        logger.info("No more data to sync.")
                        break
                    
                    mapped_data = [item.to_licitacao_dict() for item in response.data]
                    
                    await service.upsert_licitacoes(db_session, mapped_data)
                    
                    total_synced += len(mapped_data)
                    
                    if page >= response.totalPaginas:
                        break
                    page += 1
                except Exception as e:
                    logger.error(f"Error during PNCP sync at page {page}: {str(e)}", exc_info=True)
                    break
            
            await pncp_client.client.aclose()
            logger.info(f"Sync completed. Total synced: {total_synced}")
            
        except Exception as e:
            logger.error(f"Critical error in sync_pncp_data: {str(e)}", exc_info=True)
