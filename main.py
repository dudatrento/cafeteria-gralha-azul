from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import pedidos, cardapio, estoque, clientes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gralha Azul API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pedidos.router)
app.include_router(cardapio.router)
app.include_router(estoque.router)
app.include_router(clientes.router)