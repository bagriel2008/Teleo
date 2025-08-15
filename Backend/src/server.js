const express = require("express");
const cors = require("cors");
const connection = require("./db_config");
const app = express();

app.use(cors());
app.use(express.json());

const port = 3030;

app.post('/cadastro', (req, res) =>{
    const {username, password, email} = req.body
    const query = "INSERT INTO users (username, password, email) VALUES (?,?,?)"
    
    connection.query(query, [username, password, email], (err, results) =>{
        if (err) {
            return res.status(500).json({success:false, message:'Erro no servidor'})
        }
        else {
            res.json({success:true, message:'Cadastro bem sucedido', 
            data:{ id: results.insertId, username, password, email }})
        }
    })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro no servidor.' });

    if (results.length > 0) {
      const user = results[0];
      // Retornando tipo do usuário
      res.json({ 
        success: true, 
        message: 'Login bem-sucedido!',
        tipo: user.tipo
      });
    } else {
      res.json({ success: false, message: 'Usuário ou senha incorretos!' });
    }
  });
});

const util = require('util');
const q = util.promisify(connection.query).bind(connection);

// Criar cargo com perguntas e respostas
app.post('/cargos', async (req, res) => {
  try {
    const { nome, perguntas } = req.body; 
    // perguntas: [{ texto: "Pergunta 1", respostas: ["A","B","C","D"] }]

    if (!nome || !Array.isArray(perguntas) || perguntas.length === 0) {
      return res.status(400).json({ success: false, message: 'Dados inválidos.' });
    }

    const resultCargo = await q('INSERT INTO cargos (nome) VALUES (?)', [nome]);
    const cargoId = resultCargo.insertId;

    for (const p of perguntas) {
      const rp = await q('INSERT INTO perguntas (cargo_id, texto) VALUES (?,?)', [cargoId, p.texto]);
      const perguntaId = rp.insertId;
      const valores = p.respostas.map(txt => [perguntaId, txt]);
      if (valores.length) {
        await q('INSERT INTO respostas (pergunta_id, texto) VALUES ?', [valores]);
      }
    }

    res.json({ success: true, message: 'Cargo criado com sucesso!', id: cargoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erro ao criar cargo.' });
  }
});

// Listar cargos para a página inicial
app.get('/cargos', async (req, res) => {
  try {
    const rows = await q('SELECT id, nome FROM cargos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erro ao listar cargos.' });
  }
});

// Buscar cargo + perguntas + respostas por ID
app.get('/cargos/:id', async (req, res) => {
  try {
    const cargoId = req.params.id;
    const [cargo] = await q('SELECT id, nome FROM cargos WHERE id = ?', [cargoId]);
    if (!cargo) return res.status(404).json({ success: false, message: 'Cargo não encontrado.' });

    const perguntas = await q('SELECT id, texto FROM perguntas WHERE cargo_id = ? ORDER BY id ASC', [cargoId]);

    const completo = [];
    for (const p of perguntas) {
      const respostas = await q('SELECT id, texto FROM respostas WHERE pergunta_id = ? ORDER BY id ASC', [p.id]);
      completo.push({ id: p.id, texto: p.texto, respostas });
    }

    res.json({ success: true, cargo, perguntas: completo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erro ao buscar cargo.' });
  }
});


app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));