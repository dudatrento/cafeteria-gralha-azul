from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Cliente
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/clientes", tags=["Clientes"])


# ─── Schemas ───────────────────────────────────────────────

class ClienteCreate(BaseModel):
    nome: str
    telefone: str
    endereco: str


class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None


# ─── Endpoints ─────────────────────────────────────────────

@router.post("/")
def criar_cliente(dados: ClienteCreate, db: Session = Depends(get_db)):
    cliente = Cliente(**dados.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.get("/")
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(Cliente).order_by(Cliente.nome).all()


@router.get("/{cliente_id}")
def buscar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente


@router.get("/buscar/{telefone}")
def buscar_por_telefone(telefone: str, db: Session = Depends(get_db)):
    """
    Busca cliente pelo telefone — útil na hora de registrar
    um pedido delivery sem precisar lembrar o ID.
    """
    cliente = db.query(Cliente).filter(Cliente.telefone == telefone).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente


@router.patch("/{cliente_id}")
def atualizar_cliente(
    cliente_id: int,
    dados: ClienteUpdate,
    db: Session = Depends(get_db)
):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(cliente, campo, valor)

    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{cliente_id}")
def deletar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    db.delete(cliente)
    db.commit()
    return {"mensagem": f"Cliente '{cliente.nome}' removido"}