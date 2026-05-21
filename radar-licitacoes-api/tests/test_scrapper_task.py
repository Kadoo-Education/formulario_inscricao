import pytest
import re
from unittest.mock import patch
from app.services.scrapper_task import sync_pncp_data
from app.models.licitacao import Licitacao

@pytest.mark.asyncio
async def test_sync_pncp_data_orchestration(httpx_mock, db_session):
    # Mock PNCP Response for a chunk
    mock_response = {
        "data": [
            {
                "numeroControlePNCP": "00000000000191-1-000001-2024",
                "orgaoEntidade": {"cnpj": "00000000000191", "razaoSocial": "Orgao Teste"},
                "objetoCompra": "Objeto Teste",
                "valorTotalEstimado": 1000.00,
                "situacaoCompraNome": "Recebendo Propostas",
                "dataPublicacaoPncp": "2024-01-01T10:00:00",
                "dataEncerramentoProposta": "2024-01-10T10:00:00",
                "linkSistemaOrigem": "http://teste.com"
            }
        ],
        "totalPaginas": 1,
        "totalRegistros": 1
    }
    
    # Mock items response
    mock_items = [
        {
            "numeroItem": 1,
            "descricao": "Item 1",
            "quantidade": 10,
            "unidadeMedida": "UN",
            "valorUnitarioEstimado": 100.00,
            "valorTotal": 1000.00
        }
    ]

    # Register mocks using regex
    httpx_mock.add_response(
        url=re.compile(r".*/publicacao.*"),
        json=mock_response
    )
    httpx_mock.add_response(
        url=re.compile(r".*/itens.*"),
        json=mock_items
    )

    # Patch the chunking loop to run only 1 iteration to speed up test
    with patch("app.services.scrapper_task.range", return_value=[0]):
        await sync_pncp_data()

    # Verify if licitacao was saved
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    # We need to eager load itens because the session might be closed or not loading correctly in test
    result = await db_session.execute(select(Licitacao).options(selectinload(Licitacao.itens)))
    licitacoes = result.scalars().all()
    
    assert len(licitacoes) == 1
    assert licitacoes[0].id_pncp == "00000000000191-1-000001-2024"
    
    # Verify items
    assert len(licitacoes[0].itens) == 1
    assert licitacoes[0].itens[0].descricao == "Item 1"
