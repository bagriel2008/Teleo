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

// Objeto para manter o controle dos usuários conectados: { username: socket.id }
const connectedUsers = new Map();

app.get('/contatos', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, profile_image FROM users WHERE tipo = "empresa"'
    );

    res.json({
      success: true,
      contatos: rows.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        profile_image: u.profile_image
          ? `uploads/${u.profile_image}`
          : 'uploads/default.png'
      }))
    });
  } catch (err) {
    console.error('Erro ao buscar contatos:', err);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});


io.on('connection', (socket) => {
  console.log('📡 Novo socket conectado:', socket.id);

  // Recebe o token do cliente e autentica
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seusegredo');
      socket.userEmail = decoded.email;
      connectedUsers.set(socket.userEmail, socket.id);
      console.log(`✅ ${socket.userEmail} autenticado`);
    } catch (err) {
      console.log('❌ Token inválido');
      socket.disconnect();
    }
  });

  // Recebe uma mensagem privada
  socket.on('private-message', async (data) => {
    const { recipient, message } = data;
    const sender = socket.userEmail;

    if (!sender || !recipient || !message) {
      console.log('⚠️ Dados insuficientes para enviar mensagem');
      return;
    }

    const createdAt = new Date();

    try {
      // Salva no banco
      await db.query(
        'INSERT INTO mensagens (sender, recipient, message, created_at) VALUES (?, ?, ?, ?)',
        [sender, recipient, message, createdAt]
      );

      // Envia para o remetente (para exibir imediatamente)
      socket.emit('private-message', { sender, message, createdAt });

      // Envia para o destinatário, se estiver online
      const recipientSocketId = connectedUsers.get(recipient);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('private-message', { sender, message, createdAt });
      } else {
        console.log(`📭 Usuário ${recipient} está offline`);
      }

    } catch (error) {
      console.error('❌ Erro ao salvar/enviar mensagem:', error);
    }
  });

  // Carrega histórico de conversa entre dois usuários
  socket.on('load-history', async (recipient) => {
    const sender = socket.userEmail;
    if (!sender || !recipient) return;

    try {
      const [rows] = await db.query(
        `SELECT sender, recipient, message, created_at AS createdAt
         FROM mensagens
         WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?)
         ORDER BY created_at ASC`,
        [sender, recipient, recipient, sender]
      );

      socket.emit('history', rows);
    } catch (err) {
      console.error('❌ Erro ao carregar histórico:', err);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userEmail) connectedUsers.delete(socket.userEmail);
    console.log('❌ Socket desconectado:', socket.id);
  });
});



const port = process.env.PORT || 3030;

server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});







// const express = require("express");
// const cors = require("cors");
// const connection = require("./db_config");
// const app = express();

// app.use(cors());
// app.use(express.json());

// const port = 3030;

// app.post('/cadastro', (req, res) =>{
//     const {username, password, email} = req.body
//     const query = "INSERT INTO users (username, password, email) VALUES (?,?,?)"
    
//     connection.query(query, [username, password, email], (err, results) =>{
//         if (err) {
//             return res.status(500).json({success:false, message:'Erro no servidor'})
//         }
//         else {
//             res.json({success:true, message:'Cadastro bem sucedido', 
//             data:{ id: results.insertId, username, password, email }})
//         }
//     })
// })

// app.post('/login', (req, res) => {
//     const { email, password } = req.body;
  
//     const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
//     connection.query(query, [email, password], (err, results) => {
//       if (err) {
//         return res.status(500).json({ success: false, message: 'Erro no servidor.' });
//       }
  
//       if (results.length > 0) {
//         res.json({ success: true, message: 'Login bem-sucedido!' });
//       } else {
//         res.json({ success: false, message: 'Usuário ou senha incorretos!' });
//       }
//     });
// });



// app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));