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

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

module.exports = router;