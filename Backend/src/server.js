require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db_config');
const authRoutes = require('./auth');


const cargoRoutes = require('./cargosAuth');
const perfilRoutes = require('./perfilAuth');
const respostasUsuarioRoutes = require('./respostasUsuarioAuth')
const RewardsAuth = require('./RewardsAuth');
const Contatos = require('./contatosAuth');

const path = require('path');
const fs = require('fs');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

//Garante que a pasta uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

//Servir a pasta 'uploads' publicamente
app.use('/uploads', express.static(uploadDir));
app.use('/auth', authRoutes);
app.use('/cargos', cargoRoutes);
app.use('/perfil', perfilRoutes);
app.use(express.static('public')); // Serve os arquivos da pasta 'public'
app.use('/respostas-usuario', respostasUsuarioRoutes);
app.use('/estatisticas', RewardsAuth);
app.use('/contatos', Contatos);

// Objeto para manter o controle dos usuários conectados: { username: socket.id }
const connectedUsers = new Map();


io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.id);

  // autenticação - cliente envia token com evento 'authenticate'
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seusegredo');
      socket.userEmail = decoded.email;
      connectedUsers.set(socket.userEmail, socket.id);
      console.log(`✅ Autenticado: ${socket.userEmail}`);

      // atualiza lista online (opcional)
      io.emit('update-user-list', Array.from(connectedUsers.keys()));
    } catch (err) {
      console.log('❌ Token inválido, desconectando socket');
      socket.disconnect();
    }
  });

  // receber mensagem privada
  socket.on('private-message', async ({ recipient, message }) => {
  try {
    const sender = socket.userEmail;
    if (!sender || !recipient || !message) return;

    const createdAt = new Date();

    // Salva no banco
    await db.execute(
      'INSERT INTO mensagens (sender, recipient, message, created_at) VALUES (?, ?, ?, ?)',
      [sender, recipient, message, createdAt]
    );

    const payload = { sender, recipient, message, createdAt };

    // Envia para o destinatário
    const recipientSocketId = connectedUsers.get(recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private-message', payload);
    }

    // Reenvia ao remetente para sincronizar
    socket.emit('private-message', payload);

  } catch (err) {
    console.error('Erro ao salvar/enviar mensagem:', err);
  }
});

  // carregar histórico entre o usuário autenticado e 'recipient' (email)
  socket.on('load-history', async (recipient) => {
  try {
    const sender = socket.userEmail;
    if (!sender || !recipient) return;

    const [rows] = await db.execute(
      `SELECT sender, recipient, message, created_at AS createdAt
       FROM mensagens
       WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)
       ORDER BY created_at ASC`,
      [sender, recipient, recipient, sender]
    );

    socket.emit('history', rows);
  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
  }
});

  socket.on('disconnect', () => {
    if (socket.userEmail) {
      connectedUsers.delete(socket.userEmail);
      io.emit('update-user-list', Array.from(connectedUsers.keys()));
      console.log('Desconectado:', socket.userEmail);
    }
  });
});


const port = process.env.PORT || 3030;

server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
