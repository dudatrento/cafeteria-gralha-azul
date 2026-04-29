const catInfo = {
  1: ['preparo', 'cat-preparo'],
  2: ['balcão', 'cat-balcao'],
  3: ['bebidas', 'cat-bebidas'],
};

const statusLabel = {
  pendente: 'pendente',
  em_preparo: 'em preparo',
  pronto: 'pronto',
  entregue: 'entregue',
};

const statusNext = {
  pendente: 'em_preparo',
  em_preparo: 'pronto',
  pronto: 'entregue',
};

const statusNextLabel = {
  pendente: 'iniciar preparo',
  em_preparo: 'marcar pronto',
  pronto: 'entregar',
};

let todosPedidos = [];
let filtroAtivo = 'todos';

// ── relógio ──────────────────────────────────────────────
function iniciarRelogio() {
  const el = document.getElementById('ga-clock');
  function tick() {
    el.textContent = new Date().toLocaleTimeString('pt-BR');
  }
  tick();
  setInterval(tick, 1000);
}

// ── stats ────────────────────────────────────────────────
function atualizarStats() {
  document.getElementById('stat-total').textContent = todosPedidos.length;
  document.getElementById('stat-aberto').textContent =
    todosPedidos.filter(p => p.status !== 'entregue').length;
  document.getElementById('stat-concluidos').textContent =
    todosPedidos.filter(p => p.status === 'entregue').length;
  document.getElementById('stat-delivery').textContent =
    todosPedidos.filter(p => p.tipo === 'delivery').length;
}

// ── renderização ─────────────────────────────────────────
function hora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderCard(p) {
  const tipoBadge = `<span class="ga-badge badge-${p.tipo}">${p.tipo}</span>`;
  const statusBadge = `<span class="ga-badge badge-${p.status}">${statusLabel[p.status] || p.status}</span>`;

  const itensHtml = p.itens && p.itens.length
    ? p.itens.map(i => {
        const nome = i.item_cardapio?.nome ?? `item #${i.item_cardapio_id}`;
        const catId = i.item_cardapio?.categoria_id;
        const [catNome, catClass] = catInfo[catId] || ['', ''];
        const catTag = catNome
          ? `<span class="ga-item-cat ${catClass}">${catNome}</span>` : '';
        const subtotal = (i.preco_unitario * i.quantidade).toFixed(2);
        return `<li>
          <span>${i.quantidade}× ${nome}${catTag}</span>
          <span style="color:#5a4e3e">R$ ${subtotal}</span>
        </li>`;
      }).join('')
    : '<li style="color:#5a4e3e;font-size:11px;">sem itens detalhados</li>';

  const obsHtml = p.observacoes
    ? `<div class="ga-obs">${p.observacoes}</div>` : '';

  const nextStatus = statusNext[p.status];
  const btnAvancar = nextStatus
    ? `<button class="ga-btn primary" onclick="avancarStatus(${p.id}, '${nextStatus}')">
        ${statusNextLabel[p.status]}
       </button>`
    : `<button class="ga-btn muted">concluído</button>`;

  const btnPagar = !p.pago
    ? `<button class="ga-btn success" onclick="registrarPagamento(${p.id})">pago</button>` : '';

  const pagoHtml = p.pago ? `<span class="ga-pago">✓ pago</span>` : '';

  return `
    <div class="ga-card" id="card-${p.id}">
      <div class="ga-card-header">
        <div class="ga-card-id">pedido <strong>#${p.id}</strong> ${tipoBadge}</div>
        ${statusBadge}
      </div>
      <div class="ga-card-body">
        <ul class="ga-itens">${itensHtml}</ul>
        ${obsHtml}
      </div>
      <div class="ga-card-footer">
        ${btnAvancar}
        ${btnPagar}
        ${pagoHtml}
        <span class="ga-hora">${hora(p.criado_em)}</span>
      </div>
    </div>`;
}

function renderPedidos() {
  const container = document.getElementById('ga-pedidos');

  let pedidos = todosPedidos;
  if (filtroAtivo === 'local' || filtroAtivo === 'delivery') {
    pedidos = pedidos.filter(p => p.tipo === filtroAtivo);
  } else if (filtroAtivo !== 'todos') {
    pedidos = pedidos.filter(p => p.status === filtroAtivo);
  }

  container.innerHTML = pedidos.length
    ? pedidos.map(renderCard).join('')
    : '<div class="ga-empty">nenhum pedido encontrado</div>';
}

// ── ações ────────────────────────────────────────────────
async function carregarPedidos() {
  const container = document.getElementById('ga-pedidos');
  container.innerHTML = '<div class="ga-loading">carregando pedidos...</div>';
  try {
    todosPedidos = await api.pedidos.hoje();
    atualizarStats();
    renderPedidos();
  } catch (e) {
    container.innerHTML = `<div class="ga-empty">
      erro ao conectar à api<br>
      <small style="color:#3a2e1e;font-size:10px;">${e.message}</small>
    </div>`;
  }
}

async function avancarStatus(id, novoStatus) {
  try {
    await api.pedidos.atualizarStatus(id, novoStatus);
    const idx = todosPedidos.findIndex(p => p.id === id);
    if (idx !== -1) todosPedidos[idx].status = novoStatus;
    atualizarStats();
    renderPedidos();
  } catch (e) {
    alert(`erro ao atualizar status: ${e.message}`);
  }
}

async function registrarPagamento(id) {
  try {
    await api.pedidos.registrarPagamento(id);
    const idx = todosPedidos.findIndex(p => p.id === id);
    if (idx !== -1) todosPedidos[idx].pago = true;
    renderPedidos();
  } catch (e) {
    alert(`erro ao registrar pagamento: ${e.message}`);
  }
}

// ── filtros ──────────────────────────────────────────────
function iniciarFiltros() {
  document.querySelectorAll('.ga-filter-btn[data-filtro]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ga-filter-btn[data-filtro]')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroAtivo = btn.dataset.filtro;
      renderPedidos();
    });
  });

  document.getElementById('btn-atualizar')
    .addEventListener('click', carregarPedidos);
}

// ── init ─────────────────────────────────────────────────
iniciarRelogio();
iniciarFiltros();
carregarPedidos();

// atualiza automaticamente a cada 30 segundos
setInterval(carregarPedidos, 30000);