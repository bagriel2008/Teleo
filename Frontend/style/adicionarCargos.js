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
            ${['A', 'B', 'C', 'D'].map((letra, index) => `
                <div clas="resposta-item">
                  <label for="resposta_${i}_${letra.toLowerCase()}">Resposta ${letra}</label>
                  <input id="resposta_${i}_${letra.toLowerCase()}" placeholder="Resposta ${letra}" required>
                  <input type="radio" name="correta_${i}" value="${index}" class="correta">
                  <span>Correta</span>
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
  btnSalvar.addEventListener('click', async (e) => {
    e.preventDefault();

    const nomeCargo = inputCargoNome.value.trim();
    if (!nomeCargo) return alert('Informe o nome do cargo.');

    const camposPerguntas = document.querySelectorAll('.pergunta-card');
    if (!camposPerguntas.length) return alert('Gere pelo menos uma pergunta.');

    const perguntas = [];

    for (let i = 0; i < camposPerguntas.length; i++) {
      const pTexto = byId(`pergunta_${i + 1}`).value.trim();
      if (!pTexto) return alert(`A pergunta ${i + 1} está vazia.`);

      const respostas = ['a', 'b', 'c', 'd'].map((letra, idx) => {
        const texto = byId(`resposta_${i + 1}_${letra}`).value.trim();
        return { texto, correta: false };
      });

      // Verifica qual foi marcada como correta
      const corretaRadio = document.querySelector(`input[name="correta_${i + 1}"]:checked`);
      if (!corretaRadio) return alert(`Selecione a resposta correta da pergunta ${i + 1}.`);

      const idxCorreta = parseInt(corretaRadio.value);
      respostas[idxCorreta].correta = true;

      perguntas.push({ texto: pTexto, respostas });
    }

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

      const data = await resp.json();

      if (resp.ok && data.success) {
        alert('✅ Cargo e perguntas adicionados com sucesso!');
        inputCargoNome.value = '';
        wrap.innerHTML = '';
        qtdQuestoesInput.value = '';
        window.location.href = "../PaginaInicial/index.html";
      } else {
        alert(`Erro: ${data.message || 'Erro desconhecido.'}`);
      }
    } catch (err) {
      console.error('Erro ao enviar cargo:', err);
      alert('Erro ao conectar ao servidor.');
    }
  });
});

async function carregarCargosDaEmpresa() {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("userTipo");

  if (tipo !== "empresa") return;

  try {
    const response = await fetch("http://localhost:3030/cargos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cargos = await response.json();

    const lista = document.getElementById("listaCargos");
    lista.innerHTML = "";

    cargos.forEach((cargo) => {
      const item = document.createElement("div");
      item.classList.add("cargo-item");
      item.innerHTML = `
        <span>${cargo.nome}</span>
        <button class="excluir-btn" data-id="${cargo.id}">Excluir</button>
      `;
      lista.appendChild(item);
    });

    document.querySelectorAll(".excluir-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        if (confirm("Tem certeza que deseja excluir este cargo?")) {
          await excluirCargo(id);
        }
      });
    });
  } catch (error) {
    console.error("Erro ao carregar cargos:", error);
  }
}

async function excluirCargo(id) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:3030/cargos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    alert(data.message);
    carregarCargosDaEmpresa();
  } catch (error) {
    console.error("Erro ao excluir cargo:", error);
  }
}

// Carregar cargos ao abrir a página
document.addEventListener("DOMContentLoaded", carregarCargosDaEmpresa);