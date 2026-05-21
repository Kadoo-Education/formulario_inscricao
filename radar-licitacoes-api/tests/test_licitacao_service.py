import pytest
from app.services.licitacao_service import LicitacaoService
from app.models.licitacao import Licitacao
from sqlalchemy.future import select
from decimal import Decimal

@pytest.mark.asyncio
async def test_upsert_licitacoes_insert(db_session):
    data = [
        {
            "id_pncp": "123456",
            "orgao_nome": "Orgao Teste",
            "objeto": "Objeto Teste",
            "valor_estimado": Decimal("1000.00"),
            "status": "ABERTA"
        }
    ]
    
    await LicitacaoService.upsert_licitacoes(db_session, data)
    
    query = select(Licitacao).where(Licitacao.id_pncp == "123456")
    result = await db_session.execute(query)
    licitacao = result.scalar_one_or_none()
    
    assert licitacao is not None
    assert licitacao.orgao_nome == "Orgao Teste"
    assert licitacao.valor_estimado == Decimal("1000.00")

@pytest.mark.asyncio
async def test_upsert_licitacoes_update(db_session):
    # Initial insert
    data_initial = [
        {
            "id_pncp": "789012",
            "orgao_nome": "Orgao Original",
            "objeto": "Objeto Original",
            "valor_estimado": Decimal("2000.00"),
            "status": "ABERTA"
        }
    ]
    await LicitacaoService.upsert_licitacoes(db_session, data_initial)
    
    # Update
    data_update = [
        {
            "id_pncp": "789012",
            "orgao_nome": "Orgao Atualizado",
            "objeto": "Objeto Atualizado",
            "valor_estimado": Decimal("2500.00"),
            "status": "ENCERRADA"
        }
    ]
    await LicitacaoService.upsert_licitacoes(db_session, data_update)
    
    query = select(Licitacao).where(Licitacao.id_pncp == "789012")
    result = await db_session.execute(query)
    licitacao = result.scalar_one_or_none()
    
    assert licitacao is not None
    assert licitacao.orgao_nome == "Orgao Atualizado"
    assert licitacao.objeto == "Objeto Atualizado"
    assert licitacao.valor_estimado == Decimal("2500.00")
    assert licitacao.status == "ENCERRADA"

@pytest.mark.asyncio
async def test_upsert_licitacoes_multiple(db_session):
    data = [
        {
            "id_pncp": "PNCP1",
            "orgao_nome": "Orgao 1",
            "status": "ABERTA"
        },
        {
            "id_pncp": "PNCP2",
            "orgao_nome": "Orgao 2",
            "status": "ABERTA"
        }
    ]
    
    await LicitacaoService.upsert_licitacoes(db_session, data)
    
    query = select(Licitacao)
    result = await db_session.execute(query)
    licitacoes = result.scalars().all()
    
    # Filter by our test IDs since there might be other data in the DB
    ids = [l.id_pncp for l in licitacoes]
    assert "PNCP1" in ids
    assert "PNCP2" in ids

@pytest.mark.asyncio
async def test_upsert_licitacoes_history(db_session):
    from app.models.licitacao import LicitacaoHistorico
    from sqlalchemy.orm import selectinload
    
    # Initial
    data_initial = [{"id_pncp": "HIST1", "orgao_nome": "Orgao", "status": "ABERTA"}]
    await LicitacaoService.upsert_licitacoes(db_session, data_initial)
    
    # Change status
    data_update = [{"id_pncp": "HIST1", "orgao_nome": "Orgao", "status": "ENCERRADA"}]
    await LicitacaoService.upsert_licitacoes(db_session, data_update)
    
    # Verify history
    query = select(Licitacao).where(Licitacao.id_pncp == "HIST1").options(selectinload(Licitacao.historico))
    result = await db_session.execute(query)
    licitacao = result.scalar_one()
    
    assert len(licitacao.historico) == 1
    assert licitacao.historico[0].status_anterior == "ABERTA"
    assert licitacao.historico[0].status_novo == "ENCERRADA"

@pytest.mark.asyncio
async def test_upsert_itens(db_session):
    from sqlalchemy.orm import selectinload
    
    # Create licitacao first
    licitacoes = await LicitacaoService.upsert_licitacoes(db_session, [{"id_pncp": "ITEM1", "orgao_nome": "Orgao"}])
    lic_id = licitacoes[0].id
    
    # Insert items
    itens_data = [
        {"numero_item": 1, "descricao": "Item 1", "quantidade": Decimal("10.0")},
        {"numero_item": 2, "descricao": "Item 2", "quantidade": Decimal("5.0")}
    ]
    await LicitacaoService.upsert_itens(db_session, lic_id, itens_data)
    
    # Update item 1 and add item 3
    itens_update = [
        {"numero_item": 1, "descricao": "Item 1 Updated"},
        {"numero_item": 3, "descricao": "Item 3"}
    ]
    await LicitacaoService.upsert_itens(db_session, lic_id, itens_update)
    
    # Verify
    query = select(Licitacao).where(Licitacao.id == lic_id).options(selectinload(Licitacao.itens))
    result = await db_session.execute(query)
    licitacao = result.scalar_one()
    
    assert len(licitacao.itens) == 3
    item1 = next(i for i in licitacao.itens if i.numero_item == 1)
    assert item1.descricao == "Item 1 Updated"
    assert item1.quantidade == Decimal("10.0") # Preserved
