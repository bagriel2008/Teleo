//fazer com que um usuario em especifico consiga adicionar seus cargos da sua empresa na pagina inicial
//e que esses usuarios sejam salvos no banco de dados
// e que esses cargos sejam exibidos na pagina de perfil do usuario

const el = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

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
          <label for="resposta_${i}_c">Resposta C</label>
          <input id="resposta_${i}_c" placeholder="Resposta C" required>
        </div>
        <div>
          <label for="resposta_${i}_d">Resposta D</label>
          <input id="resposta_${i}_d" placeholder="Resposta D" required>
        </div>
      </div>
    `;
    wrap.appendChild(card);
  }
});

byId('formCargo').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = byId('cargoNome').value.trim();
  const qtd = parseInt(byId('qtdQuestoes').value, 10);
  if (!nome) { alert('Informe o nome do cargo.'); return; }
  if (!qtd || qtd < 1) { alert('Informe a quantidade de questões.'); return; }

  const perguntas = [];
  for (let i = 1; i <= qtd; i++) {
    const texto = byId(`pergunta_${i}`)?.value.trim() || '';
    const respostas = ['a','b','c','d'].map(l => byId(`resposta_${i}_${l}`)?.value.trim() || '');
    if (!texto || respostas.some(r => !r)) {
      alert(`Complete a pergunta ${i} e todas as respostas A–D.`);
      return;
    }
    perguntas.push({ texto, respostas });
  }

  try {
    const resp = await fetch('http://localhost:3030/cargos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, perguntas })
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) throw new Error(data.message || 'Falha ao salvar');

    alert('Cargo salvo com sucesso!');
    // redireciona para a página inicial (onde os cards aparecem)
    window.location.href = '../PaginaInicial/index.html';
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar o cargo.');
  }
});

