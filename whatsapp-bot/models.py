from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime
from datetime import datetime

from database import Base


class Atendimento(Base):
    __tablename__ = "atendimentos"

    id = Column(Integer, primary_key=True, index=True)

    telefone = Column(String(30), unique=True, nullable=False, index=True)

    nome = Column(String(150), nullable=True)

    valor_conta = Column(Numeric(10, 2), nullable=True)

    aumento_consumo = Column(Text, nullable=True)

    novo_consumo = Column(String(100), nullable=True)

    equipamento = Column(Text, nullable=True)

    cidade = Column(String(100), nullable=True)

    etapa = Column(String(50), nullable=False, default="inicio")

    criado_em = Column(DateTime, default=datetime.utcnow)

    atualizado_em = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    ) 