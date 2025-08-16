window.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.modosDeJogo');
    if (!container) return; // Se não for a página de lista, não executa

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

// Carregar cargo específico com perguntas
(async function carregarCargo() {
    const qs = new URLSearchParams(window.location.search);
    const id = qs.get('id');

    if (!id) return; // Só executa se tiver id na URL

    try {
        const resp = await fetch(`http://localhost:3030/cargos/${id}`);
        if (!resp.ok) throw new Error('Erro na requisição');

        const data = await resp.json();
        if (!data.success || !data.perguntas) {
            throw new Error(data.message || 'Erro ao carregar dados do cargo');
        }

        const titulo = document.querySelector('.modoNumeracao');
        const numero = document.querySelector('.NumeroDaQuestao');
        const questao = document.querySelector('.questao');
        const ul = document.querySelector('.respostas-container ul');

        let idx = 0;

        function render() {
            const p = data.perguntas[idx];
            titulo.textContent = data.cargo.nome;
            numero.textContent = (idx + 1) + '.';
            questao.textContent = p.texto;

            ul.innerHTML = '';
            p.respostas.forEach((r, i) => {
                const li = document.createElement('li');
                const letra = String.fromCharCode(65 + i);
                li.innerHTML = `<label>${letra}) ${r.texto}</label>`;
                ul.appendChild(li);
            });
        }

        render();
    } catch (err) {
        console.error(err);
        alert('Erro ao carregar o cargo.');
    }
})();

// Redirecionamento do ícone de perfil
document.getElementById('perfilIcon')?.addEventListener('click', () => {
    const tipo = localStorage.getItem('userTipo');

    if (tipo === 'empresa') {
        window.location.href = '../Cargos/index.html';
    } else {
        window.location.href = '../Perfil/index.html';
    }
});