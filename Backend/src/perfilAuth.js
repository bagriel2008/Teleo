const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const db = require('./db_config');
const router = express.Router();

// Middleware de autenticação JWT
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

// Configuração do multer (com caminho absoluto)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extName && mimeType) cb(null, true);
        else cb(new Error('Apenas imagens JPEG ou PNG são permitidas.'));
    }
});

router.get('/chat', autenticarToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Busca o tipo do usuário logado
    const [usuario] = await db.query('SELECT tipo FROM users WHERE id = ?', [userId]);
    if (!usuario.length) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const tipoUsuario = usuario[0].tipo;

    // Define o tipo oposto para listar nos contatos
    const tipoParaBuscar = tipoUsuario === 'empresa' ? 'usuario' : 'empresa';

    // Busca usuários do outro tipo
    const [contatos] = await db.query(
      'SELECT id, username, email, profile_image FROM users WHERE tipo = ?',
      [tipoParaBuscar]
    );

    res.json({ success: true, contatos });
  } catch (error) {
    console.error('Erro ao carregar contatos do chat:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar contatos.' });
  }
});



// 🔹 GET — Pegar informações do usuário logado
router.get('/', autenticarToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.execute('SELECT username, profile_image, bio FROM users WHERE id = ?', [userId]);

        if (!rows || rows.length === 0)
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

        const user = rows[0];

        // Se o usuário não tiver imagem salva, retorna null (frontend decide imagem padrão)
        if (!user.profile_image) user.profile_image = null;

        res.status(200).json({
            success: true,
            message: 'Usuário buscado com sucesso',
            user
        });
    } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar perfil' });
    }
});

// 🔹 PUT — Atualizar bio e imagem
router.put('/', autenticarToken, upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;
        const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

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

router.delete('/', autenticarToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Busca imagem atual
        const [rows] = await db.execute('SELECT profile_image FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

        const currentImage = rows[0].profile_image;

        // Se existir imagem, remove do sistema de arquivos
        if (currentImage) {
            const imagePath = path.join(__dirname, '..', currentImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Atualiza no banco como NULL
        await db.execute('UPDATE users SET profile_image = NULL WHERE id = ?', [userId]);

        res.status(200).json({ success: true, message: 'Imagem de perfil removida com sucesso' });
    } catch (err) {
        console.error('Erro ao remover imagem de perfil:', err);
        res.status(500).json({ success: false, message: 'Erro ao remover imagem de perfil' });
    }
});

module.exports = router;