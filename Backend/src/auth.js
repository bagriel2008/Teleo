const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db_config');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        const [result] = await db.execute(query, [username, hashedPassword, email]);

        res.json({
            success: true,
            message: 'Cadastro bem sucedido',
            data: { id: result.insertId, username, email }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, tipo: user.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Envia o tipo para o front-end
        res.json({ success: true, token, tipo: user.tipo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

router.post('/cargos', async (req, res) => {
  const { nome, descricao, perguntas } = req.body;
  const userId = req.user.id;
  const userTipo = req.user.tipo;

  if (userTipo !== 'empresa') {
    return res.status(403).json({ success: false, message: 'Apenas empresas podem adicionar cargos.' });
  }

  if (!nome || !descricao || !perguntas || !Array.isArray(perguntas)) {
    return res.status(400).json({ success: false, message: 'Dados inválidos enviados.' });
  }

  const conn = connection.promise();

  try {
    // 🔹 1. Inserir o cargo
    const [cargoResult] = await conn.query(
      'INSERT INTO cargos (nome, descricao, user_id) VALUES (?, ?, ?)',
      [nome, descricao, userId]
    );
    const cargoId = cargoResult.insertId;

    // 🔹 2. Inserir perguntas e respostas
    for (const pergunta of perguntas) {
      const [perguntaResult] = await conn.query(
        'INSERT INTO perguntas (texto, cargo_id) VALUES (?, ?)',
        [pergunta.texto, cargoId]
      );
      const perguntaId = perguntaResult.insertId;

      for (const respostaTexto of pergunta.respostas) {
        await conn.query(
          'INSERT INTO respostas (texto, pergunta_id) VALUES (?, ?)',
          [respostaTexto, perguntaId]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Cargo e perguntas adicionados com sucesso!' });
  } catch (err) {
    console.error('Erro ao adicionar cargo:', err);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

router.post

module.exports = router;