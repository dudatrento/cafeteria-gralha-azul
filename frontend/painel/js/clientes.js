let clienteAtual = null;

// ── renderização ─────────────────────────────────────────
function renderClienteEncontrado(cliente) {
  const container = document.getElementById('ga-cliente-resultado');
  container.innerHTML = `
    <div class="cliente-card">
      <div class="cliente-card-header">
        <div class="cliente-avatar">${iniciais(cliente.nome)}</div>
        <div>
          <div class="cliente-nome">${cliente.nome}</div>
          <div class="cliente-info">${cliente.telefone}</div>
        </div>
        <span class="ga-badge badge-ok" style="margin-left:auto">encontrado</span>
      </div>
      <div class="cliente-detalhe">
        <div class="cliente-detalhe-label">endereço</div>
        <div class="cliente-detalhe-valor">${cliente.endereco}</div>
      </div>
      <div class="cliente-detalhe">
        <div class="cliente-detalhe-label">cliente desde</div>
        <div class="cliente-detalhe-valor">${dataFormatada(cliente.criado_em)}</div>
      </div>
    </div>`;
  clienteAtual = cliente;
}

function renderClienteNaoEncontrado(telefone) {
  const container = document.getElementById('ga-cliente-resultado');
  container.innerHTML = `
    <div class="cliente-nao-encontrado">
      <div class="cliente-nf-msg">nenhum cliente com esse telefone</div>
      <button class="ga-btn primary" onclick="mostrarFormCadastro('${telefone}')">
        cadastrar novo cliente
      </button>
    </div>`;
  clienteAtual = null;
}

function mostrarFormCadastro(telefone = '') {
  const container = document.getElementById('ga-cliente-resultado');
  container.innerHTML = `
    <div class="cliente-form">
      <div class="cliente-form-titulo">novo cliente</div>

      <div class="cliente-form-campo">
        <label class="cliente-form-label">nome</label>
        <input type="text" id="novo-nome" class="estoque-input" style="width:100%"
          placeholder="nome completo" />
      </div>

      <div class="cliente-form-campo">
        <label class="cliente-form-label">telefone</label>
        <input type="text" id="novo-telefone" class="estoque-input" style="width:100%"
          placeholder="41999990000" value="${telefone}" />
      </div>

      <div class="cliente-form-campo">
        <label class="cliente-form-label">endereço</label>
        <input type="text" id="novo-endereco" class="estoque-input" style="width:100%"
          placeholder="rua, número, bairro" />
      </div>

      <div style="display:flex;gap:8px;margin-top:1rem;">
        <button class="ga-btn primary" onclick="cadastrarCliente()">cadastrar</button>
        <button class="ga-btn" onclick="limparResultado()">cancelar</button>
      </div>
    </div>`;
}

function limparResultado() {
  document.getElementById('ga-cliente-resultado').innerHTML = '';
  document.getElementById('busca-telefone').value = '';
  clienteAtual = null;
}

// ── ações ────────────────────────────────────────────────
async function buscarCliente() {
  const telefone = document.getElementById('busca-telefone').value.trim();
  if (!telefone) {
    alert('informe um telefone para buscar');
    return;
  }

  const container = document.getElementById('ga-cliente-resultado');
  container.innerHTML = '<div class="ga-loading">buscando...</div>';

  try {
    const cliente = await api.clientes.buscarPorTelefone(telefone);
    renderClienteEncontrado(cliente);
  } catch (e) {
    renderClienteNaoEncontrado(telefone);
  }
}

async function cadastrarCliente() {
  const nome = document.getElementById('novo-nome').value.trim();
  const telefone = document.getElementById('novo-telefone').value.trim();
  const endereco = document.getElementById('novo-endereco').value.trim();

  if (!nome || !telefone || !endereco) {
    alert('preencha todos os campos');
    return;
  }

  try {
    const cliente = await api.clientes.criar({ nome, telefone, endereco });
    renderClienteEncontrado(cliente);
  } catch (e) {
    alert(`erro ao cadastrar: ${e.message}`);
  }
}

// ── helpers ──────────────────────────────────────────────
function iniciais(nome) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

function dataFormatada(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ── busca com Enter ──────────────────────────────────────
function iniciarClientes() {
  document.getElementById('busca-telefone')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') buscarCliente();
    });
}

iniciarClientes();