const el = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

// Verifica login e tipo
function verificarAcessoEmpresa() {
  const token = localStorage.getItem('token');
  const tipo = localStorage.getItem('userTipo');

  if (!token || tipo !== 'empresa') {
    alert('Acesso restrito: apenas empresas podem adicionar cargos.');
    window.location.href = "../PaginaInicial/index.html";
    return false;
  }

  return token;
}

// Função principal para página de adicionar cargos
window.addEventListener('DOMContentLoaded', () => {
  const token = verificarAcessoEmpresa();
  if (!token) return; // sem token, para execução

  // Referências de elementos
  const btnGerar = byId('btnGerar');
  const btnSalvar = byId('btnSalvar');
  const qtdQuestoesInput = byId('qtdQuestoes');
  const wrap = byId('camposPerguntas');
  const inputCargoNome = byId('cargoNome');

  if (!btnGerar) console.warn('btnGerar não encontrado — verifique o id no HTML.');
  if (!btnSalvar) console.warn('btnSalvar não encontrado — verifique o id no HTML.');
  if (!qtdQuestoesInput) console.warn('qtdQuestoes não encontrado — verifique o id no HTML.');
  if (!wrap) console.warn('camposPerguntas não encontrado — verifique o id no HTML.');
  if (!inputCargoNome) console.warn('cargoNome não encontrado — verifique o id no HTML.');

  // Gerar perguntas dinamicamente
  if (btnGerar) {
    btnGerar.addEventListener('click', () => {
      const qtd = parseInt(qtdQuestoesInput?.value || '0', 10);

      if (!qtd || qtd < 1) {
        alert('Informe a quantidade de questões (mínimo 1).');
        return;
      }

      wrap.innerHTML = ''; // limpa o container

      for (let i = 1; i <= qtd; i++) {
        const card = document.createElement('div');
        card.className = 'pergunta-card';
        card.innerHTML = `
          <div class="pergunta-grid">
            <label for="pergunta_${i}">Pergunta ${i}</label>
            <input id="pergunta_${i}" placeholder="Digite a pergunta ${i}" required>
          </div>
          <div class="respostas-grid">
            ${['A', 'B', 'C', 'D']
            .map(
              (letra) => `
                <div>
                  <label for="resposta_${i}_${letra.toLowerCase()}">Resposta ${letra}</label>
                  <input id="resposta_${i}_${letra.toLowerCase()}" placeholder="Resposta ${letra}" required>
                </div>`
            )
            .join('')}
          </div>
        `;
        wrap.appendChild(card);
      }
    });
  }

  // Salvar cargo no servidor
  if (btnSalvar) {
    btnSalvar.addEventListener('click', async (e) => {
      e.preventDefault();

      const nomeCargo = inputCargoNome?.value.trim() || '';
      if (!nomeCargo) {
        alert('Informe o nome do cargo.');
        return;
      }

      const camposPerguntas = document.querySelectorAll('.pergunta-card');
      if (!camposPerguntas.length) {
        alert('Nenhuma pergunta gerada. Clique em "Gerar" primeiro.');
        return;
      }

      const perguntas = [];
      camposPerguntas.forEach((card, idx) => {
        const pEl = byId(`pergunta_${idx + 1}`);
        const p = pEl ? pEl.value.trim() : '';

        const respostas = ['a', 'b', 'c', 'd'].map((letra) => {
          const rEl = byId(`resposta_${idx + 1}_${letra}`);
          return rEl ? rEl.value.trim() : '';
        });

        perguntas.push({ texto: p, respostas });
      });

      const cargoData = { nome: nomeCargo, perguntas };
      
      try {
        const resp = await fetch('http://localhost:3030/cargos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cargoData),
        });

        // Verifica se a resposta do servidor está ok
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Erro do servidor: ${resp.status} - ${text}`);
        }

        const data = await resp.json();

        if (data.success) {
          alert('✅ Cargo adicionado com sucesso!');
          inputCargoNome.value = '';
          wrap.innerHTML = '';
          qtdQuestoesInput.value = '';
        } else {
          alert('Erro ao adicionar cargo: ' + (data.message || 'desconhecido.'));
        }
      } catch (err) {
        console.error('Erro ao enviar cargo:', err);
        alert('Erro ao conectar ao servidor.');
      }
    });
  }

});