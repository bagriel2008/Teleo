//fazer com que um usuario em especifico consiga adicionar seus cargos da sua empresa na pagina inicial
//e que esses usuarios sejam salvos no banco de dados
//e que esses cargos sejam exibidos na pagina de perfil do usuario

const el = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

// Função para gerar perguntas (mantida do código original)
byId('btnGerar').addEventListener('click', () => {
  const qtd = parseInt(byId('qtdQuestoes').value, 10);
  const wrap = byId('camposPerguntas');
  if (!qtd || qtd < 1) {
    alert('Informe a quantidade de questões (mínimo 1).');
    return;
  }

  wrap.innerHTML = ''; // limpa

  for (let i = 1; i <= qtd; i++) {
    const card = document.createElement('div');
    card.className = 'pergunta-card';
    card.innerHTML = `
      <div class="pergunta-grid">
        <label for="pergunta_${i}">Pergunta ${i}</label>
        <input id="pergunta_${i}" placeholder="Digite a pergunta ${i}" required>
      </div>
      <div class="respostas-grid">
        <div>
          <label for="resposta_${i}_a">Resposta A</label>
          <input id="resposta_${i}_a" placeholder="Resposta A" required>
        </div>
        <div>
          <label for="resposta_${i}_b">Resposta B</label>
          <input id="resposta_${i}_b" placeholder="Resposta B" required>
        </div>
        <div>
          <label for="resposta_${i}_c">Resposta B</label>
          <input id="resposta_${i}_c" placeholder="Resposta c" required>
        </div>
        <div>
          <label for="resposta_${i}_d">Resposta B</label>
          <input id="resposta_${i}_d" placeholder="Resposta d" required>
        </div>
      </div>
    `;
    wrap.appendChild(card);
  }
});

// Função para adicionar cargos
byId('btnAdicionarCargo').addEventListener('click', () => {
  const nomeCargo = byId('nomeCargo').value.trim();
  const descricaoCargo = byId('descricaoCargo').value.trim();

  if (!nomeCargo || !descricaoCargo) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  // Simular envio para o backend
  const cargo = { nome: nomeCargo, descricao: descricaoCargo };
  salvarCargoNoBanco(cargo)
    .then(() => {
      alert('Cargo adicionado com sucesso!');
      exibirCargosNaPagina();
    })
    .catch((err) => {
      console.error('Erro ao salvar o cargo:', err);
      alert('Erro ao salvar o cargo. Tente novamente.');
    });

  // Limpar os campos
  byId('nomeCargo').value = '';
  byId('descricaoCargo').value = '';
});

// Função para salvar o cargo no "banco de dados"
async function salvarCargoNoBanco(cargo) {
  // Simulação de envio para o backend
  return fetch('/api/cargos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cargo),
  });
}

// Função para exibir os cargos na página
async function exibirCargosNaPagina() {
  const listaCargos = byId('listaCargos');
  listaCargos.innerHTML = 'Carregando...';

  try {
    const response = await fetch('/api/cargos');
    const cargos = await response.json();

    listaCargos.innerHTML = '';
    cargos.forEach((cargo) => {
      const item = document.createElement('div');
      item.className = 'cargo-item';
      item.innerHTML = `
        <h3>${cargo.nome}</h3>
        <p>${cargo.descricao}</p>
      `;
      listaCargos.appendChild(item);
    });
  } catch (err) {
    console.error('Erro ao carregar os cargos:', err);
    listaCargos.innerHTML = 'Erro ao carregar os cargos.';
  }
}