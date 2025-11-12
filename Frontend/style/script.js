window.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.modosDeJogo');
    if (!container) return;

    container.innerHTML = '<p>Carregando cargos...</p>';

    const token = localStorage.getItem('token');

    try {
        const resp = await fetch('http://localhost:3030/cargos', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (resp.status === 401) {
            container.innerHTML = '<p>Você precisa estar logado para ver os cargos.</p>';
            return;
        }

        if (!resp.ok) {
            throw new Error(`Erro ${resp.status}: ${resp.statusText}`);
        }

        const cargos = await resp.json();

        container.innerHTML = '';
        if (!Array.isArray(cargos) || cargos.length === 0) {
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
    if (!id) return;

    const token = localStorage.getItem('token');

    try {
        const resp = await fetch(`http://localhost:3030/cargos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (resp.status === 401) {
            alert('Você precisa estar logado para acessar este cargo.');
            window.location.href = "../index.html";
            return;
        }

        if (!resp.ok) throw new Error('Erro na requisição');

        const data = await resp.json();
        if (!data.success || !data.perguntas) {
            throw new Error(data.message || 'Erro ao carregar dados do cargo');
        }

        // Elementos do DOM
        const titulo = document.querySelector('.modoNumeracao');
        const numero = document.querySelector('.NumeroDaQuestao');
        const questao = document.querySelector('.questao');
        const ul = document.querySelector('.respostas-container ul');

        // estado
        let idx = 0;
        let pontuacao = 0;

        // Função utilitária para interpretar a flag "correta"
        const isTrue = (v) => {
            return v === true || v === 1 || v === '1' || v === 'true' || v === 'True' || v === 'TRUE';
        };

        // Avança para a próxima pergunta (ou final)
        function proximaPergunta() {
            idx++;
            if (idx >= data.perguntas.length) {
                // Fim do questionário
                alert(`Fim! Sua pontuação: ${pontuacao} / ${data.perguntas.length}`);
                // redirecionar ou fazer outra ação
                window.location.href = "../PaginaInicial/index.html";
                return;
            }
            render();
        }

        // Salvar resposta do usuário (tenta enviar ao backend, se existir rota)
        async function salvarRespostaUsuario(perguntaId, respostaId, correta) {
            const payload = {
                cargo_id: data.cargo.id,
                pergunta_id: perguntaId,
                resposta_id: respostaId,
                correta: !!correta
            };

            // se tiver a rota, envia; senão apenas loga
            try {
                const r = await fetch('http://localhost:3030/respostas-usuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                if (!r.ok) {
                    const text = await r.text();
                    console.warn('Salvar resposta retornou não OK:', r.status, text);
                } else {
                    // opcional: const d = await r.json(); console.log(d);
                }
            } catch (err) {
                // rota pode não existir — não tratar como erro crítico
                console.warn('Não foi possível salvar a resposta no servidor (rota /respostas-usuario faltando?):', err.message);
            }
        }

        // Renderiza a pergunta atual e opções como BOTÕES clicáveis
        function render() {
            const p = data.perguntas[idx];
            titulo.textContent = data.cargo.nome;
            numero.textContent = (idx + 1) + '.';
            questao.textContent = p.texto;

            ul.innerHTML = '';
            // garantir que há array de respostas
            const respostas = Array.isArray(p.respostas) ? p.respostas : [];

            respostas.forEach((r, i) => {
                const li = document.createElement('li');
                li.className = 'resposta-li';

                // cria botão acessível
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'botao-resposta';
                btn.setAttribute('data-index', i);
                btn.setAttribute('data-resposta-id', r.id ?? i); // se houver id no DB, usa; senão usa índice
                btn.setAttribute('data-correta', String(r.correta ?? r.correta === 1 ? r.correta : false));
                btn.setAttribute('aria-pressed', 'false');
                btn.tabIndex = 0;
                btn.innerText = `${String.fromCharCode(65 + i)}) ${r.texto}`;

                // handler de clique / teclado
                const handleAnswer = async (evt) => {
                    // prevenir cliques múltiplos
                    if (btn.disabled) return;

                    const corretaFlag = isTrue(btn.dataset.correta);
                    // desabilita todos os botões ao responder
                    const todos = ul.querySelectorAll('.botao-resposta');
                    todos.forEach(b => b.disabled = true);

                    // feedback visual imediato
                    if (corretaFlag) {
                        btn.classList.add('resposta-correta'); // cor verde
                        pontuacao++;
                    } else {
                        btn.classList.add('resposta-incorreta'); // cor vermelha
                        // destacar o correto
                        const corretoBtn = Array.from(todos).find(x => isTrue(x.dataset.correta));
                        if (corretoBtn) corretoBtn.classList.add('resposta-correta');
                    }

                    // salvar resposta (não bloqueante)
                    const perguntaId = p.id ?? null;
                    const respostaId = btn.getAttribute('data-resposta-id');
                    salvarRespostaUsuario(perguntaId, respostaId, corretaFlag).catch(() => {});

                    // avançar após pequeno delay para o usuário ver feedback
                    setTimeout(() => {
                        // limpa classes anteriores para o próximo render
                        todos.forEach(b => {
                            b.classList.remove('resposta-correta', 'resposta-incorreta');
                            b.disabled = false;
                        });
                        proximaPergunta();
                    }, corretaFlag ? 900 : 1400);
                };

                btn.addEventListener('click', handleAnswer);
                // acessibilidade: responder com Enter / Space
                btn.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        btn.click();
                    }
                });

                li.appendChild(btn);
                ul.appendChild(li);
            });
        }

        // estilos mínimos via JS caso o CSS não exista (garante clique visual)
        (function ensureStyles() {
            const id = 'modo-de-jogo-inline-styles';
            if (document.getElementById(id)) return;
            const style = document.createElement('style');
            style.id = id;
            style.innerHTML = `
                .resposta-li { margin-bottom: 0.6rem; list-style: none; }
                .botao-resposta { width: 100%; text-align: left; padding: 0.7rem; border-radius: 6px; border: 1px solid #ccc; background: #f2f2f2; cursor: pointer; font-size: 1rem; }
                .botao-resposta:disabled { opacity: 0.6; cursor: default; }
                .botao-resposta.resposta-correta { border-color: #2e8b57; background: #e8f7ec; }
                .botao-resposta.resposta-incorreta { border-color: #c0392b; background: #fdecea; }
            `;
            document.head.appendChild(style);
        })();

        // primeira renderização
        render();

    } catch (err) {
        console.error(err);
        alert('Erro ao carregar o cargo.');
    }
})();

// Redirecionamento do ícone de perfil
const perfilIcon = document.getElementById('perfilIcon');
if (perfilIcon) {
    perfilIcon.addEventListener('click', () => {
        const tipo = localStorage.getItem('userTipo');
        if (tipo === 'empresa') {
            window.location.href = "../Cargos/index.html";
        } else {
            window.location.href = "../Perfil/index.html";
        }
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userName = document.getElementById('userName');
    const perfilImage = document.getElementById('perfilImage');
    const bioUsuario = document.getElementById('bio');
    const perfilForm = document.getElementById('perfilForm');
    const profileImageInput = document.getElementById('profileImageInput');
    const removerImagemBtn = document.getElementById('removerImagem');

    const imagem_padrao = '../assets/User.png';

    if (userName && perfilImage && bioUsuario && perfilForm) {

        // Função para carregar dados do perfil
        async function carregarPerfil() {
            try {
                const resp = await fetch('http://localhost:3030/perfil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await resp.json();
                if (!data.success) throw new Error(data.message);

                userName.textContent = data.user.username;
                bioUsuario.value = data.user.bio || '';

                // ✅ Corrigido: se não houver imagem, usa a padrão SEMPRE
                if (data.user.profile_image) {
                    perfilImage.src = `http://localhost:3030${data.user.profile_image}`;
                } else {
                    perfilImage.src = imagem_padrao;
                }

            } catch (err) {
                console.error('Erro ao carregar perfil:', err);
                alert('Erro ao carregar perfil');
            }
        }


        carregarPerfil();

        // Atualizar imagem e bio
        perfilForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('bio', bioUsuario.value);
            if (profileImageInput.files[0]) {
                formData.append('profileImage', profileImageInput.files[0]);
            }

            try {
                const resp = await fetch('http://localhost:3030/perfil', {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const data = await resp.json();
                if (!data.success) throw new Error(data.message);

                alert('Perfil atualizado com sucesso!');
                carregarPerfil();
            } catch (err) {
                console.error('Erro ao atualizar perfil:', err);
                alert('Erro ao atualizar perfil');
            }
        });

        // Remover imagem de perfil → volta para a padrão
        removerImagemBtn.addEventListener('click', async () => {
            if (!confirm('Tem certeza que deseja remover sua imagem de perfil?')) return;

            try {
                const resp = await fetch('http://localhost:3030/perfil', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await resp.json();
                if (!data.success) throw new Error(data.message);
                alert('Imagem de perfil removida com sucesso!');
                perfilImage.src = imagem_padrao; // volta à imagem padrão na tela

            } catch (err) {
                console.error('Erro ao remover imagem:', err);
                alert('Erro ao remover imagem de perfil');
            }
        });
    }
});

// Carregar estatísticas do usuário na página de Rewards
document.addEventListener('DOMContentLoaded', async () => {
  const statsContainer = document.getElementById('statsContent');
  if (!statsContainer) return; // <-- adiciona esta linha

  const token = localStorage.getItem('token');

  if (!token) {
    statsContainer.innerHTML = '<p>Você precisa estar logado para ver suas estatísticas.</p>';
    return;
  }

  try {
    const response = await fetch('http://localhost:3030/estatisticas', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success || data.stats.length === 0) {
      statsContainer.innerHTML = '<p>Nenhuma estatística disponível ainda. Jogue para gerar dados!</p>';
      return;
    }

    statsContainer.innerHTML = '';

    data.stats.forEach(stat => {
      const card = document.createElement('div');
      card.classList.add('stat-card');

      const percentual = stat.total_perguntas > 0
        ? ((stat.acertos / stat.total_perguntas) * 100).toFixed(1)
        : 0;

      card.innerHTML = `
        <h2>${stat.cargo_nome}</h2>
        <p>Total de Perguntas: <span class="score">${stat.total_perguntas}</span></p>
        <p>Acertos: <span class="score">${stat.acertos}</span></p>
        <p>Desempenho: <span class="score">${percentual}%</span></p>
      `;

      statsContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    statsContainer.innerHTML = '<p>Erro ao carregar estatísticas.</p>';
  }
});