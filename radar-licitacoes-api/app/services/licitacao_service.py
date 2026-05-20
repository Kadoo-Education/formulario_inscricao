from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.licitacao import Licitacao

class LicitacaoService:
    @staticmethod
    async def upsert_licitacoes(db_session: AsyncSession, licitacoes_data: list[dict]):
        for data in licitacoes_data:
            # Identificador Único: id_pncp
            query = select(Licitacao).where(Licitacao.id_pncp == data['id_pncp'])
            result = await db_session.execute(query)
            licitacao = result.scalar_one_or_none()

            if licitacao:
                # Update: Atualiza todos os campos fornecidos
                for key, value in data.items():
                    setattr(licitacao, key, value)
            else:
                # Insert: Novo registro
                licitacao = Licitacao(**data)
                db_session.add(licitacao)
        
        await db_session.commit()
