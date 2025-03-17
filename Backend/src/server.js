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
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro no servidor.' });
      }
  
      if (results.length > 0) {
        res.json({ success: true, message: 'Login bem-sucedido!' });
      } else {
        res.json({ success: false, message: 'Usuário ou senha incorretos!' });
      }
    });
});



app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));