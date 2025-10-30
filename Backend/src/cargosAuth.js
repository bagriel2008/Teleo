const express = require('express');
const router = express.Router();
const db = require('./db_config');

function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    // você precisa do jwt e do process.env.JWT_SECRET
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
            'INSERT INTO cargos (nome, user_id) VALUES (?, ?)',
            [nome, userId]
        );
        const cargoId = cargoResult.insertId;

        for (const pergunta of perguntas) {
            const [perguntaResult] = await db.execute(
                'INSERT INTO perguntas (texto, cargo_id) VALUES (?, ?)',
                [pergunta.texto, cargoId]
            );
            const perguntaId = perguntaResult.insertId;

            for (const respostaTexto of pergunta.respostas) {
                await db.execute(
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

module.exports = router;