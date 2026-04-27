from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Estoque
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/estoque", tags=["Estoque"])


# ─── Schemas ───────────────────────────────────────────────

class EstoqueCreate(BaseModel):
    nome: str
    quantidade_atual: float
    unidade: str          # "kg", "g", "litro", "unidade"
    quantidade_minima: float


class EstoqueUpdate(BaseModel):
    quantidade_atual: Optional[float] = None
    quantidade_minima: Optional[float] = None
    unidade: Optional[str] = None


class EntradaEstoque(BaseModel):
    quantidade: float     # quanto está sendo reposto


# ─── Endpoints ─────────────────────────────────────────────

@router.post("/")
def criar_item_estoque(dados: EstoqueCreate, db: Session = Depends(get_db)):
    item = Estoque(**dados.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/")
def listar_estoque(db: Session = Depends(get_db)):
    return db.query(Estoque).order_by(Estoque.nome).all()


@router.get("/alertas")
def itens_abaixo_do_minimo(db: Session = Depends(get_db)):
    """
    Retorna apenas os itens que precisam de reposição.
    Essa é a rota que o painel vai mostrar em destaque.
    """
    itens = db.query(Estoque).filter(
        Estoque.quantidade_atual <= Estoque.quantidade_minima
    ).all()

    if not itens:
        return {"mensagem": "Estoque ok — nenhum item abaixo do mínimo"}

    return itens


@router.patch("/{item_id}/repor")
def repor_estoque(
    item_id: int,
    dados: EntradaEstoque,
    db: Session = Depends(get_db)
):
    """
    Registra uma entrada de estoque — soma à quantidade atual.
    """
    item = db.query(Estoque).filter(Estoque.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    item.quantidade_atual += dados.quantidade
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}/consumir")
def consumir_estoque(
    item_id: int,
    dados: EntradaEstoque,
    db: Session = Depends(get_db)
):
    """
    Registra saída de estoque — subtrai da quantidade atual.
    Útil pra registrar uso manual ou desperdício.
    """
    item = db.query(Estoque).filter(Estoque.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    if dados.quantidade > item.quantidade_atual:
        raise HTTPException(
            status_code=400,
            detail=f"Quantidade insuficiente — estoque atual: {item.quantidade_atual} {item.unidade}"
        )

    item.quantidade_atual -= dados.quantidade
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}")
def atualizar_item_estoque(
    item_id: int,
    dados: EstoqueUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(Estoque).filter(Estoque.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def deletar_item_estoque(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Estoque).filter(Estoque.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    db.delete(item)
    db.commit()
    return {"mensagem": f"'{item.nome}' removido do estoque"}