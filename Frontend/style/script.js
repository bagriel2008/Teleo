window.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.modosDeJogo');
    container.innerHTML = '<p>Carregando cargos...</p>';

    try {
        const resp = await fetch('http://localhost:3030/cargos');
        const cargos = await resp.json();

        container.innerHTML = '';
        if (!cargos.length) {
            container.innerHTML = '<p>Nenhum cargo cadastrado ainda.</p>';
            return;
        }

        cargos.forEach(c => {
            const a = document.createElement('a');
            a.href = `../modoDeJogo/index.html?id=${c.id}`;
            a.innerHTML = `
        <div class="modo">
          <p>${c.nome}</p>
        </div>
      `;
            container.appendChild(a);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Erro ao carregar cargos.</p>';
    }
});


//Carregar cargo específico com perguntas e respostas
const qs = new URLSearchParams(window.location.search);
const id = qs.get('id');

(async function carregarCargo() {
    try {
        const resp = await fetch(`http://localhost:3030/cargos/${id}`);
        const data = await resp.json();
        if (!data.success) throw new Error(data.message || 'Erro');

        const titulo = document.querySelector('.modoNumeracao'); // onde você mostra "Modo 1"
        const numero = document.querySelector('.NumeroDaQuestao');
        const questao = document.querySelector('.questao');
        const ul = document.querySelector('.respostas-container ul');

        let idx = 0; // questão atual
        const total = data.perguntas.length;

        function render() {
            const p = data.perguntas[idx];
            titulo.textContent = data.cargo.nome;          // nome do cargo no topo (Modelo 1)
            numero.textContent = (idx + 1) + '.';          // número da questão
            questao.textContent = p.texto;                 // texto da questão

            ul.innerHTML = '';
            p.respostas.forEach((r, i) => {
                const li = document.createElement('li');
                const letra = String.fromCharCode(65 + i); // A, B, C, D...
                li.innerHTML = `<label>${letra}) ${r.texto}</label>`;
                ul.appendChild(li);
            });
        }

        render();

        // Se quiser navegar entre questões depois, você pode adicionar botões "Próxima/Anterior" e chamar render().
    } catch (err) {
        console.error(err);
        alert('Erro ao carregar o cargo.');
    }
})();

document.getElementById('perfilIcon').addEventListener('click', () => {
  const tipo = localStorage.getItem('userTipo');

  if (tipo === 'empresa') {
    // Usuário da empresa vai para página de adicionar cargos
    window.location.href = '../Cargos/index.html';
  } else {
    // Usuário normal vai para perfil
    window.location.href = '../Perfil/index.html';
  }
});