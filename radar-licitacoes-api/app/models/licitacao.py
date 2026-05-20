from sqlalchemy import Column, String, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Licitacao(Base):
    __tablename__ = "licitacoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_pncp = Column(String, unique=True, index=True, nullable=False)
    orgao_nome = Column(String, nullable=False)
    objeto = Column(Text)
    valor_estimado = Column(Numeric(precision=15, scale=2))
    data_publicacao = Column(DateTime)
    data_fim_propostas = Column(DateTime)
    link_origem = Column(String)
    status = Column(String)
