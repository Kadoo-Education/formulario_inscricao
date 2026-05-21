import uuid
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.licitacao import Licitacao, LicitacaoHistorico, LicitacaoItem

class LicitacaoService:
    @staticmethod
    async def upsert_licitacoes(db_session: AsyncSession, licitacoes_data: list[dict]) -> list[Licitacao]:
        upserted_licitacoes = []
        for data in licitacoes_data:
            # Identificador Único: id_pncp
            query = select(Licitacao).where(Licitacao.id_pncp == data['id_pncp'])
            result = await db_session.execute(query)
            licitacao = result.scalar_one_or_none()

            if licitacao:
                # Check for status change
                old_status = licitacao.status
                new_status = data.get('status')
                
                if new_status and old_status != new_status:
                    historico = LicitacaoHistorico(
                        licitacao_id=licitacao.id,
                        status_anterior=old_status,
                        status_novo=new_status
                    )
                    db_session.add(historico)

                # Update: Atualiza todos os campos fornecidos
                for key, value in data.items():
                    setattr(licitacao, key, value)
            else:
                # Insert: Novo registro
                licitacao = Licitacao(**data)
                db_session.add(licitacao)
            
            upserted_licitacoes.append(licitacao)
        
        await db_session.commit()
        return upserted_licitacoes

    @staticmethod
    async def upsert_itens(db_session: AsyncSession, licitacao_id: uuid.UUID, itens_data: list[dict]):
        for data in itens_data:
            query = select(LicitacaoItem).where(
                LicitacaoItem.licitacao_id == licitacao_id,
                LicitacaoItem.numero_item == data['numero_item']
            )
            result = await db_session.execute(query)
            item = result.scalar_one_or_none()

            if item:
                # Update: Atualiza todos os campos fornecidos
                for key, value in data.items():
                    setattr(item, key, value)
            else:
                # Insert: Novo item
                item = LicitacaoItem(licitacao_id=licitacao_id, **data)
                db_session.add(item)
        
        await db_session.commit()
