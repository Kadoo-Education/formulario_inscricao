import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime
from app.services.scrapper_task import sync_pncp_data
from app.models.licitacao import Licitacao

@pytest.mark.asyncio
async def test_sync_pncp_data_empty_db(httpx_mock):
    # Mock PNCP API response
    mock_response = {
        "data": [
            {
                "numeroControlePNCP": "12345",
                "orgaoEntidade": {"cnpj": "123", "razaoSocial": "Orgao Teste"},
                "objetoCompra": "Objeto Teste",
                "valorTotalEstimado": 1000.0,
                "linkSistemaOrigem": "http://teste.com",
                "dataPublicacaoPncp": "2024-05-20T00:00:00",
                "dataEncerramentoProposta": "2024-05-23T00:00:00",
                "situacaoCompraNome": "Divulgada"
            }
        ],
        "totalPaginas": 1,
        "totalRegistros": 1
    }
    httpx_mock.add_response(json=mock_response)

    # Mock DB session and service
    with patch("app.services.scrapper_task.AsyncSessionLocal") as mock_session_local:
        mock_session = AsyncMock()
        mock_session_local.return_value.__aenter__.return_value = mock_session
        
        # Mocking the query to check if DB is empty
        mock_result = MagicMock()
        mock_result.scalar.return_value = None
        mock_session.execute.return_value = mock_result

        with patch("app.services.scrapper_task.LicitacaoService") as mock_service_class:
            mock_service = AsyncMock()
            mock_service_class.return_value = mock_service
            
            await sync_pncp_data()
            
            # Verify if upsert was called with mapped data
            assert mock_service.upsert_licitacoes.called
            args, _ = mock_service.upsert_licitacoes.call_args
            assert args[1][0]["id_pncp"] == "12345"
            assert args[1][0]["orgao_nome"] == "Orgao Teste"
