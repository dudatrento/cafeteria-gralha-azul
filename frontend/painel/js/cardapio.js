let itensCardapio = [];
let categoriasCardapio = [];

// ── renderização ─────────────────────────────────────────
function renderCardapio() {
  const container = document.getElementById('ga-cardapio');

  if (!itensCardapio.length) {
    container.innerHTML = '<div class="ga-empty">nenhum item cadastrado</div>';
    return;
  }

  // agrupa por categoria
  const porCategoria = {};
  categoriasCardapio.forEach(cat => {
    porCategoria[cat.id] = { ...cat, itens: [] };
  });

  itensCardapio.forEach(item => {
    if (porCategoria[item.categoria_id]) {
      porCategoria[item.categoria_id].itens.push(item);
    }
  });

  container.innerHTML = Object.values(porCategoria)
    .sort((a, b) => a.prioridade - b.prioridade)
    .map(cat => {
      if (!cat.itens.length) return '';
      return `
        <div class="cardapio-secao">
          <div class="estoque-secao-label">${cat.nome}</div>
          ${cat.itens.map(renderItemCardapio).join('')}
        </div>`;
    }).join('');
}

function renderItemCardapio(item) {
  const dispClass = item.disponivel ? 'disp-sim' : 'disp-nao';
  const dispLabel = item.disponivel ? 'disponível' : 'indisponível';
  const toggleLabel = item.disponivel ? 'desativar' : 'ativar';
  const toggleClass = item.disponivel ? '' : 'success';

  return `
    <div class="cardapio-card ${!item.disponivel ? 'cardapio-card-inativo' : ''}"
      id="cardapio-card-${item.id}">
      <div class="cardapio-card-header">
        <div>
          <div class="cardapio-nome ${!item.disponivel ? 'nome-inativo' : ''}">
            ${item.nome}
          </div>
          ${item.descricao
            ? `<div class="cardapio-desc">${item.descricao}</div>`
            : ''}
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
          <span class="ga-badge ${dispClass}">${dispLabel}</span>
          <div class="cardapio-preco">R$ ${item.preco.toFixed(2)}</div>
        </div>
      </div>
      <div class="cardapio-acoes">
        <button class="ga-btn ${toggleClass}"
          onclick="toggleDisponivel(${item.id}, ${!item.disponivel})">
          ${toggleLabel}
        </button>
        <button class="ga-btn"
          onclick="mostrarFormEdicao(${item.id})">
          editar preço
        </button>
        <div id="form-edicao-${item.id}" class="cardapio-form-edicao" style="display:none;">
          <input type="number" class="estoque-input" style="width:120px"
            id="preco-input-${item.id}"
            placeholder="novo preço"
            step="0.01" min="0"
            value="${item.preco.toFixed(2)}" />
          <button class="ga-btn primary"
            onclick="atualizarPreco(${item.id})">salvar</button>
          <button class="ga-btn"
            onclick="fecharFormEdicao(${item.id})">cancelar</button>
        </div>
      </div>
    </div>`;
}

function renderFormNovoItem() {
  const container = document.getElementById('ga-cardapio-form');
  const opcoesCategoria = categoriasCardapio
    .sort((a, b) => a.prioridade - b.prioridade)
    .map(cat => `<option value="${cat.id}">${cat.nome}</option>`)
    .join('');

  container.innerHTML = `
    <div class="cliente-form">
      <div class="cliente-form-titulo">novo item</div>

      <div class="cardapio-form-grid">
        <div class="cliente-form-campo">
          <label class="cliente-form-label">nome</label>
          <input type="text" id="novo-item-nome" class="estoque-input"
            style="width:100%" placeholder="ex: Croissant de Presunto" />
        </div>

        <div class="cliente-form-campo">
          <label class="cliente-form-label">categoria</label>
          <select id="novo-item-categoria" class="estoque-input" style="width:100%">
            ${opcoesCategoria}
          </select>
        </div>

        <div class="cliente-form-campo">
          <label class="cliente-form-label">preço (R$)</label>
          <input type="number" id="novo-item-preco" class="estoque-input"
            style="width:100%" placeholder="0.00" step="0.01" min="0" />
        </div>

        <div class="cliente-form-campo" style="grid-column:1/-1">
          <label class="cliente-form-label">descrição (opcional)</label>
          <input type="text" id="novo-item-descricao" class="estoque-input"
            style="width:100%" placeholder="ex: pão artesanal com recheio da casa" />
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:1rem;">
        <button class="ga-btn primary" onclick="cadastrarItem()">adicionar ao cardápio</button>
        <button class="ga-btn" onclick="fecharFormNovoItem()">cancelar</button>
      </div>
    </div>`;
}

