# TELEODECISON

## Objetivo

O projeto TELEODECISON tem como objetivo, criar uma plataforma interativa onde, o RH das empresas poderão usá-la para o auxilio de contratações para determinadas funções dentro das empresas em geral.

## Tecnologias usadas:

+ Front-end: HTML, CSS, JavaScript

+ Back-end: Node.js com Express.js

+ Banco de Dados: MySQL

+ Outras Tecnologias: Fetch API, CORS


## Funcionalidades implementadas

### Cadastro de usuário:

+ Os usuários podem criar uma conta informando nome, e-mail e senha.

+ Os dados são armazenados no banco de dados MySQL.

### Login de usuário:

+ Os usuários podem acessar suas contas usando e-mail e senha.

+ Validação de credenciais com resposta adequada caso os dados sejam incorretos.

### Conexão com banco de dados:

+ Utilização do MySQL para armazenar os dados dos usuários.

+ Configuração de conexão via mysql2.

### Servidor back-end:

+ Implementação de rotas para cadastro e login utilizando Express.js.

+ Comunicação com o banco de dados para inserção e verificação de credenciais.

## Como executar o projeto

### Instale as dependências:
```
npm install express mysql2 cors
```
### Configure o banco de dados MySQL:

+ Crie um banco de dados chamado Teleo.

+ Crie a tabela users com as colunas id, username, email, password.

### Inicie o servidor:
```
node server.js
```
### Abra o projeto no navegador:

+ Acesse index.html para visualizar a interface.


