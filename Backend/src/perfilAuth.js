const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('./db_config'); // Certifique-se que db_config exporta pool.execute

// Middleware de autenticação JWT
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const jwt = require('jsonwebtoken');
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch {
        return res.sendStatus(403);
    }
}

// Configuração do multer
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    }),
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extName && mimeType) cb(null, true);
        else cb(new Error('Only images are allowed (jpeg, jpg, png)'));
    }
});

// GET: perfil do usuário logado
router.get('/', autenticarToken, async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });

        const [rows] = await db.execute('SELECT username, profile_image, bio FROM users WHERE id = ?', [userId]);
        if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

        res.status(200).json({ success: true, message: 'Usuário buscado com sucesso', user: rows[0] });
    } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar perfil' });
    }
});

// PUT: atualizar bio e imagem
router.put('/', autenticarToken, upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;
        const profileImage = req.file ? req.file.filename : null;

        await db.execute(
            'UPDATE users SET bio = COALESCE(?, bio), profile_image = COALESCE(?, profile_image) WHERE id = ?',
            [bio, profileImage, userId]
        );

        res.json({ success: true, message: 'Perfil atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
    }
});

router.put

module.exports = router;