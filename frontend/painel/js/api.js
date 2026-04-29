const API_BASE = 'http://127.0.0.1:8000';

async function apiFetch(rota, opcoes = {}) {
  const res = await fetch(`${API_BASE}${rota}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    throw new Error(erro.detail || `Erro ${res.status}`);
  }

  return res.json();
}

// pedidos
const api = {
  pedidos: {
    hoje: () => apiFetch('/pedidos/hoje'),
    fila: () => apiFetch('/pedidos/fila'),
    atualizarStatus: (id, status) =>
      apiFetch(`/pedidos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    registrarPagamento: (id, forma_pagamento = 'pix') =>
      apiFetch(`/pedidos/${id}/pagamento`, {
        method: 'PATCH',
        body: JSON.stringify({ forma_pagamento, pago: true }),
      }),
  },
  cardapio: {
    itens: () => apiFetch('/cardapio/itens'),
    categorias: () => apiFetch('/cardapio/categorias'),
  },
  estoque: {
    listar: () => apiFetch('/estoque/'),
    alertas: () => apiFetch('/estoque/alertas'),
    repor: (id, quantidade) =>
      apiFetch(`/estoque/${id}/repor`, {
        method: 'PATCH',
        body: JSON.stringify({ quantidade }),
      }),
  },
  clientes: {
    buscarPorTelefone: (tel) => apiFetch(`/clientes/buscar/${tel}`),
    criar: (dados) =>
      apiFetch('/clientes/', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),
  },
  cardapio: {
    itens: () => apiFetch('/cardapio/itens'),
    categorias: () => apiFetch('/cardapio/categorias'),
    criarItem: (dados) =>
        apiFetch('/cardapio/itens', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),
    atualizarItem: (id, dados) =>
        apiFetch(`/cardapio/itens/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dados),
      }),
},
};