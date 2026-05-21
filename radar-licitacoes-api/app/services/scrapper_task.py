import logging
from datetime import datetime, timedelta
from app.services.pncp_client import PNCPClient
from app.services.licitacao_service import LicitacaoService
from app.core.database import AsyncSessionLocal
from app.schemas.pncp import PNCPResponse, extract_pncp_identifiers
from sqlalchemy.future import select
from app.models.licitacao import Licitacao

from app.core.config import settings

logger = logging.getLogger(__name__)

async def sync_pncp_data():
    """
    Orchestrates the sync process between PNCP API and local database.
    Fetches data in 15-day chunks to avoid timeouts.
    """
    logger.info(f"Starting PNCP sync task for UF: {settings.DEFAULT_UF}...")
    
    async with AsyncSessionLocal() as db_session:
        try:
            # Decide total period to sync
            query = select(Licitacao).limit(1)
            result = await db_session.execute(query)
            has_data = result.scalar() is not None
            
            # Se o banco está vazio, faz um "Deep Scan" de 1 ano. 
            # Se já tem dados, revisa os últimos 180 dias para pegar atualizações.
            total_days = 365 if not has_data else 180
            now = datetime.now()
            
            pncp_client = PNCPClient()
            service = LicitacaoService()
            total_synced = 0

            # Mantendo blocos de 15 dias para evitar timeout
            chunk_size = 15
            for i in range(0, total_days, chunk_size):
                chunk_start = now - timedelta(days=i + chunk_size)
                chunk_end = now - timedelta(days=i)
                
                start_str = chunk_start.strftime("%Y%m%d")
                end_str = chunk_end.strftime("%Y%m%d")
                
                logger.info(f"Processing chunk: {start_str} to {end_str}")
                
                page = 1
                while True:
                    try:
                        logger.info(f"Fetching page {page} for UF: {settings.DEFAULT_UF}")
                        raw_data = await pncp_client.fetch_contratacoes(
                            start_str, 
                            end_str, 
                            page, 
                            uf=settings.DEFAULT_UF
                        )
                        
                        response = PNCPResponse(**raw_data)
                        if not response.data:
                            break
                        
                        mapped_data = [item.to_licitacao_dict() for item in response.data]
                        upserted_licitacoes = await service.upsert_licitacoes(db_session, mapped_data)
                        
                        # Deep Sync: Fetch items for each licitacao
                        for licitacao in upserted_licitacoes:
                            ids = extract_pncp_identifiers(licitacao.id_pncp)
                            if not ids:
                                logger.warning(f"Could not extract identifiers from {licitacao.id_pncp}")
                                continue
                                
                            try:
                                item_page = 1
                                all_items_data = []
                                while True:
                                    items = await pncp_client.fetch_itens(
                                        ids['cnpj'], 
                                        ids['ano'], 
                                        ids['sequencial'],
                                        pagina=item_page
                                    )
                                    if not items:
                                        break
                                        
                                    for item in items:
                                        all_items_data.append({
                                            "numero_item": item.get("numeroItem"),
                                            "descricao": item.get("descricao"),
                                            "quantidade": item.get("quantidade"),
                                            "unidade_medida": item.get("unidadeMedida"),
                                            "valor_unitario": item.get("valorUnitarioEstimado"),
                                            "valor_total": item.get("valorTotal")
                                        })
                                    
                                    # Heurística para paginação de itens (geralmente vêm poucos)
                                    if len(items) < 10:
                                        break
                                    item_page += 1
                                    
                                if all_items_data:
                                    await service.upsert_itens(db_session, licitacao.id, all_items_data)
                            except Exception as e:
                                logger.error(f"Failed to fetch items for licitacao {licitacao.id_pncp}: {str(e)}")

                        total_synced += len(upserted_licitacoes)
                        if page >= response.totalPaginas:
                            break
                        page += 1
                    except Exception as e:
                        logger.error(f"Error in chunk {start_str}-{end_str} at page {page}: {str(e)}")
                        break # Go to next chunk

            await pncp_client.client.aclose()
            logger.info(f"Sync completed. Total synced: {total_synced}")
            
        except Exception as e:
            logger.error(f"Critical error in sync_pncp_data: {str(e)}", exc_info=True)
