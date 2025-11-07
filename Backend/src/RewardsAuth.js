const express = require('express');
const router = express.Router();
const db = require('./db_config');
const jwt = require('jsonwebtoken');

// Middleware de autenticação
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

// 📊 Rota para buscar estatísticas de acertos
router.get('/', autenticarToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
      c.nome AS cargo_nome,
      COUNT(ru.pergunta_id) AS total_perguntas,
      SUM(ru.correta) AS acertos,
      ROUND((SUM(ru.correta) / COUNT(ru.pergunta_id)) * 100, 1) AS percentual
      FROM respostas_usuarios ru
      JOIN cargos c ON ru.cargo_id = c.id
      WHERE ru.user_id = ?
      GROUP BY ru.cargo_id, c.nome
      ORDER BY percentual DESC;
    `;

    const [stats] = await db.execute(query, [userId]);

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Erro ao buscar estatísticas:', err);
    res.status(500).json({ success: false, message: 'Erro no servidor ao buscar estatísticas.' });
  }
});

module.exports = router;