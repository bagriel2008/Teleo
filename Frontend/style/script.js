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
        console.log('Resposta da requisição:', resp);
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

    if(userName && perfilImage && bioUsuario && perfilForm) {
    
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