const token = localStorage.getItem('token');
const username = localStorage.getItem('userEmail'); // usado para identificar quem está logado
let contatoAtual = null;

// Elementos do DOM
const listaContatosEl = document.getElementById('listaContatos');
const chatComEl = document.getElementById('chatCom');
const messagesContainerEl = document.getElementById('messagesContainer');
const chatFormEl = document.getElementById('chatForm');
const mensagemInputEl = document.getElementById('messageInput'); // Corrigido para corresponder ao HTML
const backToContactsBtn = document.getElementById('backToContacts');
const chatPageContainer = document.querySelector('.chat-page-container');

const socket = io('http://localhost:3030');

// Autentica o usuário no socket
socket.on('connect', () => {
  socket.emit('authenticate', token);
});
// Busca lista de contatos (empresas)
async function carregarContatos() {
    try {
        const response = await fetch('http://localhost:3030/perfil/chat', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.success || data.contatos.length === 0) {
            listaContatosEl.innerHTML = '<p>Nenhum contato disponível.</p>';
            return;
        }

        listaContatosEl.innerHTML = '';
        data.contatos.forEach(contato => {
            if (contato.email === username) return; // não exibe o próprio perfil
            const div = document.createElement('div');
            div.classList.add('contato');
            div.innerHTML = `
    <img src="http://localhost:3030/${contato.profile_image || 'uploads/default.png'}" alt="Foto">
    <p>${contato.username}</p>
  `;
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
    messagesContainerEl.innerHTML = '';

    socket.emit('load-history', contato.id);

    // Lógica para mobile
    if (window.innerWidth <= 768) {
        document.querySelector('.chat-page-container').classList.add('chat-active');
    }
}

// Enviar mensagem
chatFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const mensagem = mensagemInputEl.value.trim();
  if (!mensagem || !contatoAtual) return;

  socket.emit('private-message', {
    recipient: contatoAtual.email,
    message: mensagem
  });

  // exibe imediatamente no chat local
  exibirMensagem(username, mensagem, new Date());
  mensagemInputEl.value = '';
});

// Receber mensagem
socket.on('private-message', (data) => {
    // Exibe a mensagem se for do contato atual ou se for a própria mensagem enviada
    if (contatoAtual && (data.sender === contatoAtual.email || data.sender === username)) {
        exibirMensagem(data.sender, data.message, data.createdAt);
    }
});

// Receber histórico
socket.on('history', (history) => {
    messagesContainerEl.innerHTML = '';
    history.forEach(data => {
        exibirMensagem(data.sender, data.message, data.createdAt);
    });
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
    span.textContent = new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    div.appendChild(p);
    div.appendChild(span);
    messagesContainerEl.appendChild(div);

    // Scroll para a última mensagem
    messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
}

// Carrega contatos ao abrir a página
document.addEventListener('DOMContentLoaded', carregarContatos);

// Botão de voltar para mobile
backToContactsBtn.addEventListener('click', () => {
    document.querySelector('.chat-page-container').classList.remove('chat-active');
    contatoAtual = null;
    chatComEl.innerText = 'Selecione uma conversa';
    messagesContainerEl.innerHTML = '';
});