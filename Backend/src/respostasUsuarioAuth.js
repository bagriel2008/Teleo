const express = require('express');
const router = express.Router();
const db = require('./db_config');
const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.sendStatus(403);
  }
}

// POST - salvar resposta do usuário
router.post("/", autenticarToken, async (req, res) => {
  const { cargo_id, pergunta_id, resposta_id, correta } = req.body;
  const user_id = req.user.id;

  if (!cargo_id || !pergunta_id || !resposta_id) {
    return res.status(400).json({ success: false, message: "Campos obrigatórios faltando." });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO respostas_usuarios (user_id, cargo_id, pergunta_id, resposta_id, correta)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, cargo_id, pergunta_id, resposta_id, correta ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: "Resposta salva com sucesso.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao salvar resposta." });
  }
});

// GET - listar respostas de um usuário
router.get("/", autenticarToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.execute(
      `SELECT ru.*, p.texto AS pergunta, r.texto AS resposta
       FROM respostas_usuarios ru
       JOIN perguntas p ON ru.pergunta_id = p.id
       JOIN respostas r ON ru.resposta_id = r.id
       WHERE ru.user_id = ?`,
      [user_id]
    );

    res.json({ success: true, respostas: rows });
  } catch (error) {
    console.error("Erro ao buscar respostas:", error);
    res.status(500).json({ success: false, message: "Erro interno ao buscar respostas." });
  }
});

module.exports = router;