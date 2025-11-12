# TeleoDecision

## Tema do Projeto

O TeleoDecision é uma plataforma interativa desenvolvida para auxiliar empresas e usuários na gestão de cargos, avaliações e comunicação profissional.
O sistema permite que empresas criem cargos e perguntas avaliativas, enquanto usuários interagem através de um modo de jogo, respondendo questões e acompanhando seu desempenho.
Além disso, o projeto inclui recursos de perfil, chat em tempo real e estatísticas de desempenho individual.

O objetivo principal é unir gamificação e recrutamento, permitindo que os candidatos aprendam mais sobre os cargos e demonstrem suas habilidades de forma dinâmica e divertida.

## Tecnologias Utilizadas
### Frontend

+ HTML5, CSS3 e JavaScript (ES6) 

+ Fetch API 

+ Socket.io (cliente) 

### Backend

+ Node.js com Express 

+ MySQL 

+ JWT (JSON Web Token)

+ Bcrypt 

+ Socket.io (servidor) 

+ Multer 

+ CORS

### Banco de Dados (MySQL)

Banco: Teleo

### Tabelas principais:
```
users (id, username, email, password, tipo, profile_image, bio)

cargos (id, creat_id, nome)

perguntas (id, cargo_id, texto)

respostas (id, pergunta_id, texto, correta)

mensagens (id, sender, recipient, message, created_at)
```

## Estrutura Geral do Sistema
### Principais Páginas

#### Login / Cadastro

+ Permite o acesso ao sistema.

+ Autenticação via JWT.

+ Após o login, o tipo de usuário define o acesso (empresa ou usuário comum).

#### Adicionar Cargos (somente empresas)

+ Permite criar cargos, perguntas e respostas com definição da alternativa correta.

+ Todos os dados são salvos no banco de dados com o ID do criador.

#### Modo de Jogo (usuário comum)

+ Exibe as perguntas dos cargos disponíveis.

+ Verifica automaticamente se a resposta está correta e avança.

+ Armazena o progresso e acertos no banco de dados.

#### Perfil do Usuário

+ Exibe imagem, biografia e informações do usuário.

+ Permite editar a biografia e atualizar ou remover a imagem.

+ Mantém uma imagem padrão caso nenhuma seja enviada.

#### Chat em Tempo Real

+ Mostra a lista de contatos (outros usuários da plataforma).

+ Permite trocar mensagens privadas em tempo real.

+ As mensagens são salvas no banco e recarregadas ao abrir o chat.

#### Estatísticas

+ Mostra o desempenho do usuário com base nas respostas dadas.

+ Exibe percentual de acertos e progresso geral.

## Manual de Uso
### Acesso ao Sistema

Inicie o servidor na pasta Backend:
```
npm start
```

O sistema rodará por padrão em:
```
http://localhost:3030
```

### Usuário Administrador (Empresa)

Use as credenciais abaixo para acessar o painel administrativo:
```
Email: empresa@teste.com
Senha: senha123
Tipo: empresa
```

### Funções disponíveis:

+ Criar novos cargos com perguntas e respostas.

+ Acompanhar desempenho de usuários.

+ Conversar com outros usuários via chat.

### Usuário Comum

+ Após o cadastro, o usuário comum pode:

+ Entrar no modo de jogo.

+ Responder perguntas dos cargos disponíveis.

+ Visualizar seu progresso nas estatísticas.

+ Trocar mensagens com empresas e outros usuários.

## Observações Técnicas

+ Uploads de imagem são armazenados automaticamente na pasta /uploads do projeto.

+ Caso não exista imagem de perfil, o sistema exibe uma imagem padrão (default.png).

+ As mensagens são armazenadas permanentemente no banco de dados, permitindo histórico.

+ O servidor está configurado para aceitar conexões CORS de qualquer origem.

+ Tokens JWT expiram automaticamente após determinado tempo de sessão.
