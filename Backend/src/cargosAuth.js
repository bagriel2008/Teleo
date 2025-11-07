const express = require('express');
const router = express.Router();
const db = require('./db_config');

function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    const jwt = require('jsonwebtoken');
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.sendStatus(403);
    }
}

router.post('/', autenticarToken, async (req, res) => {
    const { nome, perguntas } = req.body;
    const userId = req.user.id;
    const userTipo = req.user.tipo;

    if (userTipo !== 'empresa') {
        return res.status(403).json({ success: false, message: 'Apenas empresas podem adicionar cargos.' });
    }

    if (!nome || !perguntas || !Array.isArray(perguntas)) {
        return res.status(400).json({ success: false, message: 'Dados inválidos enviados.' });
    }

    try {
        const [cargoResult] = await db.execute(
            'INSERT INTO cargos (nome, creat_id) VALUES (?, ?)',
            [nome, userId]
        );
        const cargoId = cargoResult.insertId;

        for (const pergunta of perguntas) {
            const [perguntaResult] = await db.execute(
                'INSERT INTO perguntas (texto, cargo_id) VALUES (?, ?)',
                [pergunta.texto, cargoId]
            );
            const perguntaId = perguntaResult.insertId;

            for (const resp of pergunta.respostas) {
                await db.query(
                    "INSERT INTO respostas (pergunta_id, texto, correta) VALUES (?, ?, ?)",
                    [perguntaId, resp.texto, resp.correta]
                );
            }
        }

        res.status(201).json({ success: true, message: 'Cargo e perguntas adicionados com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar cargo:', err);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

router.get('/:id', autenticarToken, async (req, res) => {
    const cargoId = req.params.id;

    try {
        // Busca o cargo
        const [cargos] = await db.execute('SELECT * FROM cargos WHERE id = ?', [cargoId]);
        if (cargos.length === 0) return res.status(404).json({ success: false, message: 'Cargo não encontrado' });

        const cargo = cargos[0];

        // Busca as perguntas
        const [perguntas] = await db.execute('SELECT * FROM perguntas WHERE cargo_id = ?', [cargoId]);

        // Para cada pergunta, busca as respostas
        for (let p of perguntas) {
            const [respostas] = await db.execute('SELECT * FROM respostas WHERE pergunta_id = ?', [p.id]);
            p.respostas = respostas; // adiciona respostas na pergunta
        }

        res.json({ success: true, cargo, perguntas });
    } catch (err) {
        console.error('Erro ao buscar cargo:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar cargo' });
    }
});

router.get('/', autenticarToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM cargos');
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar cargos:', err);
        res.status(500).json({ message: 'Erro ao buscar cargos.' });
    }
});

router.delete("/:id", autenticarToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userTipo = req.user.tipo;

  try {
    if (userTipo !== "empresa") {
      return res.status(403).json({ message: "Apenas empresas podem excluir cargos." });
    }

    // Verifica se o cargo pertence à empresa
    const [cargo] = await db.execute("SELECT * FROM cargos WHERE id = ? AND creat_id = ?", [id, userId]);
    if (cargo.length === 0) {
      return res.status(404).json({ message: "Cargo não encontrado ou não pertence à empresa." });
    }

    // Busca todas as perguntas desse cargo
    const [perguntas] = await db.execute("SELECT id FROM perguntas WHERE cargo_id = ?", [id]);

    // Para cada pergunta, deleta primeiro as respostas dos usuários, depois as respostas padrão
    for (const pergunta of perguntas) {
      // Deleta as tentativas dos usuários para esta pergunta
      await db.execute("DELETE FROM respostas_usuarios WHERE pergunta_id = ?", [pergunta.id]);
      // Deleta as opções de resposta para esta pergunta
      await db.execute("DELETE FROM respostas WHERE pergunta_id = ?", [pergunta.id]);
    }

    // Deleta as perguntas
    await db.execute("DELETE FROM perguntas WHERE cargo_id = ?", [id]);

    // Por fim, deleta o cargo
    await db.execute("DELETE FROM cargos WHERE id = ?", [id]);

    res.json({ message: "Cargo e todos os dados relacionados foram excluídos com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir cargo:", error);
    res.status(500).json({ message: "Erro interno ao excluir cargo.", error: error.message });
  }
});

module.exports = router;