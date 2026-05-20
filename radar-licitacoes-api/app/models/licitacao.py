from sqlalchemy import String, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal
from app.core.database import Base

class Licitacao(Base):
    __tablename__ = "licitacoes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_pncp: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    orgao_nome: Mapped[str] = mapped_column(String, nullable=False)
    objeto: Mapped[Optional[str]] = mapped_column(Text)
    valor_estimado: Mapped[Optional[Decimal]] = mapped_column(Numeric(precision=15, scale=2))
    data_publicacao: Mapped[Optional[datetime]] = mapped_column(DateTime)
    data_fim_propostas: Mapped[Optional[datetime]] = mapped_column(DateTime)
    link_origem: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[Optional[str]] = mapped_column(String)
