import uuid
import logging
from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.licitacao import Licitacao, LicitacaoItem, LicitacaoHistorico

logger = logging.getLogger(__name__)

class LicitacaoService:
    @staticmethod
    async def upsert_licitacoes(db_session: AsyncSession, licitacoes_data: List[dict]) -> List[Licitacao]:
        if not licitacoes_data:
            return []
            
        # Bulk fetch all existing licitacoes in this batch to avoid N+1
        id_pncps = [data['id_pncp'] for data in licitacoes_data if 'id_pncp' in data]
        query = select(Licitacao).where(Licitacao.id_pncp.in_(id_pncps))
        result = await db_session.execute(query)
        existing_map = {l.id_pncp: l for l in result.scalars().all()}
        
        upserted_licitacoes = []
        for data in licitacoes_data:
            id_pncp = data.get('id_pncp')
            if not id_pncp:
                continue
                
            licitacao = existing_map.get(id_pncp)
            
            if licitacao:
                # Detect status change for history
                old_status = licitacao.status
                new_status = data.get('status')
                if new_status and old_status != new_status:
                    db_session.add(LicitacaoHistorico(
                        licitacao_id=licitacao.id,
                        status_anterior=old_status,
                        status_novo=new_status
                    ))
                
                # Update fields
                for key, value in data.items():
                    setattr(licitacao, key, value)
            else:
                # Insert new
                licitacao = Licitacao(**data)
                db_session.add(licitacao)
            
            upserted_licitacoes.append(licitacao)
        
        await db_session.commit()
        return upserted_licitacoes

    @staticmethod
    async def upsert_itens(db_session: AsyncSession, licitacao_id: uuid.UUID, itens_data: List[dict]):
        if not itens_data:
            return
            
        # Bulk fetch all items for this licitacao to avoid N+1
        query = select(LicitacaoItem).where(LicitacaoItem.licitacao_id == licitacao_id)
        result = await db_session.execute(query)
        existing_items_map = {item.numero_item: item for item in result.scalars().all()}
        
        for data in itens_data:
            numero_item = data.get('numero_item')
            if numero_item is None:
                continue
                
            item = existing_items_map.get(numero_item)
            
            if item:
                # Update
                for key, value in data.items():
                    setattr(item, key, value)
            else:
                # Insert
                item = LicitacaoItem(licitacao_id=licitacao_id, **data)
                db_session.add(item)
        
        await db_session.commit()
