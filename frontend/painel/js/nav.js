const telas = {
  pedidos:  { secao: 'tela-pedidos',  carregar: () => carregarPedidos()  },
  fila:     { secao: 'tela-fila',     carregar: () => carregarFila()     },
  estoque:  { secao: 'tela-estoque',  carregar: () => carregarEstoque()  },
  clientes: { secao: 'tela-clientes', carregar: () => {}                 },
  cardapio: { secao: 'tela-cardapio', carregar: () => carregarCardapio() },
};

function mostrarTela(nome) {
  Object.values(telas).forEach(t => {
    document.getElementById(t.secao).style.display = 'none';
  });

  const tela = telas[nome];
  if (!tela) return;
  document.getElementById(tela.secao).style.display = 'block';
  tela.carregar();
}

document.querySelectorAll('.ga-nav-btn[data-tela]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ga-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mostrarTela(btn.dataset.tela);
  });
});