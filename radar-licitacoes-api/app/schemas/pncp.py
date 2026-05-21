from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

def extract_pncp_identifiers(id_pncp: Optional[str]) -> Optional[dict]:
    if not id_pncp:
        return None
        
    parts = id_pncp.split("-")
    if len(parts) == 4:
        cnpj = parts[0]
        # Padrão PNCP: CNPJ-MODALIDADE-ANO-SEQUENCIAL ou CNPJ-MODALIDADE-SEQUENCIAL-ANO
        # Identificamos o ano como a parte com 4 dígitos.
        if len(parts[3]) == 4 and parts[3].isdigit():
            ano = parts[3]
            sequencial = parts[2]
        elif len(parts[2]) == 4 and parts[2].isdigit():
            ano = parts[2]
            sequencial = parts[3]
        else:
            ano = parts[3]
            sequencial = parts[2]
        return {"cnpj": cnpj, "ano": ano, "sequencial": sequencial}
        
    return None

class PNCPOrgao(BaseModel):

    cnpj: str
    razaoSocial: str

class PNCPItem(BaseModel):
    numeroControlePNCP: Optional[str] = None
    orgaoEntidade: Optional[PNCPOrgao] = None
    objetoCompra: Optional[str] = None
    valorTotalEstimado: Optional[Decimal] = None
    linkSistemaOrigem: Optional[str] = None
    dataPublicacaoPncp: Optional[datetime] = None
    dataEncerramentoProposta: Optional[datetime] = None
    situacaoCompraNome: Optional[str] = None

    def to_licitacao_dict(self) -> dict:
        return {
            "id_pncp": self.numeroControlePNCP,
            "orgao_nome": self.orgaoEntidade.razaoSocial if self.orgaoEntidade else "Órgão não identificado",
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
