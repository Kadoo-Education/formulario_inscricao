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

    async def fetch_contratacoes(self, data_inicial: str, data_final: str, pagina: int = 1, uf: str = None):
        # Usando o endpoint de publicacao que sabemos que é estável
        url = f"{self.base_url}/publicacao" 
        params = {
            "dataInicial": data_inicial,
            "dataFinal": data_final,
            "codigoModalidadeContratacao": self.MODALIDADE_DISPENSA,
            "pagina": pagina
        }
        if uf:
            params["uf"] = uf

        headers = {"User-Agent": "RadarLicitacoes/1.0"}
        
        try:
            response = await self.client.get(url, params=params, headers=headers)
            
            # Se a API retornar 204 (No Content), significa que não há resultados.
            if response.status_code == 204:
                return {"data": [], "totalPaginas": 0, "totalRegistros": 0}
                
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while fetching from PNCP: {e.response.status_code} - {e.response.text}")
            raise
        except httpx.HTTPError as e:
            logger.error(f"An error occurred while making request to PNCP: {str(e)}")
            raise

    async def fetch_itens(self, cnpj: str, ano: str, sequencial: str, pagina: int = 1):
        """
        Busca os itens de uma compra específica.
        URL pattern: https://pncp.gov.br/api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens
        """
        url = f"https://pncp.gov.br/api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens"
        params = {"pagina": pagina}
        headers = {
            "User-Agent": "RadarLicitacoes/1.0",
            "Accept": "application/json"
        }
        
        try:
            response = await self.client.get(url, params=params, headers=headers)
            
            if response.status_code == 204:
                return []
                
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Error fetching items for {cnpj}/{ano}/{sequencial}: {str(e)}")
            raise
