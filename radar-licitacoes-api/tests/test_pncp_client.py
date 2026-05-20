import pytest
from app.services.pncp_client import PNCPClient

@pytest.mark.asyncio
async def test_fetch_contratacoes_success():
    client = PNCPClient()
    # Testando com uma data fixa do passado para garantir retorno ou sucesso na chamada
    # Use datas no formato AAAAMMDD
    data = await client.fetch_contratacoes("20240101", "20240102", 1)
    assert isinstance(data, dict)
    assert "data" in data
