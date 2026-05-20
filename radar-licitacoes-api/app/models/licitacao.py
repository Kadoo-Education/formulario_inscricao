import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Text, Numeric, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Licitacao(Base):
    __tablename__ = "licitacoes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_pncp: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    orgao_nome: Mapped[str] = mapped_column(String, nullable=False)
    objeto: Mapped[Optional[str]] = mapped_column(Text)
    valor_estimado: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    data_publicacao: Mapped[Optional[datetime]] = mapped_column(DateTime)
    data_fim_propostas: Mapped[Optional[datetime]] = mapped_column(DateTime)
    link_origem: Mapped[Optional[str]] = mapped_column(String)
    status: Mapped[Optional[str]] = mapped_column(String)

    # Relationships
    itens: Mapped[List["LicitacaoItem"]] = relationship("LicitacaoItem", back_populates="licitacao", cascade="all, delete-orphan")
    historico: Mapped[List["LicitacaoHistorico"]] = relationship("LicitacaoHistorico", back_populates="licitacao", cascade="all, delete-orphan")

class LicitacaoItem(Base):
    __tablename__ = "licitacao_itens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    licitacao_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("licitacoes.id"), nullable=False)
    numero_item: Mapped[int] = mapped_column(Integer, nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text)
    quantidade: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 4))
    unidade_medida: Mapped[Optional[str]] = mapped_column(String)
    valor_unitario: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    valor_total: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    
    licitacao: Mapped["Licitacao"] = relationship("Licitacao", back_populates="itens")

class LicitacaoHistorico(Base):
    __tablename__ = "licitacao_historico"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    licitacao_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("licitacoes.id"), nullable=False)
    status_anterior: Mapped[Optional[str]] = mapped_column(String)
    status_novo: Mapped[str] = mapped_column(String, nullable=False)
    data_mudanca: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    licitacao: Mapped["Licitacao"] = relationship("Licitacao", back_populates="historico")