// ── ações ────────────────────────────────────────────────
async function carregarCardapio() {
  const container = document.getElementById('ga-cardapio');
  container.innerHTML = '<div class="ga-loading">carregando cardápio...</div>';
  try {
    [itensCardapio, categoriasCardapio] = await Promise.all([
      api.cardapio.itens(),
      api.cardapio.categorias(),
    ]);
    renderCardapio();
  } catch (e) {
    container.innerHTML = `<div class="ga-empty">
      erro ao carregar cardápio<br>
      <small style="color:#3a2e1e;font-size:10px;">${e.message}</small>
    </div>`;
  }
}

async function toggleDisponivel(id, novoValor) {
  try {
    await api.cardapio.atualizarItem(id, { disponivel: novoValor });
    const idx = itensCardapio.findIndex(i => i.id === id);
    if (idx !== -1) itensCardapio[idx].disponivel = novoValor;
    renderCardapio();
  } catch (e) {
    alert(`erro ao atualizar: ${e.message}`);
  }
}

async function atualizarPreco(id) {
  const input = document.getElementById(`preco-input-${id}`);
  const preco = parseFloat(input.value);

  if (!preco || preco <= 0) {
    alert('informe um preço válido');
    return;
  }

  try {
    await api.cardapio.atualizarItem(id, { preco });
    const idx = itensCardapio.findIndex(i => i.id === id);
    if (idx !== -1) itensCardapio[idx].preco = preco;
    renderCardapio();
  } catch (e) {
    alert(`erro ao atualizar preço: ${e.message}`);
  }
}

async function cadastrarItem() {
  const nome = document.getElementById('novo-item-nome').value.trim();
  const categoria_id = parseInt(document.getElementById('novo-item-categoria').value);
  const preco = parseFloat(document.getElementById('novo-item-preco').value);
  const descricao = document.getElementById('novo-item-descricao').value.trim();

  if (!nome || !categoria_id || !preco) {
    alert('preencha nome, categoria e preço');
    return;
  }

  try {
    const novoItem = await api.cardapio.criarItem({
      nome,
      categoria_id,
      preco,
      descricao: descricao || null,
    });
    itensCardapio.push(novoItem);
    fecharFormNovoItem();
    renderCardapio();
  } catch (e) {
    alert(`erro ao cadastrar: ${e.message}`);
  }
}

// ── helpers de UI ────────────────────────────────────────
function mostrarFormNovoItem() {
  const container = document.getElementById('ga-cardapio-form');
  container.style.display = 'block';
  renderFormNovoItem();
}

function fecharFormNovoItem() {
  const container = document.getElementById('ga-cardapio-form');
  container.style.display = 'none';
  container.innerHTML = '';
}

function mostrarFormEdicao(id) {
  // fecha qualquer form de edição aberto
  document.querySelectorAll('.cardapio-form-edicao').forEach(el => {
    el.style.display = 'none';
  });
  document.getElementById(`form-edicao-${id}`).style.display = 'flex';
}

function fecharFormEdicao(id) {
  document.getElementById(`form-edicao-${id}`).style.display = 'none';
}