# Gralha Azul ☕

> **PT** | [EN](#gralha-azul-en)

Sistema interno de gestão para a cafeteria fictícia Gralha Azul — projeto fullstack construído com FastAPI (Python) no backend e HTML/CSS/JavaScript no frontend.

## Sobre o projeto

A Gralha Azul é uma cafeteria fictícia curitibana. Este repositório contém dois módulos:

- **Site público** — página da cafeteria com cardápio dinâmico (HTML/CSS)
- **Painel interno** — sistema de gestão para funcionários, com controle de pedidos, estoque, cardápio e clientes

O projeto foi desenvolvido como portfólio prático de desenvolvimento backend e fullstack, com foco em modelagem de dados, construção de APIs REST e integração frontend-backend.

## Funcionalidades

**Gestão de pedidos**
- Visualização de pedidos do dia com filtros por status e tipo
- Fila de preparo ordenada por prioridade de categoria (preparo → balcão → bebidas)
- Ciclo completo de status: pendente → em preparo → pronto → entregue
- Suporte a pedidos de consumo local e delivery
- Registro de pagamento (dinheiro, cartão, Pix)

**Controle de estoque**
- Cadastro de itens com quantidade mínima configurável
- Alertas visuais automáticos para itens abaixo do mínimo
- Registro de reposição e consumo

**Cardápio**
- Gerenciamento de categorias com prioridade de preparo
- Ativar/desativar disponibilidade de itens em tempo real
- Atualização de preços pelo painel
- Endpoint público para o site da cafeteria

**Clientes**
- Cadastro leve para pedidos delivery
- Busca por telefone

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| Banco de dados | SQLite (desenvolvimento) |
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Servidor | Uvicorn |

## Estrutura do projeto

```
gralha-azul/
├── backend/
│   └── gralha-azul-api/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       └── routers/
│           ├── pedidos.py
│           ├── cardapio.py
│           ├── estoque.py
│           └── clientes.py
└── frontend/
    └── painel/
        ├── index.html
        ├── css/
        │   └── painel.css
        └── js/
            ├── api.js
            ├── pedidos.js
            ├── fila.js
            ├── estoque.js
            ├── clientes.js
            ├── cardapio.js
            └── nav.js
```

## Como rodar localmente

**Pré-requisitos:** Python 3.10+

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/gralha-azul.git
cd gralha-azul/backend/gralha-azul-api

# 2. Instale as dependências
pip install fastapi uvicorn sqlalchemy

# 3. Inicie o servidor
uvicorn main:app --reload
```

A API estará disponível em `http://127.0.0.1:8000`.
A documentação interativa estará em `http://127.0.0.1:8000/docs`.

**Para o painel frontend:**

```bash
cd frontend/painel
python -m http.server 5500
```

Acesse `http://localhost:5500`.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/pedidos/hoje` | Pedidos do dia |
| GET | `/pedidos/fila` | Fila de preparo ordenada |
| PATCH | `/pedidos/{id}/status` | Atualizar status |
| GET | `/cardapio/itens/disponiveis` | Cardápio público |
| GET | `/estoque/alertas` | Itens abaixo do mínimo |

## Modelo de dados

```
categorias_cardapio
        │
        ▼
 itens_cardapio ──────────────┐
                              ▼
clientes ──────────► pedidos ◄──── itens_pedido

estoque  (independente)
```

---

---

# Gralha Azul (EN)

> [PT](#gralha-azul-) | **EN**

Internal management system for Gralha Azul, a fictional coffee shop based in Curitiba, Brazil — a fullstack project built with FastAPI (Python) on the backend and vanilla HTML/CSS/JavaScript on the frontend.

## About

Gralha Azul is a fictional café. This repository contains two modules:

- **Public website** — café landing page with a dynamic menu (HTML/CSS)
- **Internal dashboard** — staff management panel for orders, inventory, menu, and customers

The project was built as a practical fullstack portfolio piece, focusing on data modeling, REST API development, and frontend-backend integration.

## Features

**Order management**
- Daily order view with filters by status and type
- Preparation queue sorted by category priority (hot food → counter items → beverages)
- Full status lifecycle: pending → in preparation → ready → delivered
- Support for dine-in and delivery orders
- Payment tracking (cash, card, Pix)

**Inventory control**
- Item registry with configurable minimum stock levels
- Automatic visual alerts for low-stock items
- Restock and consumption logging

**Menu management**
- Category management with preparation priority
- Toggle item availability in real time
- Price updates via dashboard
- Public endpoint consumed by the café website

**Customers**
- Lightweight customer registration for delivery orders
- Phone number search

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (development) |
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Server | Uvicorn |

## Project structure

```
gralha-azul/
├── backend/
│   └── gralha-azul-api/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       └── routers/
│           ├── pedidos.py
│           ├── cardapio.py
│           ├── estoque.py
│           └── clientes.py
└── frontend/
    └── painel/
        ├── index.html
        ├── css/
        │   └── painel.css
        └── js/
            ├── api.js
            ├── pedidos.js
            ├── fila.js
            ├── estoque.js
            ├── clientes.js
            ├── cardapio.js
            └── nav.js
```

## Running locally

**Requirements:** Python 3.10+

```bash
# 1. Clone the repository
git clone https://github.com/your-username/gralha-azul.git
cd gralha-azul/backend/gralha-azul-api

# 2. Install dependencies
pip install fastapi uvicorn sqlalchemy

# 3. Start the server
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.  
Interactive API docs at `http://127.0.0.1:8000/docs`.

**For the frontend panel:**

```bash
cd frontend/painel
python -m http.server 5500
```

Open `http://localhost:5500`.

## Key endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/pedidos/hoje` | Today's orders |
| GET | `/pedidos/fila` | Sorted preparation queue |
| PATCH | `/pedidos/{id}/status` | Update order status |
| GET | `/cardapio/itens/disponiveis` | Public menu endpoint |
| GET | `/estoque/alertas` | Low-stock alerts |

## Data model

```
categorias_cardapio
        │
        ▼
 itens_cardapio ──────────────┐
                              ▼
clientes ──────────► pedidos ◄──── itens_pedido

estoque  (standalone)
```

---

*Desenvolvido por / Developed by [Maria Eduarda](https://github.com/dudatrento)*
