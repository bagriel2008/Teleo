require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db_config');
const authRoutes = require('./auth');
const cargoRoutes = require('./cargosAuth');



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/cargos', cargoRoutes);
app.use(express.static('public')); // Serve os arquivos da pasta 'public'

// Objeto para manter o controle dos usuários conectados: { username: socket.id }
const connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const username = decoded.email; // Usando email como identificador

            connectedUsers[username] = socket.id;
            console.log(`Usuário autenticado: ${username}`);
        } catch (err) {
            console.log('Token inválido:', err);
            socket.disconnect();
        }
    });

    socket.on('send_message', (data) => {
        const { to, message, from } = data;
        const toSocketId = connectedUsers[to];

        if (toSocketId) {
            io.to(toSocketId).emit('receive_message', { from, message });
            console.log(`Mensagem enviada de ${from} para ${to}: ${message}`);
        } else {
            console.log(`Usuário ${to} não está conectado.`);
        }
    });

    socket.on('disconnect', () => {
        for (const [username, id] of Object.entries(connectedUsers)) {
            if (id === socket.id) {
                delete connectedUsers[username];
                console.log(`Usuário desconectado: ${username}`);
                break;
            }
        }
    });
});
// Fazer com que o admin consiga adicionar os cargos




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