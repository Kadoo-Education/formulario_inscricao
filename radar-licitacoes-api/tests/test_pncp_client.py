import pytest
import httpx
from app.services.pncp_client import PNCPClient

@pytest.mark.asyncio
async def test_fetch_contratacoes_success(httpx_mock):
    mock_response = {"data": [{"id": "123", "objeto": "Teste"}], "totalPaginas": 1}
    httpx_mock.add_response(json=mock_response)

    async with httpx.AsyncClient() as client:
        pncp_client = PNCPClient(client=client)
        data = await pncp_client.fetch_contratacoes("20240101", "20240102", 1)
        
        assert data == mock_response
        assert len(httpx_mock.get_requests()) == 1

@pytest.mark.asyncio
async def test_fetch_contratacoes_http_error(httpx_mock):
    httpx_mock.add_response(status_code=500)

    async with httpx.AsyncClient() as client:
        pncp_client = PNCPClient(client=client)
        with pytest.raises(httpx.HTTPStatusError):
            await pncp_client.fetch_contratacoes("20240101", "20240102", 1)
