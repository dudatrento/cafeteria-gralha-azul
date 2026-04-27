from fastapi import FastAPI
from database import engine, Base
from routers import pedidos, cardapio, estoque, clientes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gralha Azul API")

app.include_router(pedidos.router)
app.include_router(cardapio.router)
app.include_router(estoque.router)
app.include_router(clientes.router)