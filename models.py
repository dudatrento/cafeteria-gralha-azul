from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    telefone = Column(String, nullable=False)  # string, não int
    endereco = Column(String, nullable=False)
    criado_em = Column(DateTime, server_default=func.now())

    # Um cliente pode ter vários pedidos
    pedidos = relationship("Pedido", back_populates="cliente")


class CategoriaCardapio(Base):
    __tablename__ = "categorias_cardapio"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    prioridade = Column(Integer, nullable=False)  # 1=preparo, 2=balcão, 3=bebidas

    itens = relationship("ItemCardapio", back_populates="categoria")


class ItemCardapio(Base):
    __tablename__ = "itens_cardapio"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(Text)
    preco = Column(Float, nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias_cardapio.id"), nullable=False)
    disponivel = Column(Boolean, default=True)
    imagem_url = Column(String)

    categoria = relationship("CategoriaCardapio", back_populates="itens")
    itens_pedido = relationship("ItemPedido", back_populates="item_cardapio")


class Estoque(Base):
    __tablename__ = "estoque"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    quantidade_atual = Column(Float, nullable=False)
    unidade = Column(String, nullable=False)  # "kg", "g", "litro", "unidade"
    quantidade_minima = Column(Float, nullable=False)


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)           # "local" ou "delivery"
    status = Column(String, default="pendente")     # "pendente", "em_preparo", "pronto", "entregue"
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=True)  # nullable — só delivery
    forma_pagamento = Column(String)                # "dinheiro", "cartao", "pix"
    pago = Column(Boolean, default=False)
    observacoes = Column(Text)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())

    cliente = relationship("Cliente", back_populates="pedidos")
    itens = relationship("ItemPedido", back_populates="pedido")


class ItemPedido(Base):
    __tablename__ = "itens_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    item_cardapio_id = Column(Integer, ForeignKey("itens_cardapio.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    preco_unitario = Column(Float, nullable=False)  # float, não int

    pedido = relationship("Pedido", back_populates="itens")
    item_cardapio = relationship("ItemCardapio", back_populates="itens_pedido")