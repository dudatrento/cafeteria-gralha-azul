from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ItemCardapio, CategoriaCardapio
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/cardapio", tags=["Cardápio"])


# ─── Schemas ───────────────────────────────────────────────

class CategoriaCreate(BaseModel):
    nome: str
    prioridade: int  # 1=preparo, 2=balcão, 3=bebidas


class ItemCardapioCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float
    categoria_id: int
    imagem_url: Optional[str] = None


class ItemCardapioUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    preco: Optional[float] = None
    categoria_id: Optional[int] = None
    disponivel: Optional[bool] = None
    imagem_url: Optional[str] = None


# ─── Categorias ────────────────────────────────────────────

@router.post("/categorias")
def criar_categoria(dados: CategoriaCreate, db: Session = Depends(get_db)):
    categoria = CategoriaCardapio(**dados.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.get("/categorias")
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(CategoriaCardapio).order_by(CategoriaCardapio.prioridade).all()


# ─── Itens ─────────────────────────────────────────────────

@router.post("/itens")
def criar_item(dados: ItemCardapioCreate, db: Session = Depends(get_db)):
    # Verifica se a categoria existe
    categoria = db.query(CategoriaCardapio).filter(
        CategoriaCardapio.id == dados.categoria_id
    ).first()

    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    item = ItemCardapio(**dados.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/itens")
def listar_itens(db: Session = Depends(get_db)):
    return db.query(ItemCardapio).order_by(ItemCardapio.categoria_id).all()


@router.get("/itens/disponiveis")
def listar_disponiveis(db: Session = Depends(get_db)):
    """Rota pública — usada pelo site da cafeteria."""
    return db.query(ItemCardapio).filter(
        ItemCardapio.disponivel == True
    ).order_by(ItemCardapio.categoria_id).all()


@router.patch("/itens/{item_id}")
def atualizar_item(
    item_id: int,
    dados: ItemCardapioUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(ItemCardapio).filter(ItemCardapio.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    # Atualiza só os campos que foram enviados
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/itens/{item_id}")
def deletar_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ItemCardapio).filter(ItemCardapio.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    db.delete(item)
    db.commit()
    return {"mensagem": f"Item '{item.nome}' removido do cardápio"}