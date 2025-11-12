const express = require('express');
const router = express.Router();
const db = require('./db_config');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Define o diretório de uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, email, tipo, profile_image, bio FROM users');

    const contatos = rows.map(user => {
      let imageUrl = null;
      if (user.profile_image) {
        // Remove duplicações de 'uploads' e monta a URL completa corretamente
        const cleanPath = user.profile_image.replace(/^uploads[\\/]/, '');
        imageUrl = `http://localhost:3030/uploads/${cleanPath}`;
      }
      return { ...user, profile_image: imageUrl };
    });

    res.json({ success: true, contatos });
  } catch (err) {
    console.error('Erro ao buscar contatos:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar contatos' });
  }
});


module.exports = router;