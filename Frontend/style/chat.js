const token = localStorage.getItem('token');
const username = localStorage.getItem('userEmail'); // quem está logado
let contatoAtual = null;

// Elementos DOM
const listaContatosEl = document.getElementById('listaContatos');
const chatComEl = document.getElementById('chatCom');
const chatPhotoEl = document.getElementById('chatPhoto');
const messagesContainerEl = document.getElementById('messagesContainer');
const chatFormEl = document.getElementById('chatForm');
const mensagemInputEl = document.getElementById('messageInput');
const backToContactsBtn = document.getElementById('backToContacts');

// Conexão com Socket.io
const socket = io('http://localhost:3030');

// Autenticação do socket
socket.on('connect', () => {
    socket.emit('authenticate', token);
});


async function carregarContatos() {
    try {
        const response = await fetch('http://localhost:3030/perfil/chat', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!data.success || data.contatos.length === 0) {
            listaContatosEl.innerHTML = '<p>Nenhum contato disponível.</p>';
            return;
        }

        listaContatosEl.innerHTML = '';

        data.contatos.forEach((contato) => {
            const div = document.createElement('div');
            div.classList.add('contato');

            const img = document.createElement('img');
            img.src = contato.profile_image
                ? `http://localhost:3030/${contato.profile_image}`
                : `http://localhost:3030/uploads/default.png`;
            img.alt = `Foto de ${contato.username}`;

            const p = document.createElement('p');
            p.textContent = contato.username;

            div.appendChild(img);
            div.appendChild(p);

            div.addEventListener('click', () => abrirChat(contato));

            listaContatosEl.appendChild(div);
        });
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        listaContatosEl.innerHTML = '<p>Erro ao carregar contatos.</p>';
    }
}


function abrirChat(contato) {
    contatoAtual = contato;
    chatComEl.innerText = contato.username;
    chatPhotoEl.src = contato.profile_image
        ? `http://localhost:3030/${contato.profile_image}`
        : `http://localhost:3030/uploads/default.png`;
    messagesContainerEl.innerHTML = '';

    socket.emit('load-history', contato.email);

    // Animação no mobile
    if (window.innerWidth <= 768) {
        document
            .querySelector('.chat-page-container')
            .classList.add('chat-active');
    }
}


chatFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensagem = mensagemInputEl.value.trim();
    if (!mensagem || !contatoAtual) return;

    socket.emit('private-message', {
        recipient: contatoAtual.email,
        message: mensagem,
    });

    mensagemInputEl.value = '';
});


socket.on('private-message', (data) => {
    if (!contatoAtual) return;

    const cond1 =
        data.sender === contatoAtual.email && data.recipient === username; // recebida
    const cond2 =
        data.sender === username && data.recipient === contatoAtual.email; // enviada

    if (cond1 || cond2) {
        exibirMensagem(data.sender, data.message, data.createdAt);
    }
});


socket.on('history', (history) => {
    messagesContainerEl.innerHTML = '';
    history.forEach((msg) =>
        exibirMensagem(msg.sender, msg.message, msg.createdAt)
    );
});

function exibirMensagem(remetente, texto, timestamp) {
    const div = document.createElement('div');
    div.classList.add('message');

    const isSent = remetente === username;
    div.classList.add(isSent ? 'sent' : 'received');

    const p = document.createElement('p');
    p.textContent = texto;

    const span = document.createElement('span');
    span.classList.add('timestamp');
    span.textContent = new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    div.appendChild(p);
    div.appendChild(span);
    messagesContainerEl.appendChild(div);
    messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
}

document.addEventListener('DOMContentLoaded', carregarContatos);

backToContactsBtn.addEventListener('click', () => {
    document.querySelector('.chat-page-container').classList.remove('chat-active');
    contatoAtual = null;
    chatComEl.innerText = 'Selecione uma conversa';
    messagesContainerEl.innerHTML = '';
});