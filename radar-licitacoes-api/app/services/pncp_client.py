import httpx
from app.core.config import settings

class PNCPClient:
    def __init__(self):
        self.base_url = settings.PNCP_API_BASE_URL

    async def fetch_contratacoes(self, data_inicial: str, data_final: str, pagina: int = 1):
        # A URL base já termina em /v1/contratacoes de acordo com o .env.example
        url = f"{self.base_url}/publicacao"
        params = {
            "dataInicial": data_inicial,
            "dataFinal": data_final,
            "codigoModalidadeContratacao": 8, # Dispensa de Licitação
            "pagina": pagina
        }
        async with httpx.AsyncClient() as client:
            headers = {"User-Agent": "RadarLicitacoes/1.0"}
            response = await client.get(url, params=params, timeout=30.0, headers=headers)
            response.raise_for_status()
            return response.json()
