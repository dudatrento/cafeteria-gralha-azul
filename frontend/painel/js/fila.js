const filaStatusLabel = {
  pendente: 'pendente',
  em_preparo: 'em preparo',
};

const filaStatusNext = {
  pendente: 'em_preparo',
  em_preparo: 'pronto',
};

const filaStatusNextLabel = {
  pendente: 'iniciar',
  em_preparo: 'pronto',
};

let pedidosFila = [];

// ── renderização ─────────────────────────────────────────
function renderFila() {
  const container = document.getElementById('ga-fila');

  if (!pedidosFila.length) {
    container.innerHTML = '<div class="ga-empty">nenhum pedido em aberto</div>';
    return;
  }

  container.innerHTML = pedidosFila.map(p => {
    const statusBadge = `<span class="ga-badge badge-${p.status}">
      ${filaStatusLabel[p.status] || p.status}
    </span>`;

    const tipoBadge = `<span class="ga-badge badge-${p.tipo}">${p.tipo}</span>`;

    // agrupa itens por categoria e ordena pela prioridade
    const itensSorted = [...(p.itens || [])].sort((a, b) => {
      const pa = a.item_cardapio?.categoria?.prioridade ?? 99;
      const pb = b.item_cardapio?.categoria?.prioridade ?? 99;
      return pa - pb;
    });

    const itensHtml = itensSorted.length
      ? itensSorted.map(i => {
          const nome = i.item_cardapio?.nome ?? `item #${i.item_cardapio_id}`;
          const catId = i.item_cardapio?.categoria_id;
          const [catNome, catClass] = catInfo[catId] || ['', ''];
          const catTag = catNome
            ? `<span class="ga-item-cat ${catClass}">${catNome}</span>` : '';
          return `<li class="fila-item">
            <span class="fila-item-qtd">${i.quantidade}×</span>
            <span class="fila-item-nome">${nome}${catTag}</span>
          </li>`;
        }).join('')
      : '<li class="fila-item" style="color:#5a4e3e">sem itens</li>';

    const obsHtml = p.observacoes
      ? `<div class="ga-obs">${p.observacoes}</div>` : '';

    const nextStatus = filaStatusNext[p.status];
    const btnAvancar = nextStatus
      ? `<button class="ga-btn primary fila-btn-avancar"
           onclick="avancarStatusFila(${p.id}, '${nextStatus}')">
           ${filaStatusNextLabel[p.status]}
         </button>`
      : '';

    return `
      <div class="ga-card fila-card" id="fila-card-${p.id}">
        <div class="ga-card-header">
          <div class="ga-card-id">
            <strong>#${p.id}</strong> ${tipoBadge}
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            ${statusBadge}
            <span class="ga-hora">${hora(p.criado_em)}</span>
          </div>
        </div>
        <div class="ga-card-body">
          <ul class="ga-itens fila-itens">${itensHtml}</ul>
          ${obsHtml}
        </div>
        <div class="ga-card-footer">
          ${btnAvancar}
        </div>
      </div>`;
  }).join('');
}

// ── ações ────────────────────────────────────────────────
async function carregarFila() {
  const container = document.getElementById('ga-fila');
  container.innerHTML = '<div class="ga-loading">carregando fila...</div>';
  try {
    pedidosFila = await api.pedidos.fila();
    renderFila();
  } catch (e) {
    container.innerHTML = `<div class="ga-empty">
      erro ao carregar fila<br>
      <small style="color:#3a2e1e;font-size:10px;">${e.message}</small>
    </div>`;
  }
}

async function avancarStatusFila(id, novoStatus) {
  try {
    await api.pedidos.atualizarStatus(id, novoStatus);
    if (novoStatus === 'pronto') {
      // remove da fila quando fica pronto
      pedidosFila = pedidosFila.filter(p => p.id !== id);
    } else {
      const idx = pedidosFila.findIndex(p => p.id === id);
      if (idx !== -1) pedidosFila[idx].status = novoStatus;
    }
    renderFila();
  } catch (e) {
    alert(`erro ao atualizar: ${e.message}`);
  }
}

// atualiza a cada 20 segundos — mais frequente que pedidos
setInterval(carregarFila, 20000);