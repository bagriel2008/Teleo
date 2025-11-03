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

router.get('/:id', autenticarToken, async (req, res) => {
    const cargoId = req.params.id;
    console.log('Requisição para cargo ID:', cargoId);
    
    try {
        const [cargoRows] = await db.execute('SELECT * FROM cargos WHERE id = ?', [cargoId]);
        console.log('Resultado da consulta cargos:', cargoRows);
        
        if (cargoRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cargo não encontrado.' });
        }
        
        const cargo = cargoRows[0];
        
        const [perguntaRows] = await db.execute('SELECT * FROM perguntas WHERE cargo_id = ?', [cargoId]);
        console.log('Perguntas do cargo:', perguntaRows);
        
        for (const pergunta of perguntaRows) {
            const [respostaRows] = await db.execute('SELECT * FROM respostas WHERE pergunta_id = ?', [pergunta.id]);
            pergunta.respostas = respostaRows.map(r => r.texto);
        }

        res.json({ success: true, cargo: { ...cargo, perguntas: perguntaRows } });
    } catch (err) {
        console.error('Erro ao buscar cargo:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar cargo.' });
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

module.exports = router;