from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, cast, Date
from database import get_db
from models import Pedido, ItemPedido, ItemCardapio
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


# Schema de um item dentro do pedido
class ItemPedidoSchema(BaseModel):
    item_cardapio_id: int
    quantidade: int


# Schema para criar um pedido novo
class PedidoCreate(BaseModel):
    tipo: str                        # "local" ou "delivery"
    cliente_id: Optional[int] = None # só obrigatório se delivery
    forma_pagamento: Optional[str] = None
    observacoes: Optional[str] = None
    itens: list[ItemPedidoSchema]    # lista de itens do pedido


# Schema para atualizar status
class PedidoStatusUpdate(BaseModel):
    status: str  # "pendente", "em_preparo", "pronto", "entregue"


# Schema para atualizar pagamento
class PedidoPagamentoUpdate(BaseModel):
    forma_pagamento: str
    pago: bool

@router.post("/")
def criar_pedido(dados: PedidoCreate, db: Session = Depends(get_db)):
    # Valida: se for delivery, precisa ter cliente
    if dados.tipo == "delivery" and not dados.cliente_id:
        raise HTTPException(
            status_code=400,
            detail="Pedidos delivery precisam ter um cliente cadastrado"
        )

    # Cria o pedido
    pedido = Pedido(
        tipo=dados.tipo,
        cliente_id=dados.cliente_id,
        forma_pagamento=dados.forma_pagamento,
        observacoes=dados.observacoes,
        status="pendente"
    )
    db.add(pedido)
    db.flush()  # gera o ID do pedido sem commitar ainda

    # Adiciona os itens ao pedido
    for item_dados in dados.itens:
        # Busca o item no cardápio pra pegar o preço atual
        item_cardapio = db.query(ItemCardapio).filter(
            ItemCardapio.id == item_dados.item_cardapio_id
        ).first()

        if not item_cardapio:
            raise HTTPException(
                status_code=404,
                detail=f"Item {item_dados.item_cardapio_id} não encontrado no cardápio"
            )

        if not item_cardapio.disponivel:
            raise HTTPException(
                status_code=400,
                detail=f"Item '{item_cardapio.nome}' não está disponível"
            )

        item_pedido = ItemPedido(
            pedido_id=pedido.id,
            item_cardapio_id=item_dados.item_cardapio_id,
            quantidade=item_dados.quantidade,
            preco_unitario=item_cardapio.preco  # salva o preço do momento
        )
        db.add(item_pedido)

    db.commit()
    db.refresh(pedido)
    return pedido

@router.get("/hoje")
def pedidos_do_dia(db: Session = Depends(get_db)):
    hoje = datetime.now().date().isoformat()  # ex: "2026-04-27"

    pedidos = db.query(Pedido).filter(
        Pedido.criado_em.like(f"{hoje}%")
    ).options(
        joinedload(Pedido.itens).joinedload(ItemPedido.item_cardapio)
        .joinedload(ItemCardapio.categoria)
    ).all()

    return pedidos


@router.get("/fila")
def fila_de_preparo(db: Session = Depends(get_db)):
    hoje = datetime.now().date().isoformat()

    pedidos = db.query(Pedido).filter(
        Pedido.criado_em.like(f"{hoje}%"),
        Pedido.status.in_(["pendente", "em_preparo"])
    ).options(
        joinedload(Pedido.itens).joinedload(ItemPedido.item_cardapio)
        .joinedload(ItemCardapio.categoria)
    ).order_by(Pedido.criado_em).all()

    for pedido in pedidos:
        pedido.itens.sort(
            key=lambda i: i.item_cardapio.categoria.prioridade
            if i.item_cardapio and i.item_cardapio.categoria else 99
        )

    return pedidos

@router.patch("/{pedido_id}/status")
def atualizar_status(
    pedido_id: int,
    dados: PedidoStatusUpdate,
    db: Session = Depends(get_db)
):
    status_validos = ["pendente", "em_preparo", "pronto", "entregue"]
    if dados.status not in status_validos:
        raise HTTPException(status_code=400, detail="Status inválido")

    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    pedido.status = dados.status
    db.commit()
    db.refresh(pedido)
    return pedido


@router.patch("/{pedido_id}/pagamento")
def atualizar_pagamento(
    pedido_id: int,
    dados: PedidoPagamentoUpdate,
    db: Session = Depends(get_db)
):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    pedido.forma_pagamento = dados.forma_pagamento
    pedido.pago = dados.pago
    db.commit()
    db.refresh(pedido)
    return pedido


@router.get("/{pedido_id}")
def buscar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).options(
        joinedload(Pedido.itens).joinedload(ItemPedido.item_cardapio)
    ).filter(Pedido.id == pedido_id).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    return pedido