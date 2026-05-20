from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class PNCPOrgao(BaseModel):
    cnpj: str
    razaoSocial: str

class PNCPItem(BaseModel):
    numeroControlePNCP: str
    orgaoEntidade: PNCPOrgao
    objetoCompra: Optional[str] = None
    valorTotalEstimado: Optional[Decimal] = None
    linkSistemaOrigem: Optional[str] = None
    dataPublicacaoPncp: Optional[datetime] = None
    dataEncerramentoProposta: Optional[datetime] = None
    situacaoCompraNome: Optional[str] = None

    def to_licitacao_dict(self) -> dict:
        return {
            "id_pncp": self.numeroControlePNCP,
            "orgao_nome": self.orgaoEntidade.razaoSocial,
            "objeto": self.objetoCompra,
            "valor_estimado": self.valorTotalEstimado,
            "link_origem": self.linkSistemaOrigem,
            "data_publicacao": self.dataPublicacaoPncp,
            "data_fim_propostas": self.dataEncerramentoProposta,
            "status": self.situacaoCompraNome
        }

class PNCPResponse(BaseModel):
    data: List[PNCPItem]
    totalPaginas: int
    totalRegistros: int
