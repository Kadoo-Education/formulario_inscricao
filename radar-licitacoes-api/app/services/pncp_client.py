import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class PNCPClient:
    MODALIDADE_DISPENSA = 8

    def __init__(self, client: Optional[httpx.AsyncClient] = None):
        self.base_url = settings.PNCP_API_BASE_URL
        self.client = client or httpx.AsyncClient(timeout=30.0)

    async def fetch_contratacoes(self, data_inicial: str, data_final: str, pagina: int = 1) -> Dict[str, Any]:
        url = f"{self.base_url}/publicacao"
        params = {
            "dataInicial": data_inicial,
            "dataFinal": data_final,
            "codigoModalidadeContratacao": self.MODALIDADE_DISPENSA,
            "pagina": pagina
        }
        headers = {"User-Agent": "RadarLicitacoes/1.0"}
        
        try:
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while fetching from PNCP: {e.response.status_code} - {e.response.text}")
            raise
        except httpx.HTTPError as e:
            logger.error(f"An error occurred while making request to PNCP: {str(e)}")
            raise
