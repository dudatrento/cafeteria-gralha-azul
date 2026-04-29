let itensEstoque = [];

// ── renderização ─────────────────────────────────────────
function renderEstoque() {
  const container = document.getElementById('ga-estoque');

  if (!itensEstoque.length) {
    container.innerHTML = '<div class="ga-empty">nenhum item cadastrado no estoque</div>';
    return;
  }

  const alertas = itensEstoque.filter(i => i.quantidade_atual <= i.quantidade_minima);
  const ok = itensEstoque.filter(i => i.quantidade_atual > i.quantidade_minima);

  let html = '';

  if (alertas.length) {
    html += `<div class="estoque-secao-label alerta">
      ⚠ reposição necessária (${alertas.length})
    </div>`;
    html += alertas.map(renderItemEstoque).join('');
  }

  if (ok.length) {
    html += `<div class="estoque-secao-label">
      estoque ok (${ok.length})
    </div>`;
    html += ok.map(renderItemEstoque).join('');
  }

  container.innerHTML = html;
}

function renderItemEstoque(item) {
  const emAlerta = item.quantidade_atual <= item.quantidade_minima;
  const alertaClass = emAlerta ? 'estoque-card-alerta' : '';

  const porcentagem = Math.min(
    Math.round((item.quantidade_atual / item.quantidade_minima) * 100),
    100
  );

  const barraClass = emAlerta ? 'barra-alerta' : 'barra-ok';

  return `
    <div class="estoque-card ${alertaClass}" id="estoque-card-${item.id}">
      <div class="estoque-card-header">
        <div class="estoque-nome">${item.nome}</div>
        ${emAlerta ? '<span class="ga-badge badge-alerta">repor</span>' : '<span class="ga-badge badge-ok">ok</span>'}
      </div>

      <div class="estoque-quantidades">
        <div class="estoque-qty">
          <div class="estoque-qty-label">atual</div>
          <div class="estoque-qty-valor ${emAlerta ? 'valor-alerta' : 'valor-ok'}">
            ${item.quantidade_atual} <span class="estoque-unidade">${item.unidade}</span>
          </div>
        </div>
        <div class="estoque-qty">
          <div class="estoque-qty-label">mínimo</div>
          <div class="estoque-qty-valor muted">
            ${item.quantidade_minima} <span class="estoque-unidade">${item.unidade}</span>
          </div>
        </div>
      </div>

      <div class="estoque-barra-bg">
        <div class="estoque-barra ${barraClass}" style="width:${porcentagem}%"></div>
      </div>

      <div class="estoque-acoes">
        <input
          type="number"
          class="estoque-input"
          id="repor-input-${item.id}"
          placeholder="quantidade"
          min="0"
          step="0.1"
        />
        <button class="ga-btn primary estoque-btn"
          onclick="reporItem(${item.id}, '${item.unidade}')">
          repor
        </button>
        <button class="ga-btn estoque-btn"
          onclick="consumirItem(${item.id}, '${item.unidade}')">
          consumir
        </button>
      </div>
    </div>`;
}

// ── ações ────────────────────────────────────────────────
async function carregarEstoque() {
  const container = document.getElementById('ga-estoque');
  container.innerHTML = '<div class="ga-loading">carregando estoque...</div>';
  try {
    itensEstoque = await api.estoque.listar();
    renderEstoque();
  } catch (e) {
    container.innerHTML = `<div class="ga-empty">
      erro ao carregar estoque<br>
      <small style="color:#3a2e1e;font-size:10px;">${e.message}</small>
    </div>`;
  }
}

async function reporItem(id, unidade) {
  const input = document.getElementById(`repor-input-${id}`);
  const quantidade = parseFloat(input.value);

  if (!quantidade || quantidade <= 0) {
    alert('informe uma quantidade válida');
    return;
  }

  try {
    await api.estoque.repor(id, quantidade);
    input.value = '';
    await carregarEstoque();
  } catch (e) {
    alert(`erro ao repor: ${e.message}`);
  }
}

async function consumirItem(id, unidade) {
  const input = document.getElementById(`repor-input-${id}`);
  const quantidade = parseFloat(input.value);

  if (!quantidade || quantidade <= 0) {
    alert('informe uma quantidade válida');
    return;
  }

  try {
    await api.estoque.consumir(id, quantidade);
    input.value = '';
    await carregarEstoque();
  } catch (e) {
    alert(`erro ao consumir: ${e.message}`);
  }
}